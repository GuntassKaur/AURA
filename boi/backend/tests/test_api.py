"""
Unit Tests for AEGISNET FI API Endpoints
"""
import pytest
from httpx import AsyncClient
from app.main import app


@pytest.mark.anyio
async def test_health_check():
    """Verify that the health check endpoint returns 200 OK."""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


@pytest.mark.anyio
async def test_root():
    """Verify that the root endpoint returns app metadata."""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/")
    assert response.status_code == 200
    assert response.json()["system"] == "AEGISNET FI"
