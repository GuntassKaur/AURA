import uuid
from datetime import datetime, timezone
from typing import Optional, TYPE_CHECKING
from sqlalchemy import ForeignKey, String, DateTime, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from utils.database import Base
from models.enums import ReminderType, ReminderStatus

if TYPE_CHECKING:
    from models.user import User
    from models.document import Document


class Reminder(Base):
    __tablename__ = "reminders"

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
    
    # Nullable link to source document (e.g. warranty card or bill invoice)
    document_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("documents.id", ondelete="SET NULL"),
        index=True,
        nullable=True
    )
    
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    
    # Enum-based classification mapping to DB native enum
    reminder_type: Mapped[ReminderType] = mapped_column(
        Enum(ReminderType, name="reminder_type_enum", inherit_schema=True),
        index=True,
        nullable=False
    )
    
    # Expiry/trigger deadline
    due_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        index=True,
        nullable=False
    )
    
    # Enum-based tracking state mapping to DB native enum
    status: Mapped[ReminderStatus] = mapped_column(
        Enum(ReminderStatus, name="reminder_status_enum", inherit_schema=True),
        default=ReminderStatus.PENDING,
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

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="reminders")
    document: Mapped[Optional["Document"]] = relationship("Document", back_populates="reminders")

    def __repr__(self) -> str:
        return f"<Reminder id={self.id} title={self.title} status={self.status} due={self.due_date}>"
