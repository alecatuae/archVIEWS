import { NextApiRequest, NextApiResponse } from 'next';
import neo4jService from '@/services/neo4jService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case 'GET':
      return getEdges(req, res);
    case 'POST':
      return createEdge(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getEdges(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { limit = '100', type = 'all' } = req.query;
    
    // Construir a consulta Cypher
    let query = `MATCH (n)-[r]->(m)`;
    
    // Adicionar filtro de tipo se necessário
    if (type !== 'all') {
      query += ` WHERE type(r) = $type`;
    }
    
    // Finalizar a consulta
    query += ` RETURN n, r, m LIMIT $limit`;
    
    const result = await neo4jService.executeQuery(query, {
      limit: parseInt(limit.toString()),
      type
    });
    
    if (!result.success) {
      throw new Error(result.message || 'Erro ao buscar relacionamentos');
    }
    
    // Processar os resultados para o formato esperado
    const edges = result.results.map(record => {
      const relationship = record.r;
      
      return {
        id: relationship.identity.toString(),
        type: relationship.type,
        source: record.n.identity.toString(),
        target: record.m.identity.toString(),
        properties: relationship.properties
      };
    });
    
    return res.status(200).json(edges);
  } catch (error: any) {
    console.error('Erro ao buscar relacionamentos:', error);
    return res.status(500).json({ error: error.message || 'Erro ao buscar relacionamentos' });
  }
}

async function createEdge(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { type, source, target, properties = {} } = req.body;
    
    if (!type || !source || !target) {
      return res.status(400).json({ 
        error: 'Dados inválidos. Tipo, origem e destino são obrigatórios.' 
      });
    }
    
    // Verificar se os nós existem
    const checkNodesQuery = `
      MATCH (n), (m)
      WHERE id(n) = $sourceId AND id(m) = $targetId
      RETURN n, m
    `;
    
    const checkResult = await neo4jService.executeQuery(checkNodesQuery, { 
      sourceId: parseInt(source),
      targetId: parseInt(target)
    });
    
    if (!checkResult.success || !checkResult.results || checkResult.results.length === 0) {
      return res.status(404).json({ error: 'Nós de origem ou destino não encontrados' });
    }
    
    // Criar o relacionamento
    const createQuery = `
      MATCH (n), (m)
      WHERE id(n) = $sourceId AND id(m) = $targetId
      CREATE (n)-[r:${type} $properties]->(m)
      RETURN n, r, m
    `;
    
    const createResult = await neo4jService.executeQuery(createQuery, { 
      sourceId: parseInt(source),
      targetId: parseInt(target),
      properties
    });
    
    if (!createResult.success) {
      throw new Error(createResult.message || 'Erro ao criar relacionamento');
    }
    
    // Obter o relacionamento criado da resposta
    const record = createResult.results[0];
    
    if (!record || !record.r) {
      throw new Error('Relacionamento criado mas não foi possível obter os dados');
    }
    
    const createdEdge = {
      id: record.r.identity.toString(),
      type: record.r.type,
      source: record.n.identity.toString(),
      target: record.m.identity.toString(),
      properties: record.r.properties
    };
    
    return res.status(201).json(createdEdge);
  } catch (error: any) {
    console.error('Erro ao criar relacionamento:', error);
    return res.status(500).json({ error: error.message || 'Erro ao criar relacionamento' });
  }
} 