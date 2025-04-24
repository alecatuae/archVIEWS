import { NextApiRequest, NextApiResponse } from 'next';
import neo4jService from '@/services/neo4jService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID do nó é obrigatório' });
  }

  if (req.method === 'GET') {
    return getNodeRelationships(req, res, id);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

async function getNodeRelationships(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    // Primeiro verificar se o nó existe
    const checkQuery = `
      MATCH (n)
      WHERE id(n) = $nodeId
      RETURN n
    `;
    
    const checkResult = await neo4jService.executeQuery(checkQuery, { nodeId: parseInt(id) });
    
    if (!checkResult.success || !checkResult.results || checkResult.results.length === 0) {
      return res.status(404).json({ error: 'Nó não encontrado' });
    }

    // Buscar relacionamentos de entrada (outros nós -> este nó)
    const inboundQuery = `
      MATCH (m)-[r]->(n)
      WHERE id(n) = $nodeId
      RETURN m, r
      ORDER BY type(r), m.name
    `;
    
    const inboundResult = await neo4jService.executeQuery(inboundQuery, { nodeId: parseInt(id) });
    
    // Buscar relacionamentos de saída (este nó -> outros nós)
    const outboundQuery = `
      MATCH (n)-[r]->(m)
      WHERE id(n) = $nodeId
      RETURN m, r
      ORDER BY type(r), m.name
    `;
    
    const outboundResult = await neo4jService.executeQuery(outboundQuery, { nodeId: parseInt(id) });
    
    // Processar resultados
    const inboundRelationships = inboundResult.success ? inboundResult.results.map(record => {
      return {
        edge: {
          id: record.r.identity.toString(),
          type: record.r.type,
          source: record.m.identity.toString(),
          target: id,
          properties: record.r.properties
        },
        node: {
          id: record.m.identity.toString(),
          labels: record.m.labels,
          properties: record.m.properties
        }
      };
    }) : [];
    
    const outboundRelationships = outboundResult.success ? outboundResult.results.map(record => {
      return {
        edge: {
          id: record.r.identity.toString(),
          type: record.r.type,
          source: id,
          target: record.m.identity.toString(),
          properties: record.r.properties
        },
        node: {
          id: record.m.identity.toString(),
          labels: record.m.labels,
          properties: record.m.properties
        }
      };
    }) : [];
    
    return res.status(200).json({
      inbound: inboundRelationships,
      outbound: outboundRelationships
    });
  } catch (error: any) {
    console.error('Erro ao buscar relacionamentos do nó:', error);
    return res.status(500).json({ error: error.message || 'Erro ao buscar relacionamentos do nó' });
  }
} 