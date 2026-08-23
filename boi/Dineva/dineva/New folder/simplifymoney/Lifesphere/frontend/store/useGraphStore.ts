import { create } from 'zustand';

export type GraphViewMode = 'relations' | 'timeline' | 'category' | 'location' | 'financial' | 'medical' | 'travel' | 'photo';

export interface GraphNodeData {
  id: string;
  type: 'document' | 'photo' | 'trip' | 'medical' | 'reminder' | 'invoice' | 'subscription' | 'warranty' | 'memory_event' | 'analytics' | 'ai_insight' | 'calendar_event' | 'location' | 'person';
  title: string;
  category: string;
  date: string;
  location?: string;
  summary?: string;
  metadata?: Record<string, unknown>;
}

interface GraphStore {
  viewMode: GraphViewMode;
  setViewMode: (mode: GraphViewMode) => void;
  selectedNode: GraphNodeData | null;
  setSelectedNode: (node: GraphNodeData | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  collapsedClusters: string[];
  toggleCluster: (clusterId: string) => void;
  breadcrumbs: string[];
  setBreadcrumbs: (crumbs: string[]) => void;
}

export const useGraphStore = create<GraphStore>((set) => ({
  viewMode: 'relations',
  setViewMode: (viewMode) => set({ viewMode }),
  selectedNode: null,
  setSelectedNode: (selectedNode) => {
    if (!selectedNode) {
      set({ selectedNode: null, breadcrumbs: [] });
    } else {
      set((state) => {
        // Push to breadcrumbs path tracker
        const crumbs = state.breadcrumbs.includes(selectedNode.title)
          ? state.breadcrumbs
          : [...state.breadcrumbs, selectedNode.title].slice(-4);
        return { selectedNode, breadcrumbs: crumbs };
      });
    }
  },
  searchQuery: '',
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  collapsedClusters: [],
  toggleCluster: (clusterId) =>
    set((state) => ({
      collapsedClusters: state.collapsedClusters.includes(clusterId)
        ? state.collapsedClusters.filter((c) => c !== clusterId)
        : [...state.collapsedClusters, clusterId],
    })),
  breadcrumbs: [],
  setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),
}));
