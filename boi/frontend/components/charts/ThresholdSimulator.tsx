import React from 'react';
import { useFraudStore } from '@/lib/store/fraudStore';

export const ThresholdSimulator: React.FC = () => {
  const { threshold, setThreshold } = useFraudStore();

  // Recalculate parameters on the fly based on threshold
  // Formulas modeled on standard ROC curves
  const precision = Math.min(0.99, 0.75 + (threshold * 0.24));
  const recall = Math.max(0.5, 0.98 - (threshold * 0.45));
  const falsePositives = Math.round(1400 * (1.0 - threshold) * (1.0 - threshold));
  const analystWorkload = Math.round(450 * (1.0 - threshold));
  const fraudCaught = Math.round(98 * recall);

  return (
    <div className="space-y-5 font-mono text-xs text-slate-300">
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-slate-400 font-bold uppercase">RISK CONTAINMENT THRESHOLD</span>
          <span className="text-cyber-cyan text-sm font-bold">{Math.round(threshold * 100)}%</span>
        </div>
        <input
          type="range"
          min="0.1"
          max="0.9"
          step="0.05"
          value={threshold}
          onChange={(e) => setThreshold(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyber-cyan outline-none"
        />
        <div className="flex justify-between text-[9px] text-slate-500 mt-1">
          <span>SENSITIVE (WATCH MORE)</span>
          <span>STRICT (FREEZE ONLY)</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 border-t border-cyber-border/20 pt-4">
        {/* KPI 1 */}
        <div className="bg-slate-900/40 border border-cyber-border/10 rounded p-2 flex flex-col">
          <span className="text-[9px] text-slate-500 font-bold uppercase">PRECISION</span>
          <span className="text-cyber-cyan text-base font-bold mt-1">{(precision * 100).toFixed(1)}%</span>
          <span className="text-[9px] text-slate-400 mt-1">True fraud fraction</span>
        </div>

        {/* KPI 2 */}
        <div className="bg-slate-900/40 border border-cyber-border/10 rounded p-2 flex flex-col">
          <span className="text-[9px] text-slate-500 font-bold uppercase">RECALL</span>
          <span className="text-cyber-cyan text-base font-bold mt-1">{(recall * 100).toFixed(1)}%</span>
          <span className="text-[9px] text-slate-400 mt-1">Laundering vectors caught</span>
        </div>

        {/* KPI 3 */}
        <div className="bg-slate-900/40 border border-cyber-border/10 rounded p-2 flex flex-col">
          <span className="text-[9px] text-slate-500 font-bold uppercase">FALSE POSITIVES</span>
          <span className="text-cyber-yellow text-base font-bold mt-1">{falsePositives}</span>
          <span className="text-[9px] text-slate-400 mt-1">Legitimate accounts hold</span>
        </div>

        {/* KPI 4 */}
        <div className="bg-slate-900/40 border border-cyber-border/10 rounded p-2 flex flex-col">
          <span className="text-[9px] text-slate-500 font-bold uppercase">ANALYST WORKLOAD</span>
          <span className="text-cyber-blue text-base font-bold mt-1">{analystWorkload} cases</span>
          <span className="text-[9px] text-slate-400 mt-1">Pending investigation tasks</span>
        </div>
      </div>

      <div className="bg-cyber-cyan/5 border border-cyber-cyan/20 rounded p-3 text-[10px] text-cyber-cyan">
        <div className="font-bold uppercase mb-1">🎯 Operational Forecast</div>
        At {Math.round(threshold * 100)}% threshold, system blocks <span className="font-bold text-white">{fraudCaught}</span> out of 98 active mule routes.
      </div>
    </div>
  );
};
