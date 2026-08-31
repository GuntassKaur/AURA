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
    "Show Goa trip expenses breakdown"
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
        <div className="fixed inset-0 z-50 bg-[#17181C]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="absolute inset-0" onClick={() => setIsOpen(false)} />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ type: 'spring', stiffness: 220, damping: 26 }}
            className="w-full max-w-2xl bg-[#FFFFFF] border border-[#E5E3DC] rounded-3xl shadow-2xl relative z-10 flex flex-col font-sans overflow-hidden"
          >
            {/* Input bar */}
            <div className="flex items-center space-x-3 px-6 py-5 border-b border-[#E5E3DC]">
              <Sparkles size={18} className="text-[#5B5CE2]" />
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask Orbit about your memories, documents, subscriptions, or moments…"
                className="w-full bg-transparent border-none text-base text-[#17181C] placeholder-[#9A9C9F] focus:outline-none"
              />
              <button onClick={() => setIsOpen(false)} className="text-[#6B6D73] hover:text-[#17181C] transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Suggested Prompts */}
            <div className="px-6 py-3 border-b border-[#E5E3DC] bg-[#F7F6F2] flex flex-wrap gap-2">
              {suggestedPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  className="px-3 py-1 rounded-full bg-[#FFFFFF] hover:bg-[#E8E7FF] border border-[#E5E3DC] text-xs text-[#6B6D73] hover:text-[#5B5CE2] transition-all text-left shadow-xs font-medium"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Response area */}
            <div className="max-h-[380px] overflow-y-auto p-6 space-y-4">
              {messages.slice(-3).map((m) => (
                <div key={m.id} className="space-y-2 text-left">
                  <div className="text-[11px] font-semibold text-[#6B6D73] uppercase tracking-wider">
                    {m.sender === 'user' ? 'You' : 'Orbit AI'}
                  </div>
                  
                  <div className="text-sm leading-relaxed text-[#17181C] p-4 rounded-2xl bg-[#F7F6F2] border border-[#E5E3DC]">
                    {m.text}
                  </div>

                  {m.actionCard && (
                    <div className="p-4 border border-[#E5E3DC] bg-[#FFFFFF] rounded-2xl flex items-center justify-between mt-2 shadow-xs">
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-[#17181C]">{m.actionCard.title}</div>
                        <div className="text-xs text-[#6B6D73]">{m.actionCard.description}</div>
                      </div>
                      <button 
                        onClick={() => {
                          setIsOpen(false);
                          router.push('/' + (m.actionCard?.payload?.tab || 'timeline'));
                        }}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#5B5CE2] text-white hover:bg-[#4A4BC9] text-xs font-semibold transition-all shadow-xs"
                      >
                        <span>Open Story</span>
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-[#E5E3DC] px-6 py-3.5 bg-[#F7F6F2] flex items-center justify-between text-xs text-[#6B6D73]">
              <span>Press <kbd className="font-mono text-[10px] bg-[#FFFFFF] border border-[#E5E3DC] px-1.5 py-0.5 rounded text-[#17181C]">ESC</kbd> to exit</span>
              <button 
                onClick={() => handleSend()}
                className="flex items-center space-x-1.5 text-[#5B5CE2] hover:text-[#4A4BC9] font-bold transition-colors"
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

