// Mock data for Emergency Routing System

export const emergencyTypes = [
  { id: 'fire', label: 'Fire Department', color: '#dc2626', icon: '🔥', code: 'FD' },
  { id: 'medical', label: 'Medical Emergency', color: '#059669', icon: '🚑', code: 'EMS' },
  { id: 'police', label: 'Police', color: '#2563eb', icon: '👮', code: 'PD' },
  { id: 'rescue', label: 'Search & Rescue', color: '#d97706', icon: '⛑️', code: 'SAR' },
  { id: 'hazmat', label: 'Hazmat Response', color: '#7c3aed', icon: '☢️', code: 'HMT' },
  { id: 'traffic', label: 'Traffic Control', color: '#0891b2', icon: '🚧', code: 'TC' },
  { id: 'marine', label: 'Marine Rescue', color: '#0d9488', icon: '🚤', code: 'MR' },
];

export const priorityLevels = [
  { id: 'critical', label: 'Critical', color: '#dc2626', weight: 4 },
  { id: 'high', label: 'High', color: '#ea580c', weight: 3 },
  { id: 'medium', label: 'Medium', color: '#ca8a04', weight: 2 },
  { id: 'low', label: 'Low', color: '#65a30d', weight: 1 },
];

export const vehicleStatuses = [
  { id: 'available', label: 'Available', color: '#059669' },
  { id: 'dispatched', label: 'Dispatched', color: '#d97706' },
  { id: 'on-scene', label: 'On Scene', color: '#dc2626' },
  { id: 'returning', label: 'Returning', color: '#2563eb' },
  { id: 'maintenance', label: 'Maintenance', color: '#6b7280' },
  { id: 'offline', label: 'Offline', color: '#374151' },
];

export const mockIncidents = [
  {
    id: 'INC-2025-001',
    type: 'fire',
    priority: 'critical',
    location: {
      address: '1425 Broadway, Manhattan, NY 10018',
      coordinates: [40.7589, -73.9851],
      district: 'Midtown Manhattan',
    },
    description: 'Structure fire reported in 15-story commercial building. Multiple floors affected. Smoke visible from street level.',
    timestamp: new Date('2025-01-15T14:30:00Z'),
    status: 'active',
    assignedVehicles: ['FD-ENGINE-54', 'FD-LADDER-27', 'FD-BATTALION-9'],
    reportedBy: 'FDNY Dispatch',
    estimatedArrival: '3 min',
    lastUpdate: new Date(),
  },
  {
    id: 'INC-2025-002',
    type: 'medical',
    priority: 'high',
    location: {
      address: '350 5th Ave, Manhattan, NY 10118',
      coordinates: [40.7484, -73.9857],
      district: 'Midtown South',
    },
    description: 'Cardiac arrest reported. 67-year-old male, unconscious, CPR in progress by bystanders.',
    timestamp: new Date('2025-01-15T14:35:00Z'),
    status: 'dispatched',
    assignedVehicles: ['EMS-AMB-15', 'EMS-PARAMEDIC-7'],
    reportedBy: '911 Caller',
    estimatedArrival: '5 min',
    lastUpdate: new Date(),
  },
  {
    id: 'INC-2025-003',
    type: 'police',
    priority: 'medium',
    location: {
      address: '200 Central Park West, Manhattan, NY 10024',
      coordinates: [40.7829, -73.9654],
      district: 'Upper West Side',
    },
    description: 'Domestic disturbance call. Neighbors report loud argument and possible physical altercation.',
    timestamp: new Date('2025-01-15T14:20:00Z'),
    status: 'on-scene',
    assignedVehicles: ['PD-UNIT-24A', 'PD-UNIT-24B'],
    reportedBy: 'Anonymous Caller',
    estimatedArrival: 'On Scene',
    lastUpdate: new Date(),
  },
  {
    id: 'INC-2025-004',
    type: 'hazmat',
    priority: 'high',
    location: {
      address: '125 W 31st St, Manhattan, NY 10001',
      coordinates: [40.7505, -73.9934],
      district: 'Penn Station Area',
    },
    description: 'Chemical spill reported at industrial facility. Unknown substance, evacuating immediate area.',
    timestamp: new Date('2025-01-15T14:45:00Z'),
    status: 'dispatched',
    assignedVehicles: ['HMT-UNIT-1', 'FD-ENGINE-1'],
    reportedBy: 'Facility Manager',
    estimatedArrival: '8 min',
    lastUpdate: new Date(),
  },
];

