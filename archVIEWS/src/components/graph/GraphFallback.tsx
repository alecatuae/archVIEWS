import React from 'react';

const GraphFallback: React.FC<{style?: React.CSSProperties}> = ({ style }) => {
  return (
    <div 
      style={style} 
      className="flex items-center justify-center h-full w-full bg-gray-100 rounded-lg border border-gray-300"
    >
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading graph visualization...</p>
      </div>
    </div>
  );
};

export default GraphFallback; 