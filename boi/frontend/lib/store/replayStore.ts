import { create } from 'zustand';

interface TimelineEvent {
  id: string;
  type: string;
  timestamp: string;
  title: string;
  description: string;
  metadata?: any;
}

interface ReplayState {
  events: TimelineEvent[];
  currentIndex: number;
  isPlaying: boolean;
  playbackSpeed: number; // e.g. 1x, 2x, 5x
  currentTime: string | null;
  
  // Actions
  setEvents: (events: TimelineEvent[]) => void;
  play: () => void;
  pause: () => void;
  next: () => void;
  previous: () => void;
  jumpTo: (index: number) => void;
  setSpeed: (speed: number) => void;
  reset: () => void;
}

export const useReplayStore = create<ReplayState>((set, get) => ({
  events: [],
  currentIndex: 0,
  isPlaying: false,
  playbackSpeed: 1,
  currentTime: null,

  setEvents: (events) => {
    // Sort just in case, though backend should have done it
    const sorted = [...events].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    set({ 
      events: sorted, 
      currentIndex: 0, 
      currentTime: sorted.length > 0 ? sorted[0].timestamp : null,
      isPlaying: false 
    });
  },

  play: () => set({ isPlaying: true }),
  
  pause: () => set({ isPlaying: false }),

  next: () => {
    const { currentIndex, events } = get();
    if (currentIndex < events.length - 1) {
      set({ 
        currentIndex: currentIndex + 1,
        currentTime: events[currentIndex + 1].timestamp 
      });
    } else {
      set({ isPlaying: false }); // Auto-pause at end
    }
  },

  previous: () => {
    const { currentIndex, events } = get();
    if (currentIndex > 0) {
      set({ 
        currentIndex: currentIndex - 1,
        currentTime: events[currentIndex - 1].timestamp 
      });
    }
  },

  jumpTo: (index) => {
    const { events } = get();
    if (index >= 0 && index < events.length) {
      set({ 
        currentIndex: index,
        currentTime: events[index].timestamp,
        isPlaying: false // Usually jumping pauses playback
      });
    }
  },

  setSpeed: (speed) => set({ playbackSpeed: speed }),

  reset: () => {
    const { events } = get();
    set({ 
      currentIndex: 0, 
      currentTime: events.length > 0 ? events[0].timestamp : null,
      isPlaying: false 
    });
  }
}));
