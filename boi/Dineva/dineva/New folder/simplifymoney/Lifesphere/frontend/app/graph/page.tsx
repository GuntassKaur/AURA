'use client';

import React from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import AppShell from '@/components/layout/AppShell';
import { LoadingIndicator } from '@/components/ui/HudElements';

const MemoryGraph = dynamic(() => import('@/components/graph/MemoryGraph'), {
  ssr: false,
  loading: () => <LoadingIndicator label="COMPUTING_CONSTELLATION_VECTORS..." />
});

export default function GraphPage() {
  return (
    <AppShell activeTab="graph" setActiveTab={() => {}}>
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 180, damping: 24 }}
        className="w-full h-full relative"
      >
        <MemoryGraph />
      </motion.div>
    </AppShell>
  );
}
