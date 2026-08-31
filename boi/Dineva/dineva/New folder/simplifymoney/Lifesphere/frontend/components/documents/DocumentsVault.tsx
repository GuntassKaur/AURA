'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Shield, Receipt, Sparkles, Check, Bell, X, FileText } from 'lucide-react';
import { useLifeDataStore } from '@/store/useLifeDataStore';
import { useDocumentStore } from '@/store/useDocumentStore';
import { useNotificationStore } from '@/store/useNotificationStore';

const S = {
  label: { fontSize: 9, fontWeight: 700 as const, letterSpacing: '0.12em', textTransform: 'uppercase' as const, fontFamily: 'Inter, sans-serif' },
};

const CATEGORIES = [
  { id: 'all', label: 'All Artifacts' },
  { id: 'government', label: 'Government & ID' },
  { id: 'financial', label: 'Financial & Invoices' },
  { id: 'travel', label: 'Travel Vouchers' },
  { id: 'warranty', label: 'Warranties' },
  { id: 'medical', label: 'Medical Records' },
];

const CAT_COLORS: Record<string, { color: string; bg: string }> = {
  government: { color: '#D4922A', bg: '#FDF3E3' },
  financial: { color: '#E8808F', bg: '#FCEEF0' },
  travel: { color: '#5B5CE2', bg: '#EEEEFF' },
  warranty: { color: '#2E8B72', bg: '#E3F4EF' },
  medical: { color: '#9B9DA4', bg: '#F8F7F4' },
};

