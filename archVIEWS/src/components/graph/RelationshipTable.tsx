import React, { useState } from 'react';
import { Edge, Node } from '@/types/graph';
import { formatNodeLabel, formatEdgeLabel } from '@/utils/graphUtils';

interface RelationshipTableProps {
  edges: Edge[];
  nodes: Node[];
  onEdgeSelect?: (edge: Edge) => void;
  onNodeSelect?: (node: Node) => void;
}

// Options for pagination
const ITEMS_PER_PAGE_OPTIONS = [20, 50, 100];

const RelationshipTable: React.FC<RelationshipTableProps> = ({
  edges,
  nodes,
  onEdgeSelect,
  onNodeSelect
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE_OPTIONS[0]);
  const [sortField, setSortField] = useState<string>('source');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Get node by ID
  const getNodeById = (id: string): Node | undefined => {
    return nodes.find(node => node.id === id);
  };

  // Format node label for display
  const getNodeLabel = (nodeId: string): string => {
    const node = getNodeById(nodeId);
    if (!node) return `Node (${nodeId})`;
    return node.properties.name?.toString() || `Node (${nodeId})`;
  };

  // Handle search
  const filteredEdges = edges.filter(edge => {
    if (!searchTerm) return true;
    
    const sourceNode = getNodeById(edge.source);
    const targetNode = getNodeById(edge.target);
    const sourceName = sourceNode?.properties.name || '';
    const targetName = targetNode?.properties.name || '';
    
    const searchTermLower = searchTerm.toLowerCase();
    
    return edge.type.toLowerCase().includes(searchTermLower) ||
      sourceName.toString().toLowerCase().includes(searchTermLower) ||
      targetName.toString().toLowerCase().includes(searchTermLower) ||
      (edge.properties.description && edge.properties.description.toString().toLowerCase().includes(searchTermLower));
  });

  // Handle sorting
  const sortedEdges = [...filteredEdges].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortField) {
      case 'source':
        aValue = getNodeLabel(a.source).toLowerCase();
        bValue = getNodeLabel(b.source).toLowerCase();
        break;
      case 'target':
        aValue = getNodeLabel(a.target).toLowerCase();
        bValue = getNodeLabel(b.target).toLowerCase();
        break;
      case 'type':
        aValue = a.type.toLowerCase();
        bValue = b.type.toLowerCase();
        break;
      default:
        aValue = a.source;
        bValue = b.source;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Handle pagination
  const totalPages = Math.ceil(sortedEdges.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedEdges.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleEdgeClick = (edge: Edge) => {
    if (onEdgeSelect) {
      onEdgeSelect(edge);
    }
  };

  const handleNodeClick = (nodeId: string) => {
    const node = getNodeById(nodeId);
    if (node && onNodeSelect) {
      onNodeSelect(node);
    }
  };

  const renderSortIcon = (field: string) => {
    if (field !== sortField) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }

    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 text-neutral-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-neutral-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0">
        <div className="relative">
          <input
            type="text"
            className="py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-computing-purple focus:border-transparent"
            placeholder="Pesquisar relacionamentos..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
          <div className="absolute left-3 top-2.5">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-neutral-gray">Itens por página:</span>
          <select
            className="border border-gray-300 rounded-lg py-1 px-2 focus:outline-none focus:ring-2 focus:ring-computing-purple focus:border-transparent"
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
          >
            {ITEMS_PER_PAGE_OPTIONS.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-bg-gray border-b border-neutral-gray/20">
              <th 
                className="py-3 px-4 text-left text-sm font-medium cursor-pointer"
                onClick={() => handleSort('source')}
              >
                <div className="flex items-center space-x-1">
                  <span>Origem</span>
                  {renderSortIcon('source')}
                </div>
              </th>
              <th 
                className="py-3 px-4 text-left text-sm font-medium cursor-pointer"
                onClick={() => handleSort('type')}
              >
                <div className="flex items-center space-x-1">
                  <span>Tipo de Relacionamento</span>
                  {renderSortIcon('type')}
                </div>
              </th>
              <th 
                className="py-3 px-4 text-left text-sm font-medium cursor-pointer"
                onClick={() => handleSort('target')}
              >
                <div className="flex items-center space-x-1">
                  <span>Destino</span>
                  {renderSortIcon('target')}
                </div>
              </th>
              <th className="py-3 px-4 text-left text-sm font-medium">
                <span>Propriedades</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map(edge => (
                <tr 
                  key={edge.id}
                  className="border-b border-neutral-gray/10 hover:bg-bg-gray/30 cursor-pointer"
                >
                  <td 
                    className="py-3 px-4"
                    onClick={() => handleNodeClick(edge.source)}
                  >
                    <div className="font-medium text-computing-purple hover:underline">
                      {getNodeLabel(edge.source)}
                    </div>
                    <div className="text-xs text-neutral-gray">
                      {edge.source}
                    </div>
                  </td>
                  <td 
                    className="py-3 px-4"
                    onClick={() => handleEdgeClick(edge)}
                  >
                    <div className="inline-block px-2 py-1 bg-bg-gray rounded-full text-sm font-medium">
                      {edge.type}
                    </div>
                  </td>
                  <td 
                    className="py-3 px-4"
                    onClick={() => handleNodeClick(edge.target)}
                  >
                    <div className="font-medium text-computing-purple hover:underline">
                      {getNodeLabel(edge.target)}
                    </div>
                    <div className="text-xs text-neutral-gray">
                      {edge.target}
                    </div>
                  </td>
                  <td 
                    className="py-3 px-4"
                    onClick={() => handleEdgeClick(edge)}
                  >
                    {Object.entries(edge.properties).length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(edge.properties).slice(0, 3).map(([key, value]) => (
                          <div key={key} className="text-xs px-2 py-1 bg-bg-gray rounded-md">
                            <span className="font-medium">{key}:</span> {String(value).substring(0, 20)}
                            {String(value).length > 20 && '...'}
                          </div>
                        ))}
                        {Object.entries(edge.properties).length > 3 && (
                          <div className="text-xs px-2 py-1 bg-bg-gray rounded-md">
                            + {Object.entries(edge.properties).length - 3} mais
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-neutral-gray text-sm">Sem propriedades</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-4 px-4 text-center text-neutral-gray">
                  {searchTerm 
                    ? 'Nenhum relacionamento encontrado para sua pesquisa.' 
                    : 'Nenhum relacionamento disponível.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 flex justify-between items-center border-t border-neutral-gray/10">
          <div className="text-sm text-neutral-gray">
            Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredEdges.length)} de {filteredEdges.length} relacionamentos
          </div>
          <div className="flex space-x-1">
            <button
              className={`px-3 py-1 rounded ${
                currentPage === 1
                  ? 'text-neutral-gray/50 cursor-not-allowed'
                  : 'text-neutral-gray hover:bg-computing-purple hover:text-white'
              }`}
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
            >
              Primeira
            </button>
            <button
              className={`px-3 py-1 rounded ${
                currentPage === 1
                  ? 'text-neutral-gray/50 cursor-not-allowed'
                  : 'text-neutral-gray hover:bg-computing-purple hover:text-white'
              }`}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Anterior
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Determine which page numbers to show
              let pageNum = i + 1;
              if (currentPage > 3) {
                pageNum = currentPage - 2 + i;
              }
              if (pageNum > totalPages) return null;
              
              return (
                <button
                  key={pageNum}
                  className={`px-3 py-1 rounded ${
                    currentPage === pageNum
                      ? 'bg-computing-purple text-white'
                      : 'text-neutral-gray hover:bg-computing-purple hover:text-white'
                  }`}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              className={`px-3 py-1 rounded ${
                currentPage === totalPages
                  ? 'text-neutral-gray/50 cursor-not-allowed'
                  : 'text-neutral-gray hover:bg-computing-purple hover:text-white'
              }`}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Próxima
            </button>
            <button
              className={`px-3 py-1 rounded ${
                currentPage === totalPages
                  ? 'text-neutral-gray/50 cursor-not-allowed'
                  : 'text-neutral-gray hover:bg-computing-purple hover:text-white'
              }`}
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
            >
              Última
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RelationshipTable; 