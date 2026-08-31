import React, { useEffect } from 'react';
import { useFraudStore } from '@/lib/store/fraudStore';
import { useWebSocket } from '@/lib/hooks/useWebSocket';
import { motion, AnimatePresence } from 'framer-motion';

export const LiveTicker: React.FC = () => {
  const { transactions, addTransaction } = useFraudStore();

  // Listen to WebSocket transactions stream
  useWebSocket('transactions', (data) => {
    addTransaction(data);
  });

  return (
    <div className="font-mono text-xs h-[300px] overflow-y-auto pr-1 relative">
      <div className="sticky top-0 bg-[#020617] z-10 flex justify-between text-[10px] text-slate-500 font-bold border-b border-cyber-border/30 pb-2 mb-2">
        <span>LEDGER DETAILS</span>
        <span>CHANNEL</span>
        <span>AMOUNT</span>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center text-slate-500 py-20 animate-pulse">
          📡 LISTENING ON LIVE SECURE LEDGER PORTFOLIO...
        </div>
      ) : (
        <div className="space-y-2 relative">
          <AnimatePresence initial={false}>
            {transactions.slice(0, 20).map((txn) => {
              // Map risk tier color
              let textClass = 'text-cyber-green';
              let bgGlow = 'rgba(16, 185, 129, 0.05)';
              let borderClass = 'border-cyber-green/20';
              
              if (txn.risk_tier === 'FREEZE') {
                textClass = 'text-cyber-red font-bold';
                bgGlow = 'rgba(239, 68, 68, 0.1)';
                borderClass = 'border-cyber-red/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]';
              } else if (txn.risk_tier === 'HOLD') {
                textClass = 'text-cyber-yellow';
                bgGlow = 'rgba(245, 158, 11, 0.08)';
                borderClass = 'border-cyber-yellow/40';
              } else if (txn.risk_tier === 'WATCH') {
                textClass = 'text-cyber-blue';
                bgGlow = 'rgba(59, 130, 246, 0.08)';
                borderClass = 'border-cyber-blue/30';
              }

              return (
                <motion.div
                  key={txn.id || txn.txn_id}
                  initial={{ opacity: 0, y: -20, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className={`flex justify-between items-center p-2.5 rounded border ${borderClass} transition-all duration-300`}
                  style={{ backgroundColor: bgGlow }}
                >
                  <div className="flex flex-col">
                    <span className={`text-[10px] uppercase font-bold tracking-widest ${textClass}`}>
                      {txn.risk_tier}
                    </span>
                    <span className="text-slate-400 text-[10px] mt-0.5">
                      {txn.source} ➔ {txn.dest}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <span className="text-slate-500 font-semibold">{txn.channel}</span>
                    <span className="text-white font-bold w-20 text-right">
                      ₹{txn.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
