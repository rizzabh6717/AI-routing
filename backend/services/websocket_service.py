import asyncio
import json
import logging
from typing import Dict, Set, Optional, Any
from datetime import datetime
from fastapi import WebSocket, WebSocketDisconnect
import uuid

from models.emergency import WebSocketMessage, NotificationType

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.connection_metadata: Dict[str, Dict[str, Any]] = {}

    async def connect(self, websocket: WebSocket, client_id: Optional[str] = None) -> str:
        """Accept a new WebSocket connection"""
        await websocket.accept()
        
        if not client_id:
            client_id = str(uuid.uuid4())
            
        self.active_connections[client_id] = websocket
        self.connection_metadata[client_id] = {
            "connected_at": datetime.utcnow(),
            "last_ping": datetime.utcnow(),
            "subscriptions": set()
        }
        
        logger.info(f"WebSocket client {client_id} connected")
        
        # Send connection confirmation
        await self.send_personal_message({
            "type": "connection",
            "status": "connected",
            "client_id": client_id,
            "timestamp": datetime.utcnow().isoformat()
        }, client_id)
        
        return client_id

    def disconnect(self, client_id: str):
        """Remove a WebSocket connection"""
        if client_id in self.active_connections:
            del self.active_connections[client_id]
            del self.connection_metadata[client_id]
            logger.info(f"WebSocket client {client_id} disconnected")

    async def send_personal_message(self, message: Dict[str, Any], client_id: str):
        """Send a message to a specific client"""
        if client_id in self.active_connections:
            try:
                await self.active_connections[client_id].send_text(json.dumps(message, default=str))
            except Exception as e:
                logger.error(f"Error sending message to {client_id}: {e}")
                self.disconnect(client_id)

    async def broadcast_message(self, message: Dict[str, Any], exclude_client: Optional[str] = None):
        """Broadcast a message to all connected clients"""
        message_json = json.dumps(message, default=str)
        disconnected_clients = []
        
        for client_id, websocket in self.active_connections.items():
            if exclude_client and client_id == exclude_client:
                continue
                
            try:
                await websocket.send_text(message_json)
            except Exception as e:
                logger.error(f"Error broadcasting to {client_id}: {e}")
                disconnected_clients.append(client_id)
        
        # Clean up disconnected clients
        for client_id in disconnected_clients:
            self.disconnect(client_id)

    async def send_to_subscribed(self, message: Dict[str, Any], subscription_type: str):
        """Send message to clients subscribed to a specific event type"""
        message_json = json.dumps(message, default=str)
        disconnected_clients = []
        
        for client_id, websocket in self.active_connections.items():
            metadata = self.connection_metadata.get(client_id, {})
            if subscription_type in metadata.get("subscriptions", set()):
                try:
                    await websocket.send_text(message_json)
                except Exception as e:
                    logger.error(f"Error sending to subscribed client {client_id}: {e}")
                    disconnected_clients.append(client_id)
        
        # Clean up disconnected clients
        for client_id in disconnected_clients:
            self.disconnect(client_id)

    def add_subscription(self, client_id: str, subscription_type: str):
        """Add a subscription for a client"""
        if client_id in self.connection_metadata:
            self.connection_metadata[client_id]["subscriptions"].add(subscription_type)

    def remove_subscription(self, client_id: str, subscription_type: str):
        """Remove a subscription for a client"""
        if client_id in self.connection_metadata:
            self.connection_metadata[client_id]["subscriptions"].discard(subscription_type)

    def get_connection_count(self) -> int:
        """Get the number of active connections"""
        return len(self.active_connections)

    def get_connection_info(self) -> Dict[str, Any]:
        """Get information about all connections"""
        return {
            "total_connections": len(self.active_connections),
            "connections": {
                client_id: {
                    "connected_at": metadata["connected_at"].isoformat(),
                    "subscriptions": list(metadata["subscriptions"])
                }
                for client_id, metadata in self.connection_metadata.items()
            }
        }

