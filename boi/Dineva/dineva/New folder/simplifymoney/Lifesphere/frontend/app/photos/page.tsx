'use client';

import React from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import AppShell from '@/components/layout/AppShell';

const PhotosVault = dynamic(() => import('@/components/photos/PhotosVault'), {
  ssr: false,
  loading: () => (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-xs text-[#6B6D73]">
        <div className="w-8 h-8 border-2 border-[#5B5CE2]/20 border-t-[#5B5CE2] rounded-full animate-spin" />
        <span className="font-medium">Loading photos...</span>
      </div>
    </div>
  )
});

export default function PhotosPage() {
  return (
    <AppShell activeTab="photos">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="w-full min-w-0"
      >
        <PhotosVault />
      </motion.div>
    </AppShell>
  );
}
