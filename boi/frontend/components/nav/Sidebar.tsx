'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ShieldAlert,
  Activity,
  Search,
  FileText,
  BarChart3,
  Network,
  Settings,
  Zap,
  ChevronRight,
  AlertTriangle,
  Eye,
  ScrollText,
  Globe,
  Brain,
  FolderOpen,
  Map,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';

const navGroups = [
  {
    group: 'COMMAND',
    items: [
      { label: 'COMMAND HQ', path: '/', icon: ShieldAlert, color: 'cyan', description: 'Live Threat Grid' },
      { label: 'EXECUTIVE VIEW', path: '/overview', icon: Activity, color: 'blue', description: 'National Risk Index' },
    ]
  },
  {
    group: 'INTELLIGENCE',
    items: [
      { label: 'CASES', path: '/cases', icon: FolderOpen, color: 'amber', description: 'Case Management' },
      { label: 'INVESTIGATION', path: '/investigate', icon: Search, color: 'blue', description: 'Forensics & Graph AI' },
      { label: 'THREAT INTEL', path: '/threats', icon: Eye, color: 'yellow', description: 'Pattern Detection' },
      { label: 'NETWORK GRAPH', path: '/network', icon: Network, color: 'red', description: 'Topology Command' },
      { label: 'INDIA GRID', path: '/india-intelligence', icon: Map, color: 'cyan', description: 'Geo Threat Map' },
    ]
  },
  {
    group: 'AI & COMPLIANCE',
    items: [
      { label: 'AI LAB', path: '/ai-lab', icon: Brain, color: 'violet', description: 'Model Performance' },
      { label: 'COMPLIANCE', path: '/compliance', icon: FileText, color: 'green', description: 'FIU-IND STR Reports' },
      { label: 'AUDIT LEDGER', path: '/audit', icon: ScrollText, color: 'indigo', description: 'Immutable Event Trail' },
      { label: 'ANALYTICS', path: '/analytics', icon: BarChart3, color: 'purple', description: 'ML Analytics' },
    ]
  },
  {
    group: 'SYSTEM',
    items: [
      { label: 'SETTINGS', path: '/settings', icon: Settings, color: 'cyan', description: 'System Configuration' },
    ]
  }
];

const colorMap: Record<string, string> = {
  cyan:   'text-cyan-400 border-cyan-400/30 bg-cyan-400/5',
  blue:   'text-blue-400 border-blue-400/30 bg-blue-400/5',
  yellow: 'text-amber-400 border-amber-400/30 bg-amber-400/5',
  amber:  'text-amber-400 border-amber-400/30 bg-amber-400/5',
  green:  'text-emerald-400 border-emerald-400/30 bg-emerald-400/5',
  purple: 'text-purple-400 border-purple-400/30 bg-purple-400/5',
  violet: 'text-violet-400 border-violet-400/30 bg-violet-400/5',
  red:    'text-red-400 border-red-400/30 bg-red-400/5',
  indigo: 'text-indigo-400 border-indigo-400/30 bg-indigo-400/5',
};

