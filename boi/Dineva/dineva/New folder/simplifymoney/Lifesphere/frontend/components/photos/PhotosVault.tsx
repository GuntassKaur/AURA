'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, MapPin, Camera, X, ExternalLink } from 'lucide-react';
import { useLifeDataStore } from '@/store/useLifeDataStore';
import { usePhotoStore } from '@/store/usePhotoStore';

const CATS = [
  { id: 'all', label: 'All Moments' },
  { id: 'trip', label: 'Trips & Journeys' },
  { id: 'people', label: 'People & Gatherings' },
  { id: 'places', label: 'Landscapes & Places' },
  { id: 'receipts', label: 'Receipts & Captures' },
];

export default function PhotosVault() {
  const { photos } = useLifeDataStore();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewPhoto, setViewPhoto] = useState<any>(null);

  const filtered = photos.filter(photo => {
    const matchCat = activeCategory === 'all' || photo.category === activeCategory;
    const matchSearch = searchQuery
      ? photo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        photo.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        photo.detectedObjects?.some((o: string) => o.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
    return matchCat && matchSearch;
  });

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 28, paddingBottom: 48, fontFamily: 'Inter, sans-serif' }}>

      {/* Header */}
      <div style={{ borderBottom: '1px solid #E2E0D8', paddingBottom: 24 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap' as const, justifyContent: 'space-between', alignItems: 'flex-end', gap: 16 }}>
          <div>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#5B5CE2', display: 'block', marginBottom: 8, fontFamily: 'Inter, sans-serif' }}>Visual Memory Archive</span>
            <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 'clamp(1.7rem, 4vw, 2.6rem)', color: '#1A1B1F', lineHeight: 1.08, letterSpacing: '-0.02em', marginBottom: 8 }}>
              Moments & Captures
            </h1>
            <p style={{ fontSize: 12, color: '#5C5E66', lineHeight: 1.7, maxWidth: 440 }}>
              Every photograph is connected to a life chapter, companion, place, and booking record.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #E2E0D8', borderRadius: 999, padding: '7px 14px', width: 220 }}>
            <Search size={13} style={{ color: '#9B9DA4', flexShrink: 0 }} />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search moments, places…"
              style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 12, color: '#1A1B1F', outline: 'none', fontFamily: 'Inter, sans-serif' }}
            />
          </div>
        </div>

        {/* Category chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6, marginTop: 16 }}>
          {CATS.map(cat => {
            const active = activeCategory === cat.id;
            return (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)} style={{
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

      {/* Masonry Grid */}
      <div style={{ columns: '280px', columnGap: 14 }}>
        <AnimatePresence>
          {filtered.map((photo, idx) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: idx * 0.04 }}
              onClick={() => setViewPhoto(photo)}
              style={{
                breakInside: 'avoid',
                marginBottom: 14,
                borderRadius: 14,
                overflow: 'hidden',
                position: 'relative',
                cursor: 'pointer',
                background: '#fff',
                border: '1px solid #E2E0D8',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-2px)'; el.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(0)'; el.style.boxShadow = 'none'; }}
            >
              <img
                src={photo.imageUrl}
                alt={photo.title}
                style={{ width: '100%', display: 'block', objectFit: 'cover' }}
              />
              {/* Hover overlay */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(26,27,31,0.72) 0%, transparent 55%)',
                display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                padding: '14px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                  <MapPin size={9} style={{ color: 'rgba(255,255,255,0.7)' }} />
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>{photo.location}</span>
                </div>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#fff', fontFamily: 'DM Serif Display, serif', lineHeight: 1.2 }}>{photo.title}</p>
                {photo.connectedMemoryId && (
                  <span style={{ fontSize: 9, color: 'rgba(212,212,255,0.9)', fontFamily: 'Inter, sans-serif', marginTop: 4 }}>
                    Linked to memory
                  </span>
                )}
              </div>

              {/* Date badge */}
              <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(255,255,255,0.9)', borderRadius: 6, padding: '2px 7px', fontSize: 9, fontFamily: 'JetBrains Mono, monospace', color: '#5C5E66' }}>
                {photo.date}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div style={{ background: '#fff', border: '1px solid #E2E0D8', borderRadius: 16, padding: '48px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <Camera size={28} style={{ color: '#9B9DA4' }} />
            <p style={{ fontFamily: 'DM Serif Display, serif', fontSize: 16, color: '#1A1B1F' }}>No moments found</p>
            <p style={{ fontSize: 11, color: '#9B9DA4' }}>No photo captures match your search.</p>
          </div>
        )}
      </div>

      {/* Photo Lightbox */}
      <AnimatePresence>
        {viewPhoto && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setViewPhoto(null)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(26,27,31,0.85)', backdropFilter: 'blur(10px)' }} />

            <motion.div
              initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 200, damping: 24 }}
              style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 700, background: '#fff', borderRadius: 20, overflow: 'hidden' }}
            >
              <img src={viewPhoto.imageUrl} alt={viewPhoto.title} style={{ width: '100%', maxHeight: '65vh', objectFit: 'cover' }} />
              <button onClick={() => setViewPhoto(null)} style={{ position: 'absolute', top: 14, right: 14, width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={14} style={{ color: '#1A1B1F' }} />
              </button>

              <div style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' as const, gap: 12 }}>
                  <div>
                    <p style={{ fontFamily: 'DM Serif Display, serif', fontSize: 18, color: '#1A1B1F', marginBottom: 4 }}>{viewPhoto.title}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, color: '#9B9DA4', fontFamily: 'JetBrains Mono, monospace' }}>
                      <span>{viewPhoto.date}</span>
                      <span>·</span>
                      <MapPin size={9} />
                      <span>{viewPhoto.location}</span>
                    </div>
                  </div>
                  {viewPhoto.exif && (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
                      {Object.entries(viewPhoto.exif).map(([k, v]) => (
                        <span key={k} style={{ fontSize: 9, background: '#F8F7F4', border: '1px solid #E2E0D8', borderRadius: 6, padding: '2px 7px', color: '#5C5E66', fontFamily: 'JetBrains Mono, monospace' }}>
                          {k}: {v as string}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {viewPhoto.people && viewPhoto.people.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#9B9DA4', marginBottom: 6, fontFamily: 'Inter, sans-serif' }}>People</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 5 }}>
                      {viewPhoto.people.map((p: string) => (
                        <span key={p} style={{ padding: '3px 9px', background: '#EEEEFF', color: '#5B5CE2', borderRadius: 999, fontSize: 10, fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>{p}</span>
                      ))}
                    </div>
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
