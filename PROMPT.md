# archView - Prompt para Reconstrução via IA

## Visão Geral do Projeto

Você deve criar uma aplicação web completa chamada "archView" para visualização e gerenciamento de arquitetura de componentes de TI. Esta aplicação permite aos arquitetos de soluções e equipes de operação visualizar graficamente as interdependências entre componentes de software e hardware de um ambiente, facilitando a análise de impacto para mudanças.

O objetivo é uma interface web responsiva e interativa que apresente os componentes como nós em um grafo, com os relacionamentos como arestas entre eles. Os usuários devem poder consultar, filtrar, navegar e analisar estes componentes e suas relações.

## Stack Tecnológica

Construa o projeto usando:

- **Framework Frontend**: React 18+ com Next.js 13+
- **Estilização**: TailwindCSS com design responsivo
- **Visualização de Grafos**: Cytoscape.js com plugin cola para layout
- **Bancos de Dados**:
  - Neo4j (armazenamento principal de grafos)
  - MariaDB (dados auxiliares, logs, usuários, configurações)
- **Linguagem**: TypeScript
- **Comunicação com Backend**: Endpoints API do Next.js
- **ORM**: Prisma para MariaDB
- **Autenticação**: Sistema básico com login/senha

## Estrutura de Dados

### Neo4j (Grafo)

#### Nós (Componentes)
Implemente os seguintes tipos de nós com as propriedades listadas:

1. **IC** (Infraestrutura de Computação)
   - id (string): Identificador único
   - name (string): Nome do componente
   - category (string): Categoria do componente (Server, Container, VM, etc.)
   - type (string): Tipo específico
   - description (string): Descrição textual
   - environment (string): Ambiente (Prod, Dev, Test)
   - status (string): Status operacional
   - owner (string): Equipe responsável

2. **Application**
   - id, name, category, description, owner (como acima)
   - language (string): Linguagem de desenvolvimento
   - version (string): Versão atual

3. **Database**
   - id, name, category, description, status (como acima)
   - type (string): Tipo de banco (SQL, NoSQL, etc.)
   - version (string): Versão do banco
   - size (number): Tamanho em GB

4. **Storage**
   - id, name, category, description, status (como acima)
   - type (string): Tipo de armazenamento
   - size (number): Capacidade total
   - iops (number): Performance de IO

5. **Network**
   - id, name, category, description, status (como acima)
   - type (string): Tipo de componente de rede
   - bandwidth (string): Capacidade de banda

#### Relacionamentos
Implemente os seguintes tipos de relacionamentos:

1. **DEPENDS_ON**: Dependência geral entre componentes
   - Propriedades: id, description, criticality, direction

2. **COMMUNICATES_WITH**: Comunicação de rede entre componentes
   - Propriedades: id, protocol, port, frequency, description

3. **STORES_DATA_IN**: Armazenamento de dados
   - Propriedades: id, size, type, retention, description

4. **USES**: Utilização de recursos
   - Propriedades: id, description, frequency, criticality

5. **CONTAINS**: Relação de contêiner
   - Propriedades: id, description, type

6. **NETWORK**: Conexão de rede específica
   - Propriedades: id, bandwidth, protocol, description

7. **STORAGE**: Conexão de armazenamento
   - Propriedades: id, size, iops, description

8. **COMPUTING**: Conexão de recursos computacionais
   - Propriedades: id, resources, description

### MariaDB (Relacional)

Implemente as seguintes tabelas via Prisma:

1. **User**: Usuários do sistema
   - id (int, auto-increment): Identificador único
   - email (string, unique): Email do usuário
   - name (string): Nome completo
   - role (string): Papel no sistema (USER, ADMIN)
   - password (string): Senha criptografada
   - teamId (int, opcional): Referência à equipe
   - createdAt, updatedAt: Timestamps

2. **Team**: Equipes responsáveis por componentes
   - id (int, auto-increment): Identificador único
   - name (string): Nome da equipe
   - description (string, opcional): Descrição da equipe
   - createdAt, updatedAt: Timestamps

3. **Component**: Metadados adicionais dos componentes (linked com Neo4j)
   - id (string): Identificador correspondente ao Neo4j
   - name (string): Nome do componente
   - description (string, opcional): Descrição
   - category (string): Categoria
   - neo4jNodeId (string, unique): ID do nó no Neo4j
   - teamId (int, opcional): Equipe responsável
   - complianceId (int, opcional): Requisitos de conformidade
   - createdAt, updatedAt: Timestamps

