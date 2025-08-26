import { MockWebSocket } from '../data/mockData';

class WebSocketService {
  constructor() {
    this.ws = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.isConnected = false;
  }

  connect() {
    try {
      // For MVP, use MockWebSocket for simulation
      // In production, this would be: new WebSocket(WS_URL)
      this.ws = new MockWebSocket();
      
      this.ws.addEventListener('open', this.onOpen.bind(this));
      this.ws.addEventListener('message', this.onMessage.bind(this));
      this.ws.addEventListener('close', this.onClose.bind(this));
      this.ws.addEventListener('error', this.onError.bind(this));
      
      console.log('WebSocket connection initiated...');
    } catch (error) {
      console.error('WebSocket connection failed:', error);
    }
  }

  onOpen() {
    console.log('WebSocket connected');
    this.isConnected = true;
    this.reconnectAttempts = 0;
    this.notifyListeners('connection', { status: 'connected' });
  }

  onMessage(event) {
    try {
      const message = JSON.parse(event.data);
      console.log('WebSocket message received:', message);
      
      // Notify specific listeners based on message type
      this.notifyListeners(message.type, message.data);
      this.notifyListeners('message', message);
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  onClose(event) {
    console.log('WebSocket disconnected:', event);
    this.isConnected = false;
    this.notifyListeners('connection', { status: 'disconnected' });
    
    // Attempt reconnection
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.reconnectAttempts++;
        console.log(`Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
        this.connect();
      }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts));
    }
  }

  onError(error) {
    console.error('WebSocket error:', error);
    this.notifyListeners('error', { error });
  }

  subscribe(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType).add(callback);
    
    return () => {
      this.unsubscribe(eventType, callback);
    };
  }

  unsubscribe(eventType, callback) {
    if (this.listeners.has(eventType)) {
      this.listeners.get(eventType).delete(callback);
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

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  getConnectionStatus() {
    return this.isConnected;
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

export default websocketService;