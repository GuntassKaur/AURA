'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassPanel } from '@/components/floating-panels/GlassPanel';
import {
  Search, Shield, User, AlertTriangle, Clock, CheckCircle,
  XCircle, ChevronRight, Terminal, Zap, BarChart2, Eye,
  Network, FileText, ArrowRight, Activity
} from 'lucide-react';

const MOCK_CASES = [
  { id: 'AEGIS-2024-001', entity: 'C1234567890', risk: 0.94, status: 'CRITICAL', type: 'Money Laundering Ring', txnCount: 48, amount: 28450000, flagged: '2m ago' },
  { id: 'AEGIS-2024-002', entity: 'C9876543210', risk: 0.81, status: 'INVESTIGATING', type: 'Account Takeover', txnCount: 12, amount: 4200000, flagged: '15m ago' },
  { id: 'AEGIS-2024-003', entity: 'C1122334455', risk: 0.73, status: 'WATCHING', type: 'Structuring', txnCount: 31, amount: 9870000, flagged: '1h ago' },
  { id: 'AEGIS-2024-004', entity: 'C5544332211', risk: 0.67, status: 'WATCHING', type: 'Card Skimming', txnCount: 8, amount: 1350000, flagged: '3h ago' },
  { id: 'AEGIS-2024-005', entity: 'C7788990011', risk: 0.55, status: 'RESOLVED', type: 'False Positive - Cleared', txnCount: 4, amount: 230000, flagged: '1d ago' },
];

const TIMELINE_EVENTS = [
  { time: '09:42:31', agent: 'SENTINEL', action: 'Anomaly detection fired — velocity spike +340%', severity: 'CRITICAL' },
  { time: '09:42:33', agent: 'GRAPH-AI', action: 'GraphSAGE topology mapped — 14 connected entities', severity: 'HIGH' },
  { time: '09:42:35', agent: 'PROFILER', action: 'Behavioral baseline deviation: 8.2σ above normal', severity: 'HIGH' },
  { time: '09:42:37', agent: 'XGBOOST', action: 'Fraud probability: 0.94 — SHAP dominant: rapid_tx_count', severity: 'HIGH' },
  { time: '09:42:40', agent: 'FREEZE-BOT', action: 'Account C1234567890 flagged for immediate containment', severity: 'CRITICAL' },
  { time: '09:42:42', agent: 'FIU-AGENT', action: 'STR draft compiled — awaiting officer sign-off', severity: 'MEDIUM' },
  { time: '09:43:01', agent: 'OVERSEER', action: 'Case AEGIS-2024-001 opened, assigned to L3 analyst', severity: 'LOW' },
];

const SHAP_FEATURES = [
  { feature: 'rapid_tx_count', value: 0.42, direction: 'increase' },
  { feature: 'cross_border_flag', value: 0.31, direction: 'increase' },
  { feature: 'night_hour_ratio', value: 0.18, direction: 'increase' },
  { feature: 'avg_balance', value: -0.09, direction: 'decrease' },
  { feature: 'account_age_days', value: -0.06, direction: 'decrease' },
];

const statusColor: Record<string, string> = {
  CRITICAL: 'text-red-400 bg-red-400/10 border-red-400/40',
  INVESTIGATING: 'text-amber-400 bg-amber-400/10 border-amber-400/40',
  WATCHING: 'text-blue-400 bg-blue-400/10 border-blue-400/40',
  RESOLVED: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/40',
};

const severityColor: Record<string, string> = {
  CRITICAL: 'text-red-400',
  HIGH: 'text-amber-400',
  MEDIUM: 'text-cyan-400',
  LOW: 'text-slate-400',
};

