import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GraphData, CytoscapeGraphData, Node, Edge } from '@/types/graph';
import { transformToCytoscapeFormat, getCytoscapeStylesheet } from '@/utils/graphUtils';
import { MagnifyingGlassPlusIcon as ZoomInIcon, 
         MagnifyingGlassMinusIcon as ZoomOutIcon, 
         ArrowsPointingOutIcon, 
         ArrowPathIcon } from '@heroicons/react/24/outline';
import GraphAlternative from './GraphAlternative';
import dynamic from 'next/dynamic';
import cytoscape from 'cytoscape';

// Registre extensões do Cytoscape apenas no lado do cliente
if (typeof window !== 'undefined') {
  // Importações dinâmicas para evitar problemas no SSR
  import('cytoscape-cola')
    .then((colaModule) => {
      const cola = colaModule.default;
      // Evite registrar mais de uma vez
      if (!cytoscape.prototype.hasInitialised) {
        cytoscape.use(cola);
      }
    })
    .catch(err => {
      console.error('Error loading cytoscape-cola:', err);
    });
}

// Carregue o componente React-Cytoscape dinamicamente para evitar erros de SSR
const CytoscapeComponent = dynamic(
  () => import('react-cytoscapejs'),
  { ssr: false }
);

interface GraphVisualizationProps {
  data: GraphData;
  isLoading?: boolean;
  onNodeSelect?: (node: Node | null) => void;
  onEdgeSelect?: (edge: Edge | null) => void;
  onDataUpdate?: (graphData: GraphData) => void;
  onCytoscapeReady?: (cy: cytoscape.Core) => void;
}

