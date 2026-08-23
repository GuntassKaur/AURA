import uuid
import logging
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_, text
from models.document import Document
from models.memory_event import MemoryEvent
from models.photo import Photo
from services.embedding_service import EmbeddingService
from services.rag_service import RagService
from schemas.search import SearchResponse, SearchResultItem

class SearchService:
    @staticmethod
    def hybrid_search(
        user_id: uuid.UUID,
        query: str,
        db: Session,
        limit: int = 10
    ) -> SearchResponse:
        """
        Executes a hybrid search across Documents, Photos, and Memory Events:
        1. Queries relational text matching (ilike titles, locations, summaries).
        2. Executes vector similarity searches using pgvector on document chunks.
        3. Standardizes result scores and merges them into a ranked unified list.
        """
        results: List[SearchResultItem] = []

        if not query or not query.strip():
            return SearchResponse(query="", results=[], total_results=0)

        # 1. Relational Database Search
        # Search Documents
        docs = db.query(Document).filter(
            Document.user_id == user_id,
            Document.deleted_at == None,
            or_(
                Document.title.ilike(f"%{query}%"),
                Document.summary.ilike(f"%{query}%"),
                Document.extracted_text.ilike(f"%{query}%")
            )
        ).limit(limit).all()
        
        for d in docs:
            results.append(
                SearchResultItem(
                    id=d.id,
                    type="document",
                    title=d.title,
                    snippet=d.summary or (d.extracted_text[:150] if d.extracted_text else None),
                    score=0.8,  # Default score for direct text matches
                    file_url=d.file_url,
                    metadata=d.metadata_json
                )
            )

        # Search Memory Events
        events = db.query(MemoryEvent).filter(
            MemoryEvent.user_id == user_id,
            MemoryEvent.deleted_at == None,
            or_(
                MemoryEvent.title.ilike(f"%{query}%"),
                MemoryEvent.description.ilike(f"%{query}%"),
                MemoryEvent.city.ilike(f"%{query}%"),
                MemoryEvent.country.ilike(f"%{query}%")
            )
        ).limit(limit).all()

        for e in events:
            results.append(
                SearchResultItem(
                    id=e.id,
                    type="memory_event",
                    title=e.title,
                    snippet=e.description,
                    score=0.75,
                    metadata={"city": e.city, "country": e.country}
                )
            )

        # Search Photos
        photos = db.query(Photo).filter(
            Photo.user_id == user_id,
            Photo.deleted_at == None,
            Photo.location.ilike(f"%{query}%")
        ).limit(limit).all()

        for p in photos:
            results.append(
                SearchResultItem(
                    id=p.id,
                    type="photo",
                    title=f"Photo in {p.location or 'Vault'}",
                    score=0.7,
                    file_url=p.file_url,
                    metadata={"location": p.location}
                )
            )

        # 2. Vector Similarity Search
        try:
            query_embedding = EmbeddingService.generate_embeddings([query])[0]
            vector_results = RagService.query_vault(user_id, query, db, top_k=5)
            
            # Map vector sources as high-ranked items
            for src in vector_results.get("sources", []):
                # Check for duplicate document matches to boost score
                exists = next((item for item in results if item.id == src["document_id"]), None)
                if exists:
                    exists.score = max(exists.score, 0.95) # Boost score
                    exists.snippet = src["content"]
                else:
                    results.append(
                        SearchResultItem(
                            id=src["document_id"],
                            type="document",
                            title=src["document_title"],
                            snippet=src["content"],
                            score=0.90,  # Highly relevant vector match
                            metadata={"chunk_index": src["chunk_index"]}
                        )
                    )
        except Exception as e:
            # Non-fatal error, fallback on relational search results
            logger.warning(f"Vector search part of hybrid query failed: {e}")

        # Sort combined results by score descending
        results.sort(key=lambda x: x.score, reverse=True)
        results = results[:limit]

        return SearchResponse(
            query=query,
            results=results,
            total_results=len(results)
        )
