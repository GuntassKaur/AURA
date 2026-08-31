'use client';

import React, { useState, useEffect } from 'react';
import { Map, Crosshair, Navigation, AlertTriangle, Layers, Radio } from 'lucide-react';
import { motion } from 'framer-motion';

export default function IndiaIntelligenceGrid() {
  const [mounted, setMounted] = useState(false);
  const [activeLayer, setActiveLayer] = useState('MULE_CLUSTERS');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="h-screen w-full bg-black relative flex font-mono text-cyan-500 overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,rgba(8,145,178,0.1)_0%,transparent_100%)] pointer-events-none" />

      {/* Left HUD: Layer Controls */}
      <div className="w-80 h-full border-r border-cyan-900/50 bg-black/60 backdrop-blur-md z-10 flex flex-col relative">
        <div className="p-4 border-b border-cyan-900/50 bg-cyan-950/30">
          <h1 className="text-sm font-bold tracking-[0.2em] text-cyan-400 flex items-center">
            <Map className="w-4 h-4 mr-2" />
            NATIONAL GRID
          </h1>
          <p className="text-[10px] text-cyan-600 mt-1">GEOSPATIAL THREAT INTELLIGENCE</p>
        </div>

        <div className="p-4 flex-1 overflow-y-auto space-y-6">
          
          <div>
            <h2 className="text-[10px] tracking-widest text-cyan-700 mb-3 flex items-center">
              <Layers className="w-3 h-3 mr-2" /> ACTIVE OVERLAYS
            </h2>
            <div className="space-y-2">
              {['MULE_CLUSTERS', 'TRANSACTION_VELOCITY', 'IP_ANOMALIES', 'DEVICE_FINGERPRINTS'].map(layer => (
                <button 
                  key={layer}
                  onClick={() => setActiveLayer(layer)}
                  className={`w-full p-3 text-xs tracking-widest border transition-all ${
                    activeLayer === layer 
                      ? 'border-cyan-400 bg-cyan-900/30 text-cyan-100 shadow-[0_0_10px_rgba(6,182,212,0.3)]' 
                      : 'border-cyan-900/50 bg-cyan-950/10 text-cyan-600 hover:border-cyan-700'
                  }`}
                >
                  {layer.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-[10px] tracking-widest text-cyan-700 mb-3 flex items-center">
              <AlertTriangle className="w-3 h-3 mr-2" /> CRITICAL REGIONS
            </h2>
            <div className="space-y-2">
              <div className="p-3 border border-red-900/50 bg-red-950/20 flex flex-col group cursor-pointer hover:bg-red-900/40">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-red-400 text-xs font-bold tracking-widest">JAMTARA, JH</span>
                  <Radio className="w-3 h-3 text-red-500 animate-pulse" />
                </div>
                <span className="text-[10px] text-red-500/70">890 ACTIVE MULE ACCOUNTS</span>
              </div>
              <div className="p-3 border border-yellow-900/50 bg-yellow-950/20 flex flex-col group cursor-pointer hover:bg-yellow-900/40">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-yellow-400 text-xs font-bold tracking-widest">GURUGRAM, HR</span>
                </div>
                <span className="text-[10px] text-yellow-500/70">HIGH DEVICE VELOCITY DETECTED</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Main Map Area (Simulated) */}
      <div className="flex-1 relative flex items-center justify-center bg-[#020617] overflow-hidden">
        
        {/* Radar Sweep Effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-cyan-900/30 rounded-full opacity-20 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-cyan-900/30 rounded-full opacity-30 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-cyan-900/50 rounded-full opacity-50 pointer-events-none" />
        
        <div className="absolute top-1/2 left-1/2 w-[400px] h-1 origin-left bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent animate-[spin_4s_linear_infinite] pointer-events-none" />

        {/* Map Placeholder Text */}
        <div className="text-center z-10 opacity-40">
          <Crosshair className="w-16 h-16 mx-auto mb-4 text-cyan-600" />
          <p className="tracking-[0.2em] text-xs">LEAFLET GEO-JSON RENDERING ENGINE</p>
          <p className="tracking-[0.2em] text-[10px] mt-2">WAITING FOR TILE SERVER...</p>
        </div>

        {/* Simulated Hotspot */}
        <div className="absolute top-[35%] left-[60%] flex flex-col items-center">
           <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center relative">
             <div className="w-2 h-2 rounded-full bg-red-500 animate-ping absolute" />
             <div className="w-2 h-2 rounded-full bg-red-500" />
           </div>
           <div className="mt-2 px-2 py-1 bg-black/80 border border-red-900 text-[10px] text-red-400 font-bold">
             NODE CLUSTER ALPHA
           </div>
        </div>

        {/* Floating Metrics */}
        <div className="absolute bottom-6 right-6 flex space-x-4 z-10">
          <div className="px-4 py-2 border border-cyan-900/50 bg-black/60 backdrop-blur-md flex items-center text-[10px]">
             <span className="text-cyan-700 mr-2">LAT/LNG</span>
             <span className="text-cyan-300">28.6139° N, 77.2090° E</span>
          </div>
          <div className="px-4 py-2 border border-cyan-900/50 bg-black/60 backdrop-blur-md flex items-center text-[10px]">
             <Navigation className="w-3 h-3 mr-2 text-cyan-500" />
             <span className="text-cyan-300">ZOOM: 12x</span>
          </div>
        </div>

      </div>

    </div>
  );
}
