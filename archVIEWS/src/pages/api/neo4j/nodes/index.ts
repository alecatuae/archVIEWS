import type { NextApiRequest, NextApiResponse } from 'next';
import neo4jService from '@/services/neo4jService';

interface CreateNodeData {
  labels: string[];
  properties: Record<string, any>;
  environment?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // GET - listar nós com paginação e filtros
  if (req.method === 'GET') {
    try {
      // Parâmetros de paginação e filtros
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const offset = parseInt(req.query.offset as string, 10) || 0;
      const labels = req.query.labels as string;
      const environment = req.query.environment as string;
      const search = req.query.search as string;
      
      if (limit > 100) {
        return res.status(400).json({ error: 'O limite máximo é 100' });
      }

      // Construir a query com base nos filtros
      let query = 'MATCH (n)';
      const params: Record<string, any> = { limit, offset };
      
      // Filtrar por labels (se especificado)
      if (labels) {
        const labelsList = labels.split(',');
        if (labelsList.length > 0) {
          query += ` WHERE n:${labelsList.map((_, i) => `$label${i}`).join(' OR n:')}`;
          labelsList.forEach((label, i) => {
            params[`label${i}`] = label.trim();
          });
        }
      }
      
      // Adicionar filtro de ambiente
      if (environment) {
        query += labels ? ' AND' : ' WHERE';
        query += ' n.environment = $environment';
        params.environment = environment;
      }
      
      // Adicionar busca por propriedades
      if (search) {
        const searchCondition = labels || environment ? ' AND' : ' WHERE';
        query += `${searchCondition} (`;
        
        // Buscar em todas as propriedades de texto usando regex
        const searchProperties = ['name', 'description', 'title', 'id'];
        const searchConditions = searchProperties.map(prop => 
          `n.${prop} =~ $searchRegex`
        );
        
        query += searchConditions.join(' OR ');
        query += ')';
        params.searchRegex = `(?i).*${search}.*`;
      }
      
      // Adicionar contagem total
      const countQuery = `${query} RETURN count(n) as total`;
      const countResult = await neo4jService.executeQuery(countQuery, params);
      
      if (!countResult.success || !countResult.results || countResult.results.length === 0) {
        return res.status(500).json({ error: 'Erro ao contar os nós' });
      }
      
      const total = countResult.results[0].get('total').toNumber();
      
      // Adicionar paginação e retornar resultados
      query += ' RETURN n ORDER BY n.name SKIP $offset LIMIT $limit';
      
      const result = await neo4jService.executeQuery(query, params);
      
      if (!result.success) {
        throw new Error(result.message || 'Erro ao buscar nós');
      }
      
      const nodes = result.results && result.results.length > 0 
        ? result.results.map(record => {
            const node = record.get('n');
            return {
              id: node.identity.toString(),
              labels: node.labels,
              properties: node.properties
            };
          })
        : [];
      
      return res.status(200).json({
        nodes,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total
        }
      });
    } catch (error: any) {
      console.error('Erro ao listar nós:', error);
      return res.status(500).json({ error: error.message || 'Erro ao listar nós' });
    }
  }
  
  // POST - criar um novo nó
  if (req.method === 'POST') {
    try {
      const { labels, properties, environment }: CreateNodeData = req.body;
      
      // Validar os dados de entrada
      if (!labels || !Array.isArray(labels) || labels.length === 0) {
        return res.status(400).json({ error: 'É necessário fornecer pelo menos um label' });
      }
      
      if (!properties || typeof properties !== 'object') {
        return res.status(400).json({ error: 'Propriedades inválidas' });
      }
      
      // Adicionar o ambiente às propriedades se especificado
      if (environment) {
        properties.environment = environment;
      }
      
      // Construir a query para criar o nó
      const labelString = labels.map(label => `:${label}`).join('');
      const query = `
        CREATE (n${labelString} $properties)
        RETURN n
      `;
      
      const result = await neo4jService.executeQuery(query, { properties });
      
      if (!result.success || !result.results || result.results.length === 0) {
        throw new Error('Nó criado mas não foi possível recuperar os dados');
      }
      
      const node = result.results[0].get('n');
      
      return res.status(201).json({
        id: node.identity.toString(),
        labels: node.labels,
        properties: node.properties
      });
    } catch (error: any) {
      console.error('Erro ao criar nó:', error);
      return res.status(500).json({ error: error.message || 'Erro ao criar nó' });
    }
  }
  
  // Método não permitido
  return res.status(405).json({ error: 'Método não permitido' });
} 