'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface LSModalProps {
  isOpen: boolean;
  onClose: () => void;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: number;
}

/**
 * LSModal — LifeSphere's single reliable modal/sheet primitive.
 *
 * Architecture (flex column):
 *   Panel (bounded max-height, NO overflow on panel itself)
 *     Header  → flexShrink: 0  →  ALWAYS visible
 *     Body    → flex: 1, overflowY: auto  →  ONLY this scrolls
 *     Footer  → flexShrink: 0  →  ALWAYS visible
 *
 * Desktop: centered, max-width configurable (default 560px).
 * Mobile : bottom sheet, 100% width, max-height 92dvh, rounded top.
 * Portal : renders into document.body to escape parent overflow constraints.
 */
export default function LSModal({
  isOpen,
  onClose,
  eyebrow,
  title,
  subtitle,
  footer,
  children,
  maxWidth = 560,
}: LSModalProps) {
  const bodyRef = useRef<HTMLDivElement>(null);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (typeof window === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          {/* Backdrop */}
          <motion.div
            key="ls-modal-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{
              position: 'absolute', inset: 0,
              background: 'rgba(23, 24, 28, 0.45)',
              backdropFilter: 'blur(4px)',
            }}
            onClick={onClose}
            aria-hidden
          />

          {/* Panel */}
          <motion.div
            key="ls-modal-panel"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260, mass: 0.85 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            style={{
              position: 'relative', zIndex: 1,
              width: '100%', maxWidth,
              // CRITICAL: flex column — header/footer never scroll
              display: 'flex', flexDirection: 'column',
              // Panel is height-bounded — NOT the scrollable body
              maxHeight: '92dvh',
              // Appearance
              background: '#FFFFFF',
              borderRadius: '20px 20px 0 0',
              borderTop: '1px solid #E5E3DC',
              borderLeft: '1px solid #E5E3DC',
              borderRight: '1px solid #E5E3DC',
              boxShadow: '0 -8px 40px rgba(23,24,28,0.12)',
              overflow: 'hidden',
            }}
          >
            {/* Mobile drag handle */}
            <div style={{
              width: 36, height: 4, background: '#E5E3DC',
              borderRadius: 9999, margin: '10px auto 0', flexShrink: 0,
            }} className="sm:hidden" />

            {/* ── HEADER — always visible ── */}
            <div style={{
              flexShrink: 0,
              padding: '16px 24px 14px',
              borderBottom: '1px solid #F0EFEA',
              display: 'flex', alignItems: 'flex-start',
              justifyContent: 'space-between', gap: 12,
            }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                {eyebrow && (
                  <span style={{
                    display: 'block', fontSize: 10, fontWeight: 700,
                    letterSpacing: '0.12em', textTransform: 'uppercase',
                    color: '#5B5CE2', marginBottom: 4, fontFamily: 'Inter, sans-serif',
                  }}>{eyebrow}</span>
                )}
                <h3 style={{
                  fontFamily: 'DM Serif Display, serif', fontSize: 18,
                  color: '#17181C', lineHeight: 1.25, marginBottom: subtitle ? 5 : 0,
                }}>{title}</h3>
                {subtitle && (
                  <p style={{
                    fontSize: 12, color: '#6B6D73', lineHeight: 1.55,
                    fontFamily: 'Inter, sans-serif',
                  }}>{subtitle}</p>
                )}
              </div>
              <button
                onClick={onClose}
                aria-label="Close modal"
                style={{
                  flexShrink: 0, width: 32, height: 32, borderRadius: '50%',
                  background: '#F7F6F2', border: '1px solid #E5E3DC',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#6B6D73', transition: 'all 0.12s ease',
                  marginTop: 2,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#F0EFEA'; e.currentTarget.style.color = '#17181C'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#F7F6F2'; e.currentTarget.style.color = '#6B6D73'; }}
              >
                <X size={15} />
              </button>
            </div>

            {/* ── BODY — ONLY THIS SCROLLS ── */}
            <div
              ref={bodyRef}
              style={{
                flex: 1, overflowY: 'auto', overflowX: 'hidden',
                padding: '20px 24px',
                WebkitOverflowScrolling: 'touch' as React.CSSProperties['WebkitOverflowScrolling'],
              }}
            >
              {children}
            </div>

            {/* ── FOOTER — always visible ── */}
            {footer && (
              <div style={{
                flexShrink: 0,
                padding: '14px 24px',
                paddingBottom: 'max(14px, env(safe-area-inset-bottom))',
                borderTop: '1px solid #F0EFEA',
                background: '#FFFFFF',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
