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

    // Validar parâmetros de forma mais robusta
    let parsedLimit = 100; // valor padrão
    
    try {
      if (typeof limit === 'string') {
        // Converter string para número e arredondar para baixo
        parsedLimit = Math.floor(Number(limit));
        
        // Se for NaN ou não positivo, usar o valor padrão
        if (isNaN(parsedLimit) || parsedLimit <= 0) {
          parsedLimit = 100;
        }
      } else if (typeof limit === 'number') {
        parsedLimit = Math.floor(limit);
        
        if (parsedLimit <= 0) {
          parsedLimit = 100;
        }
      }
    } catch (error) {
      console.warn('Erro ao interpretar o parâmetro limit:', error);
      parsedLimit = 100; // Usar valor padrão em caso de erro
    }

    // Buscar dados do Neo4j usando o limite validado
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