import React, { useState, useEffect, useCallback } from 'react';
import { GraphData, Node, Edge } from '@/types/graph';
import GraphVisualization from '@/components/graph/GraphVisualization';
import { ArrowDownTrayIcon, PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import Layout from '@/components/layout/Layout';
import useGraphData from '@/hooks/useGraphData';
import NodeRelationships from '@/components/graph/NodeRelationships';
import { getNodeDisplayLabel } from '@/utils/graphUtils';
import Link from 'next/link';
import Button from '@/components/ui/Button';

// Componente do painel de detalhes
const NodeDetails: React.FC<{ node: Node; environment?: string }> = ({ node, environment }) => {
  if (!node) return null;
  
  const nodeDetails = [
    { label: "owner", value: node.properties.owner || "Network Team" },
    { label: "environment", value: environment || node.properties.environment || "Production" },
    { label: "description", value: node.properties.description || "Border Firewall" },
    { label: "type", value: node.properties.type || "Firewall" },
    { label: "category", value: node.properties.category || "Security" },
    { label: "status", value: node.properties.status || "active" },
  ];

  return (
    <div className="p-4">
      {nodeDetails.map((detail, index) => (
        <div key={index} className="mb-2">
          <span className="text-sm text-gray-500">{detail.label}:</span>
          <div className="font-medium">{detail.value}</div>
        </div>
      ))}
    </div>
  );
};

// Componente da tabela de relacionamentos
const RelationshipTable: React.FC<{ edges: Edge[]; nodes: Node[]; onSelect: (type: 'node' | 'edge', id: string) => void }> = ({ 
  edges, 
  nodes,
  onSelect 
}) => {
  // Função para obter o nome/label do nó pelo ID
  const getNodeNameById = (id: string) => {
    const node = nodes.find(n => n.id === id);
    return node ? getNodeDisplayLabel(node) : `ID: ${id.substring(0, 8)}`;
  };
  
  const sortedEdges = [...edges].sort((a, b) => {
    const sourceA = getNodeNameById(a.source);
    const sourceB = getNodeNameById(b.source);
    return sourceA.localeCompare(sourceB);
  });
  
  return (
    <div className="mt-2 overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">IC Origin</th>
            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Relationship</th>
            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">IC Destination</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedEdges.map((edge) => (
            <tr key={edge.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 text-sm text-neutral-gray cursor-pointer" onClick={() => onSelect('node', edge.source)}>
                {getNodeNameById(edge.source)}
              </td>
              <td className="px-4 py-2 text-sm text-neutral-gray cursor-pointer" onClick={() => onSelect('edge', edge.id)}>
                {edge.type}
              </td>
              <td className="px-4 py-2 text-sm text-neutral-gray cursor-pointer" onClick={() => onSelect('node', edge.target)}>
                {getNodeNameById(edge.target)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Componente de filtro por categoria com estilo atualizado
const CategoryFilter: React.FC<{ 
  categories: { id: string; label: string }[]; 
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}> = ({ 
  categories, 
  selectedCategory,
  onSelectCategory
}) => {
  return (
    <div className="mb-4">
      <h3 className="text-lg font-medium mb-2">IC (Nodes)</h3>
      <div className="flex flex-col">
        {categories.map((category) => (
          <div
            key={category.id}
            className={`p-3 cursor-pointer ${
              selectedCategory === category.id 
                ? 'bg-neutral-gray text-white' 
                : 'bg-gray-100 hover:bg-gray-200 text-neutral-gray'
            } mb-1 rounded transition-colors duration-150 ease-in-out`}
            onClick={() => onSelectCategory(category.id === selectedCategory ? null : category.id)}
          >
            {category.label}
            {selectedCategory === category.id && (
              <span className="ml-1 float-right">▼</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Componente para seções expansíveis
const CollapsibleSection: React.FC<{
  title: string;
  isOpen?: boolean;
  children?: React.ReactNode;
}> = ({ title, children, isOpen = false }) => {
  const [isExpanded, setIsExpanded] = useState(isOpen);
  
  return (
    <div className="mb-1 bg-gray-100 rounded overflow-hidden">
      <div 
        className="p-3 flex justify-between items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="font-medium">{title}</span>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={`h-4 w-4 transition-transform ${isExpanded ? 'transform rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      
      {isExpanded && (
        <div className="p-3 border-t border-gray-200 bg-white">
          {children}
        </div>
      )}
    </div>
  );
};

const GraphPage: React.FC = () => {
  const { data, isLoading, error, fetchData } = useGraphData({ initialLoad: true });
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [cytoscapeInstance, setCytoscapeInstance] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filteredData, setFilteredData] = useState<GraphData>({ nodes: [], edges: [] });
  const [showSidebar, setShowSidebar] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Categorias para filtro - Correspondendo ao wireframe
  const categories = [
    { id: 'server', label: 'Server' },
    { id: 'firewall', label: 'Firewall' },
    { id: 'storage', label: 'Storage' },
    { id: 'internet', label: 'Internet' }
  ];
  
  // Efeito para atualizar dados filtrados quando os dados originais ou categorias selecionadas mudam
  useEffect(() => {
    if (!data || !data.nodes || !data.edges) {
      setFilteredData({ nodes: [], edges: [] });
      return;
    }

    if (!selectedCategory) {
      setFilteredData(data);
      return;
    }

    // Filtrar por categoria selecionada
    const filteredNodes = data.nodes.filter(node => 
      node.properties && 
      node.properties.category && 
      (node.properties.category.toLowerCase() === selectedCategory.toLowerCase())
    );
    
    const filteredNodeIds = new Set(filteredNodes.map(node => node.id));
    
    // Incluir nós conectados aos nós filtrados
    const connectedNodes: Node[] = [];
    const filteredEdges: Edge[] = [];
    
    data.edges.forEach(edge => {
      const sourceInFilter = filteredNodeIds.has(edge.source);
      const targetInFilter = filteredNodeIds.has(edge.target);
      
      if (sourceInFilter || targetInFilter) {
        filteredEdges.push(edge);
        
        if (!sourceInFilter) {
          const sourceNode = data.nodes.find(n => n.id === edge.source);
          if (sourceNode && !filteredNodeIds.has(sourceNode.id)) {
            connectedNodes.push(sourceNode);
            filteredNodeIds.add(sourceNode.id);
          }
        }
        
        if (!targetInFilter) {
          const targetNode = data.nodes.find(n => n.id === edge.target);
          if (targetNode && !filteredNodeIds.has(targetNode.id)) {
            connectedNodes.push(targetNode);
            filteredNodeIds.add(targetNode.id);
          }
        }
      }
    });
    
    setFilteredData({
      nodes: [...filteredNodes, ...connectedNodes],
      edges: filteredEdges
    });
  }, [data, selectedCategory]);

  // Manipuladores de seleção
  const handleNodeSelect = useCallback((node: Node | null) => {
    try {
      setSelectedNode(node);
      setSelectedEdge(null);
    } catch (error) {
      console.error('Error selecting node:', error);
    }
  }, []);

  const handleEdgeSelect = useCallback((edge: Edge | null) => {
    try {
      setSelectedEdge(edge);
      setSelectedNode(null);
    } catch (error) {
      console.error('Error selecting edge:', error);
    }
  }, []);

  // Manipulador para seleção na tabela
  const handleTableSelect = useCallback((type: 'node' | 'edge', id: string) => {
    if (!id || !filteredData) return;
    
    try {
      if (type === 'node') {
        const node = filteredData.nodes.find(n => n.id === id);
        if (node) {
          setSelectedNode(node);
          setSelectedEdge(null);
        }
      } else {
        const edge = filteredData.edges.find(e => e.id === id);
        if (edge) {
          setSelectedEdge(edge);
          setSelectedNode(null);
        }
      }
    } catch (error) {
      console.error('Error handling table selection:', error);
    }
  }, [filteredData]);

  // Manipulador para exportar como CSV
  const handleExportGraph = useCallback(() => {
    if (!filteredData || !filteredData.nodes || filteredData.nodes.length === 0) {
      console.warn('No data available for export');
      return;
    }
    
    try {
      // Criar CSV para nós
      const nodeRows = filteredData.nodes.map(node => {
        return {
          id: node.id,
          label: node.properties.name || node.properties.label || node.id,
          category: node.properties.category || '',
          type: node.properties.type || '',
          description: node.properties.description || ''
        };
      });
      
      // Criar CSV para arestas
      const edgeRows = filteredData.edges.map(edge => {
        const source = filteredData.nodes.find(n => n.id === edge.source);
        const target = filteredData.nodes.find(n => n.id === edge.target);
        
        return {
          id: edge.id,
          source: edge.source,
          source_label: source ? (source.properties.name || source.properties.label || source.id) : edge.source,
          target: edge.target,
          target_label: target ? (target.properties.name || target.properties.label || target.id) : edge.target,
          type: edge.type,
          description: edge.properties?.description || ''
        };
      });
      
      // Converter para CSV
      const nodeCSV = convertToCSV(nodeRows);
      const edgeCSV = convertToCSV(edgeRows);
      
      // Download
      downloadCSV(nodeCSV, 'nodes.csv');
      downloadCSV(edgeCSV, 'edges.csv');
      
    } catch (error) {
      console.error('Error exporting graph as CSV:', error);
      alert('Failed to export graph. Please try again later.');
    }
  }, [filteredData]);
  
  // Função auxiliar para converter para CSV
  const convertToCSV = (array: any[]) => {
    if (array.length === 0) return '';
    
    const header = Object.keys(array[0]).join(',');
    const rows = array.map(obj => 
      Object.values(obj).map(value => 
        `"${String(value).replace(/"/g, '""')}"`
      ).join(',')
    );
    
    return [header, ...rows].join('\n');
  };
  
  // Função auxiliar para download de CSV
  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Verificar se há dados para renderizar
  const hasData = filteredData && filteredData.nodes && filteredData.nodes.length > 0;
  
  // Verificar se há erro na carregamento
  const hasError = error ? true : false;
  
  // Manipulador de pesquisa
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementar a lógica de pesquisa aqui
    console.log("Searching for:", searchTerm);
  };

  return (
    <Layout title="Arch Visualization">
      {hasError && (
        <div className="bg-red-50 text-red-700 p-4 mb-4 rounded-lg">
          <h3 className="font-medium">Error loading graph data</h3>
          <p>{error?.toString() || 'Unknown error'}</p>
        </div>
      )}
      
      <div className="grid grid-cols-4 gap-4 h-full">
        {/* Visualização do grafo (3/4 da largura) */}
        <div className={`${showSidebar ? 'col-span-3' : 'col-span-4'} flex flex-col h-full`}>
          <div className="bg-white rounded-lg shadow p-4 mb-4 flex justify-between items-center">
            <h1 className="text-xl font-bold text-neutral-gray">Arch Visualization</h1>
            <div className="flex space-x-2">
              <button 
                onClick={() => setShowSidebar(!showSidebar)}
                className="px-3 py-1 bg-gray-100 text-sm text-gray-700 rounded"
              >
                {showSidebar ? 'Hide Details' : 'Show Details'}
              </button>
              <button
                onClick={handleExportGraph}
                disabled={!hasData}
                className={`
                  px-3 py-1 rounded flex items-center text-sm
                  ${(!hasData) 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-computing-purple text-white hover:bg-computing-purple/90'}
                `}
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                <span>Export to CSV</span>
              </button>
            </div>
          </div>
          
          <div className="flex-1 bg-white rounded-lg shadow">
            <div className="h-full flex flex-col">
              <div className="flex justify-end space-x-2 p-2">
                <button 
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-neutral-gray"
                  onClick={() => fetchData && fetchData()}
                >
                  Update
                </button>
                <button 
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-neutral-gray"
                  onClick={() => setSelectedCategory(null)}
                >
                  Show All
                </button>
              </div>
              <div className="flex-1 p-4">
                <GraphVisualization 
                  data={filteredData || { nodes: [], edges: [] }}
                  isLoading={isLoading}
                  onNodeSelect={handleNodeSelect}
                  onEdgeSelect={handleEdgeSelect}
                  onCytoscapeReady={setCytoscapeInstance}
                />
              </div>
            </div>
          </div>
          
          {/* Tabela de relacionamentos */}
          <div className="bg-white rounded-lg shadow p-4 mt-4">
            <div className="mb-2 flex justify-between items-center">
              <h2 className="text-lg font-medium text-neutral-gray">Relationships</h2>
              <div>
                <span className="text-xs text-gray-500">
                  Order A-Z
                </span>
              </div>
            </div>
            
            <div className="mb-4">
              <form onSubmit={handleSearch} className="flex">
                <input
                  type="text"
                  placeholder="Search"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-computing-purple"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-r-md hover:bg-gray-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </form>
            </div>
            
            {filteredData && filteredData.edges && filteredData.edges.length > 0 ? (
              <RelationshipTable 
                edges={filteredData.edges} 
                nodes={filteredData.nodes || []}
                onSelect={handleTableSelect}
              />
            ) : (
              <div className="p-4 text-center text-gray-500">
                No relationships found. Adjust your filters or add new relationships.
              </div>
            )}
            <div className="flex justify-end mt-4">
              <button 
                className="text-xs flex items-center text-gray-500 hover:text-neutral-gray"
                onClick={handleExportGraph}
                disabled={!hasData}
              >
                <ArrowDownTrayIcon className="h-3 w-3 inline mr-1" />
                Export to CSV
              </button>
            </div>
          </div>
        </div>
        
        {/* Painel lateral (1/4 da largura) */}
        {showSidebar && (
          <div className="col-span-1">
            {/* Barra de pesquisa */}
            <div className="bg-white rounded-lg shadow mb-4">
              <div className="p-4">
                <div className="relative mb-2">
                  <input
                    type="text"
                    placeholder="Search"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md pr-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                  />
                  <button 
                    className="absolute inset-y-0 right-0 px-3 flex items-center"
                    onClick={handleSearch}
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
                
                {/* Filtros por categoria - Conforme o wireframe */}
                <CategoryFilter 
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                />
              </div>
              
              {/* Seções colapsáveis para categorias */}
              {categories.map((category) => (
                <CollapsibleSection 
                  key={category.id} 
                  title={category.label}
                  isOpen={selectedCategory === category.id}
                >
                  {selectedNode && selectedNode.properties?.category?.toLowerCase() === category.id.toLowerCase() && (
                    <NodeDetails node={selectedNode} />
                  )}
                  {(!selectedNode || selectedNode.properties?.category?.toLowerCase() !== category.id.toLowerCase()) && (
                    <div className="text-sm text-gray-500">
                      Selecione um nó de {category.label} para ver seus detalhes
                    </div>
                  )}
                </CollapsibleSection>
              ))}
              
              <div className="text-xs text-gray-400 p-2 text-right">
                <p>Details of ICs (Nodes) are expandable for scalability</p>
              </div>
            </div>
            
            {/* Detalhes do nó selecionado */}
            {selectedNode && (
              <div className="bg-white rounded-lg shadow mb-4">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium">
                    {getNodeDisplayLabel(selectedNode)}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {selectedNode.properties?.description || 'No description'}
                  </p>
                </div>
                <NodeDetails node={selectedNode} />
              </div>
            )}
            
            {/* Relacionamentos do nó selecionado */}
            {selectedNode && selectedNode.id && (
              <NodeRelationships 
                nodeId={selectedNode.id} 
                onNodeSelect={handleNodeSelect}
              />
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default GraphPage; 