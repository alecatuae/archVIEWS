import { useState, useCallback } from 'react';
import { GraphData, Node, Edge } from '@/types/graph';
import GraphVisualization from '@/components/graph/GraphVisualization';
import GraphDetails from '@/components/graph/GraphDetails';
import GraphControls from '@/components/graph/GraphControls';
import Layout from '@/components/layout/Layout';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

// Dados de exemplo para teste
const sampleData: GraphData = {
  nodes: [
    {
      id: 'n1',
      labels: ['Application'],
      properties: {
        name: 'Web Server',
        description: 'Nginx Web Server',
        category: 'application'
      }
    },
    {
      id: 'n2',
      labels: ['Database'],
      properties: {
        name: 'MariaDB',
        description: 'MariaDB Database',
        category: 'database'
      }
    },
    {
      id: 'n3',
      labels: ['Application'],
      properties: {
        name: 'API Server',
        description: 'Node.js API Server',
        category: 'application'
      }
    },
    {
      id: 'n4',
      labels: ['Storage'],
      properties: {
        name: 'Object Storage',
        description: 'S3 Compatible Storage',
        category: 'storage'
      }
    },
    {
      id: 'n5',
      labels: ['Network'],
      properties: {
        name: 'Load Balancer',
        description: 'HAProxy Load Balancer',
        category: 'network'
      }
    }
  ],
  edges: [
    {
      id: 'e1',
      source: 'n1',
      target: 'n3',
      type: 'DEPENDS_ON',
      properties: {
        description: 'Web server depends on API'
      }
    },
    {
      id: 'e2',
      source: 'n3',
      target: 'n2',
      type: 'STORES_DATA_IN',
      properties: {
        description: 'API stores data in MariaDB'
      }
    },
    {
      id: 'e3',
      source: 'n3',
      target: 'n4',
      type: 'USES',
      properties: {
        description: 'API uses object storage'
      }
    },
    {
      id: 'e4',
      source: 'n5',
      target: 'n1',
      type: 'COMMUNICATES_WITH',
      properties: {
        description: 'Load balancer routes to web server'
      }
    }
  ]
};

// Categorias de nós para filtros
const nodeCategories = [
  { id: 'application', label: 'Application', color: '#6b48ff' },
  { id: 'database', label: 'Database', color: '#0897e9' },
  { id: 'storage', label: 'Storage', color: '#0897e9' },
  { id: 'network', label: 'Network', color: '#0adbe3' }
];

// Tipos de relacionamentos para filtros
const relationshipTypes = [
  { id: 'DEPENDS_ON', label: 'Depends On', color: '#feac0e' },
  { id: 'STORES_DATA_IN', label: 'Stores Data In', color: '#0897e9' },
  { id: 'USES', label: 'Uses', color: '#0897e9' },
  { id: 'COMMUNICATES_WITH', label: 'Communicates With', color: '#0adbe3' }
];

// Opções de layout disponíveis
const layoutOptions = [
  { name: 'cola', label: 'Force-Directed' },
  { name: 'circle', label: 'Circle' },
  { name: 'grid', label: 'Grid' },
  { name: 'concentric', label: 'Concentric' },
  { name: 'breadthfirst', label: 'Tree' }
];

