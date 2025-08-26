from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from typing import List, Optional
from datetime import datetime

from models.emergency import (
    Vehicle, VehicleCreate, VehicleStatus, VehicleStatusUpdate,
    EmergencyType, Location
)
from services.vehicle_service import VehicleService
from services.websocket_service import websocket_service
from dependencies import get_db

router = APIRouter(prefix="/vehicles", tags=["vehicles"])

@router.post("/", response_model=Vehicle)
async def create_vehicle(
    vehicle_data: VehicleCreate,
    background_tasks: BackgroundTasks,
    db = Depends(get_db)
):
    """Create a new emergency vehicle"""
    vehicle_service = VehicleService(db)
    
    try:
        vehicle = await vehicle_service.create_vehicle(vehicle_data)
        
        # Broadcast vehicle creation
        background_tasks.add_task(
            websocket_service.broadcast_notification,
            {
                "id": f"N{int(datetime.utcnow().timestamp())}",
                "type": "vehicle-status",
                "message": f"New vehicle added to fleet: {vehicle.call_sign}",
                "priority": "low",
                "vehicle_id": vehicle.id
            }
        )
        
        return vehicle
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create vehicle: {str(e)}")

@router.get("/", response_model=List[Vehicle])
async def get_vehicles(
    status: Optional[VehicleStatus] = None,
    type: Optional[EmergencyType] = None,
    limit: int = 100,
    db = Depends(get_db)
):
    """Retrieve vehicles with optional filtering"""
    vehicle_service = VehicleService(db)
    
    try:
        vehicles = await vehicle_service.get_vehicles(
            status=status, type=type, limit=limit
        )
        return vehicles
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve vehicles: {str(e)}")

@router.get("/{vehicle_id}", response_model=Vehicle)
async def get_vehicle(vehicle_id: str, db = Depends(get_db)):
    """Get a specific vehicle by ID"""
    vehicle_service = VehicleService(db)
    
    vehicle = await vehicle_service.get_vehicle_by_id(vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    return vehicle

@router.put("/{vehicle_id}/status")
async def update_vehicle_status(
    vehicle_id: str,
    status_update: VehicleStatusUpdate,
    background_tasks: BackgroundTasks,
    db = Depends(get_db)
):
    """Update vehicle status and location"""
    vehicle_service = VehicleService(db)
    
    vehicle = await vehicle_service.update_vehicle_status(vehicle_id, status_update)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    # Broadcast location update if location changed
    if status_update.location:
        background_tasks.add_task(
            websocket_service.broadcast_vehicle_update,
            vehicle_id,
            {
                "coordinates": status_update.location.coordinates,
                "heading": status_update.location.heading or 0,
                "speed": vehicle.speed,
                "status": status_update.status
            }
        )
    
    return {"message": "Vehicle status updated", "vehicle": vehicle}

@router.put("/{vehicle_id}/location")
async def update_vehicle_location(
    vehicle_id: str,
    location: Location,
    speed: Optional[float] = None,
    background_tasks: BackgroundTasks = None,
    db = Depends(get_db)
):
    """Update vehicle location and speed"""
    vehicle_service = VehicleService(db)
    
    updated = await vehicle_service.update_vehicle_location(vehicle_id, location, speed)
    if not updated:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    # Broadcast location update
    if background_tasks:
        background_tasks.add_task(
            websocket_service.broadcast_vehicle_update,
            vehicle_id,
            {
                "coordinates": location.coordinates,
                "heading": location.heading or 0,
                "speed": speed or 0
            }
        )
    
    return {"message": "Vehicle location updated"}

@router.put("/{vehicle_id}/fuel")
async def update_vehicle_fuel(
    vehicle_id: str,
    fuel_level: float,
    background_tasks: BackgroundTasks,
    db = Depends(get_db)
):
    """Update vehicle fuel level"""
    vehicle_service = VehicleService(db)
    
    if not (0 <= fuel_level <= 100):
        raise HTTPException(status_code=400, detail="Fuel level must be between 0 and 100")
    
    updated = await vehicle_service.update_fuel_level(vehicle_id, fuel_level)
    if not updated:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    # Send low fuel warning if needed
    if fuel_level < 25:
        background_tasks.add_task(
            websocket_service.broadcast_notification,
            {
                "id": f"N{int(datetime.utcnow().timestamp())}",
                "type": "vehicle-status",
                "message": f"Low fuel warning for vehicle {vehicle_id}: {fuel_level}%",
                "priority": "medium",
                "vehicle_id": vehicle_id
            }
        )
    
    return {"message": "Fuel level updated", "fuel_level": fuel_level}

@router.get("/available/{emergency_type}")
async def get_available_vehicles_by_type(
    emergency_type: EmergencyType,
    db = Depends(get_db)
):
    """Get available vehicles of a specific type"""
    vehicle_service = VehicleService(db)
    
    try:
        vehicles = await vehicle_service.get_available_vehicles(emergency_type)
        return vehicles
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get available vehicles: {str(e)}")

@router.get("/incident/{incident_id}")
async def get_vehicles_by_incident(incident_id: str, db = Depends(get_db)):
    """Get all vehicles assigned to an incident"""
    vehicle_service = VehicleService(db)
    
    try:
        vehicles = await vehicle_service.get_vehicles_by_incident(incident_id)
        return vehicles
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get vehicles for incident: {str(e)}")

@router.get("/stats/summary")
async def get_vehicle_stats(db = Depends(get_db)):
    """Get vehicle fleet statistics"""
    vehicle_service = VehicleService(db)
    
    try:
        stats = await vehicle_service.get_vehicle_stats()
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get vehicle stats: {str(e)}")

@router.get("/maintenance/needed")
async def get_vehicles_needing_maintenance(db = Depends(get_db)):
    """Get vehicles that need maintenance"""
    vehicle_service = VehicleService(db)
    
    try:
        vehicles = await vehicle_service.get_vehicles_needing_maintenance()
        return vehicles
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get maintenance info: {str(e)}")

@router.get("/search/{query}")
async def search_vehicles(query: str, db = Depends(get_db)):
    """Search vehicles by call sign, ID, or crew names"""
    vehicle_service = VehicleService(db)
    
    try:
        vehicles = await vehicle_service.search_vehicles(query)
        return vehicles
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")