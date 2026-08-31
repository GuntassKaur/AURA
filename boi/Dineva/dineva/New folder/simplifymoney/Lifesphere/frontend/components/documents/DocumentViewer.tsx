'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Copy, Sparkles, ShieldCheck } from 'lucide-react';
import { useDocumentStore } from '@/store/useDocumentStore';
import { useOrbitStore } from '@/store/useOrbitStore';

export default function DocumentViewer() {
  const { openedDoc, setOpenedDoc } = useDocumentStore();
  const { setIsOpen: setOrbitOpen, sendMessage } = useOrbitStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && openedDoc) {
        setOpenedDoc(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openedDoc, setOpenedDoc]);

  const handleQueryInOrbit = (title: string) => {
    setOrbitOpen(true);
    sendMessage(`Analyze document metadata for: ${title}`, () => {});
  };

  return (
    <AnimatePresence>
      {openedDoc && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-[#F7F6F2]/95 backdrop-blur-md p-4 sm:p-8 flex flex-col justify-between font-sans selection:bg-[#5B5CE2]/15 selection:text-[#5B5CE2]"
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b border-[#E5E3DC] pb-4 mb-2">
            <div className="flex items-center space-x-3 text-left">
              <div className="p-2.5 rounded-xl bg-[#FFFFFF] border border-[#E5E3DC] text-[#17181C] shadow-xs">
                <FileText size={18} className="text-[#5B5CE2]" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#6B6D73] uppercase tracking-wider">Document Intelligence Viewer</span>
                <h2 className="text-base font-serif font-bold text-[#17181C] mt-0.5">{openedDoc.title}</h2>
              </div>
            </div>

            <button 
              onClick={() => setOpenedDoc(null)}
              className="p-2.5 rounded-full border border-[#E5E3DC] bg-[#FFFFFF] text-[#6B6D73] hover:text-[#17181C] transition-colors cursor-pointer shadow-xs"
            >
              <X size={16} />
            </button>
          </div>

          {/* Three-column Split View Canvas */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden my-4 items-center">
            
            {/* COLUMN 1: Document Mock View */}
            <div className="lg:col-span-4 h-full border border-[#E5E3DC] rounded-3xl bg-[#FFFFFF] p-6 flex flex-col justify-between items-center relative overflow-hidden text-left shadow-xs">
              <div className="text-xs font-bold text-[#6B6D73] self-start uppercase tracking-wider">Document Preview</div>
              
              <div className="w-full max-w-[280px] h-[380px] border border-[#E5E3DC] bg-[#F7F6F2] rounded-2xl shadow-xs relative p-6 flex flex-col justify-between text-xs text-[#6B6D73] leading-relaxed">
                <div className="border-b border-[#E5E3DC] pb-3">
                  <div className="font-serif font-bold text-[#17181C] text-sm">{(openedDoc as any).vendor || openedDoc.extractedMetadata?.vendor || 'LifeSphere Archive'}</div>
                  <div className="text-[11px] font-mono text-[#6B6D73]">Date: {openedDoc.date}</div>
                </div>

                <div className="flex-1 py-4 space-y-2">
                  <div className="font-semibold text-[#17181C]">Summary:</div>
                  <div className="text-xs text-[#17181C] leading-relaxed">{openedDoc.summary}</div>
                </div>

                <div className="border-t border-[#E5E3DC] pt-3 flex justify-between items-center text-[#17181C] font-semibold">
                  <span>Total Amount:</span>
                  <span className="font-mono text-[#5B5CE2] font-bold">{(openedDoc as any).amount || openedDoc.extractedMetadata?.amount || 'N/A'}</span>
                </div>
              </div>

              <div className="text-xs font-mono text-[#6B6D73]">Page 1 of 1 · {openedDoc.fileType.toUpperCase()}</div>
            </div>

            {/* COLUMN 2: Raw Extracted Text */}
            <div className="lg:col-span-4 h-full border border-[#E5E3DC] rounded-3xl bg-[#FFFFFF] p-6 flex flex-col justify-between relative overflow-hidden text-left shadow-xs">
              <div className="text-xs font-bold text-[#6B6D73] border-b border-[#E5E3DC] pb-3 w-full uppercase tracking-wider">
                Extracted Document Text
              </div>

              <div className="flex-1 overflow-y-auto font-mono text-xs text-[#17181C] leading-relaxed my-4 select-text p-4 rounded-2xl bg-[#F7F6F2] border border-[#E5E3DC]">
                {openedDoc.ocrText}
              </div>

              <button 
                onClick={() => navigator.clipboard.writeText(openedDoc.ocrText)}
                className="w-full py-3 border border-[#E5E3DC] rounded-full bg-[#F7F6F2] text-xs font-semibold text-[#17181C] hover:bg-[#F0EFEA] transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-xs"
              >
                <Copy size={13} />
                <span>Copy Extracted Text</span>
              </button>
            </div>

            {/* COLUMN 3: Document Insight & Actions */}
            <div className="lg:col-span-4 h-full border border-[#E5E3DC] rounded-3xl bg-[#FFFFFF] p-6 flex flex-col justify-between relative overflow-hidden space-y-6 text-left shadow-xs">
              <div className="space-y-5 overflow-y-auto flex-1">
                <div className="text-xs font-bold text-[#6B6D73] border-b border-[#E5E3DC] pb-3 uppercase tracking-wider">
                  Extracted Intelligence
                </div>

                <div className="space-y-1.5">
                  <div className="text-xs font-semibold text-[#6B6D73]">Summary</div>
                  <p className="text-xs text-[#17181C] leading-relaxed p-4 bg-[#F7F6F2] border border-[#E5E3DC] rounded-2xl">
                    {openedDoc.summary}
                  </p>
                </div>

                {((openedDoc as any).expiryDate || openedDoc.extractedMetadata?.expiryDate) && (
                  <div className="p-4 rounded-2xl bg-[#FFF2D9] border border-[#E9A23B]/30 flex items-center space-x-3">
                    <ShieldCheck size={18} className="text-[#E9A23B]" />
                    <div className="text-xs">
                      <div className="font-semibold text-[#17181C]">Expiration Warning</div>
                      <div className="text-[#E9A23B] font-mono">Expires {(openedDoc as any).expiryDate || openedDoc.extractedMetadata?.expiryDate}</div>
                    </div>
                  </div>
                )}

                {openedDoc.extractedMetadata?.entities && (
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-[#6B6D73]">Identified Entities</div>
                    <div className="flex flex-wrap gap-2">
                      {openedDoc.extractedMetadata.entities.map((ent, idx) => (
                        <span key={idx} className="px-3 py-1 rounded-full bg-[#F7F6F2] border border-[#E5E3DC] text-xs text-[#17181C] font-mono">
                          {ent}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button 
                onClick={() => handleQueryInOrbit(openedDoc.title)}
                className="w-full py-3.5 bg-[#5B5CE2] hover:bg-[#4A4BC9] text-white font-semibold text-xs rounded-full shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Sparkles size={14} className="text-white" />
                <span>Ask Orbit about this document</span>
              </button>
            </div>

          </div>
        </motion.div>

      )}
    </AnimatePresence>
  );
}
