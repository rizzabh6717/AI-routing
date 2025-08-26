import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Maximize2, Minimize2, RefreshCw, Layers, Navigation } from 'lucide-react';
import { getTypeInfo } from '../../data/mockData';

// Fix Leaflet default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const createIncidentIcon = (type, priority) => {
  const typeInfo = getTypeInfo(type);
  const size = priority === 'critical' ? 40 : priority === 'high' ? 35 : 30;
  
  return L.divIcon({
    html: `
      <div class="incident-marker" style="
        width: ${size}px;
        height: ${size}px;
        background: ${typeInfo?.color || '#dc2626'};
        border: 3px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${size * 0.4}px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: pulse-ring 2s infinite;
      ">
        ${typeInfo?.icon || '⚠️'}
      </div>
      <style>
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 ${typeInfo?.color}40; }
          70% { box-shadow: 0 0 0 20px transparent; }
          100% { box-shadow: 0 0 0 0 transparent; }
        }
      </style>
    `,
    className: 'custom-div-icon',
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
  });
};

const createVehicleIcon = (type, status, heading = 0) => {
  const typeInfo = getTypeInfo(type);
  const statusColors = {
    available: '#059669',
    dispatched: '#d97706',
    'on-scene': '#dc2626',
    returning: '#2563eb',
    maintenance: '#6b7280',
  };

  return L.divIcon({
    html: `
      <div class="vehicle-marker" style="
        width: 24px;
        height: 24px;
        background: ${statusColors[status] || '#6b7280'};
        border: 2px solid white;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        transform: rotate(${heading}deg);
      ">
        🚗
      </div>
    `,
    className: 'custom-div-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const MapUpdater = ({ incidents, vehicles, selectedIncident }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedIncident) {
      const incident = incidents.find(i => i.id === selectedIncident);
      if (incident) {
        map.setView(incident.location.coordinates, 16);
      }
    }
  }, [selectedIncident, incidents, map]);

  return null;
};

