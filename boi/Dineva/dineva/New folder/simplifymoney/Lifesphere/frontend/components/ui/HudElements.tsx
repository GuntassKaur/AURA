'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ElementProps {
  children?: React.ReactNode;
  className?: string;
}

export function GlassSurface({ children, className = '' }: ElementProps) {
  return (
    <div className={`bg-[#FFFFFF] border border-[#E5E3DC] rounded-2xl shadow-xs ${className}`}>
      {children}
    </div>
  );
}

export function GradientBorder({
  children,
  className = '',
  color = 'indigo'
}: ElementProps & { color?: 'indigo' | 'amber' | 'emerald' | 'rose' }) {
  const borderColors = {
    indigo: 'border-[#5B5CE2]/30',
    amber: 'border-[#E9A23B]/30',
    emerald: 'border-[#3A9D78]/30',
    rose: 'border-[#E98291]/30',
  };

  return (
    <div className={`relative rounded-2xl border ${borderColors[color]} bg-[#FFFFFF] overflow-hidden w-full h-full shadow-xs ${className}`}>
      {children}
    </div>
  );
}

/** Clean loading indicator — no sci-fi copy */
export function LoadingIndicator({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-9 h-9">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 border-2 border-[#5B5CE2]/15 border-t-[#5B5CE2] rounded-full"
          />
        </div>
        <span className="text-xs font-medium text-[#6B6D73]">{label}</span>
      </div>
    </div>
  );
}

/** Skeleton shimmer for content placeholders */
export function HudSkeleton({ className = 'h-16 w-full' }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-xl bg-[#F0EFEA] border border-[#E5E3DC] ${className}`}>
      <motion.div
        animate={{ x: ['-100%', '100%'] }}
        transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFFFFF]/55 to-transparent w-full h-full"
      />
    </div>
  );
}
