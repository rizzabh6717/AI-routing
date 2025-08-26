import React, { useState, useEffect } from 'react';
import { Bell, Search, User, Command, Wifi, WifiOff, Clock } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { useWebSocket } from '../../hooks/useWebSocket';

const Header = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications, setNotifications] = useState(2);

  useEffect(() => {
    // Update time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // WebSocket connection monitoring
    const unsubscribe = websocketService.subscribe('connection', (data) => {
      setIsConnected(data.status === 'connected');
    });

    // Initial connection status
    setIsConnected(websocketService.getConnectionStatus());

    return () => {
      clearInterval(timeInterval);
      unsubscribe();
    };
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950/95 backdrop-blur-md px-6">
      {/* Left Section - Search */}
      <div className="flex flex-1 items-center max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="search"
            placeholder="Search incidents, units, locations..."
            className="pl-10 pr-16 bg-slate-800/50 border-slate-700 focus:border-red-500/50 focus:ring-red-500/20 text-white placeholder-slate-400"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-slate-600 bg-slate-700 px-2 font-mono text-[10px] font-medium text-slate-300">
              <Command className="h-3 w-3" />K
            </kbd>
          </div>
        </div>
      </div>

      {/* Center Section - Time & Date */}
      <div className="hidden md:flex items-center space-x-4 mx-8">
        <div className="text-center">
          <div className="text-lg font-mono text-white">{formatTime(currentTime)}</div>
          <div className="text-xs text-slate-400">{formatDate(currentTime)}</div>
        </div>
      </div>

      {/* Right Section - Status & User */}
      <div className="flex items-center space-x-4">
        {/* Connection Status */}
        <div className="hidden lg:flex items-center space-x-2 text-sm">
          {isConnected ? (
            <div className="flex items-center space-x-1 text-green-400">
              <Wifi className="h-4 w-4" />
              <span>Live</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1 text-red-400">
              <WifiOff className="h-4 w-4" />
              <span>Offline</span>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="hidden md:flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
            <span className="text-slate-300">4 Active</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-yellow-400" />
            <span className="text-slate-300">6 Dispatched</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-green-400" />
            <span className="text-slate-300">12 Available</span>
          </div>
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="sm" className="relative text-slate-300 hover:text-white hover:bg-slate-800">
          <Bell className="h-5 w-5" />
          {notifications > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center animate-pulse"
            >
              {notifications}
            </Badge>
          )}
        </Button>

        {/* User Profile */}
        <Button variant="ghost" size="sm" className="flex items-center space-x-2 text-slate-300 hover:text-white hover:bg-slate-800">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-white">Dispatcher Alpha</p>
            <p className="text-xs text-slate-400">Emergency Operations</p>
          </div>
        </Button>
      </div>
    </header>
  );
};

export default Header;