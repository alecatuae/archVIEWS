#!/bin/bash

# Cores para saída
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Função para exibir mensagens
print_message() {
  echo -e "${GREEN}[archView]${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}[archView]${NC} $1"
}

print_error() {
  echo -e "${RED}[archView]${NC} $1"
}

# Verificar se o Docker está instalado
check_docker() {
  if ! command -v docker &> /dev/null; then
    print_error "Docker não encontrado. Por favor, instale o Docker primeiro."
    echo "Visite https://docs.docker.com/get-docker/ para instruções de instalação."
    exit 1
  fi

  if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose não encontrado. Por favor, instale o Docker Compose primeiro."
    echo "Visite https://docs.docker.com/compose/install/ para instruções de instalação."
    exit 1
  fi
}

# Verificar se o Node.js está instalado
check_node() {
  if ! command -v node &> /dev/null; then
    print_error "Node.js não encontrado. Por favor, instale o Node.js primeiro."
    echo "Visite https://nodejs.org/ para instruções de instalação."
    exit 1
  fi

  # Verificar a versão do Node.js (precisa ser 18+)
  NODE_VERSION=$(node -v | cut -d 'v' -f2 | cut -d'.' -f1)
  if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "É necessário o Node.js versão 18 ou superior. Versão encontrada: $(node -v)"
    exit 1
  fi
}

# Criar docker-compose.yml
create_docker_compose() {
  print_message "Criando arquivo docker-compose.yml..."
  
  cat > docker-compose.yml << 'EOL'
version: '3.8'

services:
  # Neo4j Database
  neo4j:
    image: neo4j:4.4
    container_name: archview-neo4j
    ports:
      - "7474:7474"  # HTTP
      - "7687:7687"  # Bolt
    environment:
      - NEO4J_AUTH=neo4j/password
      - NEO4J_dbms_memory_pagecache_size=1G
      - NEO4J_dbms.memory.heap.initial_size=1G
      - NEO4J_dbms_memory_heap_max__size=1G
    volumes:
      - neo4j_data:/data
      - neo4j_logs:/logs
      - neo4j_import:/var/lib/neo4j/import
      - neo4j_plugins:/plugins
    networks:
      - archview-network

  # MariaDB Database
  mariadb:
    image: mariadb:10.6
    container_name: archview-mariadb
    ports:
      - "3306:3306"
    environment:
      - MYSQL_ROOT_PASSWORD=rootpassword
      - MYSQL_DATABASE=archview
      - MYSQL_USER=archview_user
      - MYSQL_PASSWORD=password
    volumes:
      - mariadb_data:/var/lib/mysql
    networks:
      - archview-network
    command: --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci

  # Adminer for database management
  adminer:
    image: adminer
    container_name: archview-adminer
    ports:
      - "8080:8080"
    networks:
      - archview-network
    depends_on:
      - mariadb

networks:
  archview-network:
    driver: bridge

volumes:
  neo4j_data:
  neo4j_logs:
  neo4j_import:
  neo4j_plugins:
  mariadb_data:
EOL

  print_message "Arquivo docker-compose.yml criado com sucesso."
}

# Iniciar os containers
start_containers() {
  print_message "Iniciando os containers Docker..."
  docker-compose up -d
  
  # Aguardar os serviços estarem prontos
  print_message "Aguardando os serviços iniciarem..."
  sleep 10
  
  # Verificar se os serviços estão rodando
  if ! docker ps | grep "archview-neo4j" > /dev/null; then
    print_error "Falha ao iniciar o container Neo4j."
    exit 1
  fi
  
  if ! docker ps | grep "archview-mariadb" > /dev/null; then
    print_error "Falha ao iniciar o container MariaDB."
    exit 1
  fi
  
  print_message "Containers Docker iniciados com sucesso."
}

# Instalar dependências do Node.js
install_dependencies() {
  print_message "Instalando dependências do Node.js..."
  npm install
  
  if [ $? -ne 0 ]; then
    print_error "Falha ao instalar dependências. Verifique se o npm está funcionando corretamente."
    exit 1
  fi
  
  print_message "Dependências instaladas com sucesso."
}

# Criar arquivo .env.local
create_env_file() {
  print_message "Criando arquivo .env.local..."
  
  cat > .env.local << 'EOL'
NEO4J_URI=neo4j://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=password
NEO4J_DATABASE=neo4j
DATABASE_URL="mysql://archview_user:password@localhost:3306/archview"
EOL

  print_message "Arquivo .env.local criado com sucesso."
}

# Executar migrações do Prisma
run_prisma_migrations() {
  print_message "Executando migrações do Prisma..."
  npx prisma migrate dev --name init
  
  if [ $? -ne 0 ]; then
    print_error "Falha ao executar migrações do Prisma."
    exit 1
  fi
  
  print_message "Migrações do Prisma executadas com sucesso."
}

# Executar seed de dados
run_seed() {
  print_message "Criando arquivo de seed de dados..."
  
  mkdir -p prisma/seed
  
  cat > prisma/seed.ts << 'EOL'
import { PrismaClient } from '@prisma/client';
import { executeQuery } from '../src/services/neo4jService';

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Iniciando seed de dados...');

  // Criar usuário de teste
  const user = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin',
      password: 'password123', // Em produção, usar hash
      role: 'ADMIN',
    },
  });

  console.log(`✅ Usuário criado: ${user.name} (${user.email})`);

  // Criar equipe de teste
  const team = await prisma.team.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Equipe de Infraestrutura',
      description: 'Responsável pela infraestrutura do sistema',
    },
  });

  console.log(`✅ Equipe criada: ${team.name}`);

  // Criar alguns registros de Compliance
  const compliance = await prisma.compliance.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'LGPD',
      description: 'Lei Geral de Proteção de Dados',
      level: 'HIGH',
    },
  });

  console.log(`✅ Compliance criado: ${compliance.name}`);

  // Criar alguns nós no Neo4j
  console.log('📊 Criando dados no Neo4j...');

  // Limpar dados existentes
  await executeQuery('MATCH (n) DETACH DELETE n');

  // Criar nós de exemplo
  const createNodesQuery = `
    // Servidores
    CREATE (server1:IC {id: 'srv-001', name: 'ApplicationServer', category: 'Server', type: 'Virtual Machine', description: 'Servidor de aplicação principal', environment: 'prod', status: 'active', owner: 'Infra Team'})
    CREATE (server2:IC {id: 'srv-002', name: 'DatabaseServer', category: 'Server', type: 'Virtual Machine', description: 'Servidor de banco de dados', environment: 'prod', status: 'active', owner: 'Infra Team'})
    CREATE (server3:IC {id: 'srv-003', name: 'DevServer', category: 'Server', type: 'Virtual Machine', description: 'Servidor de desenvolvimento', environment: 'dev', status: 'active', owner: 'Infra Team'})
    
    // Aplicações
    CREATE (app1:Application {id: 'app-001', name: 'FrontendApp', category: 'WebApp', description: 'Aplicação frontend', owner: 'Dev Team', language: 'JavaScript', version: '1.0.0'})
    CREATE (app2:Application {id: 'app-002', name: 'BackendAPI', category: 'API', description: 'API de backend', owner: 'Dev Team', language: 'Java', version: '2.1.0'})
    
    // Bancos de dados
    CREATE (db1:Database {id: 'db-001', name: 'PostgreSQL', category: 'Database', type: 'SQL', version: '13.4', description: 'Banco de dados principal', size: 500, status: 'active'})
    CREATE (db2:Database {id: 'db-002', name: 'MongoDB', category: 'Database', type: 'NoSQL', version: '5.0', description: 'Banco de dados para logs', size: 200, status: 'active'})
    
    // Storage
    CREATE (storage1:Storage {id: 'st-001', name: 'S3Bucket', category: 'ObjectStorage', type: 'Cloud', size: 1000, description: 'Armazenamento de arquivos', status: 'active'})
    
    // Network
    CREATE (net1:Network {id: 'net-001', name: 'MainLoadBalancer', category: 'LoadBalancer', type: 'Application', bandwidth: '10Gbps', description: 'Load balancer principal', status: 'active'})
    CREATE (net2:Network {id: 'net-002', name: 'Firewall', category: 'Firewall', type: 'Network', bandwidth: '10Gbps', description: 'Firewall de borda', status: 'active'})
    
    // Relacionamentos
    CREATE (app1)-[:DEPENDS_ON {id: 'rel-001', description: 'Frontend depende da API', criticality: 'high'}]->(app2)
    CREATE (app2)-[:DEPENDS_ON {id: 'rel-002', description: 'API depende do banco', criticality: 'high'}]->(db1)
    CREATE (app1)-[:RUNS_ON {id: 'rel-003', description: 'Frontend roda no servidor de aplicação'}]->(server1)
    CREATE (app2)-[:RUNS_ON {id: 'rel-004', description: 'API roda no servidor de aplicação'}]->(server1)
    CREATE (db1)-[:RUNS_ON {id: 'rel-005', description: 'PostgreSQL roda no servidor de banco'}]->(server2)
    CREATE (db2)-[:RUNS_ON {id: 'rel-006', description: 'MongoDB roda no servidor de banco'}]->(server2)
    CREATE (net1)-[:COMMUNICATES_WITH {id: 'rel-007', protocol: 'HTTPS', port: '443'}]->(app1)
    CREATE (app2)-[:STORES_DATA_IN {id: 'rel-008', description: 'Dados de log'}]->(db2)
    CREATE (app1)-[:STORES_DATA_IN {id: 'rel-009', description: 'Arquivos estáticos'}]->(storage1)
    CREATE (net2)-[:SECURES {id: 'rel-010', description: 'Protege toda a rede'}]->(net1)
  `;
  
  await executeQuery(createNodesQuery);
  
  console.log('✅ Dados de exemplo criados no Neo4j');
  console.log('🌱 Seed concluído com sucesso!');
}

seed()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
EOL

  print_message "Executando seed de dados..."
  npx ts-node prisma/seed.ts
  
  if [ $? -ne 0 ]; then
    print_warning "Falha ao executar seed de dados, mas continuando..."
  else
    print_message "Seed de dados executado com sucesso."
  fi
}

# Iniciar a aplicação Next.js
start_nextjs() {
  print_message "Iniciando a aplicação Next.js..."
  npm run dev &
  
  print_message "Aguardando a aplicação iniciar..."
  sleep 5
  
  print_message "archView está rodando!"
  print_message "Acesse http://localhost:3000 para utilizar a aplicação"
  print_message "Neo4j Browser: http://localhost:7474 (usuário: neo4j, senha: password)"
  print_message "Adminer (gerenciador de banco de dados): http://localhost:8080 (sistema: MySQL, servidor: mariadb, usuário: archview_user, senha: password, banco: archview)"
}

# Função principal
main() {
  print_message "==== Iniciando configuração do archView ===="
  
  # Verificar pré-requisitos
  check_docker
  check_node
  
  # Criar Docker Compose
  create_docker_compose
  
  # Iniciar containers
  start_containers
  
  # Instalar dependências
  install_dependencies
  
  # Criar arquivo de ambiente
  create_env_file
  
  # Executar migrações do Prisma
  run_prisma_migrations
  
  # Executar seed de dados
  run_seed
  
  # Iniciar Next.js
  start_nextjs
  
  print_message "==== Configuração do archView concluída! ===="
}

# Executar função principal
main 