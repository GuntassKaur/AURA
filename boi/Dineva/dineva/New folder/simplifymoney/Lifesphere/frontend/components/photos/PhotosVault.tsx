'use client';

import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { Search, Calendar, MapPin, Camera, Sparkles } from 'lucide-react';
import { PhotoData, usePhotoStore } from '@/store/usePhotoStore';
import PhotoCard from './PhotoCard';
import PhotoViewer from './PhotoViewer';

const mockPhotos: PhotoData[] = [
  {
    id: 'photo-1',
    title: 'Goa Sandy Beach Sunset',
    category: 'trip',
    date: 'April 11, 2026',
    location: 'Anjuna Beach, Goa',
    confidenceScore: 98,
    summary: 'Warm sunset scene with palm tree silhouettes and ocean horizon.',
    gradient: 'from-[#ff9e00]/30 to-[#8b5cf6]/30',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    exif: {
      camera: 'Sony Alpha 7R V',
      aperture: 'f/4.0',
      exposure: '1/250s',
      iso: '100'
    },
    detectedObjects: ['Sunset', 'Ocean', 'Palm Trees', 'Beach Scenery']
  },
  {
    id: 'photo-2',
    title: 'Samsung Split AC Receipt Snap',
    category: 'receipts',
    date: 'December 16, 2025',
    location: 'Home Residence',
    confidenceScore: 94,
    summary: 'Document capture of purchase receipt for Samsung Split AC.',
    gradient: 'from-[#00e1d9]/30 to-[#08111F]/50',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80',
    exif: {
      camera: 'iPhone 15 Pro Max',
      aperture: 'f/1.8',
      exposure: '1/60s',
      iso: '200'
    },
    detectedObjects: ['Document Paper', 'Invoice Text', 'AC Model']
  },
  {
    id: 'photo-3',
    title: 'Evening at Delhi Cafe',
    category: 'people',
    date: 'May 18, 2026',
    location: 'Cafe Delhi Heights',
    confidenceScore: 96,
    summary: 'Gathering with friends at Cafe Delhi Heights.',
    gradient: 'from-[#ff1e56]/30 to-[#8b5cf6]/30',
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    exif: {
      camera: 'iPhone 15 Pro Max',
      aperture: 'f/2.2',
      exposure: '1/30s',
      iso: '400'
    },
    detectedObjects: ['People', 'Selfie', 'Cafe Interior']
  },
  {
    id: 'photo-4',
    title: 'Vagator Beach Coastal Cliffs',
    category: 'places',
    date: 'April 13, 2026',
    location: 'Vagator, Goa',
    confidenceScore: 95,
    summary: 'Rocky coastline vista with blue sea and green cliff edges.',
    gradient: 'from-[#10b981]/30 to-[#00e1d9]/30',
    imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
    exif: {
      camera: 'Sony Alpha 7R V',
      aperture: 'f/8.0',
      exposure: '1/500s',
      iso: '100'
    },
    detectedObjects: ['Coastal Rocks', 'Sea Waves', 'Blue Sky']
  }
];

export default function PhotosVault() {
  const { 
    activeCategory, setActiveCategory, 
    selectedPhoto,
    searchQuery, setSearchQuery 
  } = usePhotoStore();

  const filteredPhotos = mockPhotos.filter(photo => {
    const matchesCat = activeCategory === 'all' || photo.category === activeCategory;
    const matchesSearch = searchQuery
      ? photo.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        photo.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        photo.detectedObjects.some(o => o.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
    return matchesCat && matchesSearch;
  });

  return (
    <div className="w-full space-y-8 pt-4 sm:pt-8 pb-24 font-sans text-left">
      
      {/* 1. Header & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/[0.06] pb-6">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Photo Gallery</span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary">Photos</h1>
        </div>

        <div className="bg-bg-surface border border-white/[0.08] rounded-full px-4 py-2 flex items-center space-x-2.5 w-full sm:w-72 shadow-lg">
          <Search size={14} className="text-text-secondary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search photo memories…"
            className="w-full bg-transparent border-none text-xs text-text-primary placeholder-text-tertiary focus:outline-none"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-6 text-sm">
        {[
          { id: 'all', label: 'All Captures' },
          { id: 'trip', label: 'Trips' },
          { id: 'people', label: 'People' },
          { id: 'places', label: 'Places' },
          { id: 'receipts', label: 'Receipts' }
        ].map(cat => {
          const active = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`transition-all font-medium cursor-pointer ${
                active 
                  ? 'text-text-primary border-b-2 border-accent-primary pb-1 font-semibold' 
                  : 'text-text-secondary hover:text-text-primary pb-1'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* 2. Masonry Gallery & Details Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* REAL MASONRY GRID */}
        <div className="lg:col-span-8 columns-1 sm:columns-2 gap-6 space-y-6">
          <AnimatePresence>
            {filteredPhotos.map((photo, idx) => (
              <PhotoCard key={photo.id} photo={photo} index={idx} />
            ))}
          </AnimatePresence>
        </div>

        {/* Selected Photo Inspector */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-bg-surface border border-white/[0.08] space-y-6 sticky top-24 shadow-2xl">
          {selectedPhoto ? (
            <div className="space-y-5">
              <div className="flex items-center space-x-2 text-xs font-semibold text-accent-primary">
                <Sparkles size={14} />
                <span>Photo Insight</span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-text-primary">{selectedPhoto.title}</h3>
                <div className="text-xs font-mono-meta text-text-secondary mt-0.5">{selectedPhoto.location} · {selectedPhoto.date}</div>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="text-xs font-semibold text-text-secondary">Memory Summary</div>
                <p className="text-xs text-text-primary leading-relaxed p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                  {selectedPhoto.summary}
                </p>
              </div>

              <div className="space-y-2 text-xs font-mono-meta text-text-secondary pt-2 border-t border-white/[0.06]">
                <div className="flex items-center space-x-2">
                  <Camera size={13} className="text-accent-primary" />
                  <span className="text-text-primary">{selectedPhoto.exif.camera}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar size={13} />
                  <span>{selectedPhoto.date}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin size={13} />
                  <span>{selectedPhoto.location}</span>
                </div>
              </div>

              <button 
                onClick={() => usePhotoStore.getState().setOpenedPhoto(selectedPhoto)}
                className="w-full py-3 bg-accent-primary hover:bg-accent-primary/90 text-white font-medium text-xs rounded-full shadow-lg shadow-accent-primary/20 transition-all cursor-pointer"
              >
                Open Immersive Viewer
              </button>
            </div>
          ) : (
            <div className="py-16 text-center text-xs text-text-secondary font-sans">
              Select a photo to inspect metadata
            </div>
          )}
        </div>

      </div>

      <PhotoViewer />
    </div>
  );
}
