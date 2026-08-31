'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Plus, ShieldCheck, Clock, AlertTriangle, Download, CheckCircle, Search } from 'lucide-react';

const STATUSES = ['ALL', 'DRAFT', 'SUBMITTED', 'ACKNOWLEDGED'];

const MOCK_REPORTS = [
  { id: 'STR-20260607-A1B2C3', case_id: 'CASE-001', status: 'SUBMITTED', fraud_prob: 0.97, mules: 7, amount: '₹8,40,000', created: '2026-06-07 09:12', pattern: 'Layering Wave' },
  { id: 'STR-20260606-D4E5F6', case_id: 'CASE-002', status: 'DRAFT', fraud_prob: 0.88, mules: 4, amount: '₹3,12,500', created: '2026-06-06 14:30', pattern: 'Spider Web' },
  { id: 'STR-20260605-G7H8I9', case_id: 'CASE-003', status: 'ACKNOWLEDGED', fraud_prob: 0.99, mules: 12, amount: '₹18,75,000', created: '2026-06-05 11:00', pattern: 'Shell Routing' },
  { id: 'STR-20260604-J0K1L2', case_id: 'CASE-004', status: 'DRAFT', fraud_prob: 0.74, mules: 3, amount: '₹1,50,000', created: '2026-06-04 16:45', pattern: 'Sleeper Activation' },
];

const statusColor: Record<string, string> = {
  'DRAFT': 'text-amber-400 border-amber-900/50 bg-amber-950/20',
  'SUBMITTED': 'text-cyan-400 border-cyan-900/50 bg-cyan-950/20',
  'ACKNOWLEDGED': 'text-emerald-400 border-emerald-900/50 bg-emerald-950/20',
};

