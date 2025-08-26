from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from typing import Optional
import json
import logging

from services.websocket_service import websocket_service
from dependencies import get_db

router = APIRouter(tags=["websocket"])
logger = logging.getLogger(__name__)

@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    client_id: Optional[str] = None,
    db = Depends(get_db)
):
    """WebSocket endpoint for real-time communication"""
    try:
        await websocket_service.handle_websocket(websocket, client_id)
    except WebSocketDisconnect:
        logger.info(f"WebSocket client disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")

@router.get("/ws/stats")
async def get_websocket_stats():
    """Get WebSocket service statistics"""
    return websocket_service.get_stats()

@router.post("/ws/broadcast")
async def broadcast_test_message(
    message_type: str,
    message_data: dict,
    exclude_client: Optional[str] = None
):
    """Broadcast a test message to all connected clients (for testing)"""
    message = {
        "type": message_type,
        "data": message_data,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    await websocket_service.manager.broadcast_message(message, exclude_client)
    
    return {
        "message": "Broadcast sent",
        "recipients": websocket_service.manager.get_connection_count(),
        "type": message_type
    }