export const mockVehicles = [
  {
    id: 'FD-ENGINE-54',
    callSign: 'Engine 54',
    type: 'fire',
    status: 'dispatched',
    location: {
      coordinates: [40.7614, -73.9776],
      address: 'En route via 7th Ave',
      heading: 125,
    },
    crew: [
      { name: 'Capt. John Martinez', role: 'Captain' },
      { name: 'Lt. Sarah Wilson', role: 'Lieutenant' },
      { name: 'FF Mike Chen', role: 'Firefighter' },
      { name: 'FF Lisa Rodriguez', role: 'Firefighter' },
    ],
    currentIncident: 'INC-2025-001',
    eta: '3 min',
    speed: 35,
    fuel: 85,
    equipment: ['Ladder', 'Hose', 'Breathing Apparatus'],
    lastUpdate: new Date(),
  },
  {
    id: 'FD-LADDER-27',
    callSign: 'Ladder 27',
    type: 'fire',
    status: 'dispatched',
    location: {
      coordinates: [40.7598, -73.9442],
      address: 'En route via FDR Drive',
      heading: 210,
    },
    crew: [
      { name: 'Lt. David Park', role: 'Lieutenant' },
      { name: 'FF Emma Taylor', role: 'Firefighter' },
      { name: 'FF Alex Johnson', role: 'Firefighter' },
    ],
    currentIncident: 'INC-2025-001',
    eta: '4 min',
    speed: 42,
    fuel: 78,
    equipment: ['Aerial Ladder', 'Rescue Tools', 'Ventilation Equipment'],
    lastUpdate: new Date(),
  },
  {
    id: 'EMS-AMB-15',
    callSign: 'Ambulance 15',
    type: 'medical',
    status: 'dispatched',
    location: {
      coordinates: [40.7505, -73.9934],
      address: 'En route via 5th Ave',
      heading: 45,
    },
    crew: [
      { name: 'Dr. Jennifer Kim', role: 'Paramedic' },
      { name: 'EMT Tom Anderson', role: 'EMT' },
    ],
    currentIncident: 'INC-2025-002',
    eta: '5 min',
    speed: 28,
    fuel: 92,
    equipment: ['Defibrillator', 'Oxygen', 'Advanced Life Support'],
    lastUpdate: new Date(),
  },
  {
    id: 'PD-UNIT-24A',
    callSign: 'Unit 24-Adam',
    type: 'police',
    status: 'on-scene',
    location: {
      coordinates: [40.7829, -73.9654],
      address: '200 Central Park West',
      heading: 0,
    },
    crew: [
      { name: 'Officer Maria Gonzalez', role: 'Senior Officer' },
      { name: 'Officer James Smith', role: 'Officer' },
    ],
    currentIncident: 'INC-2025-003',
    eta: 'On Scene',
    speed: 0,
    fuel: 67,
    equipment: ['Radio', 'Body Camera', 'Taser'],
    lastUpdate: new Date(),
  },
  {
    id: 'FD-ENGINE-33',
    callSign: 'Engine 33',
    type: 'fire',
    status: 'available',
    location: {
      coordinates: [40.7282, -73.9942],
      address: 'Station 33 - Greenwich Village',
      heading: 0,
    },
    crew: [
      { name: 'Capt. Robert Lee', role: 'Captain' },
      { name: 'FF Jake Morrison', role: 'Firefighter' },
      { name: 'FF Nina Patel', role: 'Firefighter' },
    ],
    currentIncident: null,
    eta: null,
    speed: 0,
    fuel: 100,
    equipment: ['Pump', 'Hose', 'First Aid'],
    lastUpdate: new Date(),
  },
  {
    id: 'HMT-UNIT-1',
    callSign: 'Hazmat 1',
    type: 'hazmat',
    status: 'dispatched',
    location: {
      coordinates: [40.7445, -73.9865],
      address: 'En route via 6th Ave',
      heading: 180,
    },
    crew: [
      { name: 'Specialist Mark Johnson', role: 'Hazmat Specialist' },
      { name: 'Tech Amy Clark', role: 'Hazmat Technician' },
    ],
    currentIncident: 'INC-2025-004',
    eta: '8 min',
    speed: 25,
    fuel: 73,
    equipment: ['Detection Equipment', 'Containment Gear', 'Decontamination'],
    lastUpdate: new Date(),
  },
];

export const mockRoutes = {
  'INC-2025-001': {
    vehicleRoutes: {
      'FD-ENGINE-54': {
        route: [
          [40.7614, -73.9776],
          [40.7601, -73.9821],
          [40.7589, -73.9851],
        ],
        distance: 2.3,
        duration: 180,
        traffic: 'moderate',
        alternatives: [
          {
            name: 'Via Broadway',
            distance: 2.8,
            duration: 240,
            traffic: 'heavy',
          },
          {
            name: 'Via 8th Ave',
            distance: 2.1,
            duration: 200,
            traffic: 'light',
          },
        ],
      },
    },
    optimizationHistory: [
      {
        timestamp: new Date('2025-01-15T14:32:00Z'),
        action: 'Route optimized due to traffic update',
        timeSaved: 45,
      },
    ],
  },
};

