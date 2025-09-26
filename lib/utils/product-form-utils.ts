// Funções utilitárias para formulários de produto

export const sanitizeLetters = (value: string | undefined | null) => {
  if (!value || typeof value !== "string") return "";
  return value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s]/g, "");
};

export const sanitizeInteger = (value: string | undefined | null) => {
  if (!value || typeof value !== "string") return "";
  return value.replace(/[^\d]/g, "");
};

export const sanitizeDecimalToString = (value: string | undefined | null) => {
  if (!value || typeof value !== "string") return "";
  let v = value.replace(/[^0-9.,-]/g, "");
  if (v.includes("-")) {
    const neg = v.startsWith("-") ? "-" : "";
    v = neg + v.replace(/-/g, "");
  }
  v = v.replace(/,/g, ".");
  const parts = v.split(".");
  if (parts.length > 2) {
    v = parts[0] + "." + parts.slice(1).join("");
  }
  return v;
};

export const parseDecimal = (value: string): number => {
  const normalized = sanitizeDecimalToString(value);
  const n = Number(normalized);
  return isNaN(n) ? 0 : n;
};

export const isValidUrlOrEmpty = (value?: string) => {
  if (!value) return true;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

export const formatBRL = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  }).format(value);

// Catálogos default
export const DEFAULT_INGREDIENTS = {
  HAMBURGUER: [
    "Pão Brioche",
    "Hambúrguer 160g",
    "Queijo Mussarela",
    "Alface",
    "Tomate",
    "Cebola Roxa",
    "Molho da Casa",
  ],
  PIZZA: [
    "Molho de Tomate",
    "Mussarela",
    "Orégano",
    "Azeitona",
    "Tomate Fatiado",
    "Manjericão",
  ],
  BEBIDA: ["Gelo", "Limão"],
};

export const DEFAULT_ADDONS = [
  "Mais Queijo",
  "Bacon",
  "Cheddar",
  "Calabresa",
  "Catupiry",
  "Pepperoni",
];