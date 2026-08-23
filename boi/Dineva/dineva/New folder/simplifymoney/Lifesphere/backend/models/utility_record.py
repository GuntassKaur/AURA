import uuid
from datetime import date, datetime, timezone
from typing import TYPE_CHECKING
from sqlalchemy import ForeignKey, String, Numeric, DateTime, Date, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from decimal import Decimal
from utils.database import Base
from models.enums import UtilityType

if TYPE_CHECKING:
    from models.user import User


class UtilityRecord(Base):
    __tablename__ = "utility_records"

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
    
    # Enum-based classification mapping to DB native enum
    utility_type: Mapped[UtilityType] = mapped_column(
        Enum(UtilityType, name="utility_type_enum", inherit_schema=True),
        index=True,
        nullable=False
    )
    
    # Financial metrics (cost details)
    amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    
    # Consumption units (e.g. kWh, Litres)
    units: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    
    # Date of reading/billing
    bill_date: Mapped[date] = mapped_column(
        Date,
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
    user: Mapped["User"] = relationship("User", back_populates="utility_records")

    def __repr__(self) -> str:
        return f"<UtilityRecord id={self.id} type={self.utility_type} amount={self.amount} date={self.bill_date}>"
