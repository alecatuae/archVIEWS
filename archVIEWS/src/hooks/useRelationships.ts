import { useState, useEffect } from 'react';
import axios from 'axios';

interface Relationship {
  id: number;
  type: string;
  properties: Record<string, any>;
  source: {
    id: number;
    labels: string[];
    [key: string]: any;
  };
  target: {
    id: number;
    labels: string[];
    [key: string]: any;
  };
}

interface RelationshipsResponse {
  relationships: Relationship[];
  pagination: {
    total: number;
    limit: number;
    skip: number;
    hasMore: boolean;
  };
}

interface UseRelationshipsProps {
  type: string;
  limit?: number;
  skip?: number;
  environment?: string;
  enabled?: boolean;
}

interface UseRelationshipsResult {
  relationships: Relationship[];
  loading: boolean;
  error: Error | null;
  pagination: {
    total: number;
    limit: number;
    skip: number;
    hasMore: boolean;
  } | null;
  refetch: () => Promise<void>;
}

export function useRelationships({
  type,
  limit = 100,
  skip = 0,
  environment,
  enabled = true,
}: UseRelationshipsProps): UseRelationshipsResult {
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [pagination, setPagination] = useState<UseRelationshipsResult['pagination']>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchRelationships = async () => {
    if (!type) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (limit) params.append('limit', limit.toString());
      if (skip) params.append('skip', skip.toString());
      if (environment) params.append('environment', environment);
      
      const response = await axios.get<RelationshipsResponse>(
        `/api/neo4j/relationships/${encodeURIComponent(type)}?${params.toString()}`
      );
      
      setRelationships(response.data.relationships);
      setPagination(response.data.pagination);
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(err.message || 'Erro ao buscar relacionamentos'));
      console.error('Erro ao buscar relacionamentos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (enabled) {
      fetchRelationships();
    }
  }, [type, limit, skip, environment, enabled]);

  return {
    relationships,
    loading,
    error,
    pagination,
    refetch: fetchRelationships,
  };
} 