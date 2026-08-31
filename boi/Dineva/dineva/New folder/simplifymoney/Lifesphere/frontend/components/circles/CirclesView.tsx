'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Lock, Plus, Image as ImageIcon, FileText,
  CreditCard, Shield, ArrowRight, Check, MapPin,
  Share2, MessageSquare, Clock, UserPlus, Sparkles
} from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useLifeDataStore, LifeCircle } from '@/store/useLifeDataStore';

export default function CirclesView() {
  const { addNotification } = useNotificationStore();
  const { circles, addCircle, memories, photos, documents } = useLifeDataStore();
  const [selectedCircle, setSelectedCircle] = useState<LifeCircle | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (circles.length > 0 && !selectedCircle) {
      setSelectedCircle(circles[1] || circles[0]);
    }
  }, [circles, selectedCircle]);

  const [newCircleName, setNewCircleName] = useState('');
  const [newCircleCategory, setNewCircleCategory] = useState<'Family' | 'Travel' | 'College'>('Travel');
  const [newCircleDesc, setNewCircleDesc] = useState('');

  const handleCreateCircle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCircleName.trim()) return;

    const newId = addCircle({
      name: newCircleName,
      description: newCircleDesc || 'Collaborative life memory space.',
      category: newCircleCategory,
      privacy: 'Circle Members',
      members: [
        { name: 'Guntass (You)', avatar: 'GK', role: 'Admin' },
        { name: 'Aman', avatar: 'AK', role: 'Member' }
      ],
      connectedMemories: ['Newly created collective journey'],
      sharedCounts: { photos: 0, expenses: '₹0', documents: 0 }
    });

    const newC = useLifeDataStore.getState().circles.find(c => c.id === newId);
    if (newC) {
      setSelectedCircle(newC);
    }

    setIsCreating(false);
    setNewCircleName('');
    setNewCircleDesc('');

    addNotification({
      type: 'success',
      title: 'Life Circle Created',
      message: `"${newCircleName}" is ready for shared memories and expense pools.`,
      duration: 4000
    });
  };

  const handleInvite = (circleName: string) => {
    addNotification({
      type: 'reminder',
      title: 'Invite Link Generated',
      message: `Private link for ${circleName} copied to clipboard.`,
      duration: 3500
    });
  };

  return (
    <AppShell activeTab="circles">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 32, fontFamily: 'Inter, sans-serif' }}
      >

        {/* ══ 1. HEADER: SOCIAL LIFE SPACES ══════════════════════ */}
        <div style={{ display: 'flex', flexWrap: 'wrap' as const, justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, borderBottom: '1px solid #E5E3DC', paddingBottom: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#5B5CE2', marginBottom: 4 }}>
              <Users size={13} />
              <span>Shared Life Spaces</span>
            </div>
            <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', color: '#17181C', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
              Life Circles
            </h1>
            <p style={{ fontSize: 13, color: '#5C5E66', marginTop: 4, maxWidth: 520, lineHeight: 1.6 }}>
              Selective collaboration for family and travel. Memories, split expenses and photo pools stay shared — private passports and bills stay in your vault.
            </p>
          </div>

          <button
            onClick={() => setIsCreating(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '9px 18px',
              background: '#17181C',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#5B5CE2')}
            onMouseLeave={e => (e.currentTarget.style.background = '#17181C')}
          >
            <Plus size={14} />
            <span>Create New Circle</span>
          </button>
        </div>

        {/* ══ CREATE CIRCLE MODAL ═════════════════════════════════ */}
        <AnimatePresence>
          {isCreating && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ background: '#FFFFFF', border: '1px solid #E5E3DC', borderRadius: 16, padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F2F0E9', paddingBottom: 10 }}>
                <h3 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 16, color: '#17181C' }}>New Shared Life Circle</h3>
                <button onClick={() => setIsCreating(false)} style={{ fontSize: 11, color: '#9A9C9F', background: 'none', border: 'none', cursor: 'pointer' }}>Cancel</button>
              </div>

              <form onSubmit={handleCreateCircle} style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                  <div>
                    <label style={{ fontWeight: 600, color: '#17181C', display: 'block', marginBottom: 4 }}>Circle Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Manali Roadtrip 2026"
                      value={newCircleName}
                      onChange={(e) => setNewCircleName(e.target.value)}
                      style={{ width: '100%', background: '#F8F7F4', border: '1px solid #E5E3DC', borderRadius: 8, padding: '8px 12px', fontSize: 12, outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontWeight: 600, color: '#17181C', display: 'block', marginBottom: 4 }}>Category</label>
                    <select
                      value={newCircleCategory}
                      onChange={(e) => setNewCircleCategory(e.target.value as any)}
                      style={{ width: '100%', background: '#F8F7F4', border: '1px solid #E5E3DC', borderRadius: 8, padding: '8px 12px', fontSize: 12, outline: 'none' }}
                    >
                      <option value="Travel">Travel &amp; Trips</option>
                      <option value="Family">Family &amp; Home</option>
                      <option value="College">College &amp; Friends</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontWeight: 600, color: '#17181C', display: 'block', marginBottom: 4 }}>Description</label>
                  <input
                    type="text"
                    placeholder="e.g., Shared photos, hotel bookings and itinerary splits."
                    value={newCircleDesc}
                    onChange={(e) => setNewCircleDesc(e.target.value)}
                    style={{ width: '100%', background: '#F8F7F4', border: '1px solid #E5E3DC', borderRadius: 8, padding: '8px 12px', fontSize: 12, outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 6 }}>
                  <button type="button" onClick={() => setIsCreating(false)} style={{ padding: '7px 14px', background: '#F8F7F4', border: '1px solid #E5E3DC', borderRadius: 8, cursor: 'pointer' }}>Dismiss</button>
                  <button type="submit" style={{ padding: '7px 16px', background: '#5B5CE2', color: '#FFFFFF', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Create Circle</button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══ 2. CIRCLE SELECTOR RAIL ═════════════════════════════ */}
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
          {circles.map(c => {
            const active = selectedCircle?.id === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCircle(c)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 16px',
                  borderRadius: 12,
                  background: active ? '#FFFFFF' : 'rgba(255,255,255,0.6)',
                  border: `1px solid ${active ? '#5B5CE2' : '#E5E3DC'}`,
                  boxShadow: active ? '0 2px 10px rgba(91,92,226,0.1)' : 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  flexShrink: 0,
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                <div style={{ width: 32, height: 32, borderRadius: 8, background: active ? '#EEEEFF' : '#F2F0E9', color: active ? '#5B5CE2' : '#5C5E66', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>
                  {c.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#17181C' }}>{c.name}</div>
                  <div style={{ fontSize: 10, color: '#9A9C9F', fontFamily: 'JetBrains Mono, monospace' }}>
                    {c.members.length} members · {c.sharedCounts.photos} photos
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* ══ 3. ACTIVE SHARED LIFE SPACE (Immersive Workspace) ═ */}
        {selectedCircle && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

            {/* A. Space Cover & Members Bar */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E5E3DC', borderRadius: 18, overflow: 'hidden' }}>
              {/* Photo Banner */}
              <div style={{ height: 200, position: 'relative', overflow: 'hidden' }}>
                <img
                  src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
                  alt={selectedCircle.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(23,24,28,0.85) 0%, transparent 60%)' }} />

                <div style={{ position: 'absolute', top: 14, left: 14, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.92)', borderRadius: 999, padding: '4px 10px' }}>
                  <Shield size={11} style={{ color: '#2E8B72' }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#2E8B72', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Protected Circle Space</span>
                </div>

                <div style={{ position: 'absolute', bottom: 16, left: 20, right: 20, color: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap' as const, gap: 12 }}>
                  <div>
                    <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.85 }}>
                      {selectedCircle.category} Collective
                    </span>
                    <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', lineHeight: 1.1 }}>
                      {selectedCircle.name}
                    </h2>
                  </div>

                  <button
                    onClick={() => handleInvite(selectedCircle.name)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 14px',
                      background: '#FFFFFF',
                      color: '#17181C',
                      border: 'none',
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    }}
                  >
                    <UserPlus size={13} />
                    <span>Invite Member</span>
                  </button>
                </div>
              </div>

              {/* Members & Privacy Explanation Row */}
              <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' as const, gap: 12, borderBottom: '1px solid #F2F0E9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' as const }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#9A9C9F', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Members:</span>
                  {selectedCircle.members.map((m, idx) => (
                    <div key={`member-${m.name}-${m.role}`} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#F8F7F4', border: '1px solid #E5E3DC', borderRadius: 999, padding: '3px 10px', fontSize: 11, fontWeight: 600, color: '#17181C' }}>
                      <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#5B5CE2', color: '#fff', fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                        {m.avatar}
                      </span>
                      <span>{m.name}</span>
                      {m.role === 'Admin' && <span style={{ fontSize: 9, color: '#9A9C9F', fontFamily: 'JetBrains Mono, monospace' }}>(Admin)</span>}
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#6B6D73' }}>
                  <Lock size={12} style={{ color: '#D4922A' }} />
                  <span>Personal IDs &amp; banking documents remain in private vault</span>
                </div>
              </div>
            </div>

            {/* B. 3-Way Grid: Shared Memories Strip + Shared Expenses Pool + Shared Documents */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
              
              {/* Shared Moments & Photos */}
              <div style={{ background: '#FFFFFF', border: '1px solid #E5E3DC', borderRadius: 16, padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ImageIcon size={14} style={{ color: '#5B5CE2' }} />
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#17181C' }}>
                      Shared Moments ({selectedCircle.sharedCounts.photos})
                    </span>
                  </div>
                  <span style={{ fontSize: 10, color: '#9A9C9F', fontFamily: 'JetBrains Mono, monospace' }}>Synced 2h ago</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {[
                    { img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80', title: 'Vagator Sunset' },
                    { img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=400&q=80', title: 'Beach Dinner' },
                    { img: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=400&q=80', title: 'Baga Road' }
                  ].map((p) => (
                    <div key={`circle-moment-${p.title}`} style={{ height: 90, borderRadius: 8, overflow: 'hidden', position: 'relative' }}>
                      <img src={p.img} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', bottom: 4, left: 4, right: 4, background: 'rgba(23,24,28,0.7)', borderRadius: 4, padding: '2px 4px', fontSize: 8, color: '#fff', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.title}
                      </div>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 11, color: '#6B6D73', lineHeight: 1.5 }}>
                  All members have contributed high-resolution memories from this collective chapter.
                </p>
              </div>

              {/* Shared Expenses Pool */}
              <div style={{ background: '#FFFFFF', border: '1px solid #E5E3DC', borderRadius: 16, padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CreditCard size={14} style={{ color: '#2E8B72' }} />
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#17181C' }}>
                      Shared Expense Pool
                    </span>
                  </div>
                  <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: 16, color: '#17181C' }}>{selectedCircle.sharedCounts.expenses}</span>
                </div>

                <div style={{ background: '#F8F7F4', border: '1px solid #E5E3DC', borderRadius: 10, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[
                    { label: 'Taj Exotica Accommodation', amt: '₹8,200', paidBy: 'Guntass' },
                    { label: 'IndiGo Group Flights', amt: '₹3,800', paidBy: 'Aman' },
                    { label: 'Beachside Dining & Cafe', amt: '₹4,100', paidBy: 'Rhea' },
                    { label: 'Scooter Rental & Fuel', amt: '₹2,300', paidBy: 'Guntass' }
                  ].map((exp) => (
                    <div key={`circle-exp-${exp.label}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11 }}>
                      <div style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <span style={{ fontWeight: 600, color: '#17181C' }}>{exp.label}</span>
                        <span style={{ fontSize: 9, color: '#9A9C9F', marginLeft: 6 }}>Paid by {exp.paidBy}</span>
                      </div>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: '#17181C', flexShrink: 0 }}>{exp.amt}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* C. Live Circle Activity Stream */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E5E3DC', borderRadius: 16, padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <Clock size={13} style={{ color: '#5B5CE2' }} />
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#17181C' }}>
                  Recent Circle Activity
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { user: 'Aman', action: 'added 4 photos from Baga Beach', time: '2 hours ago' },
                  { user: 'Rhea', action: 'logged ₹1,200 dinner at Curlies Beach Shack', time: 'Yesterday' },
                  { user: 'Guntass (You)', action: 'linked Taj Exotica booking voucher PDF', time: '3 days ago' }
                ].map((act) => (
                  <div key={`circle-act-${act.user}-${act.time}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#F8F7F4', borderRadius: 8, fontSize: 12 }}>
                    <div>
                      <strong style={{ color: '#17181C' }}>{act.user}</strong>{' '}
                      <span style={{ color: '#5C5E66' }}>{act.action}</span>
                    </div>
                    <span style={{ fontSize: 10, color: '#9A9C9F', fontFamily: 'JetBrains Mono, monospace' }}>{act.time}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </motion.div>
    </AppShell>
  );
}
