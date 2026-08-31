"""
Dataset Upload Router for AEGISNET FI
Handles file upload and triggers DB ingestion and ML retraining.
"""
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.postgres import get_db
from app.services.dataset_loader import DatasetLoader
from loguru import logger
import os
import shutil

router = APIRouter()

@router.post("/dataset")
async def upload_dataset(
    file: UploadFile = File(...),
    limit: int = 10000,
    db: AsyncSession = Depends(get_db)
):
    """
    Upload a transaction CSV dataset.
    Automatically parses schema, maps columns, and ingests transactions.
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only CSV files are supported."
        )

    upload_dir = "./datasets"
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, file.filename)

    try:
        logger.info(f"📥 Receiving file upload: {file.filename}")
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Triggers DB Ingestion
        result = await DatasetLoader.ingest_csv(file_path, db, limit=limit)

        # RETRAIN ML models immediately for this new dataset in background (or inline for quick hackathon updates)
        # We can implement training asynchronously.
        from app.ml.train_xgboost import train_model_from_db
        try:
            metrics = await train_model_from_db(db)
            result["ml_training"] = metrics
        except Exception as ml_err:
            logger.error(f"⚠️ ML retrain failed: {ml_err}")
            result["ml_training"] = {"status": "failed", "error": str(ml_err)}

        return {
            "status": "success",
            "message": "Dataset ingested successfully & ML engine updated.",
            "data": result
        }

    except Exception as e:
        logger.error(f"❌ Upload ingestion failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ingestion failed: {str(e)}"
        )
