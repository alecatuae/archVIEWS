# archView - Documentação de Arquitetura

## Visão Geral

archView é uma aplicação web de visualização de grafos para componentes de arquitetura e suas interdependências. O sistema permite consultar, visualizar e interagir com a estrutura de componentes de software e hardware armazenados em um banco de dados Neo4j, fornecendo uma interface gráfica interativa para arquitetos de soluções e equipes de operação entenderem o impacto das alterações na infraestrutura.

## Arquitetura do Sistema

### Arquitetura Técnica

O archView segue uma arquitetura clean com separação clara de responsabilidades, baseada em:

1. **Frontend**: Aplicação React.js com Next.js para renderização do lado do servidor e cliente
2. **Middleware**: API routes do Next.js para comunicação com os bancos de dados
3. **Backend**: Serviços de acesso a dados Neo4j e MariaDB

O sistema implementa uma arquitetura de componentes modular, onde:

- Componentes de UI são reutilizáveis e focados em responsabilidades específicas
- Serviços encapsulam a lógica de acesso a dados
- Hooks customizados gerenciam o estado e a lógica de negócios
- Utilitários fornecem funções auxiliares e transformações de dados

### Package.json

```json
{
  "name": "arch-view",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@headlessui/react": "^1.7.15",
    "@heroicons/react": "^2.0.18",
    "@prisma/client": "^4.16.1",
    "autoprefixer": "10.4.14",
    "axios": "^1.4.0",
    "cytoscape": "^3.25.0",
    "cytoscape-cola": "^2.5.1",
    "neo4j-driver": "^5.9.2",
    "next": "13.4.7",
    "postcss": "8.4.24",
    "react": "18.2.0",
    "react-cytoscapejs": "^2.0.0",
    "react-dom": "18.2.0",
    "react-error-boundary": "^4.0.10",
    "react-icons": "^4.10.1",
    "tailwindcss": "3.3.2"
  },
  "devDependencies": {
    "@types/cytoscape": "^3.19.9",
    "@types/node": "20.3.1",
    "@types/react": "18.2.14",
    "@types/react-dom": "18.2.6",
    "eslint": "8.43.0",
    "eslint-config-next": "13.4.7",
    "prisma": "^4.16.1",
    "typescript": "5.1.3"
  }
}
```

### Árvore de Dependências Principais

- **UI/Estilização**:
  - TailwindCSS - Framework CSS utilitário
  - Headlessui - Componentes UI acessíveis sem estilos
  - Heroicons - Conjunto de ícones SVG
  - React-icons - Biblioteca de ícones

- **Visualização de Grafos**:
  - Cytoscape.js - Biblioteca de visualização e análise de grafos
  - Cytoscape-cola - Plugin para layout cola/force-directed
  - React-cytoscapejs - Wrapper React para Cytoscape.js

- **Banco de Dados**:
  - Neo4j-driver - Driver oficial para Neo4j
  - Prisma - ORM para MariaDB/MySQL
  - @prisma/client - Cliente gerado pelo Prisma

- **Framework e Ferramentas**:
  - Next.js - Framework React com SSR
  - React - Biblioteca UI
  - Axios - Cliente HTTP para requisições
  - TypeScript - Superset tipado de JavaScript

## Estrutura de Diretórios

