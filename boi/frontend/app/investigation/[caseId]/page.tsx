'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Brain, Clock, ShieldAlert, Cpu, Network, Zap, FileText } from 'lucide-react';
import { useReplayStore } from '@/lib/store/replayStore';

export default function InvestigationWorkspace() {
  const { caseId } = useParams();
  const [mounted, setMounted] = useState(false);
  const [caseMeta, setCaseMeta] = useState<any>(null);
  
  // Replay State
  const { events, setEvents, currentIndex, isPlaying, play, pause, next, previous, jumpTo } = useReplayStore();

  // AI Copilot State
  const [chatLog, setChatLog] = useState<{role: 'ai' | 'user', msg: string}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [riskStory, setRiskStory] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    // Fetch case metadata and timeline
    const fetchTimeline = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/investigations/${caseId}/timeline`);
        if (res.ok) {
          const data = await res.json();
          setEvents(data);
          // Set dummy meta for now, ideally fetch from /api/investigations/{caseId}
          setCaseMeta({
            id: caseId,
            priority: data.some((e:any) => e.type === 'RISK_ESCALATION') ? 'CRITICAL' : 'HIGH',
            status: 'ACTIVE_INVESTIGATION',
            fraudGenome: 'SLEEPER_ACTIVATION',
            assigned: 'OP-774'
          });
        }
      } catch (e) {
        console.error("Failed to fetch timeline", e);
      }
    };
    fetchTimeline();
  }, [caseId, setEvents]);

  // Replay Loop
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        next();
      }, 1500); // 1.5 seconds per event jump
    }
    return () => clearInterval(interval);
  }, [isPlaying, next]);

  const handleCopilotChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    setChatLog(prev => [...prev, { role: 'user', msg: chatInput }]);
    const req = chatInput;
    setChatInput('');
    setIsTyping(true);

    try {
      const res = await fetch(`http://localhost:8000/api/investigations/${caseId}/copilot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: req })
      });
      const data = await res.json();
      setChatLog(prev => [...prev, { role: 'ai', msg: data.reply }]);
    } catch (e) {
      setChatLog(prev => [...prev, { role: 'ai', msg: 'CONNECTION TO AI CORE LOST.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleGenerateStory = async () => {
    setRiskStory("Generating Narrative...");
    try {
      const res = await fetch(`http://localhost:8000/api/investigations/${caseId}/risk_story`);
      const data = await res.json();
      setRiskStory(data.risk_story);
    } catch (e) {
      setRiskStory("Failed to generate story.");
    }
  };

  if (!mounted) return null;

  return (
    <div className="h-screen p-4 flex gap-4 relative overflow-hidden bg-black text-cyan-500 font-mono text-sm">
      
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(8,145,178,0.05)_0%,transparent_100%)] pointer-events-none z-0" />

      {/* ==================================================
          LEFT PANEL: CASE METADATA
          ================================================== */}
      <div className="w-1/4 border border-cyan-900/50 bg-black/60 backdrop-blur-md flex flex-col z-10">
        <div className="p-3 border-b border-cyan-900/50 bg-cyan-950/30 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-cyan-400" />
            <span className="tracking-widest font-bold text-cyan-400">DOSSIER</span>
          </div>
          <span className="text-[10px] text-cyan-700">{caseId}</span>
        </div>
        
        <div className="p-4 space-y-6">
          {caseMeta && (
            <div className="space-y-4">
              <div>
                <div className="text-[10px] text-cyan-600 mb-1">PRIORITY LEVEL</div>
                <div className="px-2 py-1 bg-red-950/30 border border-red-900 text-red-400 font-bold tracking-widest inline-block">
                  {caseMeta.priority}
                </div>
              </div>
              
              <div>
                <div className="text-[10px] text-cyan-600 mb-1">FRAUD GENOME</div>
                <div className="flex items-center text-yellow-400">
                  <Network className="w-4 h-4 mr-2" />
                  {caseMeta.fraudGenome}
                </div>
              </div>

              <div>
                <div className="text-[10px] text-cyan-600 mb-1">STATUS</div>
                <div className="text-cyan-300 animate-pulse">{caseMeta.status}</div>
              </div>
            </div>
          )}
          
          <div className="pt-4 border-t border-cyan-900/50">
             <div className="text-[10px] text-cyan-600 mb-2">QUICK ACTIONS</div>
             <button className="w-full py-2 bg-red-950/20 border border-red-900/50 text-red-400 hover:bg-red-900/40 transition-colors text-xs tracking-widest mb-2">
               INITIATE GLOBAL FREEZE
             </button>
             <button className="w-full py-2 bg-cyan-950/20 border border-cyan-900/50 text-cyan-400 hover:bg-cyan-900/40 transition-colors text-xs tracking-widest">
               GENERATE STR REPORT
             </button>
          </div>
        </div>
      </div>

      {/* ==================================================
          CENTER PANEL: TIMELINE & GRAPH REPLAY
          ================================================== */}
      <div className="w-2/4 flex flex-col gap-4 z-10">
        
        {/* Top: Graph Placeholder (To be integrated with React Flow) */}
        <div className="flex-1 border border-cyan-900/50 bg-black/60 backdrop-blur-md relative flex items-center justify-center overflow-hidden">
           <div className="absolute top-2 left-2 flex items-center space-x-2 text-[10px] text-cyan-600 z-20">
             <Network className="w-3 h-3" />
             <span>NETWORK INTELLIGENCE LAYER</span>
           </div>
           
           <div className="text-center opacity-30">
             <Network className="w-16 h-16 mx-auto mb-2" />
             <p className="tracking-widest text-xs">DYNAMIC GRAPH SYNCHRONIZED TO TIMELINE</p>
             <p className="tracking-widest text-[10px] mt-2">({events[currentIndex]?.timestamp || 'NO DATA'})</p>
           </div>
        </div>

        {/* Bottom: Timeline Replay Engine */}
        <div className="h-1/3 border border-cyan-900/50 bg-black/60 backdrop-blur-md flex flex-col relative">
          <div className="p-2 border-b border-cyan-900/50 bg-cyan-950/30 flex justify-between items-center">
            <span className="text-[10px] tracking-widest text-cyan-500 flex items-center">
              <Clock className="w-3 h-3 mr-2" /> REPLAY ENGINE
            </span>
            <div className="flex space-x-2">
              <button onClick={previous} className="p-1 hover:text-white hover:bg-cyan-900/50"><SkipBack className="w-4 h-4" /></button>
              <button onClick={isPlaying ? pause : play} className="p-1 text-cyan-300 hover:text-white hover:bg-cyan-900/50">
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button onClick={next} className="p-1 hover:text-white hover:bg-cyan-900/50"><SkipForward className="w-4 h-4" /></button>
            </div>
          </div>
          
          <div className="flex-1 overflow-x-auto p-4 flex items-center space-x-4">
            {events.map((ev, idx) => (
              <div 
                key={ev.id} 
                onClick={() => jumpTo(idx)}
                className={`flex-shrink-0 w-48 p-3 border cursor-pointer transition-all ${
                  idx === currentIndex 
                    ? 'border-cyan-400 bg-cyan-900/30 scale-105 shadow-[0_0_15px_rgba(6,182,212,0.3)]' 
                    : idx < currentIndex
                      ? 'border-cyan-900/50 bg-cyan-950/10 opacity-70'
                      : 'border-cyan-900/20 bg-transparent opacity-40'
                }`}
              >
                <div className="text-[9px] text-cyan-600 mb-1">
                  {new Date(ev.timestamp).toLocaleTimeString()}
                </div>
                <div className={`font-bold text-xs truncate ${
                  ev.type === 'RISK_ESCALATION' ? 'text-red-400' : 'text-cyan-300'
                }`}>
                  {ev.title}
                </div>
                <div className="text-[10px] text-cyan-500/70 mt-1 truncate">
                  {ev.description}
                </div>
              </div>
            ))}
          </div>
          {/* Progress Bar */}
          <div className="h-1 bg-black w-full absolute bottom-0 left-0">
             <div 
               className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)] transition-all duration-300"
               style={{ width: `${events.length > 0 ? ((currentIndex + 1) / events.length) * 100 : 0}%` }}
             />
          </div>
        </div>
      </div>

      {/* ==================================================
          RIGHT PANEL: AI COPILOT & STORY GENERATOR
          ================================================== */}
      <div className="w-1/4 flex flex-col gap-4 z-10">
        
        {/* Risk Story Generator */}
        <div className="h-1/3 border border-emerald-900/50 bg-black/60 backdrop-blur-md flex flex-col">
          <div className="p-3 border-b border-emerald-900/50 bg-emerald-950/30 flex justify-between items-center">
            <span className="text-[10px] tracking-widest text-emerald-500 flex items-center">
              <FileText className="w-3 h-3 mr-2" /> RISK STORY
            </span>
            <button onClick={handleGenerateStory} className="text-[9px] px-2 py-0.5 border border-emerald-500/50 hover:bg-emerald-900/50 text-emerald-400 transition-colors">
              GENERATE
            </button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto text-xs text-emerald-100/80 leading-relaxed font-sans">
            {riskStory || (
              <div className="h-full flex items-center justify-center text-emerald-800/50 font-mono tracking-widest text-center">
                CLICK GENERATE TO COMPILE INVESTIGATION NARRATIVE
              </div>
            )}
          </div>
        </div>

        {/* AI Copilot Terminal */}
        <div className="flex-1 border border-indigo-900/50 bg-black/60 backdrop-blur-md flex flex-col">
          <div className="p-3 border-b border-indigo-900/50 bg-indigo-950/30 flex items-center">
            <Brain className="w-4 h-4 mr-2 text-indigo-400" />
            <span className="text-[10px] tracking-widest text-indigo-400">AEGISNET AI COPILOT</span>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {chatLog.length === 0 && (
              <div className="text-[10px] text-indigo-500/50 text-center mt-10">
                SYSTEM READY. AWAITING QUERY.
              </div>
            )}
            {chatLog.map((c, i) => (
              <div key={i} className={`flex ${c.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-2 text-xs ${
                  c.role === 'user' 
                    ? 'bg-indigo-900/30 border border-indigo-500/30 text-indigo-100' 
                    : 'bg-black border border-indigo-900/80 text-indigo-300 font-sans'
                }`}>
                  {c.msg}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-[85%] p-2 text-xs bg-black border border-indigo-900/80 text-indigo-500 flex items-center space-x-2">
                  <Cpu className="w-3 h-3 animate-pulse" /> <span>PROCESSING...</span>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleCopilotChat} className="p-2 border-t border-indigo-900/50">
            <input 
              type="text" 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="ASK COPILOT..."
              className="w-full bg-indigo-950/20 border border-indigo-900/50 px-3 py-2 text-xs text-indigo-100 placeholder-indigo-800 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </form>
        </div>
      </div>
      
    </div>
  );
}
