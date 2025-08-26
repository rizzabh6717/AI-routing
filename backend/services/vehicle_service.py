from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Optional, Dict
from datetime import datetime, timedelta

from models.emergency import (
    Vehicle, VehicleCreate, VehicleStatus, VehicleStatusUpdate,
    EmergencyType, Location
)

class VehicleService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.collection = db.vehicles

    async def create_vehicle(self, vehicle_data: VehicleCreate) -> Vehicle:
        """Create a new emergency vehicle"""
        vehicle_dict = vehicle_data.dict()
        vehicle_dict["status"] = VehicleStatus.AVAILABLE
        vehicle_dict["location"] = {
            "address": f"Station - {vehicle_data.call_sign}",
            "coordinates": [40.7589, -73.9851],  # Default NYC coordinates
            "district": "Unknown",
            "heading": 0
        }
        vehicle_dict["speed"] = 0
        vehicle_dict["fuel"] = 100
        vehicle_dict["last_update"] = datetime.utcnow()
        
        vehicle = Vehicle(**vehicle_dict)
        
        # Insert into database
        await self.collection.insert_one(vehicle.dict())
        
        return vehicle

    async def get_vehicles(
        self, 
        status: Optional[VehicleStatus] = None,
        type: Optional[EmergencyType] = None,
        limit: int = 100
    ) -> List[Vehicle]:
        """Retrieve vehicles with optional filtering"""
        filter_dict = {}
        
        if status:
            filter_dict["status"] = status
        if type:
            filter_dict["type"] = type
            
        cursor = self.collection.find(filter_dict).sort("call_sign", 1).limit(limit)
        vehicles = await cursor.to_list(length=limit)
        
        return [Vehicle(**vehicle) for vehicle in vehicles]

    async def get_vehicle_by_id(self, vehicle_id: str) -> Optional[Vehicle]:
        """Get a specific vehicle by ID"""
        vehicle_data = await self.collection.find_one({"id": vehicle_id})
        if vehicle_data:
            return Vehicle(**vehicle_data)
        return None

    async def update_vehicle_status(
        self, 
        vehicle_id: str, 
        status_update: VehicleStatusUpdate
    ) -> Optional[Vehicle]:
        """Update vehicle status and location"""
        update_data = {
            "status": status_update.status,
            "last_update": datetime.utcnow()
        }
        
        if status_update.location:
            update_data["location"] = status_update.location.dict()
            
        if status_update.incident_id:
            update_data["current_incident"] = status_update.incident_id
        elif status_update.status == VehicleStatus.AVAILABLE:
            update_data["current_incident"] = None
            update_data["eta"] = None
            
        if status_update.eta:
            update_data["eta"] = status_update.eta
            
        result = await self.collection.update_one(
            {"id": vehicle_id},
            {"$set": update_data}
        )
        
        if result.modified_count > 0:
            return await self.get_vehicle_by_id(vehicle_id)
        return None

    async def update_vehicle_location(
        self, 
        vehicle_id: str, 
        location: Location,
        speed: Optional[float] = None
    ) -> bool:
        """Update vehicle location and speed"""
        update_data = {
            "location": location.dict(),
            "last_update": datetime.utcnow()
        }
        
        if speed is not None:
            update_data["speed"] = speed
            
        result = await self.collection.update_one(
            {"id": vehicle_id},
            {"$set": update_data}
        )
        return result.modified_count > 0

    async def assign_to_incident(self, vehicle_id: str, incident_id: str) -> bool:
        """Assign vehicle to an incident"""
        result = await self.collection.update_one(
            {"id": vehicle_id},
            {
                "$set": {
                    "current_incident": incident_id,
                    "status": VehicleStatus.DISPATCHED,
                    "last_update": datetime.utcnow()
                }
            }
        )
        return result.modified_count > 0

    async def clear_incident_assignment(self, vehicle_id: str) -> bool:
        """Clear vehicle's incident assignment"""
        result = await self.collection.update_one(
            {"id": vehicle_id},
            {
                "$set": {
                    "current_incident": None,
                    "eta": None,
                    "status": VehicleStatus.AVAILABLE,
                    "last_update": datetime.utcnow()
                }
            }
        )
        return result.modified_count > 0

    async def update_fuel_level(self, vehicle_id: str, fuel_level: float) -> bool:
        """Update vehicle fuel level"""
        result = await self.collection.update_one(
            {"id": vehicle_id},
            {
                "$set": {
                    "fuel": max(0, min(100, fuel_level)),
                    "last_update": datetime.utcnow()
                }
            }
        )
        return result.modified_count > 0

    async def get_available_vehicles(self, emergency_type: Optional[EmergencyType] = None) -> List[Vehicle]:
        """Get all available vehicles, optionally filtered by type"""
        filter_dict = {"status": VehicleStatus.AVAILABLE}
        if emergency_type:
            filter_dict["type"] = emergency_type
            
        cursor = self.collection.find(filter_dict).sort("call_sign", 1)
        vehicles = await cursor.to_list(length=None)
        return [Vehicle(**vehicle) for vehicle in vehicles]

    async def get_vehicles_by_incident(self, incident_id: str) -> List[Vehicle]:
        """Get all vehicles assigned to an incident"""
        cursor = self.collection.find({"current_incident": incident_id})
        vehicles = await cursor.to_list(length=None)
        return [Vehicle(**vehicle) for vehicle in vehicles]

    async def get_vehicle_stats(self) -> Dict[str, int]:
        """Get vehicle statistics"""
        pipeline = [
            {
                "$group": {
                    "_id": "$status",
                    "count": {"$sum": 1}
                }
            }
        ]
        
        result = await self.collection.aggregate(pipeline).to_list(length=None)
        stats = {item["_id"]: item["count"] for item in result}
        
        # Ensure all statuses are represented
        all_statuses = [status.value for status in VehicleStatus]
        for status in all_statuses:
            if status not in stats:
                stats[status] = 0
                
        stats["total"] = sum(stats.values())
        return stats

    async def get_vehicles_needing_maintenance(self) -> List[Vehicle]:
        """Get vehicles that need maintenance"""
        # Find vehicles with low fuel or overdue maintenance
        filter_dict = {
            "$or": [
                {"fuel": {"$lt": 25}},
                {"maintenance_due": {"$lt": datetime.utcnow()}},
                {"status": VehicleStatus.MAINTENANCE}
            ]
        }
        
        cursor = self.collection.find(filter_dict)
        vehicles = await cursor.to_list(length=None)
        return [Vehicle(**vehicle) for vehicle in vehicles]

    async def search_vehicles(self, query: str) -> List[Vehicle]:
        """Search vehicles by call sign, ID, or crew names"""
        search_filter = {
            "$or": [
                {"id": {"$regex": query, "$options": "i"}},
                {"call_sign": {"$regex": query, "$options": "i"}},
                {"crew.name": {"$regex": query, "$options": "i"}}
            ]
        }
        
        cursor = self.collection.find(search_filter).sort("call_sign", 1)
        vehicles = await cursor.to_list(length=20)
        return [Vehicle(**vehicle) for vehicle in vehicles]