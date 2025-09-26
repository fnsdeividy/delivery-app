// Tipos compartilhados para formulários de produto

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Ingredient {
  name: string;
  included: boolean;
  removable: boolean;
}

export interface Addon {
  name: string;
  price: number;
  category: string;
  maxQuantity: number;
  active: boolean;
}

export type UIIngredient = {
  id: string;
  name: string;
  selected: boolean;
};

export type UIAddon = {
  id: string;
  name: string;
  priceText: string;
  price: number;
};

export type BaseOptions = {
  breadType?: string;
  doneness?: string;
  doughType?: string;
  pizzaSize?: string;
  beverageSize?: string;
};

export interface ProductFormData {
  storeSlug: string;
  name: string;
  categoryId: string;
  priceStr: string;
  originalPriceStr: string;
  description: string;
  image?: string;
  active: boolean;
  initialStockStr: string;
  minStockStr: string;
  preparationTime: number;
}
