'use client';

import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import SearchOverlay from './SearchOverlay';
import NotificationCenter from '../ui/NotificationCenter';
import Spotlight from './Spotlight';

interface AppShellProps {
  children: React.ReactNode;
  activeTab?: string;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="ls-shell-wrapper">
      {/* 1. Desktop Sidebar + Mobile Bottom Dock */}
      <Sidebar />

      {/* 2. Top utility bar */}
      <TopBar hasSidebar={true} />

      {/* 3. Main content viewport — offset by 240px on desktop, 0 on mobile */}
      <div className="ls-main-viewport">
        <main style={{
          width: '100%',
          maxWidth: 1080,
          margin: '0 auto',
          padding: '32px 24px',
          boxSizing: 'border-box',
        }}>
          {children}
        </main>
      </div>

      {/* 4. Global overlays */}
      <NotificationCenter />
      <SearchOverlay onNavigate={() => {}} />
      <Spotlight />
    </div>
  );
}
