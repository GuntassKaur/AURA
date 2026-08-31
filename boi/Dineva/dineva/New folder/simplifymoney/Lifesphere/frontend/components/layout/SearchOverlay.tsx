'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, History, ArrowRight, FileText, Image as ImageIcon, Compass, CreditCard, Sparkles, User, MapPin } from 'lucide-react';
import { useSearchStore } from '@/store/useSearchStore';
import { useLifeDataStore } from '@/store/useLifeDataStore';
import { useDocumentStore } from '@/store/useDocumentStore';
import { usePhotoStore } from '@/store/usePhotoStore';
import { useTimelineStore } from '@/store/useTimelineStore';
import { useRouter } from 'next/navigation';

interface SearchOverlayProps {
  onNavigate?: (tab: string) => void;
}

export default function SearchOverlay({ onNavigate }: SearchOverlayProps) {
  const router = useRouter();
  const { isOpen, query, recentSearches, closeSearch, setQuery, addRecentSearch, clearRecentSearches } = useSearchStore();
  const { memories, documents, photos, expenses } = useLifeDataStore();
  const { setOpenedDoc } = useDocumentStore();
  const { setOpenedPhoto } = usePhotoStore();
  const { setSelectedCapsule } = useTimelineStore();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSearchSubmit = (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    addRecentSearch(searchTerm);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText size={14} className="text-[#E9A23B]" />;
      case 'photo': return <ImageIcon size={14} className="text-[#5B5CE2]" />;
      case 'expense': return <CreditCard size={14} className="text-[#3A9D78]" />;
      case 'memory': return <Sparkles size={14} className="text-[#5B5CE2]" />;
      case 'person': return <User size={14} className="text-[#E98291]" />;
      case 'place': return <MapPin size={14} className="text-[#3A9D78]" />;
      default: return <Compass size={14} className="text-[#3A9D78]" />;
    }
  };

  // Dynamic cross-entity search
  const q = query.trim().toLowerCase();

  const results: Array<{
    category: string;
    title: string;
    type: 'memory' | 'document' | 'photo' | 'expense' | 'person' | 'place';
    detail: string;
    action: () => void;
  }> = [];

  if (q.length > 0) {
    // 1. Search Memories
    memories.forEach((m) => {
      if (
        m.title.toLowerCase().includes(q) ||
        m.location.toLowerCase().includes(q) ||
        m.summary.toLowerCase().includes(q) ||
        m.places.some(p => p.toLowerCase().includes(q))
      ) {
        results.push({
          category: 'Memories',
          title: m.title,
          type: 'memory',
          detail: `${m.date} · ${m.totalExpense || ''}`,
          action: () => {
            setSelectedCapsule(m as any);
            router.push('/timeline');
          }
        });
      }
    });

    // 2. Search Documents
    documents.forEach((d) => {
      if (
        d.title.toLowerCase().includes(q) ||
        d.ocrText.toLowerCase().includes(q) ||
        d.summary.toLowerCase().includes(q) ||
        d.tags.some(t => t.toLowerCase().includes(q))
      ) {
        results.push({
          category: 'Documents',
          title: d.title,
          type: 'document',
          detail: `${d.category.toUpperCase()} · ${d.amount || d.expiryDate || d.date}`,
          action: () => {
            setOpenedDoc(d as any);
            router.push('/documents');
          }
        });
      }
    });

    // 3. Search Photos
    photos.forEach((p) => {
      if (
        p.title.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.detectedObjects.some(o => o.toLowerCase().includes(q)) ||
        p.people?.some(person => person.toLowerCase().includes(q))
      ) {
        results.push({
          category: 'Photos',
          title: p.title,
          type: 'photo',
          detail: `${p.location} · ${p.date}`,
          action: () => {
            setOpenedPhoto(p as any);
            router.push('/photos');
          }
        });
      }
    });

    // 4. Search Expenses
    expenses.forEach((e) => {
      if (e.title.toLowerCase().includes(q) || e.category.toLowerCase().includes(q)) {
        results.push({
          category: 'Expenses',
          title: e.title,
          type: 'expense',
          detail: `${e.formattedAmount} · ${e.category} · ${e.date}`,
          action: () => {
            router.push('/timeline');
          }
        });
      }
    });
  } else {
    // Default recommended shortcuts
    results.push(
      {
        category: 'Memories',
        title: 'Goa Coastal Journey',
        type: 'memory',
        detail: 'March 2026 · 128 photos · ₹18,400 spent',
        action: () => {
          setSelectedCapsule(memories[0] as any);
          router.push('/timeline');
        }
      },
      {
        category: 'Documents',
        title: 'BSES Yamuna Electricity Bill',
        type: 'document',
        detail: 'Due tomorrow · ₹4,230',
        action: () => {
          const doc = documents.find(d => d.id === 'doc-electricity');
          if (doc) setOpenedDoc(doc as any);
          router.push('/documents');
        }
      },
      {
        category: 'Documents',
        title: 'Indian Passport Renewal',
        type: 'document',
        detail: 'Expires 18 Sep 2026 · 18 days left',
        action: () => {
          const doc = documents.find(d => d.id === 'doc-passport');
          if (doc) setOpenedDoc(doc as any);
          router.push('/documents');
        }
      }
    );
  }

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
            className="absolute inset-0 bg-[#17181C]/40 backdrop-blur-md pointer-events-auto"
          />

          {/* Search Box Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="relative w-full max-w-2xl bg-[#FFFFFF] border border-[#E5E3DC] rounded-3xl shadow-2xl p-6 sm:p-8 pointer-events-auto z-10 font-sans text-left max-h-[85vh] flex flex-col"
          >
            {/* Input Header */}
            <div className="flex items-center space-x-3 border-b border-[#E5E3DC] pb-4 shrink-0">
              <Search className="text-[#6B6D73]" size={18} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(query)}
                placeholder="Search memories, documents, photos, expenses, places…"
                className="w-full bg-transparent border-none text-sm text-[#17181C] placeholder-[#9A9C9F] focus:outline-none"
              />
              <kbd className="font-mono text-[10px] text-[#6B6D73] border border-[#E5E3DC] bg-[#F7F6F2] rounded px-2 py-0.5">ESC</kbd>
            </div>

            {/* Content Segment */}
            <div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-6 flex-1 overflow-y-auto min-h-0">
              {/* Left Column: Recent Queries */}
              <div className="md:col-span-4 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-[#6B6D73] uppercase tracking-wider">
                  <span>Recent searches</span>
                  {recentSearches.length > 0 && (
                    <button onClick={clearRecentSearches} className="text-[10px] text-[#6B6D73] hover:text-[#17181C] transition-colors cursor-pointer">
                      Clear
                    </button>
                  )}
                </div>
                
                {recentSearches.length === 0 ? (
                  <div className="space-y-1 text-xs text-[#9A9C9F]">
                    <p>Try searching for:</p>
                    <p className="text-[#5B5CE2] cursor-pointer" onClick={() => setQuery('Goa')}>• Goa</p>
                    <p className="text-[#5B5CE2] cursor-pointer" onClick={() => setQuery('Passport')}>• Passport</p>
                    <p className="text-[#5B5CE2] cursor-pointer" onClick={() => setQuery('Electricity')}>• Electricity</p>
                    <p className="text-[#5B5CE2] cursor-pointer" onClick={() => setQuery('Warranty')}>• Warranty</p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {recentSearches.map((s) => (
                      <button
                        key={s}
                        onClick={() => setQuery(s)}
                        className="w-full flex items-center space-x-2 text-left text-xs text-[#6B6D73] hover:text-[#5B5CE2] transition-colors cursor-pointer"
                      >
                        <History size={12} className="text-[#9A9C9F]" />
                        <span className="truncate">{s}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Search Matches */}
              <div className="md:col-span-8 space-y-3 border-t md:border-t-0 md:border-l border-[#E5E3DC] pt-4 md:pt-0 md:pl-6 overflow-y-auto">
                <div className="text-xs font-bold text-[#6B6D73] uppercase tracking-wider flex items-center justify-between">
                  <span>{query ? `Matches (${results.length})` : 'Recommended'}</span>
                  {query && <span className="text-[10px] font-normal text-[#9A9C9F]">Instant network search</span>}
                </div>
                
                <div className="space-y-2">
                  {results.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        handleSearchSubmit(query || item.title);
                        item.action();
                        closeSearch();
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#F7F6F2] border border-[#E5E3DC] hover:border-[#5B5CE2]/40 transition-all text-left group cursor-pointer"
                    >
                      <div className="flex items-center space-x-3 min-w-0 pr-2">
                        <div className="shrink-0">{getIcon(item.type)}</div>
                        <div className="min-w-0">
                          <span className="text-[9px] font-bold text-[#5B5CE2] uppercase tracking-wider block">{item.category}</span>
                          <div className="text-xs font-bold text-[#17181C] group-hover:text-[#5B5CE2] transition-colors truncate">{item.title}</div>
                          <div className="text-[10px] text-[#6B6D73] mt-0.5 truncate">{item.detail}</div>
                        </div>
                      </div>
                      <ArrowRight size={14} className="text-[#6B6D73] group-hover:text-[#5B5CE2] group-hover:translate-x-0.5 transition-all shrink-0" />
                    </button>
                  ))}

                  {results.length === 0 && (
                    <div className="text-xs text-[#9A9C9F] py-8 text-center bg-[#F7F6F2] rounded-2xl">
                      No matching memories, documents, photos or expenses found.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
