'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, Sparkles, ArrowRight } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { useOrbitStore } from '@/store/useOrbitStore';

export default function OrbitPage() {
  const { messages, sendMessage } = useOrbitStore();
  const [input, setInput] = useState('');
  const router = useRouter();

  const suggestedPrompts = [
    "Show my Goa memories",
    "What did I spend on travel?",
    "Find my medical documents",
    "What connects these memories?"
  ];

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;
    sendMessage(query, (tab) => router.push('/' + tab));
    setInput('');
  };

  return (
    <AppShell activeTab="chat">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center min-h-[75vh] text-center space-y-10 font-sans py-8"
      >
        {/* Centered Heading */}
        <div className="space-y-4 max-w-xl">
          <div className="flex items-center justify-center space-x-2 text-xs font-semibold text-accent-primary uppercase tracking-wide">
            <Sparkles size={14} />
            <span>Orbit Core Intelligence</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-text-primary">
            Ask Orbit anything.
          </h1>
          <p className="text-sm sm:text-base text-text-secondary leading-relaxed font-normal">
            Search your memories, documents, photos and moments.
          </p>
        </div>

        {/* Command Input Surface */}
        <div className="w-full space-y-4">
          <div className="w-full bg-bg-surface border border-white/[0.1] rounded-3xl p-5 flex items-center space-x-3 shadow-[0_20px_50px_rgba(0,0,0,0.7)] focus-within:border-accent-primary transition-all">
            <Search size={20} className="text-text-secondary" />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about your life, documents, or memories…"
              className="w-full bg-transparent border-none text-base text-text-primary placeholder-text-tertiary focus:outline-none"
            />
            <button 
              onClick={() => handleSend()} 
              className="p-2 rounded-full bg-accent-primary/20 text-accent-primary hover:bg-accent-primary/30 transition-all cursor-pointer"
            >
              <ArrowRight size={18} />
            </button>
          </div>

          {/* Suggested Prompts */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {suggestedPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="px-4 py-2 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-xs text-text-secondary hover:text-text-primary transition-all text-left cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Narrative Intelligence Cards (Not Chat Bubbles) */}
        {messages.length > 0 && (
          <div className="w-full space-y-4 text-left pt-6">
            {messages.slice(-3).map((m) => (
              <div key={m.id} className="p-6 rounded-3xl bg-bg-surface border border-white/[0.08] space-y-3 shadow-xl">
                <div className="text-xs font-semibold text-text-secondary">
                  {m.sender === 'user' ? 'You' : 'Orbit Narrative'}
                </div>
                <div className="text-base text-text-primary leading-relaxed">
                  {m.text}
                </div>
                {m.actionCard && (
                  <div className="p-4 border border-white/10 bg-bg-elevated rounded-2xl flex items-center justify-between mt-2">
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-text-primary">{m.actionCard.title}</div>
                      <div className="text-xs text-text-secondary">{m.actionCard.description}</div>
                    </div>
                    <button 
                      onClick={() => router.push('/' + (m.actionCard?.payload?.tab || 'timeline'))}
                      className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-accent-primary/20 text-accent-primary hover:bg-accent-primary/30 text-xs font-semibold transition-all cursor-pointer"
                    >
                      <span>View connected memories</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </AppShell>
  );
}
