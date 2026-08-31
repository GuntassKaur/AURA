'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, MapPin, X, Sparkles, ArrowRight, FileText,
  Image as ImageIcon, CreditCard, ChevronRight, Compass,
} from 'lucide-react';
import { useLifeDataStore } from '@/store/useLifeDataStore';
import { useDocumentStore } from '@/store/useDocumentStore';
import { usePhotoStore } from '@/store/usePhotoStore';
import { useOrbitStore } from '@/store/useOrbitStore';
import { useRouter } from 'next/navigation';
import { ConnectedMemory } from '@/lib/data';

const S = {
  label: { fontSize: 9, fontWeight: 700 as const, letterSpacing: '0.12em', textTransform: 'uppercase' as const, fontFamily: 'Inter, sans-serif' },
  pill: (color: string, bg: string) => ({ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 999, fontSize: 9, fontWeight: 700 as const, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color, background: bg, fontFamily: 'Inter, sans-serif' }),
  mono: { fontFamily: 'JetBrains Mono, monospace', fontSize: 10 },
};

export default function LifeStream() {
  const router = useRouter();
  const { memories, getPhotosForMemory, getDocsForMemory } = useLifeDataStore();
  const { setOpenedDoc } = useDocumentStore();
  const { setSearchQuery: setPhotoSearch } = usePhotoStore();
  const { setIsOpen: setOrbitOpen, sendMessage } = useOrbitStore();

  const [selectedMemory, setSelectedMemory] = useState<ConnectedMemory | null>(null);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const filtered = memories.filter(m => {
    const matchFilter = activeFilter === 'all' || m.category === activeFilter;
    const matchSearch = search
      ? m.title.toLowerCase().includes(search.toLowerCase()) ||
        m.location.toLowerCase().includes(search.toLowerCase())
      : true;
    return matchFilter && matchSearch;
  });

  const handleOpenDoc = (docId: string) => {
    const doc = useLifeDataStore.getState().documents.find(d => d.id === docId);
    if (doc) { setOpenedDoc(doc as any); router.push('/documents'); }
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 32, paddingBottom: 48, fontFamily: 'Inter, sans-serif' }}>

      {/* ── Header ──────────────────────────────────────────── */}
      <div style={{ borderBottom: '1px solid #E2E0D8', paddingBottom: 24 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap' as const, justifyContent: 'space-between', alignItems: 'flex-end', gap: 16 }}>
          <div>
            <span style={{ ...S.label, color: '#5B5CE2', display: 'block', marginBottom: 8 }}>Chronological Life Chapters</span>
            <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 'clamp(1.7rem, 4vw, 2.6rem)', color: '#1A1B1F', lineHeight: 1.08, letterSpacing: '-0.02em', marginBottom: 8 }}>
              Memories & Timeline
            </h1>
            <p style={{ fontSize: 12, color: '#5C5E66', lineHeight: 1.7, maxWidth: 480 }}>
              Your life as connected stories — journeys, milestones, and moments linked across time, places, and people.
            </p>
          </div>

          {/* Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #E2E0D8', borderRadius: 999, padding: '7px 14px', width: 220 }}>
            <Search size={13} style={{ color: '#9B9DA4', flexShrink: 0 }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search chapters…"
              style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 12, color: '#1A1B1F', outline: 'none', fontFamily: 'Inter, sans-serif' }}
            />
          </div>
        </div>

        {/* Filter chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6, marginTop: 16 }}>
          {[
            { id: 'all', label: 'All Chapters' },
            { id: 'travel', label: 'Travel & Trips' },
            { id: 'personal', label: 'Career & Milestones' },
            { id: 'photos', label: 'Celebrations' },
          ].map(f => {
            const active = activeFilter === f.id;
            return (
              <button key={f.id} onClick={() => setActiveFilter(f.id)} style={{
                padding: '6px 14px', borderRadius: 999, fontSize: 11, fontWeight: active ? 600 : 500,
                background: active ? '#1A1B1F' : '#fff', color: active ? '#fff' : '#5C5E66',
                border: `1px solid ${active ? '#1A1B1F' : '#E2E0D8'}`,
                cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.12s',
              }}>
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Timeline ─────────────────────────────────────────── */}
      <div style={{ position: 'relative' }}>
        {/* Year badge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#1A1B1F', color: '#fff', padding: '6px 16px', borderRadius: 999, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', fontFamily: 'Inter, sans-serif' }}>
            <Compass size={11} style={{ color: '#D4D4FF' }} /> 2026 LIFE ARCHIVE
          </div>
        </div>

        {/* Spine */}
        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: 60, bottom: 0, width: 1, background: 'linear-gradient(to bottom, #5B5CE2 0%, #E2E0D8 60%, rgba(226,224,216,0.3) 100%)' }} className="hidden sm:block" />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {filtered.map((mem, idx) => {
            const isEven = idx % 2 === 0;
            const photos = getPhotosForMemory(mem.id);
            const docs = getDocsForMemory(mem.id);

            return (
              <motion.div
                key={mem.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.06 }}
                style={{ position: 'relative', display: 'flex', justifyContent: isEven ? 'flex-start' : 'flex-end', alignItems: 'center' }}
                className="sm:flex"
              >
                {/* Center node */}
                <div style={{
                  position: 'absolute', left: '50%', transform: 'translateX(-50%)',
                  width: 14, height: 14, borderRadius: '50%', background: '#fff',
                  border: '3px solid #5B5CE2', zIndex: 5,
                }} className="hidden sm:block" />

                {/* Card */}
                <div
                  onClick={() => setSelectedMemory(mem)}
                  style={{
                    width: '100%', maxWidth: 'calc(50% - 24px)',
                    background: '#fff', border: '1px solid #E2E0D8',
                    borderRadius: 18, overflow: 'hidden',
                    cursor: 'pointer', transition: 'border-color 0.15s, box-shadow 0.15s',
                  }}
                  className="w-full sm:max-w-[calc(50%-24px)]"
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#D4D4FF'; el.style.boxShadow = '0 4px 20px rgba(91,92,226,0.1)'; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#E2E0D8'; el.style.boxShadow = 'none'; }}
                >
                  {mem.image && (
                    <div style={{ height: 200, position: 'relative', overflow: 'hidden' }}>
                      <img src={mem.image} alt={mem.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(26,27,31,0.7) 0%, transparent 55%)' }} />
                      <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.92)', borderRadius: 999, padding: '3px 9px' }}>
                        <MapPin size={9} style={{ color: '#5B5CE2' }} />
                        <span style={{ fontSize: 9, fontWeight: 600, color: '#1A1B1F', fontFamily: 'Inter, sans-serif' }}>{mem.location}</span>
                      </div>
                      <div style={{ position: 'absolute', bottom: 12, left: 14, right: 14 }}>
                        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.75)', fontFamily: 'JetBrains Mono, monospace', display: 'block', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{mem.date}</span>
                        <h3 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 17, color: '#fff', lineHeight: 1.2 }}>{mem.title}</h3>
                      </div>
                    </div>
                  )}

                  <div style={{ padding: '14px 16px' }}>
                    <p style={{ fontSize: 11, color: '#5C5E66', lineHeight: 1.7, marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden' }}>
                      {mem.summary}
                    </p>

                    {mem.journeySteps && (
                      <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 4, marginBottom: 12 }}>
                        {mem.journeySteps.slice(0, 3).map((st, i) => (
                          <span key={i} style={{ fontSize: 9, background: '#F8F7F4', border: '1px solid #E2E0D8', borderRadius: 5, padding: '2px 7px', color: '#5C5E66', fontFamily: 'Inter, sans-serif' }}>
                            {st.title}
                          </span>
                        ))}
                        {mem.journeySteps.length > 3 && <span style={{ fontSize: 9, color: '#9B9DA4', fontFamily: 'JetBrains Mono, monospace', alignSelf: 'center' }}>+{mem.journeySteps.length - 3}</span>}
                      </div>
                    )}

                    <div style={{ borderTop: '1px solid #F0EFE9', paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: 12, fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#9B9DA4' }}>
                        {photos.length > 0 && <span>{photos.length} photos</span>}
                        {mem.totalExpense && <span>{mem.totalExpense}</span>}
                        {docs.length > 0 && <span>{docs.length} docs</span>}
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 600, color: '#5B5CE2', display: 'flex', alignItems: 'center', gap: 2, fontFamily: 'Inter, sans-serif' }}>
                        Enter story <ChevronRight size={12} />
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ══ MEMORY STORY MODAL ══════════════════════════════════ */}
      <AnimatePresence>
        {selectedMemory && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
            className="sm:items-center sm:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedMemory(null)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(26,27,31,0.6)', backdropFilter: 'blur(6px)' }} />

            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              style={{
                position: 'relative', zIndex: 10, width: '100%', maxWidth: 700,
                maxHeight: '92vh', background: '#fff',
                borderTopLeftRadius: 24, borderTopRightRadius: 24,
                overflowY: 'auto', fontFamily: 'Inter, sans-serif',
              }}
              className="sm:rounded-3xl"
            >
              {/* Sticky top bar */}
              <div style={{ position: 'sticky', top: 0, background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(8px)', borderBottom: '1px solid #F0EFE9', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 20 }}>
                <button onClick={() => setSelectedMemory(null)} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: '#5B5CE2', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                  <ArrowRight size={13} style={{ transform: 'rotate(180deg)' }} /> Back to Timeline
                </button>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button
                    onClick={() => { setOrbitOpen(true); sendMessage(`Analyze: ${selectedMemory.title}`, () => {}); setSelectedMemory(null); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', background: '#EEEEFF', border: '1px solid #D4D4FF', borderRadius: 999, fontSize: 10, fontWeight: 600, color: '#5B5CE2', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                    <Sparkles size={11} /> Ask Orbit
                  </button>
                  <button onClick={() => setSelectedMemory(null)} style={{ width: 30, height: 30, borderRadius: '50%', background: '#F8F7F4', border: '1px solid #E2E0D8', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <X size={13} style={{ color: '#5C5E66' }} />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: '24px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Heading */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' as const, marginBottom: 8 }}>
                    <span style={{ ...S.pill('#5B5CE2', '#EEEEFF') }}>{selectedMemory.category}</span>
                    <span style={{ ...S.mono, color: '#9B9DA4' }}>·</span>
                    <span style={{ ...S.mono, color: '#9B9DA4' }}>{selectedMemory.date}</span>
                    <span style={{ ...S.mono, color: '#9B9DA4' }}>·</span>
                    <span style={{ ...S.mono, color: '#9B9DA4' }}>{selectedMemory.location}</span>
                  </div>
                  <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', color: '#1A1B1F', lineHeight: 1.1, letterSpacing: '-0.015em', marginBottom: 10 }}>{selectedMemory.title}</h2>
                  <p style={{ fontSize: 12, color: '#5C5E66', lineHeight: 1.75 }}>{selectedMemory.summary}</p>
                </div>

                {/* Hero photo */}
                {selectedMemory.image && (
                  <div style={{ borderRadius: 16, overflow: 'hidden', height: 240 }}>
                    <img src={selectedMemory.image} alt={selectedMemory.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}

                {/* Journey roadmap */}
                {selectedMemory.journeySteps && selectedMemory.journeySteps.length > 0 && (
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9B9DA4', marginBottom: 12, borderBottom: '1px solid #F0EFE9', paddingBottom: 8 }}>Journey Roadmap</div>
                    <div style={{ paddingLeft: 18, borderLeft: '2px solid rgba(91,92,226,0.3)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {selectedMemory.journeySteps.map((step, i) => (
                        <div key={i} style={{ position: 'relative' }}>
                          <span style={{ position: 'absolute', left: -26, top: 4, width: 10, height: 10, borderRadius: '50%', background: '#5B5CE2', border: '2px solid #fff', boxShadow: '0 0 0 2px rgba(91,92,226,0.2)' }} />
                          <p style={{ fontFamily: 'DM Serif Display, serif', fontSize: 13, color: '#1A1B1F', marginBottom: 2 }}>{step.title}</p>
                          <p style={{ fontSize: 11, color: '#9B9DA4', lineHeight: 1.6 }}>{step.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Photos */}
                {(() => {
                  const ph = getPhotosForMemory(selectedMemory.id);
                  if (!ph.length) return null;
                  return (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottom: '1px solid #F0EFE9', paddingBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9B9DA4', fontFamily: 'Inter, sans-serif' }}>
                          <ImageIcon size={11} style={{ color: '#5B5CE2' }} /> Connected Moments ({ph.length})
                        </div>
                        <button onClick={() => { setPhotoSearch(selectedMemory.title.split(' ')[0]); router.push('/photos'); }} style={{ fontSize: 10, fontWeight: 600, color: '#5B5CE2', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                          View all
                        </button>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                        {ph.map(p => (
                          <div key={p.id} style={{ height: 100, borderRadius: 10, overflow: 'hidden', position: 'relative', cursor: 'pointer' }} onClick={() => router.push('/photos')}>
                            <img src={p.imageUrl} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Expenses */}
                {selectedMemory.expenses && selectedMemory.expenses.length > 0 && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12, borderBottom: '1px solid #F0EFE9', paddingBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9B9DA4', fontFamily: 'Inter, sans-serif' }}>
                        <CreditCard size={11} style={{ color: '#2E8B72' }} /> Connected Expenditure
                      </div>
                      <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: 15, color: '#1A1B1F' }}>Total: {selectedMemory.totalExpense}</span>
                    </div>
                    <div style={{ background: '#F8F7F4', border: '1px solid #E2E0D8', borderRadius: 12, overflow: 'hidden' }}>
                      {selectedMemory.expenses.map((exp, i) => (
                        <div key={exp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 14px', borderTop: i > 0 ? '1px solid #E2E0D8' : 'none' }}>
                          <div>
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#1A1B1F', fontFamily: 'Inter, sans-serif', display: 'block' }}>{exp.title}</span>
                            <span style={{ fontSize: 10, color: '#9B9DA4', fontFamily: 'JetBrains Mono, monospace' }}>{exp.category} · {exp.date}</span>
                          </div>
                          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 600, color: '#1A1B1F' }}>{exp.formattedAmount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Documents */}
                {(() => {
                  const docs = getDocsForMemory(selectedMemory.id);
                  if (!docs.length) return null;
                  return (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9B9DA4', fontFamily: 'Inter, sans-serif', marginBottom: 12, borderBottom: '1px solid #F0EFE9', paddingBottom: 8 }}>
                        <FileText size={11} style={{ color: '#D4922A' }} /> Records & Documents ({docs.length})
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        {docs.map(doc => (
                          <div key={doc.id} onClick={() => handleOpenDoc(doc.id)} style={{ padding: '12px', background: '#fff', border: '1px solid #E2E0D8', borderRadius: 12, cursor: 'pointer', transition: 'border-color 0.12s' }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = '#D4D4FF'}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = '#E2E0D8'}>
                            <span style={{ fontSize: 11, fontWeight: 600, color: '#1A1B1F', display: 'block', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, fontFamily: 'Inter, sans-serif' }}>{doc.title}</span>
                            <span style={{ fontSize: 9, color: '#9B9DA4', fontFamily: 'JetBrains Mono, monospace' }}>{doc.category} · {doc.amount || doc.date}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* People + Places */}
                {(selectedMemory.people || selectedMemory.places) && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    {selectedMemory.people && (
                      <div>
                        <div style={{ ...S.label, color: '#9B9DA4', marginBottom: 8 }}>People Along</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 5 }}>
                          {selectedMemory.people.map(p => (
                            <span key={p} style={{ padding: '4px 10px', background: '#EEEEFF', color: '#5B5CE2', borderRadius: 999, fontSize: 10, fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>{p}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedMemory.places && (
                      <div>
                        <div style={{ ...S.label, color: '#9B9DA4', marginBottom: 8 }}>Locations</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 5 }}>
                          {selectedMemory.places.map(pl => (
                            <span key={pl} style={{ padding: '4px 10px', background: '#E3F4EF', color: '#2E8B72', borderRadius: 999, fontSize: 10, fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>{pl}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