4. **Compliance**: Requisitos de conformidade
   - id (int, auto-increment): Identificador único 
   - name (string): Nome do requisito
   - description (string, opcional): Descrição
   - level (string): Nível de conformidade
   - createdAt, updatedAt: Timestamps

5. **Log**: Registros de atividades
   - id (int, auto-increment): Identificador único
   - action (string): Ação realizada
   - description (string, opcional): Descrição
   - entity (string): Entidade afetada
   - entityId (string): ID da entidade
   - userId (int): Usuário que realizou a ação
   - componentId (string, opcional): Componente afetado
   - createdAt: Timestamp

6. **Report**: Relatórios salvos
   - id (int, auto-increment): Identificador único
   - name (string): Nome do relatório
   - description (string, opcional): Descrição
   - query (string): Consulta a ser executada
   - format (string): Formato de saída
   - schedule (string, opcional): Agendamento
   - lastRun (datetime, opcional): Última execução
   - createdAt, updatedAt: Timestamps

7. **Configuration**: Configurações do sistema
   - id (int, auto-increment): Identificador único
   - key (string, unique): Chave de configuração
   - value (string): Valor
   - createdAt, updatedAt: Timestamps

## Requisitos de Interface

### Esquema de Cores
Utilize a seguinte paleta de cores:

```
#0adbe3 - Azul claro (Elementos de rede)
#0897e9 - Azul (Elementos de storage)
#363636 - Cinza escuro (Texto e elementos neutros)
#6b48ff - Roxo (Elementos de computação)
#feac0e - Laranja (Elementos de dependência)
#ffffff - Branco (Backgrounds)
#ededed - Cinza claro (Backgrounds alternativos)
```

### Páginas Principais

1. **Visualização de Arquitetura** (Página principal)
   - Grafo interativo ocupando a maior parte da tela
   - Painel lateral (30% da largura) para detalhes e filtros
   - Controles de zoom e navegação
   - Tabela de relacionamentos abaixo do grafo
   - Botões para exportar visualização

2. **Administração**
   - Interface para gerenciamento de usuários, equipes, conformidade
   - Formulários de criação/edição
   - Tabelas de listagem com paginação

3. **Relatórios**
   - Página para visualização e exportação de relatórios
   - Filtros para configuração de consultas
   - Gráficos estatísticos e tabelas

### Componentes Específicos

#### GraphVisualization
Este é o componente principal que exibe o grafo dos componentes. Deve:

- Renderizar nós (componentes) e arestas (relacionamentos) usando Cytoscape.js
- Aplicar esquema visual com ícones diferentes para cada categoria de nó
- Colorir arestas de acordo com o tipo de relacionamento
- Permitir zoom, pan e seleção de elementos
- Atualizar o painel de detalhes quando um elemento é selecionado
- Suportar filtros por tipo de nó e relacionamento
- Exportar a visualização como imagem

```tsx
interface GraphVisualizationProps {
  data: GraphData;
  isLoading?: boolean;
  onDataUpdate?: (graphData: GraphData) => void;
}

const GraphVisualization: React.FC<GraphVisualizationProps> = ({...}) => {
  // Implemente o componente aqui
}
```

#### GraphSidebar
Painel lateral que exibe detalhes do elemento selecionado:

- Propriedades do nó ou relacionamento
- Estatísticas do grafo atual
- Filtros aplicáveis
- Ações disponíveis para o elemento selecionado

#### RelationshipTable
Tabela que exibe os relacionamentos no grafo:

- Colunas: Origem, Tipo, Destino, Propriedades
- Paginação (20/50/100 itens)
- Ordenação por qualquer coluna
- Filtragem por texto ou propriedades

## Funcionalidades Essenciais

1. **Visualização de Grafo**
   - Renderização eficiente de grafos com centenas de nós
   - Layouts automáticos com posicionamento legível
   - Labels nos nós e arestas
   - Indicação visual do tipo de componente e relacionamento

2. **Navegação Interativa**
   - Seleção de nós e arestas com detalhamento
   - Zoom e pan na visualização
   - Centralização em elementos selecionados
   - Expandir/colapsar grupos de nós

