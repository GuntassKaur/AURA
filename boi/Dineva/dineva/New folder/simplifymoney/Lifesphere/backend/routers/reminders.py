import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from utils.database import get_db
from schemas.reminder import ReminderCreate, ReminderUpdate, ReminderResponse
from services.reminder_service import ReminderService
from models.enums import ReminderStatus

router = APIRouter(
    prefix="/reminders",
    tags=["Reminders"]
)

@router.get("", response_model=List[ReminderResponse], status_code=200)
def get_reminders(
    user_id: uuid.UUID = Query(..., description="ID of the user"),
    status: Optional[ReminderStatus] = Query(None, description="Filter status (pending, triggered, completed, snoozed)"),
    db: Session = Depends(get_db)
):
    """
    Fetch all active reminders for a user, optionally filtering by status.
    """
    try:
        return ReminderService.get_reminders(user_id=user_id, db=db, status=status)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch reminders: {str(e)}"
        )

@router.post("", response_model=ReminderResponse, status_code=201)
def create_reminder(
    payload: ReminderCreate,
    db: Session = Depends(get_db)
):
    """
    Manually create a new reminder.
    """
    try:
        return ReminderService.create_reminder(payload=payload, db=db)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create reminder: {str(e)}"
        )

@router.patch("/{id}", response_model=ReminderResponse, status_code=200)
def update_reminder(
    id: uuid.UUID,
    payload: ReminderUpdate,
    db: Session = Depends(get_db)
):
    """
    Update details or status of an existing reminder.
    """
    try:
        return ReminderService.update_reminder(reminder_id=id, payload=payload, db=db)
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update reminder: {str(e)}"
        )

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_reminder(
    id: uuid.UUID,
    db: Session = Depends(get_db)
):
    """
    Delete a reminder.
    """
    deleted = ReminderService.delete_reminder(reminder_id=id, db=db)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Reminder with ID {id} not found.")
    return None
