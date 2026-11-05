import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  color?: 'blue' | 'teal' | 'amber' | 'emerald' | 'rose' | 'indigo';
  onClick?: () => void;
  active?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  change,
  changeType = 'neutral',
  color = 'blue',
  onClick,
  active = false,
}) => {
  const colorMap = {
    blue: 'text-blue-600 bg-blue-50 border-blue-100',
    teal: 'text-teal-700 bg-teal-50 border-teal-100',
    amber: 'text-amber-700 bg-amber-50 border-amber-100',
    emerald: 'text-emerald-700 bg-emerald-50 border-emerald-100',
    rose: 'text-rose-700 bg-rose-50 border-rose-100',
    indigo: 'text-indigo-700 bg-indigo-50 border-indigo-100',
  };

  return (
    <div
      onClick={onClick}
      className={`p-5 rounded-xl bg-white border transition-all ${
        active
          ? 'border-blue-600 shadow-sm ring-1 ring-blue-600'
          : 'border-slate-200 hover:border-slate-300 shadow-xs'
      } ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</span>
        <div className={`p-2 rounded-lg border ${colorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl lg:text-3xl font-bold text-slate-900 font-mono tabular-nums tracking-tight">
          {value}
        </span>
        {change && (
          <span
            className={`text-xs font-semibold ${
              changeType === 'positive'
                ? 'text-emerald-700'
                : changeType === 'negative'
                ? 'text-rose-700'
                : 'text-slate-500'
            }`}
          >
            {change}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
    </div>
  );
};
