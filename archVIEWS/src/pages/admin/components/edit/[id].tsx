import React, { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import FormInput from '@/components/ui/FormInput';
import FormTextarea from '@/components/ui/FormTextarea';
import FormSelect from '@/components/ui/FormSelect';
import Button from '@/components/ui/Button';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

// Tipos de categoria baseados no arquivo categoryIcons.ts
const categoryOptions = [
  { value: 'Server', label: 'Servidor' },
  { value: 'VM', label: 'Máquina Virtual' },
  { value: 'Container', label: 'Container' },
  { value: 'Cloud', label: 'Nuvem' },
  { value: 'WebApp', label: 'Aplicação Web' },
  { value: 'API', label: 'API' },
  { value: 'Service', label: 'Serviço' },
  { value: 'MobileApp', label: 'Aplicação Mobile' },
  { value: 'Database', label: 'Banco de Dados' },
  { value: 'SQL', label: 'Banco SQL' },
  { value: 'NoSQL', label: 'Banco NoSQL' },
  { value: 'Storage', label: 'Armazenamento' },
  { value: 'FileSystem', label: 'Sistema de Arquivos' },
  { value: 'ObjectStorage', label: 'Object Storage' },
  { value: 'Network', label: 'Rede' },
  { value: 'LoadBalancer', label: 'Balanceador de Carga' },
  { value: 'Firewall', label: 'Firewall' },
  { value: 'Router', label: 'Roteador' },
  { value: 'Switch', label: 'Switch' },
  { value: 'Security', label: 'Segurança' },
  { value: 'Tool', label: 'Ferramenta' }
];

const environmentOptions = [
  { value: 'prod', label: 'Produção' },
  { value: 'stage', label: 'Staging' },
  { value: 'dev', label: 'Desenvolvimento' },
];

interface FormData {
  id: string;
  name: string;
  description: string;
  category: string;
  environment: string;
  type: string;
  owner: string;
}

interface FormErrors {
  name?: string;
  description?: string;
  category?: string;
  environment?: string;
  type?: string;
  owner?: string;
  general?: string;
}

export default function EditComponent() {
  const router = useRouter();
  const { id } = router.query;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    id: '',
    name: '',
    description: '',
    category: '',
    environment: '',
    type: '',
    owner: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (id) {
      loadComponentData();
    }
  }, [id]);

  const loadComponentData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`/api/components/${id}`);
      const componentData = response.data;
      
      // Formatar os dados para o formulário
      setFormData({
        id: componentData.id,
        name: componentData.name || '',
        description: componentData.description || '',
        category: componentData.category || '',
        environment: componentData.neo4jProperties?.environment || '',
        type: componentData.neo4jProperties?.type || '',
        owner: componentData.neo4jProperties?.owner || ''
      });
    } catch (error: any) {
      console.error('Erro ao carregar dados do componente:', error);
      setError(error.response?.data?.error || 'Erro ao carregar dados do componente');
      
      // Se o componente não for encontrado, redirecionar para a lista
      if (error.response?.status === 404) {
        router.push('/admin');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpar erro quando o campo é alterado
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = 'O nome é obrigatório';
      isValid = false;
    }

    if (!formData.category) {
      newErrors.category = 'A categoria é obrigatória';
      isValid = false;
    }

    if (!formData.environment) {
      newErrors.environment = 'O ambiente é obrigatório';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Fazer a chamada à API para atualizar o componente
      const response = await axios.put(`/api/components/${id}`, formData);
      
      // Redirecionar para a lista de componentes após sucesso
      router.push('/admin');
    } catch (error: any) {
      console.error('Erro ao atualizar componente:', error);
      // Exibir mensagem de erro
      const responseError = error.response?.data?.error || 'Erro ao atualizar o componente';
      setErrors({
        ...errors,
        general: responseError
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-computing-purple"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-neutral-gray">Editar Componente</h1>
          <Button 
            variant="outline" 
            size="sm" 
            icon={<ArrowLeftIcon className="h-4 w-4" />}
            onClick={() => router.push('/admin')}
          >
            Voltar
          </Button>
        </div>
        
        <Card>
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
            {error}
          </div>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-neutral-gray">Editar Componente</h1>
        <Button 
          variant="outline" 
          size="sm" 
          icon={<ArrowLeftIcon className="h-4 w-4" />}
          onClick={() => router.push('/admin')}
        >
          Voltar
        </Button>
      </div>
      
      <Card>
        {errors.general && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
            {errors.general}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              id="name"
              label="Nome do Componente"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ex: API de Usuários"
              required
              error={errors.name}
            />
            
            <FormSelect
              id="category"
              label="Categoria"
              value={formData.category}
              onChange={handleChange}
              options={categoryOptions}
              required
              error={errors.category}
              emptyOption="Selecione uma categoria"
            />
            
            <FormInput
              id="type"
              label="Tipo"
              value={formData.type}
              onChange={handleChange}
              placeholder="Ex: Microsserviço"
            />
            
            <FormSelect
              id="environment"
              label="Ambiente"
              value={formData.environment}
              onChange={handleChange}
              options={environmentOptions}
              required
              error={errors.environment}
              emptyOption="Selecione um ambiente"
            />
            
            <FormInput
              id="owner"
              label="Responsável"
              value={formData.owner}
              onChange={handleChange}
              placeholder="Ex: Time de Infraestrutura"
            />
            
            <div className="md:col-span-2">
              <FormTextarea
                id="description"
                label="Descrição"
                value={formData.description}
                onChange={handleChange}
                placeholder="Descreva o componente..."
                rows={5}
              />
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <Button 
              variant="outline" 
              onClick={() => router.push('/admin')}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Salvando...' : 'Atualizar Componente'}
            </Button>
          </div>
        </form>
      </Card>
    </Layout>
  );
} 