export default function CompliancePage() {
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<typeof MOCK_REPORTS[0] | null>(null);

  const filtered = MOCK_REPORTS.filter(r =>
    (filter === 'ALL' || r.status === filter) &&
    (r.id.toLowerCase().includes(search.toLowerCase()) || r.case_id.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-black text-white font-mono overflow-hidden flex flex-col">
      <div className="h-[1px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />

      <div className="flex flex-1 overflow-hidden">

        {/* Left: Report List */}
        <div className="w-[420px] flex-shrink-0 border-r border-gray-900 flex flex-col">
          <div className="p-6 border-b border-gray-900">
            <div className="flex items-center space-x-2 mb-4">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h1 className="text-sm tracking-[0.2em] text-emerald-400">STR COMPLIANCE CENTER</h1>
            </div>
            <div className="relative mb-4">
              <Search className="w-3 h-3 absolute left-3 top-2.5 text-gray-600" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="SEARCH REPORTS..."
                className="w-full bg-gray-950 border border-gray-800 pl-8 pr-3 py-2 text-xs text-gray-300 placeholder-gray-700 focus:outline-none focus:border-emerald-700"
              />
            </div>
            <div className="flex space-x-1">
              {STATUSES.map(s => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-3 py-1 text-[10px] tracking-widest transition-all ${
                    filter === s ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-800' : 'text-gray-600 hover:text-gray-400'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-900">
            {filtered.map(r => (
              <button
                key={r.id}
                onClick={() => setSelected(r)}
                className={`w-full p-4 text-left hover:bg-gray-950 transition-colors ${selected?.id === r.id ? 'bg-gray-950 border-l-2 border-emerald-500' : ''}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs text-white font-bold">{r.id}</span>
                  <span className={`text-[9px] tracking-widest px-2 py-0.5 border ${statusColor[r.status]}`}>{r.status}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-gray-500">{r.case_id}</span>
                  <span className="text-gray-600">{r.created}</span>
                </div>
                <div className="flex items-center space-x-3 mt-2 text-[10px]">
                  <span className="text-red-400">{(r.fraud_prob * 100).toFixed(0)}% RISK</span>
                  <span className="text-gray-600">·</span>
                  <span className="text-amber-400">{r.mules} MULES</span>
                  <span className="text-gray-600">·</span>
                  <span className="text-gray-400">{r.amount}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Report Detail */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8 max-w-3xl"
              >
                {/* Report Header */}
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <div className="text-[10px] text-gray-600 mb-1 tracking-widest">SUSPICIOUS TRANSACTION REPORT</div>
                    <h2 className="text-2xl font-bold text-white">{selected.id}</h2>
                    <div className={`inline-block mt-2 text-[10px] tracking-widest px-3 py-1 border ${statusColor[selected.status]}`}>
                      {selected.status}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="flex items-center space-x-2 px-4 py-2 border border-gray-800 text-gray-400 hover:border-gray-600 text-xs transition-colors">
                      <Download className="w-3 h-3" />
                      <span>EXPORT PDF</span>
                    </button>
                    {selected.status === 'DRAFT' && (
                      <button className="flex items-center space-x-2 px-4 py-2 bg-emerald-900/30 border border-emerald-700 text-emerald-400 hover:bg-emerald-900/60 text-xs transition-colors">
                        <CheckCircle className="w-3 h-3" />
                        <span>SUBMIT TO FIU</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Report Metadata Grid */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {[
                    { label: 'CASE ID', value: selected.case_id },
                    { label: 'FRAUD PROBABILITY', value: `${(selected.fraud_prob * 100).toFixed(1)}%` },
                    { label: 'AMOUNT AT RISK', value: selected.amount },
                    { label: 'FRAUD PATTERN', value: selected.pattern },
                    { label: 'MULE NETWORK SIZE', value: `${selected.mules} accounts` },
                    { label: 'REPORTING ENTITY', value: 'Bank of India' },
                  ].map(({ label, value }) => (
                    <div key={label} className="border border-gray-900 p-3">
                      <div className="text-[9px] text-gray-600 tracking-widest mb-1">{label}</div>
                      <div className="text-xs text-white">{value}</div>
                    </div>
                  ))}
                </div>

                {/* AI Narrative */}
                <div className="border border-gray-800 p-6 mb-6 bg-gray-950/50">
                  <div className="flex items-center space-x-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span className="text-xs tracking-widest text-amber-400">AI-GENERATED NARRATIVE</span>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    Transaction flagged by XGBoost engine with <strong className="text-white">{(selected.fraud_prob * 100).toFixed(1)}%</strong> probability of fraud.
                    SHAP analysis identified anomalous patterns in the top contributing feature vectors.
                    The Operational Simulation layer projected a potential mule network containing <strong className="text-white">{selected.mules}</strong> connected accounts
                    exhibiting a <strong className="text-amber-400">{selected.pattern}</strong> topology. 
                    Total estimated fund movement at risk: <strong className="text-red-400">{selected.amount}</strong>.
                    <span className="text-red-400 font-bold"> Recommendation: IMMEDIATE QUARANTINE AND FIU REPORTING.</span>
                  </p>
                </div>

                {/* Timeline placeholder */}
                <div className="border border-gray-900 p-4">
                  <div className="text-[10px] tracking-widest text-gray-600 mb-4">EVIDENCE TIMELINE</div>
                  <div className="space-y-3">
                    {[
                      { time: selected.created, type: 'TRANSACTION FLAGGED', color: 'text-red-400' },
                      { time: '+ 0:02', type: 'XGBOOST INFERENCE COMPLETED', color: 'text-violet-400' },
                      { time: '+ 0:04', type: 'SHAP EXPLANATION GENERATED', color: 'text-cyan-400' },
                      { time: '+ 0:06', type: 'MULE NETWORK SIMULATION INITIATED', color: 'text-amber-400' },
                      { time: '+ 0:08', type: 'STR DRAFT CREATED', color: 'text-emerald-400' },
                    ].map(({ time, type, color }) => (
                      <div key={type} className="flex items-center space-x-4 text-xs">
                        <span className="text-gray-700 w-28">{time}</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
                        <span className={color}>{type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex items-center justify-center"
              >
                <div className="text-center text-gray-700">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p className="text-xs tracking-widest">SELECT A REPORT TO VIEW</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
