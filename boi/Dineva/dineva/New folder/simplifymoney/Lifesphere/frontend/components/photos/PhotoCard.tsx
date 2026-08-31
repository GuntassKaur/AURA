'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Camera, Sparkles, Users, ArrowRight } from 'lucide-react';
import { PhotoData, usePhotoStore } from '@/store/usePhotoStore';
import { useLifeDataStore } from '@/store/useLifeDataStore';

interface PhotoCardProps {
  photo: PhotoData;
  index?: number;
}

export default function PhotoCard({ photo, index = 0 }: PhotoCardProps) {
  const { setOpenedPhoto, searchQuery } = usePhotoStore();
  const { memories } = useLifeDataStore();

  const connectedMemory = photo.connectedMemoryId
    ? memories.find(m => m.id === photo.connectedMemoryId)
    : null;

  const isMatched = searchQuery
    ? photo.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      photo.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      photo.detectedObjects.some(o => o.toLowerCase().includes(searchQuery.toLowerCase()))
    : true;

  // Variable height for organic editorial rhythm
  const heightClass = index % 3 === 0 ? 'h-80' : index % 2 === 0 ? 'h-64' : 'h-72';

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 220, damping: 26 }}
      onClick={() => setOpenedPhoto(photo)}
      className={`relative rounded-3xl overflow-hidden cursor-pointer flex flex-col justify-between p-4 transition-all duration-300 group shadow-xs ${heightClass} border border-[#E5E3DC] hover:border-[#5B5CE2]/50 ${
        isMatched ? 'opacity-100' : 'opacity-25'
      }`}
    >
      <img 
        src={photo.imageUrl} 
        alt={photo.title} 
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#17181C]/90 via-[#17181C]/30 to-[#17181C]/20 opacity-80 group-hover:opacity-95 transition-opacity" />

      {/* Top Header: Context Badge */}
      <div className="relative z-10 flex justify-between items-start">
        {connectedMemory ? (
          <span className="bg-white/95 backdrop-blur-md text-[#5B5CE2] text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
            <Sparkles size={10} />
            <span>{connectedMemory.title}</span>
          </span>
        ) : (
          <span className="bg-white/90 backdrop-blur-md text-[#17181C] text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
            {photo.category}
          </span>
        )}

        <span className="bg-black/40 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded-full">
          {photo.date}
        </span>
      </div>

      {/* Bottom Footer: Moment Information & Relationship Reveal */}
      <div className="relative z-10 space-y-1.5 text-left text-white">
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#E8E7FF]">
          <MapPin size={11} className="text-[#E8E7FF] shrink-0" />
          <span className="truncate">{photo.location}</span>
        </div>
        
        <h3 className="text-base font-serif font-bold tracking-tight leading-snug">
          {photo.title}
        </h3>

        {/* Hover Context: People & EXIF */}
        <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-[#F7F6F2]/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {photo.people && photo.people.length > 0 ? (
            <div className="flex items-center gap-1">
              <Users size={10} />
              <span>{photo.people.join(', ')}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <Camera size={10} />
              <span>{photo.exif?.camera || 'Digital Capture'}</span>
            </div>
          )}

          <span className="text-[#E8E7FF] font-semibold flex items-center gap-0.5">
            Inspect <ArrowRight size={10} />
          </span>
        </div>
      </div>
    </motion.div>
  );
}
