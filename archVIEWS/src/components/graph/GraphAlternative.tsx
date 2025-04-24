import React, { useState, useEffect, useRef } from 'react';
import { GraphData, Node, Edge } from '@/types/graph';
import { getRelationshipColor } from '@/utils/graphUtils';

interface GraphAlternativeProps {
  data: GraphData;
  isLoading?: boolean;
  onNodeSelect?: (node: Node | null) => void;
  onEdgeSelect?: (edge: Edge | null) => void;
}

const GraphAlternative: React.FC<GraphAlternativeProps> = ({
  data,
  isLoading = false,
  onNodeSelect,
  onEdgeSelect
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });
  const [activeView, setActiveView] = useState<'graph' | 'list'>('graph');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // Resize handler
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setContainerSize({ width, height });
      }
    };

    // Initial size
    updateSize();

    // Add resize event listener
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Calculate node positions in a circular layout
  const calculateNodePositions = () => {
    const nodes = data.nodes || [];
    const nodeCount = nodes.length;
    const centerX = containerSize.width / 2;
    const centerY = containerSize.height / 2;
    const radius = Math.min(centerX, centerY) * 0.8;

    return nodes.map((node, index) => {
      const angle = (2 * Math.PI * index) / nodeCount;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      return { ...node, x, y };
    });
  };

  // Handle node click
  const handleNodeClick = (node: Node) => {
    setSelectedNode(selectedNode === node.id ? null : node.id);
    if (onNodeSelect) {
      onNodeSelect(node);
    }
  };

  // Handle edge click
  const handleEdgeClick = (edge: Edge) => {
    if (onEdgeSelect) {
      onEdgeSelect(edge);
    }
  };

  // Get node display name
  const getNodeDisplayName = (node: Node) => {
    return node.properties?.name || node.properties?.label || `ID: ${node.id.substring(0, 8)}`;
  };

  // Get edge display name
  const getEdgeDisplayName = (edge: Edge) => {
    return edge.type || 'Unknown';
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-computing-purple"></div>
      </div>
    );
  }

  // Render empty state
  if (!data || !data.nodes || data.nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>No data available. Please adjust your filters or add new nodes.</p>
      </div>
    );
  }

  // Calculate node positions
  const nodesWithPositions = calculateNodePositions();

  return (
    <div className="h-full flex flex-col" ref={containerRef}>
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm font-medium text-gray-500">
          {data.nodes.length} nodes, {data.edges.length} relationships
        </div>
        <div className="flex space-x-2">
          <button
            className={`px-3 py-1 text-sm rounded ${
              activeView === 'graph'
                ? 'bg-computing-purple text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setActiveView('graph')}
          >
            Graph View
          </button>
          <button
            className={`px-3 py-1 text-sm rounded ${
              activeView === 'list'
                ? 'bg-computing-purple text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setActiveView('list')}
          >
            List View
          </button>
        </div>
      </div>

      {activeView === 'graph' ? (
        <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden bg-white">
          <svg
            ref={svgRef}
            width={containerSize.width}
            height={containerSize.height}
            className="w-full h-full"
          >
            {/* Draw edges */}
            {data.edges.map((edge) => {
              const sourceNode = nodesWithPositions.find((n) => n.id === edge.source);
              const targetNode = nodesWithPositions.find((n) => n.id === edge.target);
              
              if (!sourceNode || !targetNode) return null;
              
              const color = getRelationshipColor(edge.type);
              const isSelected = selectedNode === edge.source || selectedNode === edge.target;
              
              return (
                <g key={edge.id} onClick={() => handleEdgeClick(edge)} className="cursor-pointer">
                  <line
                    x1={sourceNode.x}
                    y1={sourceNode.y}
                    x2={targetNode.x}
                    y2={targetNode.y}
                    stroke={color}
                    strokeWidth={isSelected ? 3 : 2}
                    opacity={isSelected ? 1 : 0.7}
                  />
                  
                  {/* Edge label */}
                  <text
                    x={(sourceNode.x + targetNode.x) / 2}
                    y={(sourceNode.y + targetNode.y) / 2}
                    textAnchor="middle"
                    fill="#555"
                    fontSize="10"
                    dy="-5"
                    className="pointer-events-none"
                  >
                    {edge.type}
                  </text>
                </g>
              );
            })}
            
            {/* Draw nodes */}
            {nodesWithPositions.map((node) => {
              const isSelected = selectedNode === node.id;
              const category = node.properties?.category?.toLowerCase() || 'default';
              let nodeColor = '#6B7280'; // Default gray
              
              // Assign colors based on category
              if (category === 'server') nodeColor = '#3B82F6'; // Blue
              if (category === 'firewall') nodeColor = '#EF4444'; // Red
              if (category === 'storage') nodeColor = '#10B981'; // Green
              if (category === 'internet') nodeColor = '#8B5CF6'; // Purple
              
              return (
                <g
                  key={node.id}
                  onClick={() => handleNodeClick(node)}
                  className="cursor-pointer"
                  transform={`translate(${node.x}, ${node.y})`}
                >
                  <circle
                    r={isSelected ? 25 : 20}
                    fill={nodeColor}
                    opacity={isSelected ? 1 : 0.8}
                    stroke={isSelected ? '#000' : '#fff'}
                    strokeWidth={isSelected ? 2 : 1}
                  />
                  <text
                    textAnchor="middle"
                    fill="#fff"
                    fontSize="10"
                    dy="4"
                    className="pointer-events-none"
                  >
                    {getNodeDisplayName(node)}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg bg-white">
          <div className="p-4">
            <h3 className="text-lg font-medium mb-2">Nodes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {data.nodes.map((node) => (
                <div
                  key={node.id}
                  className={`p-3 border rounded-md cursor-pointer ${
                    selectedNode === node.id
                      ? 'border-computing-purple bg-computing-purple/5'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => handleNodeClick(node)}
                >
                  <div className="font-medium">{getNodeDisplayName(node)}</div>
                  <div className="text-xs text-gray-500">
                    {node.properties?.category || 'Unknown Category'}
                  </div>
                </div>
              ))}
            </div>
            
            <h3 className="text-lg font-medium mt-6 mb-2">Relationships</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Relationship</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Target</th>
                  </tr>
                </thead>
                <tbody>
                  {data.edges.map((edge) => {
                    const source = data.nodes.find((n) => n.id === edge.source);
                    const target = data.nodes.find((n) => n.id === edge.target);
                    
                    return (
                      <tr
                        key={edge.id}
                        className={`cursor-pointer hover:bg-gray-50 ${
                          selectedNode === edge.source || selectedNode === edge.target
                            ? 'bg-computing-purple/5'
                            : ''
                        }`}
                        onClick={() => handleEdgeClick(edge)}
                      >
                        <td className="px-3 py-2 text-sm">
                          {source ? getNodeDisplayName(source) : edge.source}
                        </td>
                        <td className="px-3 py-2 text-sm">
                          <span
                            className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: getRelationshipColor(edge.type) }}
                          >
                            {getEdgeDisplayName(edge)}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-sm">
                          {target ? getNodeDisplayName(target) : edge.target}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GraphAlternative; 