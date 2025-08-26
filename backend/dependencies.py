from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

# Global database client
client = None
database = None

async def get_database():
    """Get database instance"""
    global client, database
    
    if client is None:
        mongo_url = os.environ.get('MONGO_URL')
        db_name = os.environ.get('DB_NAME', 'emergency_routing')
        
        client = AsyncIOMotorClient(mongo_url)
        database = client[db_name]
        
        # Create indexes for better performance
        await create_indexes()
    
    return database

async def create_indexes():
    """Create database indexes for better query performance"""
    if database is None:
        return
        
    # Incident indexes
    await database.incidents.create_index("id", unique=True)
    await database.incidents.create_index("status")
    await database.incidents.create_index("type")
    await database.incidents.create_index("priority")
    await database.incidents.create_index("timestamp")
    await database.incidents.create_index([("location.coordinates", "2dsphere")])
    
    # Vehicle indexes
    await database.vehicles.create_index("id", unique=True)
    await database.vehicles.create_index("status")
    await database.vehicles.create_index("type")
    await database.vehicles.create_index("current_incident")
    await database.vehicles.create_index([("location.coordinates", "2dsphere")])
    
    # Notification indexes
    await database.notifications.create_index("timestamp")
    await database.notifications.create_index("read")
    await database.notifications.create_index("priority")

def get_db():
    """Dependency to get database in route handlers"""
    return get_database()