import { NextApiRequest, NextApiResponse } from 'next';
import neo4j from 'neo4j-driver';
import { processNeo4jResponse } from '@/utils/graphUtils';

// Configurar o driver diretamente para este endpoint
const driver = neo4j.driver(
  process.env.NEO4J_URI || 'neo4j://localhost:7687',
  neo4j.auth.basic(
    process.env.NEO4J_USERNAME || 'neo4j',
    process.env.NEO4J_PASSWORD || 'password'
  )
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = driver.session({
    database: process.env.NEO4J_DATABASE || 'neo4j'
  });

  try {
    // Extrair e validar parâmetros
    const limitParam = req.query.limit;
    const environment = req.query.environment || 'all';

    // Utilizar um valor fixo para o limite (100)
    const limit = 100;

    console.log('Request query params:', req.query);
    console.log('Using limit:', limit, 'type:', typeof limit);
    console.log('Environment:', environment);

    // Construir a consulta Cypher com valor literal para o limite
    let query = `
      MATCH (n)-[r]->(m)
      ${environment !== 'all' ? `WHERE n.environment = $environment OR n.environment = 'production' OR m.environment = $environment OR m.environment = 'production'` : ''}
      RETURN n, r, m
      LIMIT 100
    `;

    const params = {
      environment: environment
    };

    console.log('Executing query with params:', params);

    // Executar a consulta
    const result = await session.run(query, params);

    // Processar os registros manualmente
    const records = result.records.map(record => {
      const n = record.get('n');
      const r = record.get('r');
      const m = record.get('m');
      
      return {
        n: {
          identity: n.identity.toString(),
          labels: n.labels,
          properties: n.properties
        },
        r: {
          identity: r.identity.toString(),
          type: r.type,
          properties: r.properties,
          start: r.start.toString(),
          end: r.end.toString()
        },
        m: {
          identity: m.identity.toString(),
          labels: m.labels,
          properties: m.properties
        }
      };
    });

    // Transformar para o formato esperado da aplicação
    const graphData = {
      nodes: [],
      edges: []
    };

    // Processar nós
    const nodesMap = new Map();
    
    records.forEach(record => {
      // Processar nó de origem
      if (!nodesMap.has(record.n.identity)) {
        nodesMap.set(record.n.identity, {
          id: record.n.identity,
          labels: record.n.labels,
          properties: record.n.properties
        });
      }
      
      // Processar nó de destino
      if (!nodesMap.has(record.m.identity)) {
        nodesMap.set(record.m.identity, {
          id: record.m.identity,
          labels: record.m.labels,
          properties: record.m.properties
        });
      }
      
      // Adicionar relacionamento
      graphData.edges.push({
        id: record.r.identity,
        source: record.r.start,
        target: record.r.end,
        type: record.r.type,
        properties: record.r.properties
      });
    });
    
    // Converter Map para array
    graphData.nodes = Array.from(nodesMap.values());

    console.log(`Processado ${graphData.nodes.length} nós e ${graphData.edges.length} relacionamentos`);

    return res.status(200).json(graphData);
  } catch (error: any) {
    console.error('Error in graph API route:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  } finally {
    await session.close();
  }
} 