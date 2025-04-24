import { NextApiRequest, NextApiResponse } from 'next';
import { executeQuery } from '@/services/neo4jService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, params } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Invalid query parameter' });
    }

    // Executar a consulta personalizada
    const result = await executeQuery(query, params || {});

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Error in Neo4j query API route:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
} 