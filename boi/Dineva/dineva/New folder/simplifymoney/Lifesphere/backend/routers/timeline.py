import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from utils.database import get_db
from schemas.timeline import TimelineResponse
from services.timeline_service import TimelineService

router = APIRouter(
    prefix="/timeline",
    tags=["Timeline"]
)

@router.get("", response_model=TimelineResponse, status_code=200)
def get_timeline(
    user_id: uuid.UUID = Query(..., description="ID of the user"),
    year: Optional[int] = Query(None, description="Filter by year"),
    month: Optional[int] = Query(None, description="Filter by month (1-12)"),
    category: Optional[str] = Query(None, description="Filter by DocumentType enum"),
    search: Optional[str] = Query(None, description="Search term for titles/text"),
    db: Session = Depends(get_db)
):
    """
    Retrieves chronological timeline feed consisting of Memory Events, Documents, and Photos.
    """
    try:
        return TimelineService.get_timeline(
            user_id=user_id,
            db=db,
            year=year,
            month=month,
            category=category,
            search=search
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Timeline lookup failed: {str(e)}"
        )
