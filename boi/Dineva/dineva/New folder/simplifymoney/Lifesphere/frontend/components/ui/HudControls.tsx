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
  const activeVariant = variant === 'cyan' ? 'primary' : variant === 'magenta' ? 'secondary' : variant;

  const styles: Record<string, string> = {
    primary: 'bg-[#5B5CE2] hover:bg-[#4A4BC9] text-white border-transparent shadow-xs',
    secondary: 'bg-[#FFFFFF] border-[#E5E3DC] hover:bg-[#F0EFEA] text-[#17181C]',
    amber: 'bg-[#FFF2D9] border-[#E9A23B]/30 text-[#E9A23B] hover:bg-[#FFE8BD]',
    ghost: 'bg-transparent border-transparent hover:bg-[#F0EFEA] text-[#6B6D73] hover:text-[#17181C]',
    cyan: 'bg-[#5B5CE2] hover:bg-[#4A4BC9] text-white border-transparent',
    magenta: 'bg-[#FFFFFF] border-[#E5E3DC] text-[#17181C]',
  };

  const { onClick, disabled, type } = props;

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      type={type}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={`px-4 py-2 border font-sans text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer ${styles[activeVariant] || styles.primary} ${className}`}
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
    <div className={`bg-[#FFFFFF] border border-[#E5E3DC] rounded-2xl overflow-hidden relative shadow-xs ${className}`}>
      {(title || tag) && (
        <div className="px-5 py-3.5 border-b border-[#E5E3DC] flex items-center justify-between font-sans text-xs font-semibold text-[#6B6D73]">
          {title && <span className="text-[#17181C] tracking-tight">{title}</span>}
          {tag && <span className="text-[#5B5CE2] text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#E8E7FF] border border-[#5B5CE2]/20">{tag}</span>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}

