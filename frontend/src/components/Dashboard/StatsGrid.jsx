import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  AlertTriangle, 
  Car, 
  Clock, 
  CheckCircle, 
  Activity,
  TrendingUp,
  TrendingDown,
  Users
} from 'lucide-react';
import { cn } from '../../lib/utils';

const StatCard = ({ 
  title, 
  value, 
  subtitle,
  change, 
  changeType = 'neutral',
  icon: Icon,
  trend,
  color = 'slate'
}) => {
  const colorClasses = {
    red: 'from-red-500/10 to-red-600/5 border-red-500/20',
    yellow: 'from-yellow-500/10 to-yellow-600/5 border-yellow-500/20',
    green: 'from-green-500/10 to-green-600/5 border-green-500/20',
    blue: 'from-blue-500/10 to-blue-600/5 border-blue-500/20',
    purple: 'from-purple-500/10 to-purple-600/5 border-purple-500/20',
    slate: 'from-slate-500/10 to-slate-600/5 border-slate-500/20',
  };

  const iconColors = {
    red: 'text-red-400',
    yellow: 'text-yellow-400',
    green: 'text-green-400',
    blue: 'text-blue-400',
    purple: 'text-purple-400',
    slate: 'text-slate-400',
  };

  const getTrendIcon = () => {
    if (changeType === 'positive') return <TrendingUp className="h-3 w-3 text-green-400" />;
    if (changeType === 'negative') return <TrendingDown className="h-3 w-3 text-red-400" />;
    return null;
  };

  const getChangeColor = () => {
    switch (changeType) {
      case 'positive': return 'text-green-400';
      case 'negative': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <Card className={cn(
      "relative overflow-hidden border bg-gradient-to-br backdrop-blur-sm hover:scale-[1.02] transition-all duration-300",
      colorClasses[color]
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-slate-400">{title}</CardTitle>
          <Icon className={cn("h-5 w-5", iconColors[color])} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white">{value}</span>
            {change && (
              <div className={cn("flex items-center space-x-1 text-sm", getChangeColor())}>
                {getTrendIcon()}
                <span>{change}</span>
              </div>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500">{subtitle}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const StatsGrid = ({ incidents, vehicles }) => {
  // Calculate statistics
  const activeIncidents = incidents.filter(i => i.status === 'active').length;
  const criticalIncidents = incidents.filter(i => i.priority === 'critical').length;
  const dispatchedVehicles = vehicles.filter(v => v.status === 'dispatched').length;
  const availableVehicles = vehicles.filter(v => v.status === 'available').length;
  const onSceneVehicles = vehicles.filter(v => v.status === 'on-scene').length;
  
  // Calculate average ETA for dispatched vehicles
  const dispatchedWithETA = vehicles.filter(v => v.status === 'dispatched' && v.eta && v.eta !== 'On Scene');
  const avgETA = dispatchedWithETA.length > 0 
    ? Math.round(dispatchedWithETA.reduce((sum, v) => sum + parseInt(v.eta), 0) / dispatchedWithETA.length)
    : 0;

  // Calculate total crew members
  const totalCrew = vehicles.reduce((sum, v) => sum + v.crew.length, 0);

  const stats = [
    {
      title: 'Active Incidents',
      value: activeIncidents,
      subtitle: `${criticalIncidents} critical priority`,
      change: '+2 from last hour',
      changeType: 'warning',
      icon: AlertTriangle,
      color: 'red'
    },
    {
      title: 'Units Dispatched',
      value: dispatchedVehicles,
      subtitle: 'En route to incidents',
      change: '+3 in last 15min',
      changeType: 'positive',
      icon: Car,
      color: 'yellow'
    },
    {
      title: 'Avg Response Time',
      value: `${avgETA}m`,
      subtitle: 'Target: <5 minutes',
      change: '-30s improved',
      changeType: 'positive',
      icon: Clock,
      color: 'blue'
    },
    {
      title: 'Available Units',
      value: availableVehicles,
      subtitle: 'Ready for dispatch',
      change: 'All operational',
      changeType: 'positive',
      icon: CheckCircle,
      color: 'green'
    },
    {
      title: 'On Scene',
      value: onSceneVehicles,
      subtitle: 'Active response',
      change: 'Current operations',
      changeType: 'neutral',
      icon: Activity,
      color: 'purple'
    },
    {
      title: 'Personnel',
      value: totalCrew,
      subtitle: 'Active crew members',
      change: '100% staffed',
      changeType: 'positive',
      icon: Users,
      color: 'slate'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};

export default StatsGrid;