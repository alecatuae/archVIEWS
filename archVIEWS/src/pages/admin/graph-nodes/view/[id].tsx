import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { 
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Relationship {
  id: string;
  type: string;
  startNode: {
    id: string;
    labels: string[];
    properties: Record<string, any>;
  };
  endNode: {
    id: string;
    labels: string[];
    properties: Record<string, any>;
  };
  properties: Record<string, any>;
}

export default function ViewGraphNode() {
  const router = useRouter();
  const { id } = router.query;
  
  const [node, setNode] = useState<any>(null);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    if (id) {
      fetchNodeData();
    }
  }, [id]);
  
  const fetchNodeData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch node data
      const nodeResponse = await axios.get(`/api/neo4j/nodes/${id}`);
      setNode(nodeResponse.data);
      
      // Fetch relationships
      const relationshipsResponse = await axios.get(`/api/neo4j/nodes/${id}/relationships`);
      setRelationships(relationshipsResponse.data);
    } catch (error: any) {
      console.error('Erro ao carregar dados do nó:', error);
      setError(error.response?.data?.error || error.message || 'Erro ao carregar dados do nó');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDelete = async () => {
    if (!window.confirm('Tem certeza que deseja excluir este nó? Esta ação não pode ser desfeita.')) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      await axios.delete(`/api/neo4j/nodes/${id}`);
      router.push('/admin/graph-nodes');
    } catch (error: any) {
      console.error('Erro ao excluir nó:', error);
      setError(error.response?.data?.error || error.message || 'Erro ao excluir o nó');
      setIsDeleting(false);
    }
  };
  
  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }
  
  if (error) {
    return (
      <Layout>
        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/admin/graph-nodes">
              <Button variant="outline" size="sm" icon={<ArrowLeftIcon className="h-4 w-4" />}>
                Voltar
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-neutral-gray">Nó não encontrado</h1>
          </div>
        </div>
        
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md flex gap-2 items-start">
          <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Erro ao carregar nó</p>
            <p>{error}</p>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (!node) {
    return (
      <Layout>
        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/admin/graph-nodes">
              <Button variant="outline" size="sm" icon={<ArrowLeftIcon className="h-4 w-4" />}>
                Voltar
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-neutral-gray">Nó não encontrado</h1>
          </div>
        </div>
        
        <div className="p-4 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-md">
          <p>O nó solicitado não foi encontrado.</p>
        </div>
      </Layout>
    );
  }
  
  // Get primary properties for display
  const name = node.properties.name || 'Sem nome';
  const description = node.properties.description || 'Sem descrição';
  const environment = node.properties.environment || 'Não especificado';
  
  return (
    <Layout>
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/admin/graph-nodes">
            <Button variant="outline" size="sm" icon={<ArrowLeftIcon className="h-4 w-4" />}>
              Voltar
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-neutral-gray">
            {name}
          </h1>
        </div>
        
        <div className="flex gap-2">
          <Link href={`/admin/graph-nodes/edit/${id}`}>
            <Button 
              variant="outline" 
              size="sm" 
              icon={<PencilSquareIcon className="h-4 w-4" />}
            >
              Editar
            </Button>
          </Link>
          <Button 
            variant="danger-outline" 
            size="sm" 
            icon={<TrashIcon className="h-4 w-4" />}
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Excluindo...' : 'Excluir'}
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Node Details */}
        <div className="lg:col-span-2">
          <Card>
            <div className="mb-4">
              <h2 className="text-lg font-medium text-gray-900 mb-2">Informações Básicas</h2>
              <p className="text-gray-500">{description}</p>
            </div>
            
            <div className="mb-6">
              <div className="flex flex-wrap gap-2 mt-2 mb-4">
                {node.labels.map((label: string) => (
                  <span 
                    key={label} 
                    className="bg-computing-purple text-white px-3 py-1 text-sm rounded-full"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-md font-medium text-gray-900 mb-4">Propriedades</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(node.properties).map(([key, value]: [string, any]) => (
                  <div key={key} className="border-b border-gray-100 pb-2">
                    <div className="text-sm font-medium text-gray-500">{key}</div>
                    <div className="text-gray-900">{value?.toString() || '-'}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
        
        {/* Relationships Panel */}
        <div className="lg:col-span-1">
          <Card>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Relacionamentos</h2>
            
            {relationships.length === 0 ? (
              <div className="text-gray-500 italic">
                Este nó não possui relacionamentos.
              </div>
            ) : (
              <div className="space-y-4">
                {relationships.map((rel) => {
                  const isOutgoing = rel.startNode.id === id;
                  const otherNode = isOutgoing ? rel.endNode : rel.startNode;
                  const direction = isOutgoing ? 'para' : 'de';
                  
                  return (
                    <div key={rel.id} className="border-b border-gray-100 pb-4 last:border-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-700">
                          {isOutgoing ? '→' : '←'} {rel.type}
                        </span>
                        {Object.keys(rel.properties).length > 0 && (
                          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                            {Object.keys(rel.properties).length} props
                          </span>
                        )}
                      </div>
                      
                      <div className="pl-4 border-l-2 border-gray-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{otherNode.properties.name || 'Sem nome'}</div>
                            <div className="text-xs text-gray-500">
                              {otherNode.labels.join(', ')}
                            </div>
                          </div>
                          <Link href={`/admin/graph-nodes/view/${otherNode.id}`}>
                            <Button 
                              size="xs" 
                              variant="outline" 
                              icon={<ArrowTopRightOnSquareIcon className="h-3 w-3" />}
                            >
                              Ver
                            </Button>
                          </Link>
                        </div>
                        
                        {Object.keys(rel.properties).length > 0 && (
                          <div className="mt-2 text-sm">
                            <div className="font-medium text-gray-600">Propriedades:</div>
                            <div className="pl-2">
                              {Object.entries(rel.properties).map(([key, value]: [string, any]) => (
                                <div key={key} className="text-gray-600">
                                  <span className="font-medium">{key}:</span> {value?.toString()}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <Link href={`/graph?focus=${id}`}>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  icon={<ArrowTopRightOnSquareIcon className="h-4 w-4" />}
                >
                  Ver no Grafo
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
} 