import { GraphData, CytoscapeGraphData, Node, Edge, relationshipColors } from '@/types/graph';

export function transformToCytoscapeFormat(data: GraphData): CytoscapeGraphData {
  const cytoscapeNodes = data.nodes.map(node => ({
    data: {
      id: node.id,
      label: node.properties.name || node.labels[0] || 'Node',
      properties: node.properties,
      category: node.properties.category || 'NA'
    },
    classes: node.labels.join(' ').toLowerCase()
  }));

  const cytoscapeEdges = data.edges.map(edge => ({
    data: {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.type,
      properties: edge.properties
    },
    classes: edge.type.toLowerCase()
  }));

  return {
    nodes: cytoscapeNodes,
    edges: cytoscapeEdges
  };
}

export function getRelationshipColor(type: string): string {
  return relationshipColors[type] || relationshipColors.default;
}

export function formatNodeLabel(node: Node): string {
  if (!node.properties) return 'Unknown Node';
  
  const { name, category, type } = node.properties;
  let label = name || 'Unknown';
  
  if (category) {
    label += ` (${category})`;
  }
  if (type && type !== category) {
    label += ` - ${type}`;
  }
  
  return label;
}

export function formatEdgeLabel(edge: Edge): string {
  if (!edge.properties) return edge.type || 'Unknown Relationship';
  
  const { description } = edge.properties;
  let label = edge.type || 'Relationship';
  
  if (description) {
    label += `: ${description}`;
  }
  
  return label;
}

export function getCytoscapeStylesheet() {
  return [
    {
      selector: 'node',
      style: {
        'label': 'data(label)',
        'background-color': '#6b48ff',
        'width': 50,
        'height': 50,
        'text-valign': 'center',
        'text-halign': 'center',
        'text-outline-width': 2,
        'text-outline-color': '#ffffff',
        'font-size': 12,
        'color': '#000000'
      }
    },
    {
      selector: 'node.ic',
      style: {
        'background-color': '#6b48ff' // computing-purple
      }
    },
    {
      selector: 'node.application',
      style: {
        'background-color': '#6b48ff' // computing-purple
      }
    },
    {
      selector: 'node.database',
      style: {
        'background-color': '#0897e9' // storage-blue
      }
    },
    {
      selector: 'node.storage',
      style: {
        'background-color': '#0897e9' // storage-blue
      }
    },
    {
      selector: 'node.network',
      style: {
        'background-color': '#0adbe3' // network-blue
      }
    },
    {
      selector: 'edge',
      style: {
        'width': 3,
        'line-color': '#363636', // neutral-gray
        'target-arrow-color': '#363636',
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier',
        'label': 'data(label)',
        'font-size': 10,
        'text-outline-width': 2,
        'text-outline-color': '#ffffff'
      }
    },
    {
      selector: 'edge.depends_on',
      style: {
        'line-color': '#feac0e', // dependency-orange
        'target-arrow-color': '#feac0e'
      }
    },
    {
      selector: 'edge.communicates_with',
      style: {
        'line-color': '#0adbe3', // network-blue
        'target-arrow-color': '#0adbe3'
      }
    },
    {
      selector: 'edge.stores_data_in',
      style: {
        'line-color': '#0897e9', // storage-blue
        'target-arrow-color': '#0897e9'
      }
    },
    {
      selector: 'edge.network',
      style: {
        'line-color': '#0adbe3', // network-blue
        'target-arrow-color': '#0adbe3'
      }
    },
    {
      selector: 'edge.computing',
      style: {
        'line-color': '#6b48ff', // computing-purple
        'target-arrow-color': '#6b48ff'
      }
    },
    {
      selector: 'edge.storage',
      style: {
        'line-color': '#0897e9', // storage-blue
        'target-arrow-color': '#0897e9'
      }
    },
    {
      selector: 'edge.uses',
      style: {
        'line-color': '#0897e9', // storage-blue
        'target-arrow-color': '#0897e9'
      }
    },
    {
      selector: 'edge.contains',
      style: {
        'line-color': '#363636', // neutral-gray
        'target-arrow-color': '#363636'
      }
    },
    {
      selector: ':selected',
      style: {
        'background-color': '#feac0e',
        'line-color': '#feac0e',
        'target-arrow-color': '#feac0e',
        'source-arrow-color': '#feac0e',
        'text-outline-color': '#feac0e'
      }
    }
  ];
}

