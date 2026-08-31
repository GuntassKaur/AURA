'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Clock, Calendar, CheckCircle, Bell, ArrowRight, Sparkles } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useLifeDataStore } from '@/store/useLifeDataStore';
import { ConnectedUpcomingItem } from '@/lib/data';

const FILTERS = ['All', 'Bills', 'Documents', 'Subscriptions', 'Travel', 'Personal'];

export default function UpcomingPage() {
  const { addNotification } = useNotificationStore();
  const { upcoming, markUpcomingDone, snoozeUpcoming } = useLifeDataStore();
  const [activeFilter, setActiveFilter] = useState('All');

  const handleAction = (id: string, title: string) => {
    markUpcomingDone(id);
    addNotification({ type: 'success', title: 'Obligation Resolved', message: `"${title}" has been settled.`, duration: 3500 });
  };

  const handleSnooze = (id: string, title: string) => {
    snoozeUpcoming(id, 2);
    addNotification({ type: 'warning', title: 'Deferred 2 Days', message: `Reminder snoozed 2 days for "${title}".`, duration: 3500 });
  };

  const visible = upcoming.filter(i => activeFilter === 'All' || i.category === activeFilter);

  const groups: Record<string, { label: string; items: ConnectedUpcomingItem[] }> = {};
  for (const item of visible) {
    if (!groups[item.groupKey]) groups[item.groupKey] = { label: item.groupLabel, items: [] };
    groups[item.groupKey].items.push(item);
  }
  const groupKeys = Object.keys(groups);

  return (
    <AppShell activeTab="upcoming">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 32, paddingBottom: 48, fontFamily: 'Inter, sans-serif' }}
      >
        {/* Header */}
        <div style={{ borderBottom: '1px solid #E2E0D8', paddingBottom: 24, display: 'flex', flexWrap: 'wrap' as const, justifyContent: 'space-between', alignItems: 'flex-end', gap: 16 }}>
          <div>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#5B5CE2', display: 'block', marginBottom: 8 }}>Time Horizon & Obligations</span>
            <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 'clamp(1.7rem, 4vw, 2.6rem)', color: '#1A1B1F', lineHeight: 1.08, letterSpacing: '-0.02em', marginBottom: 8 }}>
              Upcoming Horizon
            </h1>
            <p style={{ fontSize: 12, color: '#5C5E66', lineHeight: 1.7, maxWidth: 440 }}>
              A chronological time stream. Near events demand immediate action; distant obligations give advance perspective.
            </p>
          </div>

          <div style={{ background: '#fff', border: '1px solid #E2E0D8', borderRadius: 999, padding: '6px 14px', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: '#5C5E66' }}>
            {visible.length} obligations active
          </div>
        </div>

        {/* Filter chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6 }}>
          {FILTERS.map(f => {
            const active = activeFilter === f;
            return (
              <button key={f} onClick={() => setActiveFilter(f)} style={{
                padding: '6px 14px', borderRadius: 999, fontSize: 11, fontWeight: active ? 600 : 500,
                background: active ? '#1A1B1F' : '#fff', color: active ? '#fff' : '#5C5E66',
                border: `1px solid ${active ? '#1A1B1F' : '#E2E0D8'}`,
                cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.12s',
              }}>
                {f}
              </button>
            );
          })}
        </div>

        {/* Timeline Horizon Stream */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 32 }}>
          {visible.length > 0 && (
            <div style={{ position: 'absolute', left: 7, top: 8, bottom: 8, width: 2, background: 'linear-gradient(to bottom, #E8808F 0%, #5B5CE2 50%, #E2E0D8 100%)' }} />
          )}

          <AnimatePresence mode="popLayout">
            {groupKeys.map(key => {
              const group = groups[key];
              if (!group || group.items.length === 0) return null;
              const isToday = key === 'TODAY';
              const isUrgent = group.items.some(i => i.urgency === 'critical');

              return (
                <motion.div
                  key={key}
                  layout
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ position: 'relative', paddingLeft: 32, display: 'flex', flexDirection: 'column', gap: 12 }}
                >
                  {/* Node */}
                  <span style={{
                    position: 'absolute', left: 0, top: 4, width: 16, height: 16, borderRadius: '50%',
                    background: isUrgent ? '#E8808F' : '#5B5CE2', border: '3px solid #fff',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
                  }} />

                  {/* Group header */}
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                    <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: 16, color: '#1A1B1F', letterSpacing: '0.02em' }}>{key}</span>
                    <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: '#9B9DA4' }}>{group.label}</span>
                    {isToday && (
                      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#E8808F', background: '#FCEEF0', padding: '2px 8px', borderRadius: 999 }}>
                        Action Required Today
                      </span>
                    )}
                  </div>

                  {/* Cards */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {group.items.map(item => (
                      <motion.div
                        key={item.id}
                        layout
                        style={{
                          background: '#fff', border: '1px solid #E2E0D8', borderRadius: 14,
                          padding: '14px 18px', display: 'flex', alignItems: 'center',
                          justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' as const,
                          transition: 'border-color 0.12s',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#D4D4FF'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#E2E0D8'; }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1, minWidth: 0 }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.dotColor || '#5B5CE2', marginTop: 5, flexShrink: 0 }} />
                          <div style={{ minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' as const, marginBottom: 2 }}>
                              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#5B5CE2', background: '#EEEEFF', padding: '2px 7px', borderRadius: 5 }}>
                                {item.category}
                              </span>
                              <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: 14, color: '#1A1B1F' }}>{item.title}</span>
                              {item.amount && (
                                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 600, color: '#1A1B1F', background: '#F8F7F4', border: '1px solid #E2E0D8', borderRadius: 5, padding: '1px 6px' }}>
                                  {item.amount}
                                </span>
                              )}
                            </div>
                            <p style={{ fontSize: 11, color: '#9B9DA4', lineHeight: 1.5 }}>{item.description}</p>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                          <button
                            onClick={() => handleAction(item.id, item.title)}
                            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', background: '#2E8B72', color: '#fff', border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                          >
                            <Check size={11} /> {item.actionLabel}
                          </button>
                          <button
                            onClick={() => handleSnooze(item.id, item.title)}
                            style={{ padding: '7px 10px', background: '#F8F7F4', border: '1px solid #E2E0D8', borderRadius: 8, cursor: 'pointer' }}
                            title="Snooze 2 days"
                          >
                            <Clock size={12} style={{ color: '#5C5E66' }} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {visible.length === 0 && (
            <div style={{ background: '#fff', border: '1px solid #E2E0D8', borderRadius: 18, padding: '48px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <CheckCircle size={28} style={{ color: '#2E8B72' }} />
              <p style={{ fontFamily: 'DM Serif Display, serif', fontSize: 16, color: '#1A1B1F' }}>All clear on the horizon</p>
              <p style={{ fontSize: 11, color: '#9B9DA4' }}>No scheduled obligations matching your current filter.</p>
            </div>
          )}
        </div>
      </motion.div>
    </AppShell>
  );
}