export default function DocumentsVault() {
  const { documents, addUpcomingItem } = useLifeDataStore();
  const { setOpenedDoc, setSelectedDoc } = useDocumentStore();
  const { addNotification } = useNotificationStore();
  const [activeCollection, setActiveCollection] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = documents.filter(doc => {
    const matchCat = activeCollection === 'all' || doc.category === activeCollection;
    const matchSearch = searchQuery
      ? doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.ocrText?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.tags?.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
    return matchCat && matchSearch;
  });

  const passportDoc = documents.find(d => d.id === 'doc-passport');
  const elecDoc = documents.find(d => d.id === 'doc-electricity');

  const handleReminder = (doc: any) => {
    addUpcomingItem({
      groupKey: 'SCHEDULED', groupLabel: doc.expiryDate || 'Upcoming',
      title: `${doc.title} deadline`, category: doc.category === 'financial' ? 'Bills' : 'Documents',
      amount: doc.amount, description: `Scheduled action for ${doc.title}.`,
      actionLabel: 'Handle record', dotColor: '#5B5CE2',
      dueDate: doc.expiryDate || 'Next week', urgency: 'info', relatedEntityId: doc.id,
    });
    addNotification({ type: 'success', title: 'Reminder Set', message: `Alert scheduled for "${doc.title}".`, duration: 3500 });
  };

  const handleView = (doc: any) => {
    setSelectedDoc(doc);
    setOpenedDoc(doc);
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 28, paddingBottom: 48, fontFamily: 'Inter, sans-serif' }}>

      {/* Header */}
      <div style={{ borderBottom: '1px solid #E2E0D8', paddingBottom: 24 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap' as const, justifyContent: 'space-between', alignItems: 'flex-end', gap: 16 }}>
          <div>
            <span style={{ ...S.label, color: '#5B5CE2', display: 'block', marginBottom: 8 }}>Personal Life Records & Artifacts</span>
            <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 'clamp(1.7rem, 4vw, 2.6rem)', color: '#1A1B1F', lineHeight: 1.08, letterSpacing: '-0.02em', marginBottom: 8 }}>
              Documents Vault
            </h1>
            <p style={{ fontSize: 12, color: '#5C5E66', lineHeight: 1.7, maxWidth: 460 }}>
              Passports, utility bills, warranties, and travel vouchers stored as intelligent artifacts with automated OCR and expiry scheduling.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #E2E0D8', borderRadius: 999, padding: '7px 14px', width: 220 }}>
            <Search size={13} style={{ color: '#9B9DA4', flexShrink: 0 }} />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search document archive…"
              style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 12, color: '#1A1B1F', outline: 'none', fontFamily: 'Inter, sans-serif' }} />
          </div>
        </div>

        {/* Category chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6, marginTop: 16 }}>
          {CATEGORIES.map(cat => {
            const active = activeCollection === cat.id;
            return (
              <button key={cat.id} onClick={() => setActiveCollection(cat.id)} style={{
                padding: '6px 14px', borderRadius: 999, fontSize: 11, fontWeight: active ? 600 : 500,
                background: active ? '#1A1B1F' : '#fff', color: active ? '#fff' : '#5C5E66',
                border: `1px solid ${active ? '#1A1B1F' : '#E2E0D8'}`,
                cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.12s',
              }}>
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Proactive Intelligence Cards */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
          <Sparkles size={12} style={{ color: '#5B5CE2' }} />
          <span style={{ ...S.label, color: '#5B5CE2' }}>Proactive Document Intelligence</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
          {/* Passport */}
          {passportDoc && (
            <div style={{ background: '#1C2430', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 180, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(212,146,42,0.07)' }} />
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: '#D4922A', background: 'rgba(212,146,42,0.15)', padding: '2px 8px', borderRadius: 999, letterSpacing: '0.08em', textTransform: 'uppercase' as const, fontFamily: 'Inter, sans-serif' }}>Government ID</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>Expires {(passportDoc as any).expiryDate}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <Shield size={15} style={{ color: '#D4922A', flexShrink: 0 }} />
                  <p style={{ fontFamily: 'DM Serif Display, serif', fontSize: 16, color: '#fff', lineHeight: 1.2 }}>Passport Renewal Approaching</p>
                </div>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>
                  Submit online before September 1st to prevent international travel delays.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: 14 }}>
                <button onClick={() => handleView(passportDoc)} style={{ flex: 1, padding: '7px 12px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11, fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                  Inspect
                </button>
                <button onClick={() => handleReminder(passportDoc)} style={{ padding: '7px 14px', background: '#5B5CE2', border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                  Set Reminder
                </button>
              </div>
            </div>
          )}

          {/* Electricity */}
          {elecDoc && (
            <div style={{ background: '#fff', border: '1px solid #E2E0D8', borderRadius: 18, padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 180 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: '#E8808F', background: '#FCEEF0', padding: '2px 8px', borderRadius: 999, letterSpacing: '0.08em', textTransform: 'uppercase' as const, fontFamily: 'Inter, sans-serif' }}>Utility Invoice</span>
                  <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: 15, color: '#1A1B1F' }}>{(elecDoc as any).amount}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <Receipt size={15} style={{ color: '#E8808F', flexShrink: 0 }} />
                  <p style={{ fontFamily: 'DM Serif Display, serif', fontSize: 16, color: '#1A1B1F', lineHeight: 1.2 }}>BSES Power Bill Due Tomorrow</p>
                </div>
                <p style={{ fontSize: 11, color: '#9B9DA4', lineHeight: 1.7 }}>
                  Due on {(elecDoc as any).expiryDate}. Units: 482 kWh. Auto-pay not active.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8, paddingTop: 14, borderTop: '1px solid #F0EFE9', marginTop: 14 }}>
                <button onClick={() => handleView(elecDoc)} style={{ flex: 1, padding: '7px 12px', background: '#F8F7F4', border: '1px solid #E2E0D8', borderRadius: 8, fontSize: 11, fontWeight: 600, color: '#1A1B1F', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                  Inspect Invoice
                </button>
                <button onClick={() => handleReminder(elecDoc)} style={{ padding: '7px 14px', background: '#2E8B72', border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                  Schedule
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Artifacts Grid */}
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
          <AnimatePresence>
            {filtered.map((doc, idx) => {
              const cc = CAT_COLORS[doc.category] || { color: '#9B9DA4', bg: '#F8F7F4' };
              return (
                <motion.div
                  key={doc.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.03 }}
                  onClick={() => handleView(doc)}
                  style={{
                    background: '#fff', border: '1px solid #E2E0D8', borderRadius: 14,
                    padding: '16px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 10,
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                  }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#D4D4FF'; el.style.boxShadow = '0 2px 12px rgba(91,92,226,0.08)'; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#E2E0D8'; el.style.boxShadow = 'none'; }}
                >
                  {/* Top row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: cc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FileText size={16} style={{ color: cc.color }} />
                    </div>
                    {(doc as any).amount && (
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 700, color: '#1A1B1F' }}>{(doc as any).amount}</span>
                    )}
                  </div>

                  {/* Title & tags */}
                  <div>
                    <p style={{ fontFamily: 'DM Serif Display, serif', fontSize: 14, color: '#1A1B1F', marginBottom: 4, lineHeight: 1.25 }}>{doc.title}</p>
                    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: cc.color, background: cc.bg, padding: '2px 7px', borderRadius: 5, fontFamily: 'Inter, sans-serif' }}>
                      {doc.category}
                    </span>
                  </div>

                  {/* Expiry */}
                  {(doc as any).expiryDate && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: '#9B9DA4', fontFamily: 'JetBrains Mono, monospace' }}>
                      Expires {(doc as any).expiryDate}
                    </div>
                  )}

                  {/* Footer */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid #F0EFE9' }}>
                    <span style={{ fontSize: 9, color: '#9B9DA4', fontFamily: 'JetBrains Mono, monospace' }}>{doc.date}</span>
                    <button
                      onClick={e => { e.stopPropagation(); handleReminder(doc); }}
                      style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 600, color: '#5B5CE2', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                      <Bell size={10} /> Remind
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div style={{ gridColumn: '1 / -1', background: '#fff', border: '1px solid #E2E0D8', borderRadius: 16, padding: '48px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <FileText size={28} style={{ color: '#9B9DA4' }} />
              <p style={{ fontFamily: 'DM Serif Display, serif', fontSize: 16, color: '#1A1B1F' }}>No documents found</p>
              <p style={{ fontSize: 11, color: '#9B9DA4' }}>No records match "{searchQuery || activeCollection}".</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
