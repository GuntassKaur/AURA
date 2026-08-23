'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, MapPin, Calendar, Sparkles, ZoomIn, ZoomOut } from 'lucide-react';
import { usePhotoStore } from '@/store/usePhotoStore';
import { useOrbitStore } from '@/store/useOrbitStore';

export default function PhotoViewer() {
  const { openedPhoto, setOpenedPhoto } = usePhotoStore();
  const { setIsOpen: setOrbitOpen, sendMessage } = useOrbitStore();
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!openedPhoto) return;
      if (e.key === 'Escape') {
        setOpenedPhoto(null);
        setIsZoomed(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openedPhoto, setOpenedPhoto]);

  const handleQueryInOrbit = (title: string) => {
    setOrbitOpen(true);
    sendMessage(`Analyze photo details and linkages for: ${title}`, () => {});
  };

  return (
    <AnimatePresence>
      {openedPhoto && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-bg-base/95 backdrop-blur-2xl p-4 sm:p-8 flex flex-col justify-between font-sans selection:bg-accent-primary/20"
        >
          {/* Header Bar */}
          <div className="flex justify-between items-center border-b border-white/[0.08] pb-4">
            <div className="flex items-center space-x-3 text-left">
              <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-text-primary">
                <Camera size={18} className="text-accent-primary" />
              </div>
              <div>
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Photo Viewer</span>
                <h2 className="text-base font-semibold text-text-primary mt-0.5">{openedPhoto.title}</h2>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setIsZoomed(!isZoomed)}
                className="p-2.5 rounded-full border border-white/10 bg-white/[0.04] text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                title={isZoomed ? "Zoom Out" : "Zoom In"}
              >
                {isZoomed ? <ZoomOut size={16} /> : <ZoomIn size={16} />}
              </button>

              <button 
                onClick={() => {
                  setOpenedPhoto(null);
                  setIsZoomed(false);
                }}
                className="p-2.5 rounded-full border border-white/10 bg-white/[0.04] text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                title="Close (ESC)"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Canvas & Inspector Grid */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden my-4 items-center">
            
            {/* Main Photography View Canvas */}
            <div className="lg:col-span-8 h-full border border-white/[0.08] rounded-3xl bg-bg-surface overflow-hidden relative flex items-center justify-center p-4">
              <motion.img 
                src={openedPhoto.imageUrl} 
                alt={openedPhoto.title} 
                animate={{ scale: isZoomed ? 1.4 : 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 26 }}
                className="max-h-full max-w-full object-contain rounded-2xl shadow-2xl cursor-pointer" 
                onClick={() => setIsZoomed(!isZoomed)}
              />
            </div>

            {/* Photo Metadata Inspector */}
            <div className="lg:col-span-4 h-full border border-white/[0.08] rounded-3xl bg-bg-surface p-6 flex flex-col justify-between relative overflow-hidden space-y-6 text-left">
              <div className="space-y-6 overflow-y-auto flex-1">
                <div className="text-xs font-semibold text-text-secondary border-b border-white/[0.08] pb-3 uppercase tracking-wide">
                  Camera EXIF & Memory Insight
                </div>

                <div className="space-y-3 font-mono-meta text-xs text-text-secondary">
                  <div className="flex items-center space-x-2">
                    <Camera size={14} className="text-accent-primary" />
                    <span className="text-text-primary">{openedPhoto.exif.camera}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar size={14} className="text-text-secondary" />
                    <span>{openedPhoto.date}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin size={14} className="text-text-secondary" />
                    <span>{openedPhoto.location}</span>
                  </div>
                  <div className="text-text-primary/70 pt-1">
                    {openedPhoto.exif.aperture} · {openedPhoto.exif.exposure} · ISO {openedPhoto.exif.iso}
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                  <div className="text-xs font-semibold text-text-secondary uppercase">Memory Summary</div>
                  <p className="text-xs text-text-primary leading-relaxed p-4 bg-white/[0.02] border border-white/[0.04] rounded-2xl">
                    {openedPhoto.summary}
                  </p>
                </div>

                {openedPhoto.detectedObjects && (
                  <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                    <div className="text-xs font-semibold text-text-secondary uppercase">Detected Entities</div>
                    <div className="flex flex-wrap gap-1.5">
                      {openedPhoto.detectedObjects.map((obj, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-[11px] text-text-primary">
                          {obj}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button 
                onClick={() => handleQueryInOrbit(openedPhoto.title)}
                className="w-full py-3 bg-accent-primary hover:bg-accent-primary/90 text-white font-medium text-xs rounded-full shadow-lg shadow-accent-primary/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Sparkles size={14} className="text-white" />
                <span>Ask Orbit about this photo</span>
              </button>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
