"""
Database module for AEGISNET FI
Provides SQLAlchemy engine, session maker, and declarative base.
"""
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy import create_engine
from app.core.config import settings

# Async Engine and Session
if "sqlite" in settings.DATABASE_URL:
    engine = create_async_engine(
        settings.DATABASE_URL,
        echo=False,
        future=True
    )
else:
    engine = create_async_engine(
        settings.DATABASE_URL,
        echo=False,
        future=True,
        pool_size=20,
        max_overflow=10
    )

async_session_maker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Sync Engine and Session (useful for background scripts/ReportLab if needed)
if "sqlite" in settings.SYNC_DATABASE_URL:
    sync_engine = create_engine(settings.SYNC_DATABASE_URL)
else:
    sync_engine = create_engine(
        settings.SYNC_DATABASE_URL,
        pool_size=10,
        max_overflow=5
    )
sync_session_maker = sessionmaker(
    bind=sync_engine,
    autocommit=False,
    autoflush=False
)

Base = declarative_base()

async def get_db():
    """Dependency for API endpoints to get database session"""
    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
