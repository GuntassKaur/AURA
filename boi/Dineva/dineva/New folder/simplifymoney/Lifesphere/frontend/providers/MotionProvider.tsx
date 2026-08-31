'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { MotionConfig } from 'framer-motion';
import gsap from 'gsap';

const MotionContext = createContext({});

export default function MotionProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Configure GSAP defaults for modern UI animations
    gsap.config({
      force3D: true,
      nullTargetWarn: false
    });
  }, []);

  return (
    <MotionContext.Provider value={{}}>
      <MotionConfig transition={{ type: 'spring', stiffness: 180, damping: 24, mass: 0.8 }}>
        {children}
      </MotionConfig>
    </MotionContext.Provider>
  );
}

export const useMotionContext = () => useContext(MotionContext);
