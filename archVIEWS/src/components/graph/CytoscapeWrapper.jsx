import React from 'react';

// This is a client-side wrapper for CytoscapeJS
const CytoscapeWrapper = (props) => {
  const [Component, setComponent] = React.useState(null);

  React.useEffect(() => {
    // Import CytoscapeJS only on the client side
    import('react-cytoscapejs').then((mod) => {
      setComponent(() => mod.default || mod);
    });
  }, []);

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