import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { mockVehicles, vehicleStatuses, emergencyTypes } from '../../data/mockData';
import { Car, Fuel, Users, MapPin, Clock, MoreHorizontal } from 'lucide-react';
import { cn } from '../../lib/utils';

const VehicleTracker = () => {
  const getStatusInfo = (statusId) => vehicleStatuses.find(s => s.id === statusId);
  const getTypeInfo = (typeId) => emergencyTypes.find(t => t.id === typeId);

  return (
    <Card className="h-full bg-white/80 backdrop-blur-sm border-slate-200/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-900">Fleet Status</CardTitle>
          <Badge variant="secondary" className="bg-blue-500/10 text-blue-700 border-blue-200">
            {mockVehicles.length} Vehicles
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockVehicles.map((vehicle) => {
          const statusInfo = getStatusInfo(vehicle.status);
          const typeInfo = getTypeInfo(vehicle.type);
          
          return (
            <div
              key={vehicle.id}
              className="relative group rounded-lg border border-slate-200/50 bg-white/60 p-4 hover:bg-white/80 hover:shadow-sm transition-all duration-200"
            >
              {/* Status indicator */}
              <div 
                className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
                style={{ backgroundColor: statusInfo?.color }}
              />
              
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{typeInfo?.icon}</span>
                      <div>
                        <span className="font-semibold text-slate-900">{vehicle.callSign}</span>
                        <span className="ml-2 text-sm text-slate-500">({vehicle.id})</span>
                      </div>
                    </div>
                    <Badge 
                      className="text-xs font-medium border"
                      style={{ 
                        color: statusInfo?.color,
                        borderColor: statusInfo?.color + '40',
                        backgroundColor: statusInfo?.color + '10'
                      }}
                    >
                      {statusInfo?.label}
                    </Badge>
                  </div>

                  {/* Location & ETA */}
                  <div className="mb-3">
                    <div className="flex items-center space-x-1 text-sm text-slate-700 mb-1">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{vehicle.location.address}</span>
                    </div>
                    {vehicle.eta && vehicle.eta !== 'On Scene' && (
                      <div className="flex items-center space-x-1 text-sm">
                        <Clock className="h-3 w-3 text-red-500" />
                        <span className="text-red-600 font-medium">ETA: {vehicle.eta}</span>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-3 gap-4 text-xs text-slate-600">
                    <div className="flex items-center space-x-1">
                      <Users className="h-3 w-3" />
                      <span>{vehicle.crew.length} crew</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Car className="h-3 w-3" />
                      <span>{vehicle.speed}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Fuel className={cn("h-3 w-3", vehicle.fuel < 30 ? "text-red-500" : "text-green-500")} />
                      <span className={cn(vehicle.fuel < 30 ? "text-red-600" : "text-green-600")}>
                        {vehicle.fuel}%
                      </span>
                    </div>
                  </div>

                  {/* Crew members */}
                  <div className="mt-3 text-xs text-slate-500">
                    <span className="font-medium">Crew: </span>
                    <span>{vehicle.crew.join(', ')}</span>
                  </div>
                </div>

                {/* Actions */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default VehicleTracker;