from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List
import pandas as pd
from app.services.shap_engine import shap_engine
import joblib
from pathlib import Path

router = APIRouter()

# Load models for live inference
try:
    models_dir = Path(__file__).parent.parent.parent / "models"
    model = joblib.load(models_dir / "xgboost_model.pkl")
    scaler = joblib.load(models_dir / "scaler.pkl")
    # label encoders could also be loaded if we expect live string inputs
except Exception as e:
    model = None
    scaler = None

class TransactionFeatures(BaseModel):
    features: Dict[str, Any]

class ScoringResponse(BaseModel):
    fraud_probability: float
    risk_tier: str
    shap_explanation: Dict[str, Any]

@router.post("/score", response_model=ScoringResponse)
async def score_transaction(payload: TransactionFeatures):
    """
    Live inference endpoint for pure ML scoring.
    Expects a dictionary of F1...F3924 features.
    """
    if not model or not scaler:
        raise HTTPException(status_code=503, detail="ML Models not loaded into registry.")

    try:
        # Convert to single-row dataframe
        df = pd.DataFrame([payload.features])
        
        # Ensure all columns present
        # In a real system, we'd align columns with the training set
        
        # Temporary hack for hackathon: Handle string encoding live if needed
        # (Assuming the API gets pre-encoded integers or we skip it for the demo)
        
        scaled_features = scaler.transform(df)
        
        # Predict probability
        prob = float(model.predict_proba(scaled_features)[0][1])
        
        # Determine tier
        if prob > 0.8:
            tier = "CRITICAL"
        elif prob > 0.5:
            tier = "HIGH"
        elif prob > 0.2:
            tier = "MEDIUM"
        else:
            tier = "LOW"
            
        # Get SHAP
        shap_data = shap_engine.explain_transaction(df)
        
        return ScoringResponse(
            fraud_probability=prob,
            risk_tier=tier,
            shap_explanation=shap_data
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
