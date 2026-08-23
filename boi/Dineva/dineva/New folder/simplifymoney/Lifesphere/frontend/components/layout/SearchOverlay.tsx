'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, History, ArrowRight, FileText, Image as ImageIcon, Compass } from 'lucide-react';
import { useSearchStore } from '@/store/useSearchStore';

interface SearchOverlayProps {
  onNavigate: (tab: string) => void;
}

export default function SearchOverlay({ onNavigate }: SearchOverlayProps) {
  const { isOpen, query, recentSearches, closeSearch, setQuery, addRecentSearch, clearRecentSearches } = useSearchStore();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const sampleResults = [
    { id: '1', title: 'Taj Resort Goa Invoice', type: 'document', category: 'Travel', date: 'March 2026' },
    { id: '2', title: 'Samsung Split AC Warranty', type: 'document', category: 'Warranty', date: 'Dec 2025' },
    { id: '3', title: 'Anjuna Beach Sunset Photos', type: 'photo', category: 'Travel', date: 'March 2026' },
    { id: '4', title: 'Goa Roadtrip 2026', type: 'event', category: 'Memory', date: 'March 2026' },
  ];

  const handleSearchSubmit = (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    addRecentSearch(searchTerm);
    closeSearch();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText size={14} className="text-amber-400/80" />;
      case 'photo': return <ImageIcon size={14} className="text-sky-400/80" />;
      default: return <Compass size={14} className="text-indigo-400/80" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSearch}
            className="absolute inset-0 bg-[#06070A]/80 backdrop-blur-xl pointer-events-auto"
          />

          {/* Search Box Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="relative w-full max-w-2xl bg-bg-surface/95 border border-white/[0.08] rounded-2xl shadow-2xl p-6 sm:p-8 pointer-events-auto z-10 font-sans"
          >
            {/* Input Header */}
            <div className="flex items-center space-x-3 border-b border-white/[0.08] pb-4">
              <Search className="text-text-secondary" size={18} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(query)}
                placeholder="Search memories, documents, photos, trips…"
                className="w-full bg-transparent border-none text-sm text-text-primary placeholder-text-tertiary focus:outline-none"
              />
              <kbd className="font-mono-meta text-[10px] text-text-secondary border border-white/10 rounded px-2 py-0.5">ESC</kbd>
            </div>

            {/* Content Segment */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left Column: Recent Queries */}
              <div className="md:col-span-4 space-y-3">
                <div className="flex items-center justify-between text-xs font-medium text-white/50">
                  <span>Recent</span>
                  {recentSearches.length > 0 && (
                    <button onClick={clearRecentSearches} className="text-[10px] text-white/30 hover:text-white/60 transition-colors">
                      Clear
                    </button>
                  )}
                </div>
                
                {recentSearches.length === 0 ? (
                  <div className="text-xs text-white/30">No history</div>
                ) : (
                  <div className="space-y-1.5">
                    {recentSearches.map((s) => (
                      <button
                        key={s}
                        onClick={() => setQuery(s)}
                        className="w-full flex items-center space-x-2 text-left text-xs text-white/60 hover:text-white transition-colors"
                      >
                        <History size={12} className="text-white/30" />
                        <span className="truncate">{s}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Search Matches */}
              <div className="md:col-span-8 space-y-3 border-t md:border-t-0 md:border-l border-white/[0.06] pt-4 md:pt-0 md:pl-6">
                <div className="text-xs font-medium text-white/50">Matches</div>
                
                <div className="space-y-2">
                  {sampleResults
                    .filter(item => item.title.toLowerCase().includes(query.toLowerCase()))
                    .map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          onNavigate(item.type === 'document' ? 'documents' : item.type === 'photo' ? 'photos' : 'graph');
                          closeSearch();
                        }}
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/15 hover:bg-white/[0.04] transition-all text-left group"
                      >
                        <div className="flex items-center space-x-3">
                          {getIcon(item.type)}
                          <div>
                            <div className="text-xs font-medium text-white/90 group-hover:text-white transition-colors">{item.title}</div>
                            <div className="text-[10px] text-white/40 mt-0.5">{`${item.category} · ${item.date}`}</div>
                          </div>
                        </div>
                        <ArrowRight size={14} className="text-white/20 group-hover:text-white/70 group-hover:translate-x-0.5 transition-all" />
                      </button>
                    ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
