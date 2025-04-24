import React, { useState, useEffect } from 'react';
import { Edge, EdgeProperties, Node } from '@/types/graph';
import FormInput from '@/components/ui/FormInput';
import FormTextarea from '@/components/ui/FormTextarea';
import FormSelect from '@/components/ui/FormSelect';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import axios from 'axios';

// Tipos de relacionamento disponíveis
const relationshipTypes = [
  { value: 'DEPENDS_ON', label: 'Depende de' },
  { value: 'USES', label: 'Usa' },
  { value: 'COMMUNICATES_WITH', label: 'Comunica com' },
  { value: 'STORES_DATA_IN', label: 'Armazena dados em' },
  { value: 'CONTAINS', label: 'Contém' },
  { value: 'SECURES', label: 'Protege' },
  { value: 'SERVES', label: 'Serve' },
  { value: 'MONITORS', label: 'Monitora' },
  { value: 'CONNECTS_TO', label: 'Conecta a' },
];

// Criticidade da relação
const criticalityOptions = [
  { value: 'high', label: 'Alta' },
  { value: 'medium', label: 'Média' },
  { value: 'low', label: 'Baixa' },
];

interface EdgeFormProps {
  edge?: Edge | null;
  sourceNodeId?: string;
  targetNodeId?: string;
  onSubmit: (edgeData: { type: string, source: string, target: string, properties: EdgeProperties }) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

const EdgeForm: React.FC<EdgeFormProps> = ({
  edge,
  sourceNodeId,
  targetNodeId,
  onSubmit,
  onCancel,
  isSubmitting = false
}) => {
  const [availableNodes, setAvailableNodes] = useState<Node[]>([]);
  const [type, setType] = useState<string>('DEPENDS_ON');
  const [source, setSource] = useState<string>('');
  const [target, setTarget] = useState<string>('');
  const [properties, setProperties] = useState<EdgeProperties>({
    description: '',
    criticality: 'medium',
    protocol: '',
    port: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoadingNodes, setIsLoadingNodes] = useState(false);

  useEffect(() => {
    // Carregar nós disponíveis
    fetchAvailableNodes();

    // Inicializar com dados da aresta, se fornecida
    if (edge) {
      setType(edge.type);
      setSource(edge.source);
      setTarget(edge.target);
      setProperties(edge.properties || {});
    } else {
      // Se sourceNodeId e targetNodeId forem fornecidos diretamente, usá-los
      if (sourceNodeId) setSource(sourceNodeId);
      if (targetNodeId) setTarget(targetNodeId);
    }
  }, [edge, sourceNodeId, targetNodeId]);

  const fetchAvailableNodes = async () => {
    setIsLoadingNodes(true);
    try {
      const response = await axios.get('/api/neo4j/nodes?limit=1000');
      if (Array.isArray(response.data)) {
        setAvailableNodes(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar nós:', error);
    } finally {
      setIsLoadingNodes(false);
    }
  };

  const handlePropertyChange = (
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
    
    if (!source) {
      newErrors.source = 'Nó de origem é obrigatório';
    }
    
    if (!target) {
      newErrors.target = 'Nó de destino é obrigatório';
    }

    if (source === target) {
      newErrors.target = 'Os nós de origem e destino não podem ser iguais';
    }
    
    if (!type) {
      newErrors.type = 'Tipo de relacionamento é obrigatório';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await onSubmit({
        type,
        source,
        target,
        properties
      });
    } catch (error) {
      console.error('Erro ao submeter formulário:', error);
    }
  };

  // Formatar as opções para o select de nós
  const nodeOptions = availableNodes.map(node => ({
    value: node.id,
    label: `${node.properties.name || 'Sem nome'} (${node.properties.category || 'N/A'})`
  }));

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        {isLoadingNodes && (
          <div className="mb-4 p-3 bg-gray-50 text-gray-600 border border-gray-200 rounded-md text-sm">
            Carregando nós disponíveis...
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormSelect
            id="source"
            label="Nó de Origem"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            options={nodeOptions}
            required
            error={errors.source}
            emptyOption="Selecione o nó de origem"
            disabled={isLoadingNodes || !!sourceNodeId}
          />
          
          <FormSelect
            id="target"
            label="Nó de Destino"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            options={nodeOptions}
            required
            error={errors.target}
            emptyOption="Selecione o nó de destino"
            disabled={isLoadingNodes || !!targetNodeId}
          />
          
          <FormSelect
            id="type"
            label="Tipo de Relacionamento"
            value={type}
            onChange={(e) => setType(e.target.value)}
            options={relationshipTypes}
            required
            error={errors.type}
            emptyOption="Selecione o tipo"
          />
          
          <FormSelect
            id="criticality"
            label="Criticidade"
            value={properties.criticality || 'medium'}
            onChange={handlePropertyChange}
            options={criticalityOptions}
            emptyOption="Selecione a criticidade"
          />
          
          <FormInput
            id="protocol"
            label="Protocolo"
            value={properties.protocol || ''}
            onChange={handlePropertyChange}
            placeholder="HTTP, TCP, etc."
          />
          
          <FormInput
            id="port"
            label="Porta"
            value={properties.port || ''}
            onChange={handlePropertyChange}
            placeholder="8080, 443, etc."
          />
          
          <div className="md:col-span-2">
            <FormTextarea
              id="description"
              label="Descrição"
              value={properties.description || ''}
              onChange={handlePropertyChange}
              placeholder="Descreva o relacionamento"
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
            {isSubmitting ? 'Salvando...' : edge ? 'Atualizar' : 'Criar'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default EdgeForm; 