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
  Activity,
  Shield,
  Radio
} from 'lucide-react';

const navigation = [
  { name: 'Command Center', href: '/', icon: Home, current: true, description: 'Main dispatch dashboard' },
  { name: 'Active Incidents', href: '/incidents', icon: AlertTriangle, current: false, description: 'Live incident management' },
  { name: 'Fleet Status', href: '/fleet', icon: Car, current: false, description: 'Vehicle tracking & status' },
  { name: 'Route Optimization', href: '/routes', icon: Route, current: false, description: 'AI-powered routing' },
  { name: 'Live Map', href: '/map', icon: MapPin, current: false, description: 'Real-time operations map' },
  { name: 'Communications', href: '/comms', icon: Radio, current: false, description: 'Radio & messaging' },
  { name: 'Analytics', href: '/analytics', icon: Activity, current: false, description: 'Performance metrics' },
  { name: 'Personnel', href: '/personnel', icon: Users, current: false, description: 'Crew management' },
];

const Sidebar = ({ currentPath = '/', onNavigate }) => {
  const isCurrentPath = (href) => {
    if (href === '/' && currentPath === '/') return true;
    if (href !== '/' && currentPath.startsWith(href)) return true;
    return false;
  };

  return (
    <div className="flex h-full w-72 flex-col bg-slate-950 border-r border-slate-800">
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/20 border border-red-500/30">
            <Shield className="h-5 w-5 text-red-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">EmergencyOps</h1>
            <p className="text-xs text-slate-400">Command & Control</p>
          </div>
        </div>
        <div className="flex h-2 w-2 rounded-full bg-green-400 animate-pulse" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-6">
        <div className="mb-4">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Operations
          </h2>
        </div>
        
        {navigation.map((item) => {
          const current = isCurrentPath(item.href);
          return (
            <button
              key={item.name}
              onClick={() => onNavigate && onNavigate(item.href)}
              className={cn(
                current
                  ? 'bg-slate-800/60 text-white border-slate-700/50 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/40 hover:text-white border-transparent',
                'group flex w-full items-center rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 border backdrop-blur-sm'
              )}
            >
              <item.icon
                className={cn(
                  current ? 'text-red-400' : 'text-slate-400 group-hover:text-red-400',
                  'mr-3 h-5 w-5 transition-colors'
                )}
                aria-hidden="true"
              />
              <div className="text-left flex-1">
                <div className={cn(current ? 'text-white' : 'text-slate-300 group-hover:text-white')}>
                  {item.name}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {item.description}
                </div>
              </div>
              {current && (
                <div className="ml-auto h-2 w-2 rounded-full bg-red-400" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Status Section */}
      <div className="border-t border-slate-800 p-4">
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">System Status</span>
            <span className="text-green-400 font-medium">Operational</span>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className="text-slate-400">Active</div>
              <div className="text-white font-bold">4</div>
            </div>
            <div className="text-center">
              <div className="text-slate-400">Units</div>
              <div className="text-white font-bold">12</div>
            </div>
            <div className="text-center">
              <div className="text-slate-400">Avg ETA</div>
              <div className="text-white font-bold">4.2m</div>
            </div>
          </div>
        </div>
        
        <button className="group flex w-full items-center rounded-lg px-4 py-3 text-sm font-medium text-slate-300 hover:bg-slate-800/40 hover:text-white transition-all duration-200 border border-transparent hover:border-slate-700/50">
          <Settings className="mr-3 h-5 w-5 text-slate-400 group-hover:text-white transition-colors" />
          <span>System Settings</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;