import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import EdgeForm from '@/components/graph/EdgeForm';
import { EdgeProperties } from '@/types/graph';
import axios from 'axios';

export default function NewGraphEdge() {
  const router = useRouter();
  // Pegar os IDs dos nós da query string, se existirem (para criar relacionamento direto entre dois nós)
  const { source, target } = router.query;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (edgeData: { type: string, source: string, target: string, properties: EdgeProperties }) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await axios.post('/api/neo4j/edges', edgeData);
      
      if (response.status === 201) {
        // Redirecionar para a lista após criar o relacionamento com sucesso
        router.push('/admin/graph-edges');
      } else {
        throw new Error('Resposta inesperada do servidor');
      }
    } catch (error: any) {
      console.error('Erro ao criar relacionamento:', error);
      setError(error.response?.data?.error || error.message || 'Erro ao criar relacionamento');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-neutral-gray">Novo Relacionamento</h1>
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
        onSubmit={handleSubmit}
        onCancel={() => router.push('/admin/graph-edges')}
        isSubmitting={isSubmitting}
        sourceNodeId={source as string}
        targetNodeId={target as string}
      />
    </Layout>
  );
} 