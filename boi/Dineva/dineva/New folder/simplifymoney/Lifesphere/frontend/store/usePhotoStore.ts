import { create } from 'zustand';

export interface PhotoData {
  id: string;
  title: string;
  category: 'trip' | 'people' | 'places' | 'receipts' | 'nature';
  date: string;
  location: string;
  confidenceScore: number;
  summary: string;
  exif: {
    camera: string;
    aperture: string;
    exposure: string;
    iso: string;
  };
  detectedObjects: string[];
  people?: string[];
  gradient: string; // Gorgeous background gradient fallback
  imageUrl?: string;
}

interface PhotoStore {
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  selectedPhoto: PhotoData | null;
  setSelectedPhoto: (photo: PhotoData | null) => void;
  openedPhoto: PhotoData | null;
  setOpenedPhoto: (photo: PhotoData | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const usePhotoStore = create<PhotoStore>((set) => ({
  activeCategory: 'all',
  setActiveCategory: (activeCategory) => set({ activeCategory }),
  selectedPhoto: null,
  setSelectedPhoto: (selectedPhoto) => set({ selectedPhoto }),
  openedPhoto: null,
  setOpenedPhoto: (openedPhoto) => set({ openedPhoto }),
  searchQuery: '',
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}));
