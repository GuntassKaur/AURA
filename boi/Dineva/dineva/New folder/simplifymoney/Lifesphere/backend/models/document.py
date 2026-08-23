import uuid
from datetime import datetime, timezone
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import ForeignKey, String, Text, DateTime, JSON, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from utils.database import Base
from models.enums import DocumentType, ProcessingStatus

if TYPE_CHECKING:
    from models.user import User
    from models.memory_event import MemoryEvent
    from models.document_chunk import DocumentChunk
    from models.reminder import Reminder


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False
    )
    
    # Nullable link to memory event to scope document transactions within trips/activities
    event_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("memory_events.id", ondelete="SET NULL"),
        index=True,
        nullable=True
    )
    
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    
    # Enum-based classification mapping to DB native enum
    document_type: Mapped[DocumentType] = mapped_column(
        Enum(DocumentType, name="document_type_enum", inherit_schema=True),
        index=True,
        nullable=False
    )
    
    # File storage references
    file_url: Mapped[str] = mapped_column(String(2048), nullable=False)
    storage_path: Mapped[str] = mapped_column(String(1024), nullable=False)
    mime_type: Mapped[str] = mapped_column(String(100), nullable=False)
    file_size: Mapped[int] = mapped_column(nullable=False)
    checksum: Mapped[str] = mapped_column(String(64), nullable=False) # SHA-256 (64 characters hex representation)
    
    # Processing pipeline outputs
    extracted_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    metadata_json: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    
    # Processing states
    processing_status: Mapped[ProcessingStatus] = mapped_column(
        Enum(ProcessingStatus, name="processing_status_enum", inherit_schema=True),
        default=ProcessingStatus.PENDING,
        index=True,
        nullable=False
    )
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Date indices (timezone-aware)
    upload_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        index=True,
        nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    deleted_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="documents")
    event: Mapped[Optional["MemoryEvent"]] = relationship("MemoryEvent", back_populates="documents")
    
    # Cascades all chunks if document is removed
    chunks: Mapped[List["DocumentChunk"]] = relationship(
        "DocumentChunk",
        back_populates="document",
        cascade="all, delete-orphan"
    )
    
    # Set reminders connection to NULL if document gets deleted
    reminders: Mapped[List["Reminder"]] = relationship(
        "Reminder",
        back_populates="document",
        cascade="save-update, merge",
        passive_deletes=True
    )

    def __repr__(self) -> str:
        return f"<Document id={self.id} title={self.title} type={self.document_type} status={self.processing_status}>"
