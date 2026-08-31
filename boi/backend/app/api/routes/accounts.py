from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.database.postgres import get_db
from app.database.schema import Account, Transaction, GraphNode
from loguru import logger
import random

router = APIRouter()

@router.get("/{account_id}")
async def get_account_profile(account_id: str, db: AsyncSession = Depends(get_db)):
    """Retrieve 360-degree account profile combining KYC, Graph intelligence, and Transaction flow."""
    try:
        # 1. Fetch Account
        acc_q = await db.execute(select(Account).where(Account.account_id == account_id))
        acc = acc_q.scalar_one_or_none()
        
        if not acc:
            raise HTTPException(status_code=404, detail="Account not found")

        # 2. Fetch Graph Node Intelligence
        node_q = await db.execute(select(GraphNode).where(GraphNode.account_id == account_id))
        node = node_q.scalar_one_or_none()

        # 3. Fetch Recent Transactions
        # Both incoming and outgoing
        txn_q = await db.execute(
            select(Transaction)
            .where((Transaction.source_account == account_id) | (Transaction.dest_account == account_id))
            .order_by(desc(Transaction.txn_timestamp))
            .limit(50)
        )
        txns = txn_q.scalars().all()

        # Calculate mule probability dynamically
        mule_prob = 0.05
        if node:
            if node.is_mule_suspect:
                mule_prob = 0.85 + (random.random() * 0.1) # High prob
            elif node.out_degree > 3 and node.in_degree > 1:
                mule_prob = 0.65

        # Format Response
        profile = {
            "account_id": acc.account_id,
            "bank_code": acc.bank_code,
            "ifsc": acc.ifsc_code,
            "balance": acc.balance,
            "risk_tier": acc.risk_tier,
            "is_frozen": acc.is_frozen,
            "dormancy_days": acc.dormancy_days,
            "last_activity": acc.last_activity,
            "graph_intelligence": {
                "pagerank": node.pagerank if node else 0.0,
                "centrality": node.degree_centrality if node else 0.0,
                "in_degree": node.in_degree if node else 0,
                "out_degree": node.out_degree if node else 0,
                "mule_probability": mule_prob,
                "is_mule_suspect": node.is_mule_suspect if node else False
            },
            "recent_transactions": txns
        }

        return profile

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to fetch account profile for {account_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to query account profile."
        )
