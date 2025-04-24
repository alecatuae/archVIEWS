import { NextApiRequest, NextApiResponse } from 'next';
import neo4jService from '@/services/neo4jService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid node ID' });
    }

    // Buscar detalhes do nó
    const result = await neo4jService.getNodeDetails(id);

    if (!result.success || !result.results) {
      return res.status(500).json({ error: result.message || 'Failed to fetch node details' });
    }

    if (result.results.length === 0) {
      return res.status(404).json({ error: 'Node not found' });
    }

    // Retornar o primeiro resultado
    const node = result.results[0].n;
    
    return res.status(200).json({
      id: node.identity.toString(),
      labels: node.labels,
      properties: node.properties
    });
  } catch (error: any) {
    console.error('Error in node details API route:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
} 