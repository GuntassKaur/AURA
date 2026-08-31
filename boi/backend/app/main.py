"""
AEGISNET FI — FastAPI Main Application
National Financial Threat Containment Infrastructure
"""
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles
import os
from loguru import logger

from app.core.config import settings
from app.database.postgres import engine, Base
# Import models to register them with Base.metadata
import app.database.schema

# ─── Legacy route modules (still present in app/api/routes/) ───
from app.api.routes import (
    investigations, agents, freeze, upload, analytics, accounts
)

# ─── New modular route modules ───
from app.api.auth import router as auth_router
from app.api.transactions import router as transactions_router
from app.api.fraud import router as fraud_router
from app.api.graph import router as graph_router
from app.api.reports import router as reports_router
from app.api.websocket import router as ws_router

from app.websocket.manager import ws_manager
from app.services.redis_service import redis_client


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan - startup and shutdown events."""
    logger.info("🚀 AEGISNET FI — Initializing...")

    # Initialize database tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("✅ Database initialized")

    # Run database seed
    try:
        from app.db.seed import seed_database
        seed_database()
        logger.info("🌱 Database seeding complete")
    except Exception as seed_err:
        logger.warning(f"⚠️ Seeding skipped: {seed_err}")

    # Connect Redis
    try:
        await redis_client.connect()
        logger.info("✅ Redis connected")
    except Exception as redis_err:
        logger.warning(f"⚠️ Redis skipped: {redis_err}")

    # Load ML models (XGBoost from app/models/)
    try:
        from app.ml.model_registry import ModelRegistry
        await ModelRegistry.load_active_models()
        logger.info("✅ ML models loaded from registry")
    except Exception as ml_err:
        logger.warning(f"⚠️ ML model loading skipped: {ml_err}")

    # Start background transaction streamer
    try:
        from app.websocket.streamer import start_streamer
        asyncio.create_task(start_streamer())
        logger.info("✅ Transaction streamer started")
    except Exception as streamer_err:
        logger.warning(f"⚠️ Streamer skipped: {streamer_err}")

    logger.info("🔥 AEGISNET FI — OPERATIONAL")
    yield

    # Shutdown
    try:
        await redis_client.disconnect()
    except Exception:
        pass
    logger.info("⛔ AEGISNET FI — Shutdown complete")


app = FastAPI(
    title="AEGISNET FI",
    description="AI-Powered Financial Threat Containment Infrastructure — Bank of India × IIT Hyderabad Hackathon",
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# ─── Middleware ───
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# ─── Static file mounts ───
os.makedirs("reports", exist_ok=True)
os.makedirs("models", exist_ok=True)
os.makedirs("datasets", exist_ok=True)
app.mount("/reports", StaticFiles(directory="reports"), name="reports")

# ─── API Routes ───

# Auth
app.include_router(auth_router.router, prefix="/api/auth", tags=["Authentication"])

# Transactions (new modular)
app.include_router(transactions_router.router, prefix="/api/transactions", tags=["Transactions"])

# Fraud Scoring (XGBoost + SHAP — Layer 1 ML)
app.include_router(fraud_router.router, prefix="/api/fraud", tags=["Fraud Detection"])

# Graph Intelligence (Layer 2 Simulation)
app.include_router(graph_router.router, prefix="/api/graph", tags=["Graph Intelligence"])

# Reports / Compliance (STR)
app.include_router(reports_router.router, prefix="/api/reports", tags=["Reports"])

# WebSocket
app.include_router(ws_router.router, prefix="/ws", tags=["WebSocket"])

# Legacy routes still in app/api/routes/
app.include_router(investigations.router, prefix="/api/investigations", tags=["Investigations"])
app.include_router(accounts.router, prefix="/api/accounts", tags=["Accounts"])
app.include_router(agents.router, prefix="/api/agents", tags=["AI Agents"])
app.include_router(freeze.router, prefix="/api/freeze", tags=["Operational Freeze"])
app.include_router(upload.router, prefix="/api/upload", tags=["Dataset Upload"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])


@app.get("/")
async def root():
    return {
        "system": "AEGISNET FI",
        "status": "OPERATIONAL",
        "version": "2.0.0",
        "layers": {
            "layer_1": "XGBoost ML Intelligence (BOI Dataset)",
            "layer_2": "Operational Investigation Simulation"
        }
    }


@app.get("/api/health")
async def health():
    return {
        "status": "healthy",
        "ws_connections": ws_manager.active_count,
    }


@app.get("/api/metrics")
async def get_model_metrics():
    """Serve real XGBoost metrics from the training run."""
    import json
    from pathlib import Path
    metrics_dir = Path("metrics")
    try:
        with open(metrics_dir / "model_metrics.json") as f:
            model_metrics = json.load(f)
        with open(metrics_dir / "confusion_matrix.json") as f:
            confusion_matrix = json.load(f)
        return {
            "model": "XGBoost (BOI Dataset)",
            "target_column": "F3924",
            "training_samples": 9082,
            "metrics": model_metrics,
            "confusion_matrix": confusion_matrix
        }
    except FileNotFoundError:
        return {"error": "Metrics not yet generated. Run train_xgboost.py first."}
