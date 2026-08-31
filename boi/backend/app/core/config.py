"""Core configuration for AEGISNET FI"""
from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "AEGISNET FI"
    VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://aegis:aegis_secure_2024@localhost:5432/aegisnet"
    SYNC_DATABASE_URL: str = "postgresql://aegis:aegis_secure_2024@localhost:5432/aegisnet"

    # Redis
    REDIS_URL: str = "redis://localhost:6379"

    # Security
    SECRET_KEY: str = "aegis_super_secret_key_2024"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    # ML
    MODEL_PATH: str = "./models"
    DATASET_PATH: str = "./datasets"
    FRAUD_THRESHOLD: float = 0.5
    WATCH_THRESHOLD: float = 0.3
    HOLD_THRESHOLD: float = 0.6
    FREEZE_THRESHOLD: float = 0.8

    # AI
    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""

    # Streaming
    STREAM_BATCH_SIZE: int = 10
    STREAM_INTERVAL_MS: int = 500

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

# Check if PostgreSQL is available, otherwise fallback to SQLite
import socket
from urllib.parse import urlparse

def is_postgres_available(url: str) -> bool:
    try:
        parsed = urlparse(url.replace("postgresql+asyncpg", "http").replace("postgresql", "http"))
        host = parsed.hostname or "localhost"
        port = parsed.port or 5432
        with socket.create_connection((host, port), timeout=0.5):
            return True
    except Exception:
        return False

if not is_postgres_available(settings.DATABASE_URL):
    settings.DATABASE_URL = "sqlite+aiosqlite:///aegisnet.db"
    settings.SYNC_DATABASE_URL = "sqlite:///aegisnet.db"

