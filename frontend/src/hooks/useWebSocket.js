import { useState, useEffect, useCallback, useRef } from 'react';
import realWebSocketService from '../services/realWebSocketService';

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [clientId, setClientId] = useState(null);
  const [connectionError, setConnectionError] = useState(null);
  const subscriptionsRef = useRef(new Map());

  useEffect(() => {
    // Connect to WebSocket
    realWebSocketService.connect();

    // Subscribe to connection events
    const unsubscribeConnection = realWebSocketService.subscribe('connection', (data) => {
      setIsConnected(data.status === 'connected');
      if (data.status === 'connected') {
        setConnectionError(null);
      } else if (data.status === 'failed') {
        setConnectionError('Failed to connect to WebSocket server');
      }
    });

    // Get initial connection status
    setIsConnected(realWebSocketService.getConnectionStatus());
    setClientId(realWebSocketService.getClientId());

    // Set up periodic health check
    const healthCheckInterval = setInterval(() => {
      if (!realWebSocketService.isHealthy()) {
        setConnectionError('WebSocket connection lost');
      }
    }, 5000);

    return () => {
      unsubscribeConnection();
      clearInterval(healthCheckInterval);
      
      // Clean up all subscriptions
      subscriptionsRef.current.forEach((unsubscribe) => {
        unsubscribe();
      });
      subscriptionsRef.current.clear();
      
      realWebSocketService.disconnect();
    };
  }, []);

  const subscribe = useCallback((eventType, callback) => {
    const unsubscribe = realWebSocketService.subscribe(eventType, callback);
    
    // Store the unsubscribe function
    const subscriptionId = `${eventType}_${Date.now()}`;
    subscriptionsRef.current.set(subscriptionId, unsubscribe);
    
    // Return cleanup function
    return () => {
      unsubscribe();
      subscriptionsRef.current.delete(subscriptionId);
    };
  }, []);

  const sendMessage = useCallback((message) => {
    realWebSocketService.send(message);
  }, []);

  const requestUpdate = useCallback((updateType, params = {}) => {
    realWebSocketService.requestUpdate(updateType, params);
  }, []);

  const ping = useCallback(() => {
    realWebSocketService.ping();
  }, []);

  const getStats = useCallback(() => {
    return realWebSocketService.getStats();
  }, []);

  return {
    isConnected,
    clientId,
    connectionError,
    subscribe,
    sendMessage,
    requestUpdate,
    ping,
    getStats
  };
};

// Specific hooks for different event types
export const useVehicleUpdates = (callback) => {
  const { subscribe } = useWebSocket();
  
  useEffect(() => {
    const unsubscribe = subscribe('vehicle_location', callback);
    return unsubscribe;
  }, [subscribe, callback]);
};

export const useIncidentUpdates = (callback) => {
  const { subscribe } = useWebSocket();
  
  useEffect(() => {
    const unsubscribe = subscribe('incident_status', callback);
    return unsubscribe;
  }, [subscribe, callback]);
};

export const useRouteUpdates = (callback) => {
  const { subscribe } = useWebSocket();
  
  useEffect(() => {
    const unsubscribe = subscribe('route_optimization', callback);
    return unsubscribe;
  }, [subscribe, callback]);
};

export const useTrafficUpdates = (callback) => {
  const { subscribe } = useWebSocket();
  
  useEffect(() => {
    const unsubscribe = subscribe('traffic_update', callback);
    return unsubscribe;
  }, [subscribe, callback]);
};

export const useNotificationUpdates = (callback) => {
  const { subscribe } = useWebSocket();
  
  useEffect(() => {
    const unsubscribe = subscribe('new_notification', callback);
    return unsubscribe;
  }, [subscribe, callback]);
};