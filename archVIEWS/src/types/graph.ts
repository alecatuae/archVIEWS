// Graph Data Types
export interface NodeProperties {
  id?: string;
  name?: string;
  category?: string;
  type?: string;
  description?: string;
  environment?: string;
  status?: string;
  owner?: string;
  language?: string;
  version?: string;
  size?: number;
  iops?: number;
  bandwidth?: string;
  [key: string]: any;
}

export interface EdgeProperties {
  id?: string;
  description?: string;
  criticality?: string;
  direction?: string;
  protocol?: string;
  port?: string;
  frequency?: string;
  type?: string;
  retention?: string;
  size?: number;
  iops?: number;
  bandwidth?: string;
  resources?: string;
  [key: string]: any;
}

export interface Node {
  id: string;
  labels: string[];
  properties: NodeProperties;
}

export interface Edge {
  id: string;
  type: string;
  source: string;
  target: string;
  properties: EdgeProperties;
}

export interface GraphData {
  nodes: Node[];
  edges: Edge[];
}

// Cytoscape Format Types
export interface CytoscapeNode {
  data: {
    id: string;
    label: string;
    properties: NodeProperties;
    category?: string;
  };
  classes?: string;
  position?: { x: number; y: number };
}

export interface CytoscapeEdge {
  data: {
    id: string;
    source: string;
    target: string;
    label: string;
    properties: EdgeProperties;
  };
  classes?: string;
}

export interface CytoscapeGraphData {
  nodes: CytoscapeNode[];
  edges: CytoscapeEdge[];
}

// Relationship Type Colors
export const relationshipColors: Record<string, string> = {
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