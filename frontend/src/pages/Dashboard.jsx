import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Layout/Sidebar';
import Header from '../components/Layout/Header';
import StatsGrid from '../components/Dashboard/StatsGrid';
import LiveMap from '../components/Map/LiveMap';
import IncidentPanel from '../components/Dashboard/IncidentPanel';
import FleetPanel from '../components/Dashboard/FleetPanel';
import NotificationPanel from '../components/Dashboard/NotificationPanel';
import { mockIncidents, mockVehicles, mockRoutes } from '../data/mockData';
import websocketService from '../services/websocketService';
import { Toaster } from '../components/ui/toaster';

const Dashboard = () => {
  const [currentPath, setCurrentPath] = useState('/');
  const [incidents, setIncidents] = useState(mockIncidents);
  const [vehicles, setVehicles] = useState(mockVehicles);
  const [routes] = useState(mockRoutes);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  useEffect(() => {
    // Initialize WebSocket connection
    websocketService.connect();

    // Subscribe to real-time updates
    const unsubscribeVehicleUpdates = websocketService.subscribe('vehicle_location', (data) => {
      setVehicles(prevVehicles => 
        prevVehicles.map(vehicle => 
          vehicle.id === data.vehicleId 
            ? {
                ...vehicle,
                location: {
                  ...vehicle.location,
                  coordinates: data.location.coordinates,
                  heading: data.location.heading,
                },
                speed: data.location.speed || vehicle.speed,
                lastUpdate: new Date(),
              }
            : vehicle
        )
      );
    });

    const unsubscribeRouteUpdates = websocketService.subscribe('route_optimization', (data) => {
      setVehicles(prevVehicles => 
        prevVehicles.map(vehicle => 
          vehicle.id === data.vehicleId 
            ? { ...vehicle, eta: data.newEta }
            : vehicle
        )
      );
    });

    const unsubscribeIncidentUpdates = websocketService.subscribe('incident_status', (data) => {
      setIncidents(prevIncidents => 
        prevIncidents.map(incident => 
          incident.id === data.incidentId 
            ? { ...incident, status: data.status, lastUpdate: new Date() }
            : incident
        )
      );
    });

    // Cleanup subscriptions
    return () => {
      unsubscribeVehicleUpdates();
      unsubscribeRouteUpdates();
      unsubscribeIncidentUpdates();
      websocketService.disconnect();
    };
  }, []);

  const handleNavigate = (path) => {
    setCurrentPath(path);
  };

  const handleIncidentSelect = (incident) => {
    setSelectedIncident(incident.id);
    setSelectedVehicle(null); // Clear vehicle selection when incident is selected
  };

  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicle(vehicle.id);
    if (vehicle.currentIncident) {
      setSelectedIncident(vehicle.currentIncident);
    }
  };

  const handleCreateIncident = (newIncident) => {
    setIncidents(prevIncidents => [newIncident, ...prevIncidents]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar currentPath={currentPath} onNavigate={handleNavigate} />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          
          <main className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Page Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-white">Emergency Operations Command</h1>
                  <p className="text-slate-400 mt-1">Real-time incident management and AI-powered routing</p>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-slate-300">System Operational</span>
                </div>
              </div>

              {/* Stats Grid */}
              <StatsGrid incidents={incidents} vehicles={vehicles} />

              {/* Main Dashboard Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Left Column - Map */}
                <div className="xl:col-span-2">
                  <LiveMap 
                    incidents={incidents}
                    vehicles={vehicles}
                    routes={routes}
                    selectedIncident={selectedIncident}
                    className="h-[600px]"
                  />
                </div>

                {/* Right Column - Notifications */}
                <div className="space-y-6">
                  <NotificationPanel />
                </div>
              </div>

              {/* Bottom Section - Incidents and Fleet */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <IncidentPanel 
                  incidents={incidents}
                  onIncidentSelect={handleIncidentSelect}
                  onCreateIncident={handleCreateIncident}
                />
                <FleetPanel 
                  vehicles={vehicles}
                  onVehicleSelect={handleVehicleSelect}
                />
              </div>
            </div>
          </main>
        </div>
      </div>
      
      <Toaster />
    </div>
  );
};

export default Dashboard;