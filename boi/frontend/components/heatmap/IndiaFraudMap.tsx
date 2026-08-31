import React from 'react';
import dynamic from 'next/dynamic';

const IndiaMapDynamic = dynamic(
  () => import('./IndiaMap'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-cyber-bg font-mono text-xs text-slate-500 uppercase animate-pulse">
        📡 RENDERING CYBER INTENSITY GEOMETRIES...
      </div>
    )
  }
);

interface Hotspot {
  name: string;
  lat: number;
  lng: number;
  intensity: number;
  cases: number;
}

interface IndiaFraudMapProps {
  hotspots?: Hotspot[];
}

const defaultHotspots: Hotspot[] = [
  {"name": "Jamtara (Jharkhand)", "lat": 24.1167, "lng": 86.8000, "intensity": 0.88, "cases": 142},
  {"name": "Bharatpur (Rajasthan)", "lat": 27.2152, "lng": 77.4930, "intensity": 0.72, "cases": 98},
  {"name": "Mewat (Haryana)", "lat": 28.1322, "lng": 77.0144, "intensity": 0.65, "cases": 82},
  {"name": "Mumbai Cyber Grid", "lat": 19.0760, "lng": 72.8777, "intensity": 0.45, "cases": 54},
  {"name": "Delhi Command Loop", "lat": 28.6139, "lng": 77.2090, "intensity": 0.50, "cases": 61}
];

export const IndiaFraudMap: React.FC<IndiaFraudMapProps> = ({ hotspots = defaultHotspots }) => {
  return (
    <div className="w-full h-full rounded-lg overflow-hidden border border-cyber-border/40 relative">
      <IndiaMapDynamic hotspots={hotspots} />
      
      {/* Dynamic Overlay HUD label */}
      <div className="absolute bottom-4 left-4 z-[1000] glass-panel p-3 rounded font-mono text-[9px] text-slate-400 space-y-1 pointer-events-none">
        <div className="font-bold text-cyber-cyan mb-1 text-[10px] uppercase">
          🚨 INTEL TARGET HOTSPOTS
        </div>
        <div>Jamtara: Cyber Phishing center</div>
        <div>Bharatpur: ATM cloning clusters</div>
        <div>Mewat: High-density UPI fraud</div>
      </div>
    </div>
  );
};
