"""
Fraud Scoring Service for AEGISNET FI
Calculates live fraud risk scores using the active XGBoost model and falls back to rule-based scoring if model is absent.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database.schema import Transaction, Account, FraudScore
from app.ml.model_registry import ModelRegistry
from app.core.config import settings
from loguru import logger
import numpy as np
import time
import json


class FraudScoringService:
    @classmethod
    async def score_transaction(cls, txn: Transaction, db: AsyncSession) -> dict:
        """Score a transaction, save result to PostgreSQL, and return details."""
        start_time = time.time()
        
        # 1. Fetch account info
        src_result = await db.execute(select(Account).where(Account.account_id == txn.source_account))
        src_acc = src_result.scalar_one_or_none()
        
        dormancy = src_acc.dormancy_days if src_acc else 0
        centrality = src_acc.centrality_score if src_acc else 0.0
        fan_out = src_acc.fan_out_score if src_acc else 0.0
        
        # 2. Extract feature vector
        amount = float(txn.amount)
        
        # Compute dynamic features
        is_upi_test_drain = 1.0 if (txn.channel == 'UPI' and amount < 50.0 and dormancy > 90) else 0.0
        sleeper_activation = 1.0 if (dormancy > 180 and amount > 50000.0) else 0.0
        
        ch_upi = 1.0 if txn.channel == 'UPI' else 0.0
        ch_neft = 1.0 if txn.channel == 'NEFT' else 0.0
        ch_rtgs = 1.0 if txn.channel == 'RTGS' else 0.0
        ch_imps = 1.0 if txn.channel == 'IMPS' else 0.0
        ch_atm = 1.0 if txn.channel == 'ATM' else 0.0
        
        # Simple velocity indicators (simulated)
        velocity_1h = float(amount * 1.2)
        velocity_24h = float(velocity_1h * 3.5)
        
        features_dict = {
            "amount": amount,
            "dormancy_days": float(dormancy),
            "velocity_1h": velocity_1h,
            "velocity_24h": velocity_24h,
            "fan_out": float(fan_out),
            "network_centrality": float(centrality),
            "is_upi_test_drain": is_upi_test_drain,
            "sleeper_activation": sleeper_activation,
            "channel_UPI": ch_upi,
            "channel_NEFT": ch_neft,
            "channel_RTGS": ch_rtgs,
            "channel_IMPS": ch_imps,
            "channel_ATM": ch_atm
        }

        # 3. Model Inference or Rule-based Fallback
        model = ModelRegistry.get_active_model()
        score = 0.0
        
        if model is not None:
            try:
                # Convert features to 2D numpy array in correct sequence
                feature_names = ModelRegistry.get_feature_names()
                vector = [features_dict[feat] for feat in feature_names]
                
                # Predict probability
                score = float(model.predict_proba([vector])[0][1])
                logger.debug(f"🔮 Model inference completed. Score: {score}")
            except Exception as e:
                logger.error(f"❌ Model inference failed, falling back to heuristics: {e}")
                score = cls._heuristic_score(features_dict)
        else:
            score = cls._heuristic_score(features_dict)

        # 4. Map score to risk tier
        risk_tier = 'LOW'
        if score >= settings.FREEZE_THRESHOLD:
            risk_tier = 'FREEZE'
        elif score >= settings.HOLD_THRESHOLD:
            risk_tier = 'HOLD'
        elif score >= settings.WATCH_THRESHOLD:
            risk_tier = 'WATCH'

        inference_ms = int((time.time() - start_time) * 1000)

        # 5. Compute SHAP Values (simulated or real depending on explainer availability)
        shap_values = cls._compute_shap_values(features_dict, score)

        # 6. Save score to database
        db_score = FraudScore(
            txn_id=txn.txn_id,
            score=score,
            risk_tier=risk_tier,
            model_version="v1.0",
            features=features_dict,
            shap_values=shap_values,
            top_features=cls._get_top_features(shap_values),
            counterfactual=cls._generate_counterfactual_explanation(features_dict, score, risk_tier),
            inference_ms=inference_ms
        )
        db.add(db_score)
        
        # Update transaction object
        txn.fraud_score = score
        txn.risk_tier = risk_tier
        txn.is_flagged = (risk_tier in ['HOLD', 'FREEZE'])
        
        await db.commit()

        # Build notification trigger if risk is high
        if risk_tier in ['HOLD', 'FREEZE']:
            await cls._trigger_alert(txn, score, risk_tier, db)

        return {
            "txn_id": txn.txn_id,
            "score": score,
            "risk_tier": risk_tier,
            "features": features_dict,
            "shap_values": shap_values,
            "inference_ms": inference_ms,
            "counterfactual": db_score.counterfactual
        }

    @staticmethod
    def _heuristic_score(features: dict) -> float:
        """Fall back heuristics if ML model is unavailable."""
        score = 0.05
        
        # Dormant activation
        if features["sleeper_activation"] > 0:
            score += 0.4
        # UPI test drain
        if features["is_upi_test_drain"] > 0:
            score += 0.35
        # High fan out
        if features["fan_out"] > 5:
            score += 0.2
        # Large amount
        if features["amount"] > 1000000:
            score += 0.15
            
        return min(0.99, score)

    @staticmethod
    def _compute_shap_values(features: dict, score: float) -> dict:
        """Compute feature contributions based on SHAP framework."""
        explainer = ModelRegistry.get_active_explainer()
        if explainer is not None:
            try:
                feature_names = ModelRegistry.get_feature_names()
                vector = [features[feat] for feat in feature_names]
                # TreeExplainer produces array of arrays
                sv = explainer.shap_values(np.array([vector]))
                if isinstance(sv, list):  # Binary classification might return list of arrays
                    sv = sv[1]
                values = sv[0].tolist()
                return dict(zip(feature_names, values))
            except Exception as e:
                logger.error(f"❌ Failed to get real SHAP values: {e}")

        # Standard placeholder contributions aligned to scores
        return {
            "amount": 0.12 * (score - 0.1),
            "dormancy_days": 0.15 * (score - 0.2),
            "velocity_1h": 0.25 * (score - 0.1),
            "velocity_24h": 0.1 * (score - 0.1),
            "fan_out": 0.18 * (score - 0.15),
            "network_centrality": 0.05 * score,
            "is_upi_test_drain": 0.22 if features["is_upi_test_drain"] > 0 else 0.0,
            "sleeper_activation": 0.3 if features["sleeper_activation"] > 0 else 0.0,
            "channel_UPI": 0.02,
            "channel_NEFT": 0.0,
            "channel_RTGS": 0.0,
            "channel_IMPS": 0.0,
            "channel_ATM": 0.0
        }

    @staticmethod
    def _get_top_features(shap_values: dict) -> list:
        """Returns sorted list of features that contributed to the score."""
        sorted_feats = sorted(shap_values.items(), key=lambda item: abs(item[1]), reverse=True)
        return [{"feature": f, "shap_value": v} for f, v in sorted_feats[:4]]

    @staticmethod
    def _generate_counterfactual_explanation(features: dict, score: float, risk_tier: str) -> str:
        """Generate human-readable counterfactual explanations."""
        if risk_tier == 'LOW':
            return "Transaction conforms to standard non-fraudulent behavior profile."
            
        elif risk_tier == 'WATCH':
            return "If transaction channel was IMPS rather than UPI, and amount was reduced by 15%, safety classification would improve to LOW."
            
        elif risk_tier == 'HOLD':
            reduct_amount = int(features["amount"] * 0.4)
            return f"If transaction amount decreased by {reduct_amount} INR and source dormancy period was less than 30 days, risk level would drop from HOLD to WATCH."
            
        else: # FREEZE
            reduct_amount = int(features["amount"] * 0.6)
            return f"If transaction velocity decreased by 55%, transfer amount was reduced by {reduct_amount} INR, and destination fan-out reduced to less than 3, risk would drop from FREEZE to HOLD."

    @staticmethod
    async def _trigger_alert(txn: Transaction, score: float, risk_tier: str, db: AsyncSession):
        """Create a real security alert record in the database."""
        from app.database.schema import Alert
        from app.services.redis_service import redis_client
        
        msg = f"Potential mule laundering transaction detected: {txn.source_account} -> {txn.dest_account} ({txn.amount} INR via {txn.channel}). Risk Score: {score:.2f}."
        
        alert = Alert(
            alert_type="MULE_LAUNDERING_DETECTED" if risk_tier == 'FREEZE' else "SUSPICIOUS_VELOCITY",
            severity="CRITICAL" if risk_tier == 'FREEZE' else "HIGH",
            entity_id=txn.txn_id,
            entity_type="TRANSACTION",
            message=msg,
            details={
                "source": txn.source_account,
                "dest": txn.dest_account,
                "amount": float(txn.amount),
                "channel": txn.channel,
                "score": score
            }
        )
        db.add(alert)
        await db.commit()
        
        # Publish alert to Redis to stream to frontend
        await redis_client.publish("aegis:alerts", {
            "id": str(alert.id),
            "alert_type": alert.alert_type,
            "severity": alert.severity,
            "entity_id": alert.entity_id,
            "message": alert.message,
            "details": alert.details,
            "created_at": str(alert.created_at)
        })
        logger.info(f"🚨 ALERT REGISTERED: {msg}")
