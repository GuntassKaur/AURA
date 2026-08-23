import time
import uuid
import logging
from typing import List, Tuple, Dict, Any
from sqlalchemy.orm import Session
from models.document import Document
from models.document_chunk import DocumentChunk
from google import genai
from google.genai import types
from services.gemini_service import get_gemini_client

logger = logging.getLogger(__name__)

# Target embedding dimension matching Postgres schema Vector(384)
EMBEDDING_DIMENSION = 384


class EmbeddingService:
    @staticmethod
    def split_text(text: str, chunk_size: int = 500, overlap: int = 100) -> List[str]:
        """
        Splits text into semantic chunks of approx `chunk_size` characters,
        with `overlap` characters. Never splits words in the middle, and preserves
        paragraph boundaries (\n\n) where possible.
        """
        if not text:
            return []

        # Split text into paragraphs first to preserve boundaries
        paragraphs = text.split("\n\n")
        chunks = []
        current_chunk = []
        current_length = 0

        for para in paragraphs:
            para = para.strip()
            if not para:
                continue

            para_len = len(para)

            # Case 1: Paragraph fits in current chunk
            if current_length + para_len + 2 <= chunk_size:
                current_chunk.append(para)
                current_length += para_len + 2
                
            # Case 2: Paragraph is too big for current chunk, but fits in a new chunk
            elif para_len <= chunk_size:
                # Save existing chunk
                if current_chunk:
                    chunks.append("\n\n".join(current_chunk))
                # Start new chunk with overlap from the end of the previous paragraph
                overlap_text = ""
                if current_chunk:
                    last_para = current_chunk[-1]
                    overlap_text = last_para[-overlap:] if len(last_para) > overlap else last_para
                    
                current_chunk = []
                current_length = 0
                if overlap_text:
                    current_chunk.append(overlap_text)
                    current_length += len(overlap_text) + 2
                    
                current_chunk.append(para)
                current_length += para_len + 2
                
            # Case 3: Paragraph is massive (exceeds chunk_size itself), must split by sentences/words
            else:
                # Save existing chunk first
                if current_chunk:
                    chunks.append("\n\n".join(current_chunk))
                    current_chunk = []
                    current_length = 0

                # Split massive paragraph by space boundaries
                words = para.split(" ")
                word_chunk = []
                word_length = 0
                
                for word in words:
                    if word_length + len(word) + 1 <= chunk_size:
                        word_chunk.append(word)
                        word_length += len(word) + 1
                    else:
                        chunks.append(" ".join(word_chunk))
                        # Retain overlap words
                        overlap_words = []
                        overlap_len = 0
                        for w in reversed(word_chunk):
                            if overlap_len + len(w) + 1 <= overlap:
                                overlap_words.insert(0, w)
                                overlap_len += len(w) + 1
                            else:
                                break
                        word_chunk = overlap_words + [word]
                        word_length = overlap_len + len(word) + 1
                        
                if word_chunk:
                    current_chunk = [" ".join(word_chunk)]
                    current_length = word_length

        if current_chunk:
            chunks.append("\n\n".join(current_chunk))

        # Filter empty chunks and strip padding whitespace
        return [c.strip() for c in chunks if c.strip()]

    @staticmethod
    def generate_embeddings(texts: List[str]) -> List[List[float]]:
        """
        Calls Gemini Embedding API (text-embedding-004) with custom
        output dimensionality (384) to generate vector coordinates.
        Includes a retry mechanism (retries once on failure).
        """
        if not texts:
            return []

        client = get_gemini_client()
        attempts = 2
        last_error = None

        config = types.EmbedContentConfig(
            output_dimensionality=EMBEDDING_DIMENSION
        )

        for attempt in range(attempts):
            try:
                # Generate embeddings in batch
                response = client.models.embed_content(
                    model="text-embedding-004",
                    contents=texts,
                    config=config
                )
                # Map response structure
                embeddings = [item.values for item in response.embeddings]
                return embeddings
                
            except Exception as e:
                last_error = e
                logger.warning(
                    f"Gemini Embedding API attempt {attempt + 1}/{attempts} failed: {str(e)}. Retrying..."
                )
                if attempt < attempts - 1:
                    time.sleep(1)

        raise RuntimeError(
            f"Failed to generate embeddings after {attempts} attempts. Last error: {str(last_error)}"
        )

    @staticmethod
    def save_chunks(document_id: uuid.UUID, chunks: List[str], embeddings: List[List[float]], db: Session):
        """
        Deletes any pre-existing chunks for the document to prevent duplicates,
        and performs a bulk insert of the new segments.
        """
        try:
            # 1. Delete old chunks
            db.query(DocumentChunk).filter(DocumentChunk.document_id == document_id).delete()
            db.flush()  # Apply deletion to Session context
            
            # 2. Bulk insert chunks
            chunk_objects = []
            for index, (content, embedding) in enumerate(zip(chunks, embeddings)):
                chunk_obj = DocumentChunk(
                    document_id=document_id,
                    chunk_index=index,
                    content=content,
                    embedding=embedding
                )
                chunk_objects.append(chunk_obj)
                
            db.bulk_save_objects(chunk_objects)
            db.commit()
            
        except Exception as e:
            db.rollback()
            raise RuntimeError(f"Database batch insertion of chunks failed: {str(e)}")

    @classmethod
    def process_document(cls, document_id: uuid.UUID, db: Session) -> Tuple[int, int, float]:
        """
        Coordinates document loading, chunk splitting, embedding calls, and database updates.
        
        Returns:
            Tuple[int, int, float]: (chunks_created, embedding_dimension, processing_time)
        """
        start_time = time.time()

        # 1. Load document
        document = db.query(Document).filter(
            Document.id == document_id,
            Document.deleted_at == None
        ).first()

        if not document:
            raise ValueError(f"Document with ID {document_id} not found.")

        if not document.extracted_text:
            raise ValueError(
                f"Document with ID {document_id} has no OCR extracted text. Run OCR processing first."
            )

        # 2. Split document into chunks
        chunks = cls.split_text(document.extracted_text)
        if not chunks:
            return 0, EMBEDDING_DIMENSION, time.time() - start_time

        # 3. Generate embeddings
        embeddings = cls.generate_embeddings(chunks)

        # 4. Bulk save to database
        cls.save_chunks(document_id, chunks, embeddings, db)

        processing_time = time.time() - start_time
        return len(chunks), EMBEDDING_DIMENSION, processing_time
