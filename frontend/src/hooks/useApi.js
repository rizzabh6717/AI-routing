import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/apiService';
import { useToast } from './use-toast';

export const useApi = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  // Test API connection on mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        await apiService.testConnection();
        setIsConnected(true);
        setError(null);
      } catch (err) {
        setIsConnected(false);
        setError(err.message);
        console.error('API connection failed:', err);
      }
    };

    testConnection();
    
    // Test connection periodically
    const interval = setInterval(testConnection, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Generic API call wrapper
  const callApi = useCallback(async (apiFunction, showSuccessToast = false, successMessage = '') => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await apiFunction();
      
      if (showSuccessToast && successMessage) {
        toast({
          title: "Success",
          description: successMessage,
        });
      }
      
      return result;
    } catch (err) {
      const errorMessage = apiService.formatError(err);
      setError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    isConnected,
    isLoading,
    error,
    callApi,
    apiService
  };
};

// Hook for incidents
export const useIncidents = () => {
  const [incidents, setIncidents] = useState([]);
  const { callApi, isLoading, error } = useApi();

  const fetchIncidents = useCallback(async (filters = {}) => {
    const data = await callApi(() => apiService.getIncidents(filters));
    setIncidents(data);
    return data;
  }, [callApi]);

  const createIncident = useCallback(async (incidentData) => {
    const newIncident = await callApi(
      () => apiService.createIncident(incidentData),
      true,
      'Incident created successfully'
    );
    setIncidents(prev => [newIncident, ...prev]);
    return newIncident;
  }, [callApi]);

  const updateIncidentStatus = useCallback(async (incidentId, status, notes) => {
    const result = await callApi(
      () => apiService.updateIncidentStatus(incidentId, status, notes),
      true,
      'Incident status updated'
    );
    
    // Update local state
    setIncidents(prev => prev.map(incident => 
      incident.id === incidentId 
        ? { ...incident, status, notes, last_update: new Date() }
        : incident
    ));
    
    return result;
  }, [callApi]);

  const searchIncidents = useCallback(async (query) => {
    return await callApi(() => apiService.searchIncidents(query));
  }, [callApi]);

  return {
    incidents,
    isLoading,
    error,
    fetchIncidents,
    createIncident,
    updateIncidentStatus,
    searchIncidents
  };
};

// Hook for vehicles
export const useVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const { callApi, isLoading, error } = useApi();

  const fetchVehicles = useCallback(async (filters = {}) => {
    const data = await callApi(() => apiService.getVehicles(filters));
    setVehicles(data);
    return data;
  }, [callApi]);

  const updateVehicleStatus = useCallback(async (vehicleId, statusUpdate) => {
    const result = await callApi(
      () => apiService.updateVehicleStatus(vehicleId, statusUpdate),
      true,
      'Vehicle status updated'
    );
    
    // Update local state
    setVehicles(prev => prev.map(vehicle => 
      vehicle.id === vehicleId 
        ? { ...vehicle, ...statusUpdate, last_update: new Date() }
        : vehicle
    ));
    
    return result;
  }, [callApi]);

  const updateVehicleLocation = useCallback(async (vehicleId, location, speed) => {
    const result = await callApi(() => apiService.updateVehicleLocation(vehicleId, location, speed));
    
    // Update local state
    setVehicles(prev => prev.map(vehicle => 
      vehicle.id === vehicleId 
        ? { ...vehicle, location, speed, last_update: new Date() }
        : vehicle
    ));
    
    return result;
  }, [callApi]);

  const searchVehicles = useCallback(async (query) => {
    return await callApi(() => apiService.searchVehicles(query));
  }, [callApi]);

  return {
    vehicles,
    isLoading,
    error,
    fetchVehicles,
    updateVehicleStatus,
    updateVehicleLocation,
    searchVehicles
  };
};

// Hook for routes
export const useRoutes = () => {
  const { callApi, isLoading, error } = useApi();

  const getRoutesForIncident = useCallback(async (incidentId) => {
    return await callApi(() => apiService.getRoutesForIncident(incidentId));
  }, [callApi]);

  const optimizeRoutes = useCallback(async (incidentIds = null) => {
    return await callApi(
      () => apiService.optimizeRoutes(incidentIds),
      true,
      'Routes optimized successfully'
    );
  }, [callApi]);

  const recalculateRoute = useCallback(async (vehicleId) => {
    return await callApi(
      () => apiService.recalculateVehicleRoute(vehicleId),
      true,
      'Route recalculated'
    );
  }, [callApi]);

  const findNearestVehicles = useCallback(async (incidentId, maxDistance = 10.0) => {
    return await callApi(() => apiService.findNearestVehicles(incidentId, maxDistance));
  }, [callApi]);

  return {
    isLoading,
    error,
    getRoutesForIncident,
    optimizeRoutes,
    recalculateRoute,
    findNearestVehicles
  };
};

// Hook for system stats
export const useSystemStats = () => {
  const [stats, setStats] = useState(null);
  const { callApi, isLoading, error } = useApi();

  const fetchStats = useCallback(async () => {
    const data = await callApi(() => apiService.getSystemStats());
    setStats(data);
    return data;
  }, [callApi]);

  // Auto-refresh stats
  useEffect(() => {
    fetchStats();
    
    const interval = setInterval(fetchStats, 10000); // Every 10 seconds
    
    return () => clearInterval(interval);
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    fetchStats
  };
};