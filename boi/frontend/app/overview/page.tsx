'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, ShieldAlert, TrendingDown, Network, ShieldCheck, Map, Users, Database } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';

export default function ExecutiveOverview() {
  const [mounted, setMounted] = useState(false);
  const role = useAuthStore((state) => state.role);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="p-8 space-y-8 pb-20 relative">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-cyan-900/50 pb-4">
        <div>
          <h1 className="text-3xl font-black tracking-[0.2em] text-white">EXECUTIVE OVERVIEW</h1>
          <p className="text-cyan-500 font-mono text-sm tracking-widest uppercase mt-1">
            NATIONAL THREAT CONTAINMENT GRID — {role} ACCESS
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-emerald-400">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-xs tracking-widest">SYSTEM SECURE</span>
          </div>
          <div className="px-3 py-1 bg-cyan-950/50 border border-cyan-900 font-mono text-xs text-cyan-300">
            DEFCON 4
          </div>
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard 
          title="NATIONAL RISK INDEX" 
          value="42.8" 
          unit="%"
          icon={<Activity />} 
          trend="+2.1% (24H)"
          trendType="bad"
          glow="shadow-[0_0_20px_rgba(239,68,68,0.2)]"
        />
        <MetricCard 
          title="ACTIVE INVESTIGATIONS" 
          value="1,248" 
          icon={<ShieldAlert />} 
          trend="+14 (1H)"
          trendType="bad"
        />
        <MetricCard 
          title="FUNDS SECURED (YTD)" 
          value="₹482" 
          unit="Cr"
          icon={<ShieldCheck />} 
          trend="₹12.4 Cr (7D)"
          trendType="good"
          glow="shadow-[0_0_20px_rgba(16,185,129,0.2)]"
        />
        <MetricCard 
          title="NETWORK HEALTH" 
          value="99.9" 
          unit="%"
          icon={<Network />} 
          trend="OPTIMAL"
          trendType="good"
        />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
        {/* Heatmap / Top Threats placeholder */}
        <div className="lg:col-span-2 bg-black/40 border border-cyan-900/50 p-6 flex flex-col relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-mono text-sm tracking-widest text-cyan-400 flex items-center">
              <Map className="w-4 h-4 mr-2" />
              INDIA THREAT HEATMAP (LIVE)
            </h2>
            <div className="text-[10px] text-cyan-600 font-mono">UPDATED: JUST NOW</div>
          </div>
          
          <div className="flex-1 relative border border-cyan-950 bg-cyan-950/10 flex items-center justify-center">
            <div className="text-center font-mono text-cyan-700/50">
              <Map className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="tracking-[0.2em] text-xs">LEAFLET THREE.JS INTEGRATION PENDING</p>
            </div>
            
            {/* Simulated Ping */}
            <div className="absolute top-1/3 left-1/4">
               <div className="w-3 h-3 bg-red-500 rounded-full animate-ping opacity-75" />
               <div className="absolute top-4 left-4 text-[10px] text-red-400 font-mono font-bold bg-black/80 px-1 border border-red-900">JAMTARA CLUSTER</div>
            </div>
          </div>
        </div>

        {/* Action Feed */}
        <div className="bg-black/40 border border-cyan-900/50 p-6 flex flex-col relative backdrop-blur-md">
          <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent" />
          <h2 className="font-mono text-sm tracking-widest text-cyan-400 flex items-center mb-6">
            <Database className="w-4 h-4 mr-2" />
            SYSTEM LOGS
          </h2>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 font-mono text-xs">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="border-l-2 border-red-500/50 pl-3 py-1">
                <div className="text-red-400 font-bold tracking-wider mb-1">CRITICAL ALERT {1000 - i}</div>
                <div className="text-cyan-600/80">Sleeper network activated in Node Cluster A{i}. 45 accounts frozen.</div>
                <div className="text-[9px] text-cyan-800 mt-1">{i * 2} MINS AGO</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, unit = '', icon, trend, trendType, glow = '' }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-black/40 border border-cyan-900/50 p-6 relative group overflow-hidden backdrop-blur-md ${glow}`}
    >
      <div className="absolute top-0 left-0 w-full h-[1px] bg-cyan-500/0 group-hover:bg-cyan-500/50 transition-colors" />
      <div className="flex justify-between items-start mb-4">
        <div className="text-cyan-500/50">{icon}</div>
        <div className={`text-[10px] font-mono tracking-widest px-2 py-0.5 border ${trendType === 'bad' ? 'text-red-400 border-red-900 bg-red-950/30' : 'text-emerald-400 border-emerald-900 bg-emerald-950/30'}`}>
          {trend}
        </div>
      </div>
      <div>
        <div className="text-4xl font-light text-white font-mono flex items-baseline">
          {value}<span className="text-lg text-cyan-600 ml-1">{unit}</span>
        </div>
        <div className="text-[10px] text-cyan-500 tracking-[0.2em] font-mono mt-2">{title}</div>
      </div>
    </motion.div>
  );
}
