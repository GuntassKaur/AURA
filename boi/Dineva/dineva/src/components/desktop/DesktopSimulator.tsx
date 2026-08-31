"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Coffee, Flame, BarChart3, Clock, ChefHat, Bell, LogOut, RefreshCw } from "lucide-react";
import FloatingWindow from "./FloatingWindow";
import POSApp from "./apps/POSApp";
import KitchenApp, { KitchenTicket } from "./apps/KitchenApp";
import AnalyticsApp from "./apps/AnalyticsApp";
import { motion, AnimatePresence } from "framer-motion";

interface WindowState {
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}

interface OSToast {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning";
}

export default function DesktopSimulator() {
  const router = useRouter();

  // Desktop Time Clock State
  const [timeStr, setTimeStr] = useState("");
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDateStr(now.toLocaleDateString([], { month: 'short', day: '2-digit', year: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Windows State Management
  const [windows, setWindows] = useState<{ [key: string]: WindowState }>({
    pos: { isOpen: true, isMinimized: false, isMaximized: false, zIndex: 10 },
    kitchen: { isOpen: true, isMinimized: false, isMaximized: false, zIndex: 5 },
    analytics: { isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1 },
  });

  const [topZ, setTopZ] = useState(10);
  const [activeWindowId, setActiveWindowId] = useState<string>("pos");

  // Kitchen Tickets State (shared between POS & KDS)
  const [tickets, setTickets] = useState<KitchenTicket[]>([
    {
      id: "tk-1092",
      tableName: "Table 12",
      items: ["2x Wagyu Ribeye Steak", "1x Truffle Gnocchi", "3x Old Fashioned Cocktails"],
      timeAdded: new Date(Date.now() - 360000), // 6 mins ago
      status: "cooking",
    },
    {
      id: "tk-2831",
      tableName: "Table 4 (Bar)",
      items: ["2x Dry-Aged Burger", "3x Craft IPA Beer"],
      timeAdded: new Date(Date.now() - 120000), // 2 mins ago
      status: "cooking",
    },
  ]);

  // OS Notification Toast State
  const [toasts, setToasts] = useState<OSToast[]>([]);

  const addToast = (title: string, message: string, type: "info" | "success" | "warning" = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Bring window to focus
  const focusWindow = (windowId: string) => {
    if (activeWindowId === windowId && !windows[windowId].isMinimized) return;
    
    const nextZ = topZ + 1;
    setTopZ(nextZ);
    setActiveWindowId(windowId);
    setWindows((prev) => ({
      ...prev,
      [windowId]: {
        ...prev[windowId],
        isMinimized: false,
        zIndex: nextZ,
      },
    }));
  };

  // Window Controls Action Helpers
  const toggleWindowOpen = (windowId: string) => {
    const isCurrentlyOpen = windows[windowId].isOpen;
    if (isCurrentlyOpen) {
      if (windows[windowId].isMinimized) {
        focusWindow(windowId);
      } else {
        // If it's already open & focused, close it. Otherwise, focus it.
        if (activeWindowId === windowId) {
          setWindows((prev) => ({
            ...prev,
            [windowId]: { ...prev[windowId], isOpen: false },
          }));
        } else {
          focusWindow(windowId);
        }
      }
    } else {
      const nextZ = topZ + 1;
      setTopZ(nextZ);
      setActiveWindowId(windowId);
      setWindows((prev) => ({
        ...prev,
        [windowId]: {
          isOpen: true,
          isMinimized: false,
          isMaximized: false,
          zIndex: nextZ,
        },
      }));
      addToast(
        `Launched App`, 
        `Opened ${windowId === "pos" ? "Dineva POS" : windowId === "kitchen" ? "Kitchen KDS" : "Analytics"}`, 
        "info"
      );
    }
  };

  const minimizeWindow = (windowId: string) => {
    setWindows((prev) => ({
      ...prev,
      [windowId]: { ...prev[windowId], isMinimized: true },
    }));
  };

  const maximizeWindow = (windowId: string) => {
    setWindows((prev) => ({
      ...prev,
      [windowId]: { ...prev[windowId], isMaximized: !prev[windowId].isMaximized },
    }));
  };

  const closeWindow = (windowId: string) => {
    setWindows((prev) => ({
      ...prev,
      [windowId]: { ...prev[windowId], isOpen: false },
    }));
  };

  // Communication between POS and Kitchen KDS
  const handleSendToKitchen = (tableName: string, items: string[]) => {
    const newTicketId = "tk-" + Math.floor(1000 + Math.random() * 9000);
    const newTicket: KitchenTicket = {
      id: newTicketId,
      tableName,
      items,
      timeAdded: new Date(),
      status: "cooking",
    };
    
    setTickets((prev) => [...prev, newTicket]);
    addToast(
      "KDS Order Sent",
      `Ticket for ${tableName} sent to kitchen display successfully.`,
      "success"
    );

    // Bounce and auto-focus KDS window if minimized/closed
    if (!windows.kitchen.isOpen || windows.kitchen.isMinimized) {
      setTimeout(() => {
        toggleWindowOpen("kitchen");
      }, 500);
    }
  };

  const handleCompleteTicket = (ticketId: string) => {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;

    setTickets((prev) => prev.filter((t) => t.id !== ticketId));
    addToast(
      "Order Served", 
      `${ticket.tableName}'s order has been cleared and served.`, 
      "success"
    );
  };

  // Start Menu Dropdown State
  const [startMenuOpen, setStartMenuOpen] = useState(false);

  const handleLogout = () => {
    addToast("Logging Out", "Shutting down session...", "info");
    setTimeout(() => {
      router.push("/login");
    }, 800);
  };

  return (
    <div className="relative w-full h-[620px] rounded-2xl overflow-hidden glass-panel border border-[rgba(255,255,255,0.08)] bg-gradient-to-br from-stone-950/70 to-stone-900/40">
      
      {/* Desktop Workspace Area */}
      <div className="relative w-full h-[calc(100%-52px)] p-6 overflow-hidden">
        
        {/* Floating Windows Containers */}
        <AnimatePresence>
          {/* POS Window */}
          {windows.pos.isOpen && (
            <FloatingWindow
              key="pos"
              id="pos"
              title="Dineva POS & Seating Grid"
              isOpen={windows.pos.isOpen}
              isMinimized={windows.pos.isMinimized}
              isMaximized={windows.pos.isMaximized}
              onClose={() => closeWindow("pos")}
              onMinimize={() => minimizeWindow("pos")}
              onMaximize={() => maximizeWindow("pos")}
              onFocus={() => focusWindow("pos")}
              zIndex={windows.pos.zIndex}
              icon={<Coffee size={14} />}
              width="580px"
              height="380px"
              defaultPosition={{ x: 30, y: 30 }}
            >
              <POSApp onSendToKitchen={handleSendToKitchen} />
            </FloatingWindow>
          )}

          {/* Kitchen Display (KDS) Window */}
          {windows.kitchen.isOpen && (
            <FloatingWindow
              key="kitchen"
              id="kitchen"
              title="Kitchen Display System (KDS)"
              isOpen={windows.kitchen.isOpen}
              isMinimized={windows.kitchen.isMinimized}
              isMaximized={windows.kitchen.isMaximized}
              onClose={() => closeWindow("kitchen")}
              onMinimize={() => minimizeWindow("kitchen")}
              onMaximize={() => maximizeWindow("kitchen")}
              onFocus={() => focusWindow("kitchen")}
              zIndex={windows.kitchen.zIndex}
              icon={<Flame size={14} />}
              width="540px"
              height="340px"
              defaultPosition={{ x: 120, y: 150 }}
            >
              <KitchenApp tickets={tickets} onCompleteTicket={handleCompleteTicket} />
            </FloatingWindow>
          )}

          {/* Analytics Window */}
          {windows.analytics.isOpen && (
            <FloatingWindow
              key="analytics"
              id="analytics"
              title="Dineva OS Insights & Metrics"
              isOpen={windows.analytics.isOpen}
              isMinimized={windows.analytics.isMinimized}
              isMaximized={windows.analytics.isMaximized}
              onClose={() => closeWindow("analytics")}
              onMinimize={() => minimizeWindow("analytics")}
              onMaximize={() => maximizeWindow("analytics")}
              onFocus={() => focusWindow("analytics")}
              zIndex={windows.analytics.zIndex}
              icon={<BarChart3 size={14} />}
              width="600px"
              height="360px"
              defaultPosition={{ x: 220, y: 60 }}
            >
              <AnalyticsApp />
            </FloatingWindow>
          )}
        </AnimatePresence>

        {/* Floating OS Notifications (Toasts) */}
        <div className="absolute top-4 right-4 z-[9999] flex flex-col gap-2 w-72 pointer-events-none">
          <AnimatePresence>
            {toasts.map((toast) => (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                className="pointer-events-auto flex items-start gap-2.5 p-3 rounded-lg border bg-stone-900/90 backdrop-blur-md shadow-xl border-white/10"
              >
                <div className={`p-1.5 rounded-full mt-0.5 shrink-0 ${
                  toast.type === "success" ? "bg-emerald-500/20 text-emerald-400" :
                  toast.type === "warning" ? "bg-amber-500/20 text-amber-400" : "bg-blue-500/20 text-blue-400"
                }`}>
                  <Bell size={12} />
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="text-[11px] font-bold text-stone-200">{toast.title}</h5>
                  <p className="text-[10px] text-stone-400 mt-0.5 leading-relaxed">{toast.message}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

      </div>

      {/* OS Taskbar */}
      <div className="relative w-full h-[52px] bg-stone-950/80 backdrop-blur-xl border-t border-white/5 flex items-center justify-between px-4 z-[999]">
        
        {/* Left Side: Start Menu Button */}
        <div className="relative">
          <button
            onClick={() => setStartMenuOpen(!startMenuOpen)}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all bg-white/5 hover:bg-white/10 active:scale-95 border ${
              startMenuOpen ? "border-amber-400/50 bg-stone-900" : "border-white/5"
            }`}
          >
            <ChefHat size={18} className="text-amber-400 animate-pulse" />
          </button>

          {/* Start Menu Dropdown */}
          <AnimatePresence>
            {startMenuOpen && (
              <motion.div
                key="start-menu-dropdown"
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-11 left-0 w-56 rounded-xl border border-white/10 bg-stone-900/95 backdrop-blur-xl p-3 shadow-2xl z-[9999]"
              >
                {/* Backdrop Clicker */}
                <div className="fixed inset-0 z-[-1]" onClick={() => setStartMenuOpen(false)} />
                
                <div className="flex items-center gap-2 pb-2.5 mb-2 border-b border-white/5">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400 text-xs">
                    CH
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-200">Chef Admin</h4>
                    <p className="text-[9px] text-stone-500">Fine Dining POS Server</p>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <button
                    onClick={() => {
                      toggleWindowOpen("pos");
                      setStartMenuOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-stone-300 hover:bg-white/5 hover:text-white flex items-center gap-2"
                  >
                    <Coffee size={13} className="text-amber-400" /> Dineva POS
                  </button>
                  <button
                    onClick={() => {
                      toggleWindowOpen("kitchen");
                      setStartMenuOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-stone-300 hover:bg-white/5 hover:text-white flex items-center gap-2"
                  >
                    <Flame size={13} className="text-red-400" /> Kitchen KDS
                  </button>
                  <button
                    onClick={() => {
                      toggleWindowOpen("analytics");
                      setStartMenuOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-stone-300 hover:bg-white/5 hover:text-white flex items-center gap-2"
                  >
                    <BarChart3 size={13} className="text-blue-400" /> Insights & Analytics
                  </button>
                  <button
                    onClick={() => {
                      addToast("Dineva OS Update", "Systems are currently fully up to date.", "info");
                      setStartMenuOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-stone-300 hover:bg-white/5 hover:text-white flex items-center gap-2"
                  >
                    <RefreshCw size={13} className="text-stone-400" /> Check for OS Updates
                  </button>
                </div>

                <div className="border-t border-white/5 mt-2.5 pt-2">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-red-400 hover:bg-red-950/20 flex items-center gap-2"
                  >
                    <LogOut size={13} /> Exit Dineva OS
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Center: Dock Icons (Shortcuts) */}
        <div className="flex items-center space-x-1.5 bg-stone-900/50 px-3 py-1.5 rounded-xl border border-white/5">
          {/* POS Shortcut */}
          <button
            onClick={() => toggleWindowOpen("pos")}
            className={`w-9.5 h-8.5 rounded-md flex items-center justify-center transition-all relative ${
              windows.pos.isOpen && activeWindowId === "pos"
                ? "bg-white/10 text-amber-400 shadow-inner"
                : windows.pos.isOpen
                ? "bg-white/5 text-stone-300 hover:bg-white/10"
                : "text-stone-500 hover:bg-white/5"
            }`}
            title="Dineva POS"
          >
            <Coffee size={16} />
            {windows.pos.isOpen && (
              <span className={`absolute bottom-0.5 w-1 h-1 rounded-full ${activeWindowId === "pos" ? "bg-amber-400" : "bg-stone-500"}`} />
            )}
          </button>

          {/* Kitchen Shortcut */}
          <button
            onClick={() => toggleWindowOpen("kitchen")}
            className={`w-9.5 h-8.5 rounded-md flex items-center justify-center transition-all relative ${
              windows.kitchen.isOpen && activeWindowId === "kitchen"
                ? "bg-white/10 text-red-400 shadow-inner"
                : windows.kitchen.isOpen
                ? "bg-white/5 text-stone-300 hover:bg-white/10"
                : "text-stone-500 hover:bg-white/5"
            }`}
            title="Kitchen Display"
          >
            <Flame size={16} />
            {windows.kitchen.isOpen && (
              <span className={`absolute bottom-0.5 w-1 h-1 rounded-full ${activeWindowId === "kitchen" ? "bg-red-400" : "bg-stone-500"}`} />
            )}
          </button>

          {/* Analytics Shortcut */}
          <button
            onClick={() => toggleWindowOpen("analytics")}
            className={`w-9.5 h-8.5 rounded-md flex items-center justify-center transition-all relative ${
              windows.analytics.isOpen && activeWindowId === "analytics"
                ? "bg-white/10 text-blue-400 shadow-inner"
                : windows.analytics.isOpen
                ? "bg-white/5 text-stone-300 hover:bg-white/10"
                : "text-stone-500 hover:bg-white/5"
            }`}
            title="Insights"
          >
            <BarChart3 size={16} />
            {windows.analytics.isOpen && (
              <span className={`absolute bottom-0.5 w-1 h-1 rounded-full ${activeWindowId === "analytics" ? "bg-blue-400" : "bg-stone-500"}`} />
            )}
          </button>
        </div>

        {/* Right Side: Clock & Settings */}
        <div className="flex items-center space-x-3.5 text-stone-300">
          <div className="flex flex-col items-end justify-center h-full">
            <span className="text-[10px] font-bold font-mono tracking-tight text-stone-200">{timeStr}</span>
            <span className="text-[8px] text-stone-500 font-medium tracking-wide">{dateStr}</span>
          </div>
          <div className="h-5 w-[1px] bg-white/10" />
          <div className="flex items-center gap-1 opacity-75">
            <Clock size={14} className="text-amber-500/80" />
            <span className="text-[9px] uppercase tracking-wide text-stone-400 font-bold">14-day trial running</span>
          </div>
        </div>

      </div>
    </div>
  );
}
