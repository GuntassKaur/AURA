import React from 'react';
import clsx from 'clsx';

interface GlassPanelProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  glow?: boolean;
  statusColor?: 'cyan' | 'red' | 'yellow' | 'green';
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
  children,
  title,
  className,
  glow = false,
  statusColor
}) => {
  return (
    <div
      className={clsx(
        "glass-panel rounded-lg p-5 transition-all duration-300 relative overflow-hidden",
        glow && "glass-panel-glow",
        className
      )}
    >
      {/* Decorative top border highlight */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyber-cyan/50 to-transparent" />
      
      {/* Dynamic Status bar if provided */}
      {statusColor && (
        <div
          className={clsx(
            "absolute top-0 left-0 w-1.5 h-full",
            statusColor === 'cyan' && "bg-cyber-cyan",
            statusColor === 'red' && "bg-cyber-red animate-pulse",
            statusColor === 'yellow' && "bg-cyber-yellow",
            statusColor === 'green' && "bg-cyber-green"
          )}
        />
      )}

      {title && (
        <div className="flex items-center justify-between border-b border-cyber-border/40 pb-3 mb-4">
          <h2 className="text-sm font-bold tracking-widest text-cyber-cyan uppercase font-mono">
            {title}
          </h2>
          {/* Decorative tactical corner markers */}
          <div className="flex space-x-1">
            <div className="w-1.5 h-1.5 bg-cyber-cyan/20 rounded-full" />
            <div className="w-1.5 h-1.5 bg-cyber-cyan/40 rounded-full" />
            <div className="w-1.5 h-1.5 bg-cyber-cyan/80 rounded-full" />
          </div>
        </div>
      )}

      <div className="relative z-10">{children}</div>
    </div>
  );
};
