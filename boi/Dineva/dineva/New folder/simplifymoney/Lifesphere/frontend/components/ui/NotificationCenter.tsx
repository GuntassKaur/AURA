'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, AlertCircle, RefreshCw, Bell, X } from 'lucide-react';
import { useNotificationStore } from '@/store/useNotificationStore';

export default function NotificationCenter() {
  const { notifications, removeNotification } = useNotificationStore();

  const icons = {
    success: <CheckCircle2 size={16} className="text-emerald-400" />,
    warning: <AlertTriangle size={16} className="text-amber-400" />,
    error: <AlertCircle size={16} className="text-rose-400" />,
    reminder: <Bell size={16} className="text-indigo-400" />,
    thinking: <RefreshCw size={16} className="text-[#5B5CE2] animate-spin" />,
    progress: <RefreshCw size={16} className="text-[#5B5CE2] animate-spin" />,
  };

  return (
    <div className="fixed top-20 right-6 z-50 w-full max-w-sm flex flex-col space-y-3 pointer-events-none font-sans">
      <AnimatePresence>
        {notifications.map((n) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="bg-[#FFFFFF] border border-[#E5E3DC] rounded-2xl p-4 flex items-start space-x-3 pointer-events-auto shadow-lg relative overflow-hidden"
          >
            <div className="mt-0.5">{icons[n.type]}</div>
            
            <div className="flex-1">
              <div className="text-xs font-semibold text-[#17181C]">{n.title}</div>
              <div className="text-xs text-[#6B6D73] mt-0.5 leading-relaxed">{n.message}</div>
              
              {n.type === 'progress' && n.progress !== undefined && (
                <div className="mt-2.5 w-full bg-[#F0EFEA] h-1 rounded-full overflow-hidden relative">
                  <motion.div
                    className="absolute top-0 left-0 bg-[#5B5CE2] h-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${n.progress}%` }}
                  />
                </div>
              )}
            </div>

            <button
              onClick={() => removeNotification(n.id)}
              className="text-[#9A9C9F] hover:text-[#17181C] transition-colors p-1"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
