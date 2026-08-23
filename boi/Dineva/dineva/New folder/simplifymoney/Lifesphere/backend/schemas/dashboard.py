import uuid
from typing import List, Optional
from pydantic import BaseModel
from schemas.reminder import ReminderResponse
from schemas.timeline import TimelineItem
from schemas.analytics import CategorySpendItem

class RecentDocumentItem(BaseModel):
    id: uuid.UUID
    title: str
    category: str
    file_url: str
    upload_date: str

class RecentPhotoItem(BaseModel):
    id: uuid.UUID
    file_url: str
    captured_date: Optional[str] = None

class DashboardOverviewResponse(BaseModel):
    recent_documents: List[RecentDocumentItem]
    recent_photos: List[RecentPhotoItem]
    upcoming_reminders: List[ReminderResponse]
    timeline_preview: List[TimelineItem]
    analytics_summary: List[CategorySpendItem]
    search_suggestions: List[str]
