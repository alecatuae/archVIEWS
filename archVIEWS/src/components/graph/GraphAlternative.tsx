import React, { useState, useEffect, useRef } from 'react';
import { GraphData, Node, Edge } from '@/types/graph';
import graphUtils from '@/utils/graphUtils';

interface GraphAlternativeProps {
  data: GraphData | null;
  isLoading?: boolean;
  onNodeSelect?: (nodeId: string) => void;
  onEdgeSelect?: (edgeId: string) => void;
  className?: string;
}

const GraphAlternative: React.FC<GraphAlternativeProps> = ({
  data,
  isLoading = false,
  onNodeSelect,
  onEdgeSelect,
  className
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [viewBox, setViewBox] = useState("0 0 800 600");
  const [positions, setPositions] = useState<Record<string, { x: number, y: number }>>({});
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [activeEdge, setActiveEdge] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'graph' | 'list'>('graph');

  // Calcula posições dos nós em um layout circular simples
  useEffect(() => {
    if (!data?.nodes?.length) return;
    
    const newPositions: Record<string, { x: number, y: number }> = {};
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    const radius = Math.min(dimensions.width, dimensions.height) * 0.35;
    
    data.nodes.forEach((node, index) => {
      const angle = (index / data.nodes.length) * 2 * Math.PI;
      newPositions[node.id] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
    });
    
    setPositions(newPositions);
  }, [data?.nodes, dimensions]);

  // Ajusta o tamanho do SVG ao container
  useEffect(() => {
    if (!svgRef.current) return;
    
    const resizeObserver = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
      setViewBox(`0 0 ${width} ${height}`);
    });
    
    resizeObserver.observe(svgRef.current.parentElement as Element);
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const handleNodeClick = (node: Node) => {
    setActiveNode(node.id);
    setActiveEdge(null);
    if (onNodeSelect) onNodeSelect(node.id);
  };

  const handleEdgeClick = (edge: Edge) => {
    setActiveEdge(edge.id);
    setActiveNode(null);
    if (onEdgeSelect) onEdgeSelect(edge.id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Make sure data is properly initialized with empty arrays as fallback
  const nodes = data?.nodes || [];
  const edges = data?.edges || [];

  if (nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-gray-100 rounded-lg border border-gray-300">
        <div className="text-center">
          <p className="text-lg text-gray-600">No graph data available</p>
          <p className="text-sm text-gray-500">Adjust your filters or load new data</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full w-full ${className || ''}`}>
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-500">
          Showing {nodes.length} nodes and {edges.length} relationships
        </div>
        <div className="bg-gray-100 rounded-lg p-1 flex">
          <button
            className={`px-3 py-1 rounded-md text-sm ${viewMode === 'graph' ? 'bg-white shadow-sm' : ''}`}
            onClick={() => setViewMode('graph')}
          >
            Graph View
          </button>
          <button
            className={`px-3 py-1 rounded-md text-sm ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
            onClick={() => setViewMode('list')}
          >
            List View
          </button>
        </div>
      </div>
      
      {viewMode === 'graph' ? (
        <div className="flex-1 overflow-hidden border border-gray-200 rounded-lg bg-white">
          <div className="h-full w-full relative">
            <svg 
              ref={svgRef}
              viewBox={viewBox}
              className="w-full h-full"
              style={{ background: "#f8fafc" }}
            >
              {/* Desenha as arestas */}
              {Object.keys(positions).length > 0 && edges.map(edge => {
                if (!positions[edge.source] || !positions[edge.target]) return null;
                
                const source = positions[edge.source];
                const target = positions[edge.target];
                const edgeColor = graphUtils.getRelationshipColor(edge.type);
                const isActive = activeEdge === edge.id;
                
                return (
                  <g key={edge.id} onClick={() => handleEdgeClick(edge)}>
                    <line
                      x1={source.x}
                      y1={source.y}
                      x2={target.x}
                      y2={target.y}
                      stroke={edgeColor}
                      strokeWidth={isActive ? 3 : 2}
                      strokeOpacity={isActive ? 1 : 0.6}
                    />
                    {/* Seta direcional */}
                    <polygon
                      points="0,-3 6,0 0,3"
                      fill={edgeColor}
                      transform={`translate(${target.x}, ${target.y}) rotate(${Math.atan2(target.y - source.y, target.x - source.x) * 180 / Math.PI}) translate(-10, 0)`}
                    />
                    {/* Label da aresta - apenas se estiver ativa */}
                    {isActive && (
                      <g>
                        {/* Background para o texto */}
                        <rect
                          x={(source.x + target.x) / 2 - 50}
                          y={(source.y + target.y) / 2 - 20}
                          width="100"
                          height="20"
                          fill="#ffffff"
                          rx="4"
                          opacity="0.8"
                        />
                        {/* Texto da aresta */}
                        <text
                          x={(source.x + target.x) / 2}
                          y={(source.y + target.y) / 2 - 10}
                          textAnchor="middle"
                          fill="#4b5563"
                          fontSize="12"
                          fontWeight="500"
                        >
                          <tspan
                            dy="-0.5em"
                            x={(source.x + target.x) / 2}
                            fill={edgeColor}
                            fontWeight="bold"
                          >
                            {edge.type}
                          </tspan>
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
              
              {/* Desenha os nós */}
              {Object.keys(positions).length > 0 && nodes.map(node => {
                if (!positions[node.id]) return null;
                
                const { x, y } = positions[node.id];
                const isActive = activeNode === node.id;
                const category = node.labels?.[0]?.toLowerCase() || 'default';
                let fillColor = '#6b48ff'; // Default purple color
                
                if (category.includes('database')) fillColor = '#0897e9';
                else if (category.includes('service')) fillColor = '#0adbe3';
                else if (category.includes('component')) fillColor = '#feac0e';
                else if (category.includes('infrastructure')) fillColor = '#363636';
                
                return (
                  <g 
                    key={node.id} 
                    onClick={() => handleNodeClick(node)}
                    style={{ cursor: 'pointer' }}
                  >
                    <circle
                      cx={x}
                      cy={y}
                      r={isActive ? 16 : 14}
                      fill={fillColor}
                      opacity={isActive ? 1 : 0.8}
                      stroke={isActive ? '#fff' : 'transparent'}
                      strokeWidth={2}
                    />
                    <text
                      x={x}
                      y={y + 30}
                      textAnchor="middle"
                      fill="#4b5563"
                      fontSize={isActive ? 14 : 12}
                      fontWeight={isActive ? "bold" : "normal"}
                    >
                      {graphUtils.getNodeDisplayLabel(node).length > 15 
                        ? graphUtils.getNodeDisplayLabel(node).substring(0, 12) + '...'
                        : graphUtils.getNodeDisplayLabel(node)}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <h3 className="text-lg font-semibold mb-2">Nodes ({nodes.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
            {nodes.map((node) => {
              // Garantir que node é válido e tem todas as propriedades necessárias
              if (!node || !node.id) return null;
              
              const nodeProps = node.properties || {};
              const isActive = activeNode === node.id;
              
              return (
                <div 
                  key={node.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isActive 
                      ? 'bg-blue-100 border-blue-400 shadow-sm' 
                      : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                  }`}
                  onClick={() => handleNodeClick(node)}
                >
                  <div className="font-medium truncate">{graphUtils.getNodeDisplayLabel(node)}</div>
                  <div className="text-sm text-gray-600 flex justify-between">
                    <span>{node.labels?.[0] || 'Unknown'}</span>
                    <span className="text-gray-400">{node.id.substring(0, 8)}</span>
                  </div>
                </div>
              );
            })}
          </div>
          
          <h3 className="text-lg font-semibold mb-2">Edges ({edges.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {edges.map((edge) => {
              // Garantir que edge é válido e tem todas as propriedades necessárias
              if (!edge || !edge.id) return null;
              
              const isActive = activeEdge === edge.id;
              const sourceNode = nodes.find(n => n.id === edge.source);
              const targetNode = nodes.find(n => n.id === edge.target);
              
              return (
                <div 
                  key={edge.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isActive 
                      ? 'bg-green-100 border-green-400 shadow-sm' 
                      : 'bg-green-50 border-green-200 hover:bg-green-100'
                  }`}
                  onClick={() => handleEdgeClick(edge)}
                >
                  <div className="font-medium">{edge.type || 'Relationship'}</div>
                  <div className="text-sm text-gray-600">
                    <span className="truncate">{graphUtils.getNodeDisplayLabel(sourceNode || { id: edge.source })} </span>
                    <span className="text-gray-400">→</span>
                    <span className="truncate"> {graphUtils.getNodeDisplayLabel(targetNode || { id: edge.target })}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default GraphAlternative; 