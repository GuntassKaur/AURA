import React from 'react';

interface RiskGaugeProps {
  score: number; // 0 to 1
  size?: number;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ score, size = 120 }) => {
  const radius = size * 0.4;
  const strokeWidth = size * 0.08;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - score * circumference;

  // Determine colors based on severity
  let strokeColor = '#22d3ee'; // cyan
  let shadowColor = 'rgba(34, 211, 238, 0.4)';
  let label = 'LOW';
  
  if (score >= 0.8) {
    strokeColor = '#ef4444'; // red
    shadowColor = 'rgba(239, 68, 68, 0.5)';
    label = 'FREEZE';
  } else if (score >= 0.6) {
    strokeColor = '#f97316'; // orange
    shadowColor = 'rgba(249, 115, 22, 0.4)';
    label = 'HOLD';
  } else if (score >= 0.3) {
    strokeColor = '#eab308'; // yellow
    shadowColor = 'rgba(234, 179, 8, 0.4)';
    label = 'WATCH';
  }

  return (
    <div className="flex flex-col items-center justify-center relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="rgba(34, 211, 238, 0.05)"
          strokeWidth={strokeWidth}
        />
        {/* Dynamic active arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            filter: `drop-shadow(0 0 6px ${shadowColor})`,
            transition: 'stroke-dashoffset 0.8s ease-in-out, stroke 0.5s ease'
          }}
        />
      </svg>
      
      {/* Absolute overlay for text score inside dial */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold font-mono tracking-tighter" style={{ color: strokeColor }}>
          {Math.round(score * 100)}%
        </span>
        <span className="text-[9px] font-mono tracking-widest text-slate-400 font-bold">
          {label}
        </span>
      </div>
    </div>
  );
};
