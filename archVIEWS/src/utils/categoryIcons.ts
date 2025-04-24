import { 
  ServerIcon, 
  CloudIcon, 
  CpuChipIcon, 
  CodeBracketIcon, 
  CircleStackIcon, 
  GlobeAltIcon,
  CubeIcon,
  LockClosedIcon,
  WrenchIcon
} from '@heroicons/react/24/outline';

export interface CategoryIconMapping {
  [key: string]: typeof ServerIcon;
}

export const categoryIcons: CategoryIconMapping = {
  // IC (Infraestrutura de Computação)
  'Server': ServerIcon,
  'VM': CpuChipIcon,
  'Container': CubeIcon,
  'Cloud': CloudIcon,
  
  // Application
  'WebApp': CodeBracketIcon,
  'API': CodeBracketIcon,
  'Service': CodeBracketIcon,
  'MobileApp': CodeBracketIcon,
  
  // Database
  'Database': CircleStackIcon,
  'SQL': CircleStackIcon,
  'NoSQL': CircleStackIcon,
  
  // Storage
  'Storage': CircleStackIcon,
  'FileSystem': CircleStackIcon,
  'ObjectStorage': CircleStackIcon,
  
  // Network
  'Network': GlobeAltIcon,
  'LoadBalancer': GlobeAltIcon,
  'Firewall': LockClosedIcon,
  'Router': GlobeAltIcon,
  'Switch': GlobeAltIcon,
  
  // Other
  'Security': LockClosedIcon,
  'Tool': WrenchIcon,
  'Default': ServerIcon
};

/**
 * Retorna o ícone correspondente à categoria ou ServerIcon como fallback.
 * @param category Nome da categoria para obter o ícone
 * @returns Um componente de ícone válido
 */
export function getCategoryIcon(category?: string): typeof ServerIcon {
  if (!category) {
    return categoryIcons.Default;
  }
  
  return categoryIcons[category] || categoryIcons.Default;
}

export default {
  categoryIcons,
  getCategoryIcon
}; 