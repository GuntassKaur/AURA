'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { Sidebar } from '@/components/nav/Sidebar';
import { Shield } from 'lucide-react';

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      if (!isAuthenticated && pathname !== '/login') {
        router.replace('/login');
      } else if (isAuthenticated && pathname === '/login') {
        router.replace('/overview');
      }
    }
  }, [isAuthenticated, pathname, mounted, router]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Shield className="w-12 h-12 text-cyan-900 animate-pulse" />
      </div>
    );
  }

  // If on login page, don't render sidebar
  if (pathname === '/login') {
    return <main className="min-h-screen relative z-10">{children}</main>;
  }

  // If not authenticated and not on login page, render nothing until redirect happens
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Sidebar />
      <main className="ml-[72px] min-h-screen relative z-10">
        {children}
      </main>
    </>
  );
};
