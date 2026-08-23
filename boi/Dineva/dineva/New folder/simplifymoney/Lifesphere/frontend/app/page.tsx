'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Shield, Compass, FileText, Image as ImageIcon } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import { useSearchStore } from '@/store/useSearchStore';

export default function LandingPage() {
  const { openSearch } = useSearchStore();

  return (
    <div className="min-h-screen bg-bg-base text-text-primary font-sans selection:bg-accent-primary/20 overflow-x-hidden relative">
      
      {/* TOP NAVIGATION */}
      <TopBar onSearchClick={openSearch} />

      {/* MAIN CONTENT CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 md:px-12 pt-24 pb-32 space-y-28 sm:space-y-36">
        
        {/* ========================================================================= */}
        {/* HERO SECTION */}
        {/* ========================================================================= */}
        <section className="min-h-[82vh] flex flex-col justify-center">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* LEFT COLUMN: EDITORIAL TYPOGRAPHY */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6 space-y-8 text-left"
            >
              <div className="inline-flex items-center space-x-2.5 px-3 py-1 rounded-full bg-accent-primary/10 border border-accent-primary/20 text-xs font-medium text-accent-primary">
                <Sparkles size={13} />
                <span>LifeSphere OS</span>
              </div>
              
              <h1 className="text-[clamp(42px,6.2vw,92px)] font-extrabold tracking-tighter text-text-primary leading-[0.98]">
                Your life,<br />
                <span className="text-text-secondary font-light tracking-tight">finally connected.</span>
              </h1>
              
              <p className="text-base sm:text-lg text-text-secondary font-normal leading-relaxed max-w-xl">
                One place for the moments, documents, places, and details that make up your life experience.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Link href="/dashboard">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 26 }}
                    className="px-7 py-3.5 bg-text-primary text-bg-base text-sm font-semibold rounded-full shadow-2xl hover:bg-white/95 flex items-center space-x-2.5 transition-all cursor-pointer"
                  >
                    <span>Enter LifeSphere</span>
                    <ArrowRight size={15} />
                  </motion.button>
                </Link>

                <a href="#featured">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 26 }}
                    className="px-6 py-3.5 bg-white/[0.04] hover:bg-white/[0.08] text-text-primary text-sm font-medium rounded-full border border-white/[0.08] transition-all cursor-pointer"
                  >
                    Explore memories
                  </motion.button>
                </a>
              </div>
            </motion.div>

            {/* RIGHT COLUMN: CINEMATIC GOA PHOTOGRAPH */}
            <motion.div 
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6 w-full"
            >
              <motion.div 
                whileHover={{ y: -3 }}
                transition={{ type: 'spring', stiffness: 200, damping: 26 }}
                className="group relative w-full h-[480px] sm:h-[560px] rounded-3xl overflow-hidden cursor-pointer shadow-[0_30px_70px_rgba(0,0,0,0.8)] border border-white/[0.08]"
              >
                <Link href="/timeline" className="block w-full h-full">
                  <img 
                    src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80" 
                    alt="Goa Coastal Journey" 
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-95 group-hover:scale-[1.015] transition-all duration-700 ease-out" 
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-bg-base/20 to-transparent" />

                  <div className="absolute inset-x-0 bottom-0 p-8 sm:p-10 space-y-3 z-10 text-left">
                    <div className="flex items-center space-x-3 text-xs font-mono-meta text-text-secondary">
                      <span className="text-accent-primary font-semibold">GOA · APRIL 2026</span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
                      Goa Coastal Journey
                    </h2>

                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-md">
                      31 connected moments · Flights, Taj resort, receipts & sunset photographs
                    </p>

                    <div className="pt-2 flex items-center space-x-2 text-xs font-medium text-text-primary group-hover:text-accent-primary transition-colors">
                      <span>Open memory</span>
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            </motion.div>

          </div>
        </section>


        {/* ========================================================================= */}
        {/* FEATURED MEMORY SPOTLIGHT */}
        {/* ========================================================================= */}
        <section id="featured" className="space-y-10 text-left pt-6">
          <div className="space-y-2">
            <span className="text-xs font-medium text-text-secondary tracking-wide uppercase">Featured Memory</span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary">
              Recent moments
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Large Hero Card */}
            <motion.div 
              whileHover={{ y: -3 }}
              transition={{ type: 'spring', stiffness: 200, damping: 26 }}
              className="lg:col-span-7 h-96 sm:h-[440px] rounded-3xl overflow-hidden relative group cursor-pointer border border-white/[0.08] shadow-2xl"
            >
              <Link href="/photos">
                <img 
                  src="https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80" 
                  alt="Vagator Coastal Cliffs" 
                  className="w-full h-full object-cover opacity-70 group-hover:opacity-85 group-hover:scale-[1.015] transition-all duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-bg-base/30 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 space-y-1.5 z-10">
                  <div className="text-xs font-mono-meta text-text-secondary">APRIL 11, 2026 · VAGATOR, GOA</div>
                  <h3 className="text-xl sm:text-2xl font-bold text-text-primary">Vagator Coastal Cliffs</h3>
                  <div className="text-xs text-text-secondary">
                    24 connected photographs & EXIF camera metadata
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Supporting Cards */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
              
              <div className="grid grid-cols-2 gap-4">
                <motion.div 
                  whileHover={{ y: -2 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 26 }}
                  className="h-44 sm:h-48 rounded-2xl overflow-hidden relative group cursor-pointer border border-white/[0.08]"
                >
                  <Link href="/documents">
                    <img 
                      src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80" 
                      alt="Flight 6E-2018" 
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-all duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-base to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 z-10 space-y-0.5">
                      <span className="text-[10px] font-mono-meta text-text-secondary">APR 10</span>
                      <h4 className="text-xs font-semibold text-text-primary group-hover:text-accent-primary transition-colors">IndiGo Flight 6E-2018</h4>
                    </div>
                  </Link>
                </motion.div>

                <motion.div 
                  whileHover={{ y: -2 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 26 }}
                  className="h-44 sm:h-48 rounded-2xl overflow-hidden relative group cursor-pointer border border-white/[0.08]"
                >
                  <Link href="/documents">
                    <img 
                      src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80" 
                      alt="Taj Resort Stay" 
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-all duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-base to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 z-10 space-y-0.5">
                      <span className="text-[10px] font-mono-meta text-text-secondary">APR 12</span>
                      <h4 className="text-xs font-semibold text-text-primary group-hover:text-accent-primary transition-colors">Taj Resort Reservation</h4>
                    </div>
                  </Link>
                </motion.div>
              </div>

              {/* Narrative Summary Card */}
              <div className="p-6 rounded-2xl bg-bg-surface border border-white/[0.08] space-y-3">
                <span className="text-xs font-medium text-accent-primary">Narrative Insight</span>
                <p className="text-base text-text-primary leading-relaxed font-normal">
                  &ldquo;A week that became 31 connected memories.&rdquo;
                </p>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Orbit automatically connected flights, hotel reservations, receipts, and photography into one cohesive narrative.
                </p>
              </div>

            </div>

          </div>
        </section>


        {/* ========================================================================= */}
        {/* HOW LIFESPHERE WORKS */}
        {/* ========================================================================= */}
        <section className="space-y-12 text-left pt-6">
          <div className="space-y-2">
            <span className="text-xs font-medium text-text-secondary tracking-wide uppercase">Intelligent Core</span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary">
              How LifeSphere works
            </h2>
            <p className="text-sm text-text-secondary max-w-xl">
              Automatic indexing, instant semantic search, and spatial constellation mapping for your personal archive.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 rounded-3xl bg-bg-surface border border-white/[0.08] space-y-4 hover:border-white/20 transition-all">
              <div className="w-10 h-10 rounded-2xl bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary">
                <FileText size={20} />
              </div>
              <h3 className="text-lg font-semibold text-text-primary">1. Document Intelligence</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Import tickets, medical records, invoices, and warranties. Key dates and expenses are automatically extracted into clear cards.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-bg-surface border border-white/[0.08] space-y-4 hover:border-white/20 transition-all">
              <div className="w-10 h-10 rounded-2xl bg-accent-warm/10 border border-accent-warm/20 flex items-center justify-center text-accent-warm">
                <ImageIcon size={20} />
              </div>
              <h3 className="text-lg font-semibold text-text-primary">2. Photo Vault</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                High-resolution photography structured in an editorial masonry layout with EXIF location, aperture, and camera details preserved.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-bg-surface border border-white/[0.08] space-y-4 hover:border-white/20 transition-all">
              <div className="w-10 h-10 rounded-2xl bg-accent-success/10 border border-accent-success/20 flex items-center justify-center text-accent-success">
                <Compass size={20} />
              </div>
              <h3 className="text-lg font-semibold text-text-primary">3. Constellation Graph</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Explore how events, places, documents, and memories connect to each other in an interactive spatial constellation.
              </p>
            </div>
          </div>
        </section>


        {/* ========================================================================= */}
        {/* SIMPLE CTA */}
        {/* ========================================================================= */}
        <section className="py-16 text-center space-y-6 bg-bg-surface/50 border border-white/[0.08] rounded-3xl p-10 sm:p-16">
          <div className="w-12 h-12 rounded-2xl bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary mx-auto">
            <Shield size={24} />
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-text-primary max-w-xl mx-auto">
            Step into your personal memory OS.
          </h2>
          <p className="text-sm text-text-secondary max-w-md mx-auto leading-relaxed">
            LifeSphere is ready for your documents, photographs, and everyday milestones.
          </p>
          <div className="pt-2">
            <Link href="/dashboard">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 200, damping: 26 }}
                className="px-8 py-3.5 bg-text-primary text-bg-base font-semibold text-sm rounded-full shadow-2xl hover:bg-white/95 transition-all cursor-pointer inline-flex items-center space-x-2"
              >
                <span>Open LifeSphere</span>
                <ArrowRight size={16} />
              </motion.button>
            </Link>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="w-full border-t border-white/[0.06] py-10 bg-bg-base">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-text-secondary">
          <span>LifeSphere © 2026 — Personal Digital OS</span>
          <div className="flex space-x-6">
            <Link href="/dashboard" className="hover:text-text-primary transition-colors">Memories</Link>
            <Link href="/timeline" className="hover:text-text-primary transition-colors">Timeline</Link>
            <Link href="/documents" className="hover:text-text-primary transition-colors">Documents</Link>
            <Link href="/photos" className="hover:text-text-primary transition-colors">Photos</Link>
            <Link href="/graph" className="hover:text-text-primary transition-colors">Constellation</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
