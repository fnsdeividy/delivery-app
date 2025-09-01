import { useState, useEffect } from 'react';
import { Product } from '../types/cardapio-api';

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  notes?: string;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

export function useCart() {
  const [cart, setCart] = useState<Cart>({
    items: [],
    total: 0,
    itemCount: 0,
  });

  // Carregar carrinho do localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('delivery-cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCart(parsedCart);
      } catch (error) {
        console.error('Erro ao carregar carrinho:', error);
      }
    }
  }, []);

  // Salvar carrinho no localStorage
  useEffect(() => {
    localStorage.setItem('delivery-cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product, quantity: number = 1, notes?: string) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.items.findIndex(
        item => item.product.id === product.id
      );

      let newItems: CartItem[];

      if (existingItemIndex >= 0) {
        // Produto já existe no carrinho, atualizar quantidade
        newItems = prevCart.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + quantity, notes }
            : item
        );
      } else {
        // Novo produto no carrinho
        newItems = [
          ...prevCart.items,
          {
            id: `${product.id}-${Date.now()}`,
            product,
            quantity,
            notes,
          },
        ];
      }

      const total = newItems.reduce(
        (sum, item) => sum + (item.product.price * item.quantity),
        0
      );

      const itemCount = newItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      return {
        items: newItems,
        total,
        itemCount,
      };
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prevCart => {
      const newItems = prevCart.items.filter(item => item.id !== itemId);
      
      const total = newItems.reduce(
        (sum, item) => sum + (item.product.price * item.quantity),
        0
      );

      const itemCount = newItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      return {
        items: newItems,
        total,
        itemCount,
      };
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCart(prevCart => {
      const newItems = prevCart.items.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      );

      const total = newItems.reduce(
        (sum, item) => sum + (item.product.price * item.quantity),
        0
      );

      const itemCount = newItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      return {
        items: newItems,
        total,
        itemCount,
      };
    });
  };

  const clearCart = () => {
    setCart({
      items: [],
      total: 0,
      itemCount: 0,
    });
  };

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  };
}
