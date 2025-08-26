/**
 * Utilitários para validação de cores e cálculo de contraste WCAG
 */

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface ColorValidationResult {
  isValid: boolean;
  normalized?: string;
  error?: string;
}

export interface ContrastResult {
  contrast: number;
  meetsWCAGAA: boolean;
  meetsWCAGAAA: boolean;
  warning?: string;
}

/**
 * Converte cor hexadecimal para RGB
 */
export const hexToRgb = (hex: string): RGB | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

/**
 * Converte RGB para hexadecimal
 */
export const rgbToHex = (r: number, g: number, b: number): string => {
  const toHex = (c: number) => {
    const hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
};

/**
 * Normaliza cor hexadecimal para formato padrão #RRGGBB
 */
export const normalizeHex = (hex: string): string => {
  // Remover # se existir
  hex = hex.replace("#", "");

  // Se for 3 caracteres, expandir para 6
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("");
  }

  // Validar se tem 6 caracteres hexadecimais
  if (!/^[0-9A-Fa-f]{6}$/.test(hex)) {
    throw new Error("Formato de cor inválido");
  }

  return `#${hex.toUpperCase()}`;
};

/**
 * Valida se uma cor hexadecimal é válida
 */
export const validateHexColor = (color: string): ColorValidationResult => {
  try {
    const normalized = normalizeHex(color);
    return {
      isValid: true,
      normalized,
    };
  } catch (err) {
    return {
      isValid: false,
      error: "Formato de cor inválido. Use #RRGGBB ou #RGB",
    };
  }
};

/**
 * Calcula a luminância relativa de uma cor (padrão WCAG)
 */
export const calculateLuminance = (r: number, g: number, b: number): number => {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

/**
 * Calcula o contraste entre duas cores
 */
export const calculateContrast = (color1: string, color2: string): number => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 0;

  const lum1 = calculateLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = calculateLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Avalia se o contraste atende aos padrões WCAG
 */
export const evaluateContrast = (
  color1: string,
  color2: string
): ContrastResult => {
  const contrast = calculateContrast(color1, color2);

  const meetsWCAGAA = contrast >= 4.5; // Contraste normal
  const meetsWCAGAAA = contrast >= 7; // Contraste alto

  let warning: string | undefined;

  if (contrast < 3) {
    warning = "Contraste muito baixo - pode ser ilegível";
  } else if (contrast < 4.5) {
    warning = "Contraste abaixo do recomendado para WCAG AA";
  } else if (contrast < 7) {
    warning = "Contraste adequado para WCAG AA, mas não para AAA";
  }

  return {
    contrast,
    meetsWCAGAA,
    meetsWCAGAAA,
    warning,
  };
};

/**
 * Gera uma cor de texto legível para um fundo específico
 */
export const generateReadableTextColor = (backgroundColor: string): string => {
  const rgb = hexToRgb(backgroundColor);
  if (!rgb) return "#000000";

  const luminance = calculateLuminance(rgb.r, rgb.g, rgb.b);

  // Se o fundo for claro, usar texto escuro; se escuro, usar texto claro
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
};

/**
 * Ajusta uma cor para melhorar o contraste com outra cor
 */
export const adjustColorForContrast = (
  baseColor: string,
  targetColor: string,
  minContrast: number = 4.5
): string => {
  const rgb = hexToRgb(baseColor);
  if (!rgb) return baseColor;

  let adjustedColor = baseColor;
  let currentContrast = calculateContrast(adjustedColor, targetColor);

  // Tentar ajustar a luminância para melhorar o contraste
  if (currentContrast < minContrast) {
    const targetLuminance = calculateLuminance(
      hexToRgb(targetColor)?.r || 0,
      hexToRgb(targetColor)?.g || 0,
      hexToRgb(targetColor)?.b || 0
    );

    // Calcular luminância alvo para atingir o contraste desejado
    const targetLum =
      targetLuminance > 0.5
        ? (targetLuminance + 0.05) / minContrast - 0.05
        : (targetLuminance + 0.05) * minContrast - 0.05;

    // Ajustar a cor base para atingir a luminância alvo
    const factor = targetLum / calculateLuminance(rgb.r, rgb.g, rgb.b);

    const newR = Math.max(0, Math.min(255, Math.round(rgb.r * factor)));
    const newG = Math.max(0, Math.min(255, Math.round(rgb.g * factor)));
    const newB = Math.max(0, Math.min(255, Math.round(rgb.b * factor)));

    adjustedColor = rgbToHex(newR, newG, newB);
  }

  return adjustedColor;
};

/**
 * Verifica se uma combinação de cores é acessível
 */
export const isColorCombinationAccessible = (
  color1: string,
  color2: string,
  level: "AA" | "AAA" = "AA"
): boolean => {
  const contrast = calculateContrast(color1, color2);
  const minContrast = level === "AA" ? 4.5 : 7;

  return contrast >= minContrast;
};

/**
 * Gera uma paleta de cores acessíveis baseada em uma cor primária
 */
export const generateAccessiblePalette = (
  primaryColor: string
): {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
} => {
  const rgb = hexToRgb(primaryColor);
  if (!rgb) {
    // Fallback para cores padrão
    return {
      primary: "#d97706",
      secondary: "#92400e",
      accent: "#f59e0b",
      background: "#fef3c7",
      text: "#1f2937",
    };
  }

  // Gerar cores complementares
  const secondary = rgbToHex(
    Math.max(0, Math.min(255, rgb.r + 30)),
    Math.max(0, Math.min(255, rgb.g + 30)),
    Math.max(0, Math.min(255, rgb.b + 30))
  );

  const accent = rgbToHex(
    Math.max(0, Math.min(255, rgb.r - 20)),
    Math.max(0, Math.min(255, rgb.g - 20)),
    Math.max(0, Math.min(255, rgb.b - 20))
  );

  // Gerar fundo claro
  const background = rgbToHex(
    Math.max(0, Math.min(255, rgb.r + 200)),
    Math.max(0, Math.min(255, rgb.g + 200)),
    Math.max(0, Math.min(255, rgb.b + 200))
  );

  // Gerar texto legível
  const text = generateReadableTextColor(background);

  return {
    primary: primaryColor,
    secondary,
    accent,
    background,
    text,
  };
};
