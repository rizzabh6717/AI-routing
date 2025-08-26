from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class EmergencyType(str, Enum):
    FIRE = "fire"
    MEDICAL = "medical"
    POLICE = "police"
    RESCUE = "rescue"
    HAZMAT = "hazmat"
    TRAFFIC = "traffic"
    MARINE = "marine"

class Priority(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class IncidentStatus(str, Enum):
    ACTIVE = "active"
    DISPATCHED = "dispatched"
    ON_SCENE = "on-scene"
    RESOLVED = "resolved"
    CANCELLED = "cancelled"

class VehicleStatus(str, Enum):
    AVAILABLE = "available"
    DISPATCHED = "dispatched"
    ON_SCENE = "on-scene"
    RETURNING = "returning"
    MAINTENANCE = "maintenance"
    OFFLINE = "offline"

class Location(BaseModel):
    address: str
    coordinates: List[float] = Field(..., min_items=2, max_items=2)
    district: Optional[str] = None
    heading: Optional[float] = Field(None, ge=0, le=360)

class CrewMember(BaseModel):
    name: str
    role: str
    id: Optional[str] = None

class Incident(BaseModel):
    id: Optional[str] = None
    type: EmergencyType
    priority: Priority
    location: Location
    description: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    status: IncidentStatus = IncidentStatus.ACTIVE
    assigned_vehicles: List[str] = Field(default_factory=list)
    reported_by: str
    estimated_arrival: Optional[str] = None
    last_update: datetime = Field(default_factory=datetime.utcnow)
    resolved_at: Optional[datetime] = None
    notes: Optional[str] = None

class IncidentCreate(BaseModel):
    type: EmergencyType
    priority: Priority
    location: Location
    description: str
    reported_by: str

class Vehicle(BaseModel):
    id: str
    call_sign: str
    type: EmergencyType
    status: VehicleStatus = VehicleStatus.AVAILABLE
    location: Location
    crew: List[CrewMember] = Field(default_factory=list)
    current_incident: Optional[str] = None
    eta: Optional[str] = None
    speed: float = Field(default=0, ge=0)
    fuel: float = Field(default=100, ge=0, le=100)
    equipment: List[str] = Field(default_factory=list)
    last_update: datetime = Field(default_factory=datetime.utcnow)
    maintenance_due: Optional[datetime] = None

class VehicleCreate(BaseModel):
    id: str
    call_sign: str
    type: EmergencyType
    crew: List[CrewMember]
    equipment: List[str] = Field(default_factory=list)

class VehicleStatusUpdate(BaseModel):
    status: VehicleStatus
    location: Optional[Location] = None
    incident_id: Optional[str] = None
    eta: Optional[str] = None

class RoutePoint(BaseModel):
    coordinates: List[float] = Field(..., min_items=2, max_items=2)
    timestamp: Optional[datetime] = None

class RouteAlternative(BaseModel):
    name: str
    distance: float  # in meters
    duration: int    # in seconds
    traffic: str     # light, moderate, heavy

class VehicleRoute(BaseModel):
    vehicle_id: str
    route: List[List[float]]  # List of [lat, lng] coordinates
    distance: float  # in meters
    duration: int    # in seconds
    traffic: str
    alternatives: List[RouteAlternative] = Field(default_factory=list)

class RouteOptimization(BaseModel):
    incident_id: str
    vehicle_routes: Dict[str, VehicleRoute]
    optimization_history: List[Dict[str, Any]] = Field(default_factory=list)

class NotificationType(str, Enum):
    ROUTE_UPDATE = "route-update"
    TRAFFIC_ALERT = "traffic-alert"
    SYSTEM_ALERT = "system-alert"
    VEHICLE_STATUS = "vehicle-status"
    INCIDENT_UPDATE = "incident-update"

class NotificationPriority(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class Notification(BaseModel):
    id: Optional[str] = None
    type: NotificationType
    message: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    priority: NotificationPriority = NotificationPriority.MEDIUM
    read: bool = False
    incident_id: Optional[str] = None
    vehicle_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class WebSocketMessage(BaseModel):
    type: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    data: Dict[str, Any]

class SystemStats(BaseModel):
    total_incidents: int
    active_incidents: int
    critical_incidents: int
    total_vehicles: int
    available_vehicles: int
    dispatched_vehicles: int
    on_scene_vehicles: int
    average_response_time: float
    system_status: str = "operational"