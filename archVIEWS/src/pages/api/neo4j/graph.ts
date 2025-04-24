import { NextApiRequest, NextApiResponse } from 'next';
import neo4jService from '@/services/neo4jService';
import { processNeo4jResponse } from '@/utils/graphUtils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { limit = 100, environment = 'all' } = req.query;

    // Validar parâmetros
    const parsedLimit = parseInt(limit.toString());
    if (isNaN(parsedLimit) || parsedLimit <= 0) {
      return res.status(400).json({ error: 'Invalid limit parameter' });
    }

    // Buscar dados do Neo4j
    const result = await neo4jService.getGraph(parsedLimit, environment.toString());

    if (!result.success) {
      return res.status(500).json({ error: result.message || 'Failed to fetch graph data' });
    }

    // Processar e transformar os dados
    const graphData = processNeo4jResponse(result);

    return res.status(200).json(graphData);
  } catch (error: any) {
    console.error('Error in graph API route:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
} 