3. **Filtragem de Dados**
   - Por tipo de componente
   - Por tipo de relacionamento
   - Por propriedades específicas
   - Por equipe responsável

4. **Pesquisa**
   - Busca por texto em nomes e propriedades
   - Resultados destacados no grafo
   - Opção de centralizar nos resultados

5. **Exportação**
   - Imagem do grafo (PNG)
   - Dados em formato CSV/JSON
   - Relatórios em PDF

6. **Administração**
   - Gerenciamento de usuários e permissões
   - Atribuição de equipes aos componentes
   - Configuração de requisitos de conformidade

7. **Consulta por Ambiente**
   - Filtro global (env=prod|stage|dev|all) que atualiza em tempo real:
     - O grafo de visualização
     - As tabelas de relacionamentos
     - Os dashboards e métricas
     - Os relatórios gerados
   - Componente de seleção persistente no topo da aplicação
   - Modificação automática dos parâmetros das consultas Neo4j
   - Atualização do estado global da aplicação

8. **Roadmap & Lifecycle**
   - CRUD de roadmap items por ambiente
   - Gerenciamento do ciclo de vida dos componentes:
     - Roll-out: Planejamento de implantação de novos componentes
     - End of Life (EoL): Registro de datas de fim de vida
     - End of Support (EoS): Registro de datas de fim de suporte
     - Depreciação: Sinalização de componentes em processo de depreciação
   - Visualização estilo Gantt com:
     - Sobreposições e dependências no tempo
     - Períodos críticos de transição
     - Planejamento de migrações e atualizações
   - Implementar o seguinte modelo:
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

9. **Log de Decisões (ADR)**
   - Registro versionado de Architectural Decision Records
   - Documentação de decisões por componente ou arquitetura geral
   - Rastreamento de histórico e justificativas
   - Painel dedicado com:
     - Histórico de versões
     - Comparação entre versões
     - Filtros por data, componente e autor
     - Links para componentes afetados
   - Implementar os seguintes modelos:
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

10. **Detalhamento Narrativo**
    - Editor Markdown/WYSIWYG para documentação rica de componentes
    - Recursos do editor:
      - Suporte a formatação avançada
      - Inserção de imagens, diagramas e links
      - Seções pré-definidas para SLAs, dependências e owners
      - Histórico de versões e controle de alterações
    - Funcionalidades adicionais:
      - Exportação em PDF, HTML ou Markdown
      - Templates reutilizáveis
      - Incorporação de métricas dinâmicas

11. **Relatórios**
    - Geração/exportação de relatórios sobre:
      - Componentes e suas propriedades
      - Relacionamentos e interdependências
      - Análise de riscos e pontos críticos
      - Impacto de alterações e atualizações
    - Características:
      - Formatos: CSV, PDF, JSON
      - Agendamento automático
      - Distribuição por email
      - Histórico para comparação
    - Templates predefinidos e queries personalizadas

12. **Dashboards de Risco & Impacto**
    - Heat-map de risco (score 1-25):
      - Visualização por cores de intensidade
      - Filtros por categoria e componente
      - Métricas históricas com tendências
    - Matriz de impacto:
      - Análise cruzada de componentes x categorias
      - Visualização de áreas críticas
      - Simulação de cenários de falha
      - Identificação de pontos únicos de falha
    - Fontes de dados:
      - Input manual de especialistas
      - Análise automática da topologia
      - Histórico de incidentes
      - Métricas de disponibilidade
    - Implementação com D3.js e Chart.js

## Implementação Técnica

### Neo4j

Implemente um serviço para comunicação com o Neo4j:

```tsx
// src/services/neo4jService.ts
import neo4j from 'neo4j-driver';

const driver = neo4j.driver(
  process.env.NEO4J_URI || 'neo4j://localhost:7687',
  neo4j.auth.basic(
    process.env.NEO4J_USERNAME || 'neo4j',
    process.env.NEO4J_PASSWORD || 'password'
  )
);

export async function executeQuery(query: string, params = {}) {
  const session = driver.session({
    database: process.env.NEO4J_DATABASE || 'neo4j'
  });

  try {
    const result = await session.run(query, params);
    return {
      success: true,
      results: result.records.map(record => {
        const recordObject: any = {};
        record.keys.forEach(key => {
          recordObject[key] = record.get(key);
        });
        return recordObject;
      })
    };
  } catch (error) {
    console.error('Neo4j query error:', error);
    return {
      success: false,
      message: error.message
    };
  } finally {
    await session.close();
  }
}
```

