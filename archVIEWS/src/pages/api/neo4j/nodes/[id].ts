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

  switch (req.method) {
    case 'GET':
      return getNode(req, res, id);
    case 'PUT':
      return updateNode(req, res, id);
    case 'DELETE':
      return deleteNode(req, res, id);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getNode(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    // Consulta Cypher para obter um nó pelo ID
    const query = `
      MATCH (n)
      WHERE id(n) = $nodeId
      RETURN n
    `;
    
    const result = await neo4jService.executeQuery(query, { nodeId: parseInt(id) });
    
    if (!result.success) {
      throw new Error(result.message || 'Erro ao buscar nó');
    }
    
    // Verificar se o nó foi encontrado
    if (!result.results || result.results.length === 0) {
      return res.status(404).json({ error: 'Nó não encontrado' });
    }
    
    // Processar os dados do nó
    const nodeData = result.results[0].n;
    
    const node = {
      id: nodeData.identity.toString(),
      labels: nodeData.labels,
      properties: nodeData.properties
    };
    
    return res.status(200).json(node);
  } catch (error: any) {
    console.error('Erro ao buscar nó:', error);
    return res.status(500).json({ error: error.message || 'Erro ao buscar nó' });
  }
}

async function updateNode(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const { labels = [], properties } = req.body;
    
    if (!properties) {
      return res.status(400).json({ error: 'Propriedades são obrigatórias' });
    }
    
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
    
    // Atualizar as propriedades do nó
    const updateQuery = `
      MATCH (n)
      WHERE id(n) = $nodeId
      SET n = $properties
      RETURN n
    `;
    
    const updateResult = await neo4jService.executeQuery(updateQuery, {
      nodeId: parseInt(id),
      properties
    });
    
    if (!updateResult.success) {
      throw new Error(updateResult.message || 'Erro ao atualizar nó');
    }
    
    // Processar os dados do nó atualizado
    const nodeData = updateResult.results[0].n;
    
    const updatedNode = {
      id: nodeData.identity.toString(),
      labels: nodeData.labels,
      properties: nodeData.properties
    };
    
    return res.status(200).json(updatedNode);
  } catch (error: any) {
    console.error('Erro ao atualizar nó:', error);
    return res.status(500).json({ error: error.message || 'Erro ao atualizar nó' });
  }
}

async function deleteNode(req: NextApiRequest, res: NextApiResponse, id: string) {
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
    
    // Deletar o nó
    // Nota: Esta consulta também remove todas as relações do nó
    const deleteQuery = `
      MATCH (n)
      WHERE id(n) = $nodeId
      DETACH DELETE n
    `;
    
    const deleteResult = await neo4jService.executeQuery(deleteQuery, { nodeId: parseInt(id) });
    
    if (!deleteResult.success) {
      throw new Error(deleteResult.message || 'Erro ao excluir nó');
    }
    
    // Retornar sucesso sem conteúdo
    return res.status(204).end();
  } catch (error: any) {
    console.error('Erro ao excluir nó:', error);
    return res.status(500).json({ error: error.message || 'Erro ao excluir nó' });
  }
} 