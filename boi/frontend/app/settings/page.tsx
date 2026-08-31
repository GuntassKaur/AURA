'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassPanel } from '@/components/floating-panels/GlassPanel';
import {
  Settings,
  Sliders,
  Shield,
  Bell,
  Cpu,
  RefreshCw,
  Lock,
  Database,
  Terminal,
  Save,
  CheckCircle,
  Play
} from 'lucide-react';

export default function SettingsPage() {
  const [threshold, setThreshold] = useState(0.75);
  const [modelType, setModelType] = useState('XGBOOST');
  const [autoFreeze, setAutoFreeze] = useState(true);
  const [apiEndpoint, setApiEndpoint] = useState('http://localhost:8000');
  const [activeTab, setActiveTab] = useState<'detection' | 'compliance' | 'system'>('detection');
  const [isSaved, setIsSaved] = useState(false);
  const [isTestingConn, setIsTestingConn] = useState(false);
  const [connSuccess, setConnSuccess] = useState<boolean | null>(null);

  const saveSettings = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const testConnection = async () => {
    setIsTestingConn(true);
    setConnSuccess(null);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setConnSuccess(true);
    setIsTestingConn(false);
  };

  return (
    <div className="min-h-screen bg-cyber-bg p-5 font-mono">
      {/* Page Header */}
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center">
            <Settings className="w-4 h-4 text-cyber-cyan" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-widest text-white uppercase">System Configuration HUD</h1>
            <p className="text-[9px] text-slate-500 mt-0.5">Adjust Alert Thresholds · Control Engines · API Endpoints</p>
          </div>
        </div>
        <button
          onClick={saveSettings}
          className="flex items-center space-x-1.5 text-[10px] font-black px-4 py-2 rounded border bg-cyber-cyan/15 border-cyber-cyan text-cyber-cyan shadow-[0_0_15px_rgba(34,211,238,0.2)] hover:bg-cyber-cyan hover:text-black transition-all"
        >
          <Save className="w-3.5 h-3.5" />
          <span>COMMIT CHANGES</span>
        </button>
      </header>

      {isSaved && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="mb-4 flex items-center space-x-2 text-[10px] text-emerald-400 bg-emerald-400/5 border border-emerald-400/20 rounded p-2.5"
        >
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>System configuration compiled and committed to state memory registry successfully.</span>
        </motion.div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-4">
        {/* Tabs Bar */}
        <div className="col-span-3 space-y-2">
          {[
            { id: 'detection', label: 'Detection Controls', icon: Sliders },
            { id: 'compliance', label: 'Compliance & FIU', icon: Shield },
            { id: 'system', label: 'Backend & Dev Link', icon: Cpu },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded border transition-all text-left ${
                  active
                    ? 'bg-cyber-cyan/10 border-cyber-cyan/35 text-cyber-cyan shadow-[0_0_15px_rgba(34,211,238,0.1)]'
                    : 'border-cyber-border/20 text-slate-400 hover:text-white hover:bg-white/[0.02]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-wider">{tab.label}</span>
              </button>
            );
          })}

          <div className="pt-4 border-t border-slate-800 text-[8px] text-slate-500 leading-relaxed space-y-1">
            <div>NODE ENVIRONMENT: PRODUCTION</div>
            <div>VERIFICATION GRID: ACTIVE</div>
            <div>SHAP EVAL: ACCELERATED</div>
          </div>
        </div>

        {/* Configurations Area */}
        <div className="col-span-9 space-y-4">
          {activeTab === 'detection' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <GlassPanel title="Risk Score Calibration" statusColor="cyan">
                <div className="space-y-4 py-2">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-300">SYSTEM THREAT MITIGATION THRESHOLD</span>
                    <span className="text-cyber-cyan font-bold font-mono">{(threshold * 100).toFixed(0)}% RISK</span>
                  </div>
                  <input
                    type="range"
                    min="0.10"
                    max="0.95"
                    step="0.05"
                    value={threshold}
                    onChange={(e) => setThreshold(parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyber-cyan"
                  />
                  <div className="flex justify-between text-[8px] text-slate-500">
                    <span>10% (MAX ALERTS / HIGH FALSE POSITIVES)</span>
                    <span>95% (DANGER LEVEL / LOW ALERTS / SLOW CONTAINMENT)</span>
                  </div>
                  <p className="text-[9px] text-slate-400 leading-relaxed mt-2">
                    Scores calculated above this threshold will trigger auto-containment workflows and assign high-priority review tickets immediately.
                  </p>
                </div>
              </GlassPanel>

              <GlassPanel title="Active Intelligence Model selection" statusColor="yellow">
                <div className="space-y-3">
                  <p className="text-[9px] text-slate-400 leading-relaxed">
                    Choose the primary machine learning and scoring engine for real-time transactional stream evaluation.
                  </p>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    {[
                      { id: 'XGBOOST', label: 'XGBoost (Default)', desc: 'Optimized tabular features, fast SHAP explanations, high precision.' },
                      { id: 'GRAPHSAGE', label: 'GraphSAGE Core', desc: 'Inductive graph neural network node topology learning, deep relay detection.' },
                      { id: 'HYBRID', label: 'Hybrid AI Grid', desc: 'Weighted ensemble combining local transactional features & Graph PageRank.' },
                    ].map((model) => (
                      <div
                        key={model.id}
                        onClick={() => setModelType(model.id)}
                        className={`p-3 rounded border cursor-pointer transition-all ${
                          modelType === model.id
                            ? 'bg-cyber-yellow/5 border-cyber-yellow/45 text-cyber-yellow'
                            : 'bg-slate-900/40 border-cyber-border/25 text-slate-400 hover:border-cyber-border/40 hover:bg-slate-900/60'
                        }`}
                      >
                        <div className="text-[10px] font-black uppercase tracking-wider">{model.label}</div>
                        <div className="text-[8px] mt-1.5 leading-normal">{model.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </GlassPanel>

              <GlassPanel title="Containment Safeguards" statusColor="red">
                <div className="flex items-center justify-between py-2">
                  <div className="flex flex-col space-y-1 pr-4">
                    <span className="text-[10px] text-white font-bold uppercase">AUTONOMOUS ACCOUNT LOCKDOWN</span>
                    <span className="text-[9px] text-slate-400 leading-relaxed">
                      If active, the system automatically instructs node ledger networks to freeze transactions on accounts scoring critical risk ratings.
                    </span>
                  </div>
                  <button
                    onClick={() => setAutoFreeze(!autoFreeze)}
                    className={`px-4 py-2 rounded font-bold text-[9px] tracking-wider border transition-all uppercase ${
                      autoFreeze
                        ? 'bg-cyber-red/10 border-cyber-red text-cyber-red animate-pulse'
                        : 'border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {autoFreeze ? 'AUTO-FREEZE ENABLED' : 'AUTO-FREEZE DISABLED'}
                  </button>
                </div>
              </GlassPanel>
            </motion.div>
          )}

          {activeTab === 'compliance' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <GlassPanel title="FIU-IND STR Metadata" statusColor="green">
                <div className="space-y-3">
                  {[
                    { label: 'REPORTING INSTITUTION NAME', value: 'Bank of India' },
                    { label: 'DEFAULT REGULATORY BRANCH CODE', value: 'BOI-MH-04221' },
                    { label: 'PRINCIPAL COMPLIANCE OFFICER NAME', value: 'Rajesh Kumar Sharma' },
                    { label: 'OBLIGATION COMPLIANCE CODE (PMLA)', value: 'BOI-IIT-HYD-2024' },
                  ].map((field) => (
                    <div key={field.label} className="grid grid-cols-3 gap-2 py-1.5 border-b border-slate-800/80">
                      <span className="text-[8px] text-slate-500 font-bold uppercase pt-1">{field.label}</span>
                      <input
                        type="text"
                        defaultValue={field.value}
                        className="col-span-2 bg-slate-900/60 border border-cyber-border/25 rounded px-2.5 py-1 text-[10px] text-slate-200 focus:outline-none focus:border-cyber-green/40"
                      />
                    </div>
                  ))}
                </div>
              </GlassPanel>
            </motion.div>
          )}

          {activeTab === 'system' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <GlassPanel title="Backend API Link" statusColor="cyan">
                <div className="space-y-4">
                  <div className="flex flex-col space-y-1">
                    <span className="text-[10px] text-white font-bold uppercase">FASTAPI INTEGRATION ENDPOINT</span>
                    <span className="text-[9px] text-slate-400">Specify host interface for AI diagnostics and data syncing channels.</span>
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={apiEndpoint}
                      onChange={(e) => setApiEndpoint(e.target.value)}
                      className="flex-1 bg-slate-900/60 border border-cyber-border/25 rounded px-3 py-2 text-[10px] text-slate-200 font-mono focus:outline-none focus:border-cyber-cyan/40"
                    />
                    <button
                      onClick={testConnection}
                      disabled={isTestingConn}
                      className="flex items-center space-x-1.5 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white font-bold text-[9px] px-4 py-2 rounded transition-all"
                    >
                      {isTestingConn ? 'TESTING...' : 'TEST LINK'}
                    </button>
                  </div>

                  {connSuccess === true && (
                    <div className="text-[8px] text-cyber-green font-bold flex items-center space-x-1.5 bg-cyber-green/5 border border-cyber-green/20 rounded p-2">
                      <CheckCircle className="w-3.5 h-3.5 text-cyber-green" />
                      <span>CONNECTION ESTABLISHED: FastAPI operational context online at {apiEndpoint}. Seed values synchronized.</span>
                    </div>
                  )}
                </div>
              </GlassPanel>

              <GlassPanel title="Simulate System Stream Anomalies" statusColor="yellow">
                <p className="text-[9px] text-slate-400 leading-relaxed mb-4">
                  Simulate high-velocity attacks or network structures to verify how GraphSAGE and XGBoost flag alerts in real-time.
                </p>
                <div className="flex space-x-2">
                  <button className="flex-1 bg-cyber-yellow/10 border border-cyber-yellow/30 text-cyber-yellow hover:bg-cyber-yellow/20 font-bold text-[9px] py-2.5 rounded transition-all uppercase tracking-wider">
                    SIMULATE SMURFING TRIGGER
                  </button>
                  <button className="flex-1 bg-cyber-red/10 border border-cyber-red/30 text-cyber-red hover:bg-cyber-red/20 font-bold text-[9px] py-2.5 rounded transition-all uppercase tracking-wider">
                    SIMULATE VELOCITY STRIKE
                  </button>
                </div>
              </GlassPanel>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
