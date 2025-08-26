from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Optional
from datetime import datetime
import uuid

from models.emergency import (
    Incident, IncidentCreate, IncidentStatus, 
    EmergencyType, Priority
)

class IncidentService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.collection = db.incidents

    async def create_incident(self, incident_data: IncidentCreate) -> Incident:
        """Create a new emergency incident"""
        incident_dict = incident_data.dict()
        incident_dict["id"] = f"INC-{datetime.utcnow().strftime('%Y')}-{str(uuid.uuid4())[:8].upper()}"
        incident_dict["timestamp"] = datetime.utcnow()
        incident_dict["last_update"] = datetime.utcnow()
        incident_dict["status"] = IncidentStatus.ACTIVE
        incident_dict["assigned_vehicles"] = []
        incident_dict["estimated_arrival"] = "Calculating..."
        
        incident = Incident(**incident_dict)
        
        # Insert into database
        await self.collection.insert_one(incident.dict())
        
        return incident

    async def get_incidents(
        self, 
        status: Optional[IncidentStatus] = None,
        type: Optional[EmergencyType] = None,
        priority: Optional[Priority] = None,
        limit: int = 100
    ) -> List[Incident]:
        """Retrieve incidents with optional filtering"""
        filter_dict = {}
        
        if status:
            filter_dict["status"] = status
        if type:
            filter_dict["type"] = type
        if priority:
            filter_dict["priority"] = priority
            
        cursor = self.collection.find(filter_dict).sort("timestamp", -1).limit(limit)
        incidents = await cursor.to_list(length=limit)
        
        return [Incident(**incident) for incident in incidents]

    async def get_incident_by_id(self, incident_id: str) -> Optional[Incident]:
        """Get a specific incident by ID"""
        incident_data = await self.collection.find_one({"id": incident_id})
        if incident_data:
            return Incident(**incident_data)
        return None

    async def update_incident_status(
        self, 
        incident_id: str, 
        status: IncidentStatus,
        notes: Optional[str] = None
    ) -> Optional[Incident]:
        """Update incident status"""
        update_data = {
            "status": status,
            "last_update": datetime.utcnow()
        }
        
        if status == IncidentStatus.RESOLVED:
            update_data["resolved_at"] = datetime.utcnow()
            
        if notes:
            update_data["notes"] = notes
            
        result = await self.collection.update_one(
            {"id": incident_id},
            {"$set": update_data}
        )
        
        if result.modified_count > 0:
            return await self.get_incident_by_id(incident_id)
        return None

    async def assign_vehicle(self, incident_id: str, vehicle_id: str) -> bool:
        """Assign a vehicle to an incident"""
        result = await self.collection.update_one(
            {"id": incident_id},
            {
                "$addToSet": {"assigned_vehicles": vehicle_id},
                "$set": {"last_update": datetime.utcnow()}
            }
        )
        return result.modified_count > 0

    async def unassign_vehicle(self, incident_id: str, vehicle_id: str) -> bool:
        """Remove a vehicle from an incident"""
        result = await self.collection.update_one(
            {"id": incident_id},
            {
                "$pull": {"assigned_vehicles": vehicle_id},
                "$set": {"last_update": datetime.utcnow()}
            }
        )
        return result.modified_count > 0

    async def update_eta(self, incident_id: str, eta: str) -> bool:
        """Update estimated arrival time for an incident"""
        result = await self.collection.update_one(
            {"id": incident_id},
            {
                "$set": {
                    "estimated_arrival": eta,
                    "last_update": datetime.utcnow()
                }
            }
        )
        return result.modified_count > 0

    async def get_active_incidents_count(self) -> int:
        """Get count of active incidents"""
        return await self.collection.count_documents({
            "status": {"$in": [IncidentStatus.ACTIVE, IncidentStatus.DISPATCHED, IncidentStatus.ON_SCENE]}
        })

    async def get_critical_incidents_count(self) -> int:
        """Get count of critical priority incidents"""
        return await self.collection.count_documents({
            "priority": Priority.CRITICAL,
            "status": {"$ne": IncidentStatus.RESOLVED}
        })

    async def get_incidents_by_type(self, emergency_type: EmergencyType) -> List[Incident]:
        """Get all incidents of a specific type"""
        cursor = self.collection.find({"type": emergency_type}).sort("timestamp", -1)
        incidents = await cursor.to_list(length=None)
        return [Incident(**incident) for incident in incidents]

    async def search_incidents(self, query: str) -> List[Incident]:
        """Search incidents by description, location, or ID"""
        search_filter = {
            "$or": [
                {"id": {"$regex": query, "$options": "i"}},
                {"description": {"$regex": query, "$options": "i"}},
                {"location.address": {"$regex": query, "$options": "i"}},
                {"location.district": {"$regex": query, "$options": "i"}}
            ]
        }
        
        cursor = self.collection.find(search_filter).sort("timestamp", -1)
        incidents = await cursor.to_list(length=50)
        return [Incident(**incident) for incident in incidents]