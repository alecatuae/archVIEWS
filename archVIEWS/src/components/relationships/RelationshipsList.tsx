import { useRelationships } from '@/hooks/useRelationships';
import { Spinner } from '@/components/ui/Spinner';
import { AlertCircle } from 'react-feather';
import { useState } from 'react';

interface RelationshipsListProps {
  type: string;
  limit?: number;
  environment?: string;
  onRelationshipSelect?: (relationship: any) => void;
}

export function RelationshipsList({
  type,
  limit = 50,
  environment,
  onRelationshipSelect
}: RelationshipsListProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = limit;
  
  const { 
    relationships, 
    loading, 
    error, 
    pagination,
    refetch 
  } = useRelationships({
    type,
    limit: pageSize,
    skip: currentPage * pageSize,
    environment,
    enabled: !!type
  });

  if (loading && relationships.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-500 space-y-2">
        <AlertCircle size={40} />
        <p className="text-sm">{error.message}</p>
        <button 
          className="px-4 py-2 mt-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => refetch()}
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (relationships.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>Nenhum relacionamento encontrado para o tipo "{type}"</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
      {loading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
          <Spinner size="md" />
        </div>
      )}
      
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Origem
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Relacionamento
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Destino
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {relationships.map((rel) => (
            <tr 
              key={rel.id} 
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => onRelationshipSelect && onRelationshipSelect(rel)}
            >
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                <div className="font-medium">{rel.source.name || rel.source.id}</div>
                <div className="text-gray-500">{rel.source.labels?.join(', ')}</div>
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                <div className="font-medium">{rel.type}</div>
                <div className="text-gray-500">
                  {Object.entries(rel.properties || {}).map(([key, value]) => (
                    <div key={key}>{key}: {String(value)}</div>
                  ))}
                </div>
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                <div className="font-medium">{rel.target.name || rel.target.id}</div>
                <div className="text-gray-500">{rel.target.labels?.join(', ')}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {pagination && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{relationships.length === 0 ? 0 : pagination.skip + 1}</span> a{" "}
                <span className="font-medium">{pagination.skip + relationships.length}</span> de{" "}
                <span className="font-medium">{pagination.total}</span> resultados
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 
                    ${currentPage === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                >
                  <span className="sr-only">Anterior</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  onClick={() => setCurrentPage(p => pagination.hasMore ? p + 1 : p)}
                  disabled={!pagination.hasMore}
                  className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 
                    ${!pagination.hasMore ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                >
                  <span className="sr-only">Próximo</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 