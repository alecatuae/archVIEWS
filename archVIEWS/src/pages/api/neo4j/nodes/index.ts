import { NextApiRequest, NextApiResponse } from 'next';
import neo4jService from '@/services/neo4jService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case 'GET':
      return getNodes(req, res);
    case 'POST':
      return createNode(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getNodes(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { limit = '100', environment = 'all', label = 'Component' } = req.query;
    
    // Construir a consulta Cypher
    let query = `MATCH (n${label !== 'all' ? ':' + label : ''})`;
    
    // Adicionar filtro de ambiente se necessário
    if (environment !== 'all') {
      query += ` WHERE n.environment = $environment`;
    }
    
    // Finalizar a consulta
    query += ` RETURN n LIMIT $limit`;
    
    const result = await neo4jService.executeQuery(query, {
      limit: parseInt(limit.toString()),
      environment
    });
    
    if (!result.success) {
      throw new Error(result.message || 'Erro ao buscar nós');
    }
    
    // Processar os resultados para o formato esperado
    const nodes = result.results.map(record => {
      const nodeData = record.n;
      
      return {
        id: nodeData.identity.toString(),
        labels: nodeData.labels,
        properties: nodeData.properties
      };
    });
    
    return res.status(200).json(nodes);
  } catch (error: any) {
    console.error('Erro ao buscar nós:', error);
    return res.status(500).json({ error: error.message || 'Erro ao buscar nós' });
  }
}

async function createNode(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { labels = ['Component'], properties } = req.body;
    
    if (!properties || !properties.name) {
      return res.status(400).json({ error: 'Propriedades inválidas. Nome é obrigatório.' });
    }
    
    // Criar o nó no Neo4j
    const labelString = labels.join(':');
    const query = `
      CREATE (n:${labelString} $properties)
      RETURN n
    `;
    
    const result = await neo4jService.executeQuery(query, { properties });
    
    if (!result.success) {
      throw new Error(result.message || 'Erro ao criar nó');
    }
    
    // Obter o nó criado da resposta
    const nodeData = result.results[0]?.n;
    
    if (!nodeData) {
      throw new Error('Nó criado mas não foi possível obter os dados');
    }
    
    const createdNode = {
      id: nodeData.identity.toString(),
      labels: nodeData.labels,
      properties: nodeData.properties
    };
    
    return res.status(201).json(createdNode);
  } catch (error: any) {
    console.error('Erro ao criar nó:', error);
    return res.status(500).json({ error: error.message || 'Erro ao criar nó' });
  }
} 