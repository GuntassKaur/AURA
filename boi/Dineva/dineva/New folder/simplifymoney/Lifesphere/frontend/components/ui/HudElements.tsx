'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ElementProps {
  children?: React.ReactNode;
  className?: string;
}

export function GlassSurface({ children, className = '' }: ElementProps) {
  return (
    <div className={`backdrop-blur-xl bg-bg-surface/80 border border-white/[0.08] rounded-2xl shadow-xl ${className}`}>
      {children}
    </div>
  );
}

export function GradientBorder({ children, className = '', color = 'indigo' }: ElementProps & { color?: 'indigo' | 'amber' | 'emerald' | 'rose' }) {
  const gradients = {
    indigo: 'from-accent-primary/30 via-transparent to-accent-primary/10',
    amber: 'from-accent-warm/30 via-transparent to-accent-warm/10',
    emerald: 'from-accent-success/30 via-transparent to-accent-success/10',
    rose: 'from-accent-rose/30 via-transparent to-accent-rose/10',
  };

  return (
    <div className={`relative p-[1px] rounded-2xl overflow-hidden group ${className}`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${gradients[color]} opacity-40 group-hover:opacity-100 transition-opacity duration-500`} />
      <div className="relative rounded-[15px] bg-bg-secondary overflow-hidden w-full h-full">
        {children}
      </div>
    </div>
  );
}

export function LoadingIndicator({ label = 'Connecting your memories...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 text-xs font-medium tracking-wide text-text-secondary">
      <div className="relative w-10 h-10">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 border-2 border-accent-primary/20 border-t-accent-primary rounded-full"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 2.0, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-2 border border-accent-warm/20 border-b-accent-warm rounded-full"
        />
      </div>
      <div className="animate-pulse text-text-secondary">{label}</div>
    </div>
  );
}

export function HudSkeleton({ className = 'h-16 w-full' }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-xl bg-white/[0.03] border border-white/[0.05] ${className}`}>
      <motion.div
        animate={{
          x: ['-100%', '100%']
        }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
          ease: 'easeInOut'
        }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent w-full h-full"
      />
    </div>
  );
}
