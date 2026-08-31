'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, ArrowRight, Send } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import { useOrbitStore } from '@/store/useOrbitStore';

export default function OrbitPage() {
  const { messages, sendMessage } = useOrbitStore();
  const [input, setInput] = useState('');
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);

  // Non-welcome messages (actual conversation)
  const conversationMessages = messages.filter(m => m.id !== 'welcome' || messages.length === 1);
  const hasConversation = messages.filter(m => m.id !== 'welcome').length > 0;

  const suggestedPrompts = [
    "How much did I spend in Goa?",
    "When does my passport expire?",
    "Show my upcoming payments",
    "Which subscriptions should I review?",
  ];

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;
    sendMessage(query, (tab) => router.push('/' + tab));
    setInput('');
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <AppShell activeTab="chat">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-2xl mx-auto flex flex-col min-h-[calc(100vh-8rem)] font-sans pb-4"
      >
        {!hasConversation ? (
          /* ── EMPTY STATE: centered hero ──────────────── */
          <div className="flex flex-col items-center justify-center flex-1 text-center space-y-8 py-12">
            <div className="space-y-3 max-w-md">
              <div className="w-12 h-12 rounded-2xl bg-[#E8E7FF] flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6 text-[#5B5CE2]" />
              </div>
              <h1 className="text-2xl font-serif font-bold tracking-tight text-[#17181C]">
                Ask Orbit anything.
              </h1>
              <p className="text-sm text-[#6B6D73] leading-relaxed">
                Search across your memories, documents, photos, expenses and everyday milestones.
              </p>
            </div>

            {/* Suggested prompts */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-lg">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="p-3.5 rounded-xl bg-white border border-[#E5E3DC] text-left text-xs text-[#17181C] font-medium hover:border-[#5B5CE2]/40 hover:bg-[#F7F6F2] transition-all cursor-pointer group shadow-xs"
                >
                  <span className="group-hover:text-[#5B5CE2] transition-colors">{prompt}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* ── THREAD VIEW: messages ────────────────────── */
          <div
            ref={threadRef}
            className="flex-1 overflow-y-auto space-y-4 py-4 pr-1 min-h-0"
          >
            <AnimatePresence initial={false}>
              {conversationMessages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] space-y-2 ${m.sender === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                    {m.sender === 'orbit' && (
                      <div className="flex items-center gap-1.5 px-1">
                        <Sparkles size={11} className="text-[#5B5CE2]" />
                        <span className="text-[10px] font-bold text-[#5B5CE2] uppercase tracking-wider">Orbit</span>
                      </div>
                    )}
                    <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      m.sender === 'user'
                        ? 'bg-[#5B5CE2] text-white rounded-tr-sm'
                        : 'bg-white border border-[#E5E3DC] text-[#17181C] rounded-tl-sm shadow-xs'
                    }`}>
                      {m.text}
                    </div>

                    {/* Action card */}
                    {m.actionCard && (
                      <div className="w-full p-4 border border-[#E5E3DC] bg-[#F7F6F2] rounded-xl flex items-center justify-between gap-3">
                        <div className="space-y-0.5 min-w-0">
                          <div className="text-xs font-bold text-[#17181C] truncate">{m.actionCard.title}</div>
                          <div className="text-[11px] text-[#6B6D73] truncate">{m.actionCard.description}</div>
                        </div>
                        <button
                          onClick={() => router.push('/' + (m.actionCard?.payload?.tab || 'timeline'))}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#5B5CE2] text-white hover:bg-[#4A4BC9] text-[11px] font-semibold transition-all cursor-pointer shadow-xs shrink-0"
                        >
                          Open <ArrowRight size={11} />
                        </button>
                      </div>
                    )}

                    <span className="text-[10px] font-mono text-[#9A9C9F] px-1">{m.timestamp}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* ── INPUT BAR (always shown) ─────────────────── */}
        <div className={`${!hasConversation ? 'mt-4' : 'mt-2'} w-full`}>
          <div className="flex items-center gap-2 bg-white border border-[#E5E3DC] rounded-2xl px-4 py-3 shadow-xs focus-within:border-[#5B5CE2]/50 transition-colors">
            <Search size={14} className="text-[#9A9C9F] shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask about your memories, documents, expenses…"
              className="flex-1 bg-transparent text-sm text-[#17181C] placeholder-[#9A9C9F] focus:outline-none min-w-0"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim()}
              className="w-8 h-8 rounded-xl bg-[#5B5CE2] hover:bg-[#4A4BC9] disabled:bg-[#E5E3DC] disabled:cursor-not-allowed text-white flex items-center justify-center transition-all shrink-0 cursor-pointer"
            >
              <Send size={13} />
            </button>
          </div>
          <p className="text-[10px] text-[#9A9C9F] text-center mt-2">
            Orbit reads your connected memories, documents and expenses.
          </p>
        </div>
      </motion.div>
    </AppShell>
  );
}
