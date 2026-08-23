'use client';

import React, { useCallback, useEffect } from 'react';
import { 
  ReactFlow, 
  useNodesState, 
  useEdgesState,
  Edge,
  Node,
  ReactFlowProvider,
  useReactFlow
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import MemoryNode from './MemoryNode';
import MemoryEdge from './MemoryEdge';
import MemoryInsightPanel from './MemoryInsightPanel';
import { useGraphStore, GraphViewMode, GraphNodeData } from '@/store/useGraphStore';
import { Search } from 'lucide-react';

const nodeTypes = {
  memoryNode: MemoryNode,
};

const edgeTypes = {
  memoryEdge: MemoryEdge,
};

const initialGraphNodes: GraphNodeData[] = [
  { id: 'trip-goa', type: 'trip', title: 'Goa Coastal Journey 2026', category: 'Travel', date: '2026-04-10', location: 'Goa', summary: 'Grouped flight bookings, Taj resort reservations, and 24 beach photographs.' },
  { id: 'flight-goa', type: 'invoice', title: 'IndiGo Ticket 6E-2018', category: 'Travel', date: '2026-04-09', location: 'Goa', summary: 'Flight ticket for Goa trip. Seat 12D.' },
  { id: 'hotel-goa', type: 'invoice', title: 'Taj Resort Goa Invoice', category: 'Travel', date: '2026-04-12', location: 'Goa', summary: 'Hotel bill for 3 nights suite booking.' },
  { id: 'photo-goa-beach', type: 'photo', title: 'Anjuna Beach Sunset', category: 'Travel', date: '2026-04-11', location: 'Goa', summary: 'Beach photograph with sunset view.' },
  { id: 'travel-ins', type: 'warranty', title: 'TATA AIG Travel Policy', category: 'Travel', date: '2026-04-08', location: 'Goa', summary: 'Active travel coverage.' },

  { id: 'tv-purchase', type: 'warranty', title: 'Samsung Split AC Warranty', category: 'Warranty', date: '2025-12-15', location: 'Home', summary: '5-year compressor warranty active until 2030.' },
  { id: 'tv-invoice', type: 'invoice', title: 'Croma Purchase Receipt', category: 'Warranty', date: '2025-12-15', location: 'Home', summary: 'AC billing receipt details.' },

  { id: 'health-record', type: 'medical', title: 'Metabolic Lab Test', category: 'Medical', date: '2026-01-20', location: 'Max Labs', summary: 'Annual medical blood test results.' },
  
  { id: 'netflix-sub', type: 'subscription', title: 'Netflix Premium Plan', category: 'Finance', date: '2026-06-01', location: 'Cloud', summary: 'Monthly streaming auto-debit.' },
  { id: 'amazon-sub', type: 'subscription', title: 'Prime Membership', category: 'Finance', date: '2026-06-12', location: 'Cloud', summary: 'Annual delivery subscription.' },
];

const initialGraphEdges: Edge[] = [
  { id: 'e-trip-flight', source: 'trip-goa', target: 'flight-goa', type: 'memoryEdge' },
  { id: 'e-trip-hotel', source: 'trip-goa', target: 'hotel-goa', type: 'memoryEdge' },
  { id: 'e-trip-photo', source: 'trip-goa', target: 'photo-goa-beach', type: 'memoryEdge' },
  { id: 'e-trip-ins', source: 'trip-goa', target: 'travel-ins', type: 'memoryEdge' },
  { id: 'e-tv-invoice', source: 'tv-purchase', target: 'tv-invoice', type: 'memoryEdge' },
  { id: 'e-health-med', source: 'health-record', target: 'trip-goa', type: 'memoryEdge' },
  { id: 'e-netflix-sub', source: 'netflix-sub', target: 'tv-purchase', type: 'memoryEdge' },
];

const getLayoutedNodes = (nodes: GraphNodeData[], mode: GraphViewMode): Node[] => {
  return nodes.map((node, i) => {
    let position = { x: 100, y: 100 };

    switch (mode) {
      case 'timeline':
        position = { x: i * 240, y: 220 + (i % 2 === 0 ? 60 : -60) };
        break;
      case 'category':
        position = { x: (i % 4) * 260, y: Math.floor(i / 4) * 180 + 100 };
        break;
      case 'relations':
      default:
        const angle = i * 0.65;
        const radius = 200 + (i % 2 === 0 ? 40 : -30);
        position = {
          x: 420 + Math.cos(angle) * radius,
          y: 260 + Math.sin(angle) * radius,
        };
        break;
    }

    return {
      id: node.id,
      type: 'memoryNode',
      data: node as unknown as Record<string, unknown>,
      position,
    };
  });
};

function FlowCanvas() {
  const { viewMode, setViewMode, setSelectedNode, searchQuery, setSearchQuery } = useGraphStore();
  const { fitView } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, , onEdgesChange] = useEdgesState<Edge>(initialGraphEdges);

  useEffect(() => {
    const layouted = getLayoutedNodes(initialGraphNodes, viewMode);
    setNodes(layouted);
    setTimeout(() => fitView({ duration: 600, padding: 0.2 }), 100);
  }, [viewMode, setNodes, fitView]);

  const onNodeClick = useCallback((_: unknown, node: Node) => {
    setSelectedNode(node.data as unknown as GraphNodeData);
    fitView({ nodes: [node], duration: 500, padding: 1.2 });
  }, [setSelectedNode, fitView]);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    fitView({ duration: 500 });
  }, [setSelectedNode, fitView]);

  return (
    <div className="w-full h-[calc(100vh-10rem)] relative overflow-hidden bg-transparent font-sans">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        fitView
        proOptions={{ hideAttribution: true }}
        className="w-full h-full"
      />

      {/* Floating Controls Overlay */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pointer-events-none">
        {/* View toggles */}
        <div className="bg-bg-surface/90 backdrop-blur-2xl border border-white/[0.08] rounded-full p-1.5 flex flex-wrap gap-1 pointer-events-auto shadow-2xl">
          {[
            { id: 'relations', label: 'Constellation' },
            { id: 'timeline', label: 'Timeline' },
            { id: 'category', label: 'Categories' },
          ].map((mode) => {
            const active = viewMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id as GraphViewMode)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  active 
                    ? 'bg-accent-primary text-white font-semibold' 
                    : 'text-text-secondary hover:text-text-primary bg-transparent'
                }`}
              >
                {mode.label}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="bg-bg-surface/90 backdrop-blur-2xl border border-white/[0.08] rounded-full px-4 py-2 flex items-center space-x-2.5 w-full sm:w-64 pointer-events-auto shadow-2xl">
          <Search size={14} className="text-text-secondary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search constellation…"
            className="w-full bg-transparent border-none text-xs text-text-primary placeholder-text-tertiary focus:outline-none"
          />
        </div>
      </div>

      <MemoryInsightPanel />
    </div>
  );
}

export default function MemoryGraph() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-transparent">
      <ReactFlowProvider>
        <FlowCanvas />
      </ReactFlowProvider>
    </div>
  );
}
