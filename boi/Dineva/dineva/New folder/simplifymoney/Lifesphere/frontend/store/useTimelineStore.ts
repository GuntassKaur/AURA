import { create } from 'zustand';

export type TimelineZoomLevel = 'year' | 'month' | 'week' | 'day';
export type TimelineFilter = 'all' | 'financial' | 'medical' | 'travel' | 'documents' | 'photos' | 'subscriptions' | 'personal';

export interface MemoryCapsuleData {
  id: string;
  title: string;
  type: 'trip' | 'passport' | 'payment' | 'medical' | 'purchase' | 'photos' | 'warranty';
  category: TimelineFilter;
  date: string;
  location: string;
  confidenceScore: number; // 0-100
  summary: string;
  relatedDocsCount: number;
  photoCount?: number;
  expenseCount?: number;
  totalExpense?: string;
  metadata?: Record<string, unknown>;
}

interface TimelineStore {
  zoomLevel: TimelineZoomLevel;
  setZoomLevel: (zoom: TimelineZoomLevel) => void;
  activeFilter: TimelineFilter;
  setActiveFilter: (filter: TimelineFilter) => void;
  selectedCapsule: MemoryCapsuleData | null;
  setSelectedCapsule: (capsule: MemoryCapsuleData | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const useTimelineStore = create<TimelineStore>((set) => ({
  zoomLevel: 'month',
  setZoomLevel: (zoomLevel) => set({ zoomLevel }),
  activeFilter: 'all',
  setActiveFilter: (activeFilter) => set({ activeFilter }),
  selectedCapsule: null,
  setSelectedCapsule: (selectedCapsule) => set({ selectedCapsule }),
  searchQuery: '',
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}));
