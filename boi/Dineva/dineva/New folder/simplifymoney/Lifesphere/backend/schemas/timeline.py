import uuid
import datetime
from typing import List, Optional
from pydantic import BaseModel

class TimelineItem(BaseModel):
    id: uuid.UUID
    type: str # "memory_event", "document", "photo"
    title: str
    description: Optional[str] = None
    date: datetime.datetime
    location: Optional[str] = None
    file_url: Optional[str] = None
    category: Optional[str] = None

class TimelineResponse(BaseModel):
    items: List[TimelineItem]
    total_count: int
