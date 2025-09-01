import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function normalizeImageUrl(url: string): string {
  if (!url) return '';
  
  // Converte URLs absolutas locais para relativas (para funcionar com proxy Next.js)
  if (url.startsWith('http://localhost:') || url.startsWith('https://localhost:')) {
    return url.replace(/^https?:\/\/[^/]+/, '');
  }
  
  return url;
}