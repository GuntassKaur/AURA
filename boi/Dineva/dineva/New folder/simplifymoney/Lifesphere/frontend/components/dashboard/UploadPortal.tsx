'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, RefreshCw } from 'lucide-react';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useOrbitStore } from '@/store/useOrbitStore';
import { useGraphStore, GraphNodeData } from '@/store/useGraphStore';
import { useSystemStore } from '@/store/useSystemStore';

interface UploadPortalProps {
  onNavigate: (tab: string) => void;
}

export default function UploadPortal({ onNavigate }: UploadPortalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const { addNotification, removeNotification, updateNotificationProgress } = useNotificationStore();
  const { setOrbState } = useSystemStore();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processPipeline = async (fileName: string) => {
    setUploading(true);
    setOrbState('uploading');
    
    // Step 1: Upload
    setCurrentStep('Uploading document…');
    const toastId = addNotification({
      type: 'progress',
      title: 'Uploading memory',
      message: `Uploading "${fileName}" to your vault.`,
      progress: 0
    });

    for (let p = 0; p <= 100; p += 25) {
      setProgress(p);
      updateNotificationProgress(toastId, p);
      await new Promise(r => setTimeout(r, 180));
    }

    // Step 2: Extract & Understand
    removeNotification(toastId);
    setOrbState('thinking');
    setCurrentStep('Understanding document details…');
    const ocrToast = addNotification({
      type: 'thinking',
      title: 'Analyzing document',
      message: 'Extracting text, key dates, and vendor summaries.'
    });
    await new Promise(r => setTimeout(r, 1000));

    // Step 3: Connect
    removeNotification(ocrToast);
    setOrbState('speaking');
    setCurrentStep('Connecting to related memories…');
    await new Promise(r => setTimeout(r, 1000));

    // Final Success callback
    setUploading(false);
    setCurrentStep(null);
    setOrbState('success');

    const isGoa = fileName.toLowerCase().includes('goa') || fileName.toLowerCase().includes('ticket');
    const newNode: GraphNodeData = {
      id: `doc-${Math.random().toString(36).substring(2, 7)}`,
      type: isGoa ? 'trip' : 'invoice',
      title: fileName,
      category: isGoa ? 'travel' : 'financial',
      date: new Date().toISOString().substring(0, 10),
      location: isGoa ? 'Goa' : 'Home',
      summary: `Uploaded memory: ${fileName}. Connected to Goa travel cluster.`
    };
    useGraphStore.getState().setSelectedNode(newNode);

    addNotification({
      type: 'success',
      title: 'Memory added',
      message: `"${fileName}" has been connected to your vault.`,
      duration: 4000
    });

    setTimeout(() => {
      setOrbState('idle');
      useOrbitStore.getState().sendMessage(`Summarize recent document: ${fileName}`, (tab) => onNavigate(tab));
    }, 800);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processPipeline(file.name);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processPipeline(e.target.files[0].name);
    }
  };

  return (
    <div className="w-full relative font-sans text-left">
      <div className="flex items-center space-x-2 text-xs font-semibold text-[#6B6D73] tracking-wide uppercase mb-3">
        <Upload size={14} className={uploading ? 'animate-bounce' : ''} />
        <span>Add Memory or Document</span>
      </div>

      <AnimatePresence mode="wait">
        {!uploading ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border border-dashed rounded-2xl p-6 text-center transition-all ${
              dragActive ? 'border-[#5B5CE2]/50 bg-[#E8E7FF]/30' : 'border-[#E5E3DC] hover:border-[#5B5CE2]/40 bg-[#FFFFFF]'
            }`}
          >
            <input
              type="file"
              id="file-upload-input"
              className="hidden"
              onChange={handleFileSelect}
              accept=".pdf,.jpg,.jpeg,.png"
            />
            <label 
              htmlFor="file-upload-input"
              className="flex flex-col items-center space-y-2.5 cursor-pointer"
            >
              <div className="p-3 bg-[#E8E7FF] rounded-full text-[#5B5CE2] border border-[#5B5CE2]/20">
                <FileText size={18} />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-medium text-[#17181C]">Drag & drop files here, or <span className="text-[#5B5CE2] underline">Browse</span></div>
                <div className="text-[11px] text-[#6B6D73]">PDF, JPG, PNG up to 10MB</div>
              </div>
            </label>
          </motion.div>
        ) : (
          <motion.div
            key="progress-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-6 border border-[#E5E3DC] rounded-2xl bg-[#FFFFFF] flex flex-col items-center space-y-3"
          >
            <RefreshCw size={20} className="text-[#5B5CE2] animate-spin" />
            <div className="space-y-2 text-center w-full">
              <div className="text-xs font-medium text-[#17181C]">
                {currentStep}
              </div>
              <div className="w-full bg-[#F0EFEA] h-1 rounded-full overflow-hidden relative">
                <motion.div
                  className="absolute top-0 left-0 bg-[#5B5CE2] h-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
