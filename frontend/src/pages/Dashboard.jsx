import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Layout/Sidebar';
import Header from '../components/Layout/Header';
import StatsGrid from '../components/Dashboard/StatsGrid';
import LiveMap from '../components/Map/LiveMap';
import IncidentPanel from '../components/Dashboard/IncidentPanel';
import FleetPanel from '../components/Dashboard/FleetPanel';
import NotificationPanel from '../components/Dashboard/NotificationPanel';
import { useIncidents, useVehicles, useSystemStats } from '../hooks/useApi';
import { useWebSocket, useVehicleUpdates, useIncidentUpdates, useRouteUpdates } from '../hooks/useWebSocket';
import { Toaster } from '../components/ui/toaster';
import { mockRoutes } from '../data/mockData';

const Dashboard = () => {
  const [currentPath, setCurrentPath] = useState('/');
  const [routes] = useState(mockRoutes);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // API hooks
  const { incidents, fetchIncidents, createIncident } = useIncidents();
  const { vehicles, fetchVehicles, updateVehicleStatus } = useVehicles();
  const { stats } = useSystemStats();
  
  // WebSocket hooks
  const { isConnected: wsConnected } = useWebSocket();

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchIncidents();
        await fetchVehicles();
        console.log('✅ Initial data loaded from API');
      } catch (error) {
        console.error('❌ Failed to load initial data:', error);
      }
    };

    loadData();
  }, [fetchIncidents, fetchVehicles]);

  // Subscribe to real-time updates
  useVehicleUpdates((data) => {
    console.log('🚗 Vehicle update received:', data);
    // Vehicle updates are handled by the API hooks
  });

  useIncidentUpdates((data) => {
    console.log('🚨 Incident update received:', data);
    // Incident updates are handled by the API hooks
  });

  useRouteUpdates((data) => {
    console.log('🗺️ Route update received:', data);
    // Route updates handled by API hooks
  });

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

  const handleCreateIncident = async (incidentData) => {
    try {
      await createIncident(incidentData);
      // Refresh incidents list
      await fetchIncidents();
    } catch (error) {
      console.error('Failed to create incident:', error);
    }
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