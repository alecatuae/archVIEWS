import type { NextApiRequest, NextApiResponse } from 'next';
import neo4jService from '@/services/neo4jService';

type RelationshipTypeResponse = {
  type: string;
  count: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RelationshipTypeResponse[] | { error: string }>
) {
  // Apenas permite método GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  // Recupera parâmetro opcional de ambiente
  const { environment } = req.query;
  const environmentFilter = environment && !Array.isArray(environment) ? environment : undefined;

  try {
    // Constrói a query com filtro de ambiente opcional
    let query = `
      MATCH ()-[r]->()
      ${environmentFilter ? 'WHERE any(node IN [startNode(r), endNode(r)] WHERE node.environment = $environment)' : ''}
      RETURN type(r) as relType, count(r) as count
      ORDER BY count DESC
    `;

    // Executa a query com os parâmetros
    const result = await neo4jService.executeQuery(
      query,
      environmentFilter ? { environment: environmentFilter } : {}
    );

    if (!result.success || !result.results) {
      return res.status(500).json({ error: 'Erro ao buscar tipos de relacionamento' });
    }

    // Formata a resposta
    const relationshipTypes = result.results.map(record => ({
      type: record.get('relType'),
      count: record.get('count').toNumber()
    }));

    return res.status(200).json(relationshipTypes);
  } catch (error: any) {
    console.error('Erro ao buscar tipos de relacionamentos:', error);
    return res.status(500).json({ error: error.message || 'Erro ao buscar tipos de relacionamentos' });
  }
} 