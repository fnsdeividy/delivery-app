import { useEffect, useMemo } from 'react';
import { useStoreConfig } from '@/lib/store/useStoreConfig';

interface StoreTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
}

export function useStoreTheme(storeSlug?: string) {
  const { config, loading } = useStoreConfig(storeSlug || '');

  // Memoizar o tema para evitar recálculos desnecessários
  const theme = useMemo((): StoreTheme | null => {
    if (!config?.branding) return null;

    return {
      primaryColor: config.branding.primaryColor || '#f97316',
      secondaryColor: config.branding.secondaryColor || '#ea580c',
      backgroundColor: config.branding.backgroundColor || '#ffffff',
      textColor: config.branding.textColor || '#000000',
      accentColor: config.branding.accentColor || '#f59e0b',
    };
  }, [config?.branding]);

  useEffect(() => {
    if (!theme) return;

    // Criar ou atualizar estilos dinâmicos
    const styleId = 'store-theme-styles';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    // Gerar CSS customizado baseado no tema da loja
    const customCSS = `
      :root {
        --store-primary: ${theme.primaryColor};
        --store-secondary: ${theme.secondaryColor};
        --store-background: ${theme.backgroundColor};
        --store-text: ${theme.textColor};
        --store-accent: ${theme.accentColor};
      }

      .store-themed-modal {
        --primary: var(--store-primary);
        --primary-foreground: ${getContrastColor(theme.primaryColor)};
        --secondary: var(--store-secondary);
        --secondary-foreground: ${getContrastColor(theme.secondaryColor)};
        --background: var(--store-background);
        --foreground: var(--store-text);
        --accent: var(--store-accent);
        --accent-foreground: ${getContrastColor(theme.accentColor)};
      }

      .store-themed-modal .dialog-content {
        background-color: var(--background) !important;
        color: var(--foreground) !important;
        border-color: var(--primary) !important;
      }

      .store-themed-modal .dialog-title {
        color: var(--foreground) !important;
      }

      .store-themed-modal .dialog-description {
        color: var(--foreground) !important;
        opacity: 0.8;
      }

      .store-themed-modal .input {
        background-color: var(--background) !important;
        border-color: var(--primary) !important;
        color: var(--foreground) !important;
      }

      .store-themed-modal .input:focus {
        border-color: var(--primary) !important;
        box-shadow: 0 0 0 2px ${theme.primaryColor}20 !important;
      }

      .store-themed-modal .label {
        color: var(--foreground) !important;
      }

      .store-themed-modal .button-primary {
        background-color: var(--primary) !important;
        color: var(--primary-foreground) !important;
        border-color: var(--primary) !important;
      }

      .store-themed-modal .button-primary:hover {
        background-color: var(--secondary) !important;
        border-color: var(--secondary) !important;
      }

      .store-themed-modal .button-outline {
        background-color: transparent !important;
        color: var(--foreground) !important;
        border-color: var(--primary) !important;
      }

      .store-themed-modal .button-outline:hover {
        background-color: var(--primary) !important;
        color: var(--primary-foreground) !important;
      }

      .store-themed-modal .error-message {
        background-color: #fef2f2 !important;
        border-color: #fecaca !important;
        color: #dc2626 !important;
      }

      .store-themed-modal .helper-text {
        color: var(--foreground) !important;
        opacity: 0.6;
      }

      .store-themed-modal .consent-text {
        color: var(--foreground) !important;
        opacity: 0.7;
      }

      .store-themed-modal .consent-link {
        color: var(--primary) !important;
      }

      .store-themed-modal .consent-link:hover {
        color: var(--secondary) !important;
      }

      .store-themed-modal .icon {
        color: var(--primary) !important;
      }
    `;

    styleElement.textContent = customCSS;
  }, [theme]);

  return {
    theme,
    isLoading: loading,
  };
}

// Função auxiliar para calcular cor de contraste
function getContrastColor(hexColor: string): string {
  // Remove o # se presente
  const hex = hexColor.replace('#', '');
  
  // Converte para RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calcula luminância
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Retorna branco ou preto baseado na luminância
  return luminance > 0.5 ? '#000000' : '#ffffff';
}