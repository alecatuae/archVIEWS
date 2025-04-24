import { Loader } from 'react-feather';
import { cn } from '@/utils/cn';

type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';

interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
}

const sizeClasses: Record<SpinnerSize, string> = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <div className={cn('animate-spin text-blue-500', sizeClasses[size], className)}>
      <Loader className="w-full h-full" />
    </div>
  );
} 