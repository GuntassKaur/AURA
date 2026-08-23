'use client';

import React from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import AppShell from '@/components/layout/AppShell';
import { LoadingIndicator } from '@/components/ui/HudElements';

const PhotosVault = dynamic(() => import('@/components/photos/PhotosVault'), {
  ssr: false,
  loading: () => <LoadingIndicator label="MOUNTING_IMAGE_INTELLIGENCE_LAYERS..." />
});

export default function PhotosPage() {
  return (
    <AppShell activeTab="photos" setActiveTab={() => {}}>
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 180, damping: 24 }}
        className="w-full h-full relative"
      >
        <PhotosVault />
      </motion.div>
    </AppShell>
  );
}
