import React, { useState, useEffect } from 'react';
import StatsCard from '../components/Dashboard/StatsCard';
import IncidentsList from '../components/Dashboard/IncidentsList';
import VehicleTracker from '../components/Dashboard/VehicleTracker';
import MapView from '../components/Dashboard/MapView';
import NotificationPanel from '../components/Dashboard/NotificationPanel';
import QuickActions from '../components/Dashboard/QuickActions';
import { mockIncidents, mockVehicles, simulateVehicleMovement } from '../data/mockData';
import { 
  AlertTriangle, 
  Car, 
  Clock, 
  CheckCircle, 
  MapPin,
  Activity
} from 'lucide-react';

const Dashboard = () => {
  const [vehicles, setVehicles] = useState(mockVehicles);
  const [incidents] = useState(mockIncidents);

  // Real-time simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setVehicles(prevVehicles => 
        prevVehicles.map(vehicle => simulateVehicleMovement(vehicle))
      );
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Calculate stats
  const activeIncidents = incidents.filter(i => i.status === 'active').length;
  const dispatchedVehicles = vehicles.filter(v => v.status === 'dispatched').length;
  const availableVehicles = vehicles.filter(v => v.status === 'available').length;
  const avgResponseTime = '4.2';
  const onSceneVehicles = vehicles.filter(v => v.status === 'on-scene').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Emergency Operations Center</h1>
            <p className="text-slate-600 mt-1">Real-time incident management and fleet coordination</p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-slate-600">
            <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            <span>System Status: Operational</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatsCard
            title="Active Incidents"
            value={activeIncidents}
            change="+2 from last hour"
            changeType="warning"
            icon={AlertTriangle}
            description="Requiring immediate response"
            className="border-red-200/50 bg-gradient-to-br from-red-50/50 to-white"
          />
          <StatsCard
            title="Vehicles Dispatched"
            value={dispatchedVehicles}
            change="+1 in last 10min"
            changeType="positive"
            icon={Car}
            description="En route to incidents"
            className="border-yellow-200/50 bg-gradient-to-br from-yellow-50/50 to-white"
          />
          <StatsCard
            title="Avg Response Time"
            value={`${avgResponseTime} min`}
            change="-30s improved"
            changeType="positive"
            icon={Clock}
            description="Target: <5 minutes"
            className="border-blue-200/50 bg-gradient-to-br from-blue-50/50 to-white"
          />
          <StatsCard
            title="Available Units"
            value={availableVehicles}
            change="Ready for dispatch"
            changeType="positive"
            icon={CheckCircle}
            description="Fully operational"
            className="border-green-200/50 bg-gradient-to-br from-green-50/50 to-white"
          />
          <StatsCard
            title="On Scene"
            value={onSceneVehicles}
            change="Active operations"
            changeType="neutral"
            icon={Activity}
            description="Currently responding"
            className="border-purple-200/50 bg-gradient-to-br from-purple-50/50 to-white"
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Map View */}
            <MapView />
            
            {/* Incidents List */}
            <IncidentsList />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <QuickActions />
            
            {/* Vehicle Tracker */}
            <VehicleTracker />
            
            {/* Notifications */}
            <NotificationPanel />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;