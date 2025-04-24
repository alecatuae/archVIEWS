import neo4j from 'neo4j-driver';

const driver = neo4j.driver(
  process.env.NEO4J_URI || 'neo4j://localhost:7687',
  neo4j.auth.basic(
    process.env.NEO4J_USERNAME || 'neo4j',
    process.env.NEO4J_PASSWORD || 'password'
  )
);

export async function executeQuery(query: string, params = {}) {
  const session = driver.session({
    database: process.env.NEO4J_DATABASE || 'neo4j'
  });

  try {
    const result = await session.run(query, params);
    return {
      success: true,
      results: result.records.map(record => {
        const recordObject: any = {};
        record.keys.forEach(key => {
          recordObject[key] = record.get(key);
        });
        return recordObject;
      })
    };
  } catch (error: any) {
    console.error('Neo4j query error:', error);
    return {
      success: false,
      message: error.message
    };
  } finally {
    await session.close();
  }
}

export async function getGraph(limit = 100, environmentFilter = 'all') {
  let query = `
    MATCH (n)-[r]->(m)
    ${environmentFilter !== 'all' ? `WHERE n.environment = $environment OR m.environment = $environment` : ''}
    RETURN n, r, m
    LIMIT $limit
  `;

  const params = {
    limit: parseInt(limit.toString()),
    environment: environmentFilter
  };

  return executeQuery(query, params);
}

export async function getNodeDetails(nodeId: string) {
  const query = `
    MATCH (n)
    WHERE id(n) = $nodeId
    RETURN n
  `;

  return executeQuery(query, { nodeId });
}

export async function getNodeRelationships(nodeId: string) {
  const query = `
    MATCH (n)-[r]-(m)
    WHERE id(n) = $nodeId
    RETURN n, r, m
  `;

  return executeQuery(query, { nodeId });
}

export default {
  executeQuery,
  getGraph,
  getNodeDetails,
  getNodeRelationships
}; 