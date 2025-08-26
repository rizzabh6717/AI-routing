import React from 'react';
import { Bell, Search, User, Command } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';

const Header = () => {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200/20 bg-white/80 backdrop-blur-md px-6">
      {/* Search */}
      <div className="flex flex-1 items-center max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="search"
            placeholder="Search incidents, vehicles, locations..."
            className="pl-10 pr-4 bg-slate-50/50 border-slate-200/50 focus:border-blue-500/50 focus:ring-blue-500/20"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-slate-200 bg-slate-100 px-1.5 font-mono text-[10px] font-medium text-slate-600">
              <Command className="h-3 w-3" />K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center space-x-4">
        {/* Quick Stats */}
        <div className="hidden md:flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-slate-600">3 Active</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-yellow-400" />
            <span className="text-slate-600">2 Dispatched</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-blue-400" />
            <span className="text-slate-600">8 Available</span>
          </div>
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="sm" className="relative hover:bg-slate-100/50">
          <Bell className="h-5 w-5 text-slate-600" />
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
          >
            2
          </Badge>
        </Button>

        {/* User Profile */}
        <Button variant="ghost" size="sm" className="flex items-center space-x-2 hover:bg-slate-100/50">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-slate-900">Dispatcher Alpha</p>
            <p className="text-xs text-slate-500">Emergency Services</p>
          </div>
        </Button>
      </div>
    </header>
  );
};

export default Header;