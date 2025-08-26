class RealWebSocketService {
  constructor() {
    this.ws = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.isConnected = false;
    this.clientId = null;
    this.subscriptions = new Set();
    
    // Get WebSocket URL from environment
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    this.wsUrl = backendUrl.replace('http', 'ws') + '/api/ws';
  }

  connect() {
    try {
      this.ws = new WebSocket(this.wsUrl);
      
      this.ws.onopen = this.onOpen.bind(this);
      this.ws.onmessage = this.onMessage.bind(this);
      this.ws.onclose = this.onClose.bind(this);
      this.ws.onerror = this.onError.bind(this);
      
      console.log('WebSocket connection initiated to:', this.wsUrl);
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      this.attemptReconnect();
    }
  }

  onOpen(event) {
    console.log('WebSocket connected to backend');
    this.isConnected = true;
    this.reconnectAttempts = 0;
    this.notifyListeners('connection', { status: 'connected' });
  }

  onMessage(event) {
    try {
      const message = JSON.parse(event.data);
      console.log('WebSocket message received from backend:', message);
      
      // Handle connection confirmation
      if (message.type === 'connection' && message.client_id) {
        this.clientId = message.client_id;
      }
      
      // Notify specific listeners based on message type
      this.notifyListeners(message.type, message.data || message);
      this.notifyListeners('message', message);
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  onClose(event) {
    console.log('WebSocket disconnected from backend:', event);
    this.isConnected = false;
    this.notifyListeners('connection', { status: 'disconnected' });
    
    // Attempt reconnection if not a clean close
    if (event.code !== 1000) {
      this.attemptReconnect();
    }
  }

  onError(error) {
    console.error('WebSocket error:', error);
    this.notifyListeners('error', { error });
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
      console.log(`Reconnection attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts} in ${delay}ms`);
      
      setTimeout(() => {
        this.reconnectAttempts++;
        this.connect();
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
      this.notifyListeners('connection', { status: 'failed' });
    }
  }

  subscribe(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType).add(callback);
    
    // Track subscriptions for server-side filtering (future feature)
    this.subscriptions.add(eventType);
    
    // Send subscription message to server
    if (this.isConnected) {
      this.send({
        type: 'subscribe',
        events: [eventType]
      });
    }
    
    return () => {
      this.unsubscribe(eventType, callback);
    };
  }

  unsubscribe(eventType, callback) {
    if (this.listeners.has(eventType)) {
      this.listeners.get(eventType).delete(callback);
      
      // If no more listeners for this event type, unsubscribe from server
      if (this.listeners.get(eventType).size === 0) {
        this.subscriptions.delete(eventType);
        
        if (this.isConnected) {
          this.send({
            type: 'unsubscribe',
            events: [eventType]
          });
        }
      }
    }
  }

  notifyListeners(eventType, data) {
    if (this.listeners.has(eventType)) {
      this.listeners.get(eventType).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in WebSocket listener for ${eventType}:`, error);
        }
      });
    }
  }

  send(message) {
    if (this.ws && this.isConnected) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected. Message not sent:', message);
    }
  }

  // Send ping to keep connection alive
  ping() {
    if (this.isConnected) {
      this.send({ type: 'ping' });
    }
  }

  // Request specific updates from server
  requestUpdate(updateType, params = {}) {
    if (this.isConnected) {
      this.send({
        type: 'request_update',
        update_type: updateType,
        ...params
      });
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    this.isConnected = false;
    this.clientId = null;
  }

  getConnectionStatus() {
    return this.isConnected;
  }

  getClientId() {
    return this.clientId;
  }

  getSubscriptions() {
    return Array.from(this.subscriptions);
  }

  // Health check
  isHealthy() {
    return this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  // Get connection stats
  getStats() {
    return {
      connected: this.isConnected,
      clientId: this.clientId,
      subscriptions: this.getSubscriptions(),
      reconnectAttempts: this.reconnectAttempts,
      wsUrl: this.wsUrl
    };
  }
}

// Create singleton instance
const realWebSocketService = new RealWebSocketService();

export default realWebSocketService;