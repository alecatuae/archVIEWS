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
import { Node } from '@/types/graph';
import Link from 'next/link';

export default function GraphNodesAdmin() {
  const router = useRouter();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>('all');

  useEffect(() => {
    fetchNodes();
  }, [selectedEnvironment]);

  const fetchNodes = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (selectedEnvironment !== 'all') {
        params.append('environment', selectedEnvironment);
      }
      params.append('limit', '100'); // Limitar para evitar sobrecarga

      const response = await axios.get(`/api/neo4j/nodes?${params.toString()}`);
      if (response.data && Array.isArray(response.data)) {
        setNodes(response.data);
      } else {
        throw new Error('Formato de resposta inválido');
      }
    } catch (error: any) {
      console.error('Erro ao buscar nós:', error);
      setError(error.response?.data?.error || error.message || 'Falha ao carregar nós');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteNode = async (nodeId: string, nodeName: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o nó "${nodeName || nodeId}"?`)) {
      return;
    }

    try {
      await axios.delete(`/api/neo4j/nodes/${nodeId}`);
      // Atualizar a lista após exclusão
      setNodes(nodes.filter(node => node.id !== nodeId));
    } catch (error: any) {
      console.error('Erro ao excluir nó:', error);
      alert(error.response?.data?.error || 'Erro ao excluir o nó');
    }
  };

  const renderEnvironmentFilter = () => {
    const environments = [
      { value: 'all', label: 'Todos' },
      { value: 'prod', label: 'Produção' },
      { value: 'stage', label: 'Staging' },
      { value: 'dev', label: 'Desenvolvimento' },
      { value: 'test', label: 'Teste' }
    ];

    return (
      <div className="mb-4">
        <label htmlFor="environment-filter" className="text-sm font-medium text-neutral-gray mr-2">
          Ambiente:
        </label>
        <select
          id="environment-filter"
          value={selectedEnvironment}
          onChange={(e) => setSelectedEnvironment(e.target.value)}
          className="rounded-md border border-gray-300 p-1 text-sm"
        >
          {environments.map(env => (
            <option key={env.value} value={env.value}>
              {env.label}
            </option>
          ))}
        </select>
      </div>
    );
  };

  const renderNodesTable = () => {
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
            <p className="font-medium">Erro ao carregar nós</p>
            <p>{error}</p>
          </div>
        </div>
      );
    }

    if (nodes.length === 0) {
      return (
        <div className="p-6 text-center">
          <p className="text-neutral-gray mb-4">Nenhum nó encontrado.</p>
          <Link href="/admin/graph-nodes/new">
            <Button icon={<PlusIcon className="h-5 w-5" />}>
              Criar Novo Nó
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
                  Nome
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Ambiente
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {nodes.map((node) => (
                <tr key={node.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    {node.id.substring(0, 8)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-neutral-900">
                      {node.properties.name || 'Sem nome'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-neutral-100 text-neutral-700 rounded-full">
                      {node.properties.category || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    {node.properties.environment || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    {node.properties.type || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link href={`/admin/graph-nodes/edit/${node.id}`}>
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
                        onClick={() => handleDeleteNode(node.id, node.properties.name || '')}
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
          <h1 className="text-2xl font-bold text-neutral-gray">Nós do Grafo</h1>
          <p className="text-neutral-gray">Gerenciar nós do banco de dados Neo4j</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            icon={<ArrowPathIcon className="h-4 w-4" />}
            onClick={fetchNodes}
          >
            Atualizar
          </Button>
          <Link href="/admin/graph-nodes/new">
            <Button
              icon={<PlusIcon className="h-5 w-5" />}
            >
              Novo Nó
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <div className="mb-4 flex justify-between items-center">
          {renderEnvironmentFilter()}
        </div>
        {renderNodesTable()}
      </Card>
    </Layout>
  );
} 