const hoverMap: Record<string, string> = {
  cyan:   'text-cyan-400/50 hover:text-cyan-400 hover:bg-cyan-400/5 hover:border-cyan-400/20',
  blue:   'text-blue-400/50 hover:text-blue-400 hover:bg-blue-400/5 hover:border-blue-400/20',
  yellow: 'text-amber-400/50 hover:text-amber-400 hover:bg-amber-400/5 hover:border-amber-400/20',
  amber:  'text-amber-400/50 hover:text-amber-400 hover:bg-amber-400/5 hover:border-amber-400/20',
  green:  'text-emerald-400/50 hover:text-emerald-400 hover:bg-emerald-400/5 hover:border-emerald-400/20',
  purple: 'text-purple-400/50 hover:text-purple-400 hover:bg-purple-400/5 hover:border-purple-400/20',
  violet: 'text-violet-400/50 hover:text-violet-400 hover:bg-violet-400/5 hover:border-violet-400/20',
  red:    'text-red-400/50 hover:text-red-400 hover:bg-red-400/5 hover:border-red-400/20',
  indigo: 'text-indigo-400/50 hover:text-indigo-400 hover:bg-indigo-400/5 hover:border-indigo-400/20',
};

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const logout = useAuthStore((state) => state.logout);

  return (
    <aside className="fixed left-0 top-0 h-full w-[72px] hover:w-[230px] transition-all duration-300 ease-in-out z-50 flex flex-col overflow-hidden group">
      {/* Background */}
      <div className="absolute inset-0 bg-[#020617]/95 border-r border-cyan-500/10 backdrop-blur-xl" />
      {/* Right accent line */}
      <div className="absolute right-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent" />

      <div className="relative flex flex-col h-full py-4 px-2 overflow-y-auto overflow-x-hidden">

        {/* Logo */}
        <div className="flex items-center space-x-3 px-2 py-3 mb-4 border-b border-cyan-500/10 pb-4 shrink-0">
          <div className="w-9 h-9 shrink-0 bg-cyan-400/10 border border-cyan-400/30 rounded flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.2)]">
            <ShieldAlert className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="overflow-hidden whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="text-[11px] font-black tracking-widest text-white uppercase">AEGISNET</div>
            <div className="text-[8px] text-cyan-400/70 tracking-wider">FI COMMAND GRID v2.0</div>
          </div>
        </div>

        {/* Nav Groups */}
        <nav className="flex-1 space-y-4">
          {navGroups.map((group) => (
            <div key={group.group}>
              {/* Group Label */}
              <div className="overflow-hidden whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 px-2 mb-1">
                <span className="text-[8px] tracking-[0.25em] text-gray-700">{group.group}</span>
              </div>

              {/* Items */}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
                  const Icon = item.icon;
                  return (
                    <Link key={item.path} href={item.path}>
                      <motion.div
                        whileHover={{ x: 2 }}
                        className={`relative flex items-center space-x-3 px-2 py-2.5 rounded border transition-all duration-150 cursor-pointer
                          ${isActive
                            ? colorMap[item.color] + ' border'
                            : 'border-transparent ' + hoverMap[item.color]
                          }`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="activeIndicator"
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-current rounded-full opacity-80"
                          />
                        )}
                        <Icon className="w-4 h-4 shrink-0" />
                        <div className="overflow-hidden whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-1">
                          <div className="text-[10px] font-bold tracking-wider">{item.label}</div>
                          <div className="text-[8px] text-slate-500">{item.description}</div>
                        </div>
                        {isActive && (
                          <ChevronRight className="w-3 h-3 ml-auto shrink-0 opacity-0 group-hover:opacity-60 transition-opacity" />
                        )}
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="mt-auto border-t border-cyan-500/10 pt-3 space-y-1 shrink-0">
          {/* Threat Level */}
          <div className="flex items-center space-x-2 px-2 py-1.5 rounded border border-red-500/30 bg-red-500/5 text-[9px] font-bold text-red-400">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 animate-pulse" />
            <span className="overflow-hidden whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              THREAT: HIGH — 5 OPEN CASES
            </span>
          </div>

          {/* ML Model Status */}
          <div className="flex items-center space-x-2 px-2 py-1.5 text-[9px] text-violet-400/70">
            <Brain className="w-3 h-3 shrink-0" />
            <span className="overflow-hidden whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              XGBOOST — F1: 100% · AUC: 1.0
            </span>
          </div>

          {/* System Status */}
          <div className="flex items-center space-x-2 px-2 py-1.5 text-[9px] text-slate-500">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="overflow-hidden whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              ALL SYSTEMS NOMINAL
            </span>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="w-full flex items-center space-x-2 px-2 py-1.5 text-[9px] text-slate-600 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-3 h-3 shrink-0" />
            <span className="overflow-hidden whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              LOGOUT
            </span>
          </button>

          {/* Version */}
          <div className="flex items-center space-x-2 px-2 py-1 text-[8px] text-slate-700">
            <Zap className="w-3 h-3 shrink-0" />
            <span className="overflow-hidden whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              v2.0.0 · BOI × IIT-H · 2026
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
