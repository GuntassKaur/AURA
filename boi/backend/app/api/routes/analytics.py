"""
Analytics Summary Router for AEGISNET FI
Exposes aggregated statistics for dashboard visual widgets.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database.postgres import get_db
from app.database.schema import Transaction, Account, Alert
from loguru import logger

router = APIRouter()


@router.get("/summary")
async def get_dashboard_summary(db: AsyncSession = Depends(get_db)):
    """Computes operational summary metrics for widgets."""
    try:
        # Total transaction count
        txn_count_q = select(func.count(Transaction.id))
        txn_count_res = await db.execute(txn_count_q)
        total_txns = txn_count_res.scalar_one() or 0

        # Total Volume
        txn_vol_q = select(func.sum(Transaction.amount))
        txn_vol_res = await db.execute(txn_vol_q)
        total_volume = float(txn_vol_res.scalar_one() or 0.0)

        # Frozen Accounts count
        frozen_q = select(func.count(Account.id)).where(Account.is_frozen == True)
        frozen_res = await db.execute(frozen_q)
        frozen_count = frozen_res.scalar_one() or 0

        # Watchlist accounts count
        watch_q = select(func.count(Account.id)).where(Account.risk_tier == 'WATCH')
        watch_res = await db.execute(watch_q)
        watch_count = watch_res.scalar_one() or 0

        # High Risk Alerts count
        alert_q = select(func.count(Alert.id)).where(Alert.is_acknowledged == False)
        alert_res = await db.execute(alert_q)
        active_alerts = alert_res.scalar_one() or 0

        # Heatmap hot zones (glowing maps data: Mewat, Jamtara, Bharatpur, Mumbai)
        hotspots = [
            {"name": "Jamtara (Jharkhand)", "lat": 24.1167, "lng": 86.8000, "intensity": 0.88, "cases": 142},
            {"name": "Bharatpur (Rajasthan)", "lat": 27.2152, "lng": 77.4930, "intensity": 0.72, "cases": 98},
            {"name": "Mewat (Haryana)", "lat": 28.1322, "lng": 77.0144, "intensity": 0.65, "cases": 82},
            {"name": "Mumbai Cyber Grid", "lat": 19.0760, "lng": 72.8777, "intensity": 0.45, "cases": 54},
            {"name": "Delhi Command Loop", "lat": 28.6139, "lng": 77.2090, "intensity": 0.50, "cases": 61}
        ]

        return {
            "total_transactions": total_txns,
            "total_volume_inr": total_volume,
            "frozen_accounts": frozen_count,
            "watch_accounts": watch_count,
            "active_alerts": active_alerts,
            "system_status": "NORMAL" if active_alerts < 10 else "ATTACK_CONTAINMENT_DEPLOYED",
            "hotspots": hotspots
        }

    except Exception as e:
        logger.error(f"Failed to generate analytics summary: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to compile dashboard metrics."
        )
