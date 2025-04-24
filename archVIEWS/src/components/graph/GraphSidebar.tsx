import React from 'react';
import { Node, Edge } from '@/types/graph';
import { getCategoryIcon } from '@/utils/categoryIcons';
import { formatNodeLabel, formatEdgeLabel, getRelationshipColor } from '@/utils/graphUtils';

interface GraphSidebarProps {
  selectedNode: Node | null;
  selectedEdge: Edge | null;
  graphStats: {
    nodeCount: number;
    edgeCount: number;
  };
  onClose?: () => void;
}

const GraphSidebar: React.FC<GraphSidebarProps> = ({
  selectedNode,
  selectedEdge,
  graphStats,
  onClose
}) => {
  const hasSelection = selectedNode || selectedEdge;

  const renderNodeDetails = (node: Node) => {
    const { properties, labels } = node;
    const CategoryIcon = getCategoryIcon(properties.category);

    return (
      <div>
        <div className="flex items-center mb-4">
          <div className="p-2 rounded-full bg-computing-purple text-white mr-3">
            <CategoryIcon className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-semibold">
            {properties.name || 'Componente sem nome'}
          </h3>
        </div>

        <div className="mb-4">
          <h4 className="font-medium text-neutral-gray mb-2">Tipo</h4>
          <div className="flex flex-wrap gap-2">
            {labels.map((label) => (
              <span
                key={label}
                className="px-2 py-1 bg-bg-gray rounded-full text-sm"
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <h4 className="font-medium text-neutral-gray mb-2">Propriedades</h4>
          <table className="w-full">
            <tbody>
              {Object.entries(properties)
                .filter(([key]) => key !== 'name') // Nome já foi exibido no título
                .map(([key, value]) => (
                  <tr key={key} className="border-b border-gray-200">
                    <td className="py-2 font-medium">{key}</td>
                    <td className="py-2 text-right">
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderEdgeDetails = (edge: Edge) => {
    const { type, properties, source, target } = edge;
    const color = getRelationshipColor(type);

    return (
      <div>
        <div className="flex items-center mb-4">
          <div className="p-2 rounded-full mr-3" style={{ backgroundColor: color }}>
            <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold">{type}</h3>
        </div>

        <div className="mb-4">
          <h4 className="font-medium text-neutral-gray mb-2">Conexão</h4>
          <p>
            De <span className="font-medium">{source}</span> para{' '}
            <span className="font-medium">{target}</span>
          </p>
        </div>

        <div className="mb-4">
          <h4 className="font-medium text-neutral-gray mb-2">Propriedades</h4>
          <table className="w-full">
            <tbody>
              {Object.entries(properties).map(([key, value]) => (
                <tr key={key} className="border-b border-gray-200">
                  <td className="py-2 font-medium">{key}</td>
                  <td className="py-2 text-right">
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderGraphStats = () => {
    return (
      <div>
        <h3 className="text-xl font-semibold mb-4">Estatísticas do Grafo</h3>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-3xl font-bold text-computing-purple">{graphStats.nodeCount}</div>
            <div className="text-sm text-neutral-gray">Componentes</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-3xl font-bold text-network-blue">{graphStats.edgeCount}</div>
            <div className="text-sm text-neutral-gray">Relacionamentos</div>
          </div>
        </div>

        <div className="mb-4">
          <h4 className="font-medium text-neutral-gray mb-2">Legenda</h4>
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-computing-purple mr-2"></div>
              <span>Infraestrutura de Computação</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-storage-blue mr-2"></div>
              <span>Armazenamento</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-network-blue mr-2"></div>
              <span>Rede</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-dependency-orange mr-2"></div>
              <span>Dependência</span>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-sm text-neutral-gray">
            Selecione um componente ou relacionamento no grafo para visualizar seus detalhes.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-bg-gray h-full p-4 overflow-y-auto">
      {hasSelection ? (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold">Detalhes</h2>
            <button
              onClick={onClose}
              className="text-neutral-gray hover:text-dependency-orange"
              title="Fechar"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM6.707 6.707a1 1 0 011.414 0L10 8.586l1.879-1.879a1 1 0 111.414 1.414L11.414 10l1.879 1.879a1 1 0 01-1.414 1.414L10 11.414l-1.879 1.879a1 1 0 01-1.414-1.414L8.586 10 6.707 8.121a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {selectedNode && renderNodeDetails(selectedNode)}
          {selectedEdge && renderEdgeDetails(selectedEdge)}
        </div>
      ) : (
        renderGraphStats()
      )}
    </div>
  );
};

export default GraphSidebar; 