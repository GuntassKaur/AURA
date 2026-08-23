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
          <div className="flex items-center space-x-2.5 px-4 py-2 rounded-full bg-accent-warm/15 border border-accent-warm/40 text-accent-warm shadow-[0_0_20px_rgba(245,158,11,0.2)] font-sans">
            <span className="w-2.5 h-2.5 rounded-full bg-accent-warm animate-pulse" />
            <span className="text-xs font-semibold text-text-primary tracking-tight">{data.title}</span>
          </div>
        );

      case 'photo':
        return (
          <div className="flex items-center space-x-2.5 p-1.5 pr-3.5 rounded-2xl bg-bg-surface border border-white/15 overflow-hidden shadow-xl font-sans">
            <img 
              src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=200&q=80" 
              alt={data.title}
              className="w-7 h-7 rounded-xl object-cover"
            />
            <span className="text-xs font-medium text-text-primary">{data.title}</span>
          </div>
        );

      case 'invoice':
        return (
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-bg-surface border border-white/10 text-text-primary font-mono-meta text-[11px] shadow-md">
            <FileText size={13} className="text-accent-warm" />
            <span>{data.title}</span>
          </div>
        );

      case 'medical':
        return (
          <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-accent-rose/15 border border-accent-rose/30 text-accent-rose text-xs shadow-md font-sans">
            <Heart size={13} className="text-accent-rose" />
            <span className="font-semibold text-text-primary">{data.title}</span>
          </div>
        );

      case 'warranty':
        return (
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-accent-success/15 border border-accent-success/30 text-accent-success text-xs shadow-md font-sans">
            <Shield size={13} className="text-accent-success" />
            <span className="font-semibold text-text-primary">{data.title}</span>
          </div>
        );

      case 'subscription':
        return (
          <div className="flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-bg-surface border border-white/15 text-xs shadow-md font-sans">
            <span className="w-2 h-2 rounded-full bg-accent-primary animate-ping" />
            <span className="font-semibold text-text-primary">{data.title}</span>
          </div>
        );

      case 'person':
        return (
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/15 text-xs shadow-md font-sans">
            <User size={13} className="text-text-secondary" />
            <span className="font-semibold text-text-primary">{data.title}</span>
          </div>
        );

      case 'ai_insight':
      default:
        return (
          <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-accent-primary/20 border border-accent-primary/40 text-xs shadow-lg font-sans">
            <Sparkles size={13} className="text-accent-primary" />
            <span className="font-semibold text-text-primary">{data.title}</span>
          </div>
        );
    }
  };

  return (
    <div 
      className={`cursor-pointer transition-all duration-300 ${
        isMatched ? 'opacity-100' : 'opacity-20'
      } ${selected ? 'scale-105 ring-2 ring-accent-primary rounded-full' : 'hover:scale-102'}`}
    >
      <Handle type="target" position={Position.Left} className="opacity-0 w-0 h-0" />
      {renderNodeShape()}
      <Handle type="source" position={Position.Right} className="opacity-0 w-0 h-0" />
    </div>
  );
}
