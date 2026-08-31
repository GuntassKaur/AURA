'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Home, 
  Image as ImageIcon, 
  Plus, 
  Search, 
  User
} from 'lucide-react';
import AddActionSheet from '@/components/common/AddActionSheet';
import { useSearchStore } from '@/store/useSearchStore';

interface BottomDockProps {
  activeTab?: string;
}

export default function BottomDock({ activeTab: propActiveTab }: BottomDockProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { openSearch } = useSearchStore();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', href: '/dashboard', label: 'Home', icon: Home },
    { id: 'timeline', href: '/timeline', label: 'Memories', icon: ImageIcon },
  ];

  const rightNavItems = [
    { id: 'search', action: openSearch, label: 'Search', icon: Search },
    { id: 'profile', href: '/analytics', label: 'You', icon: User },
  ];

  const currentTab = propActiveTab || (pathname === '/dashboard' ? 'dashboard' : pathname.replace('/', ''));

  return (
    <>
      {/* ─── Mobile Bottom Navigation (Matching Reference) ─── */}
      <nav aria-label="Mobile Navigation" className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-[#E5E3DC] px-4 py-2 pb-safe shadow-[0_-4px_24px_rgba(23,24,28,0.06)] font-sans">
        <div className="flex items-center justify-around max-w-md mx-auto relative">
          
          {/* Left Items (Home, Memories) */}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id || (item.id === 'timeline' && pathname === '/timeline');
            return (
              <button
                key={item.id}
                onClick={() => router.push(item.href)}
                className="flex flex-col items-center justify-center py-1 px-3 touch-target-44 cursor-pointer relative"
              >
                <Icon
                  size={20}
                  className={`transition-colors ${
                    isActive ? 'text-[#5B5CE2]' : 'text-[#6B6D73]'
                  }`}
                />
                <span className={`text-[10px] mt-1 font-medium ${
                  isActive ? 'text-[#5B5CE2] font-semibold' : 'text-[#6B6D73]'
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* Center Elevated FAB (+) Button */}
          <div className="relative -top-4 flex items-center justify-center">
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setIsAddOpen(true)}
              className="w-12 h-12 rounded-full bg-[#5B5CE2] text-white flex items-center justify-center shadow-[0_4px_16px_rgba(91,92,226,0.38)] cursor-pointer ring-4 ring-[#F7F6F2]"
              aria-label="Add to LifeSphere"
            >
              <Plus size={22} strokeWidth={2.5} />
            </motion.button>
          </div>

          {/* Right Items (Search, You) */}
          {rightNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === 'profile' && pathname === '/analytics';
            return (
              <button
                key={item.label}
                onClick={() => (item.action ? item.action() : item.href ? router.push(item.href) : null)}
                className="flex flex-col items-center justify-center py-1 px-3 touch-target-44 cursor-pointer"
              >
                <Icon
                  size={20}
                  className={`transition-colors ${
                    isActive ? 'text-[#5B5CE2]' : 'text-[#6B6D73]'
                  }`}
                />
                <span className={`text-[10px] mt-1 font-medium ${
                  isActive ? 'text-[#5B5CE2] font-semibold' : 'text-[#6B6D73]'
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}

        </div>
      </nav>

      {/* Global Add Sheet */}
      <AddActionSheet isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
    </>
  );
}
