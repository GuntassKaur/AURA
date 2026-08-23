import uuid
import logging
from typing import List, Tuple, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import text
from models.document import Document
from models.document_chunk import DocumentChunk
from services.embedding_service import EmbeddingService
from services.gemini_service import get_gemini_client
from google.genai import types

logger = logging.getLogger(__name__)

class RagService:
    @staticmethod
    def query_vault(
        user_id: uuid.UUID,
        query: str,
        db: Session,
        top_k: int = 5
    ) -> Dict[str, Any]:
        """
        Runs the RAG pipeline:
        1. Embeds the user query.
        2. Performs cosine distance similarity search on pgvector document chunks.
        3. Structures the context block and queries associated events/documents.
        4. Invokes Gemini to generate a factual, context-grounded response.
        """
        # 1. Generate query embedding
        try:
            query_embedding = EmbeddingService.generate_embeddings([query])[0]
        except Exception as e:
            logger.error(f"Failed to generate query embedding: {e}")
            raise RuntimeError(f"Failed to process query: {e}")

        # 2. Search pgvector document chunks (filtering by owner user_id)
        # Cosine distance operator is <=>
        # We order by distance and filter out soft-deleted documents.
        try:
            results = db.query(DocumentChunk, Document).\
                join(Document, Document.id == DocumentChunk.document_id).\
                filter(
                    Document.user_id == user_id,
                    Document.deleted_at == None
                ).\
                order_by(DocumentChunk.embedding.cosine_distance(query_embedding)).\
                limit(top_k).\
                all()
        except Exception as e:
            logger.error(f"pgvector query failed: {e}")
            raise RuntimeError(f"Database vector lookup failed: {e}")

        if not results:
            return {
                "answer": "I couldn't find any relevant documents in your vault to answer this question.",
                "sources": [],
                "memory_events": [],
                "documents": []
            }

        # 3. Aggregate contexts and source lists
        context_blocks = []
        sources = []
        document_ids = set()
        event_ids = set()

        for chunk, doc in results:
            context_blocks.append(
                f"Document: {doc.title} (Type: {doc.document_type.value})\n"
                f"Content: {chunk.content}"
            )
            sources.append({
                "document_id": doc.id,
                "document_title": doc.title,
                "content": chunk.content,
                "chunk_index": chunk.chunk_index
            })
            document_ids.add(doc.id)
            if doc.event_id:
                event_ids.add(doc.event_id)

        merged_context = "\n\n---\n\n".join(context_blocks)

        # 4. Generate grounded content with Gemini
        client = get_gemini_client()
        
        system_instruction = (
            "You are an expert Personal OS Assistant. Answer the user's question "
            "using ONLY the provided document context blocks. Follow these rules strictly:\n"
            "1. Ground your answer completely in the facts provided. Do NOT hallucinate.\n"
            "2. If the context does not contain the answer, state clearly that you cannot find the information.\n"
            "3. Reference document titles in your explanation when stating facts.\n"
            "4. Keep your answer clear, concise, and helpful."
        )

        prompt = (
            f"Context blocks:\n{merged_context}\n\n"
            f"User Question: {query}\n"
            f"Grounded Answer:"
        )

        try:
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    temperature=0.0  # Max factual precision
                )
            )
            answer = response.text
        except Exception as e:
            logger.error(f"Gemini RAG content generation failed: {e}")
            raise RuntimeError(f"Failed to generate answer: {e}")

        return {
            "answer": answer,
            "sources": sources,
            "memory_events": list(event_ids),
            "documents": list(document_ids)
        }
