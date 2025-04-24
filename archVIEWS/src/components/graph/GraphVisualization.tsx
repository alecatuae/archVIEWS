import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GraphData, CytoscapeGraphData, Node, Edge } from '@/types/graph';
import { transformToCytoscapeFormat, getCytoscapeStylesheet, getNodeDisplayLabel } from '@/utils/graphUtils';
import { MagnifyingGlassPlusIcon as ZoomInIcon, 
         MagnifyingGlassMinusIcon as ZoomOutIcon, 
         ArrowsPointingOutIcon, 
         ArrowPathIcon } from '@heroicons/react/24/outline';
import GraphAlternative from './GraphAlternative';
import dynamic from 'next/dynamic';
import cytoscape from 'cytoscape';
import cola from 'cytoscape-cola';
import { PlusIcon, MinusIcon } from '@heroicons/react/24/outline';

// Carregue o componente React-Cytoscape dinamicamente para evitar erros de SSR
const CytoscapeComponent = dynamic(
  () => import('react-cytoscapejs'),
  { ssr: false }
);

// Registrar extensões necessárias
if (typeof window !== 'undefined') {
  try {
    // Evite registrar mais de uma vez
    if (!cytoscape.prototype.hasInitialised) {
      cytoscape.use(cola);
      
      // Evitamos problemas com TypeScript registrando o popper com uma função assíncrona
      import('cytoscape-popper').then(module => {
        try {
          // @ts-ignore: Ignorar erro de tipagem ao registrar o popper
          cytoscape.use(module.default);
        } catch (err) {
          console.error('Error registering popper extension:', err);
        }
      });
      
      cytoscape.prototype.hasInitialised = true;
    }
  } catch (err) {
    console.error('Error registering Cytoscape extensions:', err);
  }
}

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

  // Transforma os dados para o formato do Cytoscape
  useEffect(() => {
    try {
      if (data && data.nodes && data.nodes.length > 0) {
        const formattedData = transformToCytoscapeFormat(data);
        setCytoscapeData(formattedData);
      } else {
        setCytoscapeData({ nodes: [], edges: [] });
      }
    } catch (error) {
      console.error('Error transforming data for Cytoscape:', error);
      setIsCytoscapeAvailable(false);
    }
  }, [data]);

  // Atualiza o nível de zoom quando o Cytoscape é atualizado
  useEffect(() => {
    if (cyRef.current) {
      const updateZoomLevel = () => {
        if (cyRef.current) {
          setZoomLevel(cyRef.current.zoom() || 1);
        }
      };
      
      cyRef.current.on('zoom', updateZoomLevel);
      
      return () => {
        if (cyRef.current) {
          cyRef.current.removeListener('zoom', updateZoomLevel);
        }
      };
    }
  }, [cyRef.current]);

  // Configuração de tooltips
  const setupTooltips = useCallback((cy: cytoscape.Core) => {
    if (!cy) return;
    
    try {
      // Tooltip para nós
      cy.nodes().on('mouseover', (event) => {
        if (!event.target || !event.target.data) return;
        
        const node = event.target;
        const nodeData = node.data();
        
        if (!nodeData) return;
        
        // Criação do elemento tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'cy-tooltip';
        tooltip.innerHTML = `
          <div class="bg-black/80 text-white text-xs rounded py-1 px-2 pointer-events-none absolute z-10 max-w-xs">
            <div class="font-bold">${nodeData.label || 'No Label'}</div>
            <div class="text-gray-300">${(nodeData.properties && nodeData.properties.description) || 'No description'}</div>
            <div class="text-gray-400 text-[10px] mt-1">${(nodeData.properties && nodeData.properties.category) || 'No category'}</div>
          </div>
        `;
        
        document.body.appendChild(tooltip);
        
        // Posicionamento do tooltip
        const updateTooltipPosition = () => {
          if (!node || !containerRef.current) return;
          
          const renderedPosition = node.renderedPosition();
          const containerRect = containerRef.current.getBoundingClientRect();
          
          if (containerRect) {
            tooltip.style.left = `${containerRect.left + renderedPosition.x + 10}px`;
            tooltip.style.top = `${containerRect.top + renderedPosition.y - 10}px`;
          }
        };
        
        // Atualizar posição inicial
        updateTooltipPosition();
        
        // Remover tooltip quando o mouse sair
        node.one('mouseout', () => {
          if (document.body.contains(tooltip)) {
            document.body.removeChild(tooltip);
          }
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
        if (!event.target || !event.target.data) return;
        
        const edge = event.target;
        const edgeData = edge.data();
        
        if (!edgeData || !edgeData.source || !edgeData.target) return;
        
        const sourceNode = cy.getElementById(edgeData.source);
        const targetNode = cy.getElementById(edgeData.target);
        
        if (!sourceNode || !targetNode || !sourceNode.data() || !targetNode.data()) return;
        
        const sourceNodeData = sourceNode.data();
        const targetNodeData = targetNode.data();
        
        // Criação do elemento tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'cy-tooltip';
        tooltip.innerHTML = `
          <div class="bg-black/80 text-white text-xs rounded py-1 px-2 pointer-events-none absolute z-10 max-w-xs">
            <div class="font-bold">${edgeData.label || 'No Label'}</div>
            <div class="text-gray-300">${(edgeData.properties && edgeData.properties.description) || 'No description'}</div>
            <div class="text-gray-400 text-[10px] mt-1">${sourceNodeData.label || 'Source'} → ${targetNodeData.label || 'Target'}</div>
          </div>
        `;
        
        document.body.appendChild(tooltip);
        
        // Posicionamento do tooltip
        const updateTooltipPosition = () => {
          if (!edge || !containerRef.current) return;
          
          const midpoint = edge.midpoint();
          const containerRect = containerRef.current.getBoundingClientRect();
          
          if (containerRect) {
            tooltip.style.left = `${containerRect.left + midpoint.x + 10}px`;
            tooltip.style.top = `${containerRect.top + midpoint.y - 10}px`;
          }
        };
        
        // Atualizar posição inicial
        updateTooltipPosition();
        
        // Remover tooltip quando o mouse sair
        edge.one('mouseout', () => {
          if (document.body.contains(tooltip)) {
            document.body.removeChild(tooltip);
          }
        });
        
        // Atualizar posição quando ocorrer zoom ou pan
        cy.on('pan zoom', updateTooltipPosition);
        
        // Limpar eventos quando o tooltip for removido
        edge.one('mouseout', () => {
          cy.removeListener('pan zoom', updateTooltipPosition);
        });
      });
    } catch (err) {
      console.error('Error setting up tooltips:', err);
    }
  }, []);

  // Manipuladores para interações com o grafo
  const handleNodeSelect = useCallback((event: cytoscape.EventObject) => {
    if (!onNodeSelect || !event || !event.target) return;
    
    try {
      const nodeId = event.target.id();
      const selectedNode = data.nodes.find(node => node.id === nodeId) || null;
      onNodeSelect(selectedNode);
    } catch (err) {
      console.error('Error in node selection:', err);
    }
  }, [data.nodes, onNodeSelect]);

  const handleEdgeSelect = useCallback((event: cytoscape.EventObject) => {
    if (!onEdgeSelect || !event || !event.target) return;
    
    try {
      const edgeId = event.target.id();
      const selectedEdge = data.edges.find(edge => edge.id === edgeId) || null;
      onEdgeSelect(selectedEdge);
    } catch (err) {
      console.error('Error in edge selection:', err);
    }
  }, [data.edges, onEdgeSelect]);

  // Manipuladores de zoom e layout
  const handleZoomIn = useCallback(() => {
    if (cyRef.current) {
      cyRef.current.zoom({
        level: cyRef.current.zoom() * 1.2,
        renderedPosition: { x: cyRef.current.width() / 2, y: cyRef.current.height() / 2 }
      });
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (cyRef.current) {
      cyRef.current.zoom({
        level: cyRef.current.zoom() * 0.8,
        renderedPosition: { x: cyRef.current.width() / 2, y: cyRef.current.height() / 2 }
      });
    }
  }, []);

  const handleFit = useCallback(() => {
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
        try {
          const fallbackLayout = cyRef.current.layout({
            name: 'circle',
            animate: true
          } as any);
          fallbackLayout.run();
        } catch (fallbackErr) {
          console.error('Error applying fallback layout:', fallbackErr);
        }
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
      setZoomLevel(newZoomLevel);
    }
  }, []);

  // Manipulador para quando o Cytoscape estiver pronto
  const handleCytoscapeReady = (cy: cytoscape.Core) => {
    try {
      cyRef.current = cy;
      
      // Setup event handlers
      cy.on('tap', 'node', handleNodeSelect);
      cy.on('tap', 'edge', handleEdgeSelect);
      
      // Configurar tooltips
      setupTooltips(cy);

      cy.on('tap', (evt: any) => {
        if (evt.target === cy) {
          // Clicked on background
          if (onNodeSelect) {
            onNodeSelect(null);
          }
          if (onEdgeSelect) {
            onEdgeSelect(null);
          }
        }
      });

      // Executar layout inicial
      try {
        cy.layout({
          name: 'cola',
          animate: true,
          refresh: 1,
          maxSimulationTime: 4000,
          nodeSpacing: 50,
          edgeLength: 200,
          fit: true
        } as any).run();
      } catch (error) {
        console.error('Error running layout:', error);
        // Fallback para layout alternativo
        cy.layout({ name: 'circle', animate: true } as any).run();
      }

      // Expor a instância do Cytoscape para o componente pai
      if (onCytoscapeReady) {
        onCytoscapeReady(cy);
      }
    } catch (error) {
      console.error('Error setting up Cytoscape:', error);
      setIsCytoscapeAvailable(false);
    }
  };

  // Se o Cytoscape não estiver disponível ou ocorrer um erro, use o componente alternativo
  if (!isCytoscapeAvailable || error) {
    console.warn('Falling back to GraphAlternative component due to Cytoscape unavailability', error);
    return (
      <GraphAlternative 
        data={data}
        isLoading={isLoading}
        onNodeSelect={onNodeSelect}
        onEdgeSelect={onEdgeSelect}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-computing-purple"></div>
      </div>
    );
  }

  if (!data || !data.nodes || data.nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>No data available. Please adjust your filters or add new nodes.</p>
      </div>
    );
  }

  return (
    <div className="relative h-full" ref={containerRef}>
      <div className="absolute right-2 top-2 flex flex-col gap-2 z-10">
        <button
          onClick={handleZoomIn}
          className="p-2 bg-white rounded-md shadow text-neutral-gray hover:bg-gray-100"
          title="Zoom In"
        >
          <PlusIcon className="h-5 w-5" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 bg-white rounded-md shadow text-neutral-gray hover:bg-gray-100"
          title="Zoom Out"
        >
          <MinusIcon className="h-5 w-5" />
        </button>
        <button
          onClick={handleFit}
          className="p-2 bg-white rounded-md shadow text-neutral-gray hover:bg-gray-100"
          title="Fit to Screen"
        >
          <ArrowsPointingOutIcon className="h-5 w-5" />
        </button>
      </div>
      
      <CytoscapeComponent
        elements={cytoscapeData.nodes.length > 0 ? [...cytoscapeData.nodes, ...cytoscapeData.edges] : []}
        style={{ width: '100%', height: '100%' }}
        stylesheet={getCytoscapeStylesheet()}
        cy={(cy) => handleCytoscapeReady(cy)}
        wheelSensitivity={0.2}
      />
      
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