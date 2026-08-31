"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChefHat, ArrowRight, ShieldCheck, Flame, Cpu, BarChart3, Star, X, CheckCircle2 } from "lucide-react";
import confetti from "canvas-confetti";
import GlowBackground from "@/components/ui/GlowBackground";
import DesktopSimulator from "@/components/desktop/DesktopSimulator";

export default function Home() {
  const [showTrialDialog, setShowTrialDialog] = useState(false);
  const [isTrialActive, setIsTrialActive] = useState(false);
  const [trialDetails, setTrialDetails] = useState({ restaurantName: "", email: "", kitchenType: "Fine Dining" });

  const handleStartTrial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trialDetails.restaurantName || !trialDetails.email) return;

    // Fire canvas-confetti celebration
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#e2b13c", "#f97316", "#ffffff", "#4c111a"],
    });

    setIsTrialActive(true);
    setShowTrialDialog(false);
  };

  const handleTriggerTrialModal = () => {
    if (isTrialActive) return;
    setShowTrialDialog(true);
  };

  return (
    <div className="relative min-h-screen text-stone-100 flex flex-col font-sans select-none selection:bg-amber-500/30 selection:text-white">
      {/* Dynamic Ambient Lights */}
      <GlowBackground />

      {/* Navigation Header */}
      <header className="sticky top-0 z-[1000] w-full border-b border-white/5 bg-[#0d0c0a]/65 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-950/20">
            <ChefHat className="text-black stroke-[2.5]" size={20} />
          </div>
          <div>
            <span className="font-extrabold tracking-tight text-white text-base">DINEVA</span>
            <span className="text-[10px] font-bold text-amber-400 bg-amber-950/40 border border-amber-500/20 px-1.5 py-0.5 rounded ml-1.5">OS</span>
          </div>
        </div>

        <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold uppercase tracking-wider text-stone-400">
          <a href="#simulator" className="hover:text-white transition-colors">OS Simulator</a>
          <a href="#features" className="hover:text-white transition-colors">Core Architecture</a>
          <a href="#pricing" className="hover:text-white transition-colors">Trial Package</a>
        </nav>

        <div className="flex items-center gap-3">
          <Link 
            href="/login" 
            className="text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all"
          >
            Developer Login
          </Link>
          
          <button
            onClick={handleTriggerTrialModal}
            className={`text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              isTrialActive 
                ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 cursor-default" 
                : "bg-amber-400 hover:bg-amber-500 text-black shadow-lg shadow-amber-950/20 hover:scale-[1.02]"
            }`}
          >
            {isTrialActive ? (
              <>
                <CheckCircle2 size={13} className="stroke-[2.5]" /> Trial Active
              </>
            ) : (
              <>
                Start Free Trial <ArrowRight size={13} />
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Landing Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-12 md:py-20 flex flex-col items-center">
        
        {/* HERO SECTION */}
        <section className="text-center max-w-3xl flex flex-col items-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6 text-xs text-stone-300"
          >
            <Star size={12} className="text-amber-400 fill-amber-400" />
            <span>Next-Generation Restaurant Technology</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.1] mb-6"
          >
            Ready to <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">evolve.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-stone-400 leading-relaxed max-w-2xl mb-8"
          >
            Dineva OS is an ultra-premium operating system engineered to power modern fine dining. Sync your POS, Kitchen displays, and tables in one beautifully fluent interface.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4"
          >
            <button
              onClick={handleTriggerTrialModal}
              className={`w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-all ${
                isTrialActive
                  ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 cursor-default"
                  : "bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-black shadow-xl shadow-amber-950/30 hover:scale-[1.02] active:scale-[0.99]"
              }`}
            >
              {isTrialActive ? "14-Day Trial Running" : "Get 14 Days Free Trial"}
            </button>
            <a
              href="#simulator"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl border border-white/10 hover:border-white/20 bg-stone-900/40 hover:bg-stone-900/80 font-bold uppercase tracking-wider text-xs transition-all text-center"
            >
              Launch Live Simulator
            </a>
          </motion.div>
        </section>

        {/* INTERACTIVE SIMULATOR WRAPPER */}
        <section id="simulator" className="w-full max-w-5xl mb-24 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-rose-500/10 rounded-3xl blur-2xl -z-10" />
          
          <div className="flex items-center justify-between px-6 py-3 bg-stone-900/60 border-t border-x border-white/10 rounded-t-2xl">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
              <span className="text-[10px] uppercase font-bold text-stone-400 ml-2 tracking-wider">Dineva OS Interactive Demo</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-amber-400 font-semibold bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/20">
              <span>Dynamic Window Dragging</span>
            </div>
          </div>
          
          <DesktopSimulator />
          
          <p className="text-center text-xs text-stone-500 mt-3.5 italic">
            *Tip: Click the Taskbar icons at the bottom or the Start Menu (chef hat) to toggle apps. Drag window headers to float them.
          </p>
        </section>

        {/* FEATURE GRID SECTION */}
        <section id="features" className="w-full border-t border-white/5 pt-20 mb-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Why restaurants are evolving to Dineva OS
            </h2>
            <p className="text-stone-400 text-sm mt-2 max-w-md mx-auto">
              Built on highly optimized core systems for mission-critical dining operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-stone-900/30 border border-white/5 p-6 rounded-2xl flex flex-col gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Cpu size={20} />
              </div>
              <h3 className="text-base font-bold text-white">Lag-Free Floor Coordination</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Frictionless drag-and-drop table layouts, real-time table occupancy status, and rapid customer course timing indicators.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-stone-900/30 border border-white/5 p-6 rounded-2xl flex flex-col gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                <Flame size={20} />
              </div>
              <h3 className="text-base font-bold text-white">Synchronized Kitchen Tickets</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                POS orders instantly trigger KDS cards. Color-coded delays guarantee your line chefs execute every course on schedule.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-stone-900/30 border border-white/5 p-6 rounded-2xl flex flex-col gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <BarChart3 size={20} />
              </div>
              <h3 className="text-base font-bold text-white">Live Menu Analytics</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Beautiful insights into gross margins, item popularity, hourly seating metrics, and offline-resilient local sync.
              </p>
            </div>
          </div>
        </section>

        {/* PRICING TRIAL PACK SECTION */}
        <section id="pricing" className="w-full border-t border-white/5 pt-20 mb-12 text-center max-w-xl">
          <div className="bg-gradient-to-b from-stone-900/60 to-stone-900/20 border border-white/10 rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-amber-400 text-black text-[9px] uppercase font-extrabold tracking-widest px-4 py-1.5 rounded-bl-xl shadow-md">
              Free Trial Pack
            </div>
            
            <h3 className="text-xl font-extrabold text-white mb-2">Dineva OS Evolution License</h3>
            <p className="text-xs text-stone-400 max-w-xs mx-auto mb-6">
              Empower your restaurant with the ultimate POS & KDS terminal software environment.
            </p>

            <div className="flex items-baseline justify-center gap-1.5 mb-6">
              <span className="text-4xl font-extrabold text-white font-mono">$0</span>
              <span className="text-stone-400 text-xs font-semibold uppercase tracking-wider">For 14 Days</span>
            </div>

            <ul className="text-left max-w-xs mx-auto space-y-3 mb-8 text-xs text-stone-300">
              <li className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-amber-400 shrink-0" /> Full POS, KDS & Insights Access
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-amber-400 shrink-0" /> Unlimited Terminals & Table Mockups
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-amber-400 shrink-0" /> Offline-First Database Mirroring
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-amber-400 shrink-0" /> Zero credit card required
              </li>
            </ul>

            <button
              onClick={handleTriggerTrialModal}
              className={`w-full py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-all ${
                isTrialActive
                  ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 cursor-default"
                  : "bg-amber-400 hover:bg-amber-500 text-black shadow-lg shadow-amber-950/20 active:scale-[0.99]"
              }`}
            >
              {isTrialActive ? "Your 14-Day Trial is Active!" : "Activate Your 14-Day Trial"}
            </button>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="w-full border-t border-white/5 bg-stone-950 py-8 px-6 text-center text-xs text-stone-500">
        <p>© 2026 Dineva Systems Inc. Dineva OS is a trademark of Dineva Inc. Microsoft Partner Program.</p>
        <p className="mt-1 text-[10px] text-stone-600">Simulating operating system shell inside next.js, Framer Motion, and Tailwind CSS.</p>
      </footer>

      {/* TRIAL SIGN-UP DIALOG (MODAL) */}
      <AnimatePresence>
        {showTrialDialog && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTrialDialog(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative w-full max-w-md rounded-2xl overflow-hidden glass-panel border border-white/10 p-6 z-10 shadow-2xl text-stone-200"
            >
              <button
                onClick={() => setShowTrialDialog(false)}
                className="absolute top-4 right-4 p-1 rounded-md text-stone-400 hover:text-white hover:bg-stone-800/60 transition-all"
              >
                <X size={16} />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <ChefHat className="text-amber-400" size={20} />
                <h4 className="font-extrabold text-white text-base">Evolve Your Restaurant</h4>
              </div>

              <p className="text-xs text-stone-400 mb-5 leading-relaxed">
                Initialize your 14-day trial package of Dineva OS. Explore the high-vibe terminal layout, seating charts, and direct KDS sync.
              </p>

              <form onSubmit={handleStartTrial} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5">
                    Restaurant Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. L'Ambroisie"
                    value={trialDetails.restaurantName}
                    onChange={(e) => setTrialDetails({ ...trialDetails, restaurantName: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg glass-input"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5">
                    Administrator Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="manager@restaurant.com"
                    value={trialDetails.email}
                    onChange={(e) => setTrialDetails({ ...trialDetails, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg glass-input"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5">
                    Kitchen Vibe
                  </label>
                  <select
                    value={trialDetails.kitchenType}
                    onChange={(e) => setTrialDetails({ ...trialDetails, kitchenType: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg glass-input bg-stone-950 text-stone-200"
                  >
                    <option value="Fine Dining">Fine Dining & Bistro</option>
                    <option value="Cocktail Lounge">High-End Cocktail Bar</option>
                    <option value="Pizzeria">Artisanal Pizzeria</option>
                    <option value="Steakhouse">Classic Steakhouse</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-black font-bold uppercase tracking-wider text-xs transition-all active:scale-[0.99]"
                  >
                    Activate 14-Day Free License
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
