"""
WebSocket Router for AEGISNET FI
Accepts websocket connections for transaction streams, alerts, graphs, and agent logs.
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from loguru import logger
from app.websocket.manager import ws_manager

router = APIRouter()


@router.websocket("/{channel}")
async def websocket_endpoint(websocket: WebSocket, channel: str):
    """
    WebSocket endpoint for real-time channels:
    - transactions
    - alerts
    - graph
    - agents
    """
    if channel not in ["transactions", "alerts", "graph", "agents"]:
        logger.warning(f"⚠️ Attempted WebSocket connection to invalid channel: '{channel}'")
        await websocket.close(code=4000, reason="Invalid channel")
        return
        
    await ws_manager.connect(websocket, channel)
    try:
        while True:
            # Keep connection alive and listen for any client messages
            data = await websocket.receive_text()
            # Respond to ping or other control messages if needed
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, channel)
    except Exception as e:
        logger.error(f"❌ Error in websocket endpoint for '{channel}': {e}")
        ws_manager.disconnect(websocket, channel)
        try:
            await websocket.close(code=1011)
        except Exception:
            pass
