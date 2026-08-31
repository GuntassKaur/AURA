"""
Redis Service for AEGISNET FI
Provides pub/sub and caching utilities.
"""
import redis.asyncio as aioredis
from app.core.config import settings
from loguru import logger
import json


class RedisClient:
    def __init__(self):
        self.redis_url = settings.REDIS_URL
        self.client = None

    async def connect(self):
        """Initialize the Redis client connection pool."""
        try:
            self.client = aioredis.from_url(
                self.redis_url,
                encoding="utf-8",
                decode_responses=True
            )
            await self.client.ping()
            logger.info("📡 Connection established to Redis")
        except Exception as e:
            logger.error(f"❌ Redis connection failed: {e}")
            raise e

    async def disconnect(self):
        """Close connection pool."""
        if self.client:
            await self.client.close()
            logger.info("📡 Redis connection closed")

    async def ping(self) -> bool:
        """Ping Redis server to check health."""
        if not self.client:
            return False
        try:
            await self.client.ping()
            return True
        except Exception:
            return False

    async def publish(self, channel: str, message: dict):
        """Publish a message to a channel."""
        if not self.client:
            logger.warning("Redis client not initialized. Skipping publish.")
            return
        try:
            await self.client.publish(channel, json.dumps(message))
        except Exception as e:
            logger.error(f"❌ Redis publish failed on channel {channel}: {e}")

    async def get_client(self) -> aioredis.Redis:
        """Get raw redis client."""
        return self.client


redis_client = RedisClient()
