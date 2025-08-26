import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Bell, 
  X, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  Route,
  Activity,
  Wifi
} from 'lucide-react';
import { cn } from '../../lib/utils';
import websocketService from '../../services/websocketService';

const NotificationItem = ({ notification, onDismiss, onMarkRead }) => {
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'route-update':
        return <Route className="h-4 w-4 text-blue-400" />;
      case 'traffic-alert':
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case 'system-alert':
        return <Activity className="h-4 w-4 text-green-400" />;
      case 'vehicle-status':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      default:
        return <Info className="h-4 w-4 text-slate-400" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-red-500/30 bg-red-500/5';
      case 'medium':
        return 'border-yellow-500/30 bg-yellow-500/5';
      case 'low':
        return 'border-green-500/30 bg-green-500/5';
      default:
        return 'border-slate-500/30 bg-slate-500/5';
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div
      className={cn(
        "relative group rounded-lg border p-3 transition-all duration-200 hover:bg-slate-900/50",
        notification.read ? "opacity-60" : "opacity-100",
        getPriorityColor(notification.priority)
      )}
    >
      {/* Unread indicator */}
      {!notification.read && (
        <div className="absolute left-2 top-2 w-2 h-2 bg-red-400 rounded-full animate-pulse" />
      )}

      <div className="flex items-start space-x-3 pl-4">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {getNotificationIcon(notification.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-200 leading-relaxed">
            {notification.message}
          </p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-slate-400">
              {formatTime(notification.timestamp)}
            </p>
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs border",
                notification.priority === 'high' && "border-red-500/50 text-red-400",
                notification.priority === 'medium' && "border-yellow-500/50 text-yellow-400",
                notification.priority === 'low' && "border-green-500/50 text-green-400"
              )}
            >
              {notification.priority}
            </Badge>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {!notification.read && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMarkRead(notification.id)}
              className="h-6 w-6 p-0 text-slate-500 hover:text-blue-400"
              title="Mark as read"
            >
              <CheckCircle className="h-3 w-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDismiss(notification.id)}
            className="h-6 w-6 p-0 text-slate-500 hover:text-red-400"
            title="Dismiss"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const NotificationPanel = () => {
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Initialize with mock notifications
    const initialNotifications = [
      {
        id: 'N001',
        type: 'route-update',
        message: 'Route optimized for Engine 54 - ETA reduced by 45 seconds due to traffic clearance',
        timestamp: new Date(Date.now() - 2 * 60000), // 2 minutes ago
        priority: 'high',
        read: false,
      },
      {
        id: 'N002',
        type: 'traffic-alert',
        message: 'Heavy traffic detected on Broadway between 34th-42nd St - Alternative routes suggested',
        timestamp: new Date(Date.now() - 5 * 60000), // 5 minutes ago
        priority: 'medium',
        read: false,
      },
      {
        id: 'N003',
        type: 'system-alert',
        message: 'WebSocket connection established - Real-time updates active',
        timestamp: new Date(Date.now() - 30 * 60000), // 30 minutes ago
        priority: 'low',
        read: true,
      },
    ];
    
    setNotifications(initialNotifications);
    setUnreadCount(initialNotifications.filter(n => !n.read).length);

    // WebSocket connection monitoring
    const unsubscribeConnection = websocketService.subscribe('connection', (data) => {
      setIsConnected(data.status === 'connected');
    });

    // Listen for new notifications from WebSocket
    const unsubscribeNotifications = websocketService.subscribe('new_notification', (data) => {
      const newNotification = {
        id: `N${Date.now()}`,
        type: data.type || 'system-alert',
        message: data.message || 'System notification received',
        timestamp: new Date(),
        priority: data.priority || 'medium',
        read: false,
      };
      
      setNotifications(prev => [newNotification, ...prev.slice(0, 19)]); // Keep last 20
      setUnreadCount(prev => prev + 1);
    });

    // Listen for general WebSocket messages and create notifications
    const unsubscribeMessages = websocketService.subscribe('message', (message) => {
      if (message.type === 'route_optimization') {
        const notification = {
          id: `N${Date.now()}`,
          type: 'route-update',
          message: `Route optimized for ${message.data.vehicleId} - ETA: ${message.data.newEta}`,
          timestamp: new Date(),
          priority: 'high',
          read: false,
        };
        setNotifications(prev => [notification, ...prev.slice(0, 19)]);
        setUnreadCount(prev => prev + 1);
      }
      
      if (message.type === 'traffic_update') {
        const notification = {
          id: `N${Date.now()}`,
          type: 'traffic-alert',
          message: `Traffic update: ${message.data.description} in ${message.data.area}`,
          timestamp: new Date(),
          priority: 'medium',
          read: false,
        };
        setNotifications(prev => [notification, ...prev.slice(0, 19)]);
        setUnreadCount(prev => prev + 1);
      }
    });

    // Initial connection status
    setIsConnected(websocketService.getConnectionStatus());

    return () => {
      unsubscribeConnection();
      unsubscribeNotifications();
      unsubscribeMessages();
    };
  }, []);

  const handleDismiss = (id) => {
    const notification = notifications.find(n => n.id === id);
    if (notification && !notification.read) {
      setUnreadCount(prev => prev - 1);
    }
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleMarkRead = (id) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === id ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleClearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <Card className="h-full bg-slate-950/95 backdrop-blur-sm border-slate-800">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-white flex items-center space-x-2">
            <Bell className="h-5 w-5 text-yellow-400" />
            <span>Live Notifications</span>
            <div className="flex items-center space-x-1">
              {isConnected ? (
                <Wifi className="h-4 w-4 text-green-400" />
              ) : (
                <div className="h-4 w-4 rounded-full bg-red-500 animate-pulse" />
              )}
            </div>
          </CardTitle>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30 animate-pulse">
                {unreadCount} New
              </Badge>
            )}
          </div>
        </div>
        
        {notifications.length > 0 && (
          <div className="flex items-center space-x-2 mt-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleMarkAllRead}
              className="text-xs text-slate-400 hover:text-white"
              disabled={unreadCount === 0}
            >
              Mark All Read
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClearAll}
              className="text-xs text-slate-400 hover:text-red-400"
            >
              Clear All
            </Button>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-3 max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="text-center text-slate-400 py-8">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No notifications</p>
            <p className="text-xs mt-1">WebSocket: {isConnected ? 'Connected' : 'Disconnected'}</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onDismiss={handleDismiss}
              onMarkRead={handleMarkRead}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationPanel;