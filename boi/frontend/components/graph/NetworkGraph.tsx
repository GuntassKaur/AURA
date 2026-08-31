import React, { useState, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Handle,
  Position,
  NodeProps
} from 'reactflow';
import 'reactflow/dist/style.css';
import { apiRequest } from '@/lib/api/client';
import { useAlertStore } from '@/lib/store/alertStore';
import { useWebSocket } from '@/lib/hooks/useWebSocket';
import { Shield, Radio, ShieldAlert } from 'lucide-react';

// Custom Node component with tactical design
const CustomNode: React.FC<NodeProps> = ({ data }) => {
  const isFrozen = data.is_frozen;
  const risk = data.risk_tier;

  let borderStyle = 'border-cyber-cyan/30';
  let glowStyle = '';
  let dotColor = 'bg-cyber-cyan';
  let labelColor = 'text-cyber-cyan';

  if (isFrozen) {
    borderStyle = 'border-cyber-red border-2 shadow-[0_0_20px_rgba(239,68,68,0.6)]';
    glowStyle = 'bg-cyber-red/20';
    dotColor = 'bg-cyber-red animate-ping';
    labelColor = 'text-cyber-red font-bold';
  } else if (risk === 'HOLD') {
    borderStyle = 'border-cyber-yellow/60';
    dotColor = 'bg-cyber-yellow';
    labelColor = 'text-cyber-yellow';
  } else if (risk === 'WATCH') {
    borderStyle = 'border-cyber-blue/60';
    dotColor = 'bg-cyber-blue';
    labelColor = 'text-cyber-blue';
  }

  return (
    <div className={`p-3 rounded-lg glass-panel ${borderStyle} ${glowStyle} text-xs font-mono w-[180px] relative transition-all duration-300`}>
      <Handle type="target" position={Position.Top} className="!bg-cyber-cyan" />
      
      {/* Node Header */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center space-x-1.5">
          <div className={`w-2 h-2 rounded-full ${dotColor}`} />
          <span className={`font-bold tracking-widest text-[9px] ${labelColor}`}>
            {isFrozen ? 'CONTAINED' : risk}
          </span>
        </div>
        {isFrozen ? <ShieldAlert className="w-3.5 h-3.5 text-cyber-red" /> : <Shield className="w-3.5 h-3.5 text-slate-500" />}
      </div>

      {/* Account Address */}
      <div className="text-white font-bold text-[10px] select-all cursor-pointer truncate mb-1">
        {data.label}
      </div>

      {/* Node Stats */}
      <div className="grid grid-cols-2 gap-1 text-[8px] text-slate-400 border-t border-cyber-border/20 pt-1.5 mt-1.5">
        <div>
          <div>PAGERANK</div>
          <div className="text-white font-semibold">{(data.pagerank || 0).toFixed(4)}</div>
        </div>
        <div>
          <div>DEGREE</div>
          <div className="text-white font-semibold">{(data.degree || 0).toFixed(2)}</div>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-cyber-cyan" />
    </div>
  );
};

const nodeTypes = {
  customNode: CustomNode,
};

interface NetworkGraphProps {
  onNodeSelect?: (accountId: string) => void;
}

export const NetworkGraph: React.FC<NetworkGraphProps> = ({ onNodeSelect }) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const { isFreezeActive, frozenAccounts } = useAlertStore();

  const fetchGraphData = async () => {
    try {
      const data = await apiRequest('/api/graph');
      setNodes(data.nodes);
      setEdges(data.edges);
    } catch (err) {
      console.error('Failed to load graph:', err);
    }
  };

  useEffect(() => {
    fetchGraphData();
  }, []);

  // Recalculate graph if freeze triggers
  useEffect(() => {
    if (isFreezeActive && frozenAccounts.length > 0) {
      setNodes((prevNodes) =>
        prevNodes.map((node) => {
          if (frozenAccounts.includes(node.id)) {
            return {
              ...node,
              data: { ...node.data, is_frozen: true, risk_tier: 'FREEZE' }
            };
          }
          return node;
        })
      );
      
      // Halt matching edges
      setEdges((prevEdges) =>
        prevEdges.map((edge) => {
          if (frozenAccounts.includes(edge.source) || frozenAccounts.includes(edge.target)) {
            return {
              ...edge,
              animated: false,
              style: { stroke: 'rgba(239, 68, 68, 0.2)', strokeWidth: 1 }
            };
          }
          return edge;
        })
      );
    }
  }, [isFreezeActive, frozenAccounts]);

  // Listen to graph recalculation channel
  useWebSocket('graph', (event) => {
    if (event.event_type === 'OPERATIONAL_FREEZE') {
      fetchGraphData(); // reload
    }
  });

  const onNodeClick = (event: React.MouseEvent, node: Node) => {
    if (onNodeSelect) {
      onNodeSelect(node.id);
    }
  };

  return (
    <div className="h-[480px] bg-cyber-bg/20 rounded-lg relative overflow-hidden border border-cyber-border/40">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        fitView
      >
        <Background color="rgba(34, 211, 238, 0.05)" gap={16} />
        <Controls className="!bg-slate-900 !border-cyber-cyan/30 !text-white" />
      </ReactFlow>
      
      <div className="absolute top-3 right-3 glass-panel p-2.5 rounded font-mono text-[9px] text-slate-400 space-y-1.5 pointer-events-none">
        <div className="font-bold text-cyber-cyan mb-1 flex items-center">
          <Radio className="w-3 h-3 mr-1 animate-pulse" /> NETWORK TOPOLOGY SCANNER
        </div>
        <div className="flex items-center space-x-1.5">
          <div className="w-2 h-2 bg-cyber-cyan rounded-full" />
          <span>LOW / SAFE VECTOR</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <div className="w-2 h-2 bg-cyber-blue rounded-full" />
          <span>WATCH VECTOR</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <div className="w-2 h-2 bg-cyber-yellow rounded-full" />
          <span>HOLD VECTOR</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <div className="w-2 h-2 bg-cyber-red rounded-full" />
          <span>CONTAINED / LOCKDOWN</span>
        </div>
      </div>
    </div>
  );
};
