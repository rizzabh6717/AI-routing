import React from 'react';
import { cn } from '../../lib/utils';
import { 
  Home, 
  AlertTriangle, 
  Car, 
  MapPin, 
  Users, 
  Settings, 
  Bell,
  Route,
  Activity
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home, current: true },
  { name: 'Active Incidents', href: '/incidents', icon: AlertTriangle, current: false },
  { name: 'Fleet Management', href: '/fleet', icon: Car, current: false },
  { name: 'Route Optimization', href: '/routes', icon: Route, current: false },
  { name: 'Live Map', href: '/map', icon: MapPin, current: false },
  { name: 'Activity Monitor', href: '/activity', icon: Activity, current: false },
  { name: 'Team Management', href: '/team', icon: Users, current: false },
];

const Sidebar = ({ currentPath = '/', onNavigate }) => {
  const isCurrentPath = (href) => {
    if (href === '/' && currentPath === '/') return true;
    if (href !== '/' && currentPath.startsWith(href)) return true;
    return false;
  };

  return (
    <div className="flex h-full w-64 flex-col bg-slate-900/95 backdrop-blur-md border-r border-slate-800">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/20 border border-red-500/30">
            <AlertTriangle className="h-5 w-5 text-red-400" />
          </div>
          <span className="text-lg font-semibold text-white">EmergencyOps</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const current = isCurrentPath(item.href);
          return (
            <button
              key={item.name}
              onClick={() => onNavigate && onNavigate(item.href)}
              className={cn(
                current
                  ? 'bg-slate-800/60 text-white border border-slate-700/50'
                  : 'text-slate-300 hover:bg-slate-800/40 hover:text-white border border-transparent',
                'group flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:scale-[1.02]'
              )}
            >
              <item.icon
                className={cn(
                  current ? 'text-white' : 'text-slate-400 group-hover:text-white',
                  'mr-3 h-5 w-5 transition-colors'
                )}
                aria-hidden="true"
              />
              {item.name}
              {current && (
                <div className="ml-auto h-2 w-2 rounded-full bg-red-400" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-slate-800 p-3">
        <button className="group flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800/40 hover:text-white transition-all duration-200">
          <Settings className="mr-3 h-5 w-5 text-slate-400 group-hover:text-white transition-colors" />
          Settings
        </button>
        <div className="mt-2 flex items-center justify-between px-3 py-2">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-slate-400">System Online</span>
          </div>
          <Bell className="h-4 w-4 text-slate-400" />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;