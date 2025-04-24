import React, { useState, useEffect } from 'react';
import { Node, Edge } from '@/types/graph';
import { relationshipColors } from '@/types/graph';
import axios from 'axios';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { 
  PlusIcon, 
  ArrowRightIcon, 
  ArrowLeftIcon,
  PencilSquareIcon, 
  TrashIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface NodeRelationshipsProps {
  nodeId: string;
  onNodeSelect?: (node: Node) => void;
}

const NodeRelationships: React.FC<NodeRelationshipsProps> = ({ 
  nodeId,
  onNodeSelect 
}) => {
  const [relationships, setRelationships] = useState<{
    inbound: { edge: Edge; node: Node }[];
    outbound: { edge: Edge; node: Node }[];
  }>({
    inbound: [],
    outbound: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (nodeId) {
      fetchRelationships();
    }
  }, [nodeId]);

  const fetchRelationships = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(`/api/neo4j/nodes/${nodeId}/relationships`);
      if (response.data && response.data.inbound && response.data.outbound) {
        setRelationships(response.data);
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

  const handleDeleteRelationship = async (edgeId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este relacionamento?')) {
      return;
    }

    try {
      await axios.delete(`/api/neo4j/edges/${edgeId}`);
      // Atualizar a lista após exclusão
      fetchRelationships();
    } catch (error: any) {
      console.error('Erro ao excluir relacionamento:', error);
      alert(error.response?.data?.error || 'Erro ao excluir relacionamento');
    }
  };

  const handleNodeClick = (node: Node) => {
    if (onNodeSelect) {
      onNodeSelect(node);
    }
  };

  const getRelationshipColor = (type: string): string => {
    return relationshipColors[type.toUpperCase()] || relationshipColors.default;
  };

  if (isLoading) {
    return (
      <Card>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-computing-purple"></div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="p-4 text-red-700">
          <p className="font-medium">Erro ao carregar relacionamentos</p>
          <p className="text-sm">{error}</p>
        </div>
      </Card>
    );
  }

  const hasRelationships = relationships.inbound.length > 0 || relationships.outbound.length > 0;

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-neutral-gray">Relacionamentos</h3>
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            size="sm"
            icon={<ArrowPathIcon className="h-4 w-4" />}
            onClick={fetchRelationships}
          >
            Atualizar
          </Button>
          <Link href={`/admin/graph-edges/new?source=${nodeId}`}>
            <Button 
              size="sm"
              icon={<PlusIcon className="h-4 w-4" />}
            >
              Adicionar
            </Button>
          </Link>
        </div>
      </div>

      {!hasRelationships ? (
        <div className="p-4 text-center bg-gray-50 rounded-md">
          <p className="text-gray-500">Nenhum relacionamento encontrado para este nó.</p>
          <Link href={`/admin/graph-edges/new?source=${nodeId}`}>
            <Button
              className="mt-2"
              size="sm"
              variant="outline"
              icon={<PlusIcon className="h-4 w-4" />}
            >
              Adicionar Relacionamento
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Relacionamentos de saída */}
          {relationships.outbound.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-neutral-gray mb-2 border-b pb-1">
                Relacionamentos de Saída ({relationships.outbound.length})
              </h4>
              <ul className="space-y-2">
                {relationships.outbound.map(({ edge, node }) => (
                  <li key={edge.id} className="p-3 bg-white border rounded-md hover:bg-neutral-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <span className="text-sm font-medium">Este nó</span>
                          <ArrowRightIcon className="h-4 w-4 mx-2 text-gray-400" />
                          <button 
                            className="text-sm font-medium text-computing-purple hover:underline"
                            onClick={() => handleNodeClick(node)}
                          >
                            {node.properties.name || `ID: ${node.id.substring(0, 8)}`}
                          </button>
                        </div>
                        <div className="mt-1 flex items-center">
                          <span 
                            className="px-2 py-0.5 text-xs font-medium text-white rounded-full"
                            style={{ backgroundColor: getRelationshipColor(edge.type) }}
                          >
                            {edge.type}
                          </span>
                          {edge.properties.description && (
                            <span className="ml-2 text-xs text-gray-500">
                              {edge.properties.description.length > 50
                                ? `${edge.properties.description.substring(0, 50)}...`
                                : edge.properties.description}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Link href={`/admin/graph-edges/edit/${edge.id}`}>
                          <Button
                            size="xs"
                            variant="outline"
                            icon={<PencilSquareIcon className="h-3 w-3" />}
                          />
                        </Link>
                        <Button
                          size="xs"
                          variant="danger"
                          icon={<TrashIcon className="h-3 w-3" />}
                          onClick={() => handleDeleteRelationship(edge.id)}
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Relacionamentos de entrada */}
          {relationships.inbound.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-neutral-gray mb-2 border-b pb-1">
                Relacionamentos de Entrada ({relationships.inbound.length})
              </h4>
              <ul className="space-y-2">
                {relationships.inbound.map(({ edge, node }) => (
                  <li key={edge.id} className="p-3 bg-white border rounded-md hover:bg-neutral-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <button 
                            className="text-sm font-medium text-computing-purple hover:underline"
                            onClick={() => handleNodeClick(node)}
                          >
                            {node.properties.name || `ID: ${node.id.substring(0, 8)}`}
                          </button>
                          <ArrowRightIcon className="h-4 w-4 mx-2 text-gray-400" />
                          <span className="text-sm font-medium">Este nó</span>
                        </div>
                        <div className="mt-1 flex items-center">
                          <span 
                            className="px-2 py-0.5 text-xs font-medium text-white rounded-full"
                            style={{ backgroundColor: getRelationshipColor(edge.type) }}
                          >
                            {edge.type}
                          </span>
                          {edge.properties.description && (
                            <span className="ml-2 text-xs text-gray-500">
                              {edge.properties.description.length > 50
                                ? `${edge.properties.description.substring(0, 50)}...`
                                : edge.properties.description}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Link href={`/admin/graph-edges/edit/${edge.id}`}>
                          <Button
                            size="xs"
                            variant="outline"
                            icon={<PencilSquareIcon className="h-3 w-3" />}
                          />
                        </Link>
                        <Button
                          size="xs"
                          variant="danger"
                          icon={<TrashIcon className="h-3 w-3" />}
                          onClick={() => handleDeleteRelationship(edge.id)}
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default NodeRelationships; 