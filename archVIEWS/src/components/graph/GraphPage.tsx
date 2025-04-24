import React, { useState, useEffect, useCallback } from 'react';
import { GraphData, Node, Edge } from '@/types/graph';
import GraphVisualization from '@/components/graph/GraphVisualization';
import GraphAlternative from '@/components/graph/GraphAlternative';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import Layout from '@/components/layout/Layout';
import useGraphData from '@/hooks/useGraphData';
import NodeRelationships from '@/components/graph/NodeRelationships';
import { getNodeDisplayLabel } from '@/utils/graphUtils';

// Componente do painel de detalhes
const NodeDetails: React.FC<{ node: Node; environment?: string }> = ({ node, environment }) => {
  if (!node) return null;
  
  const nodeDetails = [
    { label: "owner", value: "Network Team" },
    { label: "environment", value: environment || "Production" },
    { label: "description", value: node.properties.description || "Border Firewall" },
    { label: "type", value: node.properties.category || "Firewall" },
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

// Componente da barra de pesquisa
const SearchBar: React.FC<{ onSearch: (term: string) => void }> = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };
  
  return (
    <form onSubmit={handleSearch} className="mb-4">
      <div className="relative">
        <input
          type="text"
          placeholder="Search"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          type="submit"
          className="absolute inset-y-0 right-0 px-3 flex items-center"
        >
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>
    </form>
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
  
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">IC Origin</th>
            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Relationship</th>
            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">IC Destination</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {edges.map((edge) => (
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

// Componente do filtro por categoria
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
      <div className="space-y-2">
        {categories.map((category) => (
          <div
            key={category.id}
            className={`p-2 cursor-pointer rounded ${
              selectedCategory === category.id ? 'bg-neutral-gray text-white' : 'bg-gray-100 hover:bg-gray-200 text-neutral-gray'
            }`}
            onClick={() => onSelectCategory(category.id === selectedCategory ? null : category.id)}
          >
            {category.label}
          </div>
        ))}
      </div>
    </div>
  );
};

const GraphPage: React.FC = () => {
  const { data, isLoading, error } = useGraphData({ initialLoad: true });
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [cytoscapeInstance, setCytoscapeInstance] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filteredData, setFilteredData] = useState<GraphData>({ nodes: [], edges: [] });
  const [showSidebar, setShowSidebar] = useState(true);
  
  // Categorias para filtro
  const categories = [
    { id: 'server', label: 'Server' },
    { id: 'firewall', label: 'Firewall' },
    { id: 'storage', label: 'Storage' },
    { id: 'internet', label: 'Internet' }
  ];
  
  // Efeito para atualizar dados filtrados quando os dados originais ou categorias selecionadas mudam
  useEffect(() => {
    if (!data) return;

    if (!selectedCategory) {
      setFilteredData(data);
      return;
    }

    // Filtrar por categoria selecionada
    const filteredNodes = data.nodes.filter(node => 
      (node.properties.category || '').toLowerCase() === selectedCategory.toLowerCase()
    );
    
    const filteredNodeIds = new Set(filteredNodes.map(node => node.id));
    
    // Manter apenas as arestas que conectam os nós filtrados
    const filteredEdges = data.edges.filter(edge => 
      filteredNodeIds.has(edge.source) && filteredNodeIds.has(edge.target)
    );
    
    setFilteredData({
      nodes: filteredNodes,
      edges: filteredEdges
    });
  }, [data, selectedCategory]);

  // Manipuladores de seleção
  const handleNodeSelect = useCallback((node: Node | null) => {
    setSelectedNode(node);
    setSelectedEdge(null);
  }, []);

  const handleEdgeSelect = useCallback((edge: Edge | null) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
  }, []);

  // Manipulador para seleção na tabela
  const handleTableSelect = useCallback((type: 'node' | 'edge', id: string) => {
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
  }, [filteredData]);

  // Manipulador para exportar como PNG
  const handleExportGraph = useCallback(() => {
    if (!cytoscapeInstance) return;
    
    try {
      cytoscapeInstance.fit();
      
      setTimeout(() => {
        const png = cytoscapeInstance.png({
          output: 'blob',
          scale: 2,
          bg: '#ffffff',
          full: true
        });
        
        const url = URL.createObjectURL(png);
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = `graph-export-${new Date().toISOString().split('T')[0]}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        setTimeout(() => URL.revokeObjectURL(url), 100);
      }, 300);
    } catch (error) {
      console.error('Error exporting graph as image:', error);
      alert('Failed to export graph. Please try again later.');
    }
  }, [cytoscapeInstance]);

  return (
    <Layout title="Graph Visualization">
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
                disabled={!cytoscapeInstance || filteredData.nodes.length === 0}
                className={`
                  px-3 py-1 rounded flex items-center text-sm
                  ${(!cytoscapeInstance || filteredData.nodes.length === 0) 
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
                <button className="px-2 py-1 text-xs bg-gray-100 rounded">Update</button>
                <button className="px-2 py-1 text-xs bg-gray-100 rounded">Show All</button>
              </div>
              <div className="flex-1 p-4">
                <GraphVisualization 
                  data={filteredData}
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
                <button className="text-xs text-gray-500">Order A-Z</button>
              </div>
            </div>
            <RelationshipTable 
              edges={filteredData.edges} 
              nodes={filteredData.nodes}
              onSelect={handleTableSelect}
            />
            <div className="flex justify-end mt-2">
              <button className="text-xs text-gray-500">
                <ArrowDownTrayIcon className="h-3 w-3 inline mr-1" />
                Export
              </button>
            </div>
          </div>
        </div>
        
        {/* Painel lateral (1/4 da largura) */}
        {showSidebar && (
          <div className="col-span-1">
            {/* Barra de pesquisa */}
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <SearchBar onSearch={console.log} />
              
              {/* Filtros por categoria */}
              <CategoryFilter 
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
            </div>
            
            {/* Detalhes do nó selecionado */}
            {selectedNode && (
              <div className="bg-white rounded-lg shadow mb-4">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium">
                    {getNodeDisplayLabel(selectedNode)}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {selectedNode.properties.description || 'No description'}
                  </p>
                </div>
                <NodeDetails node={selectedNode} />
              </div>
            )}
            
            {/* Relacionamentos do nó selecionado */}
            {selectedNode && (
              <NodeRelationships 
                nodeId={selectedNode.id} 
                onNodeSelect={(node) => handleNodeSelect(node)}
              />
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default GraphPage; 