```
/
├── public/
│   ├── icons/              # Ícones para categorias de componentes
│   └── images/             # Imagens estáticas
├── prisma/
│   ├── schema.prisma       # Schema do Prisma para MariaDB
│   └── migrations/         # Migrações do banco de dados
├── src/
│   ├── components/         # Componentes React
│   │   ├── graph/          # Componentes de visualização de grafos
│   │   ├── layout/         # Componentes de layout
│   │   └── ui/             # Componentes de UI reutilizáveis
│   ├── hooks/              # Custom hooks React
│   ├── pages/              # Rotas Next.js
│   │   ├── api/            # Rotas de API Next.js
│   │   │   ├── neo4j/      # Endpoints relacionados ao Neo4j
│   │   │   └── db/         # Endpoints relacionados ao MariaDB
│   │   └── [outras páginas]
│   ├── services/           # Serviços e lógica de negócio
│   │   ├── neo4jService.ts # Serviço para Neo4j
│   │   └── prismaService.ts # Serviço para Prisma/MariaDB
│   ├── styles/             # Estilos globais
│   ├── types/              # Definições de tipos TypeScript
│   │   └── graph.ts        # Tipos para grafos
│   └── utils/              # Funções utilitárias
│       ├── categoryIcons.ts # Utilitário para ícones de categoria
│       └── graphUtils.ts   # Utilitários para manipulação de grafos
├── .env                    # Variáveis de ambiente
├── .env.local              # Variáveis de ambiente locais
├── next.config.js          # Configuração do Next.js
├── tailwind.config.js      # Configuração do TailwindCSS
└── tsconfig.json           # Configuração do TypeScript
```

## Estrutura da Aplicação

### Componentes Principais

1. **GraphVisualization.tsx**: Componente central para visualização de grafos usando Cytoscape
2. **GraphSidebar.tsx**: Barra lateral com detalhes do nó ou aresta selecionada
3. **RelationshipTable.tsx**: Tabela de relacionamentos entre componentes
4. **NodeDetailsPanel.tsx**: Painel de detalhes para nós selecionados
5. **Layout.tsx**: Componente de layout principal com barra de navegação

### Fluxo de Dados

1. O usuário acessa uma página que contém o componente `GraphVisualization`
2. O componente carrega dados do Neo4j através dos serviços Neo4j ou API routes
3. Os dados são transformados em formato compatível com Cytoscape.js
4. Cytoscape.js renderiza o grafo com os nós (componentes) e arestas (relacionamentos)
5. O usuário interage com o grafo, selecionando nós e arestas
6. Detalhes são exibidos nos painéis laterais e tabelas de relacionamento
7. As ações do usuário (filtros, seleções) atualizam o estado do componente e a visualização

## Schema do Neo4j

### Nós (Labels)

1. **IC** (Infraestrutura de Computação)
   - Propriedades: id, name, category, type, description, environment, status, owner

2. **Application**
   - Propriedades: id, name, category, description, owner, language, version

3. **Database**
   - Propriedades: id, name, category, type, version, description, size, status

4. **Storage**
   - Propriedades: id, name, category, type, size, iops, description, status

5. **Network**
   - Propriedades: id, name, category, type, bandwidth, description, status

### Relacionamentos (Types)

1. **DEPENDS_ON**
   - Propriedades: id, description, criticality, direction

2. **COMMUNICATES_WITH**
   - Propriedades: id, protocol, port, frequency, description

3. **STORES_DATA_IN**
   - Propriedades: id, size, type, retention, description

4. **USES**
   - Propriedades: id, description, frequency, criticality

5. **CONTAINS**
   - Propriedades: id, description, type

6. **NETWORK**
   - Propriedades: id, bandwidth, protocol, description

7. **STORAGE**
   - Propriedades: id, size, iops, description

8. **COMPUTING**
   - Propriedades: id, resources, description

### Exemplos de Consultas Cypher

```cypher
// Buscar todos os componentes e relacionamentos
MATCH (n)-[r]->(m) RETURN n, r, m LIMIT 100

// Buscar componentes por categoria
MATCH (n {category: 'Server'}) RETURN n

// Buscar relacionamentos de um componente específico
MATCH (n {name: 'ApplicationServer'})-[r]-(m) RETURN n, r, m

// Buscar componentes por label com suas relações
MATCH (n:Application)-[r]-(m) RETURN n, r, m
```

## Schema do MariaDB

### Tabelas Principais (via Prisma)

