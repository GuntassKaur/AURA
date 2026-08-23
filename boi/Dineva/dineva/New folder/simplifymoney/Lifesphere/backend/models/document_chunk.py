import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING
from sqlalchemy import ForeignKey, Integer, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from pgvector.sqlalchemy import Vector
from utils.database import Base

if TYPE_CHECKING:
    from models.document import Document


class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    
    document_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("documents.id", ondelete="CASCADE"),
        index=True,
        nullable=False
    )
    
    # Segment index representing order within the parent document (for reconstruction)
    chunk_index: Mapped[int] = mapped_column(Integer, nullable=False)
    
    # The actual text block content (e.g., a sentence or paragraph)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    
    # pgvector embedding: 384-dimensional vector for all-MiniLM-L6-v2
    # This will be indexed using HNSW for cosine distance searches.
    embedding: Mapped[list] = mapped_column(
        Vector(384),
        nullable=False
    )
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relationships
    document: Mapped["Document"] = relationship("Document", back_populates="chunks")

    def __repr__(self) -> str:
        return f"<DocumentChunk id={self.id} document_id={self.document_id} index={self.chunk_index}>"
