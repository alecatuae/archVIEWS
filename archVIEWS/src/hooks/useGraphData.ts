import { useState, useEffect } from 'react';
import axios from 'axios';
import { GraphData } from '@/types/graph';

interface UseGraphDataProps {
  limit?: number;
  environment?: string;
  initialLoad?: boolean;
}

interface UseGraphDataResult {
  data: GraphData;
  isLoading: boolean;
  error: string | null;
  fetchData: (params?: { limit?: number; environment?: string }) => Promise<void>;
}

export default function useGraphData({
  limit = 100,
  environment = 'all',
  initialLoad = true
}: UseGraphDataProps = {}): UseGraphDataResult {
  const [data, setData] = useState<GraphData>({ nodes: [], edges: [] });
  const [isLoading, setIsLoading] = useState<boolean>(initialLoad);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (params?: { limit?: number; environment?: string }) => {
    try {
      setIsLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      queryParams.append('limit', String(params?.limit || limit));
      queryParams.append('environment', params?.environment || environment);

      const response = await axios.get<GraphData>(`/api/neo4j/graph?${queryParams.toString()}`);
      
      setData(response.data);
    } catch (err: any) {
      console.error('Error fetching graph data:', err);
      setError(err.response?.data?.error || err.message || 'Failed to fetch graph data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialLoad) {
      fetchData();
    }
  }, []);

  return { data, isLoading, error, fetchData };
} 