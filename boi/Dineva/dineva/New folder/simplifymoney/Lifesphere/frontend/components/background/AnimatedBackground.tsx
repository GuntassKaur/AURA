'use client';

import React from 'react';

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 w-full h-full bg-[#06070A] overflow-hidden pointer-events-none z-0">
      {/* Subtle noise texture layer */}
      <div className="noise-overlay" />

      {/* Faint top-left indigo radial light */}
      <div className="absolute top-[-10%] left-[-5%] w-[45vw] h-[45vw] rounded-full bg-indigo-900/10 blur-[140px]" />

      {/* Extremely faint neutral glow around center */}
      <div className="absolute top-[25%] left-[25%] w-[50vw] h-[50vw] rounded-full bg-white/[0.008] blur-[160px]" />
    </div>
  );
}
