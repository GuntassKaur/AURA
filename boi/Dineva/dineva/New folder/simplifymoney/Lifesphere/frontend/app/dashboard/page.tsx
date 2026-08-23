'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MapPin, ArrowRight, Upload, Bell, Sparkles, Share2 } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { useNotificationStore } from '@/store/useNotificationStore';

export default function DashboardPage() {
  const { addNotification } = useNotificationStore();
  const router = useRouter();

  const handleAlertTrigger = () => {
    addNotification({
      type: 'warning',
      title: 'Passport Expiry Notice',
      message: 'Passport renewal window opens in 30 days. Priority application advised.',
      duration: 5000
    });
  };

  return (
    <AppShell activeTab="dashboard">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-5xl mx-auto space-y-16 pt-4 sm:pt-8 pb-24 font-sans text-left"
      >
        {/* BRIEFING HEADER */}
        <div className="space-y-2 text-left">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-text-primary leading-tight">
            Good evening, Guntass.
          </h1>
          <p className="text-sm sm:text-base text-text-secondary font-normal leading-relaxed max-w-xl">
            Here&apos;s what is worth knowing today.
          </p>
        </div>

        {/* DOMINANT FEATURE: GOA COASTAL JOURNEY */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-text-secondary tracking-wide uppercase">
            Featured Memory
          </div>

          <motion.div 
            whileHover={{ y: -3 }}
            transition={{ type: 'spring', stiffness: 200, damping: 26 }}
            onClick={() => router.push('/timeline')}
            className="w-full h-80 sm:h-[440px] rounded-3xl bg-bg-surface border border-white/[0.08] p-8 sm:p-10 flex flex-col justify-end relative overflow-hidden group cursor-pointer shadow-2xl"
          >
            {/* High-Res Photographic Background */}
            <img 
              src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80" 
              alt="Goa Coastal Journey" 
              className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-85 group-hover:scale-[1.015] transition-all duration-700 ease-out" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-bg-base/30 to-transparent" />

            <div className="relative z-10 space-y-3 max-w-xl">
              <div className="flex items-center space-x-2 text-xs font-mono-meta text-text-primary/90">
                <MapPin size={13} className="text-accent-primary" />
                <span>GOA · APRIL 2026</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold text-text-primary tracking-tight">
                Goa Coastal Journey
              </h2>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                31 connected moments · 24 photographs · 2 documents
              </p>
              <div className="pt-2 flex items-center space-x-2 text-xs font-medium text-text-primary group-hover:text-accent-primary transition-colors">
                <span>View story timeline</span>
                <ArrowRight size={13} />
              </div>
            </div>
          </motion.div>
        </div>

        {/* TODAY EDITORIAL NARRATIVE */}
        <div className="p-8 rounded-3xl bg-bg-surface border border-white/[0.08] space-y-3 relative overflow-hidden shadow-xl">
          <div className="flex items-center space-x-2 text-xs font-semibold text-accent-primary">
            <Sparkles size={14} />
            <span>Today&apos;s Story</span>
          </div>
          <p className="text-base sm:text-xl text-text-primary leading-relaxed font-normal max-w-3xl">
            &ldquo;Your electricity spending increased this month while your Goa trip is approaching in 24 days.&rdquo;
          </p>
        </div>

        {/* RECENT MEMORIES */}
        <div className="space-y-4">
          <div className="text-xs font-semibold text-text-secondary tracking-wide uppercase">
            Recent Memories
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-stretch">
            {/* Thumbnail 1 */}
            <motion.div 
              whileHover={{ y: -3 }}
              transition={{ type: 'spring', stiffness: 200, damping: 26 }}
              onClick={() => router.push('/documents')}
              className="sm:col-span-5 h-56 rounded-3xl bg-bg-surface border border-white/[0.08] p-6 flex flex-col justify-end relative overflow-hidden group cursor-pointer shadow-lg"
            >
              <img src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80" alt="Samsung Split AC Receipt" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-all duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-bg-base/30 to-transparent" />
              <div className="relative z-10 space-y-1">
                <span className="text-[10px] font-mono-meta text-text-secondary">DEC 15, 2025 · WARRANTY</span>
                <h3 className="text-sm font-semibold text-text-primary group-hover:text-accent-primary transition-colors">Samsung Split AC Receipt</h3>
              </div>
            </motion.div>

            {/* Thumbnail 2 */}
            <motion.div 
              whileHover={{ y: -3 }}
              transition={{ type: 'spring', stiffness: 200, damping: 26 }}
              onClick={() => router.push('/photos')}
              className="sm:col-span-4 h-56 rounded-3xl bg-bg-surface border border-white/[0.08] p-6 flex flex-col justify-end relative overflow-hidden group cursor-pointer shadow-lg"
            >
              <img src="https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80" alt="Anjuna Sunset Photoshoot" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-all duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-bg-base/30 to-transparent" />
              <div className="relative z-10 space-y-1">
                <span className="text-[10px] font-mono-meta text-text-secondary">APR 11, 2026 · PHOTOS</span>
                <h3 className="text-sm font-semibold text-text-primary group-hover:text-accent-primary transition-colors">Anjuna Sunset Photoshoot</h3>
              </div>
            </motion.div>

            {/* Thumbnail 3 */}
            <motion.div 
              whileHover={{ y: -3 }}
              transition={{ type: 'spring', stiffness: 200, damping: 26 }}
              onClick={() => router.push('/photos')}
              className="sm:col-span-3 h-56 rounded-3xl bg-bg-surface border border-white/[0.08] p-6 flex flex-col justify-end relative overflow-hidden group cursor-pointer shadow-lg"
            >
              <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80" alt="Delhi Cafe Evening" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-all duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-bg-base/30 to-transparent" />
              <div className="relative z-10 space-y-1">
                <span className="text-[10px] font-mono-meta text-text-secondary">MAY 18, 2026 · PEOPLE</span>
                <h3 className="text-sm font-semibold text-text-primary group-hover:text-accent-primary transition-colors">Delhi Cafe Evening</h3>
              </div>
            </motion.div>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="space-y-4 pt-6 border-t border-white/[0.06]">
          <div className="text-xs font-semibold text-text-secondary tracking-wide uppercase">
            Quick Actions
          </div>

          <div className="flex flex-wrap gap-4">
            <button 
              onClick={handleAlertTrigger}
              className="flex items-center space-x-2.5 px-5 py-3 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-medium text-text-primary transition-all cursor-pointer"
            >
              <Bell size={14} className="text-accent-warm" />
              <span>Renew Passport</span>
              <ArrowRight size={12} className="text-text-secondary ml-1" />
            </button>

            <button 
              onClick={() => router.push('/documents')}
              className="flex items-center space-x-2.5 px-5 py-3 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-medium text-text-primary transition-all cursor-pointer"
            >
              <Upload size={14} className="text-text-secondary" />
              <span>Upload Memory</span>
            </button>

            <button 
              onClick={() => router.push('/analytics')}
              className="flex items-center space-x-2.5 px-5 py-3 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-medium text-text-primary transition-all cursor-pointer"
            >
              <Share2 size={14} className="text-accent-primary" />
              <span>Review Spending</span>
            </button>
          </div>
        </div>

      </motion.div>
    </AppShell>
  );
}
