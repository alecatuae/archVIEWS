import React from 'react';
import { GraphData, Node, Edge } from '@/types/graph';

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
  const handleNodeClick = (node: Node) => {
    if (onNodeSelect) onNodeSelect(node);
  };

  const handleEdgeClick = (edge: Edge) => {
    if (onEdgeSelect) onEdgeSelect(edge);
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
    <div className="flex flex-col h-full w-full bg-white rounded-lg border border-gray-300 p-4">
      <div className="bg-yellow-100 p-4 mb-4 rounded-lg border border-yellow-300">
        <h3 className="text-lg font-semibold text-yellow-800">Visualization Temporarily Disabled</h3>
        <p className="text-yellow-700">
          The graph visualization is temporarily disabled. We're working on a fix to restore the full interactive graph.
        </p>
      </div>
      
      <div className="flex-1 overflow-auto">
        <h3 className="text-lg font-semibold mb-2">Nodes ({nodes.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
          {nodes.slice(0, 9).map((node) => {
            // Garantir que node é válido e tem todas as propriedades necessárias
            if (!node || !node.id) return null;
            
            const nodeProps = node.properties || {};
            
            return (
              <div 
                key={node.id}
                className="p-3 bg-blue-50 rounded-lg border border-blue-200 cursor-pointer hover:bg-blue-100"
                onClick={() => handleNodeClick(node)}
              >
                <div className="font-medium">{nodeProps.name || node.id}</div>
                <div className="text-sm text-gray-600">
                  {nodeProps.category || 'Unknown'} · {nodeProps.type || 'Unknown'}
                </div>
              </div>
            );
          })}
          {nodes.length > 9 && (
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-center">
              + {nodes.length - 9} more nodes
            </div>
          )}
        </div>
        
        <h3 className="text-lg font-semibold mb-2">Edges ({edges.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {edges.slice(0, 9).map((edge) => {
            // Garantir que edge é válido e tem todas as propriedades necessárias
            if (!edge || !edge.id) return null;
            
            return (
              <div 
                key={edge.id}
                className="p-3 bg-green-50 rounded-lg border border-green-200 cursor-pointer hover:bg-green-100"
                onClick={() => handleEdgeClick(edge)}
              >
                <div className="font-medium">{edge.type || 'Relationship'}</div>
                <div className="text-sm text-gray-600">
                  {edge.source} → {edge.target}
                </div>
              </div>
            );
          })}
          {edges.length > 9 && (
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-center">
              + {edges.length - 9} more edges
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GraphAlternative; 