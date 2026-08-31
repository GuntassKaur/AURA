import { create } from 'zustand';

export type DocumentViewMode = 'grid' | 'list' | 'gallery' | 'knowledge';
export type SmartCollectionType = 'all' | 'travel' | 'medical' | 'financial' | 'government' | 'subscriptions' | 'warranty';

export interface DocumentData {
  id: string;
  title: string;
  fileType: 'pdf' | 'image' | 'doc';
  category: SmartCollectionType;
  date: string;
  location?: string;
  confidenceScore?: number; // 0-100
  summary: string;
  ocrText: string;
  amount?: string;
  vendor?: string;
  expiryDate?: string;
  documentNo?: string;
  extractedMetadata?: {
    vendor?: string;
    amount?: string;
    expiryDate?: string;
    documentNo?: string;
    entities?: string[];
  };
  tags: string[];
}

interface DocumentStore {
  viewMode: DocumentViewMode;
  setViewMode: (mode: DocumentViewMode) => void;
  activeCollection: SmartCollectionType;
  setActiveCollection: (collection: SmartCollectionType) => void;
  selectedDoc: DocumentData | null;
  setSelectedDoc: (doc: DocumentData | null) => void;
  openedDoc: DocumentData | null; // For the Split-screen viewer
  setOpenedDoc: (doc: DocumentData | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const useDocumentStore = create<DocumentStore>((set) => ({
  viewMode: 'grid',
  setViewMode: (viewMode) => set({ viewMode }),
  activeCollection: 'all',
  setActiveCollection: (activeCollection) => set({ activeCollection }),
  selectedDoc: null,
  setSelectedDoc: (selectedDoc) => set({ selectedDoc }),
  openedDoc: null,
  setOpenedDoc: (openedDoc) => set({ openedDoc }),
  searchQuery: '',
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}));
