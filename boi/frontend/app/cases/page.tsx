'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FolderOpen, Search, Filter, Clock, ChevronRight, Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const CASES = [
  { id: 'CASE-001', title: 'Multi-Account Layering — Cluster Alpha', status: 'OPEN', severity: 'CRITICAL', assigned: 'SR. ANALYST PRIYA', amount: '₹18,75,000', accounts: 12, pattern: 'Layering Wave', created: '2026-06-07', last_activity: '2 hrs ago', fraud_prob: 0.97 },
  { id: 'CASE-002', title: 'Sleeper Account Activation — Region East', status: 'ESCALATED', severity: 'HIGH', assigned: 'ANALYST RAHUL', amount: '₹8,40,000', accounts: 7, pattern: 'Sleeper Activation', created: '2026-06-06', last_activity: '5 hrs ago', fraud_prob: 0.88 },
  { id: 'CASE-003', title: 'Shell Company Routing — Corp Gateway', status: 'CLOSED', severity: 'MEDIUM', assigned: 'ANALYST AMIT', amount: '₹3,12,500', accounts: 4, pattern: 'Shell Routing', created: '2026-06-05', last_activity: '1 day ago', fraud_prob: 0.74 },
  { id: 'CASE-004', title: 'Test-and-Drain Pattern — Mobile Cluster', status: 'OPEN', severity: 'HIGH', assigned: 'SR. ANALYST PRIYA', amount: '₹1,20,000', accounts: 3, pattern: 'Test and Drain', created: '2026-06-04', last_activity: '3 days ago', fraud_prob: 0.82 },
  { id: 'CASE-005', title: 'Spider Web Formation — UPI Mesh', status: 'OPEN', severity: 'CRITICAL', assigned: 'ANALYST SNEHA', amount: '₹22,50,000', accounts: 18, pattern: 'Spider Web', created: '2026-06-03', last_activity: '4 days ago', fraud_prob: 0.99 },
];

const severityColor: Record<string, string> = {
  'CRITICAL': 'text-red-400 border-red-900/50 bg-red-950/20',
  'HIGH': 'text-amber-400 border-amber-900/50 bg-amber-950/20',
  'MEDIUM': 'text-yellow-500 border-yellow-900/50 bg-yellow-950/20',
};

const statusIcon: Record<string, React.ReactNode> = {
  'OPEN': <AlertTriangle className="w-3 h-3 text-amber-400" />,
  'ESCALATED': <Shield className="w-3 h-3 text-red-400" />,
  'CLOSED': <CheckCircle className="w-3 h-3 text-emerald-400" />,
};

export default function CasesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = CASES.filter(c =>
    (statusFilter === 'ALL' || c.status === statusFilter) &&
    (c.title.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase()))
  );

  const stats = {
    open: CASES.filter(c => c.status === 'OPEN').length,
    escalated: CASES.filter(c => c.status === 'ESCALATED').length,
    closed: CASES.filter(c => c.status === 'CLOSED').length,
    total_at_risk: '₹53,97,500',
  };

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      <div className="h-[1px] bg-gradient-to-r from-transparent via-amber-500 to-transparent" />

      <div className="p-8 max-w-7xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
          <div className="flex items-center space-x-2 mb-2">
            <FolderOpen className="w-5 h-5 text-amber-400" />
            <h1 className="text-sm tracking-[0.3em] text-amber-400">CASE MANAGEMENT</h1>
          </div>
          <h2 className="text-3xl font-bold text-white">Active Investigations</h2>
        </motion.div>

        {/* Stat Strip */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'OPEN CASES', value: stats.open, color: '#f59e0b' },
            { label: 'ESCALATED', value: stats.escalated, color: '#ef4444' },
            { label: 'CLOSED', value: stats.closed, color: '#10b981' },
            { label: 'TOTAL AT RISK', value: stats.total_at_risk, color: '#8b5cf6' },
          ].map(({ label, value, color }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border p-4"
              style={{ borderColor: color + '30' }}
            >
              <div className="text-2xl font-bold" style={{ color }}>{value}</div>
              <div className="text-[9px] tracking-widest text-gray-600 mt-1">{label}</div>
            </motion.div>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative">
            <Search className="w-3 h-3 absolute left-3 top-2.5 text-gray-600" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="SEARCH CASES..."
              className="bg-gray-950 border border-gray-800 pl-8 pr-4 py-2 text-xs text-gray-300 placeholder-gray-700 focus:outline-none focus:border-amber-700 w-72"
            />
          </div>
          <div className="flex space-x-1">
            {['ALL', 'OPEN', 'ESCALATED', 'CLOSED'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 text-[10px] tracking-widest transition-all ${
                  statusFilter === s ? 'bg-amber-900/30 border border-amber-800 text-amber-300' : 'border border-gray-900 text-gray-600 hover:text-gray-400'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Case List */}
        <div className="space-y-2">
          {filtered.map((c, i) => (
            <motion.a
              key={c.id}
              href={`/investigation/${c.id}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="block border border-gray-900 bg-gray-950/30 hover:bg-gray-950 hover:border-gray-700 transition-all group p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  {/* Severity Badge */}
                  <div className={`flex-shrink-0 text-[9px] tracking-widest px-2 py-1 border w-24 text-center ${severityColor[c.severity] ?? 'text-gray-400'}`}>
                    {c.severity}
                  </div>

                  {/* Case Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="text-[10px] text-gray-500">{c.id}</span>
                      <span className="text-xs text-white group-hover:text-amber-300 transition-colors">{c.title}</span>
                    </div>
                    <div className="flex items-center space-x-4 mt-1 text-[9px] text-gray-600">
                      <span>{c.assigned}</span>
                      <span>·</span>
                      <span className="text-amber-400/70">{c.pattern}</span>
                      <span>·</span>
                      <span>{c.accounts} accounts</span>
                      <span>·</span>
                      <span className="text-red-400/70">{c.amount}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-6 flex-shrink-0">
                  {/* Risk Bar */}
                  <div>
                    <div className="text-[9px] text-gray-600 mb-1">FRAUD PROB</div>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 h-1 bg-gray-800">
                        <div className="h-full bg-red-500 transition-all" style={{ width: `${c.fraud_prob * 100}%` }} />
                      </div>
                      <span className="text-[10px] text-red-400">{(c.fraud_prob * 100).toFixed(0)}%</span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center space-x-2">
                    {statusIcon[c.status]}
                    <span className="text-[10px] text-gray-400">{c.status}</span>
                  </div>

                  {/* Last Activity */}
                  <div className="text-right">
                    <div className="text-[9px] text-gray-600">LAST ACTIVITY</div>
                    <div className="text-[10px] text-gray-400 flex items-center space-x-1">
                      <Clock className="w-2.5 h-2.5" />
                      <span>{c.last_activity}</span>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-amber-400 transition-colors" />
                </div>
              </div>
            </motion.a>
          ))}
        </div>

      </div>
    </div>
  );
}
