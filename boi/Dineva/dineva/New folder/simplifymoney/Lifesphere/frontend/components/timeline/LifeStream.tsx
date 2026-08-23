'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Calendar, X, Sparkles, ArrowRight } from 'lucide-react';
import { useTimelineStore, MemoryCapsuleData, TimelineFilter, TimelineZoomLevel } from '@/store/useTimelineStore';

const mockMemoryCapsules: (MemoryCapsuleData & { image?: string })[] = [
  { 
    id: '1', 
    title: 'Goa Coastal Journey', 
    type: 'trip', 
    category: 'travel', 
    date: 'April 10, 2026', 
    location: 'Goa, India', 
    confidenceScore: 98, 
    summary: 'Auto-clustered flight IndiGo 6E-2018, Taj Resort stay, and 24 beach photographs into a cohesive travel dossier.', 
    relatedDocsCount: 4, 
    photoCount: 24, 
    totalExpense: '₹58,400',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80'
  },
  { 
    id: '2', 
    title: 'Samsung Split AC Purchase', 
    type: 'warranty', 
    category: 'documents', 
    date: 'December 15, 2025', 
    location: 'Home Residence', 
    confidenceScore: 94, 
    summary: '5-year compressor warranty registered with purchase invoice from Croma.', 
    relatedDocsCount: 2, 
    totalExpense: '₹54,000',
    image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80'
  },
  { 
    id: '3', 
    title: 'Annual Health Lab Panel', 
    type: 'medical', 
    category: 'medical', 
    date: 'January 20, 2026', 
    location: 'Max Labs Delhi', 
    confidenceScore: 96, 
    summary: 'Metabolic panel blood test report showing healthy cholesterol & glucose profiles.', 
    relatedDocsCount: 1, 
    totalExpense: '₹2,500'
  },
  { 
    id: '4', 
    title: 'Passport Renewal Submission', 
    type: 'passport', 
    category: 'personal', 
    date: 'February 05, 2026', 
    location: 'Passport Seva Kendra', 
    confidenceScore: 90, 
    summary: 'Official government passport submission logs and appointment schedule.', 
    relatedDocsCount: 1, 
    totalExpense: '₹1,500'
  },
  { 
    id: '5', 
    title: 'Birthday Evening at Cafe', 
    type: 'photos', 
    category: 'photos', 
    date: 'May 18, 2026', 
    location: 'Cafe Delhi Heights', 
    confidenceScore: 95, 
    summary: 'Gathering with friends. 42 photographs captured and tagged.', 
    relatedDocsCount: 0, 
    photoCount: 42,
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80'
  },
];

