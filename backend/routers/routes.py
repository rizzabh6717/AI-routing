from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from typing import List, Optional

from models.emergency import RouteOptimization, VehicleRoute
from services.route_service import RouteService
from services.incident_service import IncidentService
from services.vehicle_service import VehicleService
from services.websocket_service import websocket_service
from dependencies import get_db

router = APIRouter(prefix="/routes", tags=["routes"])

@router.get("/{incident_id}", response_model=RouteOptimization)
async def get_routes_for_incident(incident_id: str, db = Depends(get_db)):
    """Get optimized routes for all vehicles responding to an incident"""
    route_service = RouteService()
    incident_service = IncidentService(db)
    vehicle_service = VehicleService(db)
    
    # Get incident details
    incident = await incident_service.get_incident_by_id(incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    # Get vehicles assigned to this incident
    vehicles = await vehicle_service.get_vehicles_by_incident(incident_id)
    
    try:
        route_optimization = await route_service.optimize_routes_for_incident(incident, vehicles)
        return route_optimization
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get routes: {str(e)}")

@router.post("/optimize")
async def optimize_routes(
    incident_ids: Optional[List[str]] = None,
    background_tasks: BackgroundTasks = None,
    db = Depends(get_db)
):
    """Trigger route optimization for specified incidents or all active incidents"""
    route_service = RouteService()
    incident_service = IncidentService(db)
    vehicle_service = VehicleService(db)
    
    try:
        # If no specific incidents, get all active ones
        if not incident_ids:
            incidents = await incident_service.get_incidents(limit=50)
            active_incidents = [i for i in incidents if i.status in ["active", "dispatched"]]
        else:
            active_incidents = []
            for incident_id in incident_ids:
                incident = await incident_service.get_incident_by_id(incident_id)
                if incident:
                    active_incidents.append(incident)
        
        optimized_routes = []
        total_time_saved = 0
        
        for incident in active_incidents:
            vehicles = await vehicle_service.get_vehicles_by_incident(incident.id)
            if vehicles:
                route_optimization = await route_service.optimize_routes_for_incident(incident, vehicles)
                
                # Process each vehicle route
                for vehicle_id, vehicle_route in route_optimization.vehicle_routes.items():
                    # Calculate new ETA
                    new_eta = route_service.format_eta_display(vehicle_route.duration)
                    
                    # Update vehicle ETA
                    await vehicle_service.update_vehicle_status(
                        vehicle_id,
                        type('StatusUpdate', (), {'status': 'dispatched', 'eta': new_eta, 'location': None, 'incident_id': None})()
                    )
                    
                    # Update incident ETA
                    await incident_service.update_eta(incident.id, new_eta)
                    
                    # Simulate time saved (random between 30-180 seconds)
                    import random
                    time_saved = random.randint(30, 180)
                    total_time_saved += time_saved
                    
                    optimized_routes.append({
                        "incident_id": incident.id,
                        "vehicle_id": vehicle_id,
                        "new_eta": new_eta,
                        "time_saved": time_saved,
                        "route": vehicle_route.route
                    })
                    
                    # Broadcast route optimization update
                    if background_tasks:
                        background_tasks.add_task(
                            websocket_service.broadcast_route_optimization,
                            incident.id,
                            vehicle_id,
                            {
                                "new_eta": new_eta,
                                "time_saved": time_saved,
                                "route": vehicle_route.route
                            }
                        )
        
        # Broadcast overall optimization notification
        if background_tasks and optimized_routes:
            background_tasks.add_task(
                websocket_service.broadcast_notification,
                {
                    "id": f"N{int(datetime.utcnow().timestamp())}",
                    "type": "route-update",
                    "message": f"Route optimization completed - {len(optimized_routes)} routes updated, {total_time_saved//60}m {total_time_saved%60}s total time saved",
                    "priority": "high"
                }
            )
        
        return {
            "optimized_routes": optimized_routes,
            "total_time_saved": total_time_saved,
            "message": f"Route optimization completed for {len(active_incidents)} incidents"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Route optimization failed: {str(e)}")

@router.get("/vehicle/{vehicle_id}/current")
async def get_current_route(vehicle_id: str, db = Depends(get_db)):
    """Get current route for a specific vehicle"""
    route_service = RouteService()
    vehicle_service = VehicleService(db)
    incident_service = IncidentService(db)
    
    # Get vehicle details
    vehicle = await vehicle_service.get_vehicle_by_id(vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    # Check if vehicle has an assigned incident
    if not vehicle.current_incident:
        return {"message": "Vehicle has no active route", "route": None}
    
    # Get incident details
    incident = await incident_service.get_incident_by_id(vehicle.current_incident)
    if not incident:
        raise HTTPException(status_code=404, detail="Associated incident not found")
    
    try:
        # Calculate current route
        vehicle_route = await route_service.calculate_route(vehicle, incident)
        return {
            "vehicle_id": vehicle_id,
            "incident_id": incident.id,
            "route": vehicle_route,
            "current_location": vehicle.location.coordinates,
            "destination": incident.location.coordinates
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get current route: {str(e)}")

@router.post("/recalculate/{vehicle_id}")
async def recalculate_vehicle_route(
    vehicle_id: str,
    background_tasks: BackgroundTasks,
    db = Depends(get_db)
):
    """Recalculate route for a specific vehicle"""
    route_service = RouteService()
    vehicle_service = VehicleService(db)
    incident_service = IncidentService(db)
    
    # Get vehicle details
    vehicle = await vehicle_service.get_vehicle_by_id(vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    if not vehicle.current_incident:
        raise HTTPException(status_code=400, detail="Vehicle has no active incident")
    
    # Get incident details
    incident = await incident_service.get_incident_by_id(vehicle.current_incident)
    if not incident:
        raise HTTPException(status_code=404, detail="Associated incident not found")
    
    try:
        # Recalculate route and ETA
        new_eta = await route_service.recalculate_eta(vehicle, incident)
        
        # Update vehicle ETA
        await vehicle_service.update_vehicle_status(
            vehicle_id,
            type('StatusUpdate', (), {'status': vehicle.status, 'eta': new_eta, 'location': None, 'incident_id': None})()
        )
        
        # Update incident ETA
        await incident_service.update_eta(incident.id, new_eta)
        
        # Broadcast route update
        background_tasks.add_task(
            websocket_service.broadcast_route_optimization,
            incident.id,
            vehicle_id,
            {
                "new_eta": new_eta,
                "recalculated": True
            }
        )
        
        return {
            "message": "Route recalculated successfully",
            "vehicle_id": vehicle_id,
            "new_eta": new_eta
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to recalculate route: {str(e)}")

@router.get("/traffic/simulation")
async def simulate_traffic_conditions(
    area: str = "Manhattan Midtown",
    background_tasks: BackgroundTasks = None
):
    """Simulate traffic condition updates for testing"""
    route_service = RouteService()
    
    try:
        traffic_update = await route_service.simulate_traffic_update(area)
        
        # Broadcast traffic update
        if background_tasks:
            background_tasks.add_task(
                websocket_service.broadcast_traffic_update,
                traffic_update["area"],
                traffic_update["severity"],
                traffic_update["description"]
            )
        
        return traffic_update
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to simulate traffic: {str(e)}")

@router.get("/nearest/{incident_id}")
async def find_nearest_vehicles(
    incident_id: str,
    max_distance_km: float = 10.0,
    db = Depends(get_db)
):
    """Find nearest available vehicles to an incident"""
    route_service = RouteService()
    incident_service = IncidentService(db)
    vehicle_service = VehicleService(db)
    
    # Get incident details
    incident = await incident_service.get_incident_by_id(incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    # Get available vehicles
    available_vehicles = await vehicle_service.get_available_vehicles()
    
    try:
        nearest_vehicles = await route_service.find_nearest_available_vehicles(
            incident, available_vehicles, max_distance_km
        )
        
        # Format response with distance information
        result = []
        for vehicle, distance in nearest_vehicles:
            result.append({
                "vehicle": vehicle,
                "distance_meters": distance,
                "distance_km": round(distance / 1000, 2),
                "estimated_eta": route_service.format_eta_display(
                    route_service.estimate_travel_time(distance)
                )
            })
        
        return {
            "incident_id": incident_id,
            "nearest_vehicles": result,
            "total_found": len(result)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to find nearest vehicles: {str(e)}")