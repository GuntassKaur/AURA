'use client';

import React from 'react';
import { Search, Bell, Sparkles } from 'lucide-react';
import { useSearchStore } from '@/store/useSearchStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useOrbitStore } from '@/store/useOrbitStore';
import Link from 'next/link';

interface TopBarProps {
  hasSidebar?: boolean;
}

export default function TopBar({ hasSidebar = false }: TopBarProps) {
  const { openSearch } = useSearchStore();
  const { addNotification } = useNotificationStore();
  const { setIsOpen: setOrbitOpen } = useOrbitStore();

  return (
    <header className="ls-topbar">
      {/* Mobile Brand (hidden when sidebar is visible on desktop) */}
      <Link href="/dashboard" style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        textDecoration: 'none',
      }}>
        <div style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          background: '#17181C',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{ color: '#fff', fontFamily: 'DM Serif Display, serif', fontSize: 15 }}>L</span>
        </div>
        <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: 16, color: '#17181C' }}>LifeSphere</span>
      </Link>

      <div style={{ flex: 1 }} />

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Search */}
        <button
          onClick={openSearch}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: '#FFFFFF',
            border: '1px solid #E5E3DC',
            borderRadius: 999,
            padding: '6px 14px',
            fontSize: 12,
            color: '#5C5E66',
            cursor: 'pointer',
            width: 180,
            justifyContent: 'space-between',
            transition: 'border-color 0.15s ease',
            fontFamily: 'Inter, sans-serif',
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = '#5B5CE2')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = '#E5E3DC')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Search size={13} style={{ color: '#9A9C9F' }} />
            <span>Search life…</span>
          </div>
          <kbd style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', background: '#F8F7F4', border: '1px solid #E5E3DC', borderRadius: 4, padding: '1px 5px', color: '#9A9C9F' }}>⌘K</kbd>
        </button>

        {/* Ask Orbit */}
        <button
          onClick={() => setOrbitOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 999,
            background: '#EEEEFF',
            border: '1px solid #D4D4FF',
            color: '#5B5CE2',
            fontSize: 11,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#5B5CE2'; e.currentTarget.style.color = '#FFFFFF'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#EEEEFF'; e.currentTarget.style.color = '#5B5CE2'; }}
        >
          <Sparkles size={13} />
          <span>Orbit</span>
        </button>

        {/* Notifications Bell */}
        <button
          onClick={() => addNotification({
            type: 'warning',
            title: 'Items for your review',
            message: 'Electricity due tomorrow (₹4,230), Passport renewal window approaching in 18 days.',
            duration: 5000,
          })}
          style={{
            position: 'relative',
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: '#FFFFFF',
            border: '1px solid #E5E3DC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          title="Notifications"
        >
          <Bell size={14} style={{ color: '#17181C' }} />
          <span style={{
            position: 'absolute',
            top: -2,
            right: -2,
            width: 14,
            height: 14,
            background: '#E8808F',
            borderRadius: '50%',
            fontSize: 8,
            fontWeight: 700,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #F8F7F4',
          }}>2</span>
        </button>

        {/* User avatar initial */}
        <div style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: '#F2F0E9',
          border: '1px solid #E5E3DC',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          fontWeight: 700,
          color: '#17181C',
          fontFamily: 'Inter, sans-serif',
        }}>
          G
        </div>
      </div>
    </header>
  );
}
