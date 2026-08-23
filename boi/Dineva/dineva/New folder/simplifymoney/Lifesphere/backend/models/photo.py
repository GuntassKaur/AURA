import uuid
from datetime import datetime, timezone
from typing import Optional, TYPE_CHECKING
from sqlalchemy import ForeignKey, String, DateTime, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
from utils.database import Base
from decimal import Decimal

if TYPE_CHECKING:
    from models.user import User
    from models.memory_event import MemoryEvent


class Photo(Base):
    __tablename__ = "photos"

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
    
    event_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("memory_events.id", ondelete="SET NULL"),
        index=True,
        nullable=True
    )
    
    # File storage references
    file_url: Mapped[str] = mapped_column(String(2048), nullable=False)
    storage_path: Mapped[str] = mapped_column(String(1024), nullable=False)
    thumbnail_url: Mapped[Optional[str]] = mapped_column(String(2048), nullable=True)
    mime_type: Mapped[str] = mapped_column(String(100), nullable=False)
    file_size: Mapped[int] = mapped_column(nullable=False)
    checksum: Mapped[str] = mapped_column(String(64), nullable=False) # SHA-256
    
    # Metadata
    captured_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        index=True,
        nullable=True
    )
    location: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    # Geolocation coordinates (for map view timeline visualization)
    latitude: Mapped[Optional[Decimal]] = mapped_column(Numeric(9, 6), nullable=True)
    longitude: Mapped[Optional[Decimal]] = mapped_column(Numeric(9, 6), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    deleted_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="photos")
    event: Mapped[Optional["MemoryEvent"]] = relationship("MemoryEvent", back_populates="photos")

    def __repr__(self) -> str:
        return f"<Photo id={self.id} file_url={self.file_url}>"