### Prisma/MariaDB

Configure o Prisma para conectar ao MariaDB:

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// Implemente os modelos conforme especificado acima
```

E crie um serviço para operações comuns:

```tsx
// src/services/prismaService.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default prisma;
```

### API Routes

Implemente rotas de API para:

1. **Neo4j Data**
   - GET /api/neo4j/graph - Obter todos os dados do grafo
   - POST /api/neo4j/query - Executar consulta personalizada
   - GET /api/neo4j/node/:id - Obter detalhes de um nó
   - GET /api/neo4j/relationship/:id - Obter detalhes de um relacionamento

2. **Entidades do MariaDB**
   - CRUD para User, Team, Component, Compliance, etc.
   - Autenticação e gestão de sessões

### Transformação de Dados

Implemente funções para transformar dados do Neo4j em formato compatível com Cytoscape:

```tsx
// src/utils/graphUtils.ts
import { GraphData } from '@/types/graph';

export function transformToCytoscapeFormat(data: GraphData) {
  const cytoscapeNodes = data.nodes.map(node => ({
    data: {
      id: node.id,
      label: node.properties.name || node.labels[0] || 'Node',
      properties: node.properties,
      category: node.properties.category || 'NA'
      // Adicione mais propriedades conforme necessário
    }
  }));

  const cytoscapeEdges = data.edges.map(edge => ({
    data: {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.type,
      properties: edge.properties
    }
  }));

  return {
    nodes: cytoscapeNodes,
    edges: cytoscapeEdges
  };
}
```

## Responsividade

Implemente um design responsivo que funcione bem em:

- **Desktop** (1200px+): Layout completo com todas as funcionalidades
- **Tablet** (768px-1199px): Adaptação de painéis e tamanho dos elementos
- **Mobile** (até 767px): Interface simplificada com navegação adaptada

Use as propriedades do TailwindCSS para ajustar o layout em diferentes breakpoints:

```html
<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
  <!-- Conteúdo responsivo -->
</div>
```

## Performance e Otimizações

1. **Renderização de Grafos**
   - Limite o número de nós visíveis inicialmente (máximo 100)
   - Implemente carregamento incremental para grafos grandes
   - Use memoização para evitar re-renderizações desnecessárias

2. **Consultas ao Banco**
   - Cache de consultas frequentes
   - Paginação para conjuntos grandes de dados
   - Índices apropriados no Neo4j e MariaDB

3. **Interface**
   - Lazy loading de componentes pesados
   - Otimização de imagens e assets
   - Virtual scrolling para listas longas

## Instruções para Implementação

1. **Estrutura de Arquivos**
   - Organize o código conforme a estrutura descrita
   - Separe componentes por funcionalidade
   - Use módulos para encapsular lógica relacionada

2. **Padrões de Código**
   - Use TypeScript com tipagem adequada
   - Aplique padrões de React (custom hooks, memoização)
   - Documente funções e componentes complexos

3. **Testes**
   - Implemente testes unitários para lógica crítica
   - Testes de integração para fluxos principais

4. **Deployment**
   - Configure CI/CD para build e deploy automáticos
   - Separe ambientes (dev, staging, prod)

## Exemplos de Dados

Popule o Neo4j com dados iniciais para teste, como:

- Servidores de aplicação conectados a bancos de dados
- Aplicações web com dependências de API
- Componentes de infraestrutura com relacionamentos de rede
- Bancos de dados com relacionamentos de armazenamento

## Deve criar

- bootstrap.sh – instala Node, pnpm, Neo4j & MariaDB via Docker‑Compose, cria DBs, roda migrações e inicia Next.js.
- seed.ts – popula dados iniciais (ambientes, componentes dummy, relações).
- README.md – instruções de uso one‑liner: ./bootstrap.sh.
- CHANGELOG.md - Documentar todos os passos

## Conclusão

O archView deve ser uma ferramenta poderosa para visualização e análise de arquitetura, permitindo que arquitetos e operadores entendam rapidamente as interdependências entre componentes. O sucesso do projeto depende da eficiência da visualização de grafos, da intuitividade da interface e da capacidade de representar com precisão relacionamentos complexos entre componentes. 