const GraphVisualization: React.FC<GraphVisualizationProps> = ({
  data,
  isLoading = false,
  onNodeSelect,
  onEdgeSelect,
  onDataUpdate,
  onCytoscapeReady
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const [cytoscapeData, setCytoscapeData] = useState<CytoscapeGraphData>({ nodes: [], edges: [] });
  const [isCytoscapeAvailable, setIsCytoscapeAvailable] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Transforma os dados para o formato do Cytoscape
  useEffect(() => {
    try {
      if (data && data.nodes && data.edges) {
        const transformed = transformToCytoscapeFormat(data);
        setCytoscapeData(transformed);
      }
    } catch (err) {
      console.error('Error transforming data for Cytoscape:', err);
      setError(err instanceof Error ? err : new Error('Unknown error transforming data'));
      setIsCytoscapeAvailable(false);
    }
  }, [data]);

  // Manipuladores para interações com o grafo
  const handleNodeSelect = useCallback((event: cytoscape.EventObject) => {
    if (!onNodeSelect) return;
    
    const nodeId = event.target.id();
    const selectedNode = data.nodes.find(node => node.id === nodeId) || null;
    onNodeSelect(selectedNode);
  }, [data.nodes, onNodeSelect]);

  const handleEdgeSelect = useCallback((event: cytoscape.EventObject) => {
    if (!onEdgeSelect) return;
    
    const edgeId = event.target.id();
    const selectedEdge = data.edges.find(edge => edge.id === edgeId) || null;
    onEdgeSelect(selectedEdge);
  }, [data.edges, onEdgeSelect]);

  // Manipuladores de zoom e layout
  const zoomIn = useCallback(() => {
    if (cyRef.current) {
      cyRef.current.zoom({
        level: cyRef.current.zoom() * 1.2,
        renderedPosition: { x: cyRef.current.width() / 2, y: cyRef.current.height() / 2 }
      });
    }
  }, []);

  const zoomOut = useCallback(() => {
    if (cyRef.current) {
      cyRef.current.zoom({
        level: cyRef.current.zoom() * 0.8,
        renderedPosition: { x: cyRef.current.width() / 2, y: cyRef.current.height() / 2 }
      });
    }
  }, []);

  const fitToScreen = useCallback(() => {
    if (cyRef.current) {
      cyRef.current.fit();
    }
  }, []);

  const resetLayout = useCallback(() => {
    if (cyRef.current) {
      try {
        // Aplica o layout Cola (força-dirigido)
        const layout = cyRef.current.layout({
          name: 'cola',
          animate: true,
          refresh: 1,
          maxSimulationTime: 4000,
          nodeSpacing: 50,
          edgeLength: 200,
          randomize: true
        });
        layout.run();
      } catch (err) {
        console.error('Error applying cola layout:', err);
        
        // Fallback para um layout padrão se o cola falhar
        const fallbackLayout = cyRef.current.layout({
          name: 'circle',
          animate: true
        });
        fallbackLayout.run();
      }
    }
  }, []);

  // Se o Cytoscape não estiver disponível ou ocorrer um erro, use o componente alternativo
  if (!isCytoscapeAvailable || error) {
    return (
      <GraphAlternative 
        data={data}
        isLoading={isLoading}
        onNodeSelect={(nodeId) => {
          if (onNodeSelect && nodeId) {
            const node = data.nodes.find(n => n.id === nodeId) || null;
            onNodeSelect(node);
          }
        }}
        onEdgeSelect={(edgeId) => {
          if (onEdgeSelect && edgeId) {
            const edge = data.edges.find(e => e.id === edgeId) || null;
            onEdgeSelect(edge);
          }
        }}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-end space-x-2 mb-2">
        <button
          className="p-2 bg-white rounded-full shadow hover:bg-gray-100"
          title="Zoom In"
          onClick={zoomIn}
        >
          <ZoomInIcon className="h-5 w-5 text-gray-600" />
        </button>
        <button
          className="p-2 bg-white rounded-full shadow hover:bg-gray-100"
          title="Zoom Out"
          onClick={zoomOut}
        >
          <ZoomOutIcon className="h-5 w-5 text-gray-600" />
        </button>
        <button
          className="p-2 bg-white rounded-full shadow hover:bg-gray-100"
          title="Fit View"
          onClick={fitToScreen}
        >
          <ArrowsPointingOutIcon className="h-5 w-5 text-gray-600" />
        </button>
        <button
          className="p-2 bg-white rounded-full shadow hover:bg-gray-100"
          title="Reset Layout"
          onClick={resetLayout}
        >
          <ArrowPathIcon className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      <div 
        ref={containerRef}
        className="flex-1 border border-gray-300 rounded-lg overflow-hidden bg-white"
        style={{ minHeight: "500px" }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full w-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : cytoscapeData.nodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full w-full bg-gray-100 rounded-lg">
            <div className="text-center">
              <p className="text-lg text-gray-600">No graph data available</p>
              <p className="text-sm text-gray-500">Adjust your filters or load new data</p>
            </div>
          </div>
        ) : (
          <CytoscapeComponent
            elements={[...cytoscapeData.nodes, ...cytoscapeData.edges]}
            style={{ width: '100%', height: '100%' }}
            stylesheet={getCytoscapeStylesheet()}
            cy={(cy) => {
              cyRef.current = cy;
              
              // Expor a instância do Cytoscape para o componente pai
              if (onCytoscapeReady) {
                onCytoscapeReady(cy);
              }
              
              // Limpar todos os eventos anteriores
              cy.removeAllListeners();
              
              // Adicionar eventos de seleção
              cy.on('tap', 'node', handleNodeSelect);
              cy.on('tap', 'edge', handleEdgeSelect);
              
              // Adicionar evento para desselecionar quando clicar no fundo
              cy.on('tap', function(event) {
                if (event.target === cy) {
                  if (onNodeSelect) onNodeSelect(null);
                  if (onEdgeSelect) onEdgeSelect(null);
                }
              });
              
              // Executar o layout inicial
              try {
                const layout = cy.layout({
                  name: 'cola',
                  animate: true,
                  refresh: 1,
                  maxSimulationTime: 4000,
                  nodeSpacing: 50,
                  edgeLength: 200,
                  randomize: true
                });
                layout.run();
              } catch (err) {
                console.error('Error running cola layout:', err);
                // Fallback para layout alternativo
                const fallbackLayout = cy.layout({
                  name: 'circle', 
                  animate: true
                });
                fallbackLayout.run();
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

export default GraphVisualization; 