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

const initialCart: Cart = {
  items: [],
  total: 0,
  itemCount: 0,
};

export function useCart() {
  const [cart, setCart] = useState<Cart>(initialCart);
  const [isInitialized, setIsInitialized] = useState(false);

  // Carregar carrinho do localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('delivery-cart');
      console.log('🔍 Carregando carrinho do localStorage:', savedCart);
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          console.log('✅ Carrinho carregado com sucesso:', parsedCart);
          setCart(parsedCart);
        } catch (error) {
          console.error('❌ Erro ao carregar carrinho:', error);
        }
      } else {
        console.log('📝 Nenhum carrinho salvo encontrado');
      }
    }
    setIsInitialized(true);
  }, []);

  // Salvar carrinho no localStorage (apenas após inicialização)
  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      console.log('💾 Salvando carrinho no localStorage:', cart);
      localStorage.setItem('delivery-cart', JSON.stringify(cart));
    }
  }, [cart, isInitialized]);

  const addToCart = (product: Product, quantity: number = 1, notes?: string) => {
    console.log('🛒 Adicionando produto ao carrinho:', { product: product.name, quantity, notes });
    setCart(prevCart => {
      console.log('📋 Estado anterior do carrinho:', prevCart);
      const existingItemIndex = prevCart.items.findIndex(
        item => item.product.id === product.id
      );

      let newItems: CartItem[];

      if (existingItemIndex >= 0) {
        console.log('🔄 Produto já existe, atualizando quantidade');
        // Produto já existe no carrinho, atualizar quantidade
        newItems = prevCart.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + quantity, notes }
            : item
        );
      } else {
        console.log('➕ Novo produto sendo adicionado');
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

      const newCart = {
        items: newItems,
        total,
        itemCount,
      };

      console.log('✨ Novo estado do carrinho:', newCart);
      return newCart;
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
