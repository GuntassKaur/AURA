'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, AlertCircle, Calendar, Image as ImageIcon, FileText } from 'lucide-react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import { useLifeDataStore } from '@/store/useLifeDataStore';

export default function AnalyticsPage() {
  const { memories, photos, documents, subscriptions, upcoming } = useLifeDataStore();

  const totalSpent = memories.reduce((acc, m) => {
    const sum = m.expenses?.reduce((s, e) => s + e.amount, 0) || 0;
    return acc + sum;
  }, 0);

  const stats = [
    { label: 'Memories', value: memories.length.toString(), sub: 'chapters archived', serif: true },
    { label: 'Total Tracked', value: `₹${totalSpent.toLocaleString()}`, sub: 'across trips & life', serif: true, highlight: true },
    { label: 'Photos', value: photos.length.toString(), sub: 'indexed moments', serif: true },
    { label: 'Documents', value: documents.length.toString(), sub: 'verified records', serif: true },
    { label: 'Subscriptions', value: subscriptions.length.toString(), sub: 'active services', serif: true },
    { label: 'Upcoming', value: upcoming.length.toString(), sub: 'need attention', serif: true, accent: true },
  ];

  return (
    <AppShell activeTab="analytics">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full space-y-7 text-left pb-8 min-w-0"
      >
        {/* Header */}
        <div className="border-b border-[#E5E3DC] pb-5">
          <p className="text-[11px] font-semibold text-[#5B5CE2] uppercase tracking-widest mb-1">Personal intelligence</p>
          <h1 className="ls-inner-heading font-serif font-bold text-[#17181C]">Your life, in numbers</h1>
          <p className="text-xs text-[#6B6D73] mt-1">Cross-domain synthesis of your spending, timeline events, and archived records.</p>
        </div>

        {/* Stats grid — responsive 2→3→6 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {stats.map(stat => (
            <div
              key={stat.label}
              className={`p-4 rounded-xl border flex flex-col gap-1 shadow-xs ${
                stat.accent ? 'bg-[#E8E7FF] border-[#5B5CE2]/25' : 'bg-white border-[#E5E3DC]'
              }`}
            >
              <p className="text-[10px] font-semibold text-[#9A9C9F] uppercase tracking-wider">{stat.label}</p>
              <p className={`text-2xl font-serif font-bold leading-none ${stat.accent ? 'text-[#5B5CE2]' : 'text-[#17181C]'}`}>
                {stat.value}
              </p>
              <p className="text-[10px] text-[#9A9C9F]">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Narrative insights */}
        <div className="space-y-3">
          <h2 className="text-[11px] font-bold text-[#6B6D73] uppercase tracking-widest">What the numbers mean</h2>

          {/* Travel & Spending */}
          <div className="p-5 rounded-xl bg-white border border-[#E5E3DC] shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-[#E98291]" />
              <span className="text-[10px] font-bold text-[#E98291] uppercase tracking-widest">Spending Analysis</span>
            </div>
            <p className="text-sm text-[#17181C] leading-relaxed">
              Your <strong className="font-semibold">Goa Coastal Journey</strong> accounts for ₹18,400 of your logged travel total.
              All hotel invoices, flights, and restaurant receipts have been matched automatically.
            </p>
            <div className="flex gap-4 text-[11px] text-[#6B6D73] font-mono pt-1 flex-wrap">
              <span>₹8,200 Taj Hotel</span>
              <span>₹3,800 IndiGo Flight</span>
              <span>₹4,100 Dining</span>
              <span>₹2,300 Scooter &amp; Fuel</span>
            </div>
            <Link href="/timeline" className="inline-flex items-center gap-1 text-xs font-semibold text-[#5B5CE2] hover:underline">
              View trip story <ArrowRight size={11} />
            </Link>
          </div>

          {/* Subscriptions */}
          <div className="p-5 rounded-xl bg-white border border-[#E5E3DC] shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <AlertCircle size={14} className="text-[#E9A23B]" />
              <span className="text-[10px] font-bold text-[#E9A23B] uppercase tracking-widest">Subscription Health</span>
            </div>
            <p className="text-sm text-[#17181C] leading-relaxed">
              {subscriptions.length} active recurring subscriptions totalling{' '}
              <strong>₹{subscriptions.reduce((a, b) => a + b.monthly, 0).toLocaleString()}/month</strong>.
              Adobe Creative Cloud has had no usage in 45 days — cancelling saves ₹15,588/year.
            </p>
            <Link href="/subscriptions" className="inline-flex items-center gap-1 text-xs font-semibold text-[#5B5CE2] hover:underline">
              Optimize subscriptions <ArrowRight size={11} />
            </Link>
          </div>

          {/* Documents */}
          <div className="p-5 rounded-xl bg-white border border-[#E5E3DC] shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-[#3A9D78]" />
              <span className="text-[10px] font-bold text-[#3A9D78] uppercase tracking-widest">Documents &amp; Deadlines</span>
            </div>
            <p className="text-sm text-[#17181C] leading-relaxed">
              {documents.length} documents archived and OCR-indexed. Your passport renewal is the only high-priority
              item with 18 days remaining. All warranties and utility invoices are up to date.
            </p>
            <Link href="/upcoming" className="inline-flex items-center gap-1 text-xs font-semibold text-[#5B5CE2] hover:underline">
              View full upcoming timeline <ArrowRight size={11} />
            </Link>
          </div>

          {/* Photos & Memories */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-5 rounded-xl bg-white border border-[#E5E3DC] shadow-xs space-y-2">
              <div className="flex items-center gap-2">
                <ImageIcon size={14} className="text-[#5B5CE2]" />
                <span className="text-[10px] font-bold text-[#5B5CE2] uppercase tracking-widest">Photos</span>
              </div>
              <p className="text-sm text-[#17181C] leading-relaxed">
                {photos.length} photos added. Captures from Goa beach, Bangalore Tech Park, and home gatherings are indexed.
              </p>
              <Link href="/photos" className="inline-flex items-center gap-1 text-xs font-semibold text-[#5B5CE2] hover:underline">
                Browse photo gallery <ArrowRight size={11} />
              </Link>
            </div>
            <div className="p-5 rounded-xl bg-white border border-[#E5E3DC] shadow-xs space-y-2">
              <div className="flex items-center gap-2">
                <FileText size={14} className="text-[#6B6D73]" />
                <span className="text-[10px] font-bold text-[#6B6D73] uppercase tracking-widest">Memories</span>
              </div>
              <p className="text-sm text-[#17181C] leading-relaxed">
                {memories.length} life milestones recorded, each connecting photos, documents, and expenses into unified stories.
              </p>
              <Link href="/timeline" className="inline-flex items-center gap-1 text-xs font-semibold text-[#5B5CE2] hover:underline">
                Explore memories timeline <ArrowRight size={11} />
              </Link>
            </div>
          </div>
        </div>

      </motion.div>
    </AppShell>
  );
}