export default function InvestigatePage() {
  const [selectedCase, setSelectedCase] = useState(MOCK_CASES[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'timeline' | 'shap' | 'network'>('timeline');
  const [scanProgress, setScanProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setScanProgress(p => p >= 100 ? 0 : p + 2);
    }, 60);
    return () => clearInterval(timer);
  }, []);

  const filtered = MOCK_CASES.filter(c =>
    c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.entity.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-cyber-bg p-5 font-mono">
      {/* Page Header */}
      <header className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded bg-blue-500/10 border border-blue-400/30 flex items-center justify-center">
              <Search className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-widest text-white uppercase">Investigation Console</h1>
              <p className="text-[9px] text-slate-500 mt-0.5">AI-Assisted Case Forensics · LangGraph Multi-Agent System</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-[9px] text-slate-400">
          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
          <span>{filtered.length} ACTIVE CASES · {MOCK_CASES.filter(c => c.status === 'CRITICAL').length} CRITICAL</span>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-4">
        {/* Case List */}
        <div className="col-span-4">
          <GlassPanel title="Active Case Registry" statusColor="cyan" className="h-full">
            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search cases, entities..."
                className="w-full bg-slate-900/60 border border-cyber-border/30 rounded pl-8 pr-3 py-2 text-[10px] text-slate-300 placeholder-slate-600 focus:outline-none focus:border-blue-400/50 focus:bg-slate-900/80 transition-all"
              />
            </div>

            <div className="space-y-2">
              {filtered.map(c => (
                <motion.div
                  key={c.id}
                  whileHover={{ x: 2 }}
                  onClick={() => setSelectedCase(c)}
                  className={`p-3 rounded border cursor-pointer transition-all duration-150 ${
                    selectedCase.id === c.id
                      ? 'border-blue-400/40 bg-blue-400/5'
                      : 'border-cyber-border/20 hover:border-cyber-border/40 hover:bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[10px] font-bold text-white">{c.id}</div>
                      <div className="text-[9px] text-slate-400 mt-0.5">{c.type}</div>
                      <div className="text-[9px] text-slate-500 mt-0.5 font-mono">{c.entity}</div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <span className={`text-[8px] border px-1.5 py-0.5 rounded font-bold ${statusColor[c.status]}`}>
                        {c.status}
                      </span>
                      <span className="text-[9px] font-black text-red-400">{(c.risk * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[8px] text-slate-500">
                    <span>₹{(c.amount / 100000).toFixed(1)}L · {c.txnCount} txns</span>
                    <span className="flex items-center"><Clock className="w-2.5 h-2.5 mr-1" />{c.flagged}</span>
                  </div>
                  {/* Risk bar */}
                  <div className="mt-2 h-0.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${c.risk * 100}%`,
                        background: c.risk > 0.8 ? '#ef4444' : c.risk > 0.6 ? '#f59e0b' : '#3b82f6'
                      }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassPanel>
        </div>

        {/* Case Detail */}
        <div className="col-span-8 space-y-4">
          {/* Case Header */}
          <GlassPanel title={`Case: ${selectedCase.id}`} statusColor={selectedCase.status === 'CRITICAL' ? 'red' : 'cyan'}>
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'RISK SCORE', value: `${(selectedCase.risk * 100).toFixed(1)}%`, color: selectedCase.risk > 0.8 ? 'text-red-400' : 'text-amber-400' },
                { label: 'TOTAL EXPOSURE', value: `₹${(selectedCase.amount / 100000).toFixed(1)}L`, color: 'text-white' },
                { label: 'LINKED TXNs', value: selectedCase.txnCount.toString(), color: 'text-cyan-400' },
                { label: 'STATUS', value: selectedCase.status, color: selectedCase.status === 'CRITICAL' ? 'text-red-400' : 'text-blue-400' },
              ].map(stat => (
                <div key={stat.label} className="bg-slate-900/40 rounded border border-cyber-border/10 p-3">
                  <div className="text-[8px] text-slate-500 uppercase tracking-widest">{stat.label}</div>
                  <div className={`text-sm font-black mt-1 ${stat.color}`}>{stat.value}</div>
                </div>
              ))}
            </div>

            {/* AI Scan Progress */}
            <div className="mt-3 flex items-center space-x-3">
              <span className="text-[9px] text-slate-400 shrink-0">AI FORENSIC SCAN</span>
              <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-100"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
              <span className="text-[9px] text-cyan-400 font-bold">{scanProgress}%</span>
            </div>
          </GlassPanel>

          {/* Tabs */}
          <div className="flex space-x-1">
            {(['timeline', 'shap', 'network'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded transition-all duration-200 ${
                  activeTab === tab
                    ? 'bg-blue-400/10 border border-blue-400/30 text-blue-400'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.02] border border-transparent'
                }`}
              >
                {tab === 'timeline' ? '⏱ Agent Timeline' : tab === 'shap' ? '🧠 SHAP Explainer' : '🕸 Entity Graph'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'timeline' && (
              <motion.div
                key="timeline"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <GlassPanel title="AI Agent Investigation Timeline" statusColor="cyan">
                  <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                    {TIMELINE_EVENTS.map((ev, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-start space-x-3"
                      >
                        <div className="flex flex-col items-center mt-0.5">
                          <div className={`w-2 h-2 rounded-full ${
                            ev.severity === 'CRITICAL' ? 'bg-red-400' :
                            ev.severity === 'HIGH' ? 'bg-amber-400' :
                            ev.severity === 'MEDIUM' ? 'bg-cyan-400' : 'bg-slate-500'
                          }`} />
                          {i < TIMELINE_EVENTS.length - 1 && (
                            <div className="w-px flex-1 bg-slate-800 mt-1 min-h-[24px]" />
                          )}
                        </div>
                        <div className="pb-3 flex-1">
                          <div className="flex items-center space-x-2">
                            <span className={`text-[9px] border px-1.5 py-0.5 rounded font-bold ${
                              ev.severity === 'CRITICAL' ? 'text-red-400 border-red-400/30' :
                              ev.severity === 'HIGH' ? 'text-amber-400 border-amber-400/30' :
                              'text-cyan-400 border-cyan-400/30'
                            }`}>{ev.agent}</span>
                            <span className="text-[8px] text-slate-500">{ev.time}</span>
                          </div>
                          <p className="text-[10px] text-slate-300 mt-1">{ev.action}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </GlassPanel>
              </motion.div>
            )}

            {activeTab === 'shap' && (
              <motion.div
                key="shap"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <GlassPanel title="SHAP Feature Contribution Explainer" statusColor="cyan">
                  <div className="space-y-3">
                    <p className="text-[9px] text-slate-400">
                      XGBoost prediction decomposition — each bar shows the marginal contribution of that feature to the fraud score.
                    </p>
                    {SHAP_FEATURES.map((f, i) => (
                      <div key={f.feature} className="space-y-1">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-slate-300 font-mono">{f.feature}</span>
                          <span className={f.direction === 'increase' ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                            {f.direction === 'increase' ? '+' : ''}{(f.value * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.abs(f.value) * 250}%` }}
                            transition={{ delay: i * 0.1, duration: 0.5 }}
                            className={`h-full rounded-full ${f.direction === 'increase' ? 'bg-red-500' : 'bg-emerald-500'}`}
                          />
                        </div>
                      </div>
                    ))}
                    <div className="mt-4 p-3 bg-slate-900/60 border border-cyan-400/10 rounded text-[9px] text-slate-400">
                      <span className="text-cyan-400 font-bold">COUNTERFACTUAL:</span> Reduce rapid_tx_count below 8 transactions/hour
                      and remove cross-border flag to bring risk score below 0.50 threshold.
                    </div>
                  </div>
                </GlassPanel>
              </motion.div>
            )}

            {activeTab === 'network' && (
              <motion.div
                key="network"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <GlassPanel title="Entity Relationship Network" statusColor="red">
                  <div className="h-[320px] bg-slate-950/60 rounded border border-cyber-border/10 flex items-center justify-center relative overflow-hidden">
                    {/* Simulated graph nodes */}
                    {[
                      { x: 50, y: 50, label: selectedCase.entity, color: '#ef4444', size: 16 },
                      { x: 75, y: 25, label: 'MULE-01', color: '#f59e0b', size: 10 },
                      { x: 80, y: 65, label: 'MULE-02', color: '#f59e0b', size: 10 },
                      { x: 30, y: 20, label: 'MULE-03', color: '#f59e0b', size: 10 },
                      { x: 20, y: 70, label: 'SHELL-CO', color: '#8b5cf6', size: 12 },
                      { x: 65, y: 80, label: 'RELAY-01', color: '#3b82f6', size: 8 },
                      { x: 85, y: 42, label: 'OFFSHORE', color: '#ec4899', size: 11 },
                    ].map((node, i) => (
                      <div
                        key={i}
                        className="absolute flex flex-col items-center cursor-pointer group/node"
                        style={{ left: `${node.x}%`, top: `${node.y}%`, transform: 'translate(-50%,-50%)' }}
                      >
                        <div
                          className="rounded-full flex items-center justify-center transition-transform group-hover/node:scale-125"
                          style={{
                            width: node.size * 2,
                            height: node.size * 2,
                            backgroundColor: node.color + '20',
                            border: `1px solid ${node.color}60`,
                            boxShadow: `0 0 ${node.size}px ${node.color}40`
                          }}
                        >
                          <div className="rounded-full" style={{ width: node.size * 0.6, height: node.size * 0.6, backgroundColor: node.color }} />
                        </div>
                        <span className="text-[7px] text-slate-400 mt-1 whitespace-nowrap">{node.label}</span>
                      </div>
                    ))}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <p className="text-[9px] text-slate-600 tracking-widest">GRAPHSAGE TOPOLOGY · 7 NODES · 14 EDGES</p>
                    </div>
                  </div>
                </GlassPanel>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
