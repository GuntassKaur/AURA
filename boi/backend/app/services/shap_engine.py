import joblib
import pandas as pd
import numpy as np
import shap
import json
from pathlib import Path
from loguru import logger

class SHAPEngine:
    def __init__(self):
        self.base_dir = Path(__file__).parent.parent
        self.models_dir = self.base_dir / "models"
        
        try:
            self.model = joblib.load(self.models_dir / "xgboost_model.pkl")
            self.scaler = joblib.load(self.models_dir / "scaler.pkl")
            # For tree explainers, XGBClassifier model object can be passed directly
            self.explainer = shap.TreeExplainer(self.model)
            logger.info("SHAP Explainer initialized successfully with XGBoost model.")
        except Exception as e:
            logger.error(f"Failed to initialize SHAP explainer: {e}")
            self.model = None
            self.explainer = None

    def explain_transaction(self, features_df: pd.DataFrame) -> dict:
        """
        Explain a single transaction or batch of transactions using SHAP.
        Expects a DataFrame with the raw features (before scaling).
        """
        if not self.explainer:
            return {"error": "SHAP Explainer not initialized."}

        # Ensure features are scaled the exact same way
        try:
            scaled_features = self.scaler.transform(features_df)
            
            # Calculate SHAP values
            shap_values = self.explainer.shap_values(scaled_features)
            
            # Extract feature names if available, else use generic
            feature_names = features_df.columns.tolist()
            
            # Build explanation payload for the first row (assuming single transaction routing)
            importances = dict(zip(feature_names, shap_values[0].tolist()))
            
            # Sort by absolute magnitude to find top driving factors
            sorted_importances = sorted(importances.items(), key=lambda x: abs(x[1]), reverse=True)
            
            return {
                "status": "success",
                "top_factors": [{"feature": k, "impact": v} for k, v in sorted_importances[:10]],
                "full_shap_matrix": importances,
                "base_value": float(self.explainer.expected_value[0]) if isinstance(self.explainer.expected_value, np.ndarray) else float(self.explainer.expected_value)
            }
        except Exception as e:
            logger.error(f"SHAP calculation failed: {e}")
            return {"error": str(e)}

# Singleton instance for FastAPI dependency injection
shap_engine = SHAPEngine()
