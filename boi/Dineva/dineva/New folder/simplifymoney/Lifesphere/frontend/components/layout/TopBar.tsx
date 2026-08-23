'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Sparkles } from 'lucide-react';
import { useOrbitStore } from '@/store/useOrbitStore';
import { motion } from 'framer-motion';

interface TopBarProps {
  onSearchClick: () => void;
}

export default function TopBar({ onSearchClick }: TopBarProps) {
  const { isOpen, setIsOpen } = useOrbitStore();
  const pathname = usePathname();

  const navItems = [
    { label: 'Memories', href: '/dashboard' },
    { label: 'Timeline', href: '/timeline' },
    { label: 'Documents', href: '/documents' },
    { label: 'Photos', href: '/photos' },
    { label: 'Insights', href: '/analytics' },
  ];

  return (
    <header className="fixed top-0 left-0 w-full h-16 border-b border-white/[0.06] backdrop-blur-2xl bg-bg-base/80 z-50 px-6 sm:px-12 flex items-center justify-between font-sans select-none">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        
        {/* LEFT: LifeSphere Brand */}
        <Link href="/" className="flex items-center space-x-2.5 group">
          <div className="w-2.5 h-2.5 rounded-full bg-accent-primary group-hover:scale-125 transition-transform duration-300 shadow-[0_0_12px_rgba(108,111,255,0.5)]" />
          <span className="font-semibold text-base sm:text-lg tracking-tight text-text-primary group-hover:text-text-primary/90 transition-colors">
            LifeSphere
          </span>
        </Link>

        {/* CENTER: Editorial Top Navigation */}
        <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href === '/dashboard' && pathname === '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative py-1 text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? 'text-text-primary font-semibold'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="topbar-active-underline"
                    className="absolute -bottom-1 left-0 right-0 h-[2px] bg-accent-primary rounded-full shadow-[0_0_8px_rgba(108,111,255,0.6)]"
                    transition={{ type: 'spring', stiffness: 220, damping: 26 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* RIGHT: Orbit + Search Actions */}
        <div className="flex items-center space-x-3">
          {/* Orbit AI Trigger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-300 cursor-pointer ${
              isOpen 
                ? 'bg-accent-primary/20 text-text-primary border border-accent-primary/40 shadow-[0_0_16px_rgba(108,111,255,0.25)]' 
                : 'bg-white/[0.04] text-text-primary hover:bg-white/[0.08] border border-white/[0.08]'
            }`}
          >
            <Sparkles size={14} className={isOpen ? 'text-accent-primary animate-pulse' : 'text-text-secondary'} />
            <span>Orbit</span>
          </button>

          {/* Global Search Button */}
          <button
            onClick={onSearchClick}
            className="flex items-center space-x-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] px-3.5 py-1.5 rounded-full text-xs text-text-primary transition-all duration-300 cursor-pointer"
          >
            <Search size={14} className="text-text-secondary" />
            <span className="hidden sm:inline font-medium">Search</span>
            <kbd className="font-mono-meta text-[10px] text-text-secondary bg-white/[0.06] px-1.5 py-0.5 rounded">⌘K</kbd>
          </button>
        </div>

      </div>
    </header>
  );
}
