'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Plane, 
  FileText, 
  CreditCard, 
  Heart, 
  ShoppingBag, 
  Image as ImageIcon, 
  ShieldCheck,
  FileCheck
} from 'lucide-react';
import { MemoryCapsuleData, useTimelineStore } from '@/store/useTimelineStore';

interface MemoryCapsuleProps {
  data: MemoryCapsuleData;
  index: number;
}

export default function MemoryCapsule({ data, index }: MemoryCapsuleProps) {
  const { selectedCapsule, setSelectedCapsule, searchQuery } = useTimelineStore();
  const isSelected = selectedCapsule?.id === data.id;

  const getIcon = (type: string) => {
    switch (type) {
      case 'trip': return <Plane size={12} className="text-[#5B5CE2]" />;
      case 'passport': return <FileText size={12} className="text-[#E9A23B]" />;
      case 'payment': return <CreditCard size={12} className="text-[#E9A23B]" />;
      case 'medical': return <Heart size={12} className="text-[#E98291]" />;
      case 'purchase': return <ShoppingBag size={12} className="text-[#3A9D78]" />;
      case 'photos': return <ImageIcon size={12} className="text-[#5B5CE2]" />;
      case 'warranty': return <ShieldCheck size={12} className="text-[#3A9D78]" />;
      default: return <FileCheck size={12} className="text-[#6B6D73]" />;
    }
  };

  const isMatched = searchQuery
    ? data.title.toLowerCase().includes(searchQuery.toLowerCase()) || data.location.toLowerCase().includes(searchQuery.toLowerCase())
    : true;

  const isAbove = index % 2 === 0;

  return (
    <div 
      className={`flex-shrink-0 w-64 flex flex-col items-center relative transition-all duration-500 font-sans ${
        isMatched ? 'opacity-100' : 'opacity-15'
      }`}
    >
      {/* 1. Connector Line & Text Content */}
      {isAbove ? (
        <div className="flex flex-col items-center justify-end h-48 pb-6">
          <motion.div
            whileHover={{ y: -2 }}
            onClick={() => setSelectedCapsule(data)}
            className="text-center space-y-1.5 cursor-pointer"
          >
            <span className="font-mono text-[10px] text-[#6B6D73]">{data.date}</span>
            <h3 className={`text-xs font-semibold leading-tight transition-colors ${isSelected ? 'text-[#5B5CE2]' : 'text-[#17181C] hover:text-[#5B5CE2]'}`}>
              {data.title}
            </h3>
            <div className="flex items-center justify-center space-x-1.5 text-[11px] text-[#6B6D73]">
              {getIcon(data.type)}
              <span className="truncate max-w-[140px]">{data.location}</span>
            </div>
          </motion.div>
          <div className="w-[1px] h-12 bg-gradient-to-t from-[#5B5CE2]/30 to-transparent mt-4" />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-start h-48 pt-6">
          <div className="w-[1px] h-12 bg-gradient-to-b from-[#5B5CE2]/30 to-transparent mb-4" />
          <motion.div
            whileHover={{ y: 2 }}
            onClick={() => setSelectedCapsule(data)}
            className="text-center space-y-1.5 cursor-pointer"
          >
            <span className="font-mono text-[10px] text-[#6B6D73]">{data.date}</span>
            <h3 className={`text-xs font-semibold leading-tight transition-colors ${isSelected ? 'text-[#5B5CE2]' : 'text-[#17181C] hover:text-[#5B5CE2]'}`}>
              {data.title}
            </h3>
            <div className="flex items-center justify-center space-x-1.5 text-[11px] text-[#6B6D73]">
              {getIcon(data.type)}
              <span className="truncate max-w-[140px]">{data.location}</span>
            </div>
          </motion.div>
        </div>
      )}

      {/* 2. Central Timeline Node Dot */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
        <motion.div 
          animate={{
            scale: isSelected ? 1.4 : 1,
          }}
          className={`w-2.5 h-2.5 rounded-full border border-[#5B5CE2]/30 bg-[#F7F6F2] transition-all duration-300 ${
            isSelected ? 'bg-[#5B5CE2] shadow-[0_0_10px_rgba(91,92,226,0.4)]' : 'hover:border-[#5B5CE2]'
          }`}
        />
      </div>
    </div>
  );
}
