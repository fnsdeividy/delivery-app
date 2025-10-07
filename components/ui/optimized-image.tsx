import { memo, useState, useCallback } from 'react';
import Image from 'next/image';
import { useOptimizedImage } from '@/hooks/useOptimizedImage';
import { OptimizedLoading } from './optimized-loading';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  fallback?: string;
  lazy?: boolean;
  onClick?: () => void;
}

const OptimizedImageComponent = ({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality = 75,
  sizes = '100vw',
  fallback = '/placeholder-image.png',
  lazy = true,
  onClick,
}: OptimizedImageProps) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const { src: optimizedSrc, loading, error } = useOptimizedImage({
    src: imageError ? fallback : src,
    fallback,
    quality,
    lazy: lazy && !priority,
  });

  const handleLoad = useCallback(() => {
    setImageLoading(false);
  }, []);

  const handleError = useCallback(() => {
    setImageError(true);
    setImageLoading(false);
  }, []);

  if (loading || imageLoading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <OptimizedLoading size="sm" text="" />
      </div>
    );
  }

  if (error || imageError) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 text-gray-400 ${className}`}
        onClick={onClick}
      >
        <div className="text-center">
          <div className="text-4xl mb-2">📷</div>
          <div className="text-sm">Imagem não encontrada</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`} onClick={onClick}>
      <Image
        src={optimizedSrc}
        alt={alt}
        width={width}
        height={height}
        quality={quality}
        sizes={sizes}
        priority={priority}
        loading={lazy && !priority ? 'lazy' : 'eager'}
        onLoad={handleLoad}
        onError={handleError}
        className="object-cover w-full h-full"
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
      />
    </div>
  );
};

export const OptimizedImage = memo(OptimizedImageComponent);

// Componente para imagens de produtos
interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
}

export const ProductImage = memo(({ src, alt, className = '', onClick }: ProductImageProps) => (
  <OptimizedImage
    src={src}
    alt={alt}
    width={300}
    height={300}
    className={`rounded-lg ${className}`}
    quality={80}
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    onClick={onClick}
  />
));

// Componente para logos de loja
interface StoreLogoProps {
  src: string;
  alt: string;
  className?: string;
}

export const StoreLogo = memo(({ src, alt, className = '' }: StoreLogoProps) => (
  <OptimizedImage
    src={src}
    alt={alt}
    width={100}
    height={100}
    className={`rounded-full ${className}`}
    quality={90}
    sizes="100px"
    priority
  />
));

// Componente para banners
interface BannerImageProps {
  src: string;
  alt: string;
  className?: string;
}

export const BannerImage = memo(({ src, alt, className = '' }: BannerImageProps) => (
  <OptimizedImage
    src={src}
    alt={alt}
    width={1200}
    height={400}
    className={`rounded-lg ${className}`}
    quality={85}
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1200px"
    priority
  />
));