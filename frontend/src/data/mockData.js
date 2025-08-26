// Mock data for Emergency Routing System

export const emergencyTypes = [
  { id: 'fire', label: 'Fire', color: 'rgb(239, 68, 68)', icon: '🔥' },
  { id: 'medical', label: 'Medical Emergency', color: 'rgb(34, 197, 94)', icon: '🚑' },
  { id: 'police', label: 'Police', color: 'rgb(59, 130, 246)', icon: '👮' },
  { id: 'rescue', label: 'Search & Rescue', color: 'rgb(245, 158, 11)', icon: '⛑️' },
  { id: 'hazmat', label: 'Hazmat', color: 'rgb(168, 85, 247)', icon: '☢️' },
  { id: 'traffic', label: 'Traffic Accident', color: 'rgb(6, 182, 212)', icon: '🚗' },
];

export const priorityLevels = [
  { id: 'critical', label: 'Critical', color: 'rgb(239, 68, 68)' },
  { id: 'high', label: 'High', color: 'rgb(245, 158, 11)' },
  { id: 'medium', label: 'Medium', color: 'rgb(34, 197, 94)' },
  { id: 'low', label: 'Low', color: 'rgb(107, 114, 128)' },
];

export const vehicleStatuses = [
  { id: 'available', label: 'Available', color: 'rgb(34, 197, 94)' },
  { id: 'dispatched', label: 'Dispatched', color: 'rgb(245, 158, 11)' },
  { id: 'on-scene', label: 'On Scene', color: 'rgb(239, 68, 68)' },
  { id: 'returning', label: 'Returning', color: 'rgb(59, 130, 246)' },
  { id: 'maintenance', label: 'Maintenance', color: 'rgb(107, 114, 128)' },
];

export const mockIncidents = [
  {
    id: 'INC-001',
    type: 'fire',
    priority: 'critical',
    location: {
      address: '1425 Broadway, New York, NY 10018',
      coordinates: [40.7589, -73.9851],
    },
    description: 'Structure fire reported in commercial building',
    timestamp: new Date('2025-01-15T14:30:00Z'),
    status: 'active',
    assignedVehicles: ['FIRE-01', 'FIRE-02'],
    reportedBy: 'Jane Smith',
    estimatedArrival: '4 min',
  },
  {
    id: 'INC-002',
    type: 'medical',
    priority: 'high',
    location: {
      address: '350 5th Ave, New York, NY 10118',
      coordinates: [40.7484, -73.9857],
    },
    description: 'Cardiac arrest reported',
    timestamp: new Date('2025-01-15T14:35:00Z'),
    status: 'dispatched',
    assignedVehicles: ['AMB-03'],
    reportedBy: 'Emergency Caller',
    estimatedArrival: '7 min',
  },
  {
    id: 'INC-003',
    type: 'police',
    priority: 'medium',
    location: {
      address: '200 Central Park West, New York, NY 10024',
      coordinates: [40.7829, -73.9654],
    },
    description: 'Domestic disturbance call',
    timestamp: new Date('2025-01-15T14:20:00Z'),
    status: 'on-scene',
    assignedVehicles: ['POLICE-12'],
    reportedBy: 'Concerned Neighbor',
    estimatedArrival: 'On Scene',
  },
];

export const mockVehicles = [
  {
    id: 'FIRE-01',
    callSign: 'Engine 54',
    type: 'fire',
    status: 'dispatched',
    location: {
      coordinates: [40.7614, -73.9776],
      address: 'En route to incident',
    },
    crew: ['John Martinez', 'Sarah Wilson', 'Mike Chen', 'Lisa Rodriguez'],
    currentIncident: 'INC-001',
    eta: '4 min',
    speed: '35 mph',
    fuel: 85,
  },
  {
    id: 'FIRE-02',
    callSign: 'Ladder 27',
    type: 'fire',
    status: 'dispatched',
    location: {
      coordinates: [40.7598, -73.9442],
      address: 'En route to incident',
    },
    crew: ['David Park', 'Emma Taylor', 'Alex Johnson'],
    currentIncident: 'INC-001',
    eta: '6 min',
    speed: '32 mph',
    fuel: 78,
  },
  {
    id: 'AMB-03',
    callSign: 'Ambulance 15',
    type: 'medical',
    status: 'dispatched',
    location: {
      coordinates: [40.7505, -73.9934],
      address: 'En route to incident',
    },
    crew: ['Dr. Jennifer Kim', 'Paramedic Tom Anderson'],
    currentIncident: 'INC-002',
    eta: '7 min',
    speed: '28 mph',
    fuel: 92,
  },
  {
    id: 'POLICE-12',
    callSign: 'Unit 24-Adam',
    type: 'police',
    status: 'on-scene',
    location: {
      coordinates: [40.7829, -73.9654],
      address: '200 Central Park West',
    },
    crew: ['Officer Maria Gonzalez', 'Officer James Smith'],
    currentIncident: 'INC-003',
    eta: 'On Scene',
    speed: '0 mph',
    fuel: 67,
  },
  {
    id: 'FIRE-05',
    callSign: 'Engine 33',
    type: 'fire',
    status: 'available',
    location: {
      coordinates: [40.7282, -73.9942],
      address: 'Station 33',
    },
    crew: ['Captain Robert Lee', 'Jake Morrison', 'Nina Patel'],
    currentIncident: null,
    eta: null,
    speed: '0 mph',
    fuel: 100,
  },
];

