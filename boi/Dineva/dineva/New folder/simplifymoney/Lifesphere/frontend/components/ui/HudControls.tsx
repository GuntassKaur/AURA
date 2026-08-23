'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'cyan' | 'magenta' | 'amber' | 'ghost' | 'primary' | 'secondary';
  glow?: boolean;
}

export function HudButton({
  children,
  variant = 'primary',
  glow = false,
  className = '',
  ...props
}: ButtonProps) {
  // Map legacy variant names gracefully to clean design tokens
  const activeVariant = variant === 'cyan' ? 'primary' : variant === 'magenta' ? 'secondary' : variant;

  const styles: Record<string, string> = {
    primary: 'bg-accent-primary hover:bg-accent-primary/90 text-white border-transparent shadow-lg shadow-accent-primary/20',
    secondary: 'bg-bg-elevated border-white/10 hover:border-white/20 text-text-primary hover:bg-white/5',
    amber: 'bg-accent-warm/15 border-accent-warm/30 text-accent-warm hover:bg-accent-warm/25',
    ghost: 'bg-transparent border-transparent hover:bg-white/[0.06] text-text-secondary hover:text-text-primary',
    cyan: 'bg-accent-primary hover:bg-accent-primary/90 text-white border-transparent',
    magenta: 'bg-bg-elevated border-white/10 text-text-primary',
  };

  const { onClick, disabled, type } = props;

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      type={type}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={`px-4 py-2 border font-sans text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer ${styles[activeVariant] || styles.primary} ${glow ? 'shadow-lg shadow-accent-primary/30' : ''} ${className}`}
    >
      {children}
    </motion.button>
  );
}

interface CardProps {
  children: React.ReactNode;
  title?: string;
  tag?: string;
  className?: string;
}

export function HudCard({ children, title, tag, className = '' }: CardProps) {
  return (
    <div className={`backdrop-blur-xl bg-bg-surface/80 border border-white/[0.08] rounded-2xl overflow-hidden relative shadow-lg ${className}`}>
      {(title || tag) && (
        <div className="px-5 py-3.5 border-b border-white/[0.06] flex items-center justify-between font-sans text-xs font-semibold text-text-secondary">
          {title && <span className="text-text-primary tracking-tight">{title}</span>}
          {tag && <span className="text-accent-primary text-[11px] font-medium px-2 py-0.5 rounded-full bg-accent-primary/10 border border-accent-primary/20">{tag}</span>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}
