import type { NextApiRequest, NextApiResponse } from 'next';
import neo4jService from '@/services/neo4jService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID inválido' });
  }
  
  // GET - obter detalhes de um nó específico
  if (req.method === 'GET') {
    try {
      // Consulta para obter o nó e suas relações de entrada e saída
      const query = `
        MATCH (n)
        WHERE id(n) = $id
        OPTIONAL MATCH (n)-[r1]->(target)
        OPTIONAL MATCH (source)-[r2]->(n)
        RETURN n, 
          collect(DISTINCT { 
            id: id(r1), 
            type: type(r1), 
            properties: properties(r1), 
            target: { id: id(target), labels: labels(target), properties: properties(target) }
          }) AS outgoingRelationships,
          collect(DISTINCT { 
            id: id(r2), 
            type: type(r2), 
            properties: properties(r2), 
            source: { id: id(source), labels: labels(source), properties: properties(source) }
          }) AS incomingRelationships
      `;
      
      const result = await neo4jService.executeQuery(query, { id: parseInt(id, 10) });
      
      if (!result.success || !result.results || result.results.length === 0) {
        return res.status(404).json({ error: 'Nó não encontrado' });
      }
      
      const record = result.results[0];
      const node = record.get('n');
      const outgoingRelationships = record.get('outgoingRelationships')
        .filter((rel: any) => rel.id !== null);
      const incomingRelationships = record.get('incomingRelationships')
        .filter((rel: any) => rel.id !== null);
      
      return res.status(200).json({
        id: node.identity.toString(),
        labels: node.labels,
        properties: node.properties,
        relationships: {
          outgoing: outgoingRelationships,
          incoming: incomingRelationships
        }
      });
    } catch (error: any) {
      console.error('Erro ao obter nó:', error);
      return res.status(500).json({ error: error.message || 'Erro ao obter nó' });
    }
  }
  
  // PUT - atualizar propriedades de um nó
  if (req.method === 'PUT') {
    try {
      const { properties, addLabels, removeLabels } = req.body;
      
      if (!properties || typeof properties !== 'object') {
        return res.status(400).json({ error: 'Propriedades inválidas' });
      }
      
      // Verificar se o nó existe
      const checkQuery = `
        MATCH (n)
        WHERE id(n) = $id
        RETURN n
      `;
      
      const checkResult = await neo4jService.executeQuery(checkQuery, { id: parseInt(id, 10) });
      
      if (!checkResult.success || !checkResult.results || checkResult.results.length === 0) {
        return res.status(404).json({ error: 'Nó não encontrado' });
      }
      
      // Atualizar propriedades
      let query = `
        MATCH (n)
        WHERE id(n) = $id
        SET n = $properties
      `;
      
      // Adicionar labels se especificados
      if (addLabels && Array.isArray(addLabels) && addLabels.length > 0) {
        const labelString = addLabels.map(label => `:${label}`).join('');
        query += `
        SET n${labelString}
        `;
      }
      
      // Remover labels se especificados
      if (removeLabels && Array.isArray(removeLabels) && removeLabels.length > 0) {
        const removeLabelsStatements = removeLabels.map(label => `REMOVE n:${label}`).join('\n');
        query += `
        ${removeLabelsStatements}
        `;
      }
      
      query += `
        RETURN n
      `;
      
      const result = await neo4jService.executeQuery(query, { 
        id: parseInt(id, 10),
        properties
      });
      
      if (!result.success || !result.results || result.results.length === 0) {
        return res.status(500).json({ error: 'Erro ao atualizar o nó' });
      }
      
      const node = result.results[0].get('n');
      
      return res.status(200).json({
        id: node.identity.toString(),
        labels: node.labels,
        properties: node.properties
      });
    } catch (error: any) {
      console.error('Erro ao atualizar nó:', error);
      return res.status(500).json({ error: error.message || 'Erro ao atualizar nó' });
    }
  }
  
  // DELETE - excluir um nó
  if (req.method === 'DELETE') {
    try {
      // Verificar se o nó existe
      const checkQuery = `
        MATCH (n)
        WHERE id(n) = $id
        RETURN n
      `;
      
      const checkResult = await neo4jService.executeQuery(checkQuery, { id: parseInt(id, 10) });
      
      if (!checkResult.success || !checkResult.results || checkResult.results.length === 0) {
        return res.status(404).json({ error: 'Nó não encontrado' });
      }
      
      // Opcionalmente, deletar também as relações (parâmetro detachDelete)
      const detachDelete = req.query.detachDelete === 'true';
      
      const query = detachDelete
        ? `MATCH (n) WHERE id(n) = $id DETACH DELETE n`
        : `MATCH (n) WHERE id(n) = $id DELETE n`;
      
      try {
        await neo4jService.executeQuery(query, { id: parseInt(id, 10) });
        return res.status(200).json({ message: 'Nó excluído com sucesso' });
      } catch (error: any) {
        // Se falhar na exclusão sem DETACH, provavelmente há relações
        if (!detachDelete && error.message.includes('still has relationships')) {
          return res.status(409).json({ 
            error: 'O nó possui relacionamentos e não pode ser excluído. Use detachDelete=true para excluir o nó e seus relacionamentos.'
          });
        }
        throw error;
      }
    } catch (error: any) {
      console.error('Erro ao excluir nó:', error);
      return res.status(500).json({ error: error.message || 'Erro ao excluir nó' });
    }
  }
  
  // Método não permitido
  return res.status(405).json({ error: 'Método não permitido' });
} 