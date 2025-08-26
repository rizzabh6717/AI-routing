import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { emergencyTypes, priorityLevels } from '../../data/mockData';
import { Plus, AlertTriangle, MapPin, Users, Route, RefreshCw } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

const QuickActions = () => {
  const [isCreateIncidentOpen, setIsCreateIncidentOpen] = useState(false);
  const [isAssignVehicleOpen, setIsAssignVehicleOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    priority: '',
    location: '',
    description: '',
  });
  const { toast } = useToast();

  const handleCreateIncident = () => {
    if (!formData.type || !formData.priority || !formData.location) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Incident Created",
      description: `New ${formData.type} incident created and dispatchers notified.`,
    });

    setFormData({ type: '', priority: '', location: '', description: '' });
    setIsCreateIncidentOpen(false);
  };

  const handleOptimizeRoutes = () => {
    toast({
      title: "Route Optimization",
      description: "AI is recalculating optimal routes for all active incidents.",
    });
  };

  const handleAssignVehicle = () => {
    toast({
      title: "Vehicle Assigned",
      description: "Vehicle has been assigned to the selected incident.",
    });
    setIsAssignVehicleOpen(false);
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-slate-900">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Create Incident */}
        <Dialog open={isCreateIncidentOpen} onOpenChange={setIsCreateIncidentOpen}>
          <DialogTrigger asChild>
            <Button className="w-full justify-start bg-red-500 hover:bg-red-600 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Create New Incident
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Incident</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Emergency Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {emergencyTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.icon} {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority Level</Label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityLevels.map((priority) => (
                        <SelectItem key={priority.id} value={priority.id}>
                          {priority.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="Enter address or coordinates"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the incident..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <Button onClick={handleCreateIncident} className="w-full">
                Create Incident
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Assign Vehicle */}
        <Dialog open={isAssignVehicleOpen} onOpenChange={setIsAssignVehicleOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full justify-start">
              <Users className="mr-2 h-4 w-4" />
              Assign Vehicle
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Assign Vehicle to Incident</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Select Incident</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose incident" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inc-001">INC-001 - Structure Fire</SelectItem>
                    <SelectItem value="inc-002">INC-002 - Medical Emergency</SelectItem>
                    <SelectItem value="inc-003">INC-003 - Police Response</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Available Vehicles</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fire-05">🔥 Engine 33 - Available</SelectItem>
                    <SelectItem value="amb-07">🚑 Ambulance 22 - Available</SelectItem>
                    <SelectItem value="police-15">👮 Unit 15-Bravo - Available</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAssignVehicle} className="w-full">
                Assign Vehicle
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Other Actions */}
        <Button 
          variant="outline" 
          className="w-full justify-start"
          onClick={handleOptimizeRoutes}
        >
          <Route className="mr-2 h-4 w-4" />
          Optimize All Routes
        </Button>

        <Button variant="outline" className="w-full justify-start">
          <MapPin className="mr-2 h-4 w-4" />
          View Traffic Reports
        </Button>

        <Button variant="outline" className="w-full justify-start">
          <AlertTriangle className="mr-2 h-4 w-4" />
          Emergency Protocols
        </Button>

        <Button variant="outline" className="w-full justify-start">
          <RefreshCw className="mr-2 h-4 w-4" />
          System Diagnostics
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuickActions;