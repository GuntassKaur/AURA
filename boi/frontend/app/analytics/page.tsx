'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassPanel } from '@/components/floating-panels/GlassPanel';
import {
  BarChart3,
  TrendingUp,
  Activity,
  Cpu,
  RefreshCw,
  Sliders,
  CheckCircle,
  Database,
  ArrowUpRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

const METRIC_HISTORY = [
  { epoch: 'E-1', precision: 0.91, recall: 0.88, f1: 0.895, loss: 0.24 },
  { epoch: 'E-2', precision: 0.92, recall: 0.89, f1: 0.905, loss: 0.21 },
  { epoch: 'E-3', precision: 0.93, recall: 0.91, f1: 0.920, loss: 0.18 },
  { epoch: 'E-4', precision: 0.94, recall: 0.92, f1: 0.930, loss: 0.15 },
  { epoch: 'E-5', precision: 0.95, recall: 0.94, f1: 0.945, loss: 0.12 },
];

const FEATURE_IMPORTANCE = [
  { name: 'rapid_tx_count', score: 94 },
  { name: 'cross_border_ratio', score: 87 },
  { name: 'night_hour_activity', score: 76 },
  { name: 'mule_closeness_score', score: 71 },
  { name: 'avg_txn_deviation', score: 62 },
  { name: 'device_velocity', score: 48 },
];

export default function AnalyticsPage() {
  const [retraining, setRetraining] = useState(false);
  const [retrainLogs, setRetrainLogs] = useState<string[]>([]);
  const [hyperparameters, setHyperparameters] = useState({
    learningRate: 0.05,
    maxDepth: 6,
    subsample: 0.8
  });

  const runRetraining = async () => {
    setRetraining(true);
    setRetrainLogs([]);
    const logs = [
      '🚀 Initializing container context...',
      '📦 Querying transaction registry: 1,452,902 samples loaded',
      '🧬 GraphSAGE relational embeddings generated (Node Dim: 128)',
      '📊 Scaling datasets & computing class weight offsets',
      '🔥 Bootstrapping XGBoost parallel engine...',
      '📈 Iter 10/100: Loss = 0.322 | AUC = 0.912',
      '📈 Iter 50/100: Loss = 0.198 | AUC = 0.954',
      '📈 Iter 100/100: Loss = 0.118 | AUC = 0.982',
      '💾 Persisting new XGBoost binary explainer weight states',
      '✅ Model registration complete: V1.4.2 active'
    ];

    for (let i = 0; i < logs.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      setRetrainLogs((prev) => [...prev, logs[i]]);
    }
    setRetraining(false);
  };

  return (
    <div className="min-h-screen bg-cyber-bg p-5 font-mono">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded bg-purple-500/10 border border-purple-400/30 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-widest text-white uppercase">ML Model Diagnostics & Performance</h1>
            <p className="text-[9px] text-slate-500 mt-0.5">XGBoost Explainer Matrix · GraphSAGE Node Weights · Continuous Training</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-4">
        {/* Metric Overview */}
        <div className="col-span-12 xl:col-span-8 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'MODEL DRIFT COEFFICIENT', value: '0.012', desc: 'No intervention required', color: 'emerald' },
              { label: 'CLASSIFICATION ACCURACY', value: '98.6%', desc: 'Tested on 124K test records', color: 'cyan' },
              { label: 'FALSE POSITIVE RATE', value: '0.24%', desc: 'Industry leading benchmark', color: 'purple' },
            ].map((stat, i) => (
              <div key={i} className={`glass-panel rounded-lg p-4 border border-${stat.color}-400/20`}>
                <span className="text-[8px] text-slate-500 tracking-wider block">{stat.label}</span>
                <span className={`text-2xl font-black text-${stat.color}-400 mt-1 block`}>{stat.value}</span>
                <span className="text-[8px] text-slate-400 mt-1 block">{stat.desc}</span>
              </div>
            ))}
          </div>

          <GlassPanel title="Epoch Model Performance Log" statusColor="cyan">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={METRIC_HISTORY}>
                  <defs>
                    <linearGradient id="precisionColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="recallColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="epoch" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} domain={[0.8, 1]} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} labelClassName="text-slate-400 font-bold" />
                  <Area type="monotone" dataKey="precision" stroke="#8b5cf6" fillOpacity={1} fill="url(#precisionColor)" strokeWidth={2} name="Precision" />
                  <Area type="monotone" dataKey="recall" stroke="#3b82f6" fillOpacity={1} fill="url(#recallColor)" strokeWidth={2} name="Recall" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassPanel>

          <div className="grid grid-cols-2 gap-4">
            <GlassPanel title="Global Feature Importances" statusColor="cyan">
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={FEATURE_IMPORTANCE} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis type="number" stroke="#64748b" fontSize={8} />
                    <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={8} width={90} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                    <Bar dataKey="score" fill="#22d3ee" radius={[0, 4, 4, 0]}>
                      {FEATURE_IMPORTANCE.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#22d3ee' : '#8b5cf6'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassPanel>

            <GlassPanel title="Active Model Profile" statusColor="cyan">
              <div className="space-y-2 text-[10px]">
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-500">ALGORITHM</span>
                  <span className="text-white font-bold">XGBoost Classifier + GraphSAGE</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-500">TRAINED SAMPLE SIZE</span>
                  <span className="text-white font-bold">12,450,912 nodes</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-500">EVALUATION METRIC</span>
                  <span className="text-white font-bold">LogLoss / Multi-class AUC</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-500">DEPLOYMENT STATUS</span>
                  <span className="text-emerald-400 font-bold flex items-center">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-1.5 animate-pulse" />
                    LIVE PRODUCTION (V1.4.1)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">INFERENCE SPEED</span>
                  <span className="text-white font-bold">~4.12ms per node evaluation</span>
                </div>
              </div>
            </GlassPanel>
          </div>
        </div>

        {/* Retraining Console */}
        <div className="col-span-12 xl:col-span-4 space-y-4">
          <GlassPanel title="Hyperparameter Tuning" statusColor="cyan">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                  <span>Learning Rate (Eta)</span>
                  <span className="text-purple-400 font-bold">{hyperparameters.learningRate}</span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="0.3"
                  step="0.01"
                  value={hyperparameters.learningRate}
                  onChange={(e) => setHyperparameters({ ...hyperparameters, learningRate: parseFloat(e.target.value) })}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                  <span>Max Depth</span>
                  <span className="text-purple-400 font-bold">{hyperparameters.maxDepth}</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="12"
                  step="1"
                  value={hyperparameters.maxDepth}
                  onChange={(e) => setHyperparameters({ ...hyperparameters, maxDepth: parseInt(e.target.value) })}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                  <span>Subsample Ratio</span>
                  <span className="text-purple-400 font-bold">{hyperparameters.subsample}</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.0"
                  step="0.05"
                  value={hyperparameters.subsample}
                  onChange={(e) => setHyperparameters({ ...hyperparameters, subsample: parseFloat(e.target.value) })}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>
            </div>
          </GlassPanel>

          <GlassPanel title="Continuous Integration Pipeline" statusColor="cyan">
            <p className="text-[9px] text-slate-400 leading-relaxed mb-4">
              Force an off-cycle retraining sweep over the newly captured money mule transactions. This leverages graph convolution node targets for alignment.
            </p>

            <button
              onClick={runRetraining}
              disabled={retraining}
              className="w-full flex items-center justify-center space-x-2 bg-purple-500/10 border border-purple-400/30 text-purple-400 hover:bg-purple-500/20 font-bold text-[10px] py-3 rounded transition-all uppercase tracking-wider disabled:opacity-50"
            >
              {retraining ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Retraining Active...</span>
                </>
              ) : (
                <>
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Execute Retrain Optimization</span>
                </>
              )}
            </button>

            {retrainLogs.length > 0 && (
              <div className="mt-4 bg-black/60 rounded border border-cyber-border/20 p-3 h-[180px] overflow-y-auto space-y-1.5 pr-1 text-[8px] font-mono text-slate-300">
                {retrainLogs.map((log, index) => (
                  <div key={index} className="flex items-start">
                    <span className="text-slate-500 mr-2 shrink-0">{`[${new Date().toLocaleTimeString()}]`}</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            )}
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
