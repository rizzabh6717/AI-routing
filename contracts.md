# AI-Powered Emergency Routing System - API Contracts

## Overview
This document outlines the API contracts, mock data mapping, and integration plans for the Emergency Routing System. The frontend has been implemented with comprehensive mock data and timer-based real-time simulation.

## Current Mock Data Implementation

### Mock Data Files
- `/app/frontend/src/data/mockData.js` - Contains all mock data and simulation functions

### Mock Data Categories
1. **Emergency Types** - Fire, Medical, Police, Search & Rescue, Hazmat, Traffic
2. **Priority Levels** - Critical, High, Medium, Low  
3. **Vehicle Statuses** - Available, Dispatched, On Scene, Returning, Maintenance
4. **Mock Incidents** - 3 sample incidents with full details
5. **Mock Vehicles** - 5 sample vehicles with crew, location, status
6. **Mock Routes** - Route data with alternatives and traffic conditions
7. **Mock Notifications** - Real-time system notifications

### Real-time Simulation Features
- Timer-based vehicle movement simulation (every 5 seconds)
- Dynamic ETA updates
- Random notification generation (every 30 seconds)
- Route optimization simulations

## API Contracts for Backend Integration

### Base Configuration
```
Base URL: /api
Authentication: Bearer token (future implementation)
Content-Type: application/json
```

### 1. Incidents Management

#### GET /api/incidents
Get all active incidents
```json
Response: {
  "incidents": [
    {
      "id": "INC-001",
      "type": "fire|medical|police|rescue|hazmat|traffic",
      "priority": "critical|high|medium|low",
      "location": {
        "address": "string",
        "coordinates": [latitude, longitude]
      },
      "description": "string",
      "timestamp": "ISO 8601 string",
      "status": "active|dispatched|on-scene|resolved",
      "assignedVehicles": ["vehicleId1", "vehicleId2"],
      "reportedBy": "string",
      "estimatedArrival": "string"
    }
  ]
}
```

#### POST /api/incidents
Create new incident
```json
Request: {
  "type": "string",
  "priority": "string", 
  "location": {
    "address": "string",
    "coordinates": [latitude, longitude]
  },
  "description": "string",
  "reportedBy": "string"
}

Response: {
  "incident": { /* incident object */ },
  "message": "Incident created successfully"
}
```

#### PUT /api/incidents/:id/assign
Assign vehicles to incident
```json
Request: {
  "vehicleIds": ["vehicleId1", "vehicleId2"]
}

Response: {
  "incident": { /* updated incident */ },
  "message": "Vehicles assigned successfully"
}
```

### 2. Fleet Management

#### GET /api/vehicles
Get all vehicles with current status
```json
Response: {
  "vehicles": [
    {
      "id": "FIRE-01",
      "callSign": "Engine 54",
      "type": "fire|medical|police|rescue",
      "status": "available|dispatched|on-scene|returning|maintenance",
      "location": {
        "coordinates": [latitude, longitude],
        "address": "string"
      },
      "crew": ["string"],
      "currentIncident": "incidentId or null",
      "eta": "string or null",
      "speed": "string",
      "fuel": number
    }
  ]
}
```

#### PUT /api/vehicles/:id/status
Update vehicle status
```json
Request: {
  "status": "string",
  "location": {
    "coordinates": [latitude, longitude],
    "address": "string"
  }
}

Response: {
  "vehicle": { /* updated vehicle */ },
  "message": "Vehicle status updated"
}
```

### 3. Route Optimization

#### GET /api/routes/:incidentId
Get optimized routes for incident
```json
Response: {
  "incidentId": "string",
  "routes": [
    {
      "vehicleId": "string",
      "route": [[lat, lng], [lat, lng]],
      "distance": "string",
      "duration": "string", 
      "traffic": "light|moderate|heavy",
      "alternativeRoutes": [
        {
          "name": "string",
          "distance": "string",
          "duration": "string",
          "traffic": "string"
        }
      ]
    }
  ]
}
```

#### POST /api/routes/optimize
Trigger route optimization for all active incidents
```json
Request: {
  "incidentIds": ["string"] // optional, if empty optimizes all
}

Response: {
  "optimizedRoutes": [
    {
      "incidentId": "string",
      "vehicleId": "string", 
      "newEta": "string",
      "timeSaved": "string"
    }
  ],
  "message": "Route optimization completed"
}
```

### 4. Real-time Updates (WebSocket)

#### WebSocket Connection: /api/ws
Real-time updates for:
- Vehicle location updates
- Incident status changes
- Route optimizations
- System notifications

```json
WebSocket Message Format: {
  "type": "vehicle_update|incident_update|route_update|notification",
  "data": { /* relevant data object */ },
  "timestamp": "ISO 8601 string"
}
```

### 5. Notifications

#### GET /api/notifications
Get system notifications
```json
Response: {
  "notifications": [
    {
      "id": "string",
      "type": "route-update|traffic-alert|vehicle-status",
      "message": "string",
      "timestamp": "ISO 8601 string",
      "priority": "high|medium|low",
      "read": boolean
    }
  ]
}
```

#### PUT /api/notifications/:id/read
Mark notification as read
```json
Response: {
  "message": "Notification marked as read"
}
```

## Frontend Integration Points

### Components Requiring Backend Integration

1. **Dashboard.jsx**
   - Replace `mockIncidents` and `mockVehicles` with API calls
   - Implement WebSocket connection for real-time updates
   - Remove simulation timers

2. **IncidentsList.jsx** 
   - Connect to `GET /api/incidents`
   - Add incident status update functionality

3. **VehicleTracker.jsx**
   - Connect to `GET /api/vehicles`
   - Add vehicle status update functionality

4. **MapView.jsx**
   - Connect to route optimization APIs
   - Implement real-time position updates via WebSocket

5. **QuickActions.jsx**
   - Connect incident creation to `POST /api/incidents`
   - Connect vehicle assignment to `PUT /api/incidents/:id/assign`

6. **NotificationPanel.jsx**
   - Connect to `GET /api/notifications`
   - Replace mock notification generation

### Mock Data to Replace

1. Remove `simulateVehicleMovement()` function
2. Replace all mock data imports with API service calls
3. Implement proper error handling for API failures
4. Add loading states for all components

## Implementation Priority

### Phase 1 - Core CRUD Operations
1. Incidents CRUD endpoints
2. Vehicle status management
3. Basic route optimization

### Phase 2 - Real-time Features  
1. WebSocket implementation
2. Live vehicle tracking
3. Dynamic route updates

### Phase 3 - Advanced Features
1. AI-powered route optimization
2. Predictive analytics
3. Advanced reporting

## Technical Notes

- Frontend uses timer-based simulation that can be easily replaced with WebSocket connections
- All mock data structures match the proposed API response formats
- Components are designed to be stateless and receive data via props
- Error handling and loading states need to be implemented
- Authentication system needs to be added for production use

## Testing Strategy

- Mock data provides comprehensive test scenarios
- Real-time simulation validates UI responsiveness
- Component isolation allows for easy unit testing
- API contract validation ensures smooth integration