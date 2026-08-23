import { create } from 'zustand';
import { useGraphStore, GraphNodeData } from './useGraphStore';
import { useNotificationStore } from './useNotificationStore';
import { useSystemStore } from './useSystemStore';

export interface OrbitMessage {
  id: string;
  sender: 'user' | 'orbit';
  text: string;
  timestamp: string;
  actionCard?: {
    type: 'navigation' | 'highlight' | 'analytics' | 'reminder';
    title: string;
    description: string;
    payload?: Record<string, unknown>;
  };
}

interface OrbitStore {
  isOpen: boolean;
  messages: OrbitMessage[];
  setIsOpen: (open: boolean) => void;
  sendMessage: (text: string, setActiveTab: (tab: string) => void) => void;
  clearMessages: () => void;
}

export const useOrbitStore = create<OrbitStore>((set) => ({
  isOpen: false,
  messages: [
    {
      id: 'welcome',
      sender: 'orbit',
      text: 'Connected. Your memories, documents, and moments are ready. Ask me anything.',
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
    }
  ],
  setIsOpen: (isOpen) => set({ isOpen }),
  sendMessage: (text, setActiveTab) => {
    const userMsg: OrbitMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
    };

    set((state) => ({ messages: [...state.messages, userMsg] }));

    const command = text.toLowerCase();
    setTimeout(() => {
      let orbitText = '';
      let actionCard: OrbitMessage['actionCard'] = undefined;

      const graphStore = useGraphStore.getState();
      const notificationStore = useNotificationStore.getState();

      if (command.includes('map') || command.includes('graph') || command.includes('relations')) {
        setActiveTab('graph');
        graphStore.setViewMode('relations');
        useSystemStore.getState().setOrbState('searching');
        orbitText = 'Opening your memory map. Every connection you\'ve ever made, visible at once.';
        actionCard = {
          type: 'navigation',
          title: 'Memory Map',
          description: 'Relationship view — seeing your world as a constellation.',
          payload: { tab: 'graph' },
        };
        setTimeout(() => useSystemStore.getState().setOrbState('idle'), 1000);

      } else if (command.includes('goa') || command.includes('trip')) {
        setActiveTab('graph');
        graphStore.setViewMode('travel');
        const goaNode = { id: 'trip-goa', title: 'Trip to Goa 2026', type: 'trip', category: 'travel', date: '2026-03-10' } as GraphNodeData;
        graphStore.setSelectedNode(goaNode);
        useSystemStore.getState().setOrbState('thinking');
        orbitText = 'Found it. Your Goa trip — 31 linked moments, boarding passes, resort invoices, and 24 photos. Total spend: ₹58,400.';
        actionCard = {
          type: 'highlight',
          title: 'Goa Trip 2026',
          description: 'Travel insurance active. Departing in 24 days.',
          payload: { nodeId: 'trip-goa' },
        };
        setTimeout(() => useSystemStore.getState().setOrbState('idle'), 1200);

      } else if (command.includes('billing') || command.includes('invoice') || command.includes('spend')) {
        setActiveTab('graph');
        graphStore.setViewMode('financial');
        useSystemStore.getState().setOrbState('thinking');
        orbitText = 'Your finances this month — utility invoices, subscriptions, and an 18% rise in electricity spend compared to May.';
        actionCard = {
          type: 'analytics',
          title: 'Spending Spike Detected',
          description: 'Electricity consumption increased. June billing due.',
          payload: { view: 'financial' },
        };
        setTimeout(() => useSystemStore.getState().setOrbState('idle'), 1000);

      } else if (command.includes('sync') || command.includes('index') || command.includes('memories')) {
        useSystemStore.getState().setOrbState('thinking');
        const loaderId = notificationStore.addNotification({
          type: 'thinking',
          title: 'Syncing memories',
          message: 'Reconnecting documents, photos, and timeline events.',
        });
        orbitText = 'Syncing your memory vault. New relationships are being discovered.';

        setTimeout(() => {
          notificationStore.removeNotification(loaderId);
          useSystemStore.getState().setOrbState('success');
          notificationStore.addNotification({
            type: 'success',
            title: 'Sync complete',
            message: '12 new connections established across your memories.',
            duration: 3000,
          });
          setTimeout(() => useSystemStore.getState().setOrbState('idle'), 1000);
        }, 3000);

      } else if (command.includes('document') || command.includes('summarize') || command.includes('analyze')) {
        useSystemStore.getState().setOrbState('thinking');
        orbitText = `Orbit is understanding this document. Key dates, categories, and relationships will surface shortly.`;
        setTimeout(() => useSystemStore.getState().setOrbState('idle'), 1200);

      } else if (command.includes('photo') || command.includes('image') || command.includes('capture')) {
        setActiveTab('photos');
        orbitText = 'Opening your photo memories. Every moment, organized by time, place, and people.';
        actionCard = {
          type: 'navigation',
          title: 'Photo Memories',
          description: 'Moments captured and connected.',
          payload: { tab: 'photos' },
        };

      } else if (command.includes('timeline') || command.includes('history') || command.includes('life')) {
        setActiveTab('timeline');
        orbitText = 'Your life stream — every significant event, ordered by time. Scroll through your story.';
        actionCard = {
          type: 'navigation',
          title: 'Life Timeline',
          description: 'Your story, chapter by chapter.',
          payload: { tab: 'timeline' },
        };

      } else {
        orbitText = 'I\'m here. Try asking me to show your map, check spending, focus on your Goa trip, or sync your memories.';
      }

      const orbitMsg: OrbitMessage = {
        id: Math.random().toString(),
        sender: 'orbit',
        text: orbitText,
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
        actionCard,
      };

      set((state) => ({ messages: [...state.messages, orbitMsg] }));
    }, 800);
  },
  clearMessages: () => set({ messages: [] }),
}));
