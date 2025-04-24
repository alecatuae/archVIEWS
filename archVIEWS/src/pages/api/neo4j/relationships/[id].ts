import type { NextApiRequest, NextApiResponse } from 'next';
import { neo4jService } from '@/services/neo4jService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'ID de relacionamento inválido' });
  }

  const relationshipId = parseInt(id, 10);
  if (isNaN(relationshipId)) {
    return res.status(400).json({ error: 'ID de relacionamento deve ser um número' });
  }

  // GET - Obter um relacionamento específico
  if (req.method === 'GET') {
    try {
      const query = `
        MATCH (source)-[r]->(target)
        WHERE id(r) = $relationshipId
        RETURN r, source, target
      `;

      const result = await neo4jService.executeQuery(query, { relationshipId });

      if (result.records.length === 0) {
        return res.status(404).json({ error: 'Relacionamento não encontrado' });
      }

      // Formatar a resposta
      const record = result.records[0];
      const rel = record.get('r');
      const source = record.get('source');
      const target = record.get('target');

      return res.status(200).json({
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
      console.error('Erro ao buscar relacionamento:', error);
      return res.status(500).json({ error: error.message || 'Erro ao buscar relacionamento' });
    }
  }

  // PUT - Atualizar propriedades de um relacionamento
  if (req.method === 'PUT') {
    try {
      const { properties } = req.body;

      if (!properties || typeof properties !== 'object') {
        return res.status(400).json({ error: 'Propriedades inválidas' });
      }

      // Verificar se o relacionamento existe
      const checkQuery = `
        MATCH ()-[r]->()
        WHERE id(r) = $relationshipId
        RETURN r
      `;

      const checkResult = await neo4jService.executeQuery(checkQuery, { relationshipId });

      if (checkResult.records.length === 0) {
        return res.status(404).json({ error: 'Relacionamento não encontrado' });
      }

      // Atualizar as propriedades
      const updateQuery = `
        MATCH (source)-[r]->(target)
        WHERE id(r) = $relationshipId
        SET r += $properties
        RETURN r, source, target
      `;

      const updateResult = await neo4jService.executeQuery(updateQuery, { 
        relationshipId, 
        properties 
      });

      // Formatar a resposta
      const record = updateResult.records[0];
      const rel = record.get('r');
      const source = record.get('source');
      const target = record.get('target');

      return res.status(200).json({
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
      console.error('Erro ao atualizar relacionamento:', error);
      return res.status(500).json({ error: error.message || 'Erro ao atualizar relacionamento' });
    }
  }

  // DELETE - Excluir um relacionamento
  if (req.method === 'DELETE') {
    try {
      // Verificar se o relacionamento existe
      const checkQuery = `
        MATCH ()-[r]->()
        WHERE id(r) = $relationshipId
        RETURN r
      `;

      const checkResult = await neo4jService.executeQuery(checkQuery, { relationshipId });

      if (checkResult.records.length === 0) {
        return res.status(404).json({ error: 'Relacionamento não encontrado' });
      }

      // Excluir o relacionamento
      const deleteQuery = `
        MATCH ()-[r]->()
        WHERE id(r) = $relationshipId
        DELETE r
        RETURN count(r) AS deleted
      `;

      const deleteResult = await neo4jService.executeQuery(deleteQuery, { relationshipId });
      const deleted = deleteResult.records[0].get('deleted').toNumber();

      if (deleted === 0) {
        return res.status(500).json({ error: 'Falha ao excluir relacionamento' });
      }

      return res.status(200).json({ 
        message: 'Relacionamento excluído com sucesso',
        id: relationshipId.toString()
      });
    } catch (error: any) {
      console.error('Erro ao excluir relacionamento:', error);
      return res.status(500).json({ error: error.message || 'Erro ao excluir relacionamento' });
    }
  }

  // Método não permitido
  return res.status(405).json({ error: 'Método não permitido' });
} 