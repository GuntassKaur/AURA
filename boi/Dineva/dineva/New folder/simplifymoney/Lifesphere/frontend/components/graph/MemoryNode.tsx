'use client';

import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Sparkles, FileText, Shield, Heart, User } from 'lucide-react';
import { useGraphStore, GraphNodeData } from '@/store/useGraphStore';

interface MemoryNodeProps {
  data: GraphNodeData;
  selected?: boolean;
}

export default function MemoryNode({ data, selected }: MemoryNodeProps) {
  const { searchQuery } = useGraphStore();
  
  const isMatched = searchQuery 
    ? data.title.toLowerCase().includes(searchQuery.toLowerCase()) || data.category.toLowerCase().includes(searchQuery.toLowerCase())
    : true;

  const renderNodeShape = () => {
    switch (data.type) {
      case 'trip':
        return (
          <div className="flex items-center space-x-2.5 px-4 py-2 rounded-full bg-[#FFFFFF] border-2 border-[#5B5CE2] text-[#5B5CE2] shadow-xs font-sans">
            <span className="w-2.5 h-2.5 rounded-full bg-[#5B5CE2]" />
            <span className="text-xs font-bold text-[#17181C] tracking-tight">{data.title}</span>
          </div>
        );

      case 'photo':
        return (
          <div className="flex items-center space-x-2.5 p-1.5 pr-3.5 rounded-2xl bg-[#FFFFFF] border border-[#E5E3DC] overflow-hidden shadow-xs font-sans">
            <img 
              src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=200&q=80" 
              alt={data.title}
              className="w-7 h-7 rounded-xl object-cover"
            />
            <span className="text-xs font-medium text-[#17181C]">{data.title}</span>
          </div>
        );

      case 'invoice':
        return (
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#FFFFFF] border border-[#E5E3DC] text-[#17181C] font-mono text-[11px] shadow-xs">
            <FileText size={13} className="text-[#E9A23B]" />
            <span>{data.title}</span>
          </div>
        );

      case 'medical':
        return (
          <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#FBE8EB] border border-[#E98291]/40 text-[#E98291] text-xs shadow-xs font-sans">
            <Heart size={13} className="text-[#E98291]" />
            <span className="font-semibold text-[#17181C]">{data.title}</span>
          </div>
        );

      case 'warranty':
        return (
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#E2F3EC] border border-[#3A9D78]/30 text-[#3A9D78] text-xs shadow-xs font-sans">
            <Shield size={13} className="text-[#3A9D78]" />
            <span className="font-semibold text-[#17181C]">{data.title}</span>
          </div>
        );

      case 'subscription':
        return (
          <div className="flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-[#FFFFFF] border border-[#E5E3DC] text-xs shadow-xs font-sans">
            <span className="w-2 h-2 rounded-full bg-[#5B5CE2]" />
            <span className="font-semibold text-[#17181C]">{data.title}</span>
          </div>
        );

      case 'person':
        return (
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#FFFFFF] border border-[#E5E3DC] text-xs shadow-xs font-sans">
            <User size={13} className="text-[#6B6D73]" />
            <span className="font-semibold text-[#17181C]">{data.title}</span>
          </div>
        );

      case 'ai_insight':
      default:
        return (
          <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#E8E7FF] border border-[#5B5CE2]/30 text-xs shadow-xs font-sans">
            <Sparkles size={13} className="text-[#5B5CE2]" />
            <span className="font-semibold text-[#17181C]">{data.title}</span>
          </div>
        );
    }
  };

  return (
    <div 
      className={`cursor-pointer transition-all duration-300 ${
        isMatched ? 'opacity-100' : 'opacity-20'
      } ${selected ? 'scale-105 ring-2 ring-[#5B5CE2] rounded-full' : 'hover:scale-102'}`}
    >
      <Handle type="target" position={Position.Left} className="opacity-0 w-0 h-0" />
      {renderNodeShape()}
      <Handle type="source" position={Position.Right} className="opacity-0 w-0 h-0" />
    </div>
  );
}

