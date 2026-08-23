import uuid
import datetime
from typing import Optional, List
from pydantic import BaseModel
from models.enums import ReminderType, ReminderStatus

class ReminderCreate(BaseModel):
    user_id: uuid.UUID
    document_id: Optional[uuid.UUID] = None
    title: str
    reminder_type: ReminderType
    due_date: datetime.datetime
    status: Optional[ReminderStatus] = ReminderStatus.PENDING

class ReminderUpdate(BaseModel):
    title: Optional[str] = None
    due_date: Optional[datetime.datetime] = None
    status: Optional[ReminderStatus] = None

class ReminderResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    document_id: Optional[uuid.UUID] = None
    title: str
    reminder_type: ReminderType
    due_date: datetime.datetime
    status: ReminderStatus
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True
