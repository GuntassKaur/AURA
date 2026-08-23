'use client';

import React from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import AppShell from '@/components/layout/AppShell';
import { LoadingIndicator } from '@/components/ui/HudElements';

const LifeStream = dynamic(() => import('@/components/timeline/LifeStream'), {
  ssr: false,
  loading: () => <LoadingIndicator label="CACHING_CHRONOLOGICAL_STREAM..." />
});

export default function TimelinePage() {
  return (
    <AppShell activeTab="timeline" setActiveTab={() => {}}>
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 180, damping: 24 }}
        className="w-full h-full relative"
      >
        <LifeStream />
      </motion.div>
    </AppShell>
  );
}
