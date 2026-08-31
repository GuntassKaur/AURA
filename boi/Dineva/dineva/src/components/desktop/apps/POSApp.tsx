"use client";

import React, { useState } from "react";
import { Coffee, DollarSign, Plus, Send, Users } from "lucide-react";

interface Table {
  id: number;
  name: string;
  capacity: number;
  status: "available" | "occupied" | "dirty" | "reserved";
  guests: number;
  bill: number;
  orders: { name: string; price: number; quantity: number }[];
}

interface POSAppProps {
  onSendToKitchen: (tableName: string, items: string[]) => void;
}

const INITIAL_TABLES: Table[] = [
  {
    id: 1,
    name: "Table 12",
    capacity: 4,
    status: "occupied",
    guests: 3,
    bill: 168.0,
    orders: [
      { name: "Wagyu Ribeye Steak", price: 65.0, quantity: 2 },
      { name: "Truffle Gnocchi", price: 28.0, quantity: 1 },
      { name: "Old Fashioned Cocktails", price: 18.0, quantity: 3 },
      { name: "Charcuterie Board", price: 26.0, quantity: 1 },
    ],
  },
  {
    id: 2,
    name: "Table 4 (Bar)",
    capacity: 2,
    status: "occupied",
    guests: 2,
    bill: 76.0,
    orders: [
      { name: "Dry-Aged Burger", price: 24.0, quantity: 2 },
      { name: "Craft IPA Beer", price: 9.0, quantity: 3 },
      { name: "Sweet Potato Fries", price: 9.0, quantity: 1 },
    ],
  },
  {
    id: 3,
    name: "Table 22 (Patio)",
    capacity: 6,
    status: "reserved",
    guests: 0,
    bill: 0,
    orders: [],
  },
  {
    id: 4,
    name: "Table 15",
    capacity: 4,
    status: "available",
    guests: 0,
    bill: 0,
    orders: [],
  },
  {
    id: 5,
    name: "Table 8",
    capacity: 2,
    status: "dirty",
    guests: 0,
    bill: 0,
    orders: [],
  },
  {
    id: 6,
    name: "Table 31",
    capacity: 8,
    status: "occupied",
    guests: 6,
    bill: 412.5,
    orders: [
      { name: "Seafood Platter", price: 120.0, quantity: 2 },
      { name: "Caviar Blinis", price: 95.0, quantity: 1 },
      { name: "Dom Pérignon Glass", price: 45.0, quantity: 5 },
      { name: "Oyster Dozen", price: 48.0, quantity: 1 },
    ],
  },
];

const MENU_ITEMS = [
  { name: "Truffle Fries", price: 14.0 },
  { name: "Chardonnay Glass", price: 16.0 },
  { name: "Chocolate Lava Cake", price: 12.0 },
  { name: "Espresso Martini", price: 18.0 },
];

