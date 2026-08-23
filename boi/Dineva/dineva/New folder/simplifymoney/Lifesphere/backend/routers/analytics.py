import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from utils.database import get_db
from schemas.analytics import DashboardAnalyticsResponse
from services.lifestyle_service import LifestyleService

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics / Lifestyle"]
)

@router.get("/dashboard", response_model=DashboardAnalyticsResponse, status_code=200)
def get_dashboard_analytics(
    user_id: uuid.UUID = Query(..., description="ID of the user"),
    db: Session = Depends(get_db)
):
    """
    Returns aggregated financial analysis, categories distribution, utility trends,
    and warranty metrics.
    """
    try:
        return LifestyleService.get_dashboard_analytics(user_id, db)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch analytics: {str(e)}"
        )
