'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import ReactFlow, { 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState,
  MarkerType,
  Handle,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion } from 'framer-motion';
import { Network, Search, Filter, ShieldAlert, Cpu, ZoomIn, ZoomOut, Maximize, Play, Pause } from 'lucide-react';

// Custom Node to fit the Cyber/Palantir aesthetic
const CyberNode = ({ data }: any) => {
  const isHighRisk = data.risk > 0.8;
  return (
    <div className={`px-4 py-2 border backdrop-blur-md font-mono text-[10px] ${
      isHighRisk 
        ? 'border-red-500 bg-red-950/80 text-red-100 shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
        : 'border-cyan-500 bg-cyan-950/80 text-cyan-100 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
    }`}>
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full animate-pulse ${isHighRisk ? 'bg-red-400' : 'bg-cyan-400'}`} />
        <span className="tracking-widest font-bold">{data.id}</span>
      </div>
      {data.label && <div className="mt-1 text-cyan-400/70">{data.label}</div>}
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
};

const nodeTypes = {
  cyber: CyberNode,
};

export default function ThreatNetworkVisualizer() {
  const [mounted, setMounted] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  // Simulation Controls
  const [isPlaying, setIsPlaying] = useState(true);
  const [timeWindow, setTimeWindow] = useState('1H');

  useEffect(() => {
    setMounted(true);
    
    // Simulate fetching graph data from backend /api/graph/topology
    // In production, this would hit the NetworkX/GraphSAGE output
    const initialNodes = [
      { id: '1', type: 'cyber', position: { x: 250, y: 50 }, data: { id: 'ACC-892', risk: 0.9, label: 'JAMTARA_NODE' } },
      { id: '2', type: 'cyber', position: { x: 100, y: 150 }, data: { id: 'ACC-112', risk: 0.4 } },
      { id: '3', type: 'cyber', position: { x: 400, y: 150 }, data: { id: 'ACC-445', risk: 0.2 } },
      { id: '4', type: 'cyber', position: { x: 250, y: 250 }, data: { id: 'ACC-999', risk: 0.85, label: 'MULE_LAYER_1' } },
      { id: '5', type: 'cyber', position: { x: 400, y: 350 }, data: { id: 'ACC-777', risk: 0.1 } },
    ];

    const initialEdges = [
      { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } },
      { id: 'e1-3', source: '1', target: '3', animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } },
      { id: 'e2-4', source: '2', target: '4', animated: true, style: { stroke: '#06b6d4', strokeWidth: 1 } },
      { id: 'e3-4', source: '3', target: '4', animated: true, style: { stroke: '#06b6d4', strokeWidth: 1 } },
      { id: 'e4-5', source: '4', target: '5', animated: true, style: { stroke: '#ef4444', strokeWidth: 2 } },
    ];

    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [setNodes, setEdges]);

  if (!mounted) return null;

  return (
    <div className="h-screen w-full bg-black relative flex flex-col font-mono text-cyan-500 overflow-hidden">
      
      {/* Top HUD */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start pointer-events-none">
        
        <div className="pointer-events-auto bg-black/60 border border-cyan-900/50 backdrop-blur-md p-4 w-80">
          <h1 className="text-sm font-bold tracking-[0.2em] text-cyan-400 flex items-center mb-4">
            <Network className="w-4 h-4 mr-2" />
            TOPOLOGY COMMAND
          </h1>
          
          <div className="space-y-4 text-xs">
            <div>
               <div className="text-[10px] text-cyan-700 mb-1">SEARCH NODE</div>
               <div className="relative">
                 <input 
                   type="text" 
                   placeholder="ENTER ACC ID..."
                   className="w-full bg-cyan-950/30 border border-cyan-900/50 px-3 py-2 text-cyan-100 placeholder-cyan-800 focus:outline-none focus:border-cyan-400 transition-colors"
                 />
                 <Search className="w-3 h-3 absolute right-3 top-2.5 text-cyan-600" />
               </div>
            </div>

            <div>
               <div className="text-[10px] text-cyan-700 mb-1">FILTER CLUSTERS</div>
               <select className="w-full bg-cyan-950/30 border border-cyan-900/50 px-3 py-2 text-cyan-100 focus:outline-none focus:border-cyan-400 transition-colors appearance-none">
                 <option>HIGH RISK MULES (&gt; 0.8)</option>
                 <option>SLEEPER CELLS</option>
                 <option>LAYERING PATTERNS</option>
               </select>
            </div>
            
            <button className="w-full py-2 bg-red-950/20 border border-red-900/50 text-red-400 hover:bg-red-900/40 transition-colors tracking-widest flex items-center justify-center mt-4">
              <ShieldAlert className="w-3 h-3 mr-2" /> QUARANTINE CLUSTER
            </button>
          </div>
        </div>

        <div className="pointer-events-auto flex items-center space-x-4">
           <div className="bg-black/60 border border-emerald-900/50 backdrop-blur-md px-4 py-2 flex items-center space-x-3 text-xs">
             <div className="flex items-center text-emerald-400">
               <Cpu className="w-3 h-3 mr-2 animate-pulse" /> GRAPHSAGE MODEL: ONLINE
             </div>
             <div className="h-4 w-[1px] bg-emerald-900/50" />
             <div className="text-emerald-500/70">5,420 NODES</div>
             <div className="h-4 w-[1px] bg-emerald-900/50" />
             <div className="text-emerald-500/70">12,189 EDGES</div>
           </div>
        </div>

      </div>

      {/* Bottom HUD: Timeline Simulation */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-auto">
        <div className="bg-black/80 border border-cyan-900/50 backdrop-blur-md px-6 py-3 flex items-center space-x-6">
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="text-cyan-400 hover:text-white transition-colors"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          
          <div className="flex items-center space-x-2 text-xs">
             <span className="text-cyan-700">TIME WINDOW</span>
             <div className="flex bg-cyan-950/30 border border-cyan-900/50">
               {['15M', '1H', '24H', '7D'].map(w => (
                 <button 
                   key={w}
                   onClick={() => setTimeWindow(w)}
                   className={`px-3 py-1 ${timeWindow === w ? 'bg-cyan-900/50 text-cyan-300 font-bold' : 'text-cyan-600 hover:text-cyan-400'}`}
                 >
                   {w}
                 </button>
               ))}
             </div>
          </div>
          
          <div className="flex items-center space-x-4">
             <span className="text-[10px] text-cyan-600">PROPAGATION SIMULATION</span>
             <div className="w-32 h-1 bg-cyan-950 border border-cyan-900 overflow-hidden relative">
                <motion.div 
                  className="absolute top-0 left-0 h-full bg-cyan-500"
                  initial={{ width: "0%" }}
                  animate={{ width: isPlaying ? "100%" : "0%" }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                />
             </div>
          </div>
        </div>
      </div>

      {/* React Flow Canvas */}
      <div className="flex-1 bg-black">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          className="bg-black"
          defaultEdgeOptions={{
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#0891b2', strokeWidth: 1 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#0891b2',
            },
          }}
        >
          <Background color="#0891b2" gap={24} size={1} className="opacity-10" />
        </ReactFlow>
      </div>

    </div>
  );
}
