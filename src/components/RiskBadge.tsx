import React from 'react';
import { RiskLevel } from '../types/security';
import { AlertTriangle, AlertCircle, CheckCircle2, HelpCircle } from 'lucide-react';

interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  size = 'md',
  showIcon = true,
}) => {
  const configs = {
    HIGH: {
      label: 'HIGH RISK',
      classes: 'bg-rose-500 text-white border border-rose-400 font-extrabold shadow-[0_0_15px_rgba(244,63,94,0.3)]',
      icon: AlertCircle,
    },
    MEDIUM: {
      label: 'MEDIUM RISK',
      classes: 'bg-amber-500 text-white border border-amber-400 font-bold shadow-[0_0_8px_rgba(245,158,11,0.2)]',
      icon: AlertTriangle,
    },
    LOW: {
      label: 'LOW RISK',
      classes: 'bg-emerald-500 text-white border border-emerald-400 font-medium',
      icon: CheckCircle2,
    },
    UNVERIFIED: {
      label: 'UNVERIFIED',
      classes: 'bg-transparent text-white/50 border border-dashed border-white/20 font-normal',
      icon: HelpCircle,
    },
  };

  const config = configs[level] || configs.UNVERIFIED;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-semibold',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold',
  }[size];

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-md ${config.classes} ${sizeClasses} tracking-wider font-mono uppercase whitespace-nowrap transition-all`}
    >
      {showIcon && <Icon size={iconSizes} className="shrink-0" />}
      <span>{config.label}</span>
    </span>
  );
};
