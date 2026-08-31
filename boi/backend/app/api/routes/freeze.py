"""
Operational Freeze / System Containment Router for AEGISNET FI
Exposes endpoints to deploy emergency transactional locks on compromise vectors.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.postgres import get_db
from app.services.freeze_service import FreezeService
from pydantic import BaseModel
from typing import List

router = APIRouter()


class FreezeRequest(BaseModel):
    account_ids: List[str]
    reason: str
    initiated_by: str = "analyst_admin_01"
    case_id: str = None


class UnfreezeRequest(BaseModel):
    account_ids: List[str]
    reason: str
    initiated_by: str = "analyst_admin_01"


@router.post("/execute")
async def execute_freeze(
    payload: FreezeRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Initiate emergency containment.
    Locks outgoing transactions, updates DB state, and triggers UI alarm overlay.
    """
    if not payload.account_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account IDs list cannot be empty."
        )
        
    # Get database model case ID if present
    investigation_id = None
    if payload.case_id:
        from sqlalchemy import select
        from app.database.schema import Investigation
        case_q = select(Investigation.id).where(Investigation.case_id == payload.case_id)
        res = await db.execute(case_q)
        investigation_id = res.scalar()

    result = await FreezeService.freeze_accounts(
        account_ids=payload.account_ids,
        reason=payload.reason,
        initiated_by=payload.initiated_by,
        db=db,
        investigation_id=investigation_id
    )
    return result


@router.post("/lift")
async def lift_freeze(
    payload: UnfreezeRequest,
    db: AsyncSession = Depends(get_db)
):
    """Lifts transaction locks on accounts, restoring normal operations."""
    if not payload.account_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account IDs list cannot be empty."
        )

    result = await FreezeService.unfreeze_accounts(
        account_ids=payload.account_ids,
        reason=payload.reason,
        initiated_by=payload.initiated_by,
        db=db
    )
    return result
