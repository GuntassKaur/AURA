'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import BottomDock from './BottomDock';
import TopBar from './TopBar';
import SearchOverlay from './SearchOverlay';
import NotificationCenter from '../ui/NotificationCenter';
import Spotlight from './Spotlight';
import OrbitCore from '../three/OrbitCore';
import { useSearchStore } from '@/store/useSearchStore';

interface AppShellProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab?: (tab: string) => void;
}

export default function AppShell({ children, activeTab }: AppShellProps) {
  const { openSearch } = useSearchStore();
  const router = useRouter();

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-bg-base font-sans text-text-primary selection:bg-accent-primary/20">
      {/* 1. Global Navigation TopBar */}
      <TopBar onSearchClick={openSearch} />

      {/* 2. Page Content Slot with generous clearance for TopBar and BottomDock */}
      <main className="flex-1 flex flex-col relative w-full pt-20 sm:pt-24 pb-32 px-4 sm:px-8 md:px-12 z-10">
        <div className="max-w-7xl mx-auto w-full flex-1">
          {children}
        </div>
      </main>

      {/* 3. Global Notification Stack */}
      <NotificationCenter />

      {/* 4. Global Search & Orbit Spotlight Command Modals */}
      <SearchOverlay onNavigate={(tab) => router.push('/' + tab)} />
      <Spotlight />

      {/* 5. Ambient Fixed Orbit Intelligence Core */}
      <div className="fixed bottom-24 right-6 sm:bottom-28 sm:right-8 w-14 h-14 sm:w-16 sm:h-16 pointer-events-auto z-30 transition-all duration-300">
        <OrbitCore scale={0.75} />
      </div>

      {/* 6. Bottom Floating Navigation Dock */}
      <BottomDock activeTab={activeTab} />
    </div>
  );
}
