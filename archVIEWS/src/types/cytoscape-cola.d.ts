declare module 'cytoscape-cola' {
  import cytoscape from 'cytoscape';
  
  interface ColaLayoutOptions {
    animate?: boolean;
    refresh?: number;
    maxSimulationTime?: number;
    nodeSpacing?: number;
    edgeLength?: number;
    randomize?: boolean;
    fit?: boolean;
    padding?: number;
    name?: string;
    ungrabifyWhileSimulating?: boolean;
    infinite?: boolean;
    centerGraph?: boolean;
    nodeDimensionsIncludeLabels?: boolean;
    ready?: () => void;
    stop?: () => void;
  }
  
  // Estendendo a interface LayoutOptions do Cytoscape
  declare module 'cytoscape' {
    interface Layouts {
      cola: (options?: ColaLayoutOptions) => cytoscape.Layout;
    }
    
    interface LayoutOptions {
      name: string;
      animate?: boolean;
      refresh?: number;
      maxSimulationTime?: number;
      nodeSpacing?: number;
      edgeLength?: number;
      randomize?: boolean;
      fit?: boolean;
      padding?: number;
      ungrabifyWhileSimulating?: boolean;
      infinite?: boolean;
      centerGraph?: boolean;
      nodeDimensionsIncludeLabels?: boolean;
      ready?: () => void;
      stop?: () => void;
    }
  }
  
  const cola: cytoscape.Ext;
  export default cola;
} 