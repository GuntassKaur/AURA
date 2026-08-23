'use client';

import React from 'react';
import { motion } from 'framer-motion';
import AppShell from '@/components/layout/AppShell';

export default function AnalyticsPage() {
  return (
    <AppShell activeTab="analytics">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-4xl mx-auto space-y-16 pt-4 sm:pt-8 pb-24 font-sans text-left"
      >
        {/* Header */}
        <div className="space-y-3 pt-4">
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Insights</span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-text-primary">
            Your life, in numbers.
          </h1>
          <p className="text-base text-text-secondary font-normal leading-relaxed max-w-2xl">
            Autonomous narrative summaries computed across your documents, travel invoices, subscriptions, and memories.
          </p>
        </div>

        {/* Large Key Numbers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 py-8 border-y border-white/[0.06]">
          <div className="space-y-2">
            <div className="text-4xl sm:text-5xl font-bold text-text-primary tracking-tight font-mono-meta">₹42,800</div>
            <div className="text-xs text-text-secondary font-medium">Spent this month</div>
          </div>

          <div className="space-y-2">
            <div className="text-4xl sm:text-5xl font-bold text-text-primary tracking-tight font-mono-meta">18</div>
            <div className="text-xs text-text-secondary font-medium">Memories added</div>
          </div>

          <div className="space-y-2">
            <div className="text-4xl sm:text-5xl font-bold text-accent-primary tracking-tight font-mono-meta">3</div>
            <div className="text-xs text-text-secondary font-medium">Active subscriptions</div>
          </div>
        </div>

        {/* Story Narratives */}
        <div className="space-y-12">
          
          <div className="space-y-2">
            <div className="text-xs font-semibold text-accent-primary uppercase tracking-wide">Travel Footprint</div>
            <h3 className="text-2xl font-bold text-text-primary">Goa Coastal Concentration</h3>
            <p className="text-sm text-text-secondary leading-relaxed max-w-2xl">
              Your travel profile indicates a high density of moments in Goa. Orbit matched IndiGo flight passes, Taj resort stays, and 24 coastal scene captures into a single, cohesive travel dossier.
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-accent-primary uppercase tracking-wide">Financial Debits</div>
            <h3 className="text-2xl font-bold text-text-primary">Subscription & Bill Optimizations</h3>
            <p className="text-sm text-text-secondary leading-relaxed max-w-2xl">
              Monthly bills are optimized. 3 active utility invoices (summing ₹4,230) have been mapped to auto-debit triggers, ensuring zero overdue penalties across your accounts.
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-accent-success uppercase tracking-wide">Protection & Warranties</div>
            <h3 className="text-2xl font-bold text-text-primary">Hardware Protection Lifespans</h3>
            <p className="text-sm text-text-secondary leading-relaxed max-w-2xl">
              Warranty lifespans are healthy. Active 5-year coverage for your Samsung Split AC has been cataloged, protecting hardware replacement costs through December 2030.
            </p>
          </div>

        </div>

      </motion.div>
    </AppShell>
  );
}
