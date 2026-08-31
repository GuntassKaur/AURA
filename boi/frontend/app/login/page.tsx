'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield, Lock, ChevronRight, Fingerprint, Eye, Terminal } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { apiRequest } from '@/lib/api/client';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setError('');

    try {
      // Use URLSearchParams for application/x-www-form-urlencoded
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const res = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (!res.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await res.json();
      login(data.access_token, data.role, data.username);
      router.push('/overview');
    } catch (err) {
      setError('AUTHENTICATION FAILED. UNAUTHORIZED ACCESS ATTEMPT LOGGED.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center font-mono relative overflow-hidden text-cyan-500">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(8,145,178,0.1)_0%,transparent_60%)]" />
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(8, 145, 178, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(8, 145, 178, 0.03) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="absolute top-0 left-0 w-full h-[2px] bg-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.8)] animate-[scan_3s_ease-in-out_infinite]" />
      </div>

      {/* Login Terminal */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="z-10 w-full max-w-md p-8 border border-cyan-500/30 bg-black/80 backdrop-blur-md shadow-[0_0_30px_rgba(8,145,178,0.15)] relative"
      >
        {/* Corner Accents */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-500" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-500" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-500" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-500" />

        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 border-2 border-cyan-500 rounded-full flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(6,182,212,0.4)] relative">
            <div className="absolute inset-0 rounded-full border border-cyan-400 animate-ping opacity-20" />
            <Shield className="w-8 h-8 text-cyan-400" />
          </div>
          <h1 className="text-2xl font-black tracking-[0.2em] text-white">AEGISNET</h1>
          <p className="text-[10px] tracking-[0.1em] mt-1 opacity-70">NATIONAL THREAT CONTAINMENT GRID</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div className="relative group">
              <Terminal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-600 group-focus-within:text-cyan-400 transition-colors" />
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="OPERATOR ID" 
                className="w-full bg-cyan-950/20 border border-cyan-900/50 rounded-none px-10 py-3 text-sm text-cyan-100 placeholder-cyan-800 focus:outline-none focus:border-cyan-400 focus:bg-cyan-900/30 transition-all uppercase tracking-widest"
                required
              />
            </div>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-600 group-focus-within:text-cyan-400 transition-colors" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="ACCESS CODE" 
                className="w-full bg-cyan-950/20 border border-cyan-900/50 rounded-none px-10 py-3 text-sm text-cyan-100 placeholder-cyan-800 focus:outline-none focus:border-cyan-400 focus:bg-cyan-900/30 transition-all tracking-widest"
                required
              />
            </div>
          </div>

          {error && (
            <div className="text-[10px] text-red-500 bg-red-950/30 border border-red-900/50 p-3 flex items-start space-x-2 animate-pulse">
              <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button 
            type="submit"
            disabled={isAuthenticating}
            className="w-full bg-cyan-950/50 border border-cyan-500/50 text-cyan-400 py-3 text-xs font-bold tracking-[0.2em] hover:bg-cyan-900/80 hover:text-cyan-300 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center space-x-2 group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAuthenticating ? (
              <>
                <Fingerprint className="w-4 h-4 animate-pulse" />
                <span>VERIFYING CLEARANCE...</span>
              </>
            ) : (
              <>
                <span>INITIALIZE UPLINK</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-cyan-900/50 flex justify-between text-[8px] text-cyan-700/60 tracking-widest">
          <span>SECURE CONNECTION</span>
          <span>AES-256 ENCRYPTED</span>
        </div>
      </motion.div>
    </div>
  );
}
