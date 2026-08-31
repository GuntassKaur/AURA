from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.database.postgres import get_db
from app.database.schema import Transaction
from loguru import logger

router = APIRouter()

@router.get("/")
async def get_transactions(limit: int = 100, db: AsyncSession = Depends(get_db)):
    """Fetch latest transactions."""
    try:
        q = select(Transaction).order_by(desc(Transaction.txn_timestamp)).limit(limit)
        res = await db.execute(q)
        txns = res.scalars().all()
        return txns
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{txn_id}")
async def get_transaction(txn_id: str, db: AsyncSession = Depends(get_db)):
    """Fetch a single transaction by ID."""
    q = select(Transaction).where(Transaction.txn_id == txn_id)
    res = await db.execute(q)
    txn = res.scalar_one_or_none()
    if not txn:
        raise HTTPException(status_code=404, detail=f"Transaction {txn_id} not found.")
    return txn