export default function POSApp({ onSendToKitchen }: POSAppProps) {
  const [tables, setTables] = useState<Table[]>(INITIAL_TABLES);
  const [selectedTableId, setSelectedTableId] = useState<number>(1);

  const selectedTable = tables.find((t) => t.id === selectedTableId) || tables[0];

  const handleSelectTable = (id: number) => {
    setSelectedTableId(id);
  };

  const handleAddMenuItem = (itemName: string, itemPrice: number) => {
    setTables((prev) =>
      prev.map((t) => {
        if (t.id !== selectedTableId) return t;

        // If table is not occupied, occupy it
        const currentStatus = t.status === "available" || t.status === "dirty" || t.status === "reserved" ? "occupied" : t.status;
        const currentGuests = t.guests === 0 ? 2 : t.guests;

        const existingOrderIndex = t.orders.findIndex((o) => o.name === itemName);
        let newOrders = [...t.orders];

        if (existingOrderIndex > -1) {
          newOrders[existingOrderIndex] = {
            ...newOrders[existingOrderIndex],
            quantity: newOrders[existingOrderIndex].quantity + 1,
          };
        } else {
          newOrders.push({ name: itemName, price: itemPrice, quantity: 1 });
        }

        const newBill = Number((t.bill + itemPrice).toFixed(2));

        return {
          ...t,
          status: currentStatus,
          guests: currentGuests,
          orders: newOrders,
          bill: newBill,
        };
      })
    );
  };

  const handleSendToKitchen = () => {
    if (selectedTable.orders.length === 0) return;
    
    // Extract list of items for the kitchen
    const items = selectedTable.orders.map((o) => `${o.quantity}x ${o.name}`);
    onSendToKitchen(selectedTable.name, items);
  };

  const handleClearTable = () => {
    setTables((prev) =>
      prev.map((t) => {
        if (t.id !== selectedTableId) return t;
        return {
          ...t,
          status: "available",
          guests: 0,
          bill: 0,
          orders: [],
        };
      })
    );
  };

  return (
    <div className="flex h-full flex-col md:flex-row gap-4 text-stone-200">
      {/* Left Pane: Floor Plan */}
      <div className="flex-1 flex flex-col justify-between bg-stone-900/40 border border-white/5 rounded-lg p-3">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-500/80 mb-3 flex items-center gap-1.5">
            <Coffee size={14} /> Dine-In Floor Plan
          </h3>
          <div className="grid grid-cols-3 gap-2.5">
            {tables.map((table) => {
              const statusColors = {
                available: "bg-emerald-950/40 border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/30",
                occupied: "bg-amber-950/40 border-amber-500/40 text-amber-300 hover:bg-amber-900/30",
                reserved: "bg-blue-950/40 border-blue-500/30 text-blue-400 hover:bg-blue-900/30",
                dirty: "bg-red-950/40 border-red-500/30 text-red-400 hover:bg-red-900/30",
              };

              const isSelected = table.id === selectedTableId;

              return (
                <button
                  key={table.id}
                  onClick={() => handleSelectTable(table.id)}
                  className={`relative flex flex-col items-center justify-center p-3.5 rounded-lg border text-center transition-all duration-200 ${
                    statusColors[table.status]
                  } ${isSelected ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-stone-950 scale-[1.02]" : "hover:scale-[1.01]"}`}
                >
                  <span className="font-semibold text-sm">{table.name}</span>
                  <div className="flex items-center gap-1 mt-1 text-[11px] opacity-75">
                    <Users size={10} />
                    <span>{table.guests > 0 ? `${table.guests}/${table.capacity}` : `Cap: ${table.capacity}`}</span>
                  </div>
                  {table.bill > 0 && (
                    <span className="text-[11px] font-medium text-amber-400/90 mt-0.5">${table.bill}</span>
                  )}
                  {/* Status Indicator */}
                  <span className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full ${
                    table.status === "available" ? "bg-emerald-400" :
                    table.status === "occupied" ? "bg-amber-400" :
                    table.status === "reserved" ? "bg-blue-400" : "bg-red-500"
                  }`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-around items-center pt-3 border-t border-white/5 text-[11px] text-stone-400 mt-4">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" /> Available
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" /> Occupied
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500/70" /> Reserved
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" /> Dirty
          </div>
        </div>
      </div>

      {/* Right Pane: Order Detail & Fast Menu */}
      <div className="w-full md:w-64 flex flex-col justify-between bg-stone-900/60 border border-white/5 rounded-lg p-3">
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between pb-2 border-b border-white/5 mb-2">
            <div>
              <h4 className="font-bold text-stone-100">{selectedTable.name}</h4>
              <p className="text-[10px] text-stone-400">
                Status: <span className="capitalize text-amber-400">{selectedTable.status}</span>
              </p>
            </div>
            {selectedTable.bill > 0 && (
              <button
                onClick={handleClearTable}
                className="text-[10px] px-2 py-0.5 rounded border border-red-500/30 text-red-400 hover:bg-red-950/20 transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {/* Bill Items */}
          <div className="flex-1 overflow-y-auto mb-3 pr-1 space-y-1.5 min-h-[100px] max-h-[140px] md:max-h-[none]">
            {selectedTable.orders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-stone-500 text-xs py-8">
                <span>No active order</span>
                <span className="text-[10px] text-stone-600 mt-0.5">Click Menu below to add items</span>
              </div>
            ) : (
              selectedTable.orders.map((order, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs bg-white/[0.02] p-1.5 rounded border border-white/[0.03]">
                  <div>
                    <span className="font-semibold text-amber-500/90">{order.quantity}x</span> {order.name}
                  </div>
                  <span className="font-mono text-stone-400">${(order.price * order.quantity).toFixed(2)}</span>
                </div>
              ))
            )}
          </div>

          {/* Quick Menu Addition */}
          <div className="border-t border-white/5 pt-2 mb-2">
            <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider block mb-1.5">Quick Add Items</span>
            <div className="grid grid-cols-2 gap-1.5">
              {MENU_ITEMS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAddMenuItem(item.name, item.price)}
                  className="flex items-center justify-between p-1 px-2 rounded bg-stone-800/40 border border-white/5 hover:border-amber-500/30 text-left hover:bg-stone-800/80 transition-all text-[11px]"
                >
                  <span className="truncate mr-1">{item.name}</span>
                  <Plus size={10} className="text-amber-500 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Total & Action */}
        <div className="border-t border-white/5 pt-2 mt-auto">
          <div className="flex justify-between items-center mb-2.5 font-semibold text-sm">
            <span>Subtotal:</span>
            <span className="font-mono text-amber-400 flex items-center"><DollarSign size={13} />{selectedTable.bill.toFixed(2)}</span>
          </div>
          <button
            onClick={handleSendToKitchen}
            disabled={selectedTable.orders.length === 0}
            className={`w-full py-2 px-3 rounded flex items-center justify-center gap-1.5 text-xs font-semibold text-black transition-all ${
              selectedTable.orders.length === 0
                ? "bg-stone-800 text-stone-500 cursor-not-allowed border border-white/5"
                : "bg-amber-400 hover:bg-amber-500 active:scale-[0.99] shadow-lg shadow-amber-950/20"
            }`}
          >
            <Send size={12} /> Send to Kitchen
          </button>
        </div>
      </div>
    </div>
  );
}
