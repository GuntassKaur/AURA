'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, MapPin, Sparkles, ZoomIn, ZoomOut, ArrowRight, FileText } from 'lucide-react';
import { usePhotoStore } from '@/store/usePhotoStore';
import { useOrbitStore } from '@/store/useOrbitStore';
import { useLifeDataStore } from '@/store/useLifeDataStore';
import { useDocumentStore } from '@/store/useDocumentStore';
import { useRouter } from 'next/navigation';

export default function PhotoViewer() {
  const router = useRouter();
  const { openedPhoto, setOpenedPhoto } = usePhotoStore();
  const { setIsOpen: setOrbitOpen, sendMessage } = useOrbitStore();
  const { memories, documents } = useLifeDataStore();
  const { setOpenedDoc } = useDocumentStore();
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

  if (!openedPhoto) return null;

  const connectedMemory = openedPhoto.connectedMemoryId
    ? memories.find(m => m.id === openedPhoto.connectedMemoryId)
    : null;

  const connectedDocs = openedPhoto.connectedDocIds
    ? documents.filter(d => openedPhoto.connectedDocIds?.includes(d.id))
    : [];

  const handleQueryInOrbit = (title: string) => {
    setOrbitOpen(true);
    sendMessage(`Analyze photo details and connected memory for: ${title}`, (tab) => router.push('/' + tab));
  };

  const handleOpenDoc = (doc: any) => {
    setOpenedPhoto(null);
    setOpenedDoc(doc);
    router.push('/documents');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-[#F7F6F2]/98 backdrop-blur-xl p-4 sm:p-6 flex flex-col justify-between font-sans text-left"
      >
        {/* Header Bar */}
        <div className="flex justify-between items-center border-b border-[#E5E3DC] pb-3">
          <div className="flex items-center space-x-3 text-left min-w-0 pr-4">
            <div className="p-2 rounded-xl bg-[#E8E7FF] border border-[#5B5CE2]/20 shrink-0">
              <Camera size={16} className="text-[#5B5CE2]" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-[#6B6D73] uppercase tracking-wide">Photo Moment</span>
              <h2 className="text-sm font-serif font-bold text-[#17181C] truncate">{openedPhoto.title}</h2>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button 
              onClick={() => setIsZoomed(!isZoomed)}
              className="p-2 rounded-full border border-[#E5E3DC] bg-[#FFFFFF] text-[#6B6D73] hover:text-[#17181C] transition-colors cursor-pointer"
              title={isZoomed ? "Zoom Out" : "Zoom In"}
            >
              {isZoomed ? <ZoomOut size={15} /> : <ZoomIn size={15} />}
            </button>

            <button 
              onClick={() => {
                setOpenedPhoto(null);
                setIsZoomed(false);
              }}
              className="p-2 rounded-full border border-[#E5E3DC] bg-[#FFFFFF] text-[#6B6D73] hover:text-[#17181C] transition-colors cursor-pointer"
              title="Close (ESC)"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Canvas & Inspector Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden my-3 items-center">
          
          {/* Main Photography Canvas */}
          <div className="lg:col-span-8 h-full border border-[#E5E3DC] rounded-3xl bg-[#FFFFFF] overflow-hidden relative flex items-center justify-center p-4">
            <motion.img 
              src={openedPhoto.imageUrl} 
              alt={openedPhoto.title} 
              animate={{ scale: isZoomed ? 1.4 : 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 26 }}
              className="max-h-full max-w-full object-contain rounded-2xl shadow-xl cursor-pointer" 
              onClick={() => setIsZoomed(!isZoomed)}
            />
          </div>

          {/* Photo Metadata Inspector */}
          <div className="lg:col-span-4 h-full border border-[#E5E3DC] rounded-3xl bg-[#FFFFFF] p-5 flex flex-col justify-between relative overflow-y-auto space-y-5 text-left">
            <div className="space-y-5 flex-1">
              <div className="text-[10px] font-bold text-[#5B5CE2] border-b border-[#F0EFEA] pb-2 uppercase tracking-widest flex items-center justify-between">
                <span>Connected Intelligence</span>
                <span className="text-[#9A9C9F] font-mono font-normal">{openedPhoto.date}</span>
              </div>

              <div className="space-y-4">
                {/* Connected Memory Link */}
                {connectedMemory && (
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold text-[#6B6D73] uppercase tracking-wider">Part of Memory</div>
                    <div
                      onClick={() => {
                        setOpenedPhoto(null);
                        router.push('/timeline');
                      }}
                      className="p-3 bg-[#F7F6F2] hover:bg-[#F0EFEA] border border-[#E5E3DC] rounded-xl flex items-center justify-between cursor-pointer group transition-all"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="text-xs font-bold text-[#17181C] group-hover:text-[#5B5CE2] transition-colors block truncate">
                          {connectedMemory.title}
                        </span>
                        <span className="text-[10px] text-[#6B6D73]">{connectedMemory.date} · {connectedMemory.totalExpense}</span>
                      </div>
                      <ArrowRight size={13} className="text-[#5B5CE2] shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                )}

                {/* Location */}
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-[#6B6D73] uppercase tracking-wider">Place</div>
                  <div className="text-xs text-[#17181C] font-semibold bg-white border border-[#E5E3DC] p-2.5 rounded-xl flex items-center gap-1.5">
                    <MapPin size={13} className="text-[#5B5CE2] shrink-0" />
                    <span>{openedPhoto.location || 'Location tagged'}</span>
                  </div>
                </div>

                {/* People */}
                {openedPhoto.people && openedPhoto.people.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold text-[#6B6D73] uppercase tracking-wider">People with you</div>
                    <div className="flex flex-wrap gap-1">
                      {openedPhoto.people.map((p) => (
                        <span key={p} className="text-[11px] font-semibold text-[#5B5CE2] bg-[#E8E7FF] px-2.5 py-0.5 rounded-full">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Related Documents */}
                {connectedDocs.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-bold text-[#6B6D73] uppercase tracking-wider">Linked Documents</div>
                    <div className="space-y-1.5">
                      {connectedDocs.map((doc) => (
                        <div
                          key={doc.id}
                          onClick={() => handleOpenDoc(doc)}
                          className="p-2.5 rounded-xl border border-[#E5E3DC] bg-[#F7F6F2] hover:border-[#5B5CE2]/35 text-xs flex items-center justify-between cursor-pointer group"
                        >
                          <div className="flex items-center gap-2 min-w-0 pr-2">
                            <FileText size={12} className="text-[#E9A23B] shrink-0" />
                            <span className="font-semibold text-[#17181C] group-hover:text-[#5B5CE2] transition-colors truncate">
                              {doc.title}
                            </span>
                          </div>
                          <span className="text-[9px] text-[#5B5CE2] font-mono uppercase shrink-0">PDF</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Technical EXIF info */}
              {openedPhoto.exif && (
                <div className="pt-3 border-t border-[#F0EFEA] space-y-1.5">
                  <div className="text-[9px] font-bold text-[#6B6D73] uppercase tracking-wider">Camera EXIF</div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-[#6B6D73]">
                    <div>Camera: <span className="text-[#17181C] font-semibold">{openedPhoto.exif.camera}</span></div>
                    <div>Exposure: <span className="text-[#17181C] font-semibold">{openedPhoto.exif.exposure}</span></div>
                    <div>Aperture: <span className="text-[#17181C] font-semibold">{openedPhoto.exif.aperture}</span></div>
                    <div>ISO: <span className="text-[#17181C] font-semibold">{openedPhoto.exif.iso}</span></div>
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={() => handleQueryInOrbit(openedPhoto.title)}
              className="w-full py-2.5 bg-[#5B5CE2] hover:bg-[#4B4CC2] text-white font-semibold text-xs rounded-full shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer mt-2"
            >
              <Sparkles size={13} className="text-white" />
              <span>Ask Orbit about this photo</span>
            </button>
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
}
