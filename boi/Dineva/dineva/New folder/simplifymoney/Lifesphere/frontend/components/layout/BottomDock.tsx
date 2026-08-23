'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Clock, 
  Share2, 
  FileText, 
  Image as ImageIcon,
  TrendingUp,
  MessageSquare
} from 'lucide-react';

interface BottomDockProps {
  activeTab?: string;
}

export default function BottomDock({ activeTab: propActiveTab }: BottomDockProps) {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    { id: 'dashboard', href: '/dashboard', label: 'Memories', icon: Sparkles },
    { id: 'timeline', href: '/timeline', label: 'Timeline', icon: Clock },
    { id: 'documents', href: '/documents', label: 'Documents', icon: FileText },
    { id: 'photos', href: '/photos', label: 'Photos', icon: ImageIcon },
    { id: 'analytics', href: '/analytics', label: 'Insights', icon: TrendingUp },
    { id: 'graph', href: '/graph', label: 'Constellation', icon: Share2 },
    { id: 'chat', href: '/chat', label: 'Orbit AI', icon: MessageSquare },
  ];

  const currentTab = propActiveTab || tabs.find(t => pathname === t.href)?.id || 'dashboard';

  return (
    <motion.div 
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 h-14 backdrop-blur-2xl bg-bg-surface/90 border border-white/[0.1] rounded-full flex items-center px-2 sm:px-3 space-x-1 shadow-[0_20px_50px_rgba(0,0,0,0.7)] font-sans max-w-[95vw]"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => router.push(tab.href)}
            className="relative px-2.5 sm:px-3.5 py-2 rounded-full transition-all duration-200 group flex items-center space-x-2 cursor-pointer"
            title={tab.label}
          >
            {isActive && (
              <motion.div
                layoutId="active-bottom-dock-tab"
                className="absolute inset-0 rounded-full bg-accent-primary/15 border border-accent-primary/30"
                transition={{ type: 'spring', stiffness: 220, damping: 26 }}
              />
            )}

            <Icon 
              size={19} 
              className={`relative z-10 transition-colors duration-200 ${
                isActive ? 'text-accent-primary' : 'text-text-secondary group-hover:text-text-primary'
              }`}
            />

            <span className={`hidden md:inline text-xs font-medium relative z-10 transition-colors duration-200 ${
              isActive ? 'text-text-primary font-semibold' : 'text-text-secondary group-hover:text-text-primary'
            }`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </motion.div>
  );
}
