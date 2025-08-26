import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { mockNotifications } from '../../data/mockData';
import { Bell, X, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

const NotificationPanel = () => {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [newNotificationCount, setNewNotificationCount] = useState(0);

  useEffect(() => {
    // Simulate new notifications
    const interval = setInterval(() => {
      const shouldAddNotification = Math.random() > 0.8; // 20% chance
      if (shouldAddNotification) {
        const newNotification = {
          id: `N${Date.now()}`,
          type: 'route-update',
          message: 'Route optimized - ETA updated',
          timestamp: new Date(),
          priority: 'medium',
          read: false,
        };
        setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
        setNewNotificationCount(prev => prev + 1);
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleDismiss = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const handleMarkRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
    if (newNotificationCount > 0) {
      setNewNotificationCount(prev => prev - 1);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'route-update':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'traffic-alert':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'vehicle-status':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4 text-slate-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-red-200 bg-red-50/50';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50/50';
      case 'low':
        return 'border-green-200 bg-green-50/50';
      default:
        return 'border-slate-200 bg-slate-50/50';
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
    <Card className="h-full bg-white/80 backdrop-blur-sm border-slate-200/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Live Notifications</span>
          </CardTitle>
          {newNotificationCount > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              {newNotificationCount} New
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="text-center text-slate-500 py-8">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No notifications</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={cn(
                "relative group rounded-lg border p-3 transition-all duration-200 hover:shadow-sm",
                notification.read ? "opacity-60" : "opacity-100",
                getPriorityColor(notification.priority)
              )}
            >
              {/* Unread indicator */}
              {!notification.read && (
                <div className="absolute left-2 top-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              )}

              <div className="flex items-start space-x-3 pl-4">
                {/* Icon */}
                <div className="flex-shrink-0 mt-0.5">
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-800 leading-relaxed">
                    {notification.message}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {formatTime(notification.timestamp)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkRead(notification.id)}
                      className="h-6 w-6 p-0 text-slate-500 hover:text-blue-600"
                    >
                      <CheckCircle className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDismiss(notification.id)}
                    className="h-6 w-6 p-0 text-slate-500 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationPanel;