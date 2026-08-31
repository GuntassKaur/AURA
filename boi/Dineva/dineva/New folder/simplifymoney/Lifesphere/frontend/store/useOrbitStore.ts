import { create } from 'zustand';
import { useGraphStore } from './useGraphStore';
import { useNotificationStore } from './useNotificationStore';
import { useSystemStore } from './useSystemStore';
import { useLifeDataStore } from './useLifeDataStore';

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
      text: 'Connected to your LifeSphere network. I can answer questions about your connected memories, documents, photos, expenses, and upcoming obligations.',
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
    const lifeData = useLifeDataStore.getState();

    setTimeout(() => {
      let orbitText = '';
      let actionCard: OrbitMessage['actionCard'] = undefined;

      const graphStore = useGraphStore.getState();

      if (command.includes('goa') || (command.includes('spend') && command.includes('trip')) || command.includes('how much did i spend')) {
        const goaMemory = lifeData.memories.find(m => m.title.toLowerCase().includes('goa')) || lifeData.memories[0];
        const expenses = goaMemory?.expenses || [];
        const total = goaMemory?.totalExpense || '₹18,400';
        
        let breakdownStr = expenses.map(e => `${e.title.padEnd(28)} ${e.formattedAmount}`).join('\n');
        if (!breakdownStr) {
          breakdownStr = 'Hotel Accommodation         ₹8,200\nFood & Dining               ₹4,100\nFlight (IndiGo DEL-GOI)     ₹3,800\nActivities & Rental         ₹2,300';
        }

        orbitText = `You spent ${total} in total on your Goa Coastal Journey.\n\nConnected Expenses Breakdown:\n${breakdownStr}\n\nAll 4 receipts and the IndiGo flight ticket are linked to this memory story.`;
        actionCard = {
          type: 'navigation',
          title: 'Goa Coastal Journey Story',
          description: 'View full connected timeline, 128 photos and hotel documents.',
          payload: { tab: 'timeline' },
        };

      } else if (command.includes('passport') || (command.includes('expire') && command.includes('document'))) {
        const passport = lifeData.documents.find(d => d.id === 'doc-passport');
        orbitText = `Your Indian Passport (No. ${passport?.documentNo || 'Z4928104'}) expires on ${passport?.expiryDate || '18 Sep 2026'} — 18 days from today.\n\nRecommendation: Submit online renewal before the first week of September to prevent disruptions to upcoming international bookings.`;
        actionCard = {
          type: 'navigation',
          title: 'Indian Passport Document',
          description: 'View scanned document and renewal instructions.',
          payload: { tab: 'documents' },
        };

      } else if (command.includes('payment') || command.includes('bill') || command.includes('due') || command.includes('upcoming')) {
        const upcomingBills = lifeData.upcoming.filter(u => u.category === 'Bills' || u.category === 'Subscriptions');
        const listStr = upcomingBills.map(b => `• ${b.title} — ${b.amount || ''} (Due: ${b.groupLabel})`).join('\n');
        
        orbitText = `Here are your upcoming payments and bills:\n\n${listStr || '• Electricity Bill (BSES) — ₹4,230 (Due: Tomorrow)\n• Netflix Renewal — ₹649 (Due: Sept 2)'}\n\nAuto-pay is disabled for BSES electricity.`;
        actionCard = {
          type: 'navigation',
          title: 'Upcoming Timeline',
          description: 'Manage deadlines, snooze alerts or mark items as paid.',
          payload: { tab: 'upcoming' },
        };

      } else if (command.includes('subscription') || command.includes('adobe') || command.includes('netflix') || command.includes('save')) {
        const unused = lifeData.subscriptions.find(s => s.lastUsedDaysAgo > 30);
        orbitText = `You currently have ${lifeData.subscriptions.length} active subscriptions costing ₹${lifeData.subscriptions.reduce((acc, s) => acc + s.monthly, 0).toLocaleString()}/month.\n\n${unused ? `⚠️ Optimization Alert: ${unused.name} hasn't been used in ${unused.lastUsedDaysAgo} days. Cancelling it will save ₹${unused.annualSavingIfCancelled.toLocaleString()}/year.` : 'All subscriptions show active recent usage.'}`;
        actionCard = {
          type: 'navigation',
          title: 'Subscriptions Advisor',
          description: 'Review recurring charges and optimize unused plans.',
          payload: { tab: 'subscriptions' },
        };

      } else if (command.includes('map') || command.includes('graph') || command.includes('constellation') || command.includes('network')) {
        setActiveTab('graph');
        graphStore.setViewMode('relations');
        orbitText = 'Opening your LifeSphere Memory Map. Visualizing every connected relationship between your trips, photos, documents, and people.';
        actionCard = {
          type: 'navigation',
          title: 'Memory Constellation Map',
          description: 'Interactive node graph of your life network.',
          payload: { tab: 'graph' },
        };

      } else if (command.includes('photo') || command.includes('image') || command.includes('moment')) {
        setActiveTab('photos');
        orbitText = `You have ${lifeData.photos.length} photos archived across trips, places, and people. Photos from Goa Beach and Bangalore Demo Day are indexed.`;
        actionCard = {
          type: 'navigation',
          title: 'Photo Memories Vault',
          description: 'Browse captures organized by memory and place.',
          payload: { tab: 'photos' },
        };

      } else if (command.includes('document') || command.includes('vault') || command.includes('invoice') || command.includes('warranty')) {
        setActiveTab('documents');
        orbitText = `Your vault contains ${lifeData.documents.length} verified documents across Government IDs, Travel Bookings, and Appliance Warranties.`;
        actionCard = {
          type: 'navigation',
          title: 'Document Archive',
          description: 'View extracted OCR metadata, warranties and passports.',
          payload: { tab: 'documents' },
        };

      } else {
        orbitText = `I analyzed your life network. You can ask me:\n• "How much did I spend in Goa?"\n• "When does my passport expire?"\n• "Show my upcoming payments"\n• "Which subscriptions should I review?"\n• "Open memory map"`;
      }

      const orbitMsg: OrbitMessage = {
        id: Math.random().toString(),
        sender: 'orbit',
        text: orbitText,
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
        actionCard,
      };

      set((state) => ({ messages: [...state.messages, orbitMsg] }));
    }, 450);
  },
  clearMessages: () => set({ messages: [] }),
}));
