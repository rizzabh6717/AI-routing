from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from typing import List, Optional
from datetime import datetime

from models.emergency import (
    Incident, IncidentCreate, IncidentStatus, 
    EmergencyType, Priority, SystemStats
)
from services.incident_service import IncidentService
from services.vehicle_service import VehicleService
from services.websocket_service import websocket_service
from dependencies import get_db

router = APIRouter(prefix="/incidents", tags=["incidents"])

@router.post("/", response_model=Incident)
async def create_incident(
    incident_data: IncidentCreate,
    background_tasks: BackgroundTasks,
    db = Depends(get_db)
):
    """Create a new emergency incident"""
    incident_service = IncidentService(db)
    
    try:
        incident = await incident_service.create_incident(incident_data)
        
        # Broadcast incident creation to WebSocket clients
        background_tasks.add_task(
            websocket_service.broadcast_incident_update,
            incident.id,
            "created",
            {"priority": incident.priority, "type": incident.type}
        )
        
        # Broadcast notification
        background_tasks.add_task(
            websocket_service.broadcast_notification,
            {
                "id": f"N{int(datetime.utcnow().timestamp())}",
                "type": "incident-update",
                "message": f"New {incident.type} incident created: {incident.id}",
                "priority": "high" if incident.priority == "critical" else "medium",
                "incident_id": incident.id
            }
        )
        
        return incident
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create incident: {str(e)}")

@router.get("/", response_model=List[Incident])
async def get_incidents(
    status: Optional[IncidentStatus] = None,
    type: Optional[EmergencyType] = None,
    priority: Optional[Priority] = None,
    limit: int = 100,
    db = Depends(get_db)
):
    """Retrieve incidents with optional filtering"""
    incident_service = IncidentService(db)
    
    try:
        incidents = await incident_service.get_incidents(
            status=status, type=type, priority=priority, limit=limit
        )
        return incidents
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve incidents: {str(e)}")

@router.get("/{incident_id}", response_model=Incident)
async def get_incident(incident_id: str, db = Depends(get_db)):
    """Get a specific incident by ID"""
    incident_service = IncidentService(db)
    
    incident = await incident_service.get_incident_by_id(incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    return incident

@router.put("/{incident_id}/status")
async def update_incident_status(
    incident_id: str,
    status: IncidentStatus,
    notes: Optional[str] = None,
    background_tasks: BackgroundTasks = None,
    db = Depends(get_db)
):
    """Update incident status"""
    incident_service = IncidentService(db)
    
    incident = await incident_service.update_incident_status(incident_id, status, notes)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    # Broadcast status update
    if background_tasks:
        background_tasks.add_task(
            websocket_service.broadcast_incident_update,
            incident_id,
            status,
            {"notes": notes}
        )
    
    return {"message": "Incident status updated", "incident": incident}

@router.post("/{incident_id}/assign/{vehicle_id}")
async def assign_vehicle_to_incident(
    incident_id: str,
    vehicle_id: str,
    background_tasks: BackgroundTasks,
    db = Depends(get_db)
):
    """Assign a vehicle to an incident"""
    incident_service = IncidentService(db)
    vehicle_service = VehicleService(db)
    
    # Check if incident exists
    incident = await incident_service.get_incident_by_id(incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    # Check if vehicle exists and is available
    vehicle = await vehicle_service.get_vehicle_by_id(vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    # Assign vehicle to incident
    incident_assigned = await incident_service.assign_vehicle(incident_id, vehicle_id)
    vehicle_assigned = await vehicle_service.assign_to_incident(vehicle_id, incident_id)
    
    if not (incident_assigned and vehicle_assigned):
        raise HTTPException(status_code=500, detail="Failed to assign vehicle")
    
    # Broadcast assignment update
    background_tasks.add_task(
        websocket_service.broadcast_incident_update,
        incident_id,
        "vehicle_assigned",
        {"vehicle_id": vehicle_id, "vehicle_call_sign": vehicle.call_sign}
    )
    
    return {"message": f"Vehicle {vehicle.call_sign} assigned to incident {incident_id}"}

@router.delete("/{incident_id}/assign/{vehicle_id}")
async def unassign_vehicle_from_incident(
    incident_id: str,
    vehicle_id: str,
    background_tasks: BackgroundTasks,
    db = Depends(get_db)
):
    """Remove a vehicle assignment from an incident"""
    incident_service = IncidentService(db)
    vehicle_service = VehicleService(db)
    
    # Unassign vehicle from incident
    incident_unassigned = await incident_service.unassign_vehicle(incident_id, vehicle_id)
    vehicle_unassigned = await vehicle_service.clear_incident_assignment(vehicle_id)
    
    if not (incident_unassigned and vehicle_unassigned):
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    # Broadcast unassignment update
    background_tasks.add_task(
        websocket_service.broadcast_incident_update,
        incident_id,
        "vehicle_unassigned",
        {"vehicle_id": vehicle_id}
    )
    
    return {"message": f"Vehicle {vehicle_id} unassigned from incident {incident_id}"}

@router.put("/{incident_id}/eta")
async def update_incident_eta(
    incident_id: str,
    eta: str,
    background_tasks: BackgroundTasks,
    db = Depends(get_db)
):
    """Update estimated arrival time for an incident"""
    incident_service = IncidentService(db)
    
    updated = await incident_service.update_eta(incident_id, eta)
    if not updated:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    # Broadcast ETA update
    background_tasks.add_task(
        websocket_service.broadcast_incident_update,
        incident_id,
        "eta_updated",
        {"eta": eta}
    )
    
    return {"message": "ETA updated", "eta": eta}

@router.get("/search/{query}")
async def search_incidents(query: str, db = Depends(get_db)):
    """Search incidents by description, location, or ID"""
    incident_service = IncidentService(db)
    
    try:
        incidents = await incident_service.search_incidents(query)
        return incidents
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@router.get("/stats/summary", response_model=SystemStats)
async def get_incident_stats(db = Depends(get_db)):
    """Get incident statistics summary"""
    incident_service = IncidentService(db)
    vehicle_service = VehicleService(db)
    
    try:
        # Get incident stats
        total_incidents = await incident_service.get_incidents()
        active_incidents = await incident_service.get_active_incidents_count()
        critical_incidents = await incident_service.get_critical_incidents_count()
        
        # Get vehicle stats
        vehicle_stats = await vehicle_service.get_vehicle_stats()
        
        # Calculate average response time (mock calculation)
        import random
        avg_response_time = round(random.uniform(3.5, 6.5), 1)
        
        return SystemStats(
            total_incidents=len(total_incidents),
            active_incidents=active_incidents,
            critical_incidents=critical_incidents,
            total_vehicles=vehicle_stats.get("total", 0),
            available_vehicles=vehicle_stats.get("available", 0),
            dispatched_vehicles=vehicle_stats.get("dispatched", 0),
            on_scene_vehicles=vehicle_stats.get("on-scene", 0),
            average_response_time=avg_response_time
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get stats: {str(e)}")