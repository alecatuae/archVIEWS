import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GraphData, CytoscapeGraphData, Node, Edge } from '@/types/graph';
import { transformToCytoscapeFormat, getCytoscapeStylesheet, getNodeDisplayLabel } from '@/utils/graphUtils';
import { MagnifyingGlassPlusIcon as ZoomInIcon, 
         MagnifyingGlassMinusIcon as ZoomOutIcon, 
         ArrowsPointingOutIcon, 
         ArrowPathIcon, 
         ViewfinderCircleIcon } from '@heroicons/react/24/outline';
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
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showMinimap, setShowMinimap] = useState<boolean>(false);

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

  // Atualiza o nível de zoom quando o Cytoscape é atualizado
  useEffect(() => {
    if (cyRef.current) {
      const updateZoomLevel = () => {
        setZoomLevel(cyRef.current?.zoom() || 1);
      };
      
      cyRef.current.on('zoom', updateZoomLevel);
      
      return () => {
        cyRef.current?.removeListener('zoom', updateZoomLevel);
      };
    }
  }, [cyRef.current]);

  // Configuração de tooltips
  const setupTooltips = useCallback((cy: cytoscape.Core) => {
    // Tooltip para nós
    cy.nodes().on('mouseover', (event) => {
      const node = event.target;
      const nodeData = node.data();
      
      // Criação do elemento tooltip
      const tooltip = document.createElement('div');
      tooltip.className = 'cy-tooltip';
      tooltip.innerHTML = `
        <div class="bg-black/80 text-white text-xs rounded py-1 px-2 pointer-events-none absolute z-10 max-w-xs">
          <div class="font-bold">${nodeData.label}</div>
          <div class="text-gray-300">${nodeData.properties.description || 'No description'}</div>
          <div class="text-gray-400 text-[10px] mt-1">${nodeData.properties.category || 'No category'}</div>
        </div>
      `;
      
      document.body.appendChild(tooltip);
      
      // Posicionamento do tooltip
      const updateTooltipPosition = () => {
        const renderedPosition = node.renderedPosition();
        const containerRect = containerRef.current?.getBoundingClientRect();
        
        if (containerRect) {
          tooltip.style.left = `${containerRect.left + renderedPosition.x + 10}px`;
          tooltip.style.top = `${containerRect.top + renderedPosition.y - 10}px`;
        }
      };
      
      // Atualizar posição inicial
      updateTooltipPosition();
      
      // Remover tooltip quando o mouse sair
      node.one('mouseout', () => {
        document.body.removeChild(tooltip);
      });
      
      // Atualizar posição quando ocorrer zoom ou pan
      cy.on('pan zoom', updateTooltipPosition);
      
      // Limpar eventos quando o tooltip for removido
      node.one('mouseout', () => {
        cy.removeListener('pan zoom', updateTooltipPosition);
      });
    });
    
    // Tooltip para arestas
    cy.edges().on('mouseover', (event) => {
      const edge = event.target;
      const edgeData = edge.data();
      const sourceNode = cy.getElementById(edgeData.source).data();
      const targetNode = cy.getElementById(edgeData.target).data();
      
      // Criação do elemento tooltip
      const tooltip = document.createElement('div');
      tooltip.className = 'cy-tooltip';
      tooltip.innerHTML = `
        <div class="bg-black/80 text-white text-xs rounded py-1 px-2 pointer-events-none absolute z-10 max-w-xs">
          <div class="font-bold">${edgeData.label}</div>
          <div class="text-gray-300">${edgeData.properties.description || 'No description'}</div>
          <div class="text-gray-400 text-[10px] mt-1">${sourceNode.label} → ${targetNode.label}</div>
        </div>
      `;
      
      document.body.appendChild(tooltip);
      
      // Posicionamento do tooltip
      const updateTooltipPosition = () => {
        const midpoint = edge.midpoint();
        const containerRect = containerRef.current?.getBoundingClientRect();
        
        if (containerRect) {
          tooltip.style.left = `${containerRect.left + midpoint.x + 10}px`;
          tooltip.style.top = `${containerRect.top + midpoint.y - 10}px`;
        }
      };
      
      // Atualizar posição inicial
      updateTooltipPosition();
      
      // Remover tooltip quando o mouse sair
      edge.one('mouseout', () => {
        document.body.removeChild(tooltip);
      });
      
      // Atualizar posição quando ocorrer zoom ou pan
      cy.on('pan zoom', updateTooltipPosition);
      
      // Limpar eventos quando o tooltip for removido
      edge.one('mouseout', () => {
        cy.removeListener('pan zoom', updateTooltipPosition);
      });
    });
  }, []);

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
        } as any);
        layout.run();
      } catch (err) {
        console.error('Error applying cola layout:', err);
        
        // Fallback para um layout padrão se o cola falhar
        const fallbackLayout = cyRef.current.layout({
          name: 'circle',
          animate: true
        } as any);
        fallbackLayout.run();
      }
    }
  }, []);

  // Função para lidar com a mudança do slider de zoom
  const handleZoomChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newZoomLevel = parseFloat(e.target.value);
    if (cyRef.current) {
      cyRef.current.zoom({
        level: newZoomLevel,
        renderedPosition: { x: cyRef.current.width() / 2, y: cyRef.current.height() / 2 }
      });
    }
  }, []);

  // Toggle do mini-mapa
  const toggleMinimap = useCallback(() => {
    setShowMinimap(!showMinimap);
  }, [showMinimap]);

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
      <div className="flex justify-between items-center mb-2">
        <div className="flex-1 px-4 py-1">
          <input
            type="range"
            min="0.1"
            max="3"
            step="0.1"
            value={zoomLevel}
            onChange={handleZoomChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>10%</span>
            <span>{Math.round(zoomLevel * 100)}%</span>
            <span>300%</span>
          </div>
        </div>
        <div className="flex space-x-2">
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
          <button
            className={`p-2 rounded-full shadow ${showMinimap ? 'bg-blue-100 text-blue-600' : 'bg-white hover:bg-gray-100 text-gray-600'}`}
            title="Show/Hide Minimap"
            onClick={toggleMinimap}
          >
            <ViewfinderCircleIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div 
        ref={containerRef}
        className="flex-1 border border-gray-300 rounded-lg overflow-hidden bg-white relative"
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
          <>
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
                
                // Adicionar tooltips
                setupTooltips(cy);
                
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
                  } as any);
                  layout.run();
                } catch (err) {
                  console.error('Error running cola layout:', err);
                  // Fallback para layout alternativo
                  const fallbackLayout = cy.layout({
                    name: 'circle', 
                    animate: true
                  } as any);
                  fallbackLayout.run();
                }
              }}
            />
            
            {/* Mini-mapa */}
            {showMinimap && (
              <div 
                className="absolute bottom-4 right-4 w-48 h-48 bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden opacity-80 hover:opacity-100 transition-opacity"
                style={{ pointerEvents: 'none' }}
              >
                {cyRef.current && (
                  <div className="w-full h-full">
                    <CytoscapeComponent
                      elements={[...cytoscapeData.nodes, ...cytoscapeData.edges]}
                      style={{ width: '100%', height: '100%' }}
                      stylesheet={[
                        ...getCytoscapeStylesheet(),
                        {
                          selector: 'node',
                          style: {
                            width: 10,
                            height: 10,
                            label: '', // Sem labels no mini-mapa
                          }
                        },
                        {
                          selector: 'edge',
                          style: {
                            width: 1,
                            label: '', // Sem labels no mini-mapa
                          }
                        }
                      ]}
                      cy={(miniCy) => {
                        // Sincroniza o zoom e a posição com o grafo principal
                        const syncViewport = () => {
                          if (cyRef.current) {
                            const mainPan = cyRef.current.pan();
                            const mainZoom = cyRef.current.zoom();
                            
                            // Calcula a transformação inversa para mostrar a viewport
                            miniCy.fit();
                            miniCy.zoom(miniCy.zoom() * 0.8);
                          }
                        };
                        
                        // Aplica o layout
                        miniCy.layout({
                          name: 'preset',
                          fit: true
                        }).run();
                        
                        syncViewport();
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Estilo global para tooltips */}
      <style jsx global>{`
        .cy-tooltip {
          position: absolute;
          z-index: 9999;
          pointer-events: none;
          transition: all 0.1s ease;
        }
      `}</style>
    </div>
  );
};

export default GraphVisualization; 