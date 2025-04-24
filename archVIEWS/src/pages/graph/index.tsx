import React, { useState, useCallback, useMemo } from 'react';
import { NextPage } from 'next';
import { Card } from '@/components/ui/card';
import { Node, Edge } from '@/types/graph';
import GraphAlternative from '@/components/graph/GraphAlternative';
import useGraphData from '@/hooks/useGraphData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Layout from '@/components/layout/Layout';
import graphUtils from '@/utils/graphUtils';

const GraphPage: NextPage = () => {
  // Estado do filtro e busca
  const [limit, setLimit] = useState<number>(50);
  const [environment, setEnvironment] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [nodeType, setNodeType] = useState<string>('all');
  const [edgeType, setEdgeType] = useState<string>('all');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  
  // Estado da seleção
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [detailsTab, setDetailsTab] = useState<string>('node');

  // Fetch graph data using the hook
  const { data, isLoading, error, refetch } = useGraphData({
    fetchOnLoad: true,
    limit,
    environment: environment === 'all' ? undefined : environment,
  });

  // Listas de tipos de nós e arestas para filtros
  const nodeTypes = useMemo(() => {
    if (!data?.nodes) return [];
    const types = new Set<string>();
    data.nodes.forEach(node => {
      if (node.labels && node.labels.length > 0) {
        types.add(node.labels[0]);
      }
    });
    return Array.from(types);
  }, [data?.nodes]);

  const edgeTypes = useMemo(() => {
    if (!data?.edges) return [];
    const types = new Set<string>();
    data.edges.forEach(edge => {
      if (edge.type) {
        types.add(edge.type);
      }
    });
    return Array.from(types);
  }, [data?.edges]);

  // Filtragem dos dados
  const filteredData = useMemo(() => {
    if (!data) return null;
    
    let filteredNodes = [...data.nodes];
    let filteredEdges = [...data.edges];
    
    // Aplicar filtro por tipo de nó
    if (nodeType !== 'all') {
      filteredNodes = filteredNodes.filter(node => 
        node.labels && node.labels.includes(nodeType)
      );
    }
    
    // Aplicar filtro por tipo de aresta
    if (edgeType !== 'all') {
      filteredEdges = filteredEdges.filter(edge => 
        edge.type === edgeType
      );
    }
    
    // Aplicar busca por termo
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      
      // Filtrar nós que correspondem ao termo de busca
      filteredNodes = filteredNodes.filter(node => {
        const nodeLabel = graphUtils.getNodeDisplayLabel(node).toLowerCase();
        const nodeId = node.id.toLowerCase();
        const nodeProps = Object.entries(node.properties || {}).some(
          ([key, value]) => 
            String(key).toLowerCase().includes(lowerSearchTerm) || 
            String(value).toLowerCase().includes(lowerSearchTerm)
        );
        
        return nodeLabel.includes(lowerSearchTerm) || 
               nodeId.includes(lowerSearchTerm) || 
               nodeProps;
      });
      
      // Filtrar arestas que correspondem ao termo de busca
      filteredEdges = filteredEdges.filter(edge => {
        const edgeType = edge.type.toLowerCase();
        const edgeId = edge.id.toLowerCase();
        const edgeProps = Object.entries(edge.properties || {}).some(
          ([key, value]) => 
            String(key).toLowerCase().includes(lowerSearchTerm) || 
            String(value).toLowerCase().includes(lowerSearchTerm)
        );
        
        return edgeType.includes(lowerSearchTerm) || 
               edgeId.includes(lowerSearchTerm) || 
               edgeProps;
      });
    }
    
    // Incluir apenas arestas que conectam nós filtrados
    const nodeIds = new Set(filteredNodes.map(n => n.id));
    filteredEdges = filteredEdges.filter(
      edge => nodeIds.has(edge.source) && nodeIds.has(edge.target)
    );
    
    return {
      nodes: filteredNodes,
      edges: filteredEdges
    };
  }, [data, nodeType, edgeType, searchTerm]);

  // Handle node selection
  const handleNodeSelect = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
    setDetailsTab('node');
    setSelectedEdgeId(null);
  }, []);

  // Handle edge selection
  const handleEdgeSelect = useCallback((edgeId: string) => {
    setSelectedEdgeId(edgeId);
    setDetailsTab('edge');
    setSelectedNodeId(null);
  }, []);

  // Exportar dados para JSON
  const handleExportJson = useCallback(() => {
    if (!filteredData) return;
    
    const dataStr = JSON.stringify(filteredData, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = `graph-export-${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [filteredData]);

  // Find the selected node from the data
  const selectedNode = useMemo(() => {
    if (!filteredData?.nodes || !selectedNodeId) return null;
    return filteredData.nodes.find(node => node.id === selectedNodeId) || null;
  }, [filteredData?.nodes, selectedNodeId]);

  // Find the selected edge from the data
  const selectedEdge = useMemo(() => {
    if (!filteredData?.edges || !selectedEdgeId) return null;
    return filteredData.edges.find(edge => edge.id === selectedEdgeId) || null;
  }, [filteredData?.edges, selectedEdgeId]);

  // Function to render node details
  const renderNodeDetails = (node: Node | null) => {
    if (!node) {
      return (
        <div className="p-4 text-center text-gray-500">
          Select a node to view details
        </div>
      );
    }

    const displayLabel = graphUtils.getNodeDisplayLabel(node);
    const sortedProperties = graphUtils.getSortedProperties(node.properties);

    return (
      <div className="p-4 space-y-4 relative">
        <div>
          <h3 className="font-medium text-lg text-gray-900">{displayLabel}</h3>
          <p className="text-sm text-gray-500">ID: {node.id}</p>
          <p className="text-sm text-gray-500">Type: {node.type || (node.labels && node.labels.length > 0 ? node.labels[0] : 'Unknown')}</p>
        </div>
        
        <div className="mt-4">
          <h4 className="font-medium text-gray-700">Properties</h4>
          {sortedProperties.length > 0 ? (
            <div className="mt-2 space-y-2">
              {sortedProperties.map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">{key}:</span>
                  <span className="text-sm text-gray-800">
                    {graphUtils.formatPropertyValue(value)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 mt-2">No properties</p>
          )}
        </div>
        
        {/* Mostrar conexões desse nó */}
        <div className="mt-6">
          <h4 className="font-medium text-gray-700">Connections</h4>
          {filteredData?.edges && filteredData.edges.some(
            e => e.source === node.id || e.target === node.id
          ) ? (
            <div className="mt-2 space-y-2">
              {filteredData.edges
                .filter(e => e.source === node.id || e.target === node.id)
                .map(edge => {
                  const isOutgoing = edge.source === node.id;
                  const connectedNodeId = isOutgoing ? edge.target : edge.source;
                  const connectedNode = filteredData.nodes.find(n => n.id === connectedNodeId);
                  
                  return (
                    <div 
                      key={edge.id}
                      className="p-2 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleNodeSelect(connectedNodeId)}
                    >
                      <div className="flex items-center text-sm">
                        <span className={`font-medium mr-2 ${isOutgoing ? 'text-green-600' : 'text-blue-600'}`}>
                          {isOutgoing ? 'Outgoing' : 'Incoming'}
                        </span>
                        <span className="text-gray-700">{edge.type}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {graphUtils.getNodeDisplayLabel(connectedNode || { id: connectedNodeId })}
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <p className="text-sm text-gray-500 mt-2">No connections</p>
          )}
        </div>
      </div>
    );
  };

  // Function to render edge details
  const renderEdgeDetails = (edge: Edge | null) => {
    if (!edge) {
      return (
        <div className="p-4 text-center text-gray-500">
          Select an edge to view details
        </div>
      );
    }

    const sortedProperties = graphUtils.getSortedProperties(edge.properties);
    const sourceNode = filteredData?.nodes.find(n => n.id === edge.source);
    const targetNode = filteredData?.nodes.find(n => n.id === edge.target);

    return (
      <div className="p-4 space-y-4">
        <div>
          <h3 className="font-medium text-lg text-gray-900">{edge.label || edge.type || 'Relationship'}</h3>
          <p className="text-sm text-gray-500">ID: {edge.id}</p>
          <p className="text-sm text-gray-500">Type: {edge.type}</p>
        </div>
        
        <div className="mt-4 grid grid-cols-1 gap-2">
          <div 
            className="p-2 bg-blue-50 rounded-lg border border-blue-200 cursor-pointer hover:bg-blue-100"
            onClick={() => sourceNode && handleNodeSelect(sourceNode.id)}
          >
            <div className="text-sm font-medium">Source:</div>
            <div className="font-medium truncate">{graphUtils.getNodeDisplayLabel(sourceNode || { id: edge.source })}</div>
          </div>
          
          <div 
            className="p-2 bg-green-50 rounded-lg border border-green-200 cursor-pointer hover:bg-green-100"
            onClick={() => targetNode && handleNodeSelect(targetNode.id)}
          >
            <div className="text-sm font-medium">Target:</div>
            <div className="font-medium truncate">{graphUtils.getNodeDisplayLabel(targetNode || { id: edge.target })}</div>
          </div>
        </div>
        
        <div className="mt-4">
          <h4 className="font-medium text-gray-700">Properties</h4>
          {sortedProperties.length > 0 ? (
            <div className="mt-2 space-y-2">
              {sortedProperties.map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">{key}:</span>
                  <span className="text-sm text-gray-800">
                    {graphUtils.formatPropertyValue(value)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 mt-2">No properties</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <Layout title="Knowledge Graph">
      <div className="container py-6">
        <div className="mb-6">
          <div className="flex items-end justify-between mb-2">
            <div>
              <h1 className="text-2xl font-bold mb-2">Knowledge Graph</h1>
              <p className="text-gray-600">Visualize and explore connected data</p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                title="Export Graph Data"
                onClick={handleExportJson}
                disabled={!filteredData || isLoading}
              >
                Export
              </Button>
              
              <Button 
                onClick={() => refetch()} 
                disabled={isLoading}
                size="sm"
              >
                {isLoading ? 'Loading...' : 'Refresh Data'}
              </Button>
            </div>
          </div>
          
          {/* Barra de busca e filtros */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="relative md:col-span-2">
              <Input
                type="search"
                placeholder="Search nodes and relationships..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2 md:justify-end">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                Filters
              </Button>
              
              <Select
                value={limit.toString()}
                onValueChange={(val) => setLimit(parseInt(val))}
              >
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="Limit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="200">200</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Filtros expandidos */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="environment" className="mb-1 block">Environment</Label>
                <Select
                  value={environment}
                  onValueChange={setEnvironment}
                >
                  <SelectTrigger id="environment">
                    <SelectValue placeholder="Environment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Environments</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="testing">Testing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="nodeType" className="mb-1 block">Node Type</Label>
                <Select
                  value={nodeType}
                  onValueChange={setNodeType}
                >
                  <SelectTrigger id="nodeType">
                    <SelectValue placeholder="Node Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Node Types</SelectItem>
                    {nodeTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="edgeType" className="mb-1 block">Relationship Type</Label>
                <Select
                  value={edgeType}
                  onValueChange={setEdgeType}
                >
                  <SelectTrigger id="edgeType">
                    <SelectValue placeholder="Relationship Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Relationship Types</SelectItem>
                    {edgeTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="h-[700px] overflow-hidden">
              {error ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-red-500 mb-2">Error loading graph data</p>
                    <Button variant="outline" onClick={() => refetch()}>
                      Try Again
                    </Button>
                  </div>
                </div>
              ) : (
                <GraphAlternative
                  data={filteredData}
                  isLoading={isLoading}
                  onNodeSelect={handleNodeSelect}
                  onEdgeSelect={handleEdgeSelect}
                  className="p-4"
                />
              )}
            </Card>
            
            <div className="mt-4 text-sm text-gray-500 flex justify-between items-center">
              {filteredData ? (
                <p>
                  Showing {filteredData.nodes.length} nodes and {filteredData.edges.length} relationships
                  {(data && (filteredData.nodes.length !== data.nodes.length || filteredData.edges.length !== data.edges.length)) && (
                    <span> (filtered from {data.nodes.length} nodes and {data.edges.length} relationships)</span>
                  )}
                </p>
              ) : isLoading ? (
                <Skeleton className="h-4 w-48" />
              ) : (
                <p>No data available</p>
              )}
            </div>
          </div>
          
          <div>
            <Card className="h-[700px] overflow-hidden">
              <Tabs value={detailsTab} onValueChange={setDetailsTab}>
                <div className="border-b px-4">
                  <TabsList className="my-2">
                    <TabsTrigger 
                      value="node" 
                      disabled={!selectedNodeId}
                      className="flex-1"
                    >
                      Node Details
                    </TabsTrigger>
                    <TabsTrigger 
                      value="edge" 
                      disabled={!selectedEdgeId}
                      className="flex-1"
                    >
                      Edge Details
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="node" className="mt-0 h-full overflow-auto">
                  {isLoading ? (
                    <div className="p-4 space-y-4">
                      <Skeleton className="h-8 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-2/3" />
                      <div className="pt-4 space-y-3">
                        <Skeleton className="h-6 w-1/3" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    </div>
                  ) : (
                    renderNodeDetails(selectedNode)
                  )}
                </TabsContent>
                
                <TabsContent value="edge" className="mt-0 h-full overflow-auto">
                  {isLoading ? (
                    <div className="p-4 space-y-4">
                      <Skeleton className="h-8 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-2/3" />
                      <div className="pt-4 space-y-3">
                        <Skeleton className="h-6 w-1/3" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    </div>
                  ) : (
                    renderEdgeDetails(selectedEdge)
                  )}
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default GraphPage; 