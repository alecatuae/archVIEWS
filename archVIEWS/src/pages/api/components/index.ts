import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case 'GET':
      return getComponents(req, res);
    case 'POST':
      return createComponent(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getComponents(req: NextApiRequest, res: NextApiResponse) {
  try {
    const components = await prisma.component.findMany({
      orderBy: {
        updatedAt: 'desc'
      },
      include: {
        team: {
          select: {
            name: true
          }
        }
      }
    });

    return res.status(200).json(components);
  } catch (error: any) {
    console.error('Error fetching components:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch components' });
  }
}

async function createComponent(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { name, description, category, environment, type, owner, teamId } = req.body;

    if (!name || !category || !environment) {
      return res.status(400).json({ error: 'Name, category, and environment are required' });
    }

    // Criar um ID único para o componente
    const id = uuidv4();

    // Informações básicas do nó para o Neo4j
    const nodeProperties = {
      name,
      category,
      environment,
      type: type || category,
      owner: owner || 'Não especificado',
    };

    // Primeiro, criar o nó no Neo4j
    // Esta seria uma chamada para o serviço Neo4j para criar o nó
    // Simulando uma resposta
    const neo4jNodeId = `node-${id}`;

    // Em seguida, criar o registro no MariaDB usando Prisma
    const component = await prisma.component.create({
      data: {
        id,
        name,
        description: description || null,
        category,
        neo4jNodeId,
        teamId: teamId ? parseInt(teamId) : null,
      }
    });

    return res.status(201).json(component);
  } catch (error: any) {
    console.error('Error creating component:', error);
    return res.status(500).json({ error: error.message || 'Failed to create component' });
  }
} 