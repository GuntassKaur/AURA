import uuid
import datetime
from typing import Optional
from pydantic import BaseModel
from decimal import Decimal

class PhotoUploadResponse(BaseModel):
    photo_id: uuid.UUID
    file_url: str
    storage_path: str
    captured_date: Optional[datetime.datetime] = None
    location: Optional[str] = None
    event_id: Optional[uuid.UUID] = None

class PhotoAnalysisResponse(BaseModel):
    photo_id: uuid.UUID
    caption: str
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None
    captured_date: Optional[datetime.datetime] = None
    event_id: Optional[uuid.UUID] = None
    event_title: Optional[str] = None
