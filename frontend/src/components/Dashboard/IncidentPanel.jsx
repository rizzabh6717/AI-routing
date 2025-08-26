import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Users, 
  MoreHorizontal,
  Plus,
  Filter,
  Search
} from 'lucide-react';
import { getTypeInfo, getPriorityInfo, emergencyTypes, priorityLevels } from '../../data/mockData';
import { cn } from '../../lib/utils';
import { useToast } from '../../hooks/use-toast';

const IncidentCard = ({ incident, onSelect }) => {
  const typeInfo = getTypeInfo(incident.type);
  const priorityInfo = getPriorityInfo(incident.priority);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'dispatched':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'on-scene':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'resolved':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const timeSinceIncident = () => {
    const now = new Date();
    const incident_time = new Date(incident.timestamp);
    const diffMinutes = Math.floor((now - incident_time) / 60000);
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const hours = Math.floor(diffMinutes / 60);
    return `${hours}h ${diffMinutes % 60}m ago`;
  };

  return (
    <div
      className="group relative rounded-lg border border-slate-800 bg-slate-950/50 p-4 hover:bg-slate-950/80 hover:border-slate-700 transition-all duration-200 cursor-pointer"
      onClick={() => onSelect(incident)}
    >
      {/* Priority indicator */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
        style={{ backgroundColor: priorityInfo?.color }}
      />
      
      <div className="pl-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <span className="text-lg">{typeInfo?.icon}</span>
            <div>
              <span className="font-semibold text-white">{incident.id}</span>
              <div className="flex items-center space-x-2 mt-1">
                <Badge 
                  className={cn("text-xs font-medium border", getStatusColor(incident.status))}
                >
                  {incident.status.replace('-', ' ').toUpperCase()}
                </Badge>
                <Badge 
                  variant="outline" 
                  className="text-xs border"
                  style={{ 
                    color: priorityInfo?.color,
                    borderColor: priorityInfo?.color + '40',
                    backgroundColor: priorityInfo?.color + '10'
                  }}
                >
                  {priorityInfo?.label}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm font-medium text-red-400">{incident.estimatedArrival}</div>
            <div className="text-xs text-slate-400">{timeSinceIncident()}</div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-300 mb-3 line-clamp-2">
          {incident.description}
        </p>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center space-x-2 text-slate-400">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{incident.location.district}</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-400">
            <Clock className="h-3 w-3" />
            <span>{formatTime(incident.timestamp)}</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-400">
            <Users className="h-3 w-3" />
            <span>{incident.assignedVehicles.length} units</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-400">
            <span className="font-medium">By:</span>
            <span className="truncate">{incident.reportedBy}</span>
          </div>
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

const CreateIncidentDialog = ({ onCreateIncident }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    priority: '',
    location: '',
    description: '',
    district: '',
  });
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!formData.type || !formData.priority || !formData.location) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const newIncident = {
      id: `INC-2025-${String(Date.now()).slice(-3)}`,
      type: formData.type,
      priority: formData.priority,
      location: {
        address: formData.location,
        coordinates: [40.7589 + (Math.random() - 0.5) * 0.02, -73.9851 + (Math.random() - 0.5) * 0.02],
        district: formData.district || 'Unknown District',
      },
      description: formData.description,
      timestamp: new Date(),
      status: 'active',
      assignedVehicles: [],
      reportedBy: 'Dispatcher',
      estimatedArrival: 'Calculating...',
      lastUpdate: new Date(),
    };

    onCreateIncident(newIncident);
    
    toast({
      title: "Incident Created",
      description: `${newIncident.id} has been created and units are being notified.`,
    });

    setFormData({ type: '', priority: '', location: '', description: '', district: '' });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-red-600 hover:bg-red-700 text-white">
          <Plus className="mr-2 h-4 w-4" />
          New Incident
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-slate-950 border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-white">Create New Incident</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type" className="text-slate-300">Emergency Type *</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  {emergencyTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id} className="text-white hover:bg-slate-800">
                      {type.icon} {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="priority" className="text-slate-300">Priority Level *</Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value})}>
                <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  {priorityLevels.map((priority) => (
                    <SelectItem key={priority.id} value={priority.id} className="text-white hover:bg-slate-800">
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location" className="text-slate-300">Location *</Label>
              <Input
                id="location"
                placeholder="Enter address"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>
            <div>
              <Label htmlFor="district" className="text-slate-300">District</Label>
              <Input
                id="district"
                placeholder="e.g. Midtown Manhattan"
                value={formData.district}
                onChange={(e) => setFormData({...formData, district: e.target.value})}
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="description" className="text-slate-300">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the incident..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="bg-slate-900 border-slate-700 text-white"
            />
          </div>
          <Button onClick={handleSubmit} className="w-full bg-red-600 hover:bg-red-700">
            Create Incident
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const IncidentPanel = ({ incidents = [], onIncidentSelect, onCreateIncident }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = incident.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.location.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || incident.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || incident.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <Card className="h-full bg-slate-950/95 backdrop-blur-sm border-slate-800">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="text-lg font-semibold text-white flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <span>Active Incidents</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge className="bg-red-500/10 text-red-400 border-red-500/20">
              {incidents.length} Total
            </Badge>
            <CreateIncidentDialog onCreateIncident={onCreateIncident} />
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search incidents..."
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
                <SelectItem value="active" className="text-white">Active</SelectItem>
                <SelectItem value="dispatched" className="text-white">Dispatched</SelectItem>
                <SelectItem value="on-scene" className="text-white">On Scene</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                <SelectItem value="all" className="text-white">All Priority</SelectItem>
                <SelectItem value="critical" className="text-white">Critical</SelectItem>
                <SelectItem value="high" className="text-white">High</SelectItem>
                <SelectItem value="medium" className="text-white">Medium</SelectItem>
                <SelectItem value="low" className="text-white">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 max-h-96 overflow-y-auto">
        {filteredIncidents.length === 0 ? (
          <div className="text-center text-slate-400 py-8">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No incidents match your filters</p>
          </div>
        ) : (
          filteredIncidents.map((incident) => (
            <IncidentCard
              key={incident.id}
              incident={incident}
              onSelect={onIncidentSelect}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default IncidentPanel;