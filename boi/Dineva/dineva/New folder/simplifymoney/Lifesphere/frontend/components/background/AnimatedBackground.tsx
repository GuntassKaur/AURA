'use client';

import React from 'react';

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 w-full h-full bg-[#F7F6F2] overflow-hidden pointer-events-none z-0">
      {/* Subtle noise texture */}
      <div className="noise-overlay opacity-30 mix-blend-overlay" />
      
      {/* Extremely subtle, minimal ambient gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFFFFF] via-[#F7F6F2] to-[#F0EFEA] opacity-50" />
    </div>
  );
}
