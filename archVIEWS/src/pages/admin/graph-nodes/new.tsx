import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { 
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface NodeProperty {
  key: string;
  value: string;
}

export default function NewGraphNode() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [labels, setLabels] = useState<string[]>(['Node']);
  const [newLabel, setNewLabel] = useState('');
  const [properties, setProperties] = useState<NodeProperty[]>([
    { key: 'name', value: '' },
    { key: 'description', value: '' },
    { key: 'type', value: '' },
    { key: 'category', value: '' },
    { key: 'environment', value: '' },
    { key: 'status', value: '' },
    { key: 'owner', value: '' }
  ]);
  
  const [availableEnvironments, setAvailableEnvironments] = useState<string[]>([]);
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableLabels, setAvailableLabels] = useState<string[]>([]);

  useEffect(() => {
    // Carregar valores disponíveis para os campos de seleção
    const fetchOptions = async () => {
      try {
        const response = await axios.get('/api/neo4j/options');
        if (response.data) {
          setAvailableEnvironments(response.data.environments || []);
          setAvailableTypes(response.data.types || []);
          setAvailableCategories(response.data.categories || []);
          setAvailableLabels(response.data.labels || []);
        }
      } catch (error) {
        console.error('Erro ao carregar opções:', error);
      }
    };

    fetchOptions();
  }, []);

  const handlePropertyChange = (index: number, field: 'key' | 'value', value: string) => {
    const newProperties = [...properties];
    newProperties[index][field] = value;
    setProperties(newProperties);
  };

  const addProperty = () => {
    setProperties([...properties, { key: '', value: '' }]);
  };

  const removeProperty = (index: number) => {
    const newProperties = [...properties];
    newProperties.splice(index, 1);
    setProperties(newProperties);
  };

  const addLabel = () => {
    if (newLabel && !labels.includes(newLabel)) {
      setLabels([...labels, newLabel]);
      setNewLabel('');
    }
  };

  const removeLabel = (label: string) => {
    setLabels(labels.filter(l => l !== label));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    // Validate
    if (labels.length === 0) {
      setError('Pelo menos um rótulo é necessário');
      setIsSubmitting(false);
      return;
    }

    // Convert properties array to object
    const propertiesObject: Record<string, string> = {};
    properties.forEach(prop => {
      if (prop.key && prop.value) {
        propertiesObject[prop.key] = prop.value;
      }
    });

    try {
      const response = await axios.post('/api/neo4j/nodes', {
        labels,
        properties: propertiesObject
      });

      setSuccess(true);
      
      // Redirect to view page after successful creation
      setTimeout(() => {
        router.push(`/admin/graph-nodes/view/${response.data.id}`);
      }, 1500);
    } catch (error: any) {
      console.error('Erro ao criar nó:', error);
      setError(error.response?.data?.error || error.message || 'Erro ao criar o nó');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/admin/graph-nodes">
            <Button variant="outline" size="sm" icon={<ArrowLeftIcon className="h-4 w-4" />}>
              Voltar
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-neutral-gray">Adicionar Novo Nó</h1>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md flex gap-2 items-start">
          <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Erro ao criar nó</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-md">
          <p className="font-medium">Nó criado com sucesso!</p>
          <p>Redirecionando para a página de detalhes...</p>
        </div>
      )}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Labels Section */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Rótulos (Labels)</h2>
            <div className="mb-4">
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="Adicionar novo rótulo"
                  className="flex-1 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-computing-purple focus:border-computing-purple"
                  list="available-labels"
                />
                <Button
                  type="button"
                  onClick={addLabel}
                  disabled={!newLabel}
                >
                  Adicionar
                </Button>
              </div>
              
              <datalist id="available-labels">
                {availableLabels.map(label => (
                  <option key={label} value={label} />
                ))}
              </datalist>

              <div className="flex flex-wrap gap-2 mt-2">
                {labels.map(label => (
                  <div key={label} className="bg-computing-purple text-white px-3 py-1 rounded-full flex items-center gap-2">
                    <span>{label}</span>
                    <button 
                      type="button" 
                      onClick={() => removeLabel(label)}
                      className="text-white hover:text-red-100"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Properties Section */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Propriedades</h2>
            <div className="space-y-4">
              {properties.map((property, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="w-1/3">
                    {index < 7 ? (
                      <input
                        type="text"
                        value={property.key}
                        onChange={(e) => handlePropertyChange(index, 'key', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-computing-purple focus:border-computing-purple"
                        placeholder="Chave"
                        disabled={index < 7} // Primeiras 7 propriedades são fixas
                      />
                    ) : (
                      <input
                        type="text"
                        value={property.key}
                        onChange={(e) => handlePropertyChange(index, 'key', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-computing-purple focus:border-computing-purple"
                        placeholder="Chave"
                      />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    {property.key === 'environment' && availableEnvironments.length > 0 ? (
                      <select
                        value={property.value}
                        onChange={(e) => handlePropertyChange(index, 'value', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-computing-purple focus:border-computing-purple"
                      >
                        <option value="">Selecione o ambiente</option>
                        {availableEnvironments.map(env => (
                          <option key={env} value={env}>{env}</option>
                        ))}
                      </select>
                    ) : property.key === 'type' && availableTypes.length > 0 ? (
                      <select
                        value={property.value}
                        onChange={(e) => handlePropertyChange(index, 'value', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-computing-purple focus:border-computing-purple"
                      >
                        <option value="">Selecione o tipo</option>
                        {availableTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    ) : property.key === 'category' && availableCategories.length > 0 ? (
                      <select
                        value={property.value}
                        onChange={(e) => handlePropertyChange(index, 'value', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-computing-purple focus:border-computing-purple"
                      >
                        <option value="">Selecione a categoria</option>
                        {availableCategories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    ) : property.key === 'status' ? (
                      <select
                        value={property.value}
                        onChange={(e) => handlePropertyChange(index, 'value', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-computing-purple focus:border-computing-purple"
                      >
                        <option value="">Selecione o status</option>
                        <option value="active">Ativo</option>
                        <option value="inactive">Inativo</option>
                        <option value="deprecated">Depreciado</option>
                        <option value="planned">Planejado</option>
                      </select>
                    ) : property.key === 'description' ? (
                      <textarea
                        value={property.value}
                        onChange={(e) => handlePropertyChange(index, 'value', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-computing-purple focus:border-computing-purple"
                        placeholder="Valor"
                        rows={3}
                      />
                    ) : (
                      <input
                        type="text"
                        value={property.value}
                        onChange={(e) => handlePropertyChange(index, 'value', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-computing-purple focus:border-computing-purple"
                        placeholder="Valor"
                      />
                    )}
                  </div>
                  
                  {index >= 7 && (
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      icon={<XMarkIcon className="h-4 w-4" />}
                      onClick={() => removeProperty(index)}
                    >
                      Remover
                    </Button>
                  )}
                </div>
              ))}
              
              <div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addProperty}
                >
                  Adicionar Propriedade
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Link href="/admin/graph-nodes">
              <Button variant="outline">Cancelar</Button>
            </Link>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Salvando...' : 'Salvar Nó'}
            </Button>
          </div>
        </form>
      </Card>
    </Layout>
  );
} 