export default function GraphTestPage() {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [filteredData, setFilteredData] = useState<GraphData>(sampleData);
  const [cytoscapeInstance, setCytoscapeInstance] = useState<any>(null);
  const [groupByCategory, setGroupByCategory] = useState<boolean>(false);
  const [currentLayout, setCurrentLayout] = useState<string>('cola');

  // Função para limpar a seleção
  const clearSelection = () => {
    setSelectedNode(null);
    setSelectedEdge(null);
  };

  // Manipuladores de eventos de seleção
  const handleNodeSelect = (node: Node | null) => {
    setSelectedEdge(null); // Limpa a seleção de aresta quando um nó é selecionado
    setSelectedNode(node);
  };

  const handleEdgeSelect = (edge: Edge | null) => {
    setSelectedNode(null); // Limpa a seleção de nó quando uma aresta é selecionada
    setSelectedEdge(edge);
  };

  // Funções para filtrar os dados do grafo
  const handleNodeCategoryFilter = useCallback((selectedCategories: string[]) => {
    if (selectedCategories.length === 0) {
      // Se nenhuma categoria estiver selecionada, mostre todos os nós
      setFilteredData(sampleData);
      return;
    }

    // Filtra os nós pelas categorias selecionadas
    const filteredNodes = sampleData.nodes.filter(node => 
      selectedCategories.includes(node.properties.category?.toLowerCase() || '')
    );
    
    // Obtenha os IDs dos nós filtrados
    const filteredNodeIds = new Set(filteredNodes.map(node => node.id));
    
    // Filtra as arestas para incluir apenas aquelas que conectam os nós filtrados
    const filteredEdges = sampleData.edges.filter(edge => 
      filteredNodeIds.has(edge.source) && filteredNodeIds.has(edge.target)
    );
    
    setFilteredData({
      nodes: filteredNodes,
      edges: filteredEdges
    });
  }, []);

  const handleRelationshipFilter = useCallback((selectedRelationships: string[]) => {
    if (selectedRelationships.length === 0) {
      // Se nenhum relacionamento estiver selecionado, use o conjunto atual de nós
      // mas inclua todas as arestas que conectam esses nós
      const currentNodeIds = new Set(filteredData.nodes.map(node => node.id));
      
      const relevantEdges = sampleData.edges.filter(edge => 
        currentNodeIds.has(edge.source) && currentNodeIds.has(edge.target)
      );
      
      setFilteredData({
        nodes: filteredData.nodes,
        edges: relevantEdges
      });
      return;
    }

    // Filtra as arestas pelos tipos de relacionamento selecionados
    const filteredEdges = sampleData.edges.filter(edge => 
      selectedRelationships.includes(edge.type)
    );
    
    // Obtenha os IDs dos nós conectados pelas arestas filtradas
    const connectedNodeIds = new Set<string>();
    filteredEdges.forEach(edge => {
      connectedNodeIds.add(edge.source);
      connectedNodeIds.add(edge.target);
    });
    
    // Filtra os nós para incluir apenas aqueles conectados pelas arestas filtradas
    const filteredNodes = sampleData.nodes.filter(node => 
      connectedNodeIds.has(node.id)
    );
    
    setFilteredData({
      nodes: filteredNodes,
      edges: filteredEdges
    });
  }, [filteredData.nodes]);

  // Funções de zoom e layout
  const handleZoomToFit = () => {
    if (cytoscapeInstance) {
      cytoscapeInstance.fit();
    }
  };

  const handleResetLayout = () => {
    if (cytoscapeInstance) {
      applyLayout(currentLayout);
    }
  };
  
  // Função para aplicar um layout específico
  const applyLayout = (layoutName: string) => {
    if (!cytoscapeInstance) return;
    
    try {
      let layoutOptions: any = {
        name: layoutName,
        animate: true,
        fit: true
      };
      
      // Configurações específicas para cada tipo de layout
      if (layoutName === 'cola') {
        layoutOptions = {
          ...layoutOptions,
          refresh: 1,
          maxSimulationTime: 4000,
          nodeSpacing: 50,
          edgeLength: 200,
          randomize: true
        };
      } else if (layoutName === 'concentric') {
        layoutOptions = {
          ...layoutOptions,
          concentric: (node: any) => node.degree(),
          levelWidth: (nodes: any) => nodes.maxDegree() / 4,
          spacingFactor: 1.5
        };
      } else if (layoutName === 'breadthfirst') {
        layoutOptions = {
          ...layoutOptions,
          directed: true,
          spacingFactor: 1.5
        };
      }
      
      const layout = cytoscapeInstance.layout(layoutOptions as any);
      layout.run();
    } catch (err) {
      console.error(`Error applying ${layoutName} layout:`, err);
      // Fallback para um layout simples
      const fallbackLayout = cytoscapeInstance.layout({
        name: 'circle',
        animate: true
      } as any);
      fallbackLayout.run();
    }
  };

  // Manipulador para troca de layout
  const handleChangeLayout = (layoutName: string) => {
    setCurrentLayout(layoutName);
    applyLayout(layoutName);
  };

  // Manipulador para agrupamento por categoria
  const handleGroupByCategory = (enabled: boolean) => {
    setGroupByCategory(enabled);
    
    if (!cytoscapeInstance) return;
    
    if (enabled) {
      // Agrupamento por categoria
      // Primeiro, remover qualquer agrupamento anterior
      cytoscapeInstance.nodes().forEach((node: any) => {
        node.removeData('parent');
      });
      
      // Remover grupos antigos
      cytoscapeInstance.nodes().filter((node: any) => node.data('isGroup')).remove();
      
      // Criar um mapa de categorias
      const categories = new Map<string, string[]>();
      
      // Agrupar nós por categoria
      cytoscapeInstance.nodes().forEach((node: any) => {
        const category = node.data('properties')?.category?.toLowerCase() || 'unknown';
        if (!categories.has(category)) {
          categories.set(category, []);
        }
        categories.get(category)?.push(node.id());
      });
      
      // Criar nós de grupo para cada categoria
      categories.forEach((nodeIds, category) => {
        if (nodeIds.length > 1) {
          // Criar um nó de grupo
          const groupId = `group-${category}`;
          cytoscapeInstance.add({
            data: {
              id: groupId,
              label: category.charAt(0).toUpperCase() + category.slice(1),
              isGroup: true
            },
            classes: 'group'
          });
          
          // Adicionar nós ao grupo
          nodeIds.forEach(nodeId => {
            const node = cytoscapeInstance.getElementById(nodeId);
            node.data('parent', groupId);
          });
        }
      });
      
      // Aplicar estilo para grupos
      cytoscapeInstance.style()
        .selector('.group')
        .style({
          'shape': 'round-rectangle',
          'padding': 20,
          'background-opacity': 0.2,
          'background-color': (ele: any) => {
            const category = ele.data('label')?.toLowerCase();
            if (category === 'application') return '#6b48ff';
            if (category === 'database') return '#0897e9';
            if (category === 'storage') return '#0897e9';
            if (category === 'network') return '#0adbe3';
            return '#888888';
          }
        })
        .update();
    } else {
      // Remover agrupamento
      cytoscapeInstance.nodes().forEach((node: any) => {
        node.removeData('parent');
      });
      
      // Remover nós de grupo
      cytoscapeInstance.nodes().filter((node: any) => node.data('isGroup')).remove();
    }
    
    // Reaplicar o layout atual
    applyLayout(currentLayout);
  };

  // Função para receber a instância do Cytoscape da visualização
  const handleCytoscapeInstanceReady = (cy: any) => {
    setCytoscapeInstance(cy);
  };

  // Função para exportar o grafo como imagem PNG
  const handleExportGraph = () => {
    if (!cytoscapeInstance) return;
    
    try {
      // Primeiro ajuste a visualização para mostrar todo o grafo
      cytoscapeInstance.fit();
      
      // Delay pequeno para garantir que o layout esteja estabilizado
      setTimeout(() => {
        // Obtenha uma imagem PNG do grafo
        const png = cytoscapeInstance.png({
          output: 'blob',
          scale: 2,
          bg: '#ffffff',
          full: true
        });
        
        // Crie um URL para o blob
        const url = URL.createObjectURL(png);
        
        // Crie um link para download e clique nele
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = `graph-export-${new Date().toISOString().split('T')[0]}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        
        // Limpe
        document.body.removeChild(downloadLink);
        setTimeout(() => URL.revokeObjectURL(url), 100);
      }, 300);
    } catch (error) {
      console.error('Error exporting graph as image:', error);
      alert('Failed to export graph. Please try again later.');
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Graph Visualization Test</h1>
          
          <button
            onClick={handleExportGraph}
            disabled={!cytoscapeInstance || filteredData.nodes.length === 0}
            className={`
              px-3 py-2 rounded-md flex items-center
              ${(!cytoscapeInstance || filteredData.nodes.length === 0) 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'}
            `}
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">Export as PNG</span>
          </button>
        </div>
        
        <div className="mb-4">
          <GraphControls 
            nodeCategories={nodeCategories}
            relationshipTypes={relationshipTypes}
            onNodeCategoryFilter={handleNodeCategoryFilter}
            onRelationshipFilter={handleRelationshipFilter}
            onZoomToFit={handleZoomToFit}
            onResetLayout={handleResetLayout}
            onGroupByCategory={handleGroupByCategory}
            layoutOptions={layoutOptions}
            onChangeLayout={handleChangeLayout}
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-4 h-[600px]">
              <GraphVisualization 
                data={filteredData}
                isLoading={isLoading}
                onNodeSelect={handleNodeSelect}
                onEdgeSelect={handleEdgeSelect}
                onCytoscapeReady={handleCytoscapeInstanceReady}
              />
            </div>
          </div>
          
          <div className="lg:col-span-1">
            {(selectedNode || selectedEdge) ? (
              <GraphDetails
                selectedNode={selectedNode}
                selectedEdge={selectedEdge}
                onClose={clearSelection}
                sourceNodes={sampleData.nodes}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-md p-4">
                <h2 className="text-xl font-semibold mb-2">Selection Details</h2>
                <p className="text-gray-500 italic">Click on a node or edge to see details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
} 