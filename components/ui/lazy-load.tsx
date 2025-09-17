import { Suspense, lazy, ComponentType } from 'react';
import { Loader2 } from 'lucide-react';

interface LazyLoadProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

// Componente de fallback padrão
const DefaultFallback = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="h-6 w-6 animate-spin" />
    <span className="ml-2">Carregando...</span>
  </div>
);

// Wrapper para lazy loading com Suspense
export function LazyLoad({ children, fallback = <DefaultFallback /> }: LazyLoadProps) {
  return <Suspense fallback={fallback}>{children}</Suspense>;
}

// Função helper para criar componentes lazy
export function createLazyComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFunc);
  
  return function WrappedLazyComponent(props: React.ComponentProps<T>) {
    return (
      <LazyLoad fallback={fallback}>
        <LazyComponent {...props} />
      </LazyLoad>
    );
  };
}

// Componentes lazy específicos para melhor performance
export const LazyDashboard = createLazyComponent(() => import('../Dashboard'));
export const LazyOrderManagement = createLazyComponent(() => import('../OrderManagement'));
export const LazyStoreManagement = createLazyComponent(() => import('../StoreManagement'));
export const LazyUserManagement = createLazyComponent(() => import('../UserManagement'));
export const LazyAnalytics = createLazyComponent(() => import('../Analytics'));

// Lazy loading para modais pesados
export const LazyLoginModal = createLazyComponent(() => import('../LoginModal'));
export const LazyStoreVisualConfig = createLazyComponent(() => import('../StoreVisualConfig'));
export const LazyProductForm = createLazyComponent(() => import('../products/ProductForm'));

// Lazy loading para páginas
export const LazyStorePage = createLazyComponent(() => import('../../app/(store)/store/[storeSlug]/page'));
export const LazyCheckoutPage = createLazyComponent(() => import('../../app/(store)/store/[storeSlug]/checkout/page'));