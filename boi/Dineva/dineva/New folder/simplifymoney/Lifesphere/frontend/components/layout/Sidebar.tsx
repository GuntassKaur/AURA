'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, Sparkles, Image as ImageIcon, FileText,
  Calendar, CreditCard, TrendingUp, Network,
  Search, Plus, User, Users
} from 'lucide-react';
import { useSearchStore } from '@/store/useSearchStore';
import { useOrbitStore } from '@/store/useOrbitStore';
import AddActionSheet from '../common/AddActionSheet';

const NAV = [
  { label: 'Home',          href: '/dashboard',     icon: Home },
  { label: 'Memories',      href: '/timeline',      icon: Sparkles },
  { label: 'Photos',        href: '/photos',        icon: ImageIcon },
  { label: 'Documents',     href: '/documents',     icon: FileText },
  { label: 'Upcoming',      href: '/upcoming',      icon: Calendar },
  { label: 'Subscriptions', href: '/subscriptions', icon: CreditCard },
  { label: 'Circles',       href: '/circles',       icon: Users },
  { label: 'Insights',      href: '/analytics',     icon: TrendingUp },
  { label: 'Memory Map',    href: '/graph',         icon: Network },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { openSearch } = useSearchStore();
  const { setIsOpen: setOrbitOpen } = useOrbitStore();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname.startsWith(href));

  return (
    <>
      {/* ══ DESKTOP SIDEBAR (Strictly hidden on mobile via .ls-sidebar) ════ */}
      <aside className="ls-sidebar">
        <div style={{ padding: '24px 20px 16px' }}>
          {/* Logo & Brand */}
          <Link href="/dashboard" style={{ textDecoration: 'none', display: 'block', marginBottom: 24 }}>
            <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 19, color: '#17181C', letterSpacing: '-0.01em', lineHeight: 1.1 }}>
              LifeSphere
            </div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9A9C9F', marginTop: 4 }}>
              Personal Life OS
            </div>
          </Link>

          {/* Compact + Add Action */}
          <button
            onClick={() => setIsAddOpen(true)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '9px 14px',
              background: '#17181C',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              marginBottom: 24,
              fontFamily: 'Inter, sans-serif',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#5B5CE2')}
            onMouseLeave={e => (e.currentTarget.style.background = '#17181C')}
          >
            <Plus size={14} />
            <span>Add to LifeSphere</span>
          </button>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9A9C9F', padding: '0 8px', marginBottom: 8, fontFamily: 'Inter, sans-serif' }}>
              Navigation
            </div>

            {NAV.map(item => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 11,
                    padding: '8px 10px',
                    borderRadius: 8,
                    background: active ? '#F2F0E9' : 'transparent',
                    color: active ? '#17181C' : '#5C5E66',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 13,
                    fontWeight: active ? 600 : 500,
                    textDecoration: 'none',
                    transition: 'all 0.12s ease',
                  }}
                  onMouseEnter={e => {
                    if (!active) {
                      e.currentTarget.style.background = '#F8F7F4';
                      e.currentTarget.style.color = '#17181C';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!active) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#5C5E66';
                    }
                  }}
                >
                  <Icon size={15} style={{ color: active ? '#5B5CE2' : '#9A9C9F', flexShrink: 0 }} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Utility Bar */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid #E5E3DC', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button
            onClick={openSearch}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 10px',
              background: '#F8F7F4',
              border: '1px solid #E5E3DC',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 500,
              color: '#5C5E66',
              cursor: 'pointer',
              width: '100%',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Search size={13} style={{ color: '#9A9C9F' }} />
              <span>Search</span>
            </div>
            <kbd style={{ fontSize: 10, fontFamily: 'JetBrains Mono, monospace', background: '#FFFFFF', border: '1px solid #E5E3DC', borderRadius: 4, padding: '1px 5px', color: '#9A9C9F' }}>⌘K</kbd>
          </button>

          <button
            onClick={() => setOrbitOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 10px',
              background: 'transparent',
              border: 'none',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 500,
              color: '#5C5E66',
              cursor: 'pointer',
              width: '100%',
              fontFamily: 'Inter, sans-serif',
              textAlign: 'left',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#EEEEFF'; e.currentTarget.style.color = '#5B5CE2'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#5C5E66'; }}
          >
            <Sparkles size={14} style={{ color: '#5B5CE2' }} />
            <span>Ask Orbit</span>
          </button>
        </div>
      </aside>

      {/* ══ MOBILE BOTTOM DOCK (Strictly hidden on desktop via .ls-mobile-dock) ════ */}
      <nav className="ls-mobile-dock">
        {[
          { href: '/dashboard', icon: Home, label: 'Home' },
          { href: '/timeline', icon: Sparkles, label: 'Memories' },
          null, // Centered floating Add button
          { href: '/photos', icon: ImageIcon, label: 'Photos' },
          { href: '/analytics', icon: User, label: 'You' },
        ].map((item, i) => {
          if (!item) {
            return (
              <button
                key="add-btn"
                onClick={() => setIsAddOpen(true)}
                aria-label="Add to LifeSphere"
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: '50%',
                  background: '#17181C',
                  color: '#FFFFFF',
                  border: '3px solid #F8F7F4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  marginTop: -20,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  flexShrink: 0,
                }}
              >
                <Plus size={20} />
              </button>
            );
          }

          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
                padding: '4px 10px',
                borderRadius: 8,
                textDecoration: 'none',
                color: active ? '#5B5CE2' : '#9A9C9F',
                minWidth: 44,
                minHeight: 44,
                justifyContent: 'center',
              }}
            >
              <Icon size={19} />
              <span style={{ fontSize: 10, fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Global Add Sheet */}
      <AddActionSheet isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
    </>
  );
}
