import React from 'react';
import { RiskLevel } from '../types/security';

interface ScoreCircleProps {
  score: number;
  level: RiskLevel;
  size?: number;
  strokeWidth?: number;
}

export const ScoreCircle: React.FC<ScoreCircleProps> = ({
  score,
  level,
  size = 140,
  strokeWidth = 10,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const colorMap: Record<RiskLevel, { stroke: string; glow: string; text: string }> = {
    HIGH: { stroke: '#f43f5e', glow: 'rgba(244, 63, 94, 0.25)', text: 'text-rose-400' },
    MEDIUM: { stroke: '#f59e0b', glow: 'rgba(245, 158, 11, 0.25)', text: 'text-amber-400' },
    LOW: { stroke: '#10b981', glow: 'rgba(16, 185, 129, 0.25)', text: 'text-emerald-400' },
    UNVERIFIED: { stroke: '#64748b', glow: 'rgba(100, 116, 139, 0.2)', text: 'text-slate-400' },
  };

  const colors = colorMap[level] || colorMap.UNVERIFIED;

  return (
    <div
      className="relative flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Risk score ${score} out of 100, category ${level}`}
    >
      <svg width={size} height={size} className="-rotate-90">
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1e293b"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress Value */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          style={{
            transition: 'stroke-dashoffset 1s ease-in-out',
            filter: `drop-shadow(0 0 6px ${colors.glow})`,
          }}
        />
      </svg>
      {/* Centered Score */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className={`text-3xl font-extrabold font-mono tabular-nums tracking-tight ${colors.text}`}>
          {score}
        </span>
        <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
          Risk Score
        </span>
      </div>
    </div>
  );
};
