"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChefHat, ArrowLeft, KeyRound, Lock, UserCheck, ShieldAlert } from "lucide-react";
import GlowBackground from "@/components/ui/GlowBackground";

const SERVERS = [
  { name: "Chef Administrator", role: "Kitchen Leader", avatar: "👨‍🍳" },
  { name: "General Manager", role: "System Admin", avatar: "🤵" },
  { name: "Lead Bartender", role: "Beverage Mgr", avatar: "🍹" },
  { name: "Head Server", role: "Service Staff", avatar: "🍽️" },
];

export default function LoginPage() {
  const router = useRouter();
  
  // Lock screen vs Login screen toggle
  const [isLocked, setIsLocked] = useState(true);
  
  // Dynamic Clock
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      setDate(now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Login credentials states
  const [selectedServer, setSelectedServer] = useState(SERVERS[0]);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Keypad controls
  const handleKeypadPress = (val: string) => {
    setError("");
    if (pin.length < 6) {
      setPin((prev) => prev + val);
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPin("");
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pin.length === 0) {
      setError("Please enter your terminal PIN.");
      return;
    }

    setIsLoggingIn(true);
    // Simulate server auth check
    setTimeout(() => {
      if (pin === "1234" || pin.length >= 4) {
        // Success
        router.push("/");
      } else {
        setIsLoggingIn(false);
        setError("Invalid Terminal PIN. Try '1234' for demo.");
        setPin("");
      }
    }, 1000);
  };

  return (
    <div className="relative min-h-screen text-stone-200 flex flex-col items-center justify-center font-sans overflow-hidden select-none">
      <GlowBackground />

      {/* Floating Header */}
      <div className="absolute top-6 left-6 z-50">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-1.5 text-xs font-semibold text-stone-400 hover:text-white transition-all bg-stone-900/40 border border-white/5 px-3 py-1.5 rounded-lg backdrop-blur-md"
        >
          <ArrowLeft size={13} /> Back to website
        </button>
      </div>

      <AnimatePresence mode="wait">
        {isLocked ? (
          /* LOCKED SCREEN STATE */
          <motion.div
            key="lock-screen"
            initial={{ opacity: 1 }}
            exit={{ y: -800, opacity: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            onClick={() => setIsLocked(false)}
            className="flex-1 w-full flex flex-col items-center justify-between py-20 px-6 cursor-pointer z-10"
          >
            <div /> {/* Spacer */}

            {/* Time and Date */}
            <div className="text-center">
              <motion.h1
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="text-7xl sm:text-8xl font-black text-white tracking-tighter select-none font-mono"
              >
                {time}
              </motion.h1>
              <p className="text-base sm:text-lg text-amber-400/90 font-medium tracking-wide mt-2">
                {date}
              </p>
            </div>

            {/* Prompt */}
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full border border-amber-400/30 bg-amber-400/10 flex items-center justify-center text-amber-400 animate-pulse">
                <Lock size={18} />
              </div>
              <span className="text-xs uppercase font-extrabold tracking-widest text-stone-400 animate-bounce">
                Click anywhere to unlock terminal
              </span>
              <span className="text-[10px] text-stone-500 font-medium">Dineva OS v1.2.6</span>
            </div>
          </motion.div>
        ) : (
          /* LOGIN PANEL STATE */
          <motion.div
            key="login-screen"
            initial={{ opacity: 0, scale: 0.95, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 150, damping: 22 }}
            className="w-full max-w-md p-6 rounded-2xl glass-panel border border-white/10 shadow-2xl z-10 mx-4"
          >
            {/* Logo */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-950/20 mb-2.5">
                <ChefHat className="text-black stroke-[2.5]" size={22} />
              </div>
              <h3 className="text-sm font-black tracking-widest text-white uppercase flex items-center gap-1">
                Dineva OS <span className="text-[9px] bg-amber-950/40 text-amber-400 border border-amber-500/20 px-1 rounded-sm">POS</span>
              </h3>
            </div>

            {/* Profile Picker Dropdown */}
            <div className="mb-5">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1.5">
                Select Active Server
              </label>
              <div className="grid grid-cols-4 gap-2">
                {SERVERS.map((server, idx) => {
                  const isSelected = selectedServer.name === server.name;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedServer(server);
                        setPin("");
                        setError("");
                      }}
                      className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all ${
                        isSelected
                          ? "bg-amber-950/40 border-amber-500/40 text-amber-300 ring-1 ring-amber-500/20"
                          : "bg-stone-900/30 border-white/5 text-stone-400 hover:border-white/10 hover:text-stone-300"
                      }`}
                    >
                      <span className="text-lg mb-1">{server.avatar}</span>
                      <span className="text-[8px] font-bold truncate w-full tracking-wide">
                        {server.name.split(" ")[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Credentials / PIN Output */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-500">
                  <KeyRound size={14} />
                </div>
                <input
                  type="password"
                  disabled
                  placeholder="Enter 4-digit PIN (Try '1234')"
                  value={pin ? "•".repeat(pin.length) : ""}
                  className="w-full pl-9 pr-3 py-2.5 text-center text-sm font-semibold tracking-widest rounded-lg glass-input bg-stone-950/60 font-mono disabled:opacity-100"
                />
              </div>

              {error && (
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-red-400 bg-red-950/30 border border-red-500/10 px-2.5 py-1.5 rounded-lg">
                  <ShieldAlert size={12} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Hardware Numeric Keypad */}
              <div className="grid grid-cols-3 gap-2 py-1 max-w-[280px] mx-auto">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleKeypadPress(num)}
                    className="h-11 rounded-lg bg-stone-900/50 hover:bg-stone-900/80 active:bg-amber-500 active:text-black border border-white/5 active:border-amber-400 hover:border-white/10 font-bold font-mono text-sm transition-all duration-75 flex items-center justify-center"
                  >
                    {num}
                  </button>
                ))}
                
                {/* Clear */}
                <button
                  type="button"
                  onClick={handleClear}
                  className="h-11 rounded-lg bg-red-950/10 hover:bg-red-950/30 text-red-400 border border-red-500/10 font-semibold text-xs transition-all flex items-center justify-center"
                >
                  CLR
                </button>
                
                {/* 0 */}
                <button
                  type="button"
                  onClick={() => handleKeypadPress("0")}
                  className="h-11 rounded-lg bg-stone-900/50 hover:bg-stone-900/80 active:bg-amber-500 active:text-black border border-white/5 active:border-amber-400 hover:border-white/10 font-bold font-mono text-sm transition-all duration-75 flex items-center justify-center"
                >
                  0
                </button>

                {/* Backspace */}
                <button
                  type="button"
                  onClick={handleBackspace}
                  className="h-11 rounded-lg bg-stone-900/30 hover:bg-stone-900/50 text-stone-400 border border-white/5 font-semibold text-xs transition-all flex items-center justify-center"
                >
                  ⌫
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLocked(true)}
                  className="px-4 py-2.5 rounded-xl border border-white/5 bg-stone-900/40 text-stone-400 hover:text-white hover:bg-stone-900/80 font-bold uppercase tracking-wider text-[10px] transition-all"
                >
                  Lock
                </button>
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="flex-1 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-black font-bold uppercase tracking-wider text-[10px] transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-amber-950/20 active:scale-[0.99] disabled:opacity-50"
                >
                  {isLoggingIn ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <UserCheck size={13} className="stroke-[2.5]" /> Unlock Session
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
