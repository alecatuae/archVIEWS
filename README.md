# archVIEWS - Visualização de Arquitetura

archVIEWS é uma aplicação para visualização e gerenciamento de arquitetura de sistemas, utilizando Neo4j e MariaDB como banco de dados.

## Requisitos

- Docker e Docker Compose
- Node.js 18 ou superior (apenas para desenvolvimento local)

## Instruções de Uso

### Opção 1: Execução Rápida (com Docker)

Clone o repositório e execute o script de bootstrap:

```bash
git clone <URL-DO-REPOSITORIO>
cd archVIEWS
chmod +x BOOTSTRAP.sh  # Se necessário
./BOOTSTRAP.sh
```

Este script irá:
1. Verificar os pré-requisitos (Docker e Docker Compose)
2. Criar e configurar os arquivos necessários
3. Iniciar todos os containers Docker
4. Executar migrações e seed de dados
5. Iniciar a aplicação na porta 8081

### Opção 2: Execução Manual com Docker Compose

1. Clone o repositório:
   ```bash
   git clone <URL-DO-REPOSITORIO>
   cd archVIEWS
   ```

2. Inicie os containers:
   ```bash
   docker-compose up -d
   ```

3. Acesse a aplicação:
   - App: http://localhost:8081
   - Neo4j Browser: http://localhost:7474 (usuário: neo4j, senha: password)
   - Adminer: http://localhost:8080 (sistema: MySQL, servidor: mariadb, usuário: archview_user, senha: password, banco: archview)

## Estrutura de Dados

O sistema utiliza duas bases de dados:

1. **Neo4j**: Armazena os componentes de infraestrutura e suas relações em formato de grafo
2. **MariaDB**: Armazena informações sobre usuários, equipes, e registros de conformidade

## Estrutura do Projeto

```
archVIEWS/
├── docker-compose.yml    # Configuração dos containers Docker
├── Dockerfile            # Configuração para build da aplicação
├── BOOTSTRAP.sh          # Script de inicialização automática
├── archVIEWS/            # Código fonte da aplicação
│   ├── src/              # Código principal
│   ├── prisma/           # Esquema e migrações do banco de dados
│   └── package.json      # Dependências
```

## Solução de Problemas

### Porta 3306 já em uso

Se a porta 3306 já estiver em uso por outro serviço (como MySQL ou MariaDB local), você pode:

1. Parar o serviço local:
   ```bash
   sudo service mysql stop   # Linux
   sudo brew services stop mysql  # macOS com Homebrew
   ```

2. Ou modificar a porta no arquivo docker-compose.yml:
   ```yaml
   mariadb:
     ports:
       - "3307:3306"  # Use 3307 localmente
   ```

### Outros problemas

Verifique os logs dos containers:
```bash
docker logs archview-app
docker logs archview-mariadb
docker logs archview-neo4j
```

## Acessos

- **Aplicação**: http://localhost:8081
- **Neo4j Browser**: http://localhost:7474
  - Usuário: neo4j
  - Senha: password
- **Adminer** (gerenciador de banco de dados): http://localhost:8080
  - Sistema: MySQL
  - Servidor: mariadb (ou localhost se não estiver usando Docker)
  - Usuário: archview_user
  - Senha: password
  - Banco: archview 