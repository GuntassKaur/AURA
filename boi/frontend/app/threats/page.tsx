'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassPanel } from '@/components/floating-panels/GlassPanel';
import { Eye, AlertTriangle, TrendingUp, Shield, Clock, Zap, Radio, ChevronUp, Filter } from 'lucide-react';

const PATTERNS = [
  {
    id: 'PTN-001', name: 'Layering Ring', severity: 'CRITICAL', confidence: 97,
    description: 'Multi-hop fund transfers through 5+ intermediate mule accounts to obscure origin.',
    indicators: ['Velocity >20 TXN/hr', 'Round-amount clustering', 'Cross-state hops'],
    detected: 3, trend: 'up', lastSeen: '2m ago', color: 'red'
  },
  {
    id: 'PTN-002', name: 'Smurfing Pattern', severity: 'HIGH', confidence: 88,
    description: 'Structured deposits just below ₹50,000 reporting threshold across multiple branches.',
    indicators: ['₹49,000-₹49,999 range', 'Multiple branches', 'Same-day clustering'],
    detected: 7, trend: 'up', lastSeen: '8m ago', color: 'amber'
  },
  {
    id: 'PTN-003', name: 'Account Takeover', severity: 'HIGH', confidence: 82,
    description: 'Credential compromise detected via device fingerprint mismatch and unusual access patterns.',
    indicators: ['New device login', 'IP geolocation shift', 'Rapid password reset'],
    detected: 2, trend: 'stable', lastSeen: '23m ago', color: 'amber'
  },
  {
    id: 'PTN-004', name: 'Synthetic Identity', severity: 'MEDIUM', confidence: 74,
    description: 'Fabricated identity documents used to open accounts for money mule operations.',
    indicators: ['PAN/Aadhaar mismatch', 'New account large deposit', 'No prior credit history'],
    detected: 5, trend: 'up', lastSeen: '1h ago', color: 'blue'
  },
  {
    id: 'PTN-005', name: 'Trade-Based ML', severity: 'MEDIUM', confidence: 69,
    description: 'Over/under-invoicing in import/export transactions to move funds across borders.',
    indicators: ['Invoice anomaly >40%', 'Related-party trade', 'Shell company counterparty'],
    detected: 1, trend: 'down', lastSeen: '4h ago', color: 'blue'
  },
  {
    id: 'PTN-006', name: 'Ghost Employee', severity: 'LOW', confidence: 61,
    description: 'Salary payments to non-existent employees routed back to corporate accounts.',
    indicators: ['Zero HR record match', 'Immediate withdrawal', 'Recurring fixed amounts'],
    detected: 4, trend: 'stable', lastSeen: '12h ago', color: 'slate'
  },
];

const LIVE_ALERTS = [
  { id: 'ALT-9921', msg: 'Velocity breach: C1234567890 — 24 TXN in 30 min', sev: 'CRITICAL', time: '0:32' },
  { id: 'ALT-9920', msg: 'Geographic anomaly: Login from Bangalore, TXN from Dubai', sev: 'HIGH', time: '1:14' },
  { id: 'ALT-9919', msg: 'Structuring pattern: 6 sub-threshold deposits — branch MH04', sev: 'HIGH', time: '3:45' },
  { id: 'ALT-9918', msg: 'Graph link: C9876543210 shares device ID with known mule', sev: 'MEDIUM', time: '7:22' },
  { id: 'ALT-9917', msg: 'New account large inflow: ₹18,70,000 within 2 hrs of opening', sev: 'MEDIUM', time: '11:58' },
];

const sevColor: Record<string, string> = {
  CRITICAL: 'text-red-400 border-red-400/40 bg-red-400/5',
  HIGH: 'text-amber-400 border-amber-400/40 bg-amber-400/5',
  MEDIUM: 'text-blue-400 border-blue-400/40 bg-blue-400/5',
  LOW: 'text-slate-400 border-slate-400/20 bg-slate-400/5',
};

const trendIcon = (t: string) => t === 'up' ? '↑' : t === 'down' ? '↓' : '→';
const trendColor = (t: string) => t === 'up' ? 'text-red-400' : t === 'down' ? 'text-emerald-400' : 'text-slate-400';

export default function ThreatsPage() {
  const [selected, setSelected] = useState(PATTERNS[0]);
  const [filter, setFilter] = useState('ALL');
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 2000);
    return () => clearInterval(id);
  }, []);

  const filtered = filter === 'ALL' ? PATTERNS : PATTERNS.filter(p => p.severity === filter);

  return (
    <div className="min-h-screen bg-cyber-bg p-5 font-mono">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded bg-amber-500/10 border border-amber-400/30 flex items-center justify-center">
            <Eye className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-widest text-white uppercase">Threat Intelligence Matrix</h1>
            <p className="text-[9px] text-slate-500 mt-0.5">Real-time Pattern Detection · ML-Powered Alert System</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 text-[9px] text-red-400 border border-red-400/30 bg-red-400/5 rounded px-2 py-1">
            <Radio className="w-3 h-3 animate-pulse" />
            <span className="font-bold">LIVE MONITORING</span>
          </div>
        </div>
      </header>

      {/* KPI Strip */}
      <div className="grid grid-cols-5 gap-3 mb-5">
        {[
          { label: 'PATTERNS ACTIVE', value: '6', color: 'cyan', icon: Shield },
          { label: 'CRITICAL ALERTS', value: '3', color: 'red', icon: AlertTriangle },
          { label: 'HIGH ALERTS', value: '9', color: 'amber', icon: TrendingUp },
          { label: 'DETECTION RATE', value: '99.2%', color: 'green', icon: Zap },
          { label: 'AVG RESPONSE', value: '1.4s', color: 'blue', icon: Clock },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.label}
              whileHover={{ y: -2 }}
              className={`glass-panel rounded-lg p-3 border border-${kpi.color}-400/20`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[8px] text-slate-500 tracking-widest">{kpi.label}</span>
                <Icon className={`w-3.5 h-3.5 text-${kpi.color}-400`} />
              </div>
              <div className={`text-xl font-black text-${kpi.color}-400`}>{kpi.value}</div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Pattern List */}
        <div className="col-span-5 space-y-3">
          {/* Filter chips */}
          <div className="flex space-x-2">
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-[9px] font-bold px-2.5 py-1 rounded border transition-all ${
                  filter === f
                    ? 'border-cyan-400/40 bg-cyan-400/10 text-cyan-400'
                    : 'border-cyber-border/20 text-slate-500 hover:text-slate-300'
                }`}
              >{f}</button>
            ))}
          </div>

          {filtered.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ x: 3 }}
              onClick={() => setSelected(p)}
              className={`glass-panel rounded-lg p-3 border cursor-pointer transition-all duration-150 ${
                selected.id === p.id ? 'border-amber-400/40 shadow-[0_0_20px_rgba(245,158,11,0.1)]' : 'border-cyber-border/20'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className={`text-[8px] border px-1.5 py-0.5 rounded font-bold ${sevColor[p.severity]}`}>{p.severity}</span>
                    <span className="text-[8px] text-slate-500">{p.id}</span>
                    <span className={`text-[9px] font-bold ${trendColor(p.trend)}`}>{trendIcon(p.trend)}</span>
                  </div>
                  <div className="text-[11px] font-bold text-white mt-1">{p.name}</div>
                  <div className="text-[9px] text-slate-400 mt-0.5 line-clamp-1">{p.description}</div>
                </div>
                <div className="text-right ml-3 shrink-0">
                  <div className="text-[10px] font-black text-red-400">{p.confidence}%</div>
                  <div className="text-[8px] text-slate-500">{p.detected} detected</div>
                </div>
              </div>
              {/* Confidence bar */}
              <div className="mt-2 h-0.5 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${p.confidence}%` }}
                  transition={{ duration: 0.8, delay: i * 0.05 }}
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-red-500"
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Right Panel */}
        <div className="col-span-7 space-y-4">
          {/* Pattern Detail */}
          <GlassPanel title={`Pattern Analysis: ${selected.name}`} statusColor="yellow">
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: 'CONFIDENCE', value: `${selected.confidence}%`, color: 'text-amber-400' },
                { label: 'DETECTIONS', value: selected.detected.toString(), color: 'text-red-400' },
                { label: 'LAST SEEN', value: selected.lastSeen, color: 'text-cyan-400' },
              ].map(s => (
                <div key={s.label} className="bg-slate-900/50 rounded p-2.5 border border-cyber-border/10">
                  <div className="text-[8px] text-slate-500 tracking-widest">{s.label}</div>
                  <div className={`text-sm font-black mt-0.5 ${s.color}`}>{s.value}</div>
                </div>
              ))}
            </div>

            <p className="text-[10px] text-slate-300 leading-relaxed mb-3">{selected.description}</p>

            <div className="border-t border-cyber-border/10 pt-3">
              <div className="text-[9px] text-slate-500 font-bold mb-2 uppercase tracking-widest">Key Indicators</div>
              <div className="space-y-1.5">
                {selected.indicators.map((ind, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center space-x-2 text-[10px] text-slate-300"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    <span>{ind}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex space-x-2">
              <button className="flex-1 bg-red-500/10 border border-red-400/30 text-red-400 text-[9px] font-bold py-2 rounded hover:bg-red-500/20 transition-colors uppercase tracking-wider">
                Trigger Containment
              </button>
              <button className="flex-1 bg-blue-500/10 border border-blue-400/30 text-blue-400 text-[9px] font-bold py-2 rounded hover:bg-blue-500/20 transition-colors uppercase tracking-wider">
                Open Investigation
              </button>
            </div>
          </GlassPanel>

          {/* Live Alerts Feed */}
          <GlassPanel title="Live Alert Stream" statusColor="red">
            <div className="space-y-2">
              {LIVE_ALERTS.map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className={`flex items-start justify-between p-2.5 rounded border text-[10px] ${sevColor[a.sev]}`}
                >
                  <div className="flex items-start space-x-2.5">
                    <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-bold">{a.id}</div>
                      <div className="text-slate-300 text-[9px] mt-0.5">{a.msg}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1.5 text-[8px] text-slate-500 shrink-0 ml-2">
                    <Clock className="w-3 h-3" />
                    <span>{a.time} ago</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
