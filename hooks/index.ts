import { OrderStatus, PaymentStatus } from '@/types/cardapio-api';

// Hooks da API Cardap.IO
export * from './useCardapioAuth';
export * from './useCreateStore';

// Hooks temporários para permitir build
export const useOrdersByStore = (slug: string) => ({ 
  data: { 
    data: [
      {
        id: '1',
        customer: { 
          name: 'Cliente Teste', 
          phone: '11999999999',
          email: 'cliente@teste.com'
        },
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        deliveryType: 'delivery',
        items: [
          {
            quantity: 2,
            productName: 'Produto Teste'
          }
        ],
        total: 25.90,
        createdAt: new Date().toISOString()
      }
    ] 
  }, 
  isLoading: false, 
  error: null,
  refetch: () => Promise.resolve()
});
export const useUpdateOrderStatus = () => ({ 
  mutate: (data: any) => {}, 
  mutateAsync: async (data: any) => Promise.resolve(),
  isLoading: false 
});
export const useProductsByStore = (slug: string) => ({ 
  data: { 
    data: [
      {
        id: '1',
        name: 'Produto Teste',
        description: 'Descrição do produto teste',
        price: 25.90,
        categoryId: '1',
        storeId: '1',
        image: 'https://via.placeholder.com/40x40?text=?',
        isAvailable: true,
        stockQuantity: 10,
        preparationTime: 15,
        allergens: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ] 
  }, 
  isLoading: false, 
  error: null,
  refetch: () => Promise.resolve()
});
export const useCategoriesByStore = (slug: string) => ({ 
  data: { 
    data: [
      {
        id: '1',
        name: 'Categoria Teste',
        active: true
      }
    ] 
  }, 
  isLoading: false, 
  error: null,
  refetch: () => Promise.resolve()
});
export const useCreateProduct = () => ({ mutate: (data: any) => {}, isLoading: false });
export const useUpdateProduct = () => ({ mutate: (data: any) => {}, isLoading: false });
export const useDeleteProduct = () => ({ mutate: (data: any) => {}, isLoading: false });
export const useToggleProductAvailability = () => ({ mutate: (data: any) => {}, isLoading: false });
export const useStores = () => ({ 
  data: { 
    data: [
      {
        id: '1',
        name: 'Loja Teste',
        slug: 'loja-teste',
        description: 'Descrição da loja teste',
        active: true,
        approved: true,
        createdAt: new Date().toISOString(),
        _count: {
          users: 5,
          products: 25,
          orders: 150
        }
      }
    ] 
  }, 
  isLoading: false, 
  error: null,
  refetch: () => Promise.resolve()
});
export const useUpdateStore = () => ({ 
  mutate: (data: any) => {}, 
  mutateAsync: async (data: any) => Promise.resolve(),
  isLoading: false 
});
export const useDeleteStore = () => ({ 
  mutate: (data: any) => {}, 
  mutateAsync: async (data: any) => Promise.resolve(),
  isLoading: false 
});
export const useApproveStore = () => ({ 
  mutate: (data: any) => {}, 
  mutateAsync: async (data: any) => Promise.resolve(),
  isLoading: false 
});
export const useRejectStore = () => ({ 
  mutate: (data: any) => {}, 
  mutateAsync: async (data: any) => Promise.resolve(),
  isLoading: false 
});

