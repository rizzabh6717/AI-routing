import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from datetime import datetime

# Load environment
load_dotenv()

async def initialize_database():
    """Initialize database with sample data"""
    mongo_url = os.environ.get('MONGO_URL')
    db_name = os.environ.get('DB_NAME', 'emergency_routing')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print(f"Connecting to database: {db_name}")
    
    # Sample incidents
    sample_incidents = [
        {
            "id": "INC-2025-001",
            "type": "fire",
            "priority": "critical",
            "location": {
                "address": "1425 Broadway, Manhattan, NY 10018",
                "coordinates": [40.7589, -73.9851],
                "district": "Midtown Manhattan"
            },
            "description": "Structure fire reported in 15-story commercial building. Multiple floors affected. Smoke visible from street level.",
            "timestamp": datetime.utcnow(),
            "status": "active",
            "assigned_vehicles": ["FD-ENGINE-54", "FD-LADDER-27"],
            "reported_by": "FDNY Dispatch",
            "estimated_arrival": "3 min",
            "last_update": datetime.utcnow()
        },
        {
            "id": "INC-2025-002",
            "type": "medical",
            "priority": "high",
            "location": {
                "address": "350 5th Ave, Manhattan, NY 10118",
                "coordinates": [40.7484, -73.9857],
                "district": "Midtown South"
            },
            "description": "Cardiac arrest reported. 67-year-old male, unconscious, CPR in progress by bystanders.",
            "timestamp": datetime.utcnow(),
            "status": "dispatched",
            "assigned_vehicles": ["EMS-AMB-15"],
            "reported_by": "911 Caller",
            "estimated_arrival": "5 min",
            "last_update": datetime.utcnow()
        }
    ]
    
    # Sample vehicles
    sample_vehicles = [
        {
            "id": "FD-ENGINE-54",
            "call_sign": "Engine 54",
            "type": "fire",
            "status": "dispatched",
            "location": {
                "coordinates": [40.7614, -73.9776],
                "address": "En route via 7th Ave",
                "district": "Midtown",
                "heading": 125
            },
            "crew": [
                {"name": "Capt. John Martinez", "role": "Captain"},
                {"name": "Lt. Sarah Wilson", "role": "Lieutenant"},
                {"name": "FF Mike Chen", "role": "Firefighter"},
                {"name": "FF Lisa Rodriguez", "role": "Firefighter"}
            ],
            "current_incident": "INC-2025-001",
            "eta": "3 min",
            "speed": 35,
            "fuel": 85,
            "equipment": ["Ladder", "Hose", "Breathing Apparatus"],
            "last_update": datetime.utcnow()
        },
        {
            "id": "EMS-AMB-15",
            "call_sign": "Ambulance 15",
            "type": "medical",
            "status": "dispatched",
            "location": {
                "coordinates": [40.7505, -73.9934],
                "address": "En route via 5th Ave",
                "district": "Midtown",
                "heading": 45
            },
            "crew": [
                {"name": "Dr. Jennifer Kim", "role": "Paramedic"},
                {"name": "EMT Tom Anderson", "role": "EMT"}
            ],
            "current_incident": "INC-2025-002",
            "eta": "5 min",
            "speed": 28,
            "fuel": 92,
            "equipment": ["Defibrillator", "Oxygen", "Advanced Life Support"],
            "last_update": datetime.utcnow()
        }
    ]
    
    try:
        # Clear existing data
        await db.incidents.delete_many({})
        await db.vehicles.delete_many({})
        
        # Insert sample data
        await db.incidents.insert_many(sample_incidents)
        await db.vehicles.insert_many(sample_vehicles)
        
        # Create indexes
        await db.incidents.create_index("id", unique=True)
        await db.vehicles.create_index("id", unique=True)
        
        print("✅ Database initialized with sample data")
        print(f"   - {len(sample_incidents)} incidents")
        print(f"   - {len(sample_vehicles)} vehicles")
        
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
    
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(initialize_database())