import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { 
  PlusIcon, 
  PencilSquareIcon, 
  TrashIcon, 
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { Edge, Node } from '@/types/graph';
import Link from 'next/link';
import { relationshipColors } from '@/types/graph';

export default function GraphEdgesAdmin() {
  const router = useRouter();
  const [edges, setEdges] = useState<Edge[]>([]);
  const [nodes, setNodes] = useState<Record<string, Node>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    fetchEdges();
    fetchNodes();
  }, [selectedType]);

  const fetchEdges = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (selectedType !== 'all') {
        params.append('type', selectedType);
      }
      params.append('limit', '100'); // Limitar para evitar sobrecarga

      const response = await axios.get(`/api/neo4j/edges?${params.toString()}`);
      if (response.data && Array.isArray(response.data)) {
        setEdges(response.data);
      } else {
        throw new Error('Formato de resposta inválido');
      }
    } catch (error: any) {
      console.error('Erro ao buscar relacionamentos:', error);
      setError(error.response?.data?.error || error.message || 'Falha ao carregar relacionamentos');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNodes = async () => {
    try {
      const response = await axios.get('/api/neo4j/nodes?limit=1000');
      if (response.data && Array.isArray(response.data)) {
        // Converter array de nós para um objeto indexado pelo ID
        const nodesMap: Record<string, Node> = {};
        response.data.forEach((node: Node) => {
          nodesMap[node.id] = node;
        });
        setNodes(nodesMap);
      }
    } catch (error) {
      console.error('Erro ao buscar nós:', error);
    }
  };

  const handleDeleteEdge = async (edgeId: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir este relacionamento?`)) {
      return;
    }

    try {
      await axios.delete(`/api/neo4j/edges/${edgeId}`);
      // Atualizar a lista após exclusão
      setEdges(edges.filter(edge => edge.id !== edgeId));
    } catch (error: any) {
      console.error('Erro ao excluir relacionamento:', error);
      alert(error.response?.data?.error || 'Erro ao excluir relacionamento');
    }
  };

  const getNodeName = (nodeId: string): string => {
    return nodes[nodeId]?.properties?.name || `ID: ${nodeId.substring(0, 8)}`;
  };

  const getRelationshipColor = (type: string): string => {
    return relationshipColors[type.toUpperCase()] || relationshipColors.default;
  };

  const renderTypeFilter = () => {
    // Coletar todos os tipos de relacionamento únicos dos dados
    const uniqueTypes = new Set<string>();
    edges.forEach(edge => uniqueTypes.add(edge.type));
    
    const typeOptions = [
      { value: 'all', label: 'Todos' },
      ...Array.from(uniqueTypes).map(type => ({
        value: type,
        label: type
      }))
    ];

    return (
      <div className="mb-4">
        <label htmlFor="type-filter" className="text-sm font-medium text-neutral-gray mr-2">
          Tipo:
        </label>
        <select
          id="type-filter"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="rounded-md border border-gray-300 p-1 text-sm"
        >
          {typeOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  };

  const renderEdgesTable = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-computing-purple"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md flex gap-2 items-start">
          <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Erro ao carregar relacionamentos</p>
            <p>{error}</p>
          </div>
        </div>
      );
    }

    if (edges.length === 0) {
      return (
        <div className="p-6 text-center">
          <p className="text-neutral-gray mb-4">Nenhum relacionamento encontrado.</p>
          <Link href="/admin/graph-edges/new">
            <Button icon={<PlusIcon className="h-5 w-5" />}>
              Criar Novo Relacionamento
            </Button>
          </Link>
        </div>
      );
    }

    return (
      <>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  De
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Para
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Detalhes
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {edges.map((edge) => (
                <tr key={edge.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    {edge.id.substring(0, 8)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className="px-2 py-1 text-xs font-medium text-white rounded-full"
                      style={{ backgroundColor: getRelationshipColor(edge.type) }}
                    >
                      {edge.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    {getNodeName(edge.source)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    {getNodeName(edge.target)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    {edge.properties?.description ? (
                      <span title={edge.properties.description}>
                        {edge.properties.description.substring(0, 30)}
                        {edge.properties.description.length > 30 ? '...' : ''}
                      </span>
                    ) : (
                      <span className="text-gray-400">Sem descrição</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link href={`/admin/graph-edges/edit/${edge.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<PencilSquareIcon className="h-4 w-4" />}
                        >
                          Editar
                        </Button>
                      </Link>
                      <Button
                        variant="danger"
                        size="sm"
                        icon={<TrashIcon className="h-4 w-4" />}
                        onClick={() => handleDeleteEdge(edge.id)}
                      >
                        Excluir
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  };

  return (
    <Layout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-neutral-gray">Relacionamentos do Grafo</h1>
          <p className="text-neutral-gray">Gerenciar relacionamentos entre nós no banco Neo4j</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            icon={<ArrowPathIcon className="h-4 w-4" />}
            onClick={() => {
              fetchEdges();
              fetchNodes();
            }}
          >
            Atualizar
          </Button>
          <Link href="/admin/graph-edges/new">
            <Button
              icon={<PlusIcon className="h-5 w-5" />}
            >
              Novo Relacionamento
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <div className="mb-4 flex justify-between items-center">
          {edges.length > 0 && renderTypeFilter()}
        </div>
        {renderEdgesTable()}
      </Card>
    </Layout>
  );
} 