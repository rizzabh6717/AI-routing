import asyncio
import random
import math
from typing import List, Dict, Optional, Tuple
from datetime import datetime

from models.emergency import (
    VehicleRoute, RouteAlternative, RouteOptimization,
    Location, Vehicle, Incident
)

class RouteService:
    def __init__(self):
        # NYC coordinate bounds
        self.nyc_bounds = {
            "north": 40.820,
            "south": 40.680,
            "east": -73.930,
            "west": -74.020
        }
        
    def calculate_distance(self, coord1: List[float], coord2: List[float]) -> float:
        """Calculate distance between two coordinates in meters using Haversine formula"""
        lat1, lon1 = math.radians(coord1[0]), math.radians(coord1[1])
        lat2, lon2 = math.radians(coord2[0]), math.radians(coord2[1])
        
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        
        a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
        c = 2 * math.asin(math.sqrt(a))
        
        # Earth's radius in meters
        r = 6371000
        return c * r

    def estimate_travel_time(self, distance_meters: float, traffic_factor: float = 1.0) -> int:
        """Estimate travel time in seconds based on distance and traffic"""
        # Average emergency vehicle speed in NYC: 25 mph = 11.18 m/s
        base_speed = 11.18  # meters per second
        
        # Adjust for traffic conditions
        adjusted_speed = base_speed / traffic_factor
        
        return int(distance_meters / adjusted_speed)

    def get_traffic_factor(self, hour: int = None) -> float:
        """Get traffic factor based on time of day"""
        if hour is None:
            hour = datetime.now().hour
            
        # Traffic patterns in NYC
        if 7 <= hour <= 9 or 17 <= hour <= 19:  # Rush hours
            return 2.0  # Heavy traffic
        elif 10 <= hour <= 16:  # Daytime
            return 1.5  # Moderate traffic
        elif 6 <= hour <= 22:  # Regular hours
            return 1.2  # Light traffic
        else:  # Night hours
            return 1.0  # Minimal traffic

    def generate_route_points(self, start: List[float], end: List[float], num_points: int = 5) -> List[List[float]]:
        """Generate intermediate route points between start and end coordinates"""
        route_points = [start]
        
        for i in range(1, num_points - 1):
            progress = i / (num_points - 1)
            
            # Linear interpolation with some randomness for realistic routing
            lat = start[0] + (end[0] - start[0]) * progress + random.uniform(-0.001, 0.001)
            lon = start[1] + (end[1] - start[1]) * progress + random.uniform(-0.001, 0.001)
            
            route_points.append([lat, lon])
            
        route_points.append(end)
        return route_points

    async def calculate_route(
        self, 
        vehicle: Vehicle, 
        incident: Incident,
        avoid_traffic: bool = True
    ) -> VehicleRoute:
        """Calculate optimal route for a vehicle to an incident"""
        start_coords = vehicle.location.coordinates
        end_coords = incident.location.coordinates
        
        # Calculate base route
        route_points = self.generate_route_points(start_coords, end_coords)
        distance = self.calculate_distance(start_coords, end_coords)
        
        # Get traffic conditions
        traffic_factor = self.get_traffic_factor()
        duration = self.estimate_travel_time(distance, traffic_factor)
        
        # Determine traffic level
        if traffic_factor >= 1.8:
            traffic_level = "heavy"
        elif traffic_factor >= 1.3:
            traffic_level = "moderate"
        else:
            traffic_level = "light"
        
        # Generate alternative routes
        alternatives = await self.generate_alternatives(start_coords, end_coords, distance, duration)
        
        return VehicleRoute(
            vehicle_id=vehicle.id,
            route=route_points,
            distance=distance,
            duration=duration,
            traffic=traffic_level,
            alternatives=alternatives
        )

    async def generate_alternatives(
        self, 
        start: List[float], 
        end: List[float], 
        base_distance: float, 
        base_duration: int
    ) -> List[RouteAlternative]:
        """Generate alternative route options"""
        alternatives = []
        
        # Alternative 1: Highway route (faster but longer)
        highway_distance = base_distance * 1.2
        highway_duration = int(base_duration * 0.8)
        alternatives.append(RouteAlternative(
            name="Via Highway",
            distance=highway_distance,
            duration=highway_duration,
            traffic="light"
        ))
        
        # Alternative 2: Surface streets (shorter but slower)
        surface_distance = base_distance * 0.9
        surface_duration = int(base_duration * 1.3)
        alternatives.append(RouteAlternative(
            name="Via Surface Streets",
            distance=surface_distance,
            duration=surface_duration,
            traffic="moderate"
        ))
        
        # Alternative 3: Emergency corridor (if available)
        if random.random() > 0.5:  # 50% chance emergency corridor is available
            corridor_distance = base_distance * 1.1
            corridor_duration = int(base_duration * 0.6)
            alternatives.append(RouteAlternative(
                name="Emergency Corridor",
                distance=corridor_distance,
                duration=corridor_duration,
                traffic="light"
            ))
        
        return alternatives

    async def optimize_routes_for_incident(self, incident: Incident, vehicles: List[Vehicle]) -> RouteOptimization:
        """Optimize routes for all vehicles responding to an incident"""
        vehicle_routes = {}
        
        for vehicle in vehicles:
            if vehicle.status in ["dispatched", "on-scene"] and vehicle.current_incident == incident.id:
                route = await self.calculate_route(vehicle, incident)
                vehicle_routes[vehicle.id] = route
        
        # Create optimization history entry
        optimization_history = [{
            "timestamp": datetime.utcnow(),
            "action": "Routes optimized based on current traffic conditions",
            "vehicles_affected": len(vehicle_routes),
            "estimated_time_saved": random.randint(30, 180)  # Random time saved in seconds
        }]
        
        return RouteOptimization(
            incident_id=incident.id,
            vehicle_routes=vehicle_routes,
            optimization_history=optimization_history
        )

    async def recalculate_eta(self, vehicle: Vehicle, incident: Incident) -> str:
        """Recalculate ETA for a vehicle to an incident"""
        route = await self.calculate_route(vehicle, incident)
        
        # Convert duration to human-readable format
        minutes = route.duration // 60
        seconds = route.duration % 60
        
        if minutes > 0:
            return f"{minutes}m {seconds}s" if seconds > 0 else f"{minutes}m"
        else:
            return f"{seconds}s"

    async def find_nearest_available_vehicles(
        self, 
        incident: Incident, 
        available_vehicles: List[Vehicle],
        max_distance_km: float = 10.0
    ) -> List[Tuple[Vehicle, float]]:
        """Find nearest available vehicles to an incident"""
        incident_coords = incident.location.coordinates
        vehicle_distances = []
        
        for vehicle in available_vehicles:
            if vehicle.type == incident.type or incident.priority == "critical":
                distance = self.calculate_distance(vehicle.location.coordinates, incident_coords)
                
                # Only include vehicles within max distance
                if distance <= max_distance_km * 1000:  # Convert km to meters
                    vehicle_distances.append((vehicle, distance))
        
        # Sort by distance
        vehicle_distances.sort(key=lambda x: x[1])
        
        return vehicle_distances[:5]  # Return top 5 nearest vehicles

    async def simulate_traffic_update(self, area: str) -> Dict[str, any]:
        """Simulate a traffic condition update"""
        severity_options = ["light", "moderate", "heavy"]
        severity = random.choice(severity_options)
        
        descriptions = {
            "light": f"Traffic flowing smoothly in {area}",
            "moderate": f"Moderate congestion reported in {area}",
            "heavy": f"Heavy traffic delays in {area} - alternative routes recommended"
        }
        
        return {
            "area": area,
            "severity": severity,
            "description": descriptions[severity],
            "timestamp": datetime.utcnow(),
            "estimated_delay": random.randint(2, 15) if severity != "light" else 0
        }

    def format_eta_display(self, duration_seconds: int) -> str:
        """Format duration in seconds to display format"""
        if duration_seconds < 60:
            return f"{duration_seconds}s"
        
        minutes = duration_seconds // 60
        seconds = duration_seconds % 60
        
        if minutes < 60:
            return f"{minutes}m" if seconds == 0 else f"{minutes}m {seconds}s"
        
        hours = minutes // 60
        minutes = minutes % 60
        
        return f"{hours}h {minutes}m" if minutes > 0 else f"{hours}h"