```prisma
// schema.prisma

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  role      String   @default("USER")
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  teamId    Int?
  team      Team?    @relation(fields: [teamId], references: [id])
  logs      Log[]
}

model Team {
  id          Int      @id @default(autoincrement())
  name        String
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  users       User[]
  components  Component[]
}

model Component {
  id           String   @id
  name         String
  description  String?
  category     String
  neo4jNodeId  String   @unique
  teamId       Int?
  team         Team?    @relation(fields: [teamId], references: [id])
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  complianceId Int?
  compliance   Compliance? @relation(fields: [complianceId], references: [id])
  logs         Log[]
}

model Compliance {
  id          Int         @id @default(autoincrement())
  name        String
  description String?
  level       String
  components  Component[]
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}

model Log {
  id          Int       @id @default(autoincrement())
  action      String
  description String?
  entity      String
  entityId    String
  userId      Int
  user        User      @relation(fields: [userId], references: [id])
  componentId String?
  component   Component? @relation(fields: [componentId], references: [id])
  createdAt   DateTime  @default(now())
}

model Report {
  id          Int       @id @default(autoincrement())
  name        String
  description String?
  query       String
  format      String    @default("JSON")
  schedule    String?
  lastRun     DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Configuration {
  id        Int      @id @default(autoincrement())
  key       String   @unique
  value     String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## Dados dos Bancos de Dados

### Neo4j

**Conexão:**
```
URI: neo4j://localhost:7687
Database: archview
Authentication: Basic (Username/Password)
```

**Credenciais de Acesso:**
```
Username: neo4j
Password: (definido no .env)
```

**Variáveis de Ambiente (.env)**
```
NEO4J_URI=neo4j://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_password
NEO4J_DATABASE=archview
```

### MariaDB

**Conexão:**
```
Host: localhost
Port: 3306
Database: archview
```

**Credenciais de Acesso:**
```
Username: archview_user
Password: (definido no .env)
```

**Variáveis de Ambiente (.env)**
```
DATABASE_URL="mysql://archview_user:your_password@localhost:3306/archview"
```

## Esquema de Cores

### Paleta Principal

```
#0adbe3 - Azul claro (Elementos de rede)
#0897e9 - Azul (Elementos de storage)
#363636 - Cinza escuro (Texto e elementos neutros)
#6b48ff - Roxo (Elementos de computação)
#feac0e - Laranja (Elementos de dependência)
#ffffff - Branco (Backgrounds)
#ededed - Cinza claro (Backgrounds alternativos)
```

### Mapeamento de Cores por Tipo de Relacionamento

```javascript
const relationshipColors = {
  'NETWORK': '#0adbe3',
  'COMPUTING': '#6b48ff',
  'STORAGE': '#0897e9',
  'USES': '#0897e9',
  'DEPENDS_ON': '#feac0e',
  'COMMUNICATES_WITH': '#0adbe3',
  'STORES_DATA_IN': '#0897e9',
  'CONTAINS': '#363636',
  'SERVES': '#363636',
  'SECURES': '#363636',
  'default': '#000000'
};
```

## Descrição Detalhada do Layout das Páginas

### 1. Página Principal (Visualização de Arquitetura)

**Estrutura:**
- **Cabeçalho:** Barra de navegação com título "Visualização de Arquitetura" e botões de acesso às outras seções
- **Área Principal:** Dividida em duas seções principais:
  - **Visualização de Grafo (70%):** Componente interativo de grafo que exibe nós e arestas
  - **Barra Lateral (30%):** Detalhes do elemento selecionado e filtros

**Componentes Específicos:**
1. **Controles de Visualização:**
   - Botões de zoom (+ e -)
   - Botão de reset (retorna para a visualização completa)
   - Botão de exportação (formato PNG)

2. **Grafo Interativo:**
   - Nós com ícones representando a categoria de componente
   - Arestas coloridas de acordo com o tipo de relacionamento
   - Labels informativos em nós e arestas

3. **Barra Lateral:**
   - Detalhes do nó/aresta selecionado
   - Propriedades do componente
   - Estatísticas do grafo (número de nós, relacionamentos)
   - Filtros por tipo de nó e tipo de relacionamento

4. **Tabela de Relacionamentos:**
   - Exibida abaixo do grafo
   - Colunas: Origem, Tipo de Relacionamento, Destino, Propriedades
   - Opções de filtro e ordenação
   - Paginação (20, 50, 100 itens por página)

### 2. Página de Administração

**Estrutura:**
- **Cabeçalho:** Barra de navegação com título "Administração" e acesso às outras seções
- **Menu Lateral:** Acesso a diferentes seções administrativas
- **Área de Conteúdo:** Formulários e tabelas para gestão

**Seções:**
1. **Gestão de Usuários:**
   - Tabela de usuários com colunas: Nome, Email, Função, Equipe, Ações
   - Formulário para adicionar/editar usuários

2. **Gestão de Equipes:**
   - Tabela de equipes com colunas: Nome, Descrição, Número de Membros, Ações
   - Formulário para adicionar/editar equipes

3. **Gestão de Componentes:**
   - Tabela de componentes com colunas: Nome, Categoria, Equipe Responsável, Ações
   - Formulário para adicionar/editar componentes

4. **Logs de Sistema:**
   - Tabela de logs com colunas: Data/Hora, Usuário, Ação, Entidade, Descrição
   - Filtros por data, usuário e tipo de ação

### 3. Página de Relatórios

**Estrutura:**
- **Cabeçalho:** Barra de navegação com título "Relatórios" e acesso às outras seções
- **Área de Filtros:** Controles para configurar relatórios
- **Área de Visualização:** Resultados em tabelas, gráficos ou exportáveis

**Componentes Específicos:**
1. **Seletor de Relatórios:**
   - Dropdown com relatórios predefinidos
   - Botão para criar novo relatório

2. **Filtros de Relatório:**
   - Seleção de período
   - Filtros por categoria de componente
   - Filtros por equipe responsável

3. **Visualização de Resultados:**
   - Tabelas interativas com dados
   - Gráficos estatísticos (barras, pizza)
   - Opções de exportação (CSV, Excel, PDF)

4. **Agendamento de Relatórios:**
   - Formulário para configurar geração automática
   - Opções de periodicidade (diário, semanal, mensal)
   - Configuração de notificações por email

### Responsividade

A aplicação é projetada para funcionar em:
- **Desktop:** Layout completo com todas as funcionalidades (1200px+)
- **Tablet:** Adaptação para telas médias com reorganização de painéis (768px-1199px)
- **Mobile:** Versão simplificada com navegação adaptada e funcionalidades essenciais (320px-767px)

No modo responsivo, a aplicação:
1. Reorganiza o layout vertical/horizontal conforme necessário
2. Ajusta o tamanho e complexidade do grafo
3. Converte painéis laterais em modais ou abas
4. Adapta tabelas para exibição vertical em telas pequenas

## Requisitos de Sistema

- Node.js 18+ LTS
- MariaDB 10.6+
- Neo4j 4.4+
- Navegador moderno com suporte a ES6, CSS Grid e Flexbox 

## Funcionalidades Adicionais

### 1. Consulta por Ambiente

O sistema permite filtrar os componentes e relacionamentos por ambiente através de um filtro global. Os ambientes disponíveis são:
- Produção (prod)
- Staging (stage)
- Desenvolvimento (dev)
- Todos (all)

Este filtro atualiza em tempo real:
- O grafo de visualização
- As tabelas de relacionamentos
- Os dashboards e métricas
- Os relatórios gerados

A implementação é feita através de um componente de seleção persistente no topo da aplicação, que modifica os parâmetros das consultas Neo4j e atualiza o estado global da aplicação.

### 2. Roadmap & Lifecycle

Esta funcionalidade permite o gerenciamento do ciclo de vida dos componentes por ambiente, incluindo:

- **Roll-out**: Planejamento e acompanhamento da implantação de novos componentes
- **End of Life (EoL)**: Registro e visualização de datas de fim de vida de componentes
- **End of Support (EoS)**: Registro e visualização de datas de fim de suporte
- **Depreciação**: Sinalização de componentes em processo de depreciação

O sistema exibe estas informações em uma visualização estilo Gantt, permitindo:
- Visualizar sobreposições e dependências no tempo
- Identificar períodos críticos de transição
- Planejar migrações e atualizações

Os dados são armazenados em tabelas dedicadas no MariaDB:

```prisma
model RoadmapItem {
  id          Int       @id @default(autoincrement())
  componentId String
  component   Component @relation(fields: [componentId], references: [id])
  environment String    // prod, stage, dev
  type        String    // rollout, eol, eos, deprecation
  startDate   DateTime
  endDate     DateTime?
  description String?
  status      String    // planned, in-progress, completed
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

### 3. Log de Decisões (ADR)

O sistema implementa um registro versionado de Architectural Decision Records (ADR), permitindo:
- Documentar decisões de arquitetura por componente específico
- Registrar decisões que afetam a arquitetura geral
- Rastrear o histórico de mudanças e justificativas
- Associar decisões a requerimentos e problemas específicos

Os ADRs são exibidos em um painel dedicado, com:
- Histórico de versões
- Capacidade de comparação entre versões
- Filtros por data, componente e autor
- Links para componentes afetados no grafo

Os dados são armazenados na seguinte estrutura:

```prisma
model ADR {
  id          Int         @id @default(autoincrement())
  title       String
  status      String      // proposed, accepted, rejected, deprecated, superseded
  context     String      @db.Text
  decision    String      @db.Text
  consequences String      @db.Text
  componentId String?
  component   Component?  @relation(fields: [componentId], references: [id])
  version     Int         @default(1)
  authorId    Int
  author      User        @relation(fields: [authorId], references: [id])
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  ADRHistory  ADRHistory[]
}

model ADRHistory {
  id         Int      @id @default(autoincrement())
  adrId      Int
  adr        ADR      @relation(fields: [adrId], references: [id])
  version    Int
  title      String
  status     String
  context    String    @db.Text
  decision   String    @db.Text
  consequences String   @db.Text
  authorId   Int
  author     User     @relation(fields: [authorId], references: [id])
  createdAt  DateTime @default(now())
}
```

### 4. Detalhamento Narrativo

Esta funcionalidade fornece um editor de texto rico para documentação detalhada de cada componente:

- Suporte a formatação Markdown/WYSIWYG
- Capacidade de inserir imagens, diagramas e links
- Seções pré-definidas para SLAs, dependências e owners
- Histórico de versões e controle de alterações

O editor é integrado ao painel de detalhes dos componentes e permite:
- Exportar a documentação em formato PDF, HTML ou Markdown
- Definir partes da documentação como templates reutilizáveis
- Incorporar métricas e estatísticas dinâmicas

### 5. Relatórios

O sistema oferece geração e exportação de relatórios detalhados sobre:
- Componentes e suas propriedades
- Relacionamentos e interdependências
- Análise de riscos e pontos críticos
- Impacto de alterações e atualizações

Características dos relatórios:
- Formatos de exportação: CSV, PDF, JSON
- Agendamento automático com períodos configuráveis
- Distribuição automática por email
- Armazenamento de histórico para comparação

Os relatórios são configurados através de templates definidos no sistema ou queries personalizadas.

### 6. Dashboards de Risco & Impacto

O sistema oferece dashboards especializados para análise de risco e impacto:

**Heat-map de Risco**:
- Score de 1-25 (baseado em probabilidade e impacto)
- Visualização por cores de intensidade
- Filtros por categoria de risco e componente
- Métricas históricas com tendências

**Matriz de Impacto**:
- Análise cruzada de componentes x categorias de impacto
- Visualização de áreas críticas
- Simulação de cenários de falha
- Identificação de pontos únicos de falha

Estes dashboards são alimentados por:
- Dados definidos manualmente por especialistas
- Análise automática baseada na topologia do grafo
- Histórico de incidentes e problemas
- Métricas de disponibilidade e performance

A implementação utiliza bibliotecas de visualização como D3.js e Chart.js para renderizar gráficos interativos e responsivos. 