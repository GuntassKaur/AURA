'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Camera } from 'lucide-react';
import { PhotoData, usePhotoStore } from '@/store/usePhotoStore';

interface PhotoCardProps {
  photo: PhotoData;
  index?: number;
}

export default function PhotoCard({ photo, index = 0 }: PhotoCardProps) {
  const { selectedPhoto, setSelectedPhoto, setOpenedPhoto, searchQuery } = usePhotoStore();
  const isSelected = selectedPhoto?.id === photo.id;

  const isMatched = searchQuery
    ? photo.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      photo.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      photo.detectedObjects.some(o => o.toLowerCase().includes(searchQuery.toLowerCase()))
    : true;

  const aspectClass = index % 4 === 0 
    ? 'h-80 sm:h-96'
    : index % 3 === 0 
    ? 'h-56 sm:h-64'
    : index % 2 === 0 
    ? 'h-72 sm:h-84'
    : 'h-60 sm:h-72';

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 200, damping: 26 }}
      onClick={() => setSelectedPhoto(photo)}
      onDoubleClick={() => setOpenedPhoto(photo)}
      className={`relative rounded-3xl overflow-hidden cursor-pointer flex flex-col justify-end transition-all duration-500 group shadow-xl mb-6 break-inside-avoid font-sans ${aspectClass} ${
        isSelected ? 'ring-2 ring-accent-primary' : 'border border-white/[0.08]'
      } ${isMatched ? 'opacity-100' : 'opacity-20'}`}
    >
      <img 
        src={photo.imageUrl} 
        alt={photo.title} 
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-all duration-700 opacity-80 group-hover:opacity-95" 
      />
      <div className="absolute inset-0 bg-gradient-to-t from-bg-base via-bg-base/20 to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />

      {/* Hover Metadata Overlay */}
      <div className="p-5 relative z-10 space-y-1.5 text-left w-full">
        <div className="flex items-center space-x-2 text-[11px] text-text-secondary font-mono-meta">
          <MapPin size={11} className="text-accent-primary" />
          <span>{photo.location} · {photo.date}</span>
        </div>
        
        <h3 className="text-sm font-bold text-text-primary tracking-tight">
          {photo.title}
        </h3>
        
        <div className="flex items-center space-x-2 text-[11px] font-mono-meta text-text-secondary pt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Camera size={11} className="text-text-secondary" />
          <span>{photo.exif.camera} · {photo.exif.aperture} · {photo.exif.exposure} · ISO {photo.exif.iso}</span>
        </div>
      </div>
    </motion.div>
  );
}
