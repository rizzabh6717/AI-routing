# AI-Powered Emergency Routing System - API Contracts & Integration Guide

## Overview
This document outlines the complete API contracts, WebSocket patterns, and integration specifications for the Emergency Routing System. The frontend has been implemented with comprehensive mock data, WebSocket simulation, and OpenStreetMap integration.

## System Architecture

### Frontend Technologies
- **React 18** - Main UI framework
- **Leaflet + React-Leaflet** - OpenStreetMap integration
- **Tailwind CSS + Shadcn/UI** - Styling system inspired by dimension.dev
- **WebSocket Simulation** - Real-time updates pattern
- **Mock Service Layer** - API-ready data structures

### Design Principles (dimension.dev inspired)
- Dark theme with precision tooling aesthetics
- Developer-focused navigation and information density
- Smooth transitions and micro-interactions
- Professional emergency service color coding
- Desktop-first responsive design

## Mock Data Implementation

### Emergency Service Types
```javascript
{
  fire: { label: 'Fire Department', color: '#dc2626', icon: '🔥', code: 'FD' },
  medical: { label: 'Medical Emergency', color: '#059669', icon: '🚑', code: 'EMS' },
  police: { label: 'Police', color: '#2563eb', icon: '👮', code: 'PD' },
  rescue: { label: 'Search & Rescue', color: '#d97706', icon: '⛑️', code: 'SAR' },
  hazmat: { label: 'Hazmat Response', color: '#7c3aed', icon: '☢️', code: 'HMT' },
  traffic: { label: 'Traffic Control', color: '#0891b2', icon: '🚧', code: 'TC' },
  marine: { label: 'Marine Rescue', color: '#0d9488', icon: '🚤', code: 'MR' }
}
```

### WebSocket Simulation Features
- **Connection Management**: Auto-reconnection with exponential backoff
- **Real-time Updates**: Vehicle location, route optimization, incident status
- **Event Types**: `vehicle_location`, `route_optimization`, `incident_status`, `traffic_update`, `new_notification`
- **Update Frequency**: 3-8 second intervals with realistic data changes

## API Contracts for Backend Integration

### Base Configuration
```
Base URL: /api
WebSocket: ws://[domain]/api/ws
Authentication: Bearer token (future)
Content-Type: application/json
```

### 1. Incident Management

#### GET /api/incidents
```json
Response: {
  "incidents": [
    {
      "id": "INC-2025-001",
      "type": "fire|medical|police|rescue|hazmat|traffic|marine",
      "priority": "critical|high|medium|low",
      "location": {
        "address": "string",
        "coordinates": [latitude, longitude],
        "district": "string"
      },
      "description": "string",
      "timestamp": "ISO 8601",
      "status": "active|dispatched|on-scene|resolved",
      "assignedVehicles": ["vehicleId1", "vehicleId2"],
      "reportedBy": "string",
      "estimatedArrival": "string",
      "lastUpdate": "ISO 8601"
    }
  ],
  "total": "number",
  "active": "number",
  "critical": "number"
}
```

#### POST /api/incidents
```json
Request: {
  "type": "string",
  "priority": "string",
  "location": {
    "address": "string",
    "coordinates": [latitude, longitude],
    "district": "string"
  },
  "description": "string",
  "reportedBy": "string"
}

Response: {
  "incident": { /* full incident object */ },
  "message": "Incident created successfully",
  "incidentId": "string"
}
```

### 2. Fleet Management

#### GET /api/vehicles
```json
Response: {
  "vehicles": [
    {
      "id": "FD-ENGINE-54",
      "callSign": "Engine 54",
      "type": "fire|medical|police|rescue|hazmat|traffic|marine",
      "status": "available|dispatched|on-scene|returning|maintenance|offline",
      "location": {
        "coordinates": [latitude, longitude],
        "address": "string",
        "heading": "number (0-360)"
      },
      "crew": [
        {
          "name": "string",
          "role": "string"
        }
      ],
      "currentIncident": "incidentId or null",
      "eta": "string or null",
      "speed": "number",
      "fuel": "number (0-100)",
      "equipment": ["string"],
      "lastUpdate": "ISO 8601"
    }
  ],
  "summary": {
    "total": "number",
    "available": "number",
    "dispatched": "number",
    "onScene": "number",
    "maintenance": "number"
  }
}
```

#### PUT /api/vehicles/:id/status
```json
Request: {
  "status": "string",
  "location": {
    "coordinates": [latitude, longitude],
    "address": "string",
    "heading": "number"
  },
  "incidentId": "string or null"
}

Response: {
  "vehicle": { /* updated vehicle object */ },
  "message": "Vehicle status updated"
}
```

### 3. Route Optimization & AI Engine

#### GET /api/routes/:incidentId
```json
Response: {
  "incidentId": "string",
  "vehicleRoutes": {
    "vehicleId": {
      "route": [[lat, lng], [lat, lng]...],
      "distance": "number (meters)",
      "duration": "number (seconds)",
      "traffic": "light|moderate|heavy",
      "alternatives": [
        {
          "name": "string",
          "distance": "number",
          "duration": "number",
          "traffic": "string"
        }
      ]
    }
  },
  "optimizationHistory": [
    {
      "timestamp": "ISO 8601",
      "action": "string",
      "timeSaved": "number (seconds)"
    }
  ]
}
```