export default function LifeStream() {
  const { 
    zoomLevel, setZoomLevel,
    activeFilter, setActiveFilter, 
    selectedCapsule, setSelectedCapsule,
    searchQuery, setSearchQuery
  } = useTimelineStore();

  const featured = mockMemoryCapsules[0];

  const filteredCapsules = mockMemoryCapsules.slice(1).filter(c => {
    const matchesFilter = activeFilter === 'all' || c.category === activeFilter;
    const matchesSearch = searchQuery
      ? c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.summary.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesFilter && matchesSearch;
  });

  const getZoomSpacing = () => {
    switch (zoomLevel) {
      case 'year': return 'space-y-6';
      case 'week': return 'space-y-16';
      case 'day': return 'space-y-24';
      case 'month':
      default: return 'space-y-10';
    }
  };

  return (
    <div className="w-full space-y-12 pt-4 sm:pt-8 pb-24 font-sans text-left">
      
      {/* 1. Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/[0.06] pb-6">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Chronology</span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary">Timeline</h1>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {/* Zoom Control Buttons */}
          <div className="flex items-center bg-bg-surface border border-white/[0.08] rounded-full p-1 self-start">
            {(['year', 'month', 'week', 'day'] as TimelineZoomLevel[]).map((level) => {
              const active = zoomLevel === level;
              return (
                <button
                  key={level}
                  onClick={() => setZoomLevel(level)}
                  className={`px-3.5 py-1 text-xs font-medium rounded-full transition-all capitalize cursor-pointer ${
                    active
                      ? 'bg-text-primary text-bg-base font-semibold shadow'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {level}
                </button>
              );
            })}
          </div>

          {/* Search memories */}
          <div className="bg-bg-surface border border-white/[0.08] rounded-full px-4 py-2 flex items-center space-x-2.5 w-full sm:w-64 shadow-lg">
            <Search size={14} className="text-text-secondary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search memories…"
              className="w-full bg-transparent border-none text-xs text-text-primary placeholder-text-tertiary focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 text-xs">
        {[
          { id: 'all', label: 'All Memories' },
          { id: 'travel', label: 'Travel' },
          { id: 'medical', label: 'Health' },
          { id: 'documents', label: 'Documents' },
          { id: 'photos', label: 'Photos' },
          { id: 'personal', label: 'Personal' }
        ].map(f => {
          const active = activeFilter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id as TimelineFilter)}
              className={`px-4 py-1.5 rounded-full font-medium transition-all cursor-pointer ${
                active 
                  ? 'bg-accent-primary text-white font-semibold' 
                  : 'bg-white/[0.04] text-text-secondary hover:text-text-primary border border-white/[0.06]'
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* 2. ONE LARGE FEATURED MEMORY HERO */}
      <motion.div 
        whileHover={{ y: -3 }}
        transition={{ type: 'spring', stiffness: 200, damping: 26 }}
        onClick={() => setSelectedCapsule(featured)}
        className="w-full h-80 sm:h-[440px] rounded-3xl bg-bg-surface border border-white/[0.08] p-8 sm:p-10 flex flex-col justify-end relative overflow-hidden group cursor-pointer shadow-2xl"
      >
        <img 
          src={featured.image} 
          alt={featured.title} 
          className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-85 group-hover:scale-[1.015] transition-all duration-700 ease-out" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-bg-base/30 to-transparent" />

        <div className="relative z-10 space-y-3 max-w-xl text-left">
          <div className="flex items-center space-x-4 text-xs font-mono-meta text-text-primary/90">
            <span className="flex items-center space-x-1.5">
              <Calendar size={13} className="text-accent-primary" />
              <span>{featured.date}</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <MapPin size={13} className="text-accent-primary" />
              <span>{featured.location}</span>
            </span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-bold text-text-primary tracking-tight">{featured.title}</h2>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">{featured.summary}</p>
          
          <div className="pt-2 flex items-center space-x-2 text-xs font-medium text-text-primary group-hover:text-accent-primary transition-colors">
            <span>Inspect memory capsule</span>
            <ArrowRight size={13} />
          </div>
        </div>
      </motion.div>

      {/* 3. ORGANIC CONNECTING TIMELINE THREAD */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center space-x-2 text-xs font-semibold text-text-secondary uppercase tracking-wide">
          <Sparkles size={13} className="text-accent-primary" />
          <span>Timeline Stream</span>
        </div>

        <div className={`relative pl-6 border-l border-white/[0.08] ${getZoomSpacing()} transition-all duration-500`}>
          {filteredCapsules.map((c) => (
            <motion.div 
              key={c.id}
              whileHover={{ x: 4 }}
              transition={{ type: 'spring', stiffness: 200, damping: 26 }}
              onClick={() => setSelectedCapsule(c)}
              className="relative group cursor-pointer"
            >
              {/* Connecting node dot */}
              <div className="absolute -left-[31px] top-1.5 w-2.5 h-2.5 rounded-full bg-white/20 border-2 border-bg-base group-hover:bg-accent-primary group-hover:scale-125 transition-all" />

              <div className="p-6 rounded-2xl bg-bg-surface border border-white/[0.08] group-hover:border-white/20 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between shadow-xl transition-all">
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center space-x-3 text-xs font-mono-meta text-text-secondary">
                    <span>{c.date}</span>
                    <span>·</span>
                    <span className="capitalize text-accent-primary">{c.category}</span>
                  </div>

                  <h3 className="text-lg font-bold text-text-primary group-hover:text-accent-primary transition-colors">
                    {c.title}
                  </h3>

                  <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
                    {c.summary}
                  </p>

                  <div className="flex items-center space-x-2 text-[11px] text-text-secondary pt-1">
                    <MapPin size={11} />
                    <span>{c.location}</span>
                    {c.totalExpense && (
                      <>
                        <span>·</span>
                        <span className="text-text-primary font-medium">{c.totalExpense}</span>
                      </>
                    )}
                  </div>
                </div>

                {c.image && (
                  <img 
                    src={c.image} 
                    alt={c.title} 
                    className="w-full md:w-36 h-28 rounded-xl object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
                  />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 4. EXPANDED CAPSULE DETAIL MODAL */}
      <AnimatePresence>
        {selectedCapsule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCapsule(null)}
              className="absolute inset-0 bg-bg-base/85 backdrop-blur-xl"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 220, damping: 26 }}
              className="relative w-full max-w-xl bg-bg-surface border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-[0_30px_70px_rgba(0,0,0,0.9)] z-10 space-y-6 text-left"
            >
              <div className="flex justify-between items-start border-b border-white/[0.08] pb-4">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-accent-primary uppercase tracking-wide">{selectedCapsule.category}</span>
                  <h3 className="text-xl font-bold text-text-primary">{selectedCapsule.title}</h3>
                </div>
                <button onClick={() => setSelectedCapsule(null)} className="text-text-secondary hover:text-text-primary transition-colors cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4 text-xs text-text-secondary leading-relaxed">
                <p className="p-4 bg-white/[0.02] border border-white/[0.04] rounded-2xl text-text-primary">
                  {selectedCapsule.summary}
                </p>

                <div className="grid grid-cols-2 gap-4 text-xs pt-2">
                  <div>Date: <span className="text-text-primary font-medium font-mono-meta">{selectedCapsule.date}</span></div>
                  <div>Location: <span className="text-text-primary font-medium">{selectedCapsule.location}</span></div>
                  {selectedCapsule.totalExpense && <div>Expense: <span className="text-text-primary font-medium">{selectedCapsule.totalExpense}</span></div>}
                  {selectedCapsule.photoCount && <div>Photos: <span className="text-text-primary font-medium">{selectedCapsule.photoCount} files</span></div>}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
