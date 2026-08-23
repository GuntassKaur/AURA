"""
LifeSphere AI — FastAPI entry point
"""

from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from utils.database import get_db
from routers import documents, chat, analytics, timeline, reminders, search, photos, dashboard

app = FastAPI(
    title="LifeSphere AI",
    description="Personal Knowledge & Intelligence Platform — Backend API",
    version="0.1.0",
)


@app.get("/health", tags=["System"])
def health_check():
    """Confirms the API server is running."""
    return {"status": "ok"}


@app.get("/health/db", tags=["System"])
def db_health_check(db: Session = Depends(get_db)):
    """Confirms the API server can talk to the PostgreSQL database."""
    try:
        # Run a simple, fast query to verify database connection
        db.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Database connection failed: {str(e)}"
        )

# Register endpoints routers
app.include_router(documents.router)
app.include_router(chat.router)
app.include_router(analytics.router)
app.include_router(timeline.router)
app.include_router(reminders.router)
app.include_router(search.router)
app.include_router(photos.router)
app.include_router(dashboard.router)
