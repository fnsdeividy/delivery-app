"use client";

import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { ProductCustomization } from "../components/products/ProductCustomizationModal";
import { parsePrice } from "../lib/utils/price";
import { Product } from "../types/cardapio-api";

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  notes?: string;
  customizations?: ProductCustomization;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
  storeSlug?: string;
}

interface CartContextType {
  cart: Cart;
  addToCart: (
    product: Product,
    quantity?: number,
    customizations?: ProductCustomization
  ) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
}

const initialCart: Cart = {
  items: [],
  total: 0,
  itemCount: 0,
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({
  children,
  storeSlugParam,
}: {
  children: ReactNode;
  storeSlugParam?: string;
}) {
  const [cart, setCart] = useState<Cart>(initialCart);
  const [isInitialized, setIsInitialized] = useState(false);

  // Determinar o storeSlug para este provedor
  const storeSlug = storeSlugParam;

  // Chave específica para o carrinho da loja atual
  const cartKey = storeSlug ? `delivery-cart-${storeSlug}` : "delivery-cart";

  // Carregar carrinho do localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem(cartKey);
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          setCart(parsedCart);
        } catch {
          // erro de parse ignorado
        }
      }
    }
    setIsInitialized(true);
  }, [cartKey]);

  // Salvar carrinho no localStorage (apenas após inicialização)
  useEffect(() => {
    if (isInitialized && typeof window !== "undefined") {
      const cartToSave = {
        ...cart,
        storeSlug: storeSlug || cart.storeSlug,
      };
      localStorage.setItem(cartKey, JSON.stringify(cartToSave));
    }
  }, [cart, isInitialized, cartKey, storeSlug]);

  const addToCart = (
    product: Product,
    quantity: number = 1,
    customizations?: ProductCustomization
  ) => {
    setCart((prevCart) => {
      // Para produtos personalizados, sempre criar um novo item (não agrupar)
      const shouldGroupItems = !customizations;

      const existingItemIndex = shouldGroupItems
        ? prevCart.items.findIndex(
            (item) => item.product.id === product.id && !item.customizations
          )
        : -1;

      let newItems: CartItem[];

      if (existingItemIndex >= 0) {
        newItems = prevCart.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        newItems = [
          ...prevCart.items,
          {
            id: `${product.id}-${Date.now()}-${Math.random()}`,
            product,
            quantity,
            customizations,
          },
        ];
      }

      const total = newItems.reduce((sum, item) => {
        let itemPrice = parsePrice(item.product.price);

        // Adicionar preço dos addons se houver personalizações
        if (item.customizations?.selectedAddons) {
          Object.entries(item.customizations.selectedAddons).forEach(
            ([addonId, addonQuantity]) => {
              const addon = item.product.addons?.find((a) => a.id === addonId);
              if (addon) {
                itemPrice += parsePrice(addon.price) * addonQuantity;
              }
            }
          );
        }

        return sum + itemPrice * item.quantity;
      }, 0);

      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      return {
        items: newItems,
        total,
        itemCount,
        storeSlug: prevCart.storeSlug,
      };
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prevCart) => {
      const newItems = prevCart.items.filter((item) => item.id !== itemId);

      const total = newItems.reduce((sum, item) => {
        let itemPrice = parsePrice(item.product.price);

        // Adicionar preço dos addons se houver personalizações
        if (item.customizations?.selectedAddons) {
          Object.entries(item.customizations.selectedAddons).forEach(
            ([addonId, addonQuantity]) => {
              const addon = item.product.addons?.find((a) => a.id === addonId);
              if (addon) {
                itemPrice += parsePrice(addon.price) * addonQuantity;
              }
            }
          );
        }

        return sum + itemPrice * item.quantity;
      }, 0);

      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      return {
        items: newItems,
        total,
        itemCount,
        storeSlug: prevCart.storeSlug,
      };
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCart((prevCart) => {
      const newItems = prevCart.items.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      );

      const total = newItems.reduce((sum, item) => {
        let itemPrice = parsePrice(item.product.price);

        // Adicionar preço dos addons se houver personalizações
        if (item.customizations?.selectedAddons) {
          Object.entries(item.customizations.selectedAddons).forEach(
            ([addonId, addonQuantity]) => {
              const addon = item.product.addons?.find((a) => a.id === addonId);
              if (addon) {
                itemPrice += parsePrice(addon.price) * addonQuantity;
              }
            }
          );
        }

        return sum + itemPrice * item.quantity;
      }, 0);

      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      return {
        items: newItems,
        total,
        itemCount,
        storeSlug: prevCart.storeSlug,
      };
    });
  };

  const clearCart = () => {
    setCart({
      items: [],
      total: 0,
      itemCount: 0,
      storeSlug,
    });
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart deve ser usado dentro de um CartProvider");
  }
  return context;
};
