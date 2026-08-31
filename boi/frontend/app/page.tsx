'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Activity, Lock, Unlock, Zap, Shield, Search, Terminal } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { useRouter } from 'next/navigation';

export default function CommandHQ() {
  const [mounted, setMounted] = useState(false);
  const role = useAuthStore((state) => state.role);
  const router = useRouter();

  // Simulated Live Data Feed
  const [liveStream, setLiveStream] = useState<any[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    setMounted(true);
    
    // Connect to WebSocket
    wsRef.current = new WebSocket('ws://localhost:8000/ws/transactions');
    
    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLiveStream(prev => [data, ...prev].slice(0, 50));
      } catch (e) {
        console.error("WS Parse Error", e);
      }
    };

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  if (!mounted) return null;

  return (
    <div className="p-8 h-screen flex flex-col relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-900/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-center mb-6 z-10">
        <div>
          <h1 className="text-3xl font-black tracking-[0.2em] text-white flex items-center">
            <Activity className="w-8 h-8 mr-3 text-cyan-500 animate-pulse" />
            FINANCIAL COMMAND CENTER
          </h1>
          <p className="text-cyan-600 font-mono text-xs tracking-widest mt-1">LIVE TRANSACTION INGESTION & SCORING</p>
        </div>
        <div className="flex space-x-4">
          <div className="bg-cyan-950/40 border border-cyan-800 p-2 font-mono text-xs text-cyan-400 flex items-center">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping mr-2" />
            WS://CONNECTED
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0 z-10">
        
        {/* Left Column: Live Feed */}
        <div className="lg:col-span-2 flex flex-col border border-cyan-900/50 bg-black/40 backdrop-blur-md overflow-hidden relative group">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-cyan-500/0 group-hover:bg-cyan-500/50 transition-colors" />
          
          <div className="bg-cyan-950/30 p-3 border-b border-cyan-900/50 flex justify-between items-center">
            <h2 className="font-mono text-sm tracking-widest text-cyan-400 flex items-center">
              <Zap className="w-4 h-4 mr-2" /> LIVE STREAM
            </h2>
            <div className="text-[10px] text-cyan-600 font-mono">{liveStream.length} PACKETS CAPTURED</div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <AnimatePresence>
              {liveStream.map((txn, idx) => (
                <motion.div
                  key={txn.txn_id || idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-3 border flex items-center justify-between font-mono text-xs cursor-pointer hover:bg-cyan-900/20 transition-colors ${
                    txn.fraud_score > 0.8 
                      ? 'border-red-900/80 bg-red-950/20 text-red-100' 
                      : txn.fraud_score > 0.5 
                        ? 'border-yellow-900/80 bg-yellow-950/20 text-yellow-100'
                        : 'border-cyan-900/50 bg-cyan-950/10 text-cyan-100'
                  }`}
                  onClick={() => router.push(`/accounts/${txn.source}`)}
                >
                  <div className="flex items-center space-x-6 w-1/2">
                    <span className="opacity-50 w-24 truncate">{txn.txn_id}</span>
                    <span className="font-bold tracking-wider">{txn.source} &rarr; {txn.dest}</span>
                  </div>
                  <div className="flex items-center space-x-8 w-1/2 justify-end">
                    <span className="text-right">₹{txn.amount?.toFixed(2)}</span>
                    <span className="opacity-50 w-16 text-center">{txn.channel}</span>
                    <div className="w-24 flex items-center space-x-2">
                      <div className="h-1.5 flex-1 bg-black overflow-hidden rounded-full border border-cyan-900/50">
                        <div 
                          className={`h-full ${txn.fraud_score > 0.8 ? 'bg-red-500' : txn.fraud_score > 0.5 ? 'bg-yellow-500' : 'bg-emerald-500'}`}
                          style={{ width: `${Math.min(100, Math.max(0, txn.fraud_score * 100))}%` }}
                        />
                      </div>
                      <span className="w-8 text-right">{(txn.fraud_score * 100).toFixed(0)}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {liveStream.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-cyan-800 opacity-50 font-mono text-sm tracking-widest space-y-4">
                  <Terminal className="w-12 h-12" />
                  <span>WAITING FOR INCOMING TELEMETRY...</span>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column: Alerts & Actions */}
        <div className="flex flex-col space-y-6">
          
          {/* High Priority Alerts */}
          <div className="flex-1 flex flex-col border border-red-900/50 bg-black/40 backdrop-blur-md overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-red-500/50" />
            <div className="bg-red-950/30 p-3 border-b border-red-900/50 flex justify-between items-center">
              <h2 className="font-mono text-sm tracking-widest text-red-400 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 animate-pulse" /> CRITICAL QUEUE
              </h2>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {/* Dummy alerts for now until integrated with investigations */}
              <div 
                onClick={() => router.push('/investigation/CAS-9912')}
                className="p-3 border border-red-900/80 bg-red-950/20 cursor-pointer hover:bg-red-900/40 transition-colors group"
              >
                <div className="flex justify-between items-start mb-2 font-mono text-xs">
                  <span className="text-red-400 font-bold tracking-widest">CAS-9912</span>
                  <span className="text-red-500/50">2m ago</span>
                </div>
                <p className="text-red-100/80 text-sm mb-3">Sleeper Account Activation Detected on Node C45.</p>
                <button className="text-[10px] font-mono tracking-widest text-red-400 flex items-center group-hover:text-red-300">
                  <Search className="w-3 h-3 mr-1" /> OPEN CASE
                </button>
              </div>
            </div>
          </div>

          {/* System Control */}
          <div className="h-48 flex flex-col border border-cyan-900/50 bg-black/40 backdrop-blur-md">
            <div className="bg-cyan-950/30 p-3 border-b border-cyan-900/50">
              <h2 className="font-mono text-sm tracking-widest text-cyan-400 flex items-center">
                <Shield className="w-4 h-4 mr-2" /> COMMAND ACTIONS
              </h2>
            </div>
            <div className="flex-1 p-4 flex flex-col justify-center space-y-3">
              <button 
                onClick={() => router.push('/network')}
                className="w-full py-2 bg-cyan-950/50 border border-cyan-800 text-cyan-400 font-mono text-xs tracking-[0.2em] hover:bg-cyan-900 hover:border-cyan-400 transition-colors"
              >
                OPEN NETWORK TOPOLOGY
              </button>
              <button className="w-full py-2 bg-red-950/50 border border-red-900 text-red-400 font-mono text-xs tracking-[0.2em] hover:bg-red-900 hover:border-red-400 transition-colors flex items-center justify-center">
                <Lock className="w-3 h-3 mr-2" /> INITIATE EMERGENCY FREEZE
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
