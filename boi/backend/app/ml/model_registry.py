"""
Model Registry Service for AEGISNET FI
Manages loading, saving, and inference for active ML models (XGBoost + SHAP).
"""
import os
import joblib
import xgboost as xgb
import shap
from loguru import logger


class ModelRegistry:
    _active_model = None
    _active_explainer = None
    _model_version = "v1.0"
    _feature_names = [
        "amount", "dormancy_days", "velocity_1h", "velocity_24h",
        "fan_out", "network_centrality", "is_upi_test_drain",
        "sleeper_activation", "channel_UPI", "channel_NEFT",
        "channel_RTGS", "channel_IMPS", "channel_ATM"
    ]

    @classmethod
    async def load_active_models(cls):
        """Load trained XGBoost model & SHAP explainer from models path."""
        model_dir = "./models"
        os.makedirs(model_dir, exist_ok=True)
        model_path = os.path.join(model_dir, "xgboost_model.pkl")

        if os.path.exists(model_path):
            try:
                cls._active_model = joblib.load(model_path)
                logger.info(f"🔮 Active XGBoost model loaded from {model_path}")
                
                # Build/load SHAP Explainer
                try:
                    cls._active_explainer = shap.TreeExplainer(cls._active_model)
                    logger.info("🔮 SHAP TreeExplainer initialized")
                except Exception as shap_err:
                    logger.warning(f"⚠️ Failed to build SHAP TreeExplainer: {shap_err}. Falling back to default Explainer.")
                    cls._active_explainer = shap.Explainer(cls._active_model)
            except Exception as e:
                logger.error(f"❌ Failed to load model: {e}")
                cls._active_model = None
        else:
            logger.warning("⚠️ No trained XGBoost model found in ./models. System will retrain on dataset upload.")
            cls._active_model = None

    @classmethod
    def get_active_model(cls):
        """Returns the active XGBoost model."""
        return cls._active_model

    @classmethod
    def get_active_explainer(cls):
        """Returns the SHAP explainer."""
        return cls._active_explainer

    @classmethod
    def get_feature_names(cls):
        """Returns the standard feature list."""
        return cls._feature_names

    @classmethod
    def register_model(cls, model, metrics: dict):
        """Register and save newly trained model."""
        model_dir = "./models"
        os.makedirs(model_dir, exist_ok=True)
        model_path = os.path.join(model_dir, "xgboost_model.pkl")
        
        joblib.dump(model, model_path)
        cls._active_model = model
        cls._active_explainer = shap.TreeExplainer(model)
        logger.info(f"🏆 Registered new model version. Metrics: {metrics}")
