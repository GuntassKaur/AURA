"""
WebSocket Connection Manager for AEGISNET FI
Manages live connections for real-time tickers and alerts.
"""
from fastapi import WebSocket
from typing import Dict, List, Set
from loguru import logger
import json


class WebSocketManager:
    def __init__(self):
        # Maps channel name (e.g., 'transactions', 'alerts', 'graph', 'agents') to set of websockets
        self.active_connections: Dict[str, Set[WebSocket]] = {
            "transactions": set(),
            "alerts": set(),
            "graph": set(),
            "agents": set()
        }

    async def connect(self, websocket: WebSocket, channel: str):
        """Accept connection and add to the specified channel."""
        await websocket.accept()
        if channel not in self.active_connections:
            self.active_connections[channel] = set()
        self.active_connections[channel].add(websocket)
        logger.info(f"🔌 WebSocket connected to '{channel}' channel. Total: {len(self.active_connections[channel])}")

    def disconnect(self, websocket: WebSocket, channel: str):
        """Remove connection from channel."""
        if channel in self.active_connections:
            self.active_connections[channel].discard(websocket)
            logger.info(f"🔌 WebSocket disconnected from '{channel}'. Remaining: {len(self.active_connections[channel])}")

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        """Send message to a single websocket client."""
        try:
            await websocket.send_json(message)
        except Exception as e:
            logger.error(f"❌ Failed to send personal message: {e}")

    async def broadcast(self, message: dict, channel: str):
        """Broadcast message to all connected clients on a specific channel."""
        if channel not in self.active_connections:
            return
        
        dead_connections = set()
        connections = list(self.active_connections[channel])
        
        for connection in connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"❌ Broadcast to client on '{channel}' failed: {e}")
                dead_connections.add(connection)
                
        # Clean up disconnected sockets
        for dead in dead_connections:
            self.active_connections[channel].discard(dead)

    @property
    def active_count(self) -> int:
        """Returns the total number of active connections across all channels."""
        return sum(len(conns) for conns in self.active_connections.values())


ws_manager = WebSocketManager()
