import { useState, useEffect, useCallback } from 'react';

interface UseOptimizedImageOptions {
  src: string;
  fallback?: string;
  lazy?: boolean;
  quality?: number;
  sizes?: string;
}

interface UseOptimizedImageReturn {
  src: string;
  loading: boolean;
  error: boolean;
  ref: (node: HTMLImageElement | null) => void;
}

/**
 * Hook para otimização de imagens com lazy loading e fallback
 */
export function useOptimizedImage({
  src,
  fallback = '/placeholder-image.png',
  lazy = true,
  quality = 75,
  sizes = '100vw'
}: UseOptimizedImageOptions): UseOptimizedImageReturn {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [inView, setInView] = useState(!lazy);

  // Intersection Observer para lazy loading
  const ref = useCallback((node: HTMLImageElement | null) => {
    if (!lazy || !node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px', // Carregar 50px antes de entrar na viewport
        threshold: 0.1
      }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [lazy]);

  // Gerar URL otimizada
  const optimizedSrc = useCallback(() => {
    if (!src) return fallback;
    
    // Se for uma URL externa, retornar como está
    if (src.startsWith('http')) {
      return src;
    }

    // Para imagens locais, adicionar parâmetros de otimização
    const url = new URL(src, window.location.origin);
    url.searchParams.set('q', quality.toString());
    url.searchParams.set('w', '800'); // Largura máxima
    url.searchParams.set('f', 'webp'); // Formato WebP
    
    return url.toString();
  }, [src, fallback, quality]);

  // Simular carregamento da imagem
  useEffect(() => {
    if (!inView) return;

    setLoading(true);
    setError(false);

    const img = new Image();
    
    img.onload = () => {
      setLoading(false);
      setError(false);
    };
    
    img.onerror = () => {
      setLoading(false);
      setError(true);
    };
    
    img.src = optimizedSrc();
  }, [inView, optimizedSrc]);

  return {
    src: error ? fallback : optimizedSrc(),
    loading: loading && inView,
    error,
    ref: lazy ? ref : () => {}
  };
}

/**
 * Hook para pré-carregar imagens críticas
 */
export function usePreloadImages(urls: string[]) {
  useEffect(() => {
    urls.forEach(url => {
      if (url) {
        const img = new Image();
        img.src = url;
      }
    });
  }, [urls]);
}

/**
 * Hook para otimizar imagens com diferentes tamanhos (responsive)
 */
export function useResponsiveImage(
  baseSrc: string,
  sizes: { mobile: string; tablet: string; desktop: string }
) {
  const [currentSize, setCurrentSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setCurrentSize('mobile');
      } else if (width < 1024) {
        setCurrentSize('tablet');
      } else {
        setCurrentSize('desktop');
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const getOptimizedSrc = useCallback(() => {
    if (!baseSrc) return '';
    
    const size = sizes[currentSize];
    const url = new URL(baseSrc, window.location.origin);
    url.searchParams.set('w', size);
    url.searchParams.set('q', '75');
    url.searchParams.set('f', 'webp');
    
    return url.toString();
  }, [baseSrc, sizes, currentSize]);

  return {
    src: getOptimizedSrc(),
    size: currentSize
  };
}