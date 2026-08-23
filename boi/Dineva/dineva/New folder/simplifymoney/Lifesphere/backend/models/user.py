import uuid
from datetime import datetime, timezone
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import String, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from utils.database import Base

if TYPE_CHECKING:
    from models.document import Document
    from models.photo import Photo
    from models.memory_event import MemoryEvent
    from models.utility_record import UtilityRecord
    from models.reminder import Reminder


class User(Base):
    __tablename__ = "users"

    # UUID Primary Key
    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    
    # Core User Details
    full_name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    
    # Audit timestamps (timezone-aware)
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
    
    # Soft Delete Support
    deleted_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    # Bidirectional ORM Relationships (Scoping all user data)
    documents: Mapped[List["Document"]] = relationship(
        "Document",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    photos: Mapped[List["Photo"]] = relationship(
        "Photo",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    memory_events: Mapped[List["MemoryEvent"]] = relationship(
        "MemoryEvent",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    utility_records: Mapped[List["UtilityRecord"]] = relationship(
        "UtilityRecord",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    reminders: Mapped[List["Reminder"]] = relationship(
        "Reminder",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email} name={self.full_name}>"
