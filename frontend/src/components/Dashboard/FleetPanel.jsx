import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Car, 
  Fuel, 
  Users, 
  MapPin, 
  Clock, 
  MoreHorizontal,
  Search,
  Navigation,
  Battery
} from 'lucide-react';
import { getTypeInfo, getStatusInfo } from '../../data/mockData';
import { cn } from '../../lib/utils';

const VehicleCard = ({ vehicle, onSelect }) => {
  const typeInfo = getTypeInfo(vehicle.type);
  const statusInfo = getStatusInfo(vehicle.status);

  const getFuelColor = (fuel) => {
    if (fuel < 25) return 'text-red-400';
    if (fuel < 50) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getSpeedColor = (speed) => {
    if (speed === 0) return 'text-slate-400';
    if (speed > 40) return 'text-red-400';
    if (speed > 25) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div
      className="group relative rounded-lg border border-slate-800 bg-slate-950/50 p-4 hover:bg-slate-950/80 hover:border-slate-700 transition-all duration-200 cursor-pointer"
      onClick={() => onSelect(vehicle)}
    >
      {/* Status indicator */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
        style={{ backgroundColor: statusInfo?.color }}
      />
      
      <div className="pl-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <span className="text-lg">{typeInfo?.icon}</span>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-white">{vehicle.callSign}</span>
                <span className="text-xs text-slate-400">({vehicle.id})</span>
              </div>
              <Badge 
                className="text-xs font-medium border mt-1"
                style={{ 
                  color: statusInfo?.color,
                  borderColor: statusInfo?.color + '40',
                  backgroundColor: statusInfo?.color + '10'
                }}
              >
                {statusInfo?.label}
              </Badge>
            </div>
          </div>
          
          {vehicle.eta && vehicle.eta !== 'On Scene' && (
            <div className="text-right">
              <div className="text-sm font-medium text-red-400">ETA: {vehicle.eta}</div>
              <div className="text-xs text-slate-400">to incident</div>
            </div>
          )}
        </div>

        {/* Location */}
        <div className="mb-3">
          <div className="flex items-center space-x-2 text-sm text-slate-300 mb-1">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{vehicle.location.address}</span>
          </div>
          {vehicle.currentIncident && (
            <div className="text-xs text-blue-400">
              → Responding to {vehicle.currentIncident}
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-3 text-xs mb-3">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1">
              <Users className="h-3 w-3 text-slate-400" />
              <span className="text-slate-400">{vehicle.crew.length}</span>
            </div>
            <div className="text-slate-500">crew</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1">
              <Navigation className={cn("h-3 w-3", getSpeedColor(vehicle.speed))} />
              <span className={getSpeedColor(vehicle.speed)}>{vehicle.speed}</span>
            </div>
            <div className="text-slate-500">mph</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1">
              <Fuel className={cn("h-3 w-3", getFuelColor(vehicle.fuel))} />
              <span className={getFuelColor(vehicle.fuel)}>{vehicle.fuel}%</span>
            </div>
            <div className="text-slate-500">fuel</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1">
              <Battery className="h-3 w-3 text-green-400" />
              <span className="text-green-400">100%</span>
            </div>
            <div className="text-slate-500">comm</div>
          </div>
        </div>

        {/* Crew List */}
        <div className="text-xs text-slate-400">
          <span className="font-medium">Crew: </span>
          <span>{vehicle.crew.map(member => member.name).join(', ')}</span>
        </div>

        {/* Equipment */}
        <div className="text-xs text-slate-500 mt-1">
          <span className="font-medium">Equipment: </span>
          <span>{vehicle.equipment?.slice(0, 3).join(', ')}</span>
          {vehicle.equipment?.length > 3 && <span> +{vehicle.equipment.length - 3} more</span>}
        </div>

        {/* Actions */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-white"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

const FleetPanel = ({ vehicles = [], onVehicleSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.callSign.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.location.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
    const matchesType = typeFilter === 'all' || vehicle.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Calculate stats
  const availableCount = vehicles.filter(v => v.status === 'available').length;
  const dispatchedCount = vehicles.filter(v => v.status === 'dispatched').length;
  const onSceneCount = vehicles.filter(v => v.status === 'on-scene').length;
  const maintenanceCount = vehicles.filter(v => v.status === 'maintenance').length;

  return (
    <Card className="h-full bg-slate-950/95 backdrop-blur-sm border-slate-800">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="text-lg font-semibold text-white flex items-center space-x-2">
            <Car className="h-5 w-5 text-blue-400" />
            <span>Fleet Status</span>
          </CardTitle>
          <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
            {vehicles.length} Units
          </Badge>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="text-center p-2 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="text-lg font-bold text-green-400">{availableCount}</div>
            <div className="text-xs text-green-300">Available</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <div className="text-lg font-bold text-yellow-400">{dispatchedCount}</div>
            <div className="text-xs text-yellow-300">Dispatched</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-red-500/10 border border-red-500/20">
            <div className="text-lg font-bold text-red-400">{onSceneCount}</div>
            <div className="text-xs text-red-300">On Scene</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-slate-500/10 border border-slate-500/20">
            <div className="text-lg font-bold text-slate-400">{maintenanceCount}</div>
            <div className="text-xs text-slate-300">Maintenance</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search vehicles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-900 border-slate-700 text-white"
            />
          </div>
          
          <div className="flex space-x-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                <SelectItem value="all" className="text-white">All Status</SelectItem>
                <SelectItem value="available" className="text-white">Available</SelectItem>
                <SelectItem value="dispatched" className="text-white">Dispatched</SelectItem>
                <SelectItem value="on-scene" className="text-white">On Scene</SelectItem>
                <SelectItem value="maintenance" className="text-white">Maintenance</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                <SelectItem value="all" className="text-white">All Types</SelectItem>
                <SelectItem value="fire" className="text-white">Fire</SelectItem>
                <SelectItem value="medical" className="text-white">Medical</SelectItem>
                <SelectItem value="police" className="text-white">Police</SelectItem>
                <SelectItem value="hazmat" className="text-white">Hazmat</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 max-h-96 overflow-y-auto">
        {filteredVehicles.length === 0 ? (
          <div className="text-center text-slate-400 py-8">
            <Car className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No vehicles match your filters</p>
          </div>
        ) : (
          filteredVehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onSelect={onVehicleSelect}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default FleetPanel;