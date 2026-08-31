import React from 'react';
import { Network, Zap, Moon, RotateCcw, AlertTriangle, ShieldCheck } from 'lucide-react';

interface Pattern {
  name: string;
  description: string;
  icon: React.ReactNode;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  confidence: number;
}

export const PatternLibrary: React.FC = () => {
  const patterns: Pattern[] = [
    {
      name: "UPI Test-and-Drain",
      description: "A tiny sentinel transaction (usually ₹1-₹50) followed by immediate large drains. Standard UPI phishing signature.",
      icon: <Zap className="w-5 h-5 text-cyber-cyan" />,
      severity: "CRITICAL",
      confidence: 96
    },
    {
      name: "Sleeper Account Activation",
      description: "Accounts dormant for >120 days that suddenly show high velocity transfers, suggesting mule activation.",
      icon: <Moon className="w-5 h-5 text-cyber-blue" />,
      severity: "CRITICAL",
      confidence: 92
    },
    {
      name: "Spider Web Dispersal",
      description: "A single input node distributing equal amounts to 5+ beneficiary collectors within minutes.",
      icon: <Network className="w-5 h-5 text-cyber-yellow" />,
      severity: "HIGH",
      confidence: 88
    },
    {
      name: "Circular Layering",
      description: "Directed transfer cycles (e.g. A -> B -> C -> A) designed to obscure audit trail origins.",
      icon: <RotateCcw className="w-5 h-5 text-cyber-red" />,
      severity: "HIGH",
      confidence: 84
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-4 font-mono text-xs text-slate-300">
      {patterns.map((pat, idx) => {
        let tagColor = 'text-cyber-cyan border-cyber-cyan/30';
        if (pat.severity === 'CRITICAL') tagColor = 'text-cyber-red border-cyber-red/30 animate-pulse';
        if (pat.severity === 'HIGH') tagColor = 'text-cyber-yellow border-cyber-yellow/30';

        return (
          <div key={idx} className="glass-panel p-4 rounded border border-cyber-border/30 hover:border-cyber-cyan/40 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {pat.icon}
                  <span className="font-bold text-white uppercase text-[10px]">{pat.name}</span>
                </div>
                <span className={`text-[8px] border px-1.5 py-0.5 rounded font-bold ${tagColor}`}>
                  {pat.severity}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed mb-3">
                {pat.description}
              </p>
            </div>
            
            <div className="flex items-center justify-between border-t border-slate-800 pt-2.5 mt-2.5 text-[9px] text-slate-500">
              <span className="flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 mr-1 text-cyber-green" /> CONFIDENCE: {pat.confidence}%
              </span>
              <span>PAT#00{idx + 1}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
