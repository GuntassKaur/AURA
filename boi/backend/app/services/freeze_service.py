"""
Operational Freeze Service for AEGISNET FI
Executes systemic locks on suspect account portfolios, updates states, and publishes lockdown triggers.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.database.schema import Account, FreezeAction, Alert, Transaction
from app.services.redis_service import redis_client
from loguru import logger
import uuid
from datetime import datetime


class FreezeService:
    @classmethod
    async def freeze_accounts(
        cls, 
        account_ids: list, 
        reason: str, 
        initiated_by: str, 
        db: AsyncSession,
        investigation_id: str = None
    ) -> dict:
        """Freeze a set of accounts, log auditing detail, and broadcast websocket lockdown event."""
        try:
            logger.info(f"❄️ Initiating system freeze sequence on accounts: {account_ids}...")
            
            # 1. Update Accounts table
            await db.execute(
                update(Account)
                .where(Account.account_id.in_(account_ids))
                .values(
                    is_frozen=True,
                    risk_tier='FREEZE',
                    freeze_reason=reason,
                    freeze_timestamp=datetime.now()
                )
            )
            
            # 2. Record FreezeAction for audit log
            freeze_id = f"FRZ-{uuid.uuid4().hex[:8].upper()}"
            action = FreezeAction(
                freeze_id=freeze_id,
                account_ids=account_ids,
                initiated_by=initiated_by,
                reason=reason,
                freeze_type="FULL_ACCOUNTS_LOCK",
                status="ACTIVE",
                investigation_id=investigation_id,
                legal_authority="RBI Cyber Threat Directive Sec 45L",
                rbi_reference=f"RBI-FRAUD-{uuid.uuid4().hex[:6].upper()}",
                audit_log=[{
                    "event": "FREEZE_EXECUTED",
                    "timestamp": str(datetime.now()),
                    "operator": initiated_by,
                    "reason": reason
                }]
            )
            db.add(action)
            
            # 3. Raise system alerts
            for acc_id in account_ids:
                alert = Alert(
                    alert_type="OPERATIONAL_FREEZE_EXECUTED",
                    severity="CRITICAL",
                    entity_id=acc_id,
                    entity_type="ACCOUNT",
                    message=f"ACCOUNT {acc_id} HAS BEEN SYSTEMATICALLY FROZEN. Reason: {reason}."
                )
                db.add(alert)
                
            await db.commit()
            
            # 4. Publish freeze event to Redis (This triggers the frontend React Flow/Overlay changes)
            event_data = {
                "event_type": "OPERATIONAL_FREEZE",
                "freeze_id": freeze_id,
                "account_ids": account_ids,
                "timestamp": str(datetime.now()),
                "reason": reason,
                "initiated_by": initiated_by
            }
            await redis_client.publish("aegis:graph", event_data)
            await redis_client.publish("aegis:alerts", {
                "alert_type": "CONTAINMENT_LOCKDOWN",
                "severity": "CRITICAL",
                "message": f"SYSTEM CONTAINMENT ENGAGED: {len(account_ids)} accounts locked.",
                "details": event_data
            })
            
            logger.info(f"❄️ Containment lock successfully deployed for {len(account_ids)} accounts.")
            return {
                "status": "success",
                "freeze_id": freeze_id,
                "frozen_accounts": account_ids,
                "reference": action.rbi_reference
            }
            
        except Exception as e:
            logger.error(f"❌ Failed to execute systemic freeze: {e}")
            await db.rollback()
            raise e

    @classmethod
    async def unfreeze_accounts(cls, account_ids: list, reason: str, initiated_by: str, db: AsyncSession) -> dict:
        """Unfreeze accounts, restoring standard ops."""
        try:
            logger.info(f"☀️ Lifting system freeze sequence on accounts: {account_ids}...")
            
            await db.execute(
                update(Account)
                .where(Account.account_id.in_(account_ids))
                .values(
                    is_frozen=False,
                    risk_tier='LOW',
                    freeze_reason=None,
                    freeze_timestamp=None
                )
            )
            
            # Find active freeze actions and close them
            # (Just a simple update for active freeze records)
            await db.commit()
            
            # Publish event
            event_data = {
                "event_type": "OPERATIONAL_UNFREEZE",
                "account_ids": account_ids,
                "timestamp": str(datetime.now())
            }
            await redis_client.publish("aegis:graph", event_data)
            
            return {"status": "success", "unfrozen_accounts": account_ids}
        except Exception as e:
            logger.error(f"❌ Unfreeze failed: {e}")
            await db.rollback()
            raise e
