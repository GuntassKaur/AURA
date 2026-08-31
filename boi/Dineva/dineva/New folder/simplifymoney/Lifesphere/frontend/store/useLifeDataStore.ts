import { create } from 'zustand';
import {
  ConnectedDoc,
  ConnectedExpense,
  ConnectedMemory,
  ConnectedPhoto,
  ConnectedSubscription,
  ConnectedUpcomingItem,
  INITIAL_DOCUMENTS,
  INITIAL_EXPENSES,
  INITIAL_MEMORIES,
  INITIAL_PHOTOS,
  INITIAL_SUBSCRIPTIONS,
  INITIAL_UPCOMING,
} from '@/lib/data';

export interface LifeCircle {
  id: string;
  name: string;
  description: string;
  category: 'Family' | 'Travel' | 'College' | 'Personal';
  privacy: 'Circle Members' | 'Only Me' | 'Selected People';
  members: Array<{ name: string; avatar: string; role: 'Admin' | 'Member' }>;
  connectedMemories: string[];
  sharedCounts: { photos: number; expenses: string; documents: number };
}

const INITIAL_CIRCLES: LifeCircle[] = [
  {
    id: 'circle-family',
    name: 'Family Life Circle',
    description: 'Shared family milestones, home appliance warranties, and annual holiday memories.',
    category: 'Family',
    privacy: 'Circle Members',
    members: [
      { name: 'Guntass (You)', avatar: 'GK', role: 'Admin' },
      { name: 'Mom', avatar: 'MK', role: 'Member' },
      { name: 'Dad', avatar: 'PK', role: 'Member' },
      { name: 'Brother (Angad)', avatar: 'AK', role: 'Member' }
    ],
    connectedMemories: ['Family Birthday Celebration', 'Samsung Split AC Warranty'],
    sharedCounts: { photos: 48, expenses: '₹58,800', documents: 4 }
  },
  {
    id: 'circle-goa',
    name: 'Goa Coastal Journey 2026',
    description: 'Shared trip pool — beach photos, Taj Exotica invoice, coastal roadtrip logs & split expenses.',
    category: 'Travel',
    privacy: 'Circle Members',
    members: [
      { name: 'Guntass (You)', avatar: 'GK', role: 'Admin' },
      { name: 'Aman Gupta', avatar: 'AG', role: 'Member' },
      { name: 'Rhea Sen', avatar: 'RS', role: 'Member' }
    ],
    connectedMemories: ['Goa Coastal Journey'],
    sharedCounts: { photos: 128, expenses: '₹18,400', documents: 2 }
  },
  {
    id: 'circle-college',
    name: 'Bangalore Tech Squad',
    description: 'Internship milestones, team demo presentations, codebase releases & tech cafe meetups.',
    category: 'College',
    privacy: 'Circle Members',
    members: [
      { name: 'Guntass (You)', avatar: 'GK', role: 'Admin' },
      { name: 'Rahul Sharma', avatar: 'RS', role: 'Member' },
      { name: 'Priya Menon', avatar: 'PM', role: 'Member' }
    ],
    connectedMemories: ['College Internship Milestone'],
    sharedCounts: { photos: 34, expenses: '₹45,000', documents: 3 }
  }
];

interface LifeDataStore {
  documents: ConnectedDoc[];
  photos: ConnectedPhoto[];
  memories: ConnectedMemory[];
  expenses: ConnectedExpense[];
  subscriptions: ConnectedSubscription[];
  upcoming: ConnectedUpcomingItem[];
  completedUpcomingIds: string[];
  circles: LifeCircle[];

  // Mutations
  addDocument: (doc: Omit<ConnectedDoc, 'id'>) => string;
  addPhoto: (photo: Omit<ConnectedPhoto, 'id'>) => string;
  addExpense: (expense: Omit<ConnectedExpense, 'id'>, memoryId?: string) => string;
  addMemory: (memory: Omit<ConnectedMemory, 'id'>) => string;
  addUpcomingItem: (item: Omit<ConnectedUpcomingItem, 'id'>) => string;
  markUpcomingDone: (id: string) => void;
  snoozeUpcoming: (id: string, days?: number) => void;
  cancelSubscription: (id: string) => void;
  addCircle: (circle: Omit<LifeCircle, 'id'>) => string;

  // Helpers
  getMemoryById: (id: string) => ConnectedMemory | undefined;
  getPhotosForMemory: (memoryId: string) => ConnectedPhoto[];
  getDocsForMemory: (memoryId: string) => ConnectedDoc[];
  getExpensesForMemory: (memoryId: string) => ConnectedExpense[];
}

export const useLifeDataStore = create<LifeDataStore>((set, get) => ({
  documents: INITIAL_DOCUMENTS,
  photos: INITIAL_PHOTOS,
  memories: INITIAL_MEMORIES,
  expenses: INITIAL_EXPENSES,
  subscriptions: INITIAL_SUBSCRIPTIONS,
  upcoming: INITIAL_UPCOMING,
  completedUpcomingIds: [],
  circles: INITIAL_CIRCLES,

  addDocument: (docData) => {
    const id = `doc-${Date.now()}`;
    const newDoc: ConnectedDoc = { ...docData, id };
    set((state) => ({ documents: [newDoc, ...state.documents] }));
    return id;
  },

  addPhoto: (photoData) => {
    const id = `photo-${Date.now()}`;
    const newPhoto: ConnectedPhoto = { ...photoData, id };
    set((state) => ({ photos: [newPhoto, ...state.photos] }));

    // If connected to a memory, link it
    if (photoData.connectedMemoryId) {
      set((state) => ({
        memories: state.memories.map((m) =>
          m.id === photoData.connectedMemoryId
            ? { ...m, photoIds: [...m.photoIds, id] }
            : m
        ),
      }));
    }
    return id;
  },

  addExpense: (expenseData, memoryId) => {
    const id = `exp-${Date.now()}`;
    const newExp: ConnectedExpense = { ...expenseData, id };
    set((state) => ({ expenses: [newExp, ...state.expenses] }));

    if (memoryId) {
      set((state) => ({
        memories: state.memories.map((m) => {
          if (m.id === memoryId) {
            const updatedExpenses = [...m.expenses, newExp];
            const sum = updatedExpenses.reduce((acc, curr) => acc + curr.amount, 0);
            return {
              ...m,
              expenses: updatedExpenses,
              totalExpense: `₹${sum.toLocaleString()}`,
            };
          }
          return m;
        }),
      }));
    }
    return id;
  },

  addMemory: (memoryData) => {
    const id = `mem-${Date.now()}`;
    const newMem: ConnectedMemory = { ...memoryData, id };
    set((state) => ({ memories: [newMem, ...state.memories] }));
    return id;
  },

  addUpcomingItem: (itemData) => {
    const id = `up-${Date.now()}`;
    const newItem: ConnectedUpcomingItem = { ...itemData, id };
    set((state) => ({ upcoming: [newItem, ...state.upcoming] }));
    return id;
  },

  markUpcomingDone: (id) => {
    set((state) => ({
      upcoming: state.upcoming.filter((u) => u.id !== id),
      completedUpcomingIds: [...state.completedUpcomingIds, id],
    }));
  },

  snoozeUpcoming: (id, days = 2) => {
    set((state) => ({
      upcoming: state.upcoming.map((u) => {
        if (u.id === id) {
          return {
            ...u,
            groupKey: 'SNOOZED',
            groupLabel: `Snoozed (${days} days)`,
            description: `${u.description} · Snoozed by ${days} days`,
          };
        }
        return u;
      }),
    }));
  },

  cancelSubscription: (id) => {
    set((state) => ({
      subscriptions: state.subscriptions.filter((s) => s.id !== id),
    }));
  },

  addCircle: (circleData) => {
    const id = `circle-${Date.now()}`;
    const newCircle = { ...circleData, id };
    set((state) => ({ circles: [newCircle, ...state.circles] }));
    return id;
  },

  getMemoryById: (id) => {
    return get().memories.find((m) => m.id === id);
  },

  getPhotosForMemory: (memoryId) => {
    const memory = get().memories.find((m) => m.id === memoryId);
    if (!memory) return [];
    return get().photos.filter((p) => memory.photoIds.includes(p.id) || p.connectedMemoryId === memoryId);
  },

  getDocsForMemory: (memoryId) => {
    const memory = get().memories.find((m) => m.id === memoryId);
    if (!memory) return [];
    return get().documents.filter((d) => memory.relatedDocIds.includes(d.id));
  },

  getExpensesForMemory: (memoryId) => {
    const memory = get().memories.find((m) => m.id === memoryId);
    return memory?.expenses || [];
  },
}));
