'use client';

import React from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import AppShell from '@/components/layout/AppShell';
import { LoadingIndicator } from '@/components/ui/HudElements';

const DocumentsVault = dynamic(() => import('@/components/documents/DocumentsVault'), {
  ssr: false,
  loading: () => <LoadingIndicator label="SECURE_DOCUMENT_VAULT_OPENING..." />
});

export default function DocumentsPage() {
  return (
    <AppShell activeTab="documents" setActiveTab={() => {}}>
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 180, damping: 24 }}
        className="w-full h-full relative"
      >
        <DocumentsVault />
      </motion.div>
    </AppShell>
  );
}
