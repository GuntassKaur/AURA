import React from 'react';
import '../styles/globals.css';
import { Metadata } from 'next';
import { AuthGuard } from '@/components/auth/AuthGuard';

export const metadata: Metadata = {
  title: 'AEGISNET FI — AI Financial Defense Grid',
  description: 'AI-Powered Financial Threat Containment Command Infrastructure for Bank of India × IIT Hyderabad Hackathon.',
  keywords: 'fraud detection, AI, banking, financial intelligence, Bank of India',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;600;700&family=Outfit:wght@300;400;600;900&family=Inter:wght@300;400;600;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-cyber-bg text-white overflow-x-hidden">
        {/* Global cyber grid overlay */}
        <div className="cyber-overlay" />
        <div className="cyber-scanline" />

        {/* Ambient corner glows */}
        <div className="fixed top-0 left-0 w-[600px] h-[600px] bg-cyan-500/[0.03] rounded-full blur-3xl pointer-events-none z-0" />
        <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/[0.04] rounded-full blur-3xl pointer-events-none z-0" />
        <div className="fixed top-1/2 right-0 w-[300px] h-[300px] bg-red-500/[0.02] rounded-full blur-3xl pointer-events-none z-0" />

        <AuthGuard>
          {children}
        </AuthGuard>
      </body>
    </html>
  );
}
