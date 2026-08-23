import { create } from 'zustand';

interface SearchStore {
  isOpen: boolean;
  query: string;
  recentSearches: string[];
  openSearch: () => void;
  closeSearch: () => void;
  setQuery: (query: string) => void;
  addRecentSearch: (search: string) => void;
  clearRecentSearches: () => void;
}

export const useSearchStore = create<SearchStore>((set) => ({
  isOpen: false,
  query: '',
  recentSearches: ['Goa trip receipts', 'Samsung AC warranty card', 'Electricity bills March 2026', 'Prescriptions'],
  openSearch: () => set({ isOpen: true }),
  closeSearch: () => set({ isOpen: false, query: '' }),
  setQuery: (query) => set({ query }),
  addRecentSearch: (search) => {
    if (!search.trim()) return;
    set((state) => {
      const filtered = state.recentSearches.filter((s) => s !== search);
      return {
        recentSearches: [search, ...filtered].slice(0, 5),
      };
    });
  },
  clearRecentSearches: () => set({ recentSearches: [] }),
}));
