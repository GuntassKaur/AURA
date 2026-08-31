"""
WebSocket Streamer for AEGISNET FI
Listens to Redis PubSub and forwards messages to WebSocket clients.
"""
import asyncio
import json
from loguru import logger
from app.services.redis_service import redis_client
from app.websocket.manager import ws_manager


async def start_streamer():
    """Background task to listen to Redis PubSub and broadcast to WS clients."""
    logger.info("📡 Starting Redis-to-WebSocket broadcaster task...")
    
    # Wait for Redis to be initialized/connected
    while not redis_client.client:
        await asyncio.sleep(0.5)
        
    pubsub = redis_client.client.pubsub()
    
    channels = {
        "aegis:transactions": "transactions",
        "aegis:alerts": "alerts",
        "aegis:graph": "graph",
        "aegis:agents": "agents"
    }
    
    try:
        await pubsub.subscribe(*channels.keys())
        logger.info(f"📡 Subscribed to Redis channels: {list(channels.keys())}")
        
        while True:
            try:
                # Read message with a timeout to prevent locking up
                message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0)
                if message:
                    redis_channel = message["channel"]
                    ws_channel = channels.get(redis_channel)
                    
                    if ws_channel:
                        try:
                            data = json.loads(message["data"])
                            # Broadcast to active WebSocket connections on this channel
                            await ws_manager.broadcast(data, ws_channel)
                        except json.JSONDecodeError:
                            logger.error(f"❌ Failed to decode JSON from Redis message: {message['data']}")
                        except Exception as e:
                            logger.error(f"❌ Error broadcasting message from Redis: {e}")
                
                await asyncio.sleep(0.01)  # Yield CPU
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"❌ Error in PubSub broadcast loop: {e}")
                await asyncio.sleep(2.0)  # Wait before retrying
                
    except Exception as e:
        logger.error(f"❌ Critial failure in start_streamer: {e}")
    finally:
        await pubsub.unsubscribe()
        logger.info("📡 Unsubscribed from Redis channels")
