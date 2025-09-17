import { useEffect, useCallback, useRef } from 'react';
import { PERFORMANCE_CONFIG } from '@/lib/config/performance';

interface PerformanceMetrics {
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  memoryUsage?: number;
}

interface PerformanceMonitorOptions {
  onThresholdExceeded?: (metric: string, value: number, threshold: number) => void;
  onError?: (error: Error) => void;
  enabled?: boolean;
}

/**
 * Hook para monitorar performance da aplicação
 */
export function usePerformanceMonitor(options: PerformanceMonitorOptions = {}) {
  const {
    onThresholdExceeded,
    onError,
    enabled = true
  } = options;

  const metricsRef = useRef<PerformanceMetrics | null>(null);
  const observerRef = useRef<PerformanceObserver | null>(null);

  // Função para obter métricas de performance
  const getPerformanceMetrics = useCallback((): PerformanceMetrics | null => {
    if (typeof window === 'undefined' || !window.performance) {
      return null;
    }

    try {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paintEntries = performance.getEntriesByType('paint');
      
      const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
      const firstContentfulPaint = paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0;
      
      // Obter Largest Contentful Paint
      const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
      const largestContentfulPaint = lcpEntries[lcpEntries.length - 1]?.startTime || 0;

      // Obter First Input Delay (se disponível)
      const fidEntries = performance.getEntriesByType('first-input');
      const firstInputDelay = fidEntries[0]?.processingStart ? 
        fidEntries[0].processingStart - fidEntries[0].startTime : 0;

      // Obter Cumulative Layout Shift (se disponível)
      const clsEntries = performance.getEntriesByType('layout-shift');
      const cumulativeLayoutShift = clsEntries.reduce((sum, entry) => {
        return sum + (entry as any).value;
      }, 0);

      // Obter uso de memória (se disponível)
      const memoryUsage = (performance as any).memory?.usedJSHeapSize;

      return {
        loadTime,
        firstContentfulPaint,
        largestContentfulPaint,
        firstInputDelay,
        cumulativeLayoutShift,
        memoryUsage
      };
    } catch (error) {
      onError?.(error as Error);
      return null;
    }
  }, [onError]);

  // Função para verificar se as métricas excedem os thresholds
  const checkThresholds = useCallback((metrics: PerformanceMetrics) => {
    const thresholds = {
      loadTime: PERFORMANCE_CONFIG.MONITORING.PERFORMANCE_THRESHOLD,
      memoryUsage: PERFORMANCE_CONFIG.MONITORING.MEMORY_THRESHOLD,
    };

    Object.entries(thresholds).forEach(([metric, threshold]) => {
      const value = metrics[metric as keyof PerformanceMetrics] as number;
      if (value && value > threshold) {
        onThresholdExceeded?.(metric, value, threshold);
      }
    });
  }, [onThresholdExceeded]);

  // Função para registrar métricas
  const recordMetrics = useCallback(() => {
    const metrics = getPerformanceMetrics();
    if (metrics) {
      metricsRef.current = metrics;
      checkThresholds(metrics);
      
      // Log das métricas em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        console.log('Performance Metrics:', metrics);
      }
    }
  }, [getPerformanceMetrics, checkThresholds]);

  // Função para obter métricas atuais
  const getCurrentMetrics = useCallback(() => {
    return metricsRef.current;
  }, []);

  // Função para resetar métricas
  const resetMetrics = useCallback(() => {
    metricsRef.current = null;
  }, []);

  // Configurar observer de performance
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    try {
      // Observer para Core Web Vitals
      if ('PerformanceObserver' in window) {
        observerRef.current = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === 'largest-contentful-paint') {
              recordMetrics();
            }
          });
        });

        observerRef.current.observe({ entryTypes: ['largest-contentful-paint'] });
      }

      // Registrar métricas quando a página carregar
      if (document.readyState === 'complete') {
        recordMetrics();
      } else {
        window.addEventListener('load', recordMetrics);
      }

      // Registrar métricas periodicamente
      const interval = setInterval(recordMetrics, 30000); // A cada 30 segundos

      return () => {
        if (observerRef.current) {
          observerRef.current.disconnect();
        }
        window.removeEventListener('load', recordMetrics);
        clearInterval(interval);
      };
    } catch (error) {
      onError?.(error as Error);
    }
  }, [enabled, recordMetrics, onError]);

  return {
    getCurrentMetrics,
    resetMetrics,
    recordMetrics,
  };
}

/**
 * Hook para monitorar erros de performance
 */
export function useErrorMonitor(options: { onError?: (error: Error) => void } = {}) {
  const { onError } = options;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleError = (event: ErrorEvent) => {
      onError?.(new Error(event.message));
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      onError?.(new Error(event.reason));
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [onError]);
}

/**
 * Hook para monitorar uso de memória
 */
export function useMemoryMonitor(options: { onMemoryWarning?: () => void } = {}) {
  const { onMemoryWarning } = options;

  useEffect(() => {
    if (typeof window === 'undefined' || !(performance as any).memory) return;

    const checkMemoryUsage = () => {
      const memory = (performance as any).memory;
      const usedMemory = memory.usedJSHeapSize;
      const totalMemory = memory.totalJSHeapSize;
      const memoryPercentage = (usedMemory / totalMemory) * 100;

      if (memoryPercentage > 80) { // 80% de uso de memória
        onMemoryWarning?.();
      }
    };

    const interval = setInterval(checkMemoryUsage, 10000); // A cada 10 segundos

    return () => clearInterval(interval);
  }, [onMemoryWarning]);
}