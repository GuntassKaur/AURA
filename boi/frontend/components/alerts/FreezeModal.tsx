import React, { useEffect, useState } from 'react';
import { useAlertStore } from '@/lib/store/alertStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, AlertTriangle, Activity } from 'lucide-react';

export const FreezeModal: React.FC = () => {
  const { isFreezeActive, frozenAccounts, setFreezeState } = useAlertStore();
  const [countdown, setCountdown] = useState(3);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (isFreezeActive) {
      setCountdown(3);
      setShowNotification(true);
      
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setShowNotification(false);
    }
  }, [isFreezeActive]);

  if (!isFreezeActive || !showNotification) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md font-mono">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="max-w-xl w-full mx-4 border-2 border-cyber-red bg-black/90 p-8 rounded-lg shadow-[0_0_50px_rgba(239,68,68,0.4)] text-center relative overflow-hidden"
        >
          {/* Animated red danger lines background */}
          <div className="absolute inset-0 bg-gradient-to-b from-cyber-red/5 via-transparent to-cyber-red/5 pointer-events-none" />
          <div className="absolute top-0 left-0 w-full h-1 bg-cyber-red animate-pulse" />

          {countdown > 0 ? (
            <div className="space-y-6">
              <div className="flex justify-center">
                <AlertTriangle className="w-16 h-16 text-cyber-red animate-bounce" />
              </div>
              <h2 className="text-2xl font-bold tracking-widest text-cyber-red uppercase">
                CRITICAL THREAT CONTAINMENT
              </h2>
              <p className="text-xs text-slate-400">
                INITIATING HARD PORTFOLIO LOCK ON SUSPECT NETWORKS:
              </p>
              <div className="bg-slate-900/60 p-4 border border-cyber-red/30 rounded max-h-24 overflow-y-auto text-[10px] text-white">
                {frozenAccounts.join(', ')}
              </div>
              
              <div className="text-5xl font-black text-white animate-pulse">
                {countdown}
              </div>
              <div className="text-[9px] text-slate-500 tracking-wider">
                COMMENCING SYSTEM BLOCK IN SECONDS. PRESS ESC OR CANCEL TO OVERRIDE.
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-center">
                <ShieldAlert className="w-16 h-16 text-cyber-red animate-pulse" />
              </div>
              <h2 className="text-2xl font-black tracking-widest text-cyber-red animate-pulse">
                CONTAINMENT ACTIVE
              </h2>
              <div className="text-xs text-slate-300">
                SYSTEM OPERATIONAL LOCK CONCLUDED
              </div>

              <div className="grid grid-cols-2 gap-4 text-left border-y border-cyber-red/20 py-4 my-2 text-[10px] text-slate-400">
                <div>
                  <span className="font-bold text-white">LOCK ACTION:</span> 100% OUTGOING SUSPENDED
                </div>
                <div>
                  <span className="font-bold text-white">REF CODE:</span> RBI-FRZ-SEC45L
                </div>
                <div>
                  <span className="font-bold text-white">LEDGER FEED:</span> FILTERED / BYPASSED
                </div>
                <div>
                  <span className="font-bold text-white">FORENSICS ID:</span> STR-SECURE-AUDIT
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setShowNotification(false)}
                  className="px-6 py-2 bg-cyber-red hover:bg-red-700 text-white font-bold rounded tracking-widest text-[10px] uppercase transition-colors"
                >
                  DISMISS ALARM OVERLAY
                </button>
                <button
                  onClick={() => {
                    setFreezeState(false);
                    setShowNotification(false);
                  }}
                  className="px-6 py-2 border border-slate-600 hover:border-white text-slate-300 font-bold rounded tracking-widest text-[10px] uppercase transition-all"
                >
                  ABORT / UNLOCK PORTFOLIOS
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
