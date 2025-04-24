import React, { useEffect, useRef, useState } from 'react';
import { GraphData, CytoscapeGraphData, Node, Edge } from '@/types/graph';
import { transformToCytoscapeFormat } from '@/utils/graphUtils';
import { ZoomInIcon, ZoomOutIcon, ArrowsPointingOutIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import GraphAlternative from './GraphAlternative';

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

  useEffect(() => {
    if (data && data.nodes && data.edges) {
      const transformed = transformToCytoscapeFormat(data);
      setCytoscapeData(transformed);
    }
  }, [data]);
  
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