export const mockRouteData = {
  'INC-001': {
    route: [
      [40.7614, -73.9776],
      [40.7601, -73.9821],
      [40.7589, -73.9851],
    ],
    distance: '2.3 miles',
    duration: '4 min',
    traffic: 'moderate',
    alternativeRoutes: [
      {
        name: 'Via Broadway',
        distance: '2.8 miles',
        duration: '6 min',
        traffic: 'heavy',
      },
      {
        name: 'Via 8th Ave',
        distance: '2.1 miles',
        duration: '5 min',
        traffic: 'light',
      },
    ],
  },
  'INC-002': {
    route: [
      [40.7505, -73.9934],
      [40.7492, -73.9889],
      [40.7484, -73.9857],
    ],
    distance: '1.8 miles',
    duration: '7 min',
    traffic: 'heavy',
    alternativeRoutes: [
      {
        name: 'Via 6th Ave',
        distance: '2.0 miles',
        duration: '8 min',
        traffic: 'moderate',
      },
    ],
  },
};

export const mockNotifications = [
  {
    id: 'N001',
    type: 'route-update',
    message: 'Route optimized for FIRE-01 - ETA reduced by 2 minutes',
    timestamp: new Date('2025-01-15T14:32:00Z'),
    priority: 'high',
    read: false,
  },
  {
    id: 'N002',
    type: 'traffic-alert',
    message: 'Heavy traffic detected on Broadway - Alternative route suggested',
    timestamp: new Date('2025-01-15T14:31:00Z'),
    priority: 'medium',
    read: false,
  },
  {
    id: 'N003',
    type: 'vehicle-status',
    message: 'AMB-03 fuel level at 92% - No action required',
    timestamp: new Date('2025-01-15T14:30:00Z'),
    priority: 'low',
    read: true,
  },
];

// Simulation functions for real-time updates
export const simulateVehicleMovement = (vehicle) => {
  if (vehicle.status === 'dispatched' && vehicle.currentIncident) {
    // Simulate vehicle moving towards incident
    const incident = mockIncidents.find(inc => inc.id === vehicle.currentIncident);
    if (incident) {
      const targetCoords = incident.location.coordinates;
      const currentCoords = vehicle.location.coordinates;
      
      // Simple linear interpolation towards target
      const progress = Math.random() * 0.1; // Random progress
      const newLat = currentCoords[0] + (targetCoords[0] - currentCoords[0]) * progress;
      const newLng = currentCoords[1] + (targetCoords[1] - currentCoords[1]) * progress;
      
      return {
        ...vehicle,
        location: {
          ...vehicle.location,
          coordinates: [newLat, newLng],
        },
        eta: Math.max(1, parseInt(vehicle.eta) - Math.floor(Math.random() * 2)) + ' min',
      };
    }
  }
  return vehicle;
};

export const generateRandomIncident = () => {
  const types = emergencyTypes;
  const priorities = priorityLevels;
  const locations = [
    { address: '42nd St & Times Square, New York, NY', coordinates: [40.7580, -73.9855] },
    { address: '125th St & Lenox Ave, New York, NY', coordinates: [40.8075, -73.9533] },
    { address: '14th St & Union Square, New York, NY', coordinates: [40.7359, -73.9911] },
    { address: 'Brooklyn Bridge, New York, NY', coordinates: [40.7061, -73.9969] },
  ];
  
  const randomType = types[Math.floor(Math.random() * types.length)];
  const randomPriority = priorities[Math.floor(Math.random() * priorities.length)];
  const randomLocation = locations[Math.floor(Math.random() * locations.length)];
  
  return {
    id: `INC-${Date.now()}`,
    type: randomType.id,
    priority: randomPriority.id,
    location: randomLocation,
    description: `${randomType.label} incident reported`,
    timestamp: new Date(),
    status: 'pending',
    assignedVehicles: [],
    reportedBy: 'System Generated',
    estimatedArrival: 'Calculating...',
  };
};