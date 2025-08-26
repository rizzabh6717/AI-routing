import React from 'react';
import { cn } from '../../lib/utils';

const StatsCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'neutral',
  icon: Icon,
  description,
  className = ''
}) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      default:
        return 'text-slate-500';
    }
  };

  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl border border-slate-200/50 bg-white/80 backdrop-blur-sm p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]",
      className
    )}>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white to-slate-50/50 -z-10" />
      
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <div className="mt-2 flex items-baseline space-x-2">
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            {change && (
              <span className={cn("text-sm font-medium", getChangeColor())}>
                {change}
              </span>
            )}
          </div>
          {description && (
            <p className="mt-1 text-xs text-slate-500">{description}</p>
          )}
        </div>
        {Icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100/60 backdrop-blur-sm">
            <Icon className="h-6 w-6 text-slate-600" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;