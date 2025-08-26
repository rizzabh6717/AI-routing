import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { mockIncidents, mockVehicles, emergencyTypes } from '../../data/mockData';
import { MapPin, Maximize2, RefreshCw, Layers } from 'lucide-react';

const MapView = () => {
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getTypeInfo = (typeId) => emergencyTypes.find(t => t.id === typeId);

  // Mock map coordinates (NYC area)
  const mapBounds = {
    north: 40.82,
    south: 40.70,
    east: -73.93,
    west: -74.02
  };

  const getPositionStyle = (coordinates) => {
    const [lat, lng] = coordinates;
    const x = ((lng - mapBounds.west) / (mapBounds.east - mapBounds.west)) * 100;
    const y = ((mapBounds.north - lat) / (mapBounds.north - mapBounds.south)) * 100;
    return {
      left: `${Math.max(2, Math.min(98, x))}%`,
      top: `${Math.max(2, Math.min(98, y))}%`,
    };
  };

  return (
    <Card className="h-full bg-white/80 backdrop-blur-sm border-slate-200/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-900">Live Operational Map</CardTitle>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="ghost" size="sm">
              <Layers className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative h-96 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg overflow-hidden">
          {/* Map background with grid */}
          <div className="absolute inset-0 opacity-30">
            <svg className="w-full h-full">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#cbd5e1" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Street overlay */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 left-0 right-0 h-0.5 bg-slate-400 transform -rotate-12" />
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-400" />
            <div className="absolute top-3/4 left-0 right-0 h-0.5 bg-slate-400 transform rotate-6" />
            <div className="absolute left-1/4 top-0 bottom-0 w-0.5 bg-slate-400 transform rotate-12" />
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-400" />
            <div className="absolute left-3/4 top-0 bottom-0 w-0.5 bg-slate-400 transform -rotate-6" />
          </div>

          {/* Incident markers */}
          {mockIncidents.map((incident) => {
            const typeInfo = getTypeInfo(incident.type);
            const position = getPositionStyle(incident.location.coordinates);
            
            return (
              <div
                key={incident.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                style={position}
                onClick={() => setSelectedIncident(incident)}
              >
                {/* Pulse effect */}
                <div className="absolute inset-0 rounded-full animate-ping" style={{ backgroundColor: typeInfo?.color + '40' }} />
                
                {/* Main marker */}
                <div 
                  className="relative z-10 w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: typeInfo?.color }}
                >
                  {typeInfo?.icon}
                </div>

                {/* Tooltip */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {incident.id} - {incident.description}
                </div>
              </div>
            );
          })}

          {/* Vehicle markers */}
          {mockVehicles.map((vehicle) => {
            const typeInfo = getTypeInfo(vehicle.type);
            const position = getPositionStyle(vehicle.location.coordinates);
            
            return (
              <div
                key={vehicle.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                style={position}
              >
                {/* Vehicle marker */}
                <div 
                  className="relative z-10 w-4 h-4 rounded-sm border border-white shadow-md flex items-center justify-center"
                  style={{ backgroundColor: typeInfo?.color }}
                >
                  <div className="w-2 h-2 bg-white rounded-sm" />
                </div>

                {/* Tooltip */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {vehicle.callSign} - {vehicle.status}
                </div>
              </div>
            );
          })}

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-sm">
            <h4 className="text-xs font-semibold text-slate-700 mb-2">Legend</h4>
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-slate-600">Active Incidents</span>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <div className="w-3 h-2 rounded-sm bg-blue-500" />
                <span className="text-slate-600">Emergency Vehicles</span>
              </div>
            </div>
          </div>

          {/* Status overlay */}
          <div className="absolute top-4 right-4">
            <Badge className="bg-green-500/10 text-green-700 border-green-200">
              Live Tracking Active
            </Badge>
          </div>
        </div>

        {/* Selected incident details */}
        {selectedIncident && (
          <div className="p-4 border-t border-slate-200/50 bg-slate-50/50">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-slate-900">{selectedIncident.id}</h4>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedIncident(null)}
                className="text-slate-500 hover:text-slate-700"
              >
                ×
              </Button>
            </div>
            <p className="text-sm text-slate-700 mb-2">{selectedIncident.description}</p>
            <div className="flex items-center space-x-4 text-xs text-slate-600">
              <div className="flex items-center space-x-1">
                <MapPin className="h-3 w-3" />
                <span>{selectedIncident.location.address}</span>
              </div>
              <div>
                <span className="font-medium">ETA: </span>
                <span className="text-red-600">{selectedIncident.estimatedArrival}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MapView;