import { memo } from 'react';
import { Loader2 } from 'lucide-react';

interface OptimizedLoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

const OptimizedLoadingComponent = ({ 
  size = 'md', 
  text = 'Carregando...', 
  className = '' 
}: OptimizedLoadingProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className={`flex items-center justify-center p-4 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600`} />
      {text && (
        <span className="ml-2 text-sm text-gray-600">{text}</span>
      )}
    </div>
  );
};

// Memoizar para evitar re-renders desnecessários
export const OptimizedLoading = memo(OptimizedLoadingComponent);

// Componente de skeleton para melhor UX
interface SkeletonProps {
  lines?: number;
  className?: string;
}

const SkeletonComponent = ({ lines = 3, className = '' }: SkeletonProps) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`h-4 bg-gray-200 rounded mb-2 ${
            index === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
};

export const Skeleton = memo(SkeletonComponent);

// Componente de loading para listas
interface ListLoadingProps {
  items?: number;
  className?: string;
}

const ListLoadingComponent = ({ items = 5, className = '' }: ListLoadingProps) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow">
          <div className="h-12 w-12 bg-gray-200 rounded-full animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
            <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const ListLoading = memo(ListLoadingComponent);