#### POST /api/routes/optimize
```json
Request: {
  "incidentIds": ["string"], // optional, if empty optimizes all
  "priority": "emergency|routine",
  "constraints": {
    "avoidTolls": "boolean",
    "avoidHighways": "boolean",
    "considerTraffic": "boolean"
  }
}

Response: {
  "optimizedRoutes": [
    {
      "incidentId": "string",
      "vehicleId": "string",
      "newEta": "string",
      "timeSaved": "number",
      "route": [[lat, lng]...]
    }
  ],
  "totalTimeSaved": "number",
  "message": "Route optimization completed"
}
```

### 4. Real-time WebSocket Events

#### Connection Management
```javascript
// Connection establishment
ws://domain/api/ws?token=bearer_token

// Connection events
{
  "type": "connection",
  "status": "connected|disconnected",
  "timestamp": "ISO 8601"
}
```

#### Vehicle Location Updates
```json
{
  "type": "vehicle_location",
  "timestamp": "ISO 8601",
  "data": {
    "vehicleId": "string",
    "location": {
      "coordinates": [latitude, longitude],
      "heading": "number",
      "speed": "number"
    },
    "status": "string"
  }
}
```

#### Route Optimization Updates
```json
{
  "type": "route_optimization",
  "timestamp": "ISO 8601",
  "data": {
    "incidentId": "string",
    "vehicleId": "string",
    "newEta": "string",
    "timeSaved": "number",
    "route": [[lat, lng]...],
    "reason": "traffic_cleared|new_incident|manual_override"
  }
}
```

#### Incident Status Updates
```json
{
  "type": "incident_status",
  "timestamp": "ISO 8601",
  "data": {
    "incidentId": "string",
    "status": "string",
    "assignedVehicles": ["string"],
    "estimatedArrival": "string"
  }
}
```

#### Traffic & System Alerts
```json
{
  "type": "traffic_update",
  "timestamp": "ISO 8601",
  "data": {
    "area": "string",
    "severity": "light|moderate|heavy",
    "description": "string",
    "affectedRoutes": ["vehicleId"],
    "alternativesAvailable": "boolean"
  }
}
```

## OpenStreetMap Integration

### Map Configuration
- **Tile Server**: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`
- **Attribution**: OpenStreetMap contributors
- **Bounds**: NYC area (40.680, -74.020) to (40.820, -73.930)
- **Default Zoom**: 12
- **Max Zoom**: 18

### Custom Markers
- **Incidents**: Circular markers with type-specific colors and icons
- **Vehicles**: Square markers with status colors and directional heading
- **Routes**: Dashed polylines with traffic-aware coloring
- **Animations**: Pulse effects for active incidents, smooth transitions

### Map Features
- **Interactive Popups**: Detailed incident/vehicle information
- **Layer Control**: Toggle traffic, routes, historical data
- **Fullscreen Mode**: Expanded view for detailed operations
- **Real-time Updates**: Live marker position updates

## Frontend Component Architecture

### Core Components
1. **Dashboard.jsx** - Main orchestration component
2. **LiveMap.jsx** - OpenStreetMap with real-time markers
3. **IncidentPanel.jsx** - Incident management with CRUD operations
4. **FleetPanel.jsx** - Vehicle tracking and status management
5. **StatsGrid.jsx** - Real-time metrics dashboard
6. **NotificationPanel.jsx** - WebSocket-driven alert system

### Integration Points
```javascript
// WebSocket Service
websocketService.connect()
websocketService.subscribe('vehicle_location', callback)
websocketService.send({ type: 'request_update', vehicleId: 'xxx' })

// API Service (to be implemented)
apiService.getIncidents()
apiService.createIncident(data)
apiService.optimizeRoutes(incidentIds)
```

## Data Flow & State Management

### Real-time Update Flow
1. **WebSocket Connection** → Established on dashboard load
2. **Event Subscription** → Components subscribe to relevant events
3. **State Updates** → React state updated via WebSocket callbacks
4. **UI Refresh** → Components re-render with new data
5. **Map Updates** → Markers and routes updated in real-time

### Error Handling
- **Connection Loss**: Auto-reconnection with exponential backoff
- **API Failures**: Graceful fallback to cached data
- **Invalid Data**: Validation and sanitization
- **User Feedback**: Toast notifications for errors

## Testing & Quality Assurance

### Mock Data Coverage
- ✅ 4 realistic incidents with full details
- ✅ 6 vehicles with crew, equipment, status
- ✅ Route optimization scenarios
- ✅ Real-time notification simulation
- ✅ All emergency service types
- ✅ Priority levels and status workflows

### WebSocket Simulation Validation
- ✅ Connection management
- ✅ Event type coverage
- ✅ Realistic update frequency
- ✅ Data consistency
- ✅ Error simulation

## Production Deployment Considerations

### Performance Optimizations
- Map tile caching strategy
- WebSocket connection pooling
- Component memoization for frequent updates
- Efficient marker clustering for large datasets

### Security Requirements
- WebSocket authentication tokens
- API rate limiting
- Input validation and sanitization
- CORS configuration for map tiles

### Scalability Patterns
- WebSocket load balancing
- Event sourcing for incident history
- Database indexing for location queries
- CDN for map tiles and assets

## Migration from Mock to Production

### Step 1: API Service Implementation
```javascript
// Replace mock data imports
import { mockIncidents } from '../data/mockData';
// With API service calls
import apiService from '../services/apiService';
```

### Step 2: WebSocket Service Update
```javascript
// Replace MockWebSocket
this.ws = new MockWebSocket();
// With production WebSocket
this.ws = new WebSocket(WS_URL);
```

### Step 3: Environment Configuration
- Production WebSocket URL
- API base URL configuration  
- Map tile server optimization
- Authentication token management

The system is fully functional with comprehensive mock data and ready for seamless backend integration.