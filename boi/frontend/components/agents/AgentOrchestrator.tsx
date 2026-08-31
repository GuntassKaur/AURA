import React, { useState, useEffect, useRef } from 'react';
import { useWebSocket } from '@/lib/hooks/useWebSocket';
import { Bot, Terminal, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface AgentLog {
  agent: string;
  message: string;
  status: 'PROCESSING' | 'SUCCESS' | 'DONE';
  timestamp: string;
}

export const AgentOrchestrator: React.FC = () => {
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const logsEndRef = useRef<HTMLDivElement | null>(null);

  // Subscribe to agent WebSocket stream
  useWebSocket('agents', (data) => {
    setLogs((prev) => [...prev, data]);
  });

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  return (
    <div className="font-mono text-xs text-slate-300 flex flex-col h-[320px] bg-black/60 rounded border border-cyber-border/40 p-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cyber-border/20 pb-2 mb-3">
        <div className="flex items-center space-x-2 text-cyber-cyan">
          <Bot className="w-4 h-4" />
          <span className="font-bold tracking-wider uppercase text-[10px]">LANGGRAPH AGENT CORES</span>
        </div>
        <div className="flex items-center space-x-1.5 text-[9px] text-slate-400">
          <Terminal className="w-3.5 h-3.5 mr-1" />
          <span>LIVE BROADCAST FEED</span>
        </div>
      </div>

      {/* Logs Feed */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 select-text">
        {logs.length === 0 ? (
          <div className="text-center text-slate-500 py-24 animate-pulse uppercase text-[10px]">
            Ready. Waiting for agent trigger signal...
          </div>
        ) : (
          <AnimatePresence>
            {logs.map((log, idx) => {
              let tagColor = 'text-cyber-cyan border-cyber-cyan/30';
              if (log.status === 'SUCCESS') tagColor = 'text-cyber-green border-cyber-green/30';
              if (log.status === 'DONE') tagColor = 'text-cyber-yellow border-cyber-yellow/40 animate-pulse';

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-slate-900/40 border border-cyber-border/10 p-2 rounded flex items-start space-x-2"
                >
                  <span className={`text-[9px] border px-1.5 py-0.5 rounded font-bold shrink-0 ${tagColor}`}>
                    {log.agent.toUpperCase()}
                  </span>
                  <div className="flex-1 flex flex-col space-y-1">
                    <span className="text-[10px] text-slate-300 leading-relaxed">
                      {log.message}
                    </span>
                    <span className="text-[8px] text-slate-500">
                      SYS LOG TIMESTAMP: {log.timestamp}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={logsEndRef} />
      </div>

      {logs.length > 0 && logs[logs.length - 1].status === 'DONE' && (
        <div className="mt-3 bg-cyber-green/5 border border-cyber-green/20 rounded p-2 flex items-center justify-between text-[9px] text-cyber-green">
          <span className="flex items-center font-bold">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" /> CASE CLUSTER EVALUATION SECURED
          </span>
          <span className="text-slate-400">FIU-IND STR STAGED</span>
        </div>
      )}
    </div>
  );
};
