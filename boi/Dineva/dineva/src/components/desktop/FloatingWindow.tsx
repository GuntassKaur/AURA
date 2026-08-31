"use client";

import React, { useRef } from "react";
import { motion, useDragControls } from "framer-motion";
import { Minus, Square, X, Maximize2 } from "lucide-react";

interface FloatingWindowProps {
  id: string;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onFocus: () => void;
  zIndex: number;
  defaultPosition?: { x: number; y: number };
  width?: string;
  height?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export default function FloatingWindow({
  id,
  title,
  isOpen,
  isMinimized,
  isMaximized,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  zIndex,
  defaultPosition = { x: 50, y: 80 },
  width = "500px",
  height = "400px",
  icon,
  children,
}: FloatingWindowProps) {
  const dragControls = useDragControls();
  const constraintsRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={isMinimized ? { scale: 0, opacity: 0 } : { scale: 0.95, opacity: 0 }}
      animate={
        isMinimized
          ? { scale: 0.8, opacity: 0, y: 500, pointerEvents: "none" }
          : { scale: 1, opacity: 1, y: 0, pointerEvents: "auto" }
      }
      exit={{ scale: 0.95, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      style={{
        zIndex,
        width: isMaximized ? "100%" : width,
        height: isMaximized ? "calc(100vh - 64px)" : height, // Adjust for taskbar space
        position: "absolute",
        top: isMaximized ? "0" : undefined,
        left: isMaximized ? "0" : undefined,
      }}
      className={`flex flex-col rounded-xl overflow-hidden glass-panel border border-[rgba(255,255,255,0.08)] shadow-[0_20px_50px_rgba(0,0,0,0.5)] focus:outline-none transition-all duration-150 ${
        isMaximized ? "rounded-none border-none" : ""
      }`}
      onPointerDown={onFocus}
      drag={!isMaximized}
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      dragElastic={0.05}
      // Drag boundaries inside the desktop area
      dragConstraints={{ left: -100, right: 800, top: 0, bottom: 500 }}
    >
      {/* Title Bar */}
      <div
        onPointerDown={(e) => {
          onFocus();
          dragControls.start(e);
        }}
        className="flex items-center justify-between px-4 py-3 bg-[rgba(20,18,16,0.8)] border-b border-[rgba(255,255,255,0.05)] cursor-grab active:cursor-grabbing select-none"
      >
        {/* Left Side: Icon & Title */}
        <div className="flex items-center space-x-2.5">
          {icon && <span className="text-[#e2b13c]">{icon}</span>}
          <span className="text-sm font-medium tracking-wide text-stone-200">
            {title}
          </span>
        </div>

        {/* Right Side: Window Control Buttons */}
        <div className="flex items-center space-x-2">
          {/* Minimize */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMinimize();
            }}
            className="p-1 rounded-md text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            title="Minimize"
          >
            <Minus size={13} />
          </button>
          
          {/* Maximize */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMaximize();
            }}
            className="p-1 rounded-md text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            title={isMaximized ? "Restore Down" : "Maximize"}
          >
            {isMaximized ? <Maximize2 size={13} /> : <Square size={11} />}
          </button>

          {/* Close */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1 rounded-md text-stone-400 hover:text-red-400 hover:bg-red-950/40 transition-colors"
            title="Close"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto bg-[rgba(13,12,10,0.45)] text-stone-100 p-4">
        {children}
      </div>
    </motion.div>
  );
}
