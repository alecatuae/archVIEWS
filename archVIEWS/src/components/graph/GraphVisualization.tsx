import React, { useEffect, useRef, useState } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape from 'cytoscape';
import cola from 'cytoscape-cola';
import { GraphData, CytoscapeGraphData, Node, Edge } from '@/types/graph';
import { getCytoscapeStylesheet, transformToCytoscapeFormat } from '@/utils/graphUtils';
import { ZoomInIcon, ZoomOutIcon, ArrowsPointingOutIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

// Registrar o layout cola para Cytoscape
cytoscape.use(cola);

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
  const cyRef = useRef<cytoscape.Core | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [cytoscapeData, setCytoscapeData] = useState<CytoscapeGraphData>({ nodes: [], edges: [] });
  const [selectedElement, setSelectedElement] = useState<any>(null);

  useEffect(() => {
    if (data && data.nodes && data.edges) {
      const transformed = transformToCytoscapeFormat(data);
      setCytoscapeData(transformed);
    }
  }, [data]);

  const handleZoomIn = () => {
    if (cyRef.current) {
      cyRef.current.zoom({
        level: cyRef.current.zoom() * 1.2,
        renderedPosition: { x: containerRef.current?.offsetWidth! / 2, y: containerRef.current?.offsetHeight! / 2 }
      });
    }
  };

  const handleZoomOut = () => {
    if (cyRef.current) {
      cyRef.current.zoom({
        level: cyRef.current.zoom() * 0.8,
        renderedPosition: { x: containerRef.current?.offsetWidth! / 2, y: containerRef.current?.offsetHeight! / 2 }
      });
    }
  };

  const handleFitView = () => {
    if (cyRef.current) {
      cyRef.current.fit();
    }
  };

  const handleLayoutReset = () => {
    if (cyRef.current) {
      cyRef.current.layout({
        name: 'cola',
        nodeSpacing: 120,
        edgeLengthVal: 100,
        animate: true,
        randomize: true,
        maxSimulationTime: 4000
      }).run();
    }
  };

  const handleCytoscapeReady = (cy: cytoscape.Core) => {
    cyRef.current = cy;

    cy.on('tap', (event) => {
      // Clicou no fundo
      if (event.target === cy) {
        setSelectedElement(null);
        if (onNodeSelect) onNodeSelect(null);
        if (onEdgeSelect) onEdgeSelect(null);
      }
    });

    cy.on('tap', 'node', (event) => {
      const nodeId = event.target.id();
      const selectedNode = data.nodes.find(node => node.id === nodeId) || null;
      setSelectedElement({ type: 'node', data: selectedNode });
      if (onNodeSelect) onNodeSelect(selectedNode);
      if (onEdgeSelect) onEdgeSelect(null);
    });

    cy.on('tap', 'edge', (event) => {
      const edgeId = event.target.id();
      const selectedEdge = data.edges.find(edge => edge.id === edgeId) || null;
      setSelectedElement({ type: 'edge', data: selectedEdge });
      if (onEdgeSelect) onEdgeSelect(selectedEdge);
      if (onNodeSelect) onNodeSelect(null);
    });

    // Configurar layout inicial
    cy.layout({
      name: 'cola',
      nodeSpacing: 120,
      edgeLengthVal: 100,
      animate: true,
      maxSimulationTime: 4000
    }).run();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-end space-x-2 mb-2">
        <button
          className="p-2 bg-white rounded-full shadow hover:bg-gray-100"
          onClick={handleZoomIn}
          title="Zoom In"
        >
          <ZoomInIcon className="h-5 w-5 text-neutral-gray" />
        </button>
        <button
          className="p-2 bg-white rounded-full shadow hover:bg-gray-100"
          onClick={handleZoomOut}
          title="Zoom Out"
        >
          <ZoomOutIcon className="h-5 w-5 text-neutral-gray" />
        </button>
        <button
          className="p-2 bg-white rounded-full shadow hover:bg-gray-100"
          onClick={handleFitView}
          title="Fit View"
        >
          <ArrowsPointingOutIcon className="h-5 w-5 text-neutral-gray" />
        </button>
        <button
          className="p-2 bg-white rounded-full shadow hover:bg-gray-100"
          onClick={handleLayoutReset}
          title="Reset Layout"
        >
          <ArrowPathIcon className="h-5 w-5 text-neutral-gray" />
        </button>
      </div>

      <div 
        ref={containerRef}
        className="flex-1 border border-gray-300 rounded-lg overflow-hidden bg-white"
        style={{ minHeight: "500px" }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-computing-purple"></div>
          </div>
        ) : (
          cytoscapeData.nodes.length > 0 && (
            <CytoscapeComponent
              elements={[...cytoscapeData.nodes, ...cytoscapeData.edges]}
              style={{ width: '100%', height: '100%' }}
              stylesheet={getCytoscapeStylesheet()}
              cy={handleCytoscapeReady}
              boxSelectionEnabled={true}
              userZoomingEnabled={true}
              userPanningEnabled={true}
              autounselectify={false}
            />
          )
        )}

        {!isLoading && cytoscapeData.nodes.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-neutral-gray">
            <p className="text-lg">Nenhum dado para visualizar</p>
            <p className="text-sm">Ajuste os filtros ou carregue novos dados</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GraphVisualization; 