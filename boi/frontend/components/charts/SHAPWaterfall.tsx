import React from 'react';
import { motion } from 'framer-motion';

interface FeatureContribution {
  feature: string;
  shap_value: number;
}

interface SHAPWaterfallProps {
  contributions: FeatureContribution[];
}

export const SHAPWaterfall: React.FC<SHAPWaterfallProps> = ({ contributions }) => {
  if (!contributions || contributions.length === 0) {
    return (
      <div className="text-center text-xs font-mono text-slate-500 py-6">
        No active SHAP logs detected for selection.
      </div>
    );
  }

  // Find max absolute value to scale bars
  const maxVal = Math.max(...contributions.map((c) => Math.abs(c.shap_value)), 0.01);

  return (
    <div className="space-y-3 font-mono text-xs">
      <div className="flex justify-between text-[10px] text-slate-400 font-bold border-b border-cyber-border/30 pb-1 mb-2">
        <span>FEATURE PROFILE</span>
        <div className="flex space-x-8">
          <span>SAFE (-SHAP)</span>
          <span>FRAUD (+SHAP)</span>
        </div>
      </div>
      
      {contributions.map((item, idx) => {
        const isPositive = item.shap_value >= 0;
        const widthPct = Math.min(100, (Math.abs(item.shap_value) / maxVal) * 50);

        return (
          <div key={idx} className="flex items-center justify-between group h-8">
            {/* Feature Label */}
            <span className="w-1/3 truncate text-slate-300 group-hover:text-cyber-cyan transition-colors">
              {item.feature}
            </span>

            {/* Bidirectional Waterfall Bar */}
            <div className="w-2/3 flex items-center relative h-full">
              {/* Midpoint marker line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-slate-600/50 z-0" />
              
              <div className="w-full flex h-3 relative z-10">
                {/* Left side (negative impact) */}
                <div className="w-1/2 flex justify-end">
                  {!isPositive && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${widthPct}%` }}
                      transition={{ duration: 0.5, delay: idx * 0.05 }}
                      className="bg-gradient-to-l from-cyber-green/60 to-cyber-green/20 rounded-l h-full"
                      style={{
                        boxShadow: '0 0 8px rgba(16, 185, 129, 0.3)',
                      }}
                    />
                  )}
                </div>
                
                {/* Right side (positive impact) */}
                <div className="w-1/2 flex justify-start">
                  {isPositive && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${widthPct}%` }}
                      transition={{ duration: 0.5, delay: idx * 0.05 }}
                      className="bg-gradient-to-r from-cyber-red/60 to-cyber-red/20 rounded-r h-full"
                      style={{
                        boxShadow: '0 0 8px rgba(239, 68, 110, 0.3)',
                      }}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Numerical Score */}
            <span
              className={`w-16 text-right font-bold ${
                isPositive ? 'text-cyber-red' : 'text-cyber-green'
              }`}
            >
              {item.shap_value >= 0 ? '+' : ''}
              {item.shap_value.toFixed(4)}
            </span>
          </div>
        );
      })}
    </div>
  );
};
