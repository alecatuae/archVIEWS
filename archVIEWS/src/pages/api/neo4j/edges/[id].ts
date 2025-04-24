import { NextApiRequest, NextApiResponse } from 'next';
import neo4jService from '@/services/neo4jService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID do relacionamento é obrigatório' });
  }

  switch (req.method) {
    case 'GET':
      return getEdge(req, res, id);
    case 'PUT':
      return updateEdge(req, res, id);
    case 'DELETE':
      return deleteEdge(req, res, id);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getEdge(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    // Consulta Cypher para obter o relacionamento pelo ID
    const query = `
      MATCH (n)-[r]->(m)
      WHERE id(r) = $relationshipId
      RETURN n, r, m
    `;
    
    const result = await neo4jService.executeQuery(query, { relationshipId: parseInt(id) });
    
    if (!result.success) {
      throw new Error(result.message || 'Erro ao buscar relacionamento');
    }
    
    // Verificar se o relacionamento foi encontrado
    if (!result.results || result.results.length === 0) {
      return res.status(404).json({ error: 'Relacionamento não encontrado' });
    }
    
    // Processar os dados do relacionamento
    const record = result.results[0];
    
    const edge = {
      id: record.r.identity.toString(),
      type: record.r.type,
      source: record.n.identity.toString(),
      target: record.m.identity.toString(),
      properties: record.r.properties
    };
    
    return res.status(200).json(edge);
  } catch (error: any) {
    console.error('Erro ao buscar relacionamento:', error);
    return res.status(500).json({ error: error.message || 'Erro ao buscar relacionamento' });
  }
}

async function updateEdge(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const { properties } = req.body;
    
    if (!properties) {
      return res.status(400).json({ error: 'Propriedades são obrigatórias' });
    }
    
    // Primeiro verificar se o relacionamento existe
    const checkQuery = `
      MATCH ()-[r]->()
      WHERE id(r) = $relationshipId
      RETURN r
    `;
    
    const checkResult = await neo4jService.executeQuery(checkQuery, { relationshipId: parseInt(id) });
    
    if (!checkResult.success || !checkResult.results || checkResult.results.length === 0) {
      return res.status(404).json({ error: 'Relacionamento não encontrado' });
    }
    
    // Atualizar as propriedades do relacionamento
    const updateQuery = `
      MATCH (n)-[r]->(m)
      WHERE id(r) = $relationshipId
      SET r = $properties
      RETURN n, r, m
    `;
    
    const updateResult = await neo4jService.executeQuery(updateQuery, {
      relationshipId: parseInt(id),
      properties
    });
    
    if (!updateResult.success) {
      throw new Error(updateResult.message || 'Erro ao atualizar relacionamento');
    }
    
    // Verificar se há resultados
    if (!updateResult.results || updateResult.results.length === 0) {
      throw new Error('Relacionamento atualizado não encontrado');
    }
    
    // Processar os dados do relacionamento atualizado
    const record = updateResult.results[0];
    
    const updatedEdge = {
      id: record.r.identity.toString(),
      type: record.r.type,
      source: record.n.identity.toString(),
      target: record.m.identity.toString(),
      properties: record.r.properties
    };
    
    return res.status(200).json(updatedEdge);
  } catch (error: any) {
    console.error('Erro ao atualizar relacionamento:', error);
    return res.status(500).json({ error: error.message || 'Erro ao atualizar relacionamento' });
  }
}

async function deleteEdge(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    // Primeiro verificar se o relacionamento existe
    const checkQuery = `
      MATCH ()-[r]->()
      WHERE id(r) = $relationshipId
      RETURN r
    `;
    
    const checkResult = await neo4jService.executeQuery(checkQuery, { relationshipId: parseInt(id) });
    
    if (!checkResult.success || !checkResult.results || checkResult.results.length === 0) {
      return res.status(404).json({ error: 'Relacionamento não encontrado' });
    }
    
    // Deletar o relacionamento
    const deleteQuery = `
      MATCH ()-[r]->()
      WHERE id(r) = $relationshipId
      DELETE r
    `;
    
    const deleteResult = await neo4jService.executeQuery(deleteQuery, { relationshipId: parseInt(id) });
    
    if (!deleteResult.success) {
      throw new Error(deleteResult.message || 'Erro ao excluir relacionamento');
    }
    
    // Retornar sucesso sem conteúdo
    return res.status(204).end();
  } catch (error: any) {
    console.error('Erro ao excluir relacionamento:', error);
    return res.status(500).json({ error: error.message || 'Erro ao excluir relacionamento' });
  }
} 