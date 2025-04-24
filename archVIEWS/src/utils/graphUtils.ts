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

export default {
  transformToCytoscapeFormat,
  getRelationshipColor,
  formatNodeLabel,
  formatEdgeLabel,
  getCytoscapeStylesheet,
  processNeo4jResponse
}; 