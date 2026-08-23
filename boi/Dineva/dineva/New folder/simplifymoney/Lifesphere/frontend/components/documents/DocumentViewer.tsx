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
          className="fixed inset-0 z-50 bg-bg-base/95 backdrop-blur-2xl p-4 sm:p-8 flex flex-col justify-between font-sans selection:bg-accent-primary/20"
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b border-white/[0.08] pb-4 mb-2">
            <div className="flex items-center space-x-3 text-left">
              <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-text-primary">
                <FileText size={18} className="text-accent-primary" />
              </div>
              <div>
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Document Viewer</span>
                <h2 className="text-base font-semibold text-text-primary mt-0.5">{openedDoc.title}</h2>
              </div>
            </div>

            <button 
              onClick={() => setOpenedDoc(null)}
              className="p-2.5 rounded-full border border-white/10 bg-white/[0.04] text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Three-column Split View Canvas */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden my-4 items-center">
            
            {/* COLUMN 1: Document Mock View */}
            <div className="lg:col-span-4 h-full border border-white/[0.08] rounded-3xl bg-bg-surface p-6 flex flex-col justify-between items-center relative overflow-hidden text-left">
              <div className="text-xs font-semibold text-text-secondary self-start uppercase tracking-wide">Document Preview</div>
              
              <div className="w-full max-w-[280px] h-[380px] border border-white/15 bg-bg-base rounded-2xl shadow-2xl relative p-6 flex flex-col justify-between text-xs text-text-secondary leading-relaxed">
                <div className="border-b border-white/10 pb-3">
                  <div className="font-bold text-text-primary text-sm">{openedDoc.extractedMetadata.vendor || 'LifeSphere Archive'}</div>
                  <div className="text-[11px] font-mono-meta text-text-secondary">Date: {openedDoc.date}</div>
                </div>

                <div className="flex-1 py-4 space-y-2">
                  <div className="font-medium text-text-primary">Summary:</div>
                  <div className="text-xs text-text-primary leading-relaxed">{openedDoc.summary}</div>
                </div>

                <div className="border-t border-white/10 pt-3 flex justify-between items-center text-text-primary font-medium">
                  <span>Total Amount:</span>
                  <span className="font-mono-meta text-accent-primary">{openedDoc.extractedMetadata.amount || 'N/A'}</span>
                </div>
              </div>

              <div className="text-xs font-mono-meta text-text-secondary">Page 1 of 1 · {openedDoc.fileType.toUpperCase()}</div>
            </div>

            {/* COLUMN 2: Raw Extracted Text */}
            <div className="lg:col-span-4 h-full border border-white/[0.08] rounded-3xl bg-bg-surface p-6 flex flex-col justify-between relative overflow-hidden text-left">
              <div className="text-xs font-semibold text-text-secondary border-b border-white/[0.08] pb-3 w-full uppercase tracking-wide">
                Extracted Document Text
              </div>

              <div className="flex-1 overflow-y-auto font-mono-meta text-xs text-text-primary leading-relaxed my-4 select-text p-4 rounded-2xl bg-bg-base border border-white/[0.04]">
                {openedDoc.ocrText}
              </div>

              <button 
                onClick={() => navigator.clipboard.writeText(openedDoc.ocrText)}
                className="w-full py-3 border border-white/[0.08] rounded-full bg-white/[0.04] text-xs font-medium text-text-primary hover:bg-white/[0.08] transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Copy size={13} />
                <span>Copy Extracted Text</span>
              </button>
            </div>

            {/* COLUMN 3: Document Insight & Actions */}
            <div className="lg:col-span-4 h-full border border-white/[0.08] rounded-3xl bg-bg-surface p-6 flex flex-col justify-between relative overflow-hidden space-y-6 text-left">
              <div className="space-y-5 overflow-y-auto flex-1">
                <div className="text-xs font-semibold text-text-secondary border-b border-white/[0.08] pb-3 uppercase tracking-wide">
                  Document Metadata & Relationships
                </div>

                <div className="space-y-1.5">
                  <div className="text-xs font-semibold text-text-secondary">Document Summary</div>
                  <p className="text-xs text-text-primary leading-relaxed p-4 bg-white/[0.02] border border-white/[0.04] rounded-2xl">
                    {openedDoc.summary}
                  </p>
                </div>

                {openedDoc.extractedMetadata.expiryDate && (
                  <div className="p-4 rounded-2xl bg-accent-warm/10 border border-accent-warm/30 flex items-center space-x-3">
                    <ShieldCheck size={18} className="text-accent-warm" />
                    <div className="text-xs">
                      <div className="font-semibold text-text-primary">Expiration Notice</div>
                      <div className="text-accent-warm font-mono-meta">Expires {openedDoc.extractedMetadata.expiryDate}</div>
                    </div>
                  </div>
                )}

                {openedDoc.extractedMetadata.entities && (
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-text-secondary">Identified Entities</div>
                    <div className="flex flex-wrap gap-2">
                      {openedDoc.extractedMetadata.entities.map((ent, idx) => (
                        <span key={idx} className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-xs text-text-primary">
                          {ent}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button 
                onClick={() => handleQueryInOrbit(openedDoc.title)}
                className="w-full py-3 bg-accent-primary hover:bg-accent-primary/90 text-white font-medium text-xs rounded-full shadow-lg shadow-accent-primary/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
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
