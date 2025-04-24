import React from 'react';
import { Node, Edge } from '@/types/graph';
import { formatPropertyValue } from '@/utils/graphUtils';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface GraphDetailsProps {
  selectedNode: Node | null;
  selectedEdge: Edge | null;
  onClose: () => void;
  sourceNodes?: Node[]; // para encontrar os nomes dos nós de origem/destino para arestas
}

const GraphDetails: React.FC<GraphDetailsProps> = ({
  selectedNode,
  selectedEdge,
  onClose,
  sourceNodes = []
}) => {
  if (!selectedNode && !selectedEdge) {
    return null;
  }

  // Função para encontrar o nome do nó pelo ID
  const getNodeNameById = (id: string): string => {
    const node = sourceNodes.find(n => n.id === id);
    return node?.properties?.name || id;
  };

  // Função para renderizar propriedades
  const renderProperties = (properties: Record<string, any>) => {
    const propertyEntries = Object.entries(properties).filter(([key]) => key !== 'name');
    
    if (propertyEntries.length === 0) {
      return <p className="text-gray-500 text-sm italic">No additional properties</p>;
    }
    
    return (
      <div className="mt-4 grid grid-cols-1 gap-2">
        {propertyEntries.map(([key, value]) => (
          <div key={key} className="flex flex-col">
            <span className="text-xs font-medium text-gray-500">{key}</span>
            <span className="text-sm break-words">
              {formatPropertyValue(value)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 relative">
      <button 
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
        aria-label="Close details"
      >
        <XMarkIcon className="h-5 w-5" />
      </button>

      <h2 className="text-lg font-semibold mb-4">
        {selectedNode 
          ? 'Node Details' 
          : 'Relationship Details'
        }
      </h2>

      {selectedNode && (
        <div>
          <div className="flex items-center mb-3">
            <div className={`w-3 h-3 rounded-full mr-2 bg-blue-500`}></div>
            <h3 className="text-xl font-bold">{selectedNode.properties.name || 'Unnamed Node'}</h3>
          </div>
          
          <div className="mb-3">
            <p className="text-sm text-gray-600">{selectedNode.properties.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <span className="text-xs font-medium text-gray-500">Type</span>
              <p className="text-sm">{selectedNode.labels.join(', ')}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-gray-500">ID</span>
              <p className="text-sm font-mono">{selectedNode.id}</p>
            </div>
          </div>

          <h4 className="text-sm font-medium border-t pt-3 mt-3">Properties</h4>
          {renderProperties(selectedNode.properties)}
        </div>
      )}

      {selectedEdge && (
        <div>
          <div className="flex items-center mb-3">
            <div className={`w-3 h-3 rounded-full mr-2 bg-green-500`}></div>
            <h3 className="text-xl font-bold">{selectedEdge.type}</h3>
          </div>

          {selectedEdge.properties.description && (
            <div className="mb-3">
              <p className="text-sm text-gray-600">{selectedEdge.properties.description}</p>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <span className="text-xs font-medium text-gray-500 block">Source</span>
                <span>{getNodeNameById(selectedEdge.source)}</span>
              </div>
              
              <div className="text-gray-400">→</div>
              
              <div className="text-sm text-right">
                <span className="text-xs font-medium text-gray-500 block">Target</span>
                <span>{getNodeNameById(selectedEdge.target)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 mb-4">
            <div>
              <span className="text-xs font-medium text-gray-500">ID</span>
              <p className="text-sm font-mono">{selectedEdge.id}</p>
            </div>
          </div>

          <h4 className="text-sm font-medium border-t pt-3 mt-3">Properties</h4>
          {renderProperties(selectedEdge.properties)}
        </div>
      )}
    </div>
  );
};

export default GraphDetails; 