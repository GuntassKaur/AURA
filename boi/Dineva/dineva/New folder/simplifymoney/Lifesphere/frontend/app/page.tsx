'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardPage from './dashboard/page';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Immediately replace URL to /dashboard for consistency
    router.replace('/dashboard');
  }, [router]);

  // Render Dashboard directly so user sees the app immediately with zero flash
  return <DashboardPage />;
}
