'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Calendar, MapPin } from 'lucide-react';
import { useGraphStore } from '@/store/useGraphStore';
import { useOrbitStore } from '@/store/useOrbitStore';
import { useRouter } from 'next/navigation';

export default function MemoryInsightPanel() {
  const { selectedNode, setSelectedNode } = useGraphStore();
  const { setIsOpen: setOrbitOpen, sendMessage } = useOrbitStore();
  const router = useRouter();

  const handleQueryInOrbit = (title: string) => {
    setOrbitOpen(true);
    sendMessage(`Analyze relationship: ${title}`, (tab) => router.push('/' + tab));
  };

  return (
    <AnimatePresence>
      {selectedNode && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-24 right-8 z-40 w-80 bg-bg-surface border border-white/[0.08] rounded-2xl p-5 shadow-2xl font-sans"
        >
          <div className="flex justify-between items-start border-b border-white/[0.08] pb-3">
            <div>
              <span className="text-[10px] text-text-secondary font-medium uppercase tracking-wider">
                {selectedNode.category}
              </span>
              <h3 className="text-sm font-semibold text-text-primary mt-0.5">{selectedNode.title}</h3>
            </div>
            <button 
              onClick={() => setSelectedNode(null)} 
              className="text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>

          <div className="py-3 space-y-2 text-xs text-text-secondary leading-relaxed">
            <p>{selectedNode.summary || 'Connected moment in your memory constellation.'}</p>
            
            <div className="flex items-center space-x-3 text-[11px] text-text-secondary pt-1">
              <span className="flex items-center space-x-1">
                <Calendar size={11} />
                <span>{selectedNode.date}</span>
              </span>
              {selectedNode.location && (
                <span className="flex items-center space-x-1">
                  <MapPin size={11} />
                  <span>{selectedNode.location}</span>
                </span>
              )}
            </div>
          </div>

          <div className="pt-2">
            <button 
              onClick={() => handleQueryInOrbit(selectedNode.title)}
              className="w-full py-2 bg-white/[0.04] hover:bg-white/[0.08] text-text-primary text-xs font-medium rounded-xl border border-white/10 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Sparkles size={12} className="text-accent-primary" />
              <span>Ask Orbit about this</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
