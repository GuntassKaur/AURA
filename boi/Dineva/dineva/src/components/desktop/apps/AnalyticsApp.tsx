"use client";

import React from "react";
import { BarChart3, TrendingUp, DollarSign, Users, Award, ShieldCheck } from "lucide-react";

export default function AnalyticsApp() {
  const popularDishes = [
    { name: "Espresso Martini", sales: 52, percentage: 85, color: "bg-amber-400" },
    { name: "Truffle Gnocchi", sales: 48, percentage: 78, color: "bg-amber-500" },
    { name: "Wagyu Ribeye Steak", sales: 38, percentage: 62, color: "bg-orange-500" },
    { name: "Dry-Aged Burger", sales: 36, percentage: 58, color: "bg-red-500" },
    { name: "Charcuterie Board", sales: 22, percentage: 35, color: "bg-stone-500" },
  ];

  const hourlyTraffic = [
    { hour: "5 PM", height: "h-12", active: false },
    { hour: "6 PM", height: "h-24", active: false },
    { hour: "7 PM", height: "h-36", active: true },
    { hour: "8 PM", height: "h-40", active: true },
    { hour: "9 PM", height: "h-32", active: false },
    { hour: "10 PM", height: "h-20", active: false },
    { hour: "11 PM", height: "h-8", active: false },
  ];

  return (
    <div className="flex h-full flex-col gap-4 text-stone-200">
      {/* Top Info Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* Sales */}
        <div className="bg-stone-900/40 border border-white/5 p-3 rounded-lg flex flex-col justify-between">
          <div className="flex justify-between items-center text-stone-400">
            <span className="text-[10px] uppercase font-semibold tracking-wider">Gross Sales</span>
            <DollarSign size={13} className="text-emerald-500" />
          </div>
          <div className="mt-1">
            <span className="text-lg font-bold font-mono">$3,485.20</span>
            <span className="text-[10px] text-emerald-400 flex items-center gap-0.5 mt-0.5">
              <TrendingUp size={10} /> +14.2% today
            </span>
          </div>
        </div>

        {/* Guest count */}
        <div className="bg-stone-900/40 border border-white/5 p-3 rounded-lg flex flex-col justify-between">
          <div className="flex justify-between items-center text-stone-400">
            <span className="text-[10px] uppercase font-semibold tracking-wider">Total Guests</span>
            <Users size={13} className="text-blue-500" />
          </div>
          <div className="mt-1">
            <span className="text-lg font-bold font-mono">112</span>
            <span className="text-[10px] text-stone-400 block mt-0.5">Avg: 3.4 guests/table</span>
          </div>
        </div>

        {/* Avg ticket */}
        <div className="bg-stone-900/40 border border-white/5 p-3 rounded-lg flex flex-col justify-between">
          <div className="flex justify-between items-center text-stone-400">
            <span className="text-[10px] uppercase font-semibold tracking-wider">Avg. Ticket</span>
            <Award size={13} className="text-amber-500" />
          </div>
          <div className="mt-1">
            <span className="text-lg font-bold font-mono">$62.50</span>
            <span className="text-[10px] text-emerald-400 flex items-center gap-0.5 mt-0.5">
              <TrendingUp size={10} /> +2.1% this hour
            </span>
          </div>
        </div>

        {/* Live status */}
        <div className="bg-stone-900/40 border border-white/5 p-3 rounded-lg flex flex-col justify-between">
          <div className="flex justify-between items-center text-stone-400">
            <span className="text-[10px] uppercase font-semibold tracking-wider">OS Health</span>
            <ShieldCheck size={13} className="text-amber-400" />
          </div>
          <div className="mt-1">
            <span className="text-sm font-bold text-emerald-400">OPTIMAL</span>
            <span className="text-[10px] text-stone-400 block mt-0.5">Ping: 12ms (Offline Ready)</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Popular Dishes */}
        <div className="bg-stone-900/30 border border-white/5 rounded-lg p-3 flex flex-col justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-500 flex items-center gap-1.5 mb-3">
            <BarChart3 size={12} /> Menu Engineering (Tonight)
          </h4>
          <div className="space-y-2 flex-1 flex flex-col justify-center">
            {popularDishes.map((dish, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-stone-300 font-medium">{dish.name}</span>
                  <span className="font-mono text-stone-400">{dish.sales} orders</span>
                </div>
                <div className="w-full h-1.5 bg-stone-950 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${dish.color}`}
                    style={{ width: `${dish.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Peak Hours */}
        <div className="bg-stone-900/30 border border-white/5 rounded-lg p-3 flex flex-col justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-500 flex items-center gap-1.5 mb-2">
            <TrendingUp size={12} /> Hourly Table Occupancy
          </h4>
          
          <div className="flex items-end justify-between flex-1 h-[120px] pt-4 px-2">
            {hourlyTraffic.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1.5 flex-1">
                <div className="w-full px-1.5 flex items-end justify-center h-[90px]">
                  <div
                    className={`w-full rounded-t-sm transition-all duration-500 ${
                      item.active
                        ? "bg-amber-400 shadow-[0_0_12px_rgba(226,177,60,0.3)]"
                        : "bg-stone-700/50 hover:bg-stone-600"
                    } ${item.height}`}
                  />
                </div>
                <span className="text-[9px] text-stone-400 font-mono tracking-tighter shrink-0">{item.hour}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
