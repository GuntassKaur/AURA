"""
Investigations Case Manager Router for AEGISNET FI
Exposes endpoints to query active case profiles, fetch alerts, and log comments.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.database.postgres import get_db
from app.database.schema import Investigation, Alert, Transaction
from loguru import logger
import json

router = APIRouter()


@router.get("/")
async def get_investigations(db: AsyncSession = Depends(get_db)):
    """Retrieve list of all active/escalated/closed threat cases."""
    try:
        q = select(Investigation).order_by(desc(Investigation.created_at))
        res = await db.execute(q)
        cases = res.scalars().all()
        return cases
    except Exception as e:
        logger.error(f"Failed to fetch cases: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to query cases ledger."
        )


@router.get("/{case_id}")
async def get_case_details(case_id: str, db: AsyncSession = Depends(get_db)):
    """Fetch detail record for an investigation case, linking active alerts and transactions."""
    q = select(Investigation).where(Investigation.case_id == case_id)
    res = await db.execute(q)
    case = res.scalar_one_or_none()
    
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Investigation case {case_id} not found."
        )

    # Parse suspect accounts from JSONB
    suspect_list = []
    if isinstance(case.suspect_accounts, str):
        suspect_list = json.loads(case.suspect_accounts)
    elif isinstance(case.suspect_accounts, list):
        suspect_list = case.suspect_accounts

    # Fetch associated transaction details from DB
    txn_q = select(Transaction).where(
        (Transaction.source_account.in_(suspect_list)) | 
        (Transaction.dest_account.in_(suspect_list))
    ).order_by(desc(Transaction.txn_timestamp)).limit(30)
    
    txn_res = await db.execute(txn_q)
    txns = txn_res.scalars().all()

    # Fetch associated alerts
    alert_q = select(Alert).where(Alert.investigation_id == case.id).order_by(desc(Alert.created_at))
    alert_res = await db.execute(alert_q)
    alerts = alert_res.scalars().all()

    return {
        "case": case,
        "suspects": suspect_list,
        "transactions": txns,
        "alerts": alerts
    }


@router.post("/{case_id}/notes")
async def add_analyst_notes(
    case_id: str,
    notes: str,
    db: AsyncSession = Depends(get_db)
):
    """Log manual analysis logs/notes onto case timeline."""
    q = select(Investigation).where(Investigation.case_id == case_id)
    res = await db.execute(q)
    case = res.scalar_one_or_none()
    
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case {case_id} not found."
        )
        
    case.analyst_notes = notes
    await db.commit()
    return {
        "status": "success",
        "message": "Case notes updated.",
        "case_id": case_id
    }

@router.get("/{case_id}/timeline")
async def get_investigation_timeline(case_id: str, db: AsyncSession = Depends(get_db)):
    """Fetch chronological event list to power the Investigation Replay Engine."""
    q = select(Investigation).where(Investigation.case_id == case_id)
    res = await db.execute(q)
    case = res.scalar_one_or_none()
    
    if not case:
        raise HTTPException(status_code=404, detail="Case not found.")

    suspect_list = []
    if isinstance(case.suspect_accounts, str):
        suspect_list = json.loads(case.suspect_accounts)
    elif isinstance(case.suspect_accounts, list):
        suspect_list = case.suspect_accounts

    # Fetch Transactions
    txn_q = select(Transaction).where(
        (Transaction.source_account.in_(suspect_list)) | 
        (Transaction.dest_account.in_(suspect_list))
    ).order_by(Transaction.txn_timestamp)
    txn_res = await db.execute(txn_q)
    txns = txn_res.scalars().all()

    # Fetch Alerts
    alert_q = select(Alert).where(Alert.investigation_id == case.id).order_by(Alert.created_at)
    alert_res = await db.execute(alert_q)
    alerts = alert_res.scalars().all()

    # Merge into a generic Timeline Event structure
    events = []
    
    for t in txns:
        events.append({
            "id": f"txn_{t.id}",
            "type": "TRANSACTION",
            "timestamp": t.txn_timestamp,
            "title": "Transaction Received",
            "description": f"Transfer of ₹{t.amount} from {t.source_account} to {t.dest_account}",
            "metadata": {"amount": t.amount, "channel": t.channel, "fraud_score": t.fraud_score}
        })
        
        # If fraud score is high, synthesize a risk escalation event immediately after
        if t.fraud_score > 0.8:
            events.append({
                "id": f"risk_{t.id}",
                "type": "RISK_ESCALATION",
                "timestamp": t.txn_timestamp,
                "title": "Risk Escalation",
                "description": f"XGBoost Flagged TXN: Score {t.fraud_score:.2f}",
                "metadata": {"fraud_score": t.fraud_score}
            })

    for a in alerts:
        events.append({
            "id": f"alert_{a.id}",
            "type": "SYSTEM_ALERT",
            "timestamp": a.created_at,
            "title": a.alert_type,
            "description": a.description,
            "metadata": {"severity": a.severity}
        })
        
    # Add manual Case Creation event
    events.append({
        "id": f"create_{case.id}",
        "type": "CASE_CREATED",
        "timestamp": case.created_at,
        "title": "Investigation Opened",
        "description": f"Case assigned to {case.assigned_to}",
        "metadata": {"priority": case.priority}
    })

    # Sort chronologically for the Replay Engine
    events.sort(key=lambda x: x["timestamp"])

    return events

from pydantic import BaseModel
class ChatRequest(BaseModel):
    message: str

@router.post("/{case_id}/copilot")
async def copilot_chat(case_id: str, req: ChatRequest, db: AsyncSession = Depends(get_db)):
    """Interactive AI Copilot endpoint."""
    from app.agents.copilot import run_copilot
    result = await run_copilot(case_id, db, user_message=req.message)
    return result

@router.get("/{case_id}/risk_story")
async def generate_risk_story(case_id: str, db: AsyncSession = Depends(get_db)):
    """Generate automated Risk Story narrative using AI Copilot."""
    from app.agents.copilot import run_copilot
    result = await run_copilot(case_id, db, generate_story=True)
    return result

