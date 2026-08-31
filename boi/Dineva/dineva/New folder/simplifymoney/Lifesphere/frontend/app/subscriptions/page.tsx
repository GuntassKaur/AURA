'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingDown, X, CreditCard, AlertTriangle, ArrowRight, Check } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useLifeDataStore } from '@/store/useLifeDataStore';

export default function SubscriptionsPage() {
  const { addNotification } = useNotificationStore();
  const { subscriptions, cancelSubscription } = useLifeDataStore();
  const [dismissedSaving, setDismissedSaving] = useState(false);

  const handleCancel = (id: string, name: string, annualSaving: number) => {
    cancelSubscription(id);
    addNotification({
      type: 'success',
      title: 'Subscription Cancelled',
      message: `${name} cancelled. You will save ₹${annualSaving.toLocaleString()}/year.`,
      duration: 5000,
    });
    setDismissedSaving(true);
  };

  const totalMonthly = subscriptions.reduce((acc, s) => acc + s.monthly, 0);
  const unusedSub = subscriptions.find(s => s.lastUsedDaysAgo > 30);

  return (
    <AppShell activeTab="subscriptions">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 32, paddingBottom: 48, fontFamily: 'Inter, sans-serif' }}
      >
        {/* Header */}
        <div style={{ borderBottom: '1px solid #E2E0D8', paddingBottom: 24, display: 'flex', flexWrap: 'wrap' as const, justifyContent: 'space-between', alignItems: 'flex-end', gap: 16 }}>
          <div>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#5B5CE2', display: 'block', marginBottom: 8 }}>Financial Intelligence</span>
            <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 'clamp(1.7rem, 4vw, 2.6rem)', color: '#1A1B1F', lineHeight: 1.08, letterSpacing: '-0.02em', marginBottom: 8 }}>
              Subscriptions & Recurring
            </h1>
            <p style={{ fontSize: 12, color: '#5C5E66', lineHeight: 1.7, maxWidth: 440 }}>
              Automatic recurring fee detection, usage tracking, and proactive cancellation advisor.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, background: '#fff', border: '1px solid #E2E0D8', borderRadius: 16, padding: '12px 20px' }}>
            <div>
              <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#9B9DA4', marginBottom: 2 }}>Monthly Burn</p>
              <p style={{ fontFamily: 'DM Serif Display, serif', fontSize: 20, color: '#1A1B1F' }}>₹{totalMonthly.toLocaleString()}</p>
            </div>
            <div style={{ width: 1, height: 28, background: '#E2E0D8' }} />
            <div>
              <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#9B9DA4', marginBottom: 2 }}>Annualized</p>
              <p style={{ fontFamily: 'DM Serif Display, serif', fontSize: 20, color: '#1A1B1F' }}>₹{(totalMonthly * 12).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Unused plan alert */}
        <AnimatePresence>
          {unusedSub && !dismissedSaving && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div style={{ background: '#FDF3E3', border: '1px solid rgba(212,146,42,0.35)', borderRadius: 18, padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' as const, gap: 16, position: 'relative' }}>
                <button onClick={() => setDismissedSaving(true)} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#D4922A' }}>
                  <X size={14} />
                </button>
                <div style={{ maxWidth: 440 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <AlertTriangle size={13} style={{ color: '#D4922A' }} />
                    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#D4922A' }}>Unused Plan Detected</span>
                  </div>
                  <h3 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 18, color: '#1A1B1F', marginBottom: 4 }}>{unusedSub.name}</h3>
                  <p style={{ fontSize: 11, color: '#5C5E66', lineHeight: 1.6 }}>
                    No activity detected in the last <strong>{unusedSub.lastUsedDaysAgo} days</strong>. Cancel to save <strong style={{ color: '#D4922A' }}>₹{unusedSub.annualSavingIfCancelled.toLocaleString()}/year</strong>.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => handleCancel(unusedSub.id, unusedSub.name, unusedSub.annualSavingIfCancelled)}
                    style={{ padding: '9px 18px', background: '#D4922A', color: '#fff', border: 'none', borderRadius: 10, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                  >
                    Cancel Plan (Save ₹{unusedSub.annualSavingIfCancelled.toLocaleString()})
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Plans List */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#9B9DA4', marginBottom: 12 }}>
            Active Plans ({subscriptions.length})
          </div>

          <div style={{ background: '#fff', border: '1px solid #E2E0D8', borderRadius: 18, overflow: 'hidden' }}>
            <AnimatePresence mode="popLayout">
              {subscriptions.map((sub, i) => (
                <motion.div
                  key={sub.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '16px 20px', borderTop: i > 0 ? '1px solid #F0EFE9' : 'none',
                    gap: 16, flexWrap: 'wrap' as const,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: '#F8F7F4', border: '1px solid #E2E0D8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Serif Display, serif', fontSize: 16, color: '#1A1B1F' }}>
                      {sub.name.charAt(0)}
                    </div>
                    <div>
                      <p style={{ fontFamily: 'DM Serif Display, serif', fontSize: 15, color: '#1A1B1F', marginBottom: 2 }}>{sub.name}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, color: '#9B9DA4', fontFamily: 'JetBrains Mono, monospace' }}>
                        <span>Renews {sub.renewalDate}</span>
                        <span>·</span>
                        <span style={{ color: sub.lastUsedDaysAgo > 30 ? '#D4922A' : '#2E8B72' }}>
                          Used {sub.lastUsedDaysAgo}d ago
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontFamily: 'DM Serif Display, serif', fontSize: 16, color: '#1A1B1F' }}>₹{sub.monthly.toLocaleString()}</p>
                      <p style={{ fontSize: 9, color: '#9B9DA4', fontFamily: 'JetBrains Mono, monospace' }}>/month</p>
                    </div>
                    <button
                      onClick={() => handleCancel(sub.id, sub.name, sub.annualSavingIfCancelled)}
                      style={{ padding: '6px 12px', background: '#F8F7F4', border: '1px solid #E2E0D8', borderRadius: 8, fontSize: 10, fontWeight: 600, color: '#5C5E66', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#E8808F'; (e.currentTarget as HTMLElement).style.borderColor = '#FCEEF0'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#5C5E66'; (e.currentTarget as HTMLElement).style.borderColor = '#E2E0D8'; }}
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {subscriptions.length === 0 && (
              <div style={{ padding: '48px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <TrendingDown size={28} style={{ color: '#9B9DA4' }} />
                <p style={{ fontFamily: 'DM Serif Display, serif', fontSize: 16, color: '#1A1B1F' }}>No active subscriptions</p>
                <p style={{ fontSize: 11, color: '#9B9DA4' }}>All recurring subscriptions have been cancelled or paused.</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AppShell>
  );
}
