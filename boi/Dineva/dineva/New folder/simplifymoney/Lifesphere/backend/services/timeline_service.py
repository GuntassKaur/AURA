import uuid
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
import datetime
from models.document import Document
from models.photo import Photo
from models.memory_event import MemoryEvent
from schemas.timeline import TimelineItem, TimelineResponse

class TimelineService:
    @staticmethod
    def get_timeline(
        user_id: uuid.UUID,
        db: Session,
        year: Optional[int] = None,
        month: Optional[int] = None,
        category: Optional[str] = None,
        search: Optional[str] = None
    ) -> TimelineResponse:
        """
        Gathers memory events, documents, and photos chronologically,
        applying filters (year, month, category type) and search string terms.
        """
        timeline_items: List[TimelineItem] = []

        # 1. Query Memory Events
        event_query = db.query(MemoryEvent).filter(
            MemoryEvent.user_id == user_id,
            MemoryEvent.deleted_at == None
        )
        if year:
            event_query = event_query.filter(func.extract('year', MemoryEvent.event_date) == year)
        if month:
            event_query = event_query.filter(func.extract('month', MemoryEvent.event_date) == month)
        if search:
            event_query = event_query.filter(
                (MemoryEvent.title.ilike(f"%{search}%")) | 
                (MemoryEvent.description.ilike(f"%{search}%"))
            )

        events = event_query.all()
        for e in events:
            # Map memory event
            e_date = e.event_date or e.created_at
            timeline_items.append(
                TimelineItem(
                    id=e.id,
                    type="memory_event",
                    title=e.title,
                    description=e.description,
                    date=e_date,
                    location=f"{e.city or ''}, {e.country or ''}".strip(", "),
                    category="Memory"
                )
            )

        # 2. Query Documents
        doc_query = db.query(Document).filter(
            Document.user_id == user_id,
            Document.deleted_at == None
        )
        if year:
            doc_query = doc_query.filter(func.extract('year', Document.upload_date) == year)
        if month:
            doc_query = doc_query.filter(func.extract('month', Document.upload_date) == month)
        if category:
            doc_query = doc_query.filter(Document.document_type == category)
        if search:
            doc_query = doc_query.filter(
                (Document.title.ilike(f"%{search}%")) |
                (Document.extracted_text.ilike(f"%{search}%"))
            )

        documents = doc_query.all()
        for d in documents:
            timeline_items.append(
                TimelineItem(
                    id=d.id,
                    type="document",
                    title=d.title,
                    description=d.summary,
                    date=d.upload_date,
                    category=d.document_type.value,
                    file_url=d.file_url
                )
            )

        # 3. Query Photos
        photo_query = db.query(Photo).filter(
            Photo.user_id == user_id,
            Photo.deleted_at == None
        )
        if year:
            photo_query = photo_query.filter(func.extract('year', Photo.captured_date) == year)
        if month:
            photo_query = photo_query.filter(func.extract('month', Photo.captured_date) == month)
        if search:
            photo_query = photo_query.filter(Photo.location.ilike(f"%{search}%"))

        photos = photo_query.all()
        for p in photos:
            p_date = p.captured_date or p.created_at
            timeline_items.append(
                TimelineItem(
                    id=p.id,
                    type="photo",
                    title=f"Photo in {p.location or 'Vault'}",
                    date=p_date,
                    location=p.location,
                    file_url=p.file_url,
                    category="Photo"
                )
            )

        # Sort combined timeline items chronologically (latest first)
        timeline_items.sort(key=lambda x: x.date, reverse=True)

        return TimelineResponse(
            items=timeline_items,
            total_count=len(timeline_items)
        )
