import { create } from 'zustand';

export interface UserProfile {
  _id?: string;
  email: string;
  name: string;
  zipCode: string;
  homeType: 'Apartment' | 'Townhouse' | 'Detached';
  baselineFootprint: number;
  currentScore: number;
}

export interface ActivityLogItem {
  _id?: string;
  weekNumber: number;
  electricityKwh: number;
  gasTherms: number;
  carMiles: number;
  evMiles: number;
  composted: boolean;
  loggedAt: string;
}

export interface AnomalyItem {
  _id?: string;
  metricSource: 'electricity' | 'gas' | 'water';
  deviationPercentage: number;
  explanation: string;
  resolved: boolean;
  detectedAt: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

interface AppState {
  view: 'auth' | 'onboarding' | 'app';
  tab: 'dash' | 'weekly-log' | 'simulator' | 'coach';
  user: UserProfile | null;
  logsList: ActivityLogItem[];
  anomaly: AnomalyItem | null;
  gridCleanState: boolean;
  sim: {
    temp: number;
    charge: number;
    compost: number;
  };
  chat: ChatMessage[];
  setView: (view: 'auth' | 'onboarding' | 'app') => void;
  setTab: (tab: 'dash' | 'weekly-log' | 'simulator' | 'coach') => void;
  setUser: (user: UserProfile | null) => void;
  setLogsList: (logs: ActivityLogItem[]) => void;
  setAnomaly: (anomaly: AnomalyItem | null) => void;
  setGridCleanState: (state: boolean) => void;
  updateSim: (key: 'temp' | 'charge' | 'compost', val: number) => void;
  appendMessage: (role: 'user' | 'model', text: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  view: 'auth',
  tab: 'dash',
  user: null,
  logsList: [],
  anomaly: null,
  gridCleanState: true,
  sim: {
    temp: 72,
    charge: 80,
    compost: 30
  },
  chat: [
    {
      role: 'model',
      text: "Hi Guntass, I'm here to help you audit your carbon footprint. Select one of the quick actions below, or ask me a direct question about your household utility spikes."
    }
  ],
  setView: (view) => set({ view }),
  setTab: (tab) => set({ tab }),
  setUser: (user) => set({ user }),
  setLogsList: (logsList) => set({ logsList }),
  setAnomaly: (anomaly) => set({ anomaly }),
  setGridCleanState: (gridCleanState) => set({ gridCleanState }),
  updateSim: (key, val) => set((state) => ({ sim: { ...state.sim, [key]: val } })),
  appendMessage: (role, text) => set((state) => ({ chat: [...state.chat, { role, text }] }))
}));
