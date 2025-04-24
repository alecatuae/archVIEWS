import React, { useEffect, useRef, useState } from 'react';
import { GraphData, CytoscapeGraphData, Node, Edge } from '@/types/graph';
import { transformToCytoscapeFormat, getCytoscapeStylesheet } from '@/utils/graphUtils';
import { ZoomInIcon, ZoomOutIcon, ArrowsPointingOutIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import GraphAlternative from './GraphAlternative';
import dynamic from 'next/dynamic';

// Import the CytoscapeWrapper with dynamic import to prevent SSR issues
const CytoscapeWrapper = dynamic(
  () => import('./CytoscapeWrapper.tsx').then(mod => mod),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }
);

interface GraphVisualizationProps {
  data: GraphData;
  isLoading?: boolean;
  onNodeSelect?: (node: Node | null) => void;
  onEdgeSelect?: (edge: Edge | null) => void;
  onDataUpdate?: (graphData: GraphData) => void;
}

const GraphVisualization: React.FC<GraphVisualizationProps> = ({
  data,
  isLoading = false,
  onNodeSelect,
  onEdgeSelect,
  onDataUpdate
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cytoscapeData, setCytoscapeData] = useState<CytoscapeGraphData>({ nodes: [], edges: [] });
  const [selectedElement, setSelectedElement] = useState<any>(null);
  const [showAlternativeView, setShowAlternativeView] = useState<boolean>(true);

  useEffect(() => {
    if (data && data.nodes && data.edges) {
      const transformed = transformToCytoscapeFormat(data);
      setCytoscapeData(transformed);
    }
  }, [data]);

  // Handle node selection in cytoscape
  const handleNodeSelect = (event: any) => {
    if (event.target && event.target.isNode && event.target.isNode()) {
      const nodeId = event.target.id();
      const node = data.nodes.find(n => n.id === nodeId);
      if (node && onNodeSelect) {
        onNodeSelect(node);
      }
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-end space-x-2 mb-2">
        <button
          className="p-2 bg-white rounded-full shadow hover:bg-gray-100"
          title="Zoom In"
          disabled
        >
          <ZoomInIcon className="h-5 w-5 text-gray-400" />
        </button>
        <button
          className="p-2 bg-white rounded-full shadow hover:bg-gray-100"
          title="Zoom Out"
          disabled
        >
          <ZoomOutIcon className="h-5 w-5 text-gray-400" />
        </button>
        <button
          className="p-2 bg-white rounded-full shadow hover:bg-gray-100"
          title="Fit View"
          disabled
        >
          <ArrowsPointingOutIcon className="h-5 w-5 text-gray-400" />
        </button>
        <button
          className="p-2 bg-white rounded-full shadow hover:bg-gray-100"
          title="Reset Layout"
          disabled
        >
          <ArrowPathIcon className="h-5 w-5 text-gray-400" />
        </button>
      </div>

      <div 
        ref={containerRef}
        className="flex-1 border border-gray-300 rounded-lg overflow-hidden bg-white"
        style={{ minHeight: "500px" }}
      >
        {/* Always use the GraphAlternative component for now until we resolve the Cytoscape issues */}
        <GraphAlternative 
          data={data}
          isLoading={isLoading}
          onNodeSelect={onNodeSelect}
          onEdgeSelect={onEdgeSelect}
        />
      </div>
    </div>
  );
};

export default GraphVisualization; 