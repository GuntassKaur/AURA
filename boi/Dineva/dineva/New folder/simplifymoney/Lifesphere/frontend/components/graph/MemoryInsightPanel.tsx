'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Calendar, MapPin, ArrowRight } from 'lucide-react';
import { useGraphStore } from '@/store/useGraphStore';
import { useOrbitStore } from '@/store/useOrbitStore';
import { useRouter } from 'next/navigation';

const TYPE_ROUTES: Record<string, string> = {
  trip: '/timeline',
  photo: '/photos',
  invoice: '/documents',
  warranty: '/documents',
  subscription: '/subscriptions',
  medical: '/documents',
  person: '/timeline',
  ai_insight: '/chat',
};

export default function MemoryInsightPanel() {
  const { selectedNode, setSelectedNode } = useGraphStore();
  const { setIsOpen: setOrbitOpen, sendMessage } = useOrbitStore();
  const router = useRouter();

  const handleQueryInOrbit = (title: string) => {
    setOrbitOpen(true);
    sendMessage(`Tell me more about: ${title}`, (tab) => router.push('/' + tab));
    setSelectedNode(null);
  };

  const handleViewEntity = () => {
    if (!selectedNode) return;
    const route = TYPE_ROUTES[selectedNode.type] ?? '/timeline';
    setSelectedNode(null);
    router.push(route);
  };

  return (
    <AnimatePresence>
      {selectedNode && (
        <>
          {/* Mobile backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedNode(null)}
            className="fixed inset-0 bg-[#17181C]/30 z-30 sm:hidden"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 240 }}
            className="fixed bottom-0 left-0 right-0 sm:bottom-6 sm:right-6 sm:left-auto z-40 w-full sm:w-80 bg-white border-t sm:border border-[#E5E3DC] rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl font-sans text-left pb-8 sm:pb-5"
          >
            {/* Mobile grabber */}
            <div className="w-10 h-1 bg-[#E5E3DC] rounded-full mx-auto mb-4 sm:hidden" />

            <div className="flex justify-between items-start mb-4">
              <div className="min-w-0 pr-3">
                <span className="text-[10px] font-bold text-[#5B5CE2] uppercase tracking-wider">
                  {selectedNode.category}
                </span>
                <h3 className="text-sm font-serif font-bold text-[#17181C] mt-0.5 leading-snug">
                  {selectedNode.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="p-1.5 rounded-full text-[#9A9C9F] hover:text-[#17181C] hover:bg-[#F7F6F2] transition-colors shrink-0 cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <p className="text-xs text-[#6B6D73] leading-relaxed mb-3">
              {selectedNode.summary || 'A connected moment in your personal memory map.'}
            </p>

            <div className="flex items-center gap-4 text-[10px] font-mono text-[#9A9C9F] mb-4 flex-wrap">
              <span className="flex items-center gap-1">
                <Calendar size={10} />
                {selectedNode.date}
              </span>
              {selectedNode.location && (
                <span className="flex items-center gap-1">
                  <MapPin size={10} />
                  {selectedNode.location}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleViewEntity}
                className="w-full py-2 px-4 rounded-xl bg-[#5B5CE2] hover:bg-[#4A4BC9] text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                View in LifeSphere
                <ArrowRight size={12} />
              </button>
              <button
                onClick={() => handleQueryInOrbit(selectedNode.title)}
                className="w-full py-2 px-4 rounded-xl bg-[#F7F6F2] hover:bg-[#F0EFEA] border border-[#E5E3DC] text-[#5B5CE2] text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles size={12} />
                Ask Orbit about this
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
