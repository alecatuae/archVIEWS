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

export function getCategoryIcon(category: string = 'Default') {
  return categoryIcons[category] || categoryIcons.Default;
}

export default {
  categoryIcons,
  getCategoryIcon
}; 