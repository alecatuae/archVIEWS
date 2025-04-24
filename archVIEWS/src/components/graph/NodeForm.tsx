import React, { useState, useEffect } from 'react';
import { Node, NodeProperties } from '@/types/graph';
import FormInput from '@/components/ui/FormInput';
import FormTextarea from '@/components/ui/FormTextarea';
import FormSelect from '@/components/ui/FormSelect';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

// Categorias disponíveis para os nós
const categoryOptions = [
  { value: 'Server', label: 'Servidor' },
  { value: 'VM', label: 'Máquina Virtual' },
  { value: 'Container', label: 'Container' },
  { value: 'WebApp', label: 'Aplicação Web' },
  { value: 'API', label: 'API' },
  { value: 'Service', label: 'Serviço' },
  { value: 'Database', label: 'Banco de Dados' },
  { value: 'Storage', label: 'Armazenamento' },
  { value: 'Network', label: 'Rede' },
  { value: 'Security', label: 'Segurança' },
  { value: 'Tool', label: 'Ferramenta' }
];

const environmentOptions = [
  { value: 'prod', label: 'Produção' },
  { value: 'stage', label: 'Staging' },
  { value: 'dev', label: 'Desenvolvimento' },
  { value: 'test', label: 'Teste' },
];

const statusOptions = [
  { value: 'active', label: 'Ativo' },
  { value: 'inactive', label: 'Inativo' },
  { value: 'planned', label: 'Planejado' },
  { value: 'deprecated', label: 'Depreciado' },
];

interface NodeFormProps {
  node?: Node | null;
  onSubmit: (nodeData: {labels: string[], properties: NodeProperties}) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

const NodeForm: React.FC<NodeFormProps> = ({
  node,
  onSubmit,
  onCancel,
  isSubmitting = false
}) => {
  const [labels, setLabels] = useState<string[]>(['Component']);
  const [properties, setProperties] = useState<NodeProperties>({
    name: '',
    category: '',
    type: '',
    description: '',
    environment: '',
    status: 'active',
    owner: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Inicializar o formulário com os dados do nó, se fornecido
  useEffect(() => {
    if (node) {
      setLabels(node.labels || ['Component']);
      setProperties(node.properties || {});
    }
  }, [node]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setProperties(prev => ({ ...prev, [name]: value }));
    
    // Limpar erro quando o campo é alterado
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!properties.name) {
      newErrors.name = 'O nome é obrigatório';
    }
    
    if (!properties.category) {
      newErrors.category = 'A categoria é obrigatória';
    }

    if (!properties.environment) {
      newErrors.environment = 'O ambiente é obrigatório';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await onSubmit({
        labels,
        properties
      });
    } catch (error) {
      console.error('Erro ao submeter formulário:', error);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            id="name"
            label="Nome"
            value={properties.name || ''}
            onChange={handleChange}
            placeholder="Nome do nó"
            required
            error={errors.name}
          />
          
          <FormSelect
            id="category"
            label="Categoria"
            value={properties.category || ''}
            onChange={handleChange}
            options={categoryOptions}
            required
            error={errors.category}
            emptyOption="Selecione uma categoria"
          />
          
          <FormInput
            id="type"
            label="Tipo"
            value={properties.type || ''}
            onChange={handleChange}
            placeholder="Tipo específico"
          />
          
          <FormSelect
            id="environment"
            label="Ambiente"
            value={properties.environment || ''}
            onChange={handleChange}
            options={environmentOptions}
            required
            error={errors.environment}
            emptyOption="Selecione um ambiente"
          />
          
          <FormSelect
            id="status"
            label="Status"
            value={properties.status || 'active'}
            onChange={handleChange}
            options={statusOptions}
            emptyOption="Selecione um status"
          />
          
          <FormInput
            id="owner"
            label="Responsável"
            value={properties.owner || ''}
            onChange={handleChange}
            placeholder="Responsável/Time"
          />
          
          <div className="md:col-span-2">
            <FormTextarea
              id="description"
              label="Descrição"
              value={properties.description || ''}
              onChange={handleChange}
              placeholder="Descrição do nó"
              rows={3}
            />
          </div>
        </div>
        
        <div className="mt-6 flex justify-end space-x-3">
          {onCancel && (
            <Button 
              variant="outline" 
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
          )}
          <Button 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Salvando...' : node ? 'Atualizar' : 'Criar'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default NodeForm; 