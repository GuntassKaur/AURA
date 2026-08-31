"use client";

import { motion } from "framer-motion";

export default function GlowBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#0d0c0a] pointer-events-none">
      {/* Background radial overlay for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(28,25,23,0.3)_0%,rgba(13,12,10,0.85)_80%)]" />

      {/* Amber/Gold glow spot (Top Left) */}
      <motion.div
        animate={{
          x: [0, 40, -20, 0],
          y: [0, -30, 20, 0],
          scale: [1, 1.15, 0.9, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] max-w-[600px] rounded-full bg-[radial-gradient(circle,rgba(226,177,60,0.15)_0%,rgba(226,177,60,0)_70%)] blur-[80px] opacity-70 animate-glow-pulse"
      />

      {/* Wine/Burgundy glow spot (Bottom Right) */}
      <motion.div
        animate={{
          x: [0, -30, 30, 0],
          y: [0, 40, -20, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-[-15%] right-[-10%] w-[60vw] h-[60vw] max-w-[700px] rounded-full bg-[radial-gradient(circle,rgba(76,17,26,0.25)_0%,rgba(76,17,26,0)_70%)] blur-[90px] opacity-80"
      />

      {/* Warm Orange/Rose glow spot (Center Left) */}
      <motion.div
        animate={{
          x: [0, 50, -30, 0],
          y: [0, 60, -40, 0],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[40%] left-[15%] w-[35vw] h-[35vw] max-w-[450px] rounded-full bg-[radial-gradient(circle,rgba(249,115,22,0.08)_0%,rgba(249,115,22,0)_70%)] blur-[70px] opacity-60"
      />

      {/* Grid overlay to give it a refined tech/OS structure */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35" 
      />
    </div>
  );
}
