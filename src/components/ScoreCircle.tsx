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

  const styleMap: Record<RiskLevel, { stroke: string; glow: string; text: string; dashPattern?: string }> = {
    HIGH: {
      stroke: '#f43f5e',
      glow: 'rgba(244, 63, 94, 0.4)',
      text: 'text-rose-500 font-extrabold',
    },
    MEDIUM: {
      stroke: '#f59e0b',
      glow: 'rgba(245, 158, 11, 0.25)',
      text: 'text-amber-500 font-bold',
      dashPattern: '8,4',
    },
    LOW: {
      stroke: '#10b981',
      glow: 'rgba(16, 185, 129, 0.15)',
      text: 'text-emerald-500 font-semibold',
    },
    UNVERIFIED: {
      stroke: 'rgba(255, 255, 255, 0.35)',
      glow: 'transparent',
      text: 'text-white/50 font-normal',
      dashPattern: '3,4',
    },
  };

  const currentStyle = styleMap[level] || styleMap.UNVERIFIED;

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
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress Value */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={currentStyle.stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          style={{
            transition: 'stroke-dashoffset 1s ease-in-out',
            filter: currentStyle.glow !== 'transparent' ? `drop-shadow(0 0 8px ${currentStyle.glow})` : 'none',
          }}
        />
      </svg>
      {/* Centered Score */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className={`text-3xl font-mono tabular-nums tracking-tight ${currentStyle.text}`}>
          {score}
        </span>
        <span className="text-[10px] uppercase font-mono tracking-wider text-white/40">
          Risk Score
        </span>
      </div>
    </div>
  );
};
