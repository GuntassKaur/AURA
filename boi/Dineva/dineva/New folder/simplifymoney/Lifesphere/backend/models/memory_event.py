import uuid
from datetime import datetime, timezone
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import ForeignKey, String, Text, DateTime, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
from utils.database import Base
from decimal import Decimal

if TYPE_CHECKING:
    from models.user import User
    from models.photo import Photo
    from models.document import Document


class MemoryEvent(Base):
    __tablename__ = "memory_events"

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
    
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    event_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        index=True,
        nullable=True
    )
    
    # Manual location tags
    city: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    country: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    
    # Geolocation support (for map view timeline visualization)
    latitude: Mapped[Optional[Decimal]] = mapped_column(Numeric(9, 6), nullable=True)
    longitude: Mapped[Optional[Decimal]] = mapped_column(Numeric(9, 6), nullable=True)
    
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
    user: Mapped["User"] = relationship("User", back_populates="memory_events")
    
    # If event gets deleted, set photos connection references to NULL
    photos: Mapped[List["Photo"]] = relationship(
        "Photo",
        back_populates="event",
        cascade="save-update, merge",
        passive_deletes=True
    )
    
    # If event gets deleted, set documents connection references to NULL
    documents: Mapped[List["Document"]] = relationship(
        "Document",
        back_populates="event",
        cascade="save-update, merge",
        passive_deletes=True
    )

    def __repr__(self) -> str:
        return f"<MemoryEvent id={self.id} title={self.title} city={self.city}>"
