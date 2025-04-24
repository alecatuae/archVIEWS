import type { NextApiRequest, NextApiResponse } from 'next';
import neo4jService from '@/services/neo4jService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  // Apenas permite método GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  // Obtém o tipo de relacionamento da URL
  const { type } = req.query;

  if (!type || Array.isArray(type)) {
    return res.status(400).json({ error: 'É necessário especificar um tipo de relacionamento válido' });
  }

  // Recupera parâmetros opcionais
  const { limit, skip, environment } = req.query;
  
  // Processa os parâmetros de paginação
  const parsedLimit = limit && !Array.isArray(limit) ? parseInt(limit, 10) : 100;
  const parsedSkip = skip && !Array.isArray(skip) ? parseInt(skip, 10) : 0;
  const environmentFilter = environment && !Array.isArray(environment) ? environment : undefined;

  try {
    // Constrói a query com filtros opcionais
    let query = `
      MATCH (source)-[r:${type}]->(target)
      ${environmentFilter ? 'WHERE any(node IN [source, target] WHERE node.environment = $environment)' : ''}
      RETURN source, r, target
      SKIP $skip
      LIMIT $limit
    `;

    // Executa a query com os parâmetros
    const result = await neo4jService.executeQuery(
      query,
      {
        skip: parsedSkip,
        limit: parsedLimit,
        ...(environmentFilter ? { environment: environmentFilter } : {})
      }
    );

    if (!result.success || !result.results) {
      return res.status(500).json({ error: 'Erro ao buscar relacionamentos' });
    }

    // Formata a resposta
    const relationships = result.results.map(record => {
      const source = record.get('source').properties;
      const target = record.get('target').properties;
      const relationship = {
        id: record.get('r').identity.toNumber(),
        type: record.get('r').type,
        properties: record.get('r').properties,
        source: {
          id: record.get('source').identity.toNumber(),
          labels: record.get('source').labels,
          ...source
        },
        target: {
          id: record.get('target').identity.toNumber(),
          labels: record.get('target').labels,
          ...target
        }
      };
      
      return relationship;
    });

    // Conta o total de relacionamentos deste tipo
    const countQuery = `
      MATCH ()-[r:${type}]->()
      ${environmentFilter ? 'WHERE any(node IN [startNode(r), endNode(r)] WHERE node.environment = $environment)' : ''}
      RETURN count(r) AS total
    `;
    
    const countResult = await neo4jService.executeQuery(
      countQuery,
      environmentFilter ? { environment: environmentFilter } : {}
    );
    
    if (!countResult.success || !countResult.results || countResult.results.length === 0) {
      return res.status(500).json({ error: 'Erro ao contar relacionamentos' });
    }
    
    const total = countResult.results[0].get('total').toNumber();

    return res.status(200).json({
      relationships,
      pagination: {
        total,
        limit: parsedLimit,
        skip: parsedSkip,
        hasMore: total > (parsedSkip + parsedLimit)
      }
    });
  } catch (error: any) {
    console.error(`Erro ao buscar relacionamentos do tipo ${type}:`, error);
    return res.status(500).json({ error: error.message || `Erro ao buscar relacionamentos do tipo ${type}` });
  }
} 