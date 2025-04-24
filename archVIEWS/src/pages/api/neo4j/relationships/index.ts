import type { NextApiRequest, NextApiResponse } from 'next';
import { neo4jService } from '@/services/neo4jService';

interface CreateRelationshipData {
  sourceId: number;
  targetId: number;
  type: string;
  properties?: Record<string, any>;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // GET - listar relacionamentos com filtros
  if (req.method === 'GET') {
    try {
      const { 
        limit = '50',
        offset = '0',
        type,
        sourceId,
        targetId,
        environment
      } = req.query;

      // Limite máximo de relacionamentos por questões de performance
      const maxLimit = 100;
      const actualLimit = Math.min(parseInt(limit as string, 10), maxLimit);
      const actualOffset = parseInt(offset as string, 10);

      if (isNaN(actualLimit) || isNaN(actualOffset)) {
        return res.status(400).json({ error: 'Parâmetros de paginação inválidos' });
      }

      // Construção da query
      let query = `
        MATCH (source)-[r]->(target)
        WHERE 1=1
      `;

      const params: Record<string, any> = {};

      // Filtro por tipo de relacionamento
      if (type) {
        query += `
          AND type(r) = $type
        `;
        params.type = type;
      }

      // Filtro por ID do nó de origem
      if (sourceId) {
        query += `
          AND id(source) = $sourceId
        `;
        params.sourceId = parseInt(sourceId as string, 10);
      }

      // Filtro por ID do nó de destino
      if (targetId) {
        query += `
          AND id(target) = $targetId
        `;
        params.targetId = parseInt(targetId as string, 10);
      }

      // Filtro por ambiente
      if (environment) {
        query += `
          AND (source.environment = $environment OR target.environment = $environment)
        `;
        params.environment = environment;
      }

      // Contagem total para paginação
      const countQuery = query + `
        RETURN count(r) as total
      `;

      const countResult = await neo4jService.executeQuery(countQuery, params);
      const total = countResult.records[0].get('total').toNumber();

      // Query final para retornar os relacionamentos com paginação
      query += `
        RETURN r, source, target
        ORDER BY id(r)
        SKIP $skip
        LIMIT $limit
      `;

      params.skip = actualOffset;
      params.limit = actualLimit;

      const result = await neo4jService.executeQuery(query, params);

      // Transformar os resultados
      const relationships = result.records.map(record => {
        const rel = record.get('r');
        const source = record.get('source');
        const target = record.get('target');

        return {
          id: rel.identity.toString(),
          type: rel.type,
          properties: rel.properties,
          source: {
            id: source.identity.toString(),
            labels: source.labels,
            properties: source.properties
          },
          target: {
            id: target.identity.toString(),
            labels: target.labels,
            properties: target.properties
          }
        };
      });

      return res.status(200).json({
        relationships,
        pagination: {
          total,
          limit: actualLimit,
          offset: actualOffset,
          hasMore: total > actualOffset + actualLimit
        }
      });
    } catch (error: any) {
      console.error('Erro ao listar relacionamentos:', error);
      return res.status(500).json({ error: error.message || 'Erro ao listar relacionamentos' });
    }
  }

  // POST - criar um relacionamento
  if (req.method === 'POST') {
    try {
      const { sourceId, targetId, type, properties = {} } = req.body as CreateRelationshipData;

      // Validação dos campos obrigatórios
      if (!sourceId || !targetId || !type) {
        return res.status(400).json({ 
          error: 'Os IDs de origem e destino e o tipo de relacionamento são obrigatórios'
        });
      }

      // Verificar se os nós existem
      const checkNodesQuery = `
        MATCH (source), (target)
        WHERE id(source) = $sourceId AND id(target) = $targetId
        RETURN source, target
      `;

      const checkResult = await neo4jService.executeQuery(checkNodesQuery, { 
        sourceId, 
        targetId 
      });

      if (checkResult.records.length === 0) {
        return res.status(404).json({ error: 'Um ou ambos os nós não foram encontrados' });
      }

      // Verificar se o relacionamento já existe
      const checkRelQuery = `
        MATCH (source)-[r:${type}]->(target)
        WHERE id(source) = $sourceId AND id(target) = $targetId
        RETURN r
      `;

      const checkRelResult = await neo4jService.executeQuery(checkRelQuery, { 
        sourceId, 
        targetId 
      });

      if (checkRelResult.records.length > 0) {
        return res.status(409).json({ 
          error: 'Já existe um relacionamento deste tipo entre os nós especificados' 
        });
      }

      // Criar o relacionamento
      const createQuery = `
        MATCH (source), (target)
        WHERE id(source) = $sourceId AND id(target) = $targetId
        CREATE (source)-[r:${type} $properties]->(target)
        RETURN r, source, target
      `;

      const createResult = await neo4jService.executeQuery(createQuery, { 
        sourceId, 
        targetId, 
        properties 
      });

      // Formatar a resposta
      const record = createResult.records[0];
      const rel = record.get('r');
      const source = record.get('source');
      const target = record.get('target');

      return res.status(201).json({
        id: rel.identity.toString(),
        type: rel.type,
        properties: rel.properties,
        source: {
          id: source.identity.toString(),
          labels: source.labels,
          properties: source.properties
        },
        target: {
          id: target.identity.toString(),
          labels: target.labels,
          properties: target.properties
        }
      });
    } catch (error: any) {
      console.error('Erro ao criar relacionamento:', error);
      return res.status(500).json({ error: error.message || 'Erro ao criar relacionamento' });
    }
  }

  // Método não permitido
  return res.status(405).json({ error: 'Método não permitido' });
} 