const LiveMap = ({ incidents = [], vehicles = [], routes = {}, className = "" }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showTraffic, setShowTraffic] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const mapRef = useRef();

  // NYC bounds
  const center = [40.7589, -73.9851]; // Manhattan
  const bounds = [
    [40.680, -74.020], // Southwest
    [40.820, -73.930]  // Northeast
  ];

  const handleRefresh = () => {
    setLastUpdate(new Date());
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleIncidentClick = (incidentId) => {
    setSelectedIncident(incidentId === selectedIncident ? null : incidentId);
  };

  const getRouteForIncident = (incidentId) => {
    const incidentRoutes = routes[incidentId];
    if (!incidentRoutes?.vehicleRoutes) return [];
    
    return Object.entries(incidentRoutes.vehicleRoutes).map(([vehicleId, routeData]) => ({
      vehicleId,
      ...routeData
    }));
  };

  return (
    <Card className={`bg-slate-950/95 backdrop-blur-md border-slate-800 ${className} ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-white flex items-center space-x-2">
            <Navigation className="h-5 w-5 text-red-400" />
            <span>Live Operations Map</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
              Live Tracking
            </Badge>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRefresh}
              className="text-slate-400 hover:text-white"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowTraffic(!showTraffic)}
              className={`text-slate-400 hover:text-white ${showTraffic ? 'bg-slate-800' : ''}`}
            >
              <Layers className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleFullscreen}
              className="text-slate-400 hover:text-white"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className={`relative bg-slate-900 ${isFullscreen ? 'h-full' : 'h-96'} rounded-b-lg overflow-hidden`}>
          <MapContainer
            ref={mapRef}
            center={center}
            zoom={12}
            style={{ height: '100%', width: '100%' }}
            maxBounds={bounds}
            maxBoundsViscosity={1.0}
            className="z-10"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            <MapUpdater 
              incidents={incidents} 
              vehicles={vehicles} 
              selectedIncident={selectedIncident} 
            />

            {/* Incident Markers */}
            {incidents.map((incident) => (
              <Marker
                key={incident.id}
                position={incident.location.coordinates}
                icon={createIncidentIcon(incident.type, incident.priority)}
                eventHandlers={{
                  click: () => handleIncidentClick(incident.id)
                }}
              >
                <Popup className="custom-popup">
                  <div className="p-2 bg-slate-950 text-white rounded">
                    <h3 className="font-semibold text-red-400">{incident.id}</h3>
                    <p className="text-sm mb-2">{incident.description}</p>
                    <div className="text-xs space-y-1">
                      <div><strong>Type:</strong> {getTypeInfo(incident.type)?.label}</div>
                      <div><strong>Priority:</strong> {incident.priority}</div>
                      <div><strong>Status:</strong> {incident.status}</div>
                      <div><strong>ETA:</strong> {incident.estimatedArrival}</div>
                      <div><strong>Location:</strong> {incident.location.address}</div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Vehicle Markers */}
            {vehicles.map((vehicle) => (
              <Marker
                key={vehicle.id}
                position={vehicle.location.coordinates}
                icon={createVehicleIcon(vehicle.type, vehicle.status, vehicle.location.heading)}
              >
                <Popup className="custom-popup">
                  <div className="p-2 bg-slate-950 text-white rounded">
                    <h3 className="font-semibold text-blue-400">{vehicle.callSign}</h3>
                    <p className="text-sm mb-2">{vehicle.id}</p>
                    <div className="text-xs space-y-1">
                      <div><strong>Status:</strong> {vehicle.status}</div>
                      <div><strong>Type:</strong> {getTypeInfo(vehicle.type)?.label}</div>
                      <div><strong>Speed:</strong> {vehicle.speed} mph</div>
                      <div><strong>Fuel:</strong> {vehicle.fuel}%</div>
                      <div><strong>Crew:</strong> {vehicle.crew.length} members</div>
                      {vehicle.eta && <div><strong>ETA:</strong> {vehicle.eta}</div>}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Route Lines */}
            {selectedIncident && getRouteForIncident(selectedIncident).map((route) => (
              <Polyline
                key={route.vehicleId}
                positions={route.route}
                color="#3b82f6"
                weight={4}
                opacity={0.8}
                dashArray="5, 10"
              />
            ))}
          </MapContainer>

          {/* Map Legend */}
          <div className="absolute bottom-4 left-4 bg-slate-950/90 backdrop-blur-sm rounded-lg p-3 text-white z-20">
            <h4 className="text-sm font-semibold mb-2">Legend</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">🔥</div>
                <span>Active Incidents</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-600 rounded flex items-center justify-center">🚗</div>
                <span>Emergency Vehicles</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-1 bg-blue-500 rounded"></div>
                <span>Optimized Routes</span>
              </div>
            </div>
          </div>

          {/* Update Time */}
          <div className="absolute top-4 right-4 bg-slate-950/90 backdrop-blur-sm rounded-lg px-3 py-1 text-white z-20">
            <div className="text-xs">
              Last Updated: {lastUpdate.toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Selected Incident Details */}
        {selectedIncident && (
          <div className="border-t border-slate-800 bg-slate-950/50 p-4">
            {(() => {
              const incident = incidents.find(i => i.id === selectedIncident);
              if (!incident) return null;
              
              return (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-white flex items-center space-x-2">
                      <span>{getTypeInfo(incident.type)?.icon}</span>
                      <span>{incident.id}</span>
                    </h4>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSelectedIncident(null)}
                      className="text-slate-400 hover:text-white"
                    >
                      ✕
                    </Button>
                  </div>
                  <p className="text-sm text-slate-300 mb-3">{incident.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400">Priority:</span>
                      <div className="font-medium text-white">{incident.priority}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Status:</span>
                      <div className="font-medium text-white">{incident.status}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">ETA:</span>
                      <div className="font-medium text-red-400">{incident.estimatedArrival}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Units:</span>
                      <div className="font-medium text-white">{incident.assignedVehicles.length}</div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LiveMap;