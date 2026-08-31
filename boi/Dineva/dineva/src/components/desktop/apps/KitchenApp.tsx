"use client";

import React from "react";
import { Check, Clock, Flame, ShieldAlert } from "lucide-react";

export interface KitchenTicket {
  id: string;
  tableName: string;
  items: string[];
  timeAdded: Date;
  status: "cooking" | "ready";
}

interface KitchenAppProps {
  tickets: KitchenTicket[];
  onCompleteTicket: (ticketId: string) => void;
}

export default function KitchenApp({ tickets, onCompleteTicket }: KitchenAppProps) {
  // Simple helper to format time elapsed
  const getMinutesElapsed = (timeAdded: Date) => {
    const diffMs = new Date().getTime() - new Date(timeAdded).getTime();
    return Math.floor(diffMs / 60000);
  };

  return (
    <div className="flex h-full flex-col text-stone-200">
      {/* Header Info */}
      <div className="flex items-center justify-between pb-2 border-b border-white/5 mb-3">
        <div className="flex items-center gap-2">
          <Flame size={16} className="text-red-500 animate-pulse" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-red-400">
            Active Kitchen Tickets ({tickets.length})
          </h3>
        </div>
        <span className="text-[10px] bg-red-950/40 border border-red-500/20 text-red-300 px-2 py-0.5 rounded-full font-mono">
          Live Sync Active
        </span>
      </div>

      {/* Ticket Grid */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden flex gap-3.5 pb-2 scrollbar-thin">
        {tickets.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-stone-500 py-12">
            <ShieldAlert size={28} className="text-stone-600 mb-2" />
            <span className="text-sm font-medium">All clear! No pending orders.</span>
            <span className="text-[10px] text-stone-600 mt-0.5">Send a ticket from the POS window.</span>
          </div>
        ) : (
          tickets.map((ticket) => {
            const minutes = getMinutesElapsed(ticket.timeAdded);
            let timeColor = "text-emerald-400 bg-emerald-950/20 border-emerald-500/10";
            let borderColor = "border-white/10";

            if (minutes >= 10) {
              timeColor = "text-red-400 bg-red-950/30 border-red-500/30 animate-pulse";
              borderColor = "border-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.1)]";
            } else if (minutes >= 5) {
              timeColor = "text-amber-400 bg-amber-950/25 border-amber-500/20";
              borderColor = "border-amber-500/20";
            }

            return (
              <div
                key={ticket.id}
                style={{ contentVisibility: "auto" }}
                className={`w-56 shrink-0 flex flex-col justify-between bg-stone-900/50 border rounded-lg overflow-hidden transition-all duration-200 ${borderColor}`}
              >
                {/* Ticket Header */}
                <div className="bg-stone-950/70 p-2.5 flex justify-between items-center border-b border-white/5">
                  <div>
                    <h4 className="font-bold text-stone-200 text-xs tracking-wide">{ticket.tableName}</h4>
                    <span className="text-[9px] text-stone-400 font-mono">ID: #{ticket.id.slice(0, 4)}</span>
                  </div>
                  <div className={`flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded border ${timeColor}`}>
                    <Clock size={9} />
                    <span>{minutes}m</span>
                  </div>
                </div>

                {/* Ticket Items */}
                <div className="flex-1 p-2.5 overflow-y-auto space-y-1.5 min-h-[120px]">
                  {ticket.items.map((item, idx) => (
                    <div key={idx} className="text-xs text-stone-300 flex items-start gap-1.5 border-b border-white/[0.02] pb-1">
                      <span className="font-bold text-red-400 shrink-0 select-none">•</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                {/* Ticket Action */}
                <div className="p-2 bg-stone-950/30 border-t border-white/5">
                  <button
                    onClick={() => onCompleteTicket(ticket.id)}
                    className="w-full py-1.5 rounded bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-black font-semibold text-xs flex items-center justify-center gap-1 transition-all"
                  >
                    <Check size={12} className="stroke-[3]" /> Serve Order
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
