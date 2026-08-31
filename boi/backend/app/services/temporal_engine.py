"""
Temporal Fraud Engine for AEGISNET FI
Detects sleeper account activation, compressed multi-hop routing, and burst transaction velocities.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database.schema import Transaction, Account, Alert
from app.services.redis_service import redis_client
from loguru import logger
from datetime import datetime, timedelta
import pandas as pd


class TemporalEngine:
    @classmethod
    async def analyze_temporal_patterns(cls, db: AsyncSession) -> list:
        """Scan historical logs for anomaly signatures in velocity, dormancy, and fan-out times."""
        anomalies = []
        
        # 1. Fetch transactions (last 48 hours for scanning)
        now = datetime.now()
        start_date = now - timedelta(days=2)
        
        txn_q = await db.execute(
            select(Transaction)
            .where(Transaction.txn_timestamp >= start_date)
            .order_by(Transaction.txn_timestamp.desc())
        )
        txns = txn_q.scalars().all()
        
        if not txns:
            return anomalies
            
        df = pd.DataFrame([{
            "id": t.txn_id,
            "source": t.source_account,
            "dest": t.dest_account,
            "amount": float(t.amount),
            "timestamp": t.txn_timestamp,
            "channel": t.channel
        } for t in txns])

        # A. Detect Sleeper Activation Pattern
        # Dormant accounts (> 90 days dormant) with sudden burst (> 50k INR)
        acc_q = await db.execute(select(Account).where(Account.dormancy_days > 90))
        dormant_accounts = {a.account_id: a for a in acc_q.scalars().all()}
        
        for idx, row in df.iterrows():
            src = row["source"]
            if src in dormant_accounts and row["amount"] > 50000.0:
                acc = dormant_accounts[src]
                anomaly = {
                    "pattern": "SLEEPER_ACTIVATION",
                    "severity": "CRITICAL",
                    "account_id": src,
                    "trigger_txn_id": row["id"],
                    "description": f"Dormant account ({acc.dormancy_days} days inactive) activated with high volume transfer of ₹{row['amount']:.2f}.",
                    "timestamp": row["timestamp"]
                }
                anomalies.append(anomaly)
                await cls._register_anomaly_alert(anomaly, db)

        # B. Detect Compressed Multi-Hop Chain Laundering
        # Source sends money to Dest1, which immediately sends to Dest2 within 5 minutes
        # We search for sequence: A -> B (t1) and B -> C (t2) where 0 < t2 - t1 < 300 seconds
        df_sorted = df.sort_values(by="timestamp")
        
        for idx1, row1 in df_sorted.iterrows():
            source = row1["source"]
            bridge = row1["dest"]
            time1 = row1["timestamp"]
            amt1 = row1["amount"]
            
            # Find matching second hop
            second_hops = df_sorted[
                (df_sorted["source"] == bridge) & 
                (df_sorted["timestamp"] > time1) & 
                (df_sorted["timestamp"] <= time1 + timedelta(minutes=5))
            ]
            
            for idx2, row2 in second_hops.iterrows():
                target = row2["dest"]
                amt2 = row2["amount"]
                time_diff = (row2["timestamp"] - time1).total_seconds()
                
                # Check for layering wave (amounts should be comparable)
                if abs(amt1 - amt2) / max(amt1, 1.0) < 0.2:
                    anomaly = {
                        "pattern": "COMPRESSED_CHAIN_LAUNDERING",
                        "severity": "CRITICAL",
                        "account_id": bridge,
                        "description": f"Laundering layer wave: ₹{amt1:.2f} moved from {source} to {bridge}, and ₹{amt2:.2f} forwarded to {target} in {time_diff:.0f} seconds.",
                        "timestamp": row2["timestamp"]
                    }
                    anomalies.append(anomaly)
                    await cls._register_anomaly_alert(anomaly, db)

        return anomalies

    @classmethod
    async def _register_anomaly_alert(cls, anomaly: dict, db: AsyncSession):
        """Helper to create DB Alert and broadcast anomaly event."""
        # Check if alert already exists for account + pattern in last hour to avoid duplicates
        h_ago = datetime.now() - timedelta(hours=1)
        exist_q = await db.execute(
            select(Alert)
            .where(
                (Alert.alert_type == anomaly["pattern"]) & 
                (Alert.entity_id == anomaly["account_id"]) & 
                (Alert.created_at >= h_ago)
            )
        )
        if exist_q.scalar_one_or_none():
            return
            
        alert = Alert(
            alert_type=anomaly["pattern"],
            severity=anomaly["severity"],
            entity_id=anomaly["account_id"],
            entity_type="ACCOUNT",
            message=anomaly["description"],
            details=anomaly
        )
        db.add(alert)
        await db.commit()
        
        await redis_client.publish("aegis:alerts", {
            "id": str(alert.id),
            "alert_type": alert.alert_type,
            "severity": alert.severity,
            "entity_id": alert.entity_id,
            "message": alert.message,
            "details": alert.details,
            "created_at": str(alert.created_at)
        })
        logger.info(f"🚨 TEMPORAL ANOMALY ALERT: {alert.message}")
