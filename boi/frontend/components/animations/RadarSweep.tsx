import React from 'react';

export const RadarSweep: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30 rounded-lg">
      {/* Outer grid circle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] border border-cyber-cyan/10 rounded-full" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] border border-cyber-cyan/10 rounded-full" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] border border-cyber-cyan/10 rounded-full" />
      
      {/* Crosshairs */}
      <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-cyber-cyan/10" />
      <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-cyber-cyan/10" />

      {/* Sweep cone */}
      <div className="absolute inset-0 radar-sweep" />
    </div>
  );
};
