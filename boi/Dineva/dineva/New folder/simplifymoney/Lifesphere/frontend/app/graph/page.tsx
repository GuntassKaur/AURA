'use client';

import React from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import AppShell from '@/components/layout/AppShell';
import { LoadingIndicator } from '@/components/ui/HudElements';

const MemoryGraph = dynamic(() => import('@/components/graph/MemoryGraph'), {
  ssr: false,
  loading: () => <LoadingIndicator label="Loading Memory Map..." />
});

export default function GraphPage() {
  return (
    <AppShell activeTab="graph">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="w-full min-w-0"
      >
        <MemoryGraph />
      </motion.div>
    </AppShell>
  );
}

