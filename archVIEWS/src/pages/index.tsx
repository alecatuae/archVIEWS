import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import GraphVisualization from '@/components/graph/GraphVisualization';
import GraphSidebar from '@/components/graph/GraphSidebar';
import RelationshipTable from '@/components/graph/RelationshipTable';
import useGraphData from '@/hooks/useGraphData';
import { Node, Edge } from '@/types/graph';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Home() {
  const router = useRouter();
  const environment = (router.query.env as string) || 'all';
  
  const { data, isLoading, error, fetchData } = useGraphData({
    environment,
    limit: 100,
    initialLoad: true
  });
  
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);

  // Refetch data when environment changes
  useEffect(() => {
    if (router.isReady) {
      fetchData({ environment });
    }
  }, [environment, router.isReady]);

  const handleNodeSelect = (node: Node | null) => {
    setSelectedNode(node);
    setSelectedEdge(null);
  };

  const handleEdgeSelect = (edge: Edge | null) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
  };

  const clearSelection = () => {
    setSelectedNode(null);
    setSelectedEdge(null);
  };

  return (
    <>
      <Head>
        <title>archView - Visualização de Arquitetura</title>
        <meta name="description" content="Visualização gráfica de componentes de arquitetura e suas interdependências" />
      </Head>
      
      <Layout>
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-neutral-gray">Visualização de Arquitetura</h1>
          {environment !== 'all' && (
            <p className="text-neutral-gray">Filtrando por ambiente: <span className="font-semibold">{environment}</span></p>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
            <p className="font-medium">Erro ao carregar dados:</p>
            <p>{error}</p>
          </div>
        )}
        
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          <div className="lg:w-8/12">
            <GraphVisualization 
              data={data}
              isLoading={isLoading}
              onNodeSelect={handleNodeSelect}
              onEdgeSelect={handleEdgeSelect}
            />
          </div>
          <div className="lg:w-4/12">
            <GraphSidebar 
              selectedNode={selectedNode}
              selectedEdge={selectedEdge}
              graphStats={{
                nodeCount: data.nodes.length,
                edgeCount: data.edges.length
              }}
              onClose={clearSelection}
            />
          </div>
        </div>
        
        <div className="mt-8">
          <h2 className="text-xl font-bold text-neutral-gray mb-4">Tabela de Relacionamentos</h2>
          <RelationshipTable 
            edges={data.edges} 
            nodes={data.nodes}
            onEdgeSelect={handleEdgeSelect}
            onNodeSelect={handleNodeSelect}
          />
        </div>
      </Layout>
    </>
  );
} 