import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid component ID' });
  }

  switch (req.method) {
    case 'GET':
      return getComponent(req, res, id);
    case 'PUT':
      return updateComponent(req, res, id);
    case 'DELETE':
      return deleteComponent(req, res, id);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getComponent(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const component = await prisma.component.findUnique({
      where: { id },
      include: {
        team: {
          select: {
            id: true,
            name: true
          }
        },
        compliance: {
          select: {
            id: true,
            name: true,
            level: true
          }
        }
      }
    });

    if (!component) {
      return res.status(404).json({ error: 'Component not found' });
    }

    // Aqui poderíamos buscar informações adicionais do Neo4j
    // Simulando dados adicionais
    const additionalData = {
      neo4jProperties: {
        environment: 'dev', // Este campo viria do Neo4j
        type: component.category, // Exemplo de campo que poderia vir do Neo4j
        owner: 'Time de Desenvolvimento' // Exemplo de campo que poderia vir do Neo4j
      }
    };

    return res.status(200).json({
      ...component,
      ...additionalData
    });
  } catch (error: any) {
    console.error('Error fetching component:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch component' });
  }
}

async function updateComponent(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const { name, description, category, environment, type, owner, teamId, complianceId } = req.body;

    if (!name || !category) {
      return res.status(400).json({ error: 'Name and category are required' });
    }

    // Verificar se o componente existe
    const existingComponent = await prisma.component.findUnique({
      where: { id }
    });

    if (!existingComponent) {
      return res.status(404).json({ error: 'Component not found' });
    }

    // Atualizar o componente no banco relacional
    const updatedComponent = await prisma.component.update({
      where: { id },
      data: {
        name,
        description,
        category,
        teamId: teamId ? parseInt(teamId) : null,
        complianceId: complianceId ? parseInt(complianceId) : null,
      }
    });

    // Aqui atualizaríamos as propriedades no Neo4j também
    // Simulando uma atualização no Neo4j
    console.log(`Updating Neo4j node for component ${id} with properties:`, {
      name,
      category,
      environment,
      type: type || category,
      owner: owner || 'Não especificado',
    });

    return res.status(200).json(updatedComponent);
  } catch (error: any) {
    console.error('Error updating component:', error);
    return res.status(500).json({ error: error.message || 'Failed to update component' });
  }
}

async function deleteComponent(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    // Verificar se o componente existe
    const existingComponent = await prisma.component.findUnique({
      where: { id }
    });

    if (!existingComponent) {
      return res.status(404).json({ error: 'Component not found' });
    }

    // Primeiro excluiríamos do Neo4j, depois do banco relacional
    // Simulando exclusão do Neo4j
    console.log(`Deleting Neo4j node for component ${id}`);

    // Excluir do banco relacional
    await prisma.component.delete({
      where: { id }
    });

    return res.status(204).end();
  } catch (error: any) {
    console.error('Error deleting component:', error);
    
    // Verificar se é um erro de restrição de chave estrangeira
    if (error.code === 'P2003') {
      return res.status(400).json({ 
        error: 'Cannot delete component because it is referenced by other records' 
      });
    }
    
    return res.status(500).json({ error: error.message || 'Failed to delete component' });
  }
} 