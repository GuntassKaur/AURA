import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from utils.database import get_db
from schemas.dashboard import DashboardOverviewResponse, RecentDocumentItem, RecentPhotoItem
from models.document import Document
from models.photo import Photo
from models.reminder import Reminder
from models.enums import ReminderStatus
from services.lifestyle_service import LifestyleService
from services.timeline_service import TimelineService
from schemas.reminder import ReminderResponse

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)

@router.get("", response_model=DashboardOverviewResponse, status_code=200)
def get_dashboard_overview(
    user_id: uuid.UUID = Query(..., description="ID of the user"),
    db: Session = Depends(get_db)
):
    """
    Unified dashboard metrics: gathers recent documents, recent photos, upcoming reminders,
    chronological timeline preview, analytics summary, and search suggestions.
    """
    try:
        # 1. Fetch recent documents (limit 5)
        recent_docs = db.query(Document).filter(
            Document.user_id == user_id,
            Document.deleted_at == None
        ).order_by(Document.upload_date.desc()).limit(5).all()

        docs_list = [
            RecentDocumentItem(
                id=doc.id,
                title=doc.title,
                category=doc.document_type.value,
                file_url=doc.file_url,
                upload_date=doc.upload_date.strftime("%Y-%m-%d %H:%M:%S")
            )
            for doc in recent_docs
        ]

        # 2. Fetch recent photos (limit 6)
        recent_photos = db.query(Photo).filter(
            Photo.user_id == user_id,
            Photo.deleted_at == None
        ).order_by(Photo.created_at.desc()).limit(6).all()

        photos_list = [
            RecentPhotoItem(
                id=p.id,
                file_url=p.file_url,
                captured_date=p.captured_date.strftime("%Y-%m-%d %H:%M:%S") if p.captured_date else None
            )
            for p in recent_photos
        ]

        # 3. Fetch upcoming reminders (limit 5 pending reminders)
        upcoming_rems = db.query(Reminder).filter(
            Reminder.user_id == user_id,
            Reminder.status == ReminderStatus.PENDING
        ).order_by(Reminder.due_date.asc()).limit(5).all()

        rems_list = [
            ReminderResponse(
                id=rem.id,
                user_id=rem.user_id,
                document_id=rem.document_id,
                title=rem.title,
                reminder_type=rem.reminder_type,
                due_date=rem.due_date,
                status=rem.status,
                created_at=rem.created_at,
                updated_at=rem.updated_at
            )
            for rem in upcoming_rems
        ]

        # 4. Timeline Preview (limit 5 items)
        timeline_payload = TimelineService.get_timeline(user_id=user_id, db=db)
        timeline_list = timeline_payload.items[:5]

        # 5. Analytics Summary categories spent list
        analytics = LifestyleService.get_dashboard_analytics(user_id=user_id, db=db)
        analytics_summary = analytics.category_spending

        # 6. Dummy contextual search suggestions based on the user's docs
        suggestions = ["Show my recent grocery receipts", "Where is my AC warranty card?", "Search flight tickets", "Show electric bill trends"]

        return DashboardOverviewResponse(
            recent_documents=docs_list,
            recent_photos=photos_list,
            upcoming_reminders=rems_list,
            timeline_preview=timeline_list,
            analytics_summary=analytics_summary,
            search_suggestions=suggestions
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Dashboard overview query aggregation failed: {str(e)}"
        )
