import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { mockIncidents, emergencyTypes, priorityLevels } from '../../data/mockData';
import { MapPin, Clock, Users, MoreHorizontal } from 'lucide-react';
import { cn } from '../../lib/utils';

const IncidentsList = () => {
  const getTypeInfo = (typeId) => emergencyTypes.find(t => t.id === typeId);
  const getPriorityInfo = (priorityId) => priorityLevels.find(p => p.id === priorityId);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-red-500/10 text-red-700 border-red-200';
      case 'dispatched':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
      case 'on-scene':
        return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'resolved':
        return 'bg-green-500/10 text-green-700 border-green-200';
      default:
        return 'bg-slate-500/10 text-slate-700 border-slate-200';
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className="h-full bg-white/80 backdrop-blur-sm border-slate-200/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-900">Active Incidents</CardTitle>
          <Badge variant="secondary" className="bg-red-500/10 text-red-700 border-red-200">
            {mockIncidents.length} Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockIncidents.map((incident) => {
          const typeInfo = getTypeInfo(incident.type);
          const priorityInfo = getPriorityInfo(incident.priority);
          
          return (
            <div
              key={incident.id}
              className="relative group rounded-lg border border-slate-200/50 bg-white/60 p-4 hover:bg-white/80 hover:shadow-sm transition-all duration-200"
            >
              {/* Priority indicator */}
              <div 
                className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
                style={{ backgroundColor: priorityInfo?.color }}
              />
              
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{typeInfo?.icon}</span>
                      <span className="font-semibold text-slate-900">{incident.id}</span>
                    </div>
                    <Badge 
                      className={cn("text-xs font-medium border", getStatusColor(incident.status))}
                    >
                      {incident.status.replace('-', ' ').toUpperCase()}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className="text-xs"
                      style={{ 
                        color: priorityInfo?.color,
                        borderColor: priorityInfo?.color + '40',
                        backgroundColor: priorityInfo?.color + '10'
                      }}
                    >
                      {priorityInfo?.label}
                    </Badge>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-slate-700 mb-3 line-clamp-2">
                    {incident.description}
                  </p>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-4 text-xs text-slate-600">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{incident.location.address}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatTime(incident.timestamp)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-3 w-3" />
                      <span>{incident.assignedVehicles.length} units assigned</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="font-medium">ETA:</span>
                      <span className="text-red-600 font-medium">{incident.estimatedArrival}</span>
                    </div>
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

export default IncidentsList;