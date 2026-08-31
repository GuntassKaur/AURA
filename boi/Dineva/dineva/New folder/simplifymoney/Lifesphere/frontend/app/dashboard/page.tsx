'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, MapPin, CheckCircle, FileText, Bell,
  Check, CreditCard, Clock, Sparkles, AlertTriangle,
  ChevronRight, Compass, Users, Receipt, Shield
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useLifeDataStore } from '@/store/useLifeDataStore';
import { useDocumentStore } from '@/store/useDocumentStore';

export default function DashboardPage() {
  const router = useRouter();
  const { addNotification } = useNotificationStore();
  const { upcoming, markUpcomingDone, snoozeUpcoming, memories, documents } = useLifeDataStore();
  const { setOpenedDoc } = useDocumentStore();

  const attentionItems = upcoming.filter(u =>
    u.urgency === 'critical' || u.urgency === 'warning' || u.groupKey === 'TODAY'
  );
  const featuredMemory = memories[0];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const handleDone = (id: string, title: string, amount?: string) => {
    markUpcomingDone(id);
    addNotification({
      type: 'success',
      title: 'Action Complete',
      message: `${amount ? amount + ' for ' : ''}${title} marked as settled.`,
      duration: 4000
    });
  };

  const handleSnooze = (id: string, title: string) => {
    snoozeUpcoming(id, 2);
    addNotification({
      type: 'warning',
      title: 'Deferred 2 Days',
      message: `Reminder reset for "${title}".`,
      duration: 3500
    });
  };

  const handleOpenDoc = (docId?: string) => {
    if (!docId) { router.push('/documents'); return; }
    const doc = documents.find(d => d.id === docId);
    if (doc) { setOpenedDoc(doc as any); }
    router.push('/documents');
  };

  return (
    <AppShell activeTab="dashboard">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 36, fontFamily: 'Inter, sans-serif' }}
      >

        {/* ══ 1. GREETING & CONTEXT HEADER ════════════════════════ */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#9A9C9F', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
            <span>·</span>
            <span>Delhi, India</span>
          </div>
          <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 'clamp(2rem, 4vw, 2.75rem)', color: '#17181C', lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 8 }}>
            {greeting}, Guntass.
          </h1>
          <p style={{ fontSize: 14, color: '#5C5E66', lineHeight: 1.6, maxWidth: 540 }}>
            Here&apos;s what matters in your life right now. Your urgent items are clear, and your latest chapter is organized.
          </p>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #E5E3DC' }} />

        {/* ══ 2. TODAY: NEEDS ATTENTION (Editorial List Rows) ═══ */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#E8808F', display: 'inline-block' }} />
              <h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#17181C', fontFamily: 'Inter, sans-serif' }}>
                Needs Your Attention
              </h2>
            </div>
            <span style={{ fontSize: 11, color: '#9A9C9F', fontFamily: 'JetBrains Mono, monospace' }}>
              {attentionItems.length} items
            </span>
          </div>

          <div style={{ background: '#FFFFFF', border: '1px solid #E5E3DC', borderRadius: 14, overflow: 'hidden' }}>
            <AnimatePresence mode="popLayout">
              {attentionItems.map((item, i) => {
                const isCrit = item.urgency === 'critical';
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 18px',
                      gap: 16,
                      flexWrap: 'wrap' as const,
                      borderTop: i > 0 ? '1px solid #F2F0E9' : 'none',
                    }}
                  >
                    {/* Left: Category Icon + Content */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1, minWidth: 0 }}>
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: isCrit ? '#FCEEF0' : '#FDF3E3',
                        color: isCrit ? '#E8808F' : '#D4922A',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: 2,
                      }}>
                        {item.category === 'Bills' ? <Receipt size={15} /> : <Shield size={15} />}
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' as const, marginBottom: 2 }}>
                          <span style={{
                            fontSize: 9,
                            fontWeight: 700,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase' as const,
                            color: isCrit ? '#E8808F' : '#D4922A',
                            background: isCrit ? '#FCEEF0' : '#FDF3E3',
                            padding: '2px 7px',
                            borderRadius: 4,
                          }}>
                            {item.category}
                          </span>
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#17181C' }}>
                            {item.title}
                          </span>
                          {item.amount && (
                            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 600, color: '#17181C', background: '#F8F7F4', border: '1px solid #E5E3DC', borderRadius: 4, padding: '1px 6px' }}>
                              {item.amount}
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: 11, color: '#6B6D73', lineHeight: 1.5 }}>
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      {item.category === 'Bills' ? (
                        <>
                          <button
                            onClick={() => handleDone(item.id, item.title, item.amount)}
                            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', background: '#2E8B72', color: '#fff', border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                          >
                            <Check size={11} /> Pay
                          </button>
                          <button
                            onClick={() => handleSnooze(item.id, item.title)}
                            style={{ padding: '6px 10px', background: '#F8F7F4', border: '1px solid #E5E3DC', borderRadius: 8, cursor: 'pointer', color: '#5C5E66' }}
                            title="Snooze 2 days"
                          >
                            <Bell size={12} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleOpenDoc(item.relatedEntityId)}
                            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', background: '#5B5CE2', color: '#fff', border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                          >
                            Open
                          </button>
                          <button
                            onClick={() => handleSnooze(item.id, item.title)}
                            style={{ padding: '6px 10px', background: '#F8F7F4', border: '1px solid #E5E3DC', borderRadius: 8, cursor: 'pointer', color: '#5C5E66' }}
                            title="Remind me later"
                          >
                            <Bell size={12} />
                          </button>
                        </>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {attentionItems.length === 0 && (
              <div style={{ padding: '28px 16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <CheckCircle size={22} style={{ color: '#2E8B72' }} />
                <p style={{ fontFamily: 'DM Serif Display, serif', fontSize: 14, color: '#17181C' }}>All clear for today</p>
                <p style={{ fontSize: 11, color: '#9A9C9F' }}>No outstanding bills or imminent document expiries.</p>
              </div>
            )}
          </div>
        </section>

        <hr style={{ border: 'none', borderTop: '1px solid #E5E3DC' }} />

        {/* ══ 3. YOUR LIFE, LATELY (Hero Visual Chapter) ═════════ */}
        {featuredMemory && (
          <section>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Compass size={13} style={{ color: '#5B5CE2' }} />
                <h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#17181C', fontFamily: 'Inter, sans-serif' }}>
                  Your Life, Lately
                </h2>
              </div>
              <button
                onClick={() => router.push('/timeline')}
                style={{ fontSize: 11, fontWeight: 600, color: '#5B5CE2', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, fontFamily: 'Inter, sans-serif' }}
              >
                Full Timeline <ArrowRight size={11} />
              </button>
            </div>

            {/* Visual Story Chapter Layout */}
            <div
              onClick={() => router.push('/timeline')}
              style={{
                background: '#FFFFFF',
                border: '1px solid #E5E3DC',
                borderRadius: 18,
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#D4D4FF'; (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 24px rgba(91,92,226,0.08)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#E5E3DC'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
            >
              {/* Large Photographic Spread */}
              <div style={{ position: 'relative', height: 260, width: '100%', overflow: 'hidden' }}>
                <img
                  src={featuredMemory.image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80'}
                  alt={featuredMemory.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(23,24,28,0.75) 0%, transparent 60%)' }} />
                
                <div style={{ position: 'absolute', top: 14, left: 14, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', borderRadius: 999, padding: '4px 10px' }}>
                  <MapPin size={10} style={{ color: '#5B5CE2' }} />
                  <span style={{ fontSize: 10, fontWeight: 600, color: '#17181C', fontFamily: 'Inter, sans-serif' }}>{featuredMemory.location}</span>
                </div>

                <div style={{ position: 'absolute', bottom: 16, left: 20, right: 20, color: '#FFFFFF' }}>
                  <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.85, marginBottom: 4 }}>
                    {featuredMemory.date} · 4 Days by the Sea
                  </div>
                  <h3 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 'clamp(1.5rem, 3vw, 2.1rem)', lineHeight: 1.15 }}>
                    {featuredMemory.title}
                  </h3>
                </div>
              </div>

              {/* Story Details & Connected Life Network */}
              <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <p style={{ fontSize: 13, color: '#5C5E66', lineHeight: 1.7 }}>
                  {featuredMemory.summary}
                </p>

                {/* Itinerary Steps Map */}
                {featuredMemory.journeySteps && featuredMemory.journeySteps.length > 0 && (
                  <div style={{ background: '#F8F7F4', border: '1px solid #E5E3DC', borderRadius: 12, padding: '12px 16px' }}>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9A9C9F', marginBottom: 8, fontFamily: 'Inter, sans-serif' }}>
                      Connected Journey Route
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap' as const, alignItems: 'center', gap: 6 }}>
                      {featuredMemory.journeySteps.map((step, idx) => (
                        <React.Fragment key={idx}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: '#17181C', background: '#FFFFFF', border: '1px solid #E5E3DC', borderRadius: 6, padding: '3px 8px' }}>
                            {step.title}
                          </span>
                          {idx < (featuredMemory.journeySteps?.length ?? 0) - 1 && (
                            <ChevronRight size={12} style={{ color: '#9A9C9F' }} />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}

                {/* Connected Metrics Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' as const, gap: 12, borderTop: '1px solid #F2F0E9', paddingTop: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: '#6B6D73' }}>
                    <span><strong style={{ color: '#17181C' }}>128</strong> photos</span>
                    <span><strong style={{ color: '#17181C' }}>{featuredMemory.totalExpense}</strong> spent</span>
                    <span><strong style={{ color: '#17181C' }}>3</strong> people</span>
                    <span><strong style={{ color: '#17181C' }}>5</strong> places</span>
                    <span><strong style={{ color: '#17181C' }}>2</strong> documents</span>
                  </div>

                  <span style={{ fontSize: 11, fontWeight: 600, color: '#5B5CE2', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'Inter, sans-serif' }}>
                    Open Memory Dossier <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

        <hr style={{ border: 'none', borderTop: '1px solid #E5E3DC' }} />

        {/* ══ 4. COMING UP & ORBIT LIFE PERSPECTIVE ══════════════ */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          
          {/* Chronological Upcoming Stream */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={13} style={{ color: '#5B5CE2' }} />
                <h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#17181C', fontFamily: 'Inter, sans-serif' }}>
                  Coming Up
                </h2>
              </div>
              <button
                onClick={() => router.push('/upcoming')}
                style={{ fontSize: 11, fontWeight: 600, color: '#5B5CE2', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
              >
                Calendar <ArrowRight size={11} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {upcoming.slice(0, 4).map(item => (
                <div
                  key={item.id}
                  onClick={() => router.push('/upcoming')}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E5E3DC',
                    borderRadius: 10,
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'border-color 0.12s ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = '#D4D4FF')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = '#E5E3DC')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: item.dotColor || '#5B5CE2', flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#17181C', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
                          {item.title}
                        </span>
                        {item.amount && (
                          <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: '#5C5E66' }}>
                            {item.amount}
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: 10, color: '#9A9C9F' }}>{item.groupLabel}</span>
                    </div>
                  </div>

                  <span style={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace', color: '#9A9C9F', textTransform: 'uppercase' }}>
                    {item.groupKey}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Orbit Intelligence & Inactive Plan Advisor */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ background: '#FFFFFF', border: '1px solid #E5E3DC', borderRadius: 14, padding: '18px 20px', borderLeft: '3px solid #5B5CE2' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <Sparkles size={13} style={{ color: '#5B5CE2' }} />
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#5B5CE2', fontFamily: 'Inter, sans-serif' }}>
                  Orbit Life Synthesis
                </span>
              </div>
              <p style={{ fontFamily: 'DM Serif Display, serif', fontSize: 15, color: '#17181C', marginBottom: 6 }}>
                Your week in perspective
              </p>
              <p style={{ fontSize: 12, color: '#5C5E66', lineHeight: 1.65, marginBottom: 12 }}>
                You have logged <strong>{memories.length} life milestones</strong>. Electricity billing is due tomorrow (₹4,230), and your passport renewal window is in 18 days.
              </p>
              <button
                onClick={() => router.push('/chat')}
                style={{ fontSize: 11, fontWeight: 600, color: '#5B5CE2', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'Inter, sans-serif' }}
              >
                Ask Orbit about your life <ArrowRight size={11} />
              </button>
            </div>

            {/* Inactive Plan */}
            <div style={{ background: '#FDF3E3', border: '1px solid rgba(212,146,42,0.35)', borderRadius: 14, padding: '14px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <AlertTriangle size={12} style={{ color: '#D4922A' }} />
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#D4922A', fontFamily: 'Inter, sans-serif' }}>
                  Subscription Review
                </span>
              </div>
              <p style={{ fontSize: 11, color: '#17181C', lineHeight: 1.6, marginBottom: 8 }}>
                Adobe Creative Cloud hasn&apos;t been active in 45 days. Cancel to save <strong>₹15,588/year</strong>.
              </p>
              <button
                onClick={() => router.push('/subscriptions')}
                style={{ fontSize: 10, fontWeight: 700, color: '#D4922A', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, fontFamily: 'Inter, sans-serif' }}
              >
                Review Subscription <ArrowRight size={10} />
              </button>
            </div>
          </div>

        </div>

      </motion.div>
    </AppShell>
  );
}
