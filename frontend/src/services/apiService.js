import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token (future use)
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

class ApiService {
  // Health check
  async healthCheck() {
    try {
      const response = await apiClient.get('/health');
      return response.data;
    } catch (error) {
      throw new Error(`Health check failed: ${error.message}`);
    }
  }

  // ==================== INCIDENTS ====================
  
  async getIncidents(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.type) params.append('type', filters.type);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.limit) params.append('limit', filters.limit);
      
      const response = await apiClient.get(`/incidents?${params}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch incidents: ${error.message}`);
    }
  }

  async getIncidentById(incidentId) {
    try {
      const response = await apiClient.get(`/incidents/${incidentId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch incident: ${error.message}`);
    }
  }

  async createIncident(incidentData) {
    try {
      const response = await apiClient.post('/incidents/', incidentData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create incident: ${error.message}`);
    }
  }

  async updateIncidentStatus(incidentId, status, notes = null) {
    try {
      const params = new URLSearchParams({ status });
      if (notes) params.append('notes', notes);
      
      const response = await apiClient.put(`/incidents/${incidentId}/status?${params}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update incident status: ${error.message}`);
    }
  }

  async assignVehicleToIncident(incidentId, vehicleId) {
    try {
      const response = await apiClient.post(`/incidents/${incidentId}/assign/${vehicleId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to assign vehicle: ${error.message}`);
    }
  }

  async unassignVehicleFromIncident(incidentId, vehicleId) {
    try {
      const response = await apiClient.delete(`/incidents/${incidentId}/assign/${vehicleId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to unassign vehicle: ${error.message}`);
    }
  }

  async updateIncidentETA(incidentId, eta) {
    try {
      const response = await apiClient.put(`/incidents/${incidentId}/eta`, { eta });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update ETA: ${error.message}`);
    }
  }

  async searchIncidents(query) {
    try {
      const response = await apiClient.get(`/incidents/search/${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to search incidents: ${error.message}`);
    }
  }

  // ==================== VEHICLES ====================

  async getVehicles(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.type) params.append('type', filters.type);
      if (filters.limit) params.append('limit', filters.limit);
      
      const response = await apiClient.get(`/vehicles?${params}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch vehicles: ${error.message}`);
    }
  }

  async getVehicleById(vehicleId) {
    try {
      const response = await apiClient.get(`/vehicles/${vehicleId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch vehicle: ${error.message}`);
    }
  }

  async createVehicle(vehicleData) {
    try {
      const response = await apiClient.post('/vehicles/', vehicleData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create vehicle: ${error.message}`);
    }
  }

  async updateVehicleStatus(vehicleId, statusUpdate) {
    try {
      const response = await apiClient.put(`/vehicles/${vehicleId}/status`, statusUpdate);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update vehicle status: ${error.message}`);
    }
  }

  async updateVehicleLocation(vehicleId, location, speed = null) {
    try {
      const data = { ...location };
      if (speed !== null) data.speed = speed;
      
      const response = await apiClient.put(`/vehicles/${vehicleId}/location`, data);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update vehicle location: ${error.message}`);
    }
  }

  async updateVehicleFuel(vehicleId, fuelLevel) {
    try {
      const response = await apiClient.put(`/vehicles/${vehicleId}/fuel`, { fuel_level: fuelLevel });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update fuel level: ${error.message}`);
    }
  }

  async getAvailableVehiclesByType(emergencyType) {
    try {
      const response = await apiClient.get(`/vehicles/available/${emergencyType}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch available vehicles: ${error.message}`);
    }
  }

  async getVehiclesByIncident(incidentId) {
    try {
      const response = await apiClient.get(`/vehicles/incident/${incidentId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch vehicles for incident: ${error.message}`);
    }
  }

  async getVehicleStats() {
    try {
      const response = await apiClient.get('/vehicles/stats/summary');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch vehicle stats: ${error.message}`);
    }
  }

  async searchVehicles(query) {
    try {
      const response = await apiClient.get(`/vehicles/search/${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to search vehicles: ${error.message}`);
    }
  }

  // ==================== ROUTES ====================

  async getRoutesForIncident(incidentId) {
    try {
      const response = await apiClient.get(`/routes/${incidentId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch routes: ${error.message}`);
    }
  }

  async optimizeRoutes(incidentIds = null) {
    try {
      const data = incidentIds ? { incident_ids: incidentIds } : {};
      const response = await apiClient.post('/routes/optimize', data);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to optimize routes: ${error.message}`);
    }
  }

  async getCurrentRoute(vehicleId) {
    try {
      const response = await apiClient.get(`/routes/vehicle/${vehicleId}/current`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get current route: ${error.message}`);
    }
  }

  async recalculateVehicleRoute(vehicleId) {
    try {
      const response = await apiClient.post(`/routes/recalculate/${vehicleId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to recalculate route: ${error.message}`);
    }
  }

  async findNearestVehicles(incidentId, maxDistanceKm = 10.0) {
    try {
      const response = await apiClient.get(`/routes/nearest/${incidentId}?max_distance_km=${maxDistanceKm}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to find nearest vehicles: ${error.message}`);
    }
  }

  async simulateTrafficConditions(area = 'Manhattan Midtown') {
    try {
      const response = await apiClient.get(`/routes/traffic/simulation?area=${encodeURIComponent(area)}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to simulate traffic: ${error.message}`);
    }
  }

  // ==================== SYSTEM STATS ====================

  async getSystemStats() {
    try {
      const response = await apiClient.get('/incidents/stats/summary');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch system stats: ${error.message}`);
    }
  }

  async getWebSocketStats() {
    try {
      const response = await apiClient.get('/ws/stats');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch WebSocket stats: ${error.message}`);
    }
  }

  // ==================== UTILITY METHODS ====================

  async testConnection() {
    try {
      const response = await apiClient.get('/');
      return response.data;
    } catch (error) {
      throw new Error(`Connection test failed: ${error.message}`);
    }
  }

  // Format API errors for user display
  formatError(error) {
    if (error.response?.data?.detail) {
      return error.response.data.detail;
    }
    return error.message || 'An unknown error occurred';
  }

  // Check if API is available
  async isApiAvailable() {
    try {
      await this.healthCheck();
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
const apiService = new ApiService();
export default apiService;