export const mockNotifications = [
  {
    id: 'N001',
    type: 'route-update',
    message: 'Route optimized for Engine 54 - ETA reduced by 45 seconds due to traffic clearance',
    timestamp: new Date('2025-01-15T14:32:00Z'),
    priority: 'high',
    read: false,
    incidentId: 'INC-2025-001',
  },
  {
    id: 'N002',
    type: 'traffic-alert',
    message: 'Heavy traffic detected on Broadway between 34th-42nd St - Alternative routes suggested',
    timestamp: new Date('2025-01-15T14:31:00Z'),
    priority: 'medium',
    read: false,
    affectedRoutes: ['FD-ENGINE-54', 'EMS-AMB-15'],
  },
  {
    id: 'N003',
    type: 'system-alert',
    message: 'WebSocket connection established - Real-time updates active',
    timestamp: new Date('2025-01-15T14:30:00Z'),
    priority: 'low',
    read: true,
  },
];

// WebSocket simulation class
export class MockWebSocket {
  constructor() {
    this.listeners = {
      open: [],
      message: [],
      close: [],
      error: [],
    };
    this.readyState = 1; // OPEN
    this.connected = false;
    
    // Simulate connection delay
    setTimeout(() => {
      this.connected = true;
      this.listeners.open.forEach(fn => fn());
      this.startSimulation();
    }, 1000);
  }

  addEventListener(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
  }

  removeEventListener(event, callback) {
    if (this.listeners[event]) {
      const index = this.listeners[event].indexOf(callback);
      if (index > -1) {
        this.listeners[event].splice(index, 1);
      }
    }
  }

  send(data) {
    console.log('Mock WebSocket send:', data);
  }

  close() {
    this.connected = false;
    this.readyState = 3; // CLOSED
    this.listeners.close.forEach(fn => fn());
  }

  startSimulation() {
    // Simulate real-time updates every 3-8 seconds
    setInterval(() => {
      if (!this.connected) return;

      const updateTypes = [
        'vehicle_location',
        'route_optimization',
        'incident_status',
        'traffic_update',
        'new_notification',
      ];

      const randomUpdate = updateTypes[Math.floor(Math.random() * updateTypes.length)];
      
      const mockMessage = {
        type: randomUpdate,
        timestamp: new Date().toISOString(),
        data: this.generateMockUpdate(randomUpdate),
      };

      this.listeners.message.forEach(fn => 
        fn({ data: JSON.stringify(mockMessage) })
      );
    }, Math.random() * 5000 + 3000); // 3-8 seconds
  }

  generateMockUpdate(type) {
    switch (type) {
      case 'vehicle_location':
        return {
          vehicleId: mockVehicles[Math.floor(Math.random() * mockVehicles.length)].id,
          location: {
            coordinates: [
              40.7589 + (Math.random() - 0.5) * 0.01,
              -73.9851 + (Math.random() - 0.5) * 0.01,
            ],
            heading: Math.floor(Math.random() * 360),
            speed: Math.floor(Math.random() * 50),
          },
        };
      
      case 'route_optimization':
        return {
          incidentId: mockIncidents[0].id,
          vehicleId: mockVehicles[0].id,
          newEta: Math.max(1, Math.floor(Math.random() * 10)) + ' min',
          timeSaved: Math.floor(Math.random() * 120),
        };
      
      case 'incident_status':
        return {
          incidentId: mockIncidents[Math.floor(Math.random() * mockIncidents.length)].id,
          status: ['active', 'dispatched', 'on-scene', 'resolved'][Math.floor(Math.random() * 4)],
        };
      
      case 'traffic_update':
        return {
          area: 'Manhattan Midtown',
          severity: ['light', 'moderate', 'heavy'][Math.floor(Math.random() * 3)],
          description: 'Traffic conditions updated based on live feeds',
        };
      
      case 'new_notification':
        return {
          id: `N${Date.now()}`,
          type: ['route-update', 'traffic-alert', 'system-alert'][Math.floor(Math.random() * 3)],
          message: 'System generated notification from WebSocket simulation',
          priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
        };
      
      default:
        return {};
    }
  }
}

// Utility functions
export const getTypeInfo = (typeId) => emergencyTypes.find(t => t.id === typeId);
export const getPriorityInfo = (priorityId) => priorityLevels.find(p => p.id === priorityId);
export const getStatusInfo = (statusId) => vehicleStatuses.find(s => s.id === statusId);

export const formatDuration = (seconds) => {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
};

export const formatDistance = (meters) => {
  if (meters < 1000) return `${meters}m`;
  return `${(meters / 1000).toFixed(1)}km`;
};

export const calculateETA = (distanceInMeters, speedKmh = 35) => {
  const timeInHours = (distanceInMeters / 1000) / speedKmh;
  const timeInSeconds = Math.round(timeInHours * 3600);
  return formatDuration(timeInSeconds);
};