export function processNeo4jResponse(response: any): GraphData {
  if (!response.success || !response.results) {
    return { nodes: [], edges: [] };
  }

  const uniqueNodes = new Map<string, Node>();
  const uniqueEdges = new Map<string, Edge>();

  response.results.forEach((record: any) => {
    // Process nodes
    if (record.n) {
      const nodeN = processNeo4jNode(record.n);
      if (nodeN) uniqueNodes.set(nodeN.id, nodeN);
    }
    if (record.m) {
      const nodeM = processNeo4jNode(record.m);
      if (nodeM) uniqueNodes.set(nodeM.id, nodeM);
    }

    // Process relationships
    if (record.r && record.n && record.m) {
      const edge = processNeo4jRelationship(record.r, record.n, record.m);
      if (edge) uniqueEdges.set(edge.id, edge);
    }
  });

  return {
    nodes: Array.from(uniqueNodes.values()),
    edges: Array.from(uniqueEdges.values())
  };
}

function processNeo4jNode(nodeData: any): Node | null {
  if (!nodeData) return null;

  try {
    const node: Node = {
      id: nodeData.identity.toString(),
      labels: nodeData.labels,
      properties: nodeData.properties
    };
    return node;
  } catch (error) {
    console.error('Error processing Neo4j node:', error);
    return null;
  }
}

function processNeo4jRelationship(relData: any, sourceNode: any, targetNode: any): Edge | null {
  if (!relData || !sourceNode || !targetNode) return null;

  try {
    const edge: Edge = {
      id: relData.identity.toString(),
      type: relData.type,
      source: sourceNode.identity.toString(),
      target: targetNode.identity.toString(),
      properties: relData.properties
    };
    return edge;
  } catch (error) {
    console.error('Error processing Neo4j relationship:', error);
    return null;
  }
}

// Função para formatar texto de label (transformar de SNAKE_CASE para Texto Legível)
export function formatLabelText(text: string): string {
  if (!text) return '';
  
  // Substitui underscores por espaços e capitaliza cada palavra
  return text
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .trim();
}

// Get a formatted display label for a node
export function getNodeDisplayLabel(node: any): string {
  if (!node) return '';
  
  // Try to get name from properties
  if (node.properties?.name) {
    return node.properties.name;
  }
  
  // Try to get label from labels array
  if (node.labels && node.labels.length > 0) {
    // Format the label to be more readable (remove underscores, capitalize words)
    return formatLabelText(node.labels[0]);
  }
  
  // If node has a type property
  if (node.type) {
    return formatLabelText(node.type);
  }
  
  // Fallback to id
  return node.id ? `Node ${node.id.substring(0, 8)}...` : 'Unknown Node';
}

/**
 * Formata o valor de uma propriedade para exibição na interface
 * @param value Valor da propriedade
 * @returns Valor formatado como string
 */
export function formatPropertyValue(value: any): string {
  if (value === null || value === undefined) {
    return '-';
  }
  
  if (typeof value === 'boolean') {
    return value ? 'Sim' : 'Não';
  }
  
  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      return value.length > 0 ? value.join(', ') : '-';
    }
    try {
      return JSON.stringify(value);
    } catch (e) {
      return '[Objeto complexo]';
    }
  }
  
  return String(value);
}

/**
 * Ordena as propriedades de um objeto para exibição na interface
 * @param properties Objeto de propriedades
 * @returns Array de tuplas [chave, valor] ordenadas
 */
export function getSortedProperties(properties: Record<string, any> | null | undefined): [string, any][] {
  if (!properties) return [];
  
  // Propriedades prioritárias que sempre devem aparecer primeiro (se existirem)
  const priorityProps = ['name', 'type', 'category', 'description', 'status', 'environment'];
  
  // Filtrar propriedades que não devem ser exibidas
  const excludeProps = ['id', 'labels', 'identity', 'elementId'];
  const filteredEntries = Object.entries(properties).filter(
    ([key]) => !excludeProps.includes(key)
  );
  
  // Separar as propriedades prioritárias
  const priorityEntries: [string, any][] = [];
  const regularEntries: [string, any][] = [];
  
  filteredEntries.forEach(entry => {
    if (priorityProps.includes(entry[0])) {
      priorityEntries.push(entry);
    } else {
      regularEntries.push(entry);
    }
  });
  
  // Ordenar as propriedades prioritárias na ordem definida
  priorityEntries.sort((a, b) => {
    return priorityProps.indexOf(a[0]) - priorityProps.indexOf(b[0]);
  });
  
  // Ordenar as propriedades regulares em ordem alfabética
  regularEntries.sort((a, b) => a[0].localeCompare(b[0]));
  
  // Juntar os arrays e retornar
  return [...priorityEntries, ...regularEntries];
}

export default {
  transformToCytoscapeFormat,
  getRelationshipColor,
  formatNodeLabel,
  formatEdgeLabel,
  getCytoscapeStylesheet,
  processNeo4jResponse,
  getNodeDisplayLabel,
  formatLabelText,
  formatPropertyValue,
  getSortedProperties
}; 