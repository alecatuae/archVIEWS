import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import { ArrowLeftIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import EdgeForm from '@/components/graph/EdgeForm';
import { Edge, EdgeProperties } from '@/types/graph';
import axios from 'axios';

export default function EditGraphEdge() {
  const router = useRouter();
  const { id } = router.query;
  const [edge, setEdge] = useState<Edge | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchEdgeData();
    }
  }, [id]);

  const fetchEdgeData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(`/api/neo4j/edges/${id}`);
      setEdge(response.data);
    } catch (error: any) {
      console.error('Erro ao carregar dados do relacionamento:', error);
      setError(error.response?.data?.error || error.message || 'Erro ao carregar dados do relacionamento');
      
      // Se o relacionamento não for encontrado, redirecionar para a lista
      if (error.response?.status === 404) {
        router.push('/admin/graph-edges');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (edgeData: { type: string, source: string, target: string, properties: EdgeProperties }) => {
    if (!id) return;
    
    setIsSubmitting(true);
    setError(null);

    try {
      // Para edição, enviamos apenas as propriedades, pois não podemos mudar fonte/destino/tipo
      await axios.put(`/api/neo4j/edges/${id}`, { properties: edgeData.properties });
      
      // Redirecionar para a lista após atualizar com sucesso
      router.push('/admin/graph-edges');
    } catch (error: any) {
      console.error('Erro ao atualizar relacionamento:', error);
      setError(error.response?.data?.error || error.message || 'Erro ao atualizar relacionamento');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-computing-purple"></div>
        </div>
      </Layout>
    );
  }

  if (error && !edge) {
    return (
      <Layout>
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-neutral-gray">Editar Relacionamento</h1>
          <Button 
            variant="outline" 
            size="sm" 
            icon={<ArrowLeftIcon className="h-4 w-4" />}
            onClick={() => router.push('/admin/graph-edges')}
          >
            Voltar
          </Button>
        </div>
        
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md flex gap-2 items-start">
          <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Erro ao carregar relacionamento</p>
            <p>{error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-neutral-gray">
          Editar Relacionamento: {edge?.type || `ID: ${id}`}
        </h1>
        <Button 
          variant="outline" 
          size="sm" 
          icon={<ArrowLeftIcon className="h-4 w-4" />}
          onClick={() => router.push('/admin/graph-edges')}
        >
          Voltar
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <EdgeForm 
        edge={edge}
        onSubmit={handleSubmit}
        onCancel={() => router.push('/admin/graph-edges')}
        isSubmitting={isSubmitting}
      />
    </Layout>
  );
} 