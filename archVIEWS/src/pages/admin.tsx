import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import Head from 'next/head';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { 
  PlusIcon, 
  PencilSquareIcon, 
  TrashIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';

// Tipos simulados
interface Component {
  id: string;
  name: string;
  category: string;
  environment?: string;
  type?: string;
  owner?: string;
  updatedAt: string;
}

export default function Admin() {
  const [activeTab, setActiveTab] = useState('components');
  const [isLoading, setIsLoading] = useState(false);
  const [components, setComponents] = useState<Component[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'components') {
      loadComponents();
    }
  }, [activeTab]);

  const loadComponents = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get('/api/components');
      setComponents(response.data);
    } catch (error: any) {
      console.error('Erro ao carregar componentes:', error);
      setError(error.response?.data?.error || 'Falha ao carregar a lista de componentes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteComponent = async (id: string, name: string) => {
    // Confirmação antes de deletar
    if (!window.confirm(`Tem certeza que deseja excluir o componente "${name}"?`)) {
      return;
    }
    
    try {
      await axios.delete(`/api/components/${id}`);
      // Atualiza a lista após exclusão
      setComponents(components.filter(comp => comp.id !== id));
    } catch (error: any) {
      console.error('Erro ao excluir componente:', error);
      alert(error.response?.data?.error || 'Erro ao excluir o componente');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const renderComponentsTab = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-computing-purple"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md flex gap-2 items-start">
          <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Erro ao carregar componentes</p>
            <p>{error}</p>
          </div>
        </div>
      );
    }

    if (components.length === 0) {
      return (
        <div className="p-6 text-center">
          <p className="text-neutral-gray mb-4">Nenhum componente cadastrado.</p>
          <Link href="/admin/components/new">
            <Button icon={<PlusIcon className="h-5 w-5" />}>
              Cadastrar Componente
            </Button>
          </Link>
        </div>
      );
    }

    return (
      <>
        <div className="flex justify-end mb-4">
          <Link href="/admin/components/new">
            <Button icon={<PlusIcon className="h-5 w-5" />}>
              Novo Componente
            </Button>
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Nome
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Ambiente
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Última Atualização
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {components.map((component) => (
                <tr key={component.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-neutral-900">{component.name}</div>
                    <div className="text-sm text-neutral-500">{component.type || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-neutral-100 text-neutral-700 rounded-full">
                      {component.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    {component.environment || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    {formatDate(component.updatedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link href={`/admin/components/edit/${component.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<PencilSquareIcon className="h-4 w-4" />}
                        >
                          Editar
                        </Button>
                      </Link>
                      <Button
                        variant="danger"
                        size="sm"
                        icon={<TrashIcon className="h-4 w-4" />}
                        onClick={() => handleDeleteComponent(component.id, component.name)}
                      >
                        Excluir
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  };

  const renderGraphNodesTab = () => {
    return (
      <div className="p-6">
        <div className="text-center mb-6">
          <p className="text-neutral-gray mb-4">Gerenciamento de nós do grafo Neo4j.</p>
          <Link href="/admin/graph-nodes">
            <Button>
              Acessar Gerenciamento de Nós
            </Button>
          </Link>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="text-blue-800 font-medium mb-2">O que você pode fazer:</h3>
          <ul className="list-disc pl-5 text-blue-700 space-y-1">
            <li>Visualizar todos os nós do grafo Neo4j</li>
            <li>Adicionar novos nós com propriedades personalizadas</li>
            <li>Editar propriedades de nós existentes</li>
            <li>Excluir nós (e suas relações)</li>
            <li>Filtrar nós por ambiente</li>
          </ul>
        </div>
      </div>
    );
  };

  const renderGraphEdgesTab = () => {
    return (
      <div className="p-6">
        <div className="text-center mb-6">
          <p className="text-neutral-gray mb-4">Gerenciamento de relacionamentos do grafo Neo4j.</p>
          <Link href="/admin/graph-edges">
            <Button>
              Acessar Gerenciamento de Relacionamentos
            </Button>
          </Link>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h3 className="text-green-800 font-medium mb-2">O que você pode fazer:</h3>
          <ul className="list-disc pl-5 text-green-700 space-y-1">
            <li>Visualizar todos os relacionamentos entre nós</li>
            <li>Criar novos relacionamentos entre nós existentes</li>
            <li>Editar propriedades de relacionamentos</li>
            <li>Excluir relacionamentos</li>
            <li>Filtrar relacionamentos por tipo</li>
          </ul>
        </div>
      </div>
    );
  };

  const renderTeamsTab = () => {
    return (
      <div className="p-6 text-center">
        <p className="text-neutral-gray mb-2">Gerenciamento de Times em desenvolvimento.</p>
        <p className="text-neutral-gray text-sm">Em breve você poderá gerenciar times aqui.</p>
      </div>
    );
  };

  const renderUsersTab = () => {
    return (
      <div className="p-6 text-center">
        <p className="text-neutral-gray mb-2">Gerenciamento de Usuários em desenvolvimento.</p>
        <p className="text-neutral-gray text-sm">Em breve você poderá gerenciar usuários aqui.</p>
      </div>
    );
  };

  return (
    <Layout>
      <Head>
        <title>Administração | archVIEWS</title>
      </Head>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-gray">Administração</h1>
        <p className="text-neutral-gray">Gerencie componentes, dados do grafo, times e usuários.</p>
      </div>

      <div className="mb-4 border-b border-neutral-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'components'
                ? 'border-computing-purple text-computing-purple'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
            }`}
            onClick={() => setActiveTab('components')}
          >
            Componentes
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'graph-nodes'
                ? 'border-computing-purple text-computing-purple'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
            }`}
            onClick={() => setActiveTab('graph-nodes')}
          >
            Nós do Grafo
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'graph-edges'
                ? 'border-computing-purple text-computing-purple'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
            }`}
            onClick={() => setActiveTab('graph-edges')}
          >
            Relacionamentos
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'teams'
                ? 'border-computing-purple text-computing-purple'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
            }`}
            onClick={() => setActiveTab('teams')}
          >
            Times
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'users'
                ? 'border-computing-purple text-computing-purple'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
            }`}
            onClick={() => setActiveTab('users')}
          >
            Usuários
          </button>
        </nav>
      </div>

      <Card>
        {activeTab === 'components' && renderComponentsTab()}
        {activeTab === 'graph-nodes' && renderGraphNodesTab()}
        {activeTab === 'graph-edges' && renderGraphEdgesTab()}
        {activeTab === 'teams' && renderTeamsTab()}
        {activeTab === 'users' && renderUsersTab()}
      </Card>
    </Layout>
  );
} 