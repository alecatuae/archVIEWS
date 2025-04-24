import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import NodeForm from '@/components/graph/NodeForm';
import { NodeProperties } from '@/types/graph';
import axios from 'axios';

export default function NewGraphNode() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (nodeData: { labels: string[], properties: NodeProperties }) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await axios.post('/api/neo4j/nodes', nodeData);
      
      if (response.status === 201) {
        // Redirecionar para a lista após criar o nó com sucesso
        router.push('/admin/graph-nodes');
      } else {
        throw new Error('Resposta inesperada do servidor');
      }
    } catch (error: any) {
      console.error('Erro ao criar nó:', error);
      setError(error.response?.data?.error || error.message || 'Erro ao criar nó');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-neutral-gray">Novo Nó do Grafo</h1>
        <Button 
          variant="outline" 
          size="sm" 
          icon={<ArrowLeftIcon className="h-4 w-4" />}
          onClick={() => router.push('/admin/graph-nodes')}
        >
          Voltar
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <NodeForm 
        onSubmit={handleSubmit}
        onCancel={() => router.push('/admin/graph-nodes')}
        isSubmitting={isSubmitting}
      />
    </Layout>
  );
} 