class WebSocketService:
    def __init__(self):
        self.manager = ConnectionManager()
        self.update_tasks: Dict[str, asyncio.Task] = {}

    async def handle_websocket(self, websocket: WebSocket, client_id: Optional[str] = None):
        """Handle a WebSocket connection"""
        client_id = await self.manager.connect(websocket, client_id)
        
        try:
            while True:
                # Receive message from client
                data = await websocket.receive_text()
                
                try:
                    message = json.loads(data)
                    await self.handle_client_message(client_id, message)
                except json.JSONDecodeError:
                    await self.manager.send_personal_message({
                        "type": "error",
                        "message": "Invalid JSON format",
                        "timestamp": datetime.utcnow().isoformat()
                    }, client_id)
                    
        except WebSocketDisconnect:
            self.manager.disconnect(client_id)
        except Exception as e:
            logger.error(f"WebSocket error for client {client_id}: {e}")
            self.manager.disconnect(client_id)

    async def handle_client_message(self, client_id: str, message: Dict[str, Any]):
        """Handle incoming message from client"""
        message_type = message.get("type")
        
        if message_type == "subscribe":
            event_types = message.get("events", [])
            for event_type in event_types:
                self.manager.add_subscription(client_id, event_type)
            
            await self.manager.send_personal_message({
                "type": "subscription_confirmed",
                "events": event_types,
                "timestamp": datetime.utcnow().isoformat()
            }, client_id)
            
        elif message_type == "unsubscribe":
            event_types = message.get("events", [])
            for event_type in event_types:
                self.manager.remove_subscription(client_id, event_type)
                
        elif message_type == "ping":
            await self.manager.send_personal_message({
                "type": "pong",
                "timestamp": datetime.utcnow().isoformat()
            }, client_id)
            
        elif message_type == "request_update":
            # Client requesting specific updates
            await self.handle_update_request(client_id, message)

    async def handle_update_request(self, client_id: str, message: Dict[str, Any]):
        """Handle client request for specific updates"""
        update_type = message.get("update_type")
        
        if update_type == "vehicle_location":
            vehicle_id = message.get("vehicle_id")
            # Send current vehicle location (would get from database in real implementation)
            await self.manager.send_personal_message({
                "type": "vehicle_location",
                "data": {
                    "vehicle_id": vehicle_id,
                    "location": {
                        "coordinates": [40.7589, -73.9851],
                        "heading": 45,
                        "speed": 25
                    }
                },
                "timestamp": datetime.utcnow().isoformat()
            }, client_id)

    async def broadcast_vehicle_update(self, vehicle_id: str, location_data: Dict[str, Any]):
        """Broadcast vehicle location update"""
        message = {
            "type": "vehicle_location",
            "data": {
                "vehicle_id": vehicle_id,
                "location": location_data
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.manager.broadcast_message(message)

    async def broadcast_incident_update(self, incident_id: str, status: str, additional_data: Optional[Dict] = None):
        """Broadcast incident status update"""
        data = {
            "incident_id": incident_id,
            "status": status
        }
        if additional_data:
            data.update(additional_data)
            
        message = {
            "type": "incident_status",
            "data": data,
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.manager.broadcast_message(message)

    async def broadcast_route_optimization(self, incident_id: str, vehicle_id: str, optimization_data: Dict[str, Any]):
        """Broadcast route optimization update"""
        message = {
            "type": "route_optimization",
            "data": {
                "incident_id": incident_id,
                "vehicle_id": vehicle_id,
                **optimization_data
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.manager.broadcast_message(message)

    async def broadcast_traffic_update(self, area: str, severity: str, description: str):
        """Broadcast traffic condition update"""
        message = {
            "type": "traffic_update",
            "data": {
                "area": area,
                "severity": severity,
                "description": description
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.manager.broadcast_message(message)

    async def broadcast_notification(self, notification_data: Dict[str, Any]):
        """Broadcast system notification"""
        message = {
            "type": "new_notification",
            "data": notification_data,
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.manager.broadcast_message(message)

    def get_stats(self) -> Dict[str, Any]:
        """Get WebSocket service statistics"""
        return {
            "active_connections": self.manager.get_connection_count(),
            "connection_details": self.manager.get_connection_info()
        }

# Global WebSocket service instance
websocket_service = WebSocketService()