'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { User, Activity, AlertTriangle, ShieldCheck, Network, Database, Fingerprint, MapPin, Smartphone } from 'lucide-react';

export default function AccountIntelligenceDossier() {
  const { accountId } = useParams();
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    const fetchProfile = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/accounts/${accountId}`);
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch (e) {
        console.error("Failed to fetch account dossier", e);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [accountId]);

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <Activity className="w-12 h-12 text-cyan-900 animate-pulse" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-cyan-500 font-mono">
        DOSSIER NOT FOUND OR RESTRICTED.
      </div>
    );
  }

  const isHighRisk = profile.risk_tier === 'HIGH' || profile.risk_tier === 'FREEZE';

  return (
    <div className="min-h-screen p-8 bg-black text-cyan-500 font-mono relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-900/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-end border-b border-cyan-900/50 pb-4 mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-[0.2em] text-white flex items-center">
            <Fingerprint className="w-8 h-8 mr-3 text-cyan-500" />
            INTELLIGENCE DOSSIER
          </h1>
          <p className="text-cyan-600 text-xs tracking-widest mt-1">ENTITY IDENTIFIER: {profile.account_id}</p>
        </div>
        <div className={`px-4 py-2 border font-bold tracking-widest text-sm ${
          isHighRisk ? 'bg-red-950/30 border-red-900 text-red-400' : 'bg-emerald-950/30 border-emerald-900 text-emerald-400'
        }`}>
          RISK TIER: {profile.risk_tier}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Identity & Behavior */}
        <div className="space-y-6">
          {/* Identity Block */}
          <div className="border border-cyan-900/50 bg-black/40 backdrop-blur-md p-6 relative group">
             <div className="absolute top-0 left-0 w-2 h-full bg-cyan-500/20 group-hover:bg-cyan-500/50 transition-colors" />
             <h2 className="text-xs tracking-widest text-cyan-400 mb-4 flex items-center">
               <User className="w-4 h-4 mr-2" /> IDENTITY MATRIX
             </h2>
             <div className="space-y-3 text-xs">
               <div className="flex justify-between border-b border-cyan-900/30 pb-1">
                 <span className="text-cyan-700">BANK CODE</span>
                 <span className="text-cyan-100">{profile.bank_code}</span>
               </div>
               <div className="flex justify-between border-b border-cyan-900/30 pb-1">
                 <span className="text-cyan-700">IFSC ROUTING</span>
                 <span className="text-cyan-100">{profile.ifsc}</span>
               </div>
               <div className="flex justify-between border-b border-cyan-900/30 pb-1">
                 <span className="text-cyan-700">DORMANCY PERIOD</span>
                 <span className="text-cyan-100">{profile.dormancy_days} DAYS</span>
               </div>
               <div className="flex justify-between border-b border-cyan-900/30 pb-1">
                 <span className="text-cyan-700">LOCKED STATUS</span>
                 <span className={profile.is_frozen ? 'text-red-400' : 'text-emerald-400'}>
                   {profile.is_frozen ? 'FROZEN' : 'ACTIVE'}
                 </span>
               </div>
             </div>
          </div>

          {/* Device & Location (Simulated signals) */}
          <div className="border border-cyan-900/50 bg-black/40 backdrop-blur-md p-6">
             <h2 className="text-xs tracking-widest text-cyan-400 mb-4 flex items-center">
               <MapPin className="w-4 h-4 mr-2" /> GEO & DEVICE SIGNALS
             </h2>
             <div className="space-y-4">
               <div className="bg-cyan-950/20 p-3 border border-cyan-900/30">
                 <div className="flex items-center text-xs text-cyan-300 mb-1">
                   <Smartphone className="w-3 h-3 mr-2" /> DEVICE FINGERPRINT
                 </div>
                 <div className="text-[10px] text-cyan-600">Multiple IMSI detected. Tor exit node usage: 14%.</div>
               </div>
               <div className="bg-cyan-950/20 p-3 border border-cyan-900/30">
                 <div className="flex items-center text-xs text-cyan-300 mb-1">
                   <MapPin className="w-3 h-3 mr-2" /> RECENT LOCATIONS
                 </div>
                 <div className="text-[10px] text-cyan-600">Jamtara Region (65%), Mumbai (35%). Velocity impossible.</div>
               </div>
             </div>
          </div>
        </div>

        {/* Center Column: Intelligence & Graph */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Mule & Graph Intelligence */}
          <div className="border border-cyan-900/50 bg-black/40 backdrop-blur-md p-6 grid grid-cols-2 gap-4">
             <div>
               <h2 className="text-xs tracking-widest text-cyan-400 mb-4 flex items-center">
                 <Network className="w-4 h-4 mr-2" /> NETWORK TOPOLOGY
               </h2>
               <div className="space-y-2 text-xs">
                 <div className="flex justify-between">
                   <span className="text-cyan-700">DEGREE CENTRALITY</span>
                   <span className="text-cyan-100">{profile.graph_intelligence.centrality.toFixed(4)}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-cyan-700">PAGERANK</span>
                   <span className="text-cyan-100">{profile.graph_intelligence.pagerank.toFixed(5)}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-cyan-700">IN / OUT DEGREE</span>
                   <span className="text-cyan-100">{profile.graph_intelligence.in_degree} / {profile.graph_intelligence.out_degree}</span>
                 </div>
               </div>
             </div>
             
             <div className={`p-4 border ${profile.graph_intelligence.is_mule_suspect ? 'bg-red-950/20 border-red-900/50' : 'bg-cyan-950/20 border-cyan-900/50'} flex flex-col items-center justify-center`}>
               <div className="text-[10px] tracking-widest mb-2 opacity-70">MULE PROBABILITY</div>
               <div className={`text-4xl font-light ${profile.graph_intelligence.is_mule_suspect ? 'text-red-400' : 'text-cyan-400'}`}>
                 {(profile.graph_intelligence.mule_probability * 100).toFixed(1)}%
               </div>
               {profile.graph_intelligence.is_mule_suspect && (
                 <div className="text-[10px] text-red-500 mt-2 font-bold animate-pulse">
                   STRUCTURAL FLAG DETECTED
                 </div>
               )}
             </div>
          </div>

          {/* Transaction Ledger */}
          <div className="border border-cyan-900/50 bg-black/40 backdrop-blur-md p-6">
             <h2 className="text-xs tracking-widest text-cyan-400 mb-4 flex items-center">
               <Database className="w-4 h-4 mr-2" /> TRANSACTION LEDGER (LAST 50)
             </h2>
             <div className="h-64 overflow-y-auto pr-2 space-y-2">
               {profile.recent_transactions.map((t: any) => {
                 const isOutgoing = t.source_account === accountId;
                 return (
                   <div key={t.id} className="text-[10px] flex justify-between p-2 border-b border-cyan-900/30 hover:bg-cyan-900/20">
                     <div className="flex items-center w-1/3">
                       <span className={isOutgoing ? 'text-red-400 mr-2' : 'text-emerald-400 mr-2'}>
                         {isOutgoing ? 'OUT' : 'IN'}
                       </span>
                       <span className="text-cyan-600 truncate">{isOutgoing ? t.dest_account : t.source_account}</span>
                     </div>
                     <div className="w-1/3 text-center text-cyan-300">
                       {t.channel}
                     </div>
                     <div className={`w-1/3 text-right font-bold ${isOutgoing ? 'text-red-300' : 'text-emerald-300'}`}>
                       {isOutgoing ? '-' : '+'}₹{t.amount.toFixed(2)}
                     </div>
                   </div>
                 );
               })}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
