'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, X } from 'lucide-react';
import { useOrbitStore } from '@/store/useOrbitStore';

export default function Spotlight() {
  const { isOpen, setIsOpen, messages, sendMessage } = useOrbitStore();
  const [input, setInput] = useState('');
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestedPrompts = [
    "Where did I spend the most in Goa?",
    "Show memories from April.",
    "What documents expire soon?",
    "What is connected to this photograph?"
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setIsOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;
    sendMessage(query, (tab) => router.push('/' + tab));
    setInput('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-[#06070A]/80 backdrop-blur-2xl flex items-center justify-center p-4">
          <div className="absolute inset-0" onClick={() => setIsOpen(false)} />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ type: 'spring', stiffness: 220, damping: 26 }}
            className="w-full max-w-2xl bg-bg-secondary border border-white/10 rounded-3xl shadow-[0_30px_70px_rgba(0,0,0,0.9)] relative z-10 flex flex-col font-sans overflow-hidden"
          >
            {/* Input bar */}
            <div className="flex items-center space-x-3 px-6 py-5 border-b border-white/[0.08]">
              <Sparkles size={18} className="text-accent-primary" />
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask Orbit about your memories, documents, or moments…"
                className="w-full bg-transparent border-none text-base text-text-primary placeholder-text-tertiary focus:outline-none"
              />
              <button onClick={() => setIsOpen(false)} className="text-text-secondary hover:text-text-primary transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Suggested Prompts */}
            <div className="px-6 py-3 border-b border-white/[0.04] bg-bg-base/40 flex flex-wrap gap-2">
              {suggestedPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  className="px-3 py-1 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-xs text-text-secondary hover:text-text-primary transition-all text-left"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Response area */}
            <div className="max-h-[380px] overflow-y-auto p-6 space-y-4">
              {messages.slice(-3).map((m) => (
                <div key={m.id} className="space-y-2 text-left">
                  <div className="text-[11px] font-medium text-text-secondary">
                    {m.sender === 'user' ? 'You' : 'Orbit'}
                  </div>
                  
                  <div className="text-sm leading-relaxed text-[#F2F2F5] p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                    {m.text}
                  </div>

                  {m.actionCard && (
                    <div className="p-4 border border-white/10 bg-[#12161D] rounded-2xl flex items-center justify-between mt-2">
                      <div className="space-y-0.5">
                        <div className="text-xs font-semibold text-white">{m.actionCard.title}</div>
                        <div className="text-xs text-[#8A8A9A]">{m.actionCard.description}</div>
                      </div>
                      <button 
                        onClick={() => {
                          setIsOpen(false);
                          router.push('/' + (m.actionCard?.payload?.tab || 'timeline'));
                        }}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#6C6FFF]/20 text-[#6C6FFF] hover:bg-[#6C6FFF]/30 text-xs font-medium transition-all"
                      >
                        <span>View connected memories</span>
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-white/[0.06] px-6 py-3.5 bg-[#06070A]/80 flex items-center justify-between text-xs text-[#8A8A9A]">
              <span>Press <kbd className="font-mono-meta text-[10px] bg-white/[0.06] px-1.5 py-0.5 rounded text-white/70">ESC</kbd> to exit</span>
              <button 
                onClick={() => handleSend()}
                className="flex items-center space-x-1.5 text-white hover:text-[#6C6FFF] font-medium transition-colors"
              >
                <span>Ask Orbit</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
