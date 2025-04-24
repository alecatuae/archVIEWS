// Script para popular o Neo4j com dados iniciais
const neo4j = require('neo4j-driver');

const uri = process.env.NEO4J_URI || 'neo4j://localhost:7687';
const user = process.env.NEO4J_USERNAME || 'neo4j';
const password = process.env.NEO4J_PASSWORD || 'password';

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
const session = driver.session();

async function seedDatabase() {
  try {
    console.log('Iniciando população do banco de dados Neo4j...');

    // Limpar banco de dados existente
    await session.run('MATCH (n) DETACH DELETE n');
    console.log('Banco de dados limpo.');

    // Criar nós de aplicações
    await session.run(`
      CREATE (app1:Application {
        name: 'Sistema de Vendas',
        description: 'Sistema principal de vendas da empresa',
        type: 'application',
        category: 'business',
        environment: 'production',
        status: 'active',
        owner: 'Departamento Comercial'
      })
      CREATE (app2:Application {
        name: 'Portal de Clientes',
        description: 'Portal web para acesso de clientes',
        type: 'application',
        category: 'portal',
        environment: 'production',
        status: 'active',
        owner: 'Departamento de Marketing'
      })
      CREATE (app3:Application {
        name: 'Sistema de Estoque',
        description: 'Controle de inventário e estoque',
        type: 'application',
        category: 'business',
        environment: 'production',
        status: 'active',
        owner: 'Departamento de Logística'
      })
    `);
    console.log('Nós de aplicações criados.');

    // Criar nós de bancos de dados
    await session.run(`
      CREATE (db1:Database {
        name: 'DB Vendas',
        description: 'Banco de dados principal do sistema de vendas',
        type: 'database',
        category: 'relational',
        environment: 'production',
        status: 'active',
        owner: 'Time de DBA'
      })
      CREATE (db2:Database {
        name: 'DB Clientes',
        description: 'Banco de dados com informações de clientes',
        type: 'database',
        category: 'relational',
        environment: 'production',
        status: 'active',
        owner: 'Time de DBA'
      })
    `);
    console.log('Nós de bancos de dados criados.');

    // Criar nós de servidores
    await session.run(`
      CREATE (server1:Server {
        name: 'Servidor Principal',
        description: 'Servidor de produção principal',
        type: 'server',
        category: 'physical',
        environment: 'production',
        status: 'active',
        owner: 'Infraestrutura'
      })
      CREATE (server2:Server {
        name: 'Servidor de Backup',
        description: 'Servidor para backup e redundância',
        type: 'server',
        category: 'physical',
        environment: 'production',
        status: 'active',
        owner: 'Infraestrutura'
      })
    `);
    console.log('Nós de servidores criados.');

    // Criar relacionamentos
    await session.run(`
      MATCH (app1:Application {name: 'Sistema de Vendas'})
      MATCH (app2:Application {name: 'Portal de Clientes'})
      MATCH (app3:Application {name: 'Sistema de Estoque'})
      MATCH (db1:Database {name: 'DB Vendas'})
      MATCH (db2:Database {name: 'DB Clientes'})
      MATCH (server1:Server {name: 'Servidor Principal'})
      MATCH (server2:Server {name: 'Servidor de Backup'})
      
      CREATE (app1)-[:USES {description: 'Conexão JDBC'}]->(db1)
      CREATE (app2)-[:USES {description: 'Conexão API'}]->(db2)
      CREATE (app1)-[:COMMUNICATES_WITH {description: 'API REST'}]->(app2)
      CREATE (app3)-[:USES {description: 'Conexão JDBC'}]->(db1)
      CREATE (app1)-[:COMMUNICATES_WITH {description: 'Mensageria'}]->(app3)
      CREATE (app1)-[:HOSTED_ON {description: 'Deployment principal'}]->(server1)
      CREATE (app2)-[:HOSTED_ON {description: 'Deployment principal'}]->(server1)
      CREATE (app3)-[:HOSTED_ON {description: 'Deployment principal'}]->(server1)
      CREATE (db1)-[:HOSTED_ON {description: 'Instância primária'}]->(server1)
      CREATE (db2)-[:HOSTED_ON {description: 'Instância primária'}]->(server1)
      CREATE (db1)-[:REPLICATES_TO {description: 'Backup diário'}]->(server2)
      CREATE (db2)-[:REPLICATES_TO {description: 'Backup diário'}]->(server2)
    `);
    console.log('Relacionamentos criados.');

    console.log('População do banco de dados concluída com sucesso!');
  } catch (error) {
    console.error('Erro ao popular o banco de dados:', error);
  } finally {
    await session.close();
    await driver.close();
  }
}

seedDatabase(); 