declare module 'react-cytoscapejs' {
  import React from 'react';
  import cytoscape from 'cytoscape';
  
  interface CytoscapeComponentProps {
    id?: string;
    className?: string;
    style?: React.CSSProperties;
    elements: cytoscape.ElementDefinition[];
    layout?: cytoscape.LayoutOptions;
    stylesheet?: cytoscape.Stylesheet[];
    cy?: (cy: cytoscape.Core) => void;
    zoom?: number;
    pan?: { x: number; y: number };
    minZoom?: number;
    maxZoom?: number;
    zoomingEnabled?: boolean;
    userZoomingEnabled?: boolean;
    panningEnabled?: boolean;
    userPanningEnabled?: boolean;
    boxSelectionEnabled?: boolean;
    autoungrabify?: boolean;
    autounselectify?: boolean;
    headless?: boolean;
    autolock?: boolean;
    hideEdgesOnViewport?: boolean;
    hideLabelsOnViewport?: boolean;
    textureOnViewport?: boolean;
    motionBlur?: boolean;
    motionBlurOpacity?: number;
    wheelSensitivity?: number;
    pixelRatio?: number;
  }
  
  class CytoscapeComponent extends React.Component<CytoscapeComponentProps> {}
  
  export default CytoscapeComponent;
} 