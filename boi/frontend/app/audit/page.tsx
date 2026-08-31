'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassPanel } from '@/components/floating-panels/GlassPanel';
import {
  ScrollText, Shield, User, Database, Cpu, Lock, 
  Zap, AlertTriangle, CheckCircle, Clock, Download,
  Filter, Search, Hash, Activity, Terminal
} from 'lucide-react';

type LogEntry = {
  id: string;
  timestamp: string;
  actor: string;
  actorType: 'ML_MODEL' | 'AGENT' | 'ANALYST' | 'SYSTEM' | 'API';
  action: string;
  resource: string;
  severity: 'INFO' | 'WARN' | 'ALERT' | 'CRITICAL';
  outcome: 'SUCCESS' | 'BLOCKED' | 'FAILED' | 'PENDING';
  hash: string;
};

const SEED_LOGS: LogEntry[] = [
  { id: 'AUD-0091', timestamp: '2024-05-26 14:42:31.882', actor: 'XGBOOST-v3', actorType: 'ML_MODEL', action: 'FRAUD_SCORE_COMPUTED', resource: 'Account:C1234567890', severity: 'CRITICAL', outcome: 'SUCCESS', hash: 'a3f9e2c1' },
  { id: 'AUD-0090', timestamp: '2024-05-26 14:42:33.104', actor: 'GRAPH-SAGE', actorType: 'ML_MODEL', action: 'SUBGRAPH_EXTRACTED', resource: 'Cluster:RING-14', severity: 'ALERT', outcome: 'SUCCESS', hash: 'b7d4a8f2' },
  { id: 'AUD-0089', timestamp: '2024-05-26 14:42:35.210', actor: 'FREEZE-BOT', actorType: 'AGENT', action: 'ACCOUNT_FREEZE_INITIATED', resource: 'Account:C1234567890', severity: 'CRITICAL', outcome: 'SUCCESS', hash: 'c2e5b9d3' },
  { id: 'AUD-0088', timestamp: '2024-05-26 14:42:37.561', actor: 'ANALYST-L3', actorType: 'ANALYST', action: 'CASE_OPENED', resource: 'Case:AEGIS-2024-001', severity: 'ALERT', outcome: 'SUCCESS', hash: 'd1f6c0e4' },
  { id: 'AUD-0087', timestamp: '2024-05-26 14:42:40.009', actor: 'FIU-AGENT', actorType: 'AGENT', action: 'STR_DRAFT_COMPILED', resource: 'STR:STR-2024-0091', severity: 'ALERT', outcome: 'SUCCESS', hash: 'e8a3b7f5' },
  { id: 'AUD-0086', timestamp: '2024-05-26 14:38:19.330', actor: 'API-GATEWAY', actorType: 'API', action: 'BULK_TXN_INGESTED', resource: 'Stream:UPI-FEED-04', severity: 'INFO', outcome: 'SUCCESS', hash: 'f5c2d1a6' },
  { id: 'AUD-0085', timestamp: '2024-05-26 14:35:02.774', actor: 'SENTINEL', actorType: 'ML_MODEL', action: 'VELOCITY_BREACH_DETECTED', resource: 'Account:C9876543210', severity: 'ALERT', outcome: 'SUCCESS', hash: 'g4e7b0c7' },
  { id: 'AUD-0084', timestamp: '2024-05-26 14:30:55.120', actor: 'SYSTEM', actorType: 'SYSTEM', action: 'MODEL_RETRAINED', resource: 'XGBoost:v3.1', severity: 'INFO', outcome: 'SUCCESS', hash: 'h3d8a9b8' },
  { id: 'AUD-0083', timestamp: '2024-05-26 14:22:41.009', actor: 'ANALYST-L2', actorType: 'ANALYST', action: 'STR_SUBMITTED_FIU', resource: 'STR:STR-2024-0090', severity: 'INFO', outcome: 'SUCCESS', hash: 'i9c6f2e9' },
  { id: 'AUD-0082', timestamp: '2024-05-26 14:18:37.551', actor: 'XGBOOST-v3', actorType: 'ML_MODEL', action: 'FRAUD_SCORE_COMPUTED', resource: 'Account:C5544332211', severity: 'WARN', outcome: 'SUCCESS', hash: 'j2b4d7a0' },
  { id: 'AUD-0081', timestamp: '2024-05-26 14:10:11.228', actor: 'API-GATEWAY', actorType: 'API', action: 'UNAUTHORIZED_ACCESS_ATTEMPT', resource: 'Endpoint:/api/freeze', severity: 'CRITICAL', outcome: 'BLOCKED', hash: 'k7a1c5f1' },
  { id: 'AUD-0080', timestamp: '2024-05-26 14:05:00.000', actor: 'SYSTEM', actorType: 'SYSTEM', action: 'REDIS_STREAM_RECONNECTED', resource: 'Redis:fraud-alerts', severity: 'INFO', outcome: 'SUCCESS', hash: 'l6e0b3d2' },
];

const LIVE_ENTRIES: Partial<LogEntry>[] = [
  { actor: 'XGBOOST-v3', actorType: 'ML_MODEL', action: 'FRAUD_SCORE_COMPUTED', resource: `Account:C${Math.floor(Math.random() * 9999999999)}`, severity: 'INFO', outcome: 'SUCCESS' },
  { actor: 'SENTINEL', actorType: 'ML_MODEL', action: 'VELOCITY_BREACH_DETECTED', resource: 'UPI-STREAM-07', severity: 'ALERT', outcome: 'SUCCESS' },
  { actor: 'GRAPH-SAGE', actorType: 'ML_MODEL', action: 'EDGE_PREDICTION_RUN', resource: 'Cluster:RING-08', severity: 'INFO', outcome: 'SUCCESS' },
  { actor: 'API-GATEWAY', actorType: 'API', action: 'BATCH_TXN_INGESTED', resource: 'NEFT-FEED-02', severity: 'INFO', outcome: 'SUCCESS' },
  { actor: 'FREEZE-BOT', actorType: 'AGENT', action: 'WATCHLIST_UPDATED', resource: 'WatchList:TIER-2', severity: 'WARN', outcome: 'SUCCESS' },
];

const sevStyle: Record<string, string> = {
  INFO: 'text-slate-400 border-slate-400/20 bg-slate-400/5',
  WARN: 'text-amber-400 border-amber-400/25 bg-amber-400/5',
  ALERT: 'text-orange-400 border-orange-400/30 bg-orange-400/5',
  CRITICAL: 'text-red-400 border-red-400/40 bg-red-400/8',
};

const outcomeStyle: Record<string, string> = {
  SUCCESS: 'text-emerald-400',
  BLOCKED: 'text-red-400',
  FAILED: 'text-red-400',
  PENDING: 'text-amber-400',
};

const actorIcon: Record<string, React.ReactNode> = {
  ML_MODEL: <Cpu className="w-3 h-3" />,
  AGENT: <Zap className="w-3 h-3" />,
  ANALYST: <User className="w-3 h-3" />,
  SYSTEM: <Database className="w-3 h-3" />,
  API: <Activity className="w-3 h-3" />,
};

let idCounter = 92;

export default function AuditPage() {
  const [logs, setLogs] = useState<LogEntry[]>(SEED_LOGS);
  const [filterSev, setFilterSev] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');
  const [search, setSearch] = useState('');
  const [liveMode, setLiveMode] = useState(true);
  const [selected, setSelected] = useState<LogEntry | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // Live log generation
  useEffect(() => {
    if (!liveMode) return;
    const id = setInterval(() => {
      const template = LIVE_ENTRIES[Math.floor(Math.random() * LIVE_ENTRIES.length)];
      const newEntry: LogEntry = {
        id: `AUD-0${idCounter++}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 23),
        actor: template.actor!,
        actorType: template.actorType!,
        action: template.action!,
        resource: template.resource!,
        severity: template.severity!,
        outcome: template.outcome!,
        hash: Math.random().toString(36).slice(2, 10),
      };
      setLogs(prev => [newEntry, ...prev].slice(0, 120));
    }, 2800);
    return () => clearInterval(id);
  }, [liveMode]);

  const filtered = logs.filter(l => {
    const matchSev = filterSev === 'ALL' || l.severity === filterSev;
    const matchType = filterType === 'ALL' || l.actorType === filterType;
    const matchSearch = !search || 
      l.id.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.actor.toLowerCase().includes(search.toLowerCase()) ||
      l.resource.toLowerCase().includes(search.toLowerCase());
    return matchSev && matchType && matchSearch;
  });

  const critCount = logs.filter(l => l.severity === 'CRITICAL').length;
  const alertCount = logs.filter(l => l.severity === 'ALERT').length;
  const blockedCount = logs.filter(l => l.outcome === 'BLOCKED').length;

  return (
    <div className="min-h-screen bg-cyber-bg p-5 font-mono">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded bg-indigo-500/10 border border-indigo-400/30 flex items-center justify-center">
            <ScrollText className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-widest text-white uppercase">Immutable Audit Ledger</h1>
            <p className="text-[9px] text-slate-500 mt-0.5">Tamper-proof System Event Log · SHA-256 Hash Chained · PMLA Compliant</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setLiveMode(l => !l)}
            className={`flex items-center space-x-1.5 text-[9px] font-bold px-3 py-1.5 rounded border transition-all ${
              liveMode
                ? 'text-red-400 border-red-400/30 bg-red-400/5 animate-pulse'
                : 'text-slate-500 border-slate-700 hover:text-slate-300'
            }`}
          >
            <Activity className="w-3 h-3" />
            <span>{liveMode ? 'LIVE FEED ON' : 'LIVE FEED OFF'}</span>
          </button>
          <button className="flex items-center space-x-1.5 text-[9px] font-bold px-3 py-1.5 rounded border text-indigo-400 border-indigo-400/30 bg-indigo-400/5 hover:bg-indigo-400/10 transition-all">
            <Download className="w-3 h-3" />
            <span>EXPORT CSV</span>
          </button>
        </div>
      </header>

      {/* KPI Row */}
      <div className="grid grid-cols-5 gap-3 mb-5">
        {[
          { label: 'TOTAL EVENTS', value: logs.length.toString(), color: 'indigo', icon: ScrollText },
          { label: 'CRITICAL EVENTS', value: critCount.toString(), color: 'red', icon: AlertTriangle },
          { label: 'ALERT EVENTS', value: alertCount.toString(), color: 'amber', icon: Shield },
          { label: 'BLOCKED ACTIONS', value: blockedCount.toString(), color: 'red', icon: Lock },
          { label: 'INTEGRITY STATUS', value: '100%', color: 'emerald', icon: CheckCircle },
        ].map(k => {
          const Icon = k.icon;
          return (
            <div key={k.label} className={`glass-panel rounded-lg p-3 border border-${k.color}-400/20`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[8px] text-slate-500 tracking-widest">{k.label}</span>
                <Icon className={`w-3 h-3 text-${k.color}-400`} />
              </div>
              <div className={`text-xl font-black text-${k.color}-400`}>{k.value}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Log Stream */}
        <div className="col-span-8">
          <GlassPanel title="Event Stream" statusColor="cyan">
            {/* Toolbar */}
            <div className="flex items-center space-x-2 mb-3">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by ID, action, actor, resource..."
                  className="w-full bg-slate-900/60 border border-cyber-border/30 rounded pl-8 pr-3 py-1.5 text-[10px] text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-400/40 transition-all"
                />
              </div>
              <select
                value={filterSev}
                onChange={e => setFilterSev(e.target.value)}
                className="bg-slate-900/60 border border-cyber-border/30 rounded px-2.5 py-1.5 text-[10px] text-slate-300 focus:outline-none focus:border-indigo-400/40"
              >
                {['ALL', 'INFO', 'WARN', 'ALERT', 'CRITICAL'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="bg-slate-900/60 border border-cyber-border/30 rounded px-2.5 py-1.5 text-[10px] text-slate-300 focus:outline-none focus:border-indigo-400/40"
              >
                {['ALL', 'ML_MODEL', 'AGENT', 'ANALYST', 'SYSTEM', 'API'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Column Headers */}
            <div className="grid grid-cols-12 gap-1 text-[8px] text-slate-600 uppercase tracking-widest pb-1 border-b border-slate-800 mb-2 px-1">
              <div className="col-span-1">ID</div>
              <div className="col-span-3">TIMESTAMP</div>
              <div className="col-span-2">ACTOR</div>
              <div className="col-span-3">ACTION</div>
              <div className="col-span-2">OUTCOME</div>
              <div className="col-span-1">SEV</div>
            </div>

            {/* Log Rows */}
            <div className="space-y-0.5 max-h-[520px] overflow-y-auto pr-1">
              <AnimatePresence initial={false}>
                {filtered.map((log, i) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: -8, backgroundColor: 'rgba(99,102,241,0.12)' }}
                    animate={{ opacity: 1, y: 0, backgroundColor: 'transparent' }}
                    transition={{ duration: 0.4 }}
                    onClick={() => setSelected(selected?.id === log.id ? null : log)}
                    className={`grid grid-cols-12 gap-1 items-center px-1 py-1.5 rounded cursor-pointer transition-all text-[10px] hover:bg-white/[0.02] ${
                      selected?.id === log.id ? 'bg-indigo-400/5 border border-indigo-400/20' : 'border border-transparent'
                    }`}
                  >
                    <div className="col-span-1 text-slate-500 font-mono text-[8px]">{log.id.split('-')[1]}</div>
                    <div className="col-span-3 text-slate-500 font-mono text-[8px] truncate">{log.timestamp.slice(11)}</div>
                    <div className="col-span-2 flex items-center space-x-1">
                      <span className="text-slate-400">{actorIcon[log.actorType]}</span>
                      <span className="text-slate-300 truncate text-[9px]">{log.actor}</span>
                    </div>
                    <div className="col-span-3 text-slate-200 font-bold truncate text-[9px]">{log.action}</div>
                    <div className={`col-span-2 text-[9px] font-bold ${outcomeStyle[log.outcome]}`}>{log.outcome}</div>
                    <div className="col-span-1">
                      <span className={`text-[7px] border px-1 py-0.5 rounded font-bold ${sevStyle[log.severity]}`}>
                        {log.severity.slice(0, 4)}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={endRef} />
            </div>

            <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[8px] text-slate-600">
              <span>{filtered.length} of {logs.length} entries shown</span>
              <span className="flex items-center space-x-1">
                <Hash className="w-2.5 h-2.5" />
                <span>CHAIN INTEGRITY: VERIFIED</span>
              </span>
            </div>
          </GlassPanel>
        </div>

        {/* Detail + Stats Sidebar */}
        <div className="col-span-4 space-y-4">
          {/* Selected Event Detail */}
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
              >
                <GlassPanel title={`Event: ${selected.id}`} statusColor={selected.severity === 'CRITICAL' ? 'red' : 'cyan'}>
                  <div className="space-y-3">
                    <div>
                      <span className="text-[8px] text-slate-500 tracking-wider block">ACTION</span>
                      <span className="text-[11px] font-bold text-white mt-0.5 block">{selected.action}</span>
                    </div>

                    {[
                      { label: 'ACTOR', value: selected.actor },
                      { label: 'ACTOR TYPE', value: selected.actorType },
                      { label: 'RESOURCE', value: selected.resource },
                      { label: 'TIMESTAMP', value: selected.timestamp },
                      { label: 'OUTCOME', value: selected.outcome },
                      { label: 'SEVERITY', value: selected.severity },
                    ].map(f => (
                      <div key={f.label} className="flex justify-between border-t border-slate-800/80 pt-2">
                        <span className="text-[8px] text-slate-500">{f.label}</span>
                        <span className="text-[9px] text-slate-200 font-mono font-bold">{f.value}</span>
                      </div>
                    ))}

                    <div className="border-t border-slate-800/80 pt-2">
                      <span className="text-[8px] text-slate-500 block mb-1">BLOCK HASH (SHA-256)</span>
                      <div className="bg-slate-900/60 rounded border border-cyber-border/10 px-2 py-1.5 font-mono text-[8px] text-indigo-400 break-all">
                        {selected.hash}...{Math.random().toString(36).slice(2, 18)}
                      </div>
                    </div>
                  </div>
                </GlassPanel>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <GlassPanel title="Event Detail">
                  <div className="h-32 flex items-center justify-center text-[9px] text-slate-600 flex-col space-y-2">
                    <Terminal className="w-8 h-8 opacity-30" />
                    <span>SELECT AN EVENT TO INSPECT</span>
                  </div>
                </GlassPanel>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Activity Breakdown */}
          <GlassPanel title="Actor Breakdown">
            <div className="space-y-2">
              {(['ML_MODEL', 'AGENT', 'SYSTEM', 'ANALYST', 'API'] as const).map(type => {
                const count = logs.filter(l => l.actorType === type).length;
                const pct = Math.round((count / logs.length) * 100);
                return (
                  <div key={type} className="space-y-1">
                    <div className="flex justify-between text-[9px]">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-slate-400">{actorIcon[type]}</span>
                        <span className="text-slate-300">{type}</span>
                      </div>
                      <span className="text-slate-400 font-bold">{count} ({pct}%)</span>
                    </div>
                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8 }}
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassPanel>

          {/* Severity Heatmap */}
          <GlassPanel title="Severity Distribution">
            <div className="grid grid-cols-4 gap-2">
              {(['INFO', 'WARN', 'ALERT', 'CRITICAL'] as const).map(s => {
                const count = logs.filter(l => l.severity === s).length;
                const colors: Record<string, string> = {
                  INFO: 'text-slate-400 border-slate-400/20',
                  WARN: 'text-amber-400 border-amber-400/30',
                  ALERT: 'text-orange-400 border-orange-400/30',
                  CRITICAL: 'text-red-400 border-red-400/40',
                };
                return (
                  <div key={s} className={`border rounded p-2 text-center ${colors[s]}`}>
                    <div className="text-lg font-black">{count}</div>
                    <div className="text-[7px] tracking-wider mt-0.5 opacity-70">{s}</div>
                  </div>
                );
              })}
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
