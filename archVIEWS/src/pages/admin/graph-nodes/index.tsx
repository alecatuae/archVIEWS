import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { Node } from '@/types/graph';
import Link from 'next/link';

export default function GraphNodes() {
  const router = useRouter();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [environment, setEnvironment] = useState<string>('all');
  const [nodeType, setNodeType] = useState<string>('all');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [environments, setEnvironments] = useState<string[]>([]);
  const [nodeTypes, setNodeTypes] = useState<string[]>([]);

  useEffect(() => {
    fetchNodes();
  }, [environment, nodeType]);

  const fetchNodes = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let url = '/api/neo4j/nodes?limit=100';
      if (environment !== 'all') {
        url += `&environment=${environment}`;
      }
      if (nodeType !== 'all') {
        url += `&type=${nodeType}`;
      }

      const response = await axios.get(url);
      setNodes(response.data);

      // Extract unique environments and types
      const envs = Array.from(new Set(response.data
        .map((node: Node) => node.properties.environment)
        .filter(Boolean)));
      setEnvironments(envs);

      const types = Array.from(new Set(response.data
        .map((node: Node) => node.properties.type)
        .filter(Boolean)));
      setNodeTypes(types);
    } catch (error: any) {
      console.error('Erro ao carregar nós:', error);
      setError(error.response?.data?.error || error.message || 'Erro ao carregar nós');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteNode = async (nodeId: string) => {
    try {
      await axios.delete(`/api/neo4j/nodes/${nodeId}`);
      setNodes(nodes.filter(node => node.id !== nodeId));
      setConfirmDelete(null);
    } catch (error: any) {
      console.error('Erro ao excluir nó:', error);
      alert(error.response?.data?.error || error.message || 'Erro ao excluir nó');
    }
  };

  const filteredNodes = nodes.filter(node => {
    const searchMatch = searchTerm === '' || 
      (node.properties.name && node.properties.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      node.labels.some(label => label.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (node.properties.type && node.properties.type.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (node.properties.category && node.properties.category.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return searchMatch;
  });

  return (
    <Layout>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-neutral-gray">Gerenciar Nós do Grafo</h1>
        <Link href="/admin/graph-nodes/new">
          <Button icon={<PlusIcon className="h-4 w-4" />}>
            Adicionar Nó
          </Button>
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md flex gap-2 items-start">
          <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Erro ao carregar nós</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-computing-purple focus:border-computing-purple sm:text-sm"
              placeholder="Buscar por nome, rótulo, tipo, categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-4">
            <div className="w-full md:w-44">
              <label htmlFor="environment" className="block text-sm font-medium text-gray-700 mb-1">Ambiente</label>
              <select
                id="environment"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-computing-purple focus:border-computing-purple sm:text-sm"
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
              >
                <option value="all">Todos</option>
                {environments.map((env) => (
                  <option key={env} value={env}>{env}</option>
                ))}
              </select>
            </div>
            
            <div className="w-full md:w-44">
              <label htmlFor="nodeType" className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select
                id="nodeType"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-computing-purple focus:border-computing-purple sm:text-sm"
                value={nodeType}
                onChange={(e) => setNodeType(e.target.value)}
              >
                <option value="all">Todos</option>
                {nodeTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end">
              <Button
                variant="outline"
                size="sm"
                icon={<AdjustmentsHorizontalIcon className="h-4 w-4" />}
                onClick={() => {
                  setEnvironment('all');
                  setNodeType('all');
                  setSearchTerm('');
                }}
              >
                Limpar
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-computing-purple"></div>
        </div>
      ) : filteredNodes.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-lg text-gray-600">Nenhum nó encontrado</p>
          <p className="text-sm text-gray-500 mt-2">
            {searchTerm || environment !== 'all' || nodeType !== 'all'
              ? 'Tente ajustar os filtros para encontrar o que procura'
              : 'Adicione um novo nó para começar'}
          </p>
          {searchTerm || environment !== 'all' || nodeType !== 'all' ? (
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              icon={<AdjustmentsHorizontalIcon className="h-4 w-4" />}
              onClick={() => {
                setEnvironment('all');
                setNodeType('all');
                setSearchTerm('');
              }}
            >
              Limpar Filtros
            </Button>
          ) : (
            <Link href="/admin/graph-nodes/new">
              <Button className="mt-4" icon={<PlusIcon className="h-4 w-4" />}>
                Adicionar Nó
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white overflow-x-auto rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rótulos
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ambiente
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredNodes.map((node) => (
                <tr key={node.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {node.properties.name || <span className="text-gray-400 italic">Sem nome</span>}
                    </div>
                    <div className="text-xs text-gray-500 font-mono">{node.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {node.labels.map(label => (
                        <span key={label} className="px-2 py-1 text-xs font-medium bg-neutral-100 text-neutral-700 rounded-full">
                          {label}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {node.properties.type || <span className="text-gray-400 italic">N/A</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {node.properties.category ? (
                        <span className="px-2 py-1 text-xs font-medium bg-neutral-100 text-neutral-700 rounded-full">
                          {node.properties.category}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">N/A</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {node.properties.environment || <span className="text-gray-400 italic">N/A</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex space-x-2">
                      <Link href={`/admin/graph-nodes/view/${node.id}`}>
                        <Button
                          size="xs"
                          variant="outline"
                          icon={<EyeIcon className="h-4 w-4" />}
                        >
                          Ver
                        </Button>
                      </Link>
                      <Link href={`/admin/graph-nodes/edit/${node.id}`}>
                        <Button
                          size="xs"
                          variant="outline"
                          icon={<PencilSquareIcon className="h-4 w-4" />}
                        >
                          Editar
                        </Button>
                      </Link>
                      {confirmDelete === node.id ? (
                        <div className="flex space-x-1">
                          <Button
                            size="xs"
                            variant="danger"
                            onClick={() => handleDeleteNode(node.id)}
                          >
                            Confirmar
                          </Button>
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => setConfirmDelete(null)}
                          >
                            Cancelar
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="xs"
                          variant="danger-outline"
                          icon={<TrashIcon className="h-4 w-4" />}
                          onClick={() => setConfirmDelete(node.id)}
                        >
                          Excluir
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
} 