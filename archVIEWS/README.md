# archView

Visualização gráfica de componentes de arquitetura e suas interdependências.

## Descrição

archView é uma aplicação web de visualização de grafos para componentes de arquitetura e suas interdependências. O sistema permite consultar, visualizar e interagir com a estrutura de componentes de software e hardware armazenados em um banco de dados Neo4j, fornecendo uma interface gráfica interativa para arquitetos de soluções e equipes de operação entenderem o impacto das alterações na infraestrutura.

## Requisitos

- Node.js 18+ LTS
- MariaDB 10.6+
- Neo4j 4.4+

## Instalação

1. Clone o repositório:
```
git clone <url-do-repositorio>
cd archviews
```

2. Instale as dependências:
```
npm install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env.local` na raiz do projeto com o seguinte conteúdo:
```
NEO4J_URI=neo4j://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=seu_password
NEO4J_DATABASE=archview
DATABASE_URL="mysql://archview_user:seu_password@localhost:3306/archview"
```

4. Inicialize o banco de dados MariaDB:
```
npx prisma migrate dev
```

5. Inicie o servidor de desenvolvimento:
```
npm run dev
```

6. Acesse a aplicação em seu navegador:
```
http://localhost:3000
```

## Estrutura do Projeto

- `src/components`: Componentes React da aplicação
  - `graph`: Componentes de visualização de grafos
  - `layout`: Componentes de layout
  - `ui`: Componentes de interface
- `src/hooks`: Custom hooks React
- `src/pages`: Rotas do Next.js
  - `api`: API routes para comunicação com os bancos de dados
- `src/services`: Serviços de acesso a dados
- `src/styles`: Estilos globais e configurações
- `src/types`: Definições de tipos TypeScript
- `src/utils`: Funções utilitárias
- `prisma`: Configuração do Prisma ORM

## Funcionalidades

- Visualização interativa de componentes e suas dependências
- Filtragem por ambiente (produção, staging, desenvolvimento)
- Detalhamento de componentes e relacionamentos
- Roadmap & Lifecycle de componentes
- Log de decisões arquiteturais (ADR)
- Relatórios de impacto e análise de riscos

## Tecnologias

- **Frontend**: React.js, Next.js, TailwindCSS
- **Visualização**: Cytoscape.js
- **Banco de Dados**: Neo4j (grafo), MariaDB (relacional)
- **ORM**: Prisma

## Licença

Este projeto é de uso privado e não possui licença open source. 