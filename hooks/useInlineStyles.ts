import { useMemo } from 'react';

interface StoreTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
}

export function useInlineStyles(theme: StoreTheme | null) {
  return useMemo(() => {
    if (!theme) return {};

    return {
      primary: {
        backgroundColor: theme.primaryColor,
        color: getContrastColor(theme.primaryColor),
        borderColor: theme.primaryColor,
      },
      secondary: {
        backgroundColor: theme.secondaryColor,
        color: getContrastColor(theme.secondaryColor),
        borderColor: theme.secondaryColor,
      },
      background: {
        backgroundColor: theme.backgroundColor,
        color: theme.textColor,
      },
      accent: {
        backgroundColor: theme.accentColor,
        color: getContrastColor(theme.accentColor),
        borderColor: theme.accentColor,
      },
      text: {
        color: theme.textColor,
      },
      border: {
        borderColor: theme.primaryColor,
      },
    };
  }, [theme]);
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