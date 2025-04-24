import React, { useState, useEffect } from 'react';
import { CytoscapeGraphData } from '@/types/graph';

interface CytoscapeWrapperProps {
  elements?: CytoscapeGraphData;
  stylesheet?: any[];
  layout?: any;
  style?: React.CSSProperties;
  cy?: (cy: any) => void;
  boxSelectionEnabled?: boolean;
  userZoomingEnabled?: boolean;
  userPanningEnabled?: boolean;
  minZoom?: number;
  maxZoom?: number;
  zoom?: number;
  pan?: { x: number, y: number };
  onNodeClick?: (event: any) => void;
  onEdgeClick?: (event: any) => void;
}

const CytoscapeWrapper: React.FC<CytoscapeWrapperProps> = (props) => {
  const [Component, setComponent] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Import CytoscapeJS only on the client side
    import('react-cytoscapejs')
      .then((mod) => {
        const CytoscapeComponent = mod.default || mod;
        setComponent(() => CytoscapeComponent);
      })
      .catch(err => {
        console.error('Failed to load Cytoscape component:', err);
        setError(err);
      });
  }, []);

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
        <p className="text-red-700 font-medium">Failed to load graph visualization component</p>
        <p className="text-red-600 text-sm">{error.message}</p>
      </div>
    );
  }

  if (!Component) {
    return (
      <div 
        style={props.style} 
        className="flex items-center justify-center h-full w-full"
      >
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return <Component {...props} />;
};

export default CytoscapeWrapper; 