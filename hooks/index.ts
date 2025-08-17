// Hooks para autenticação e usuários
export { useAuth, useCreateUser, useDeleteUser, useUpdateUser, useUser, useUsers } from './useAuth'

// Hooks para lojas
export {
  useApproveStore, useApprovedStores, useCreateStore, useDeleteStore, usePendingStores, useRejectStore, useStore, useStoreStats, useStores, useUpdateStore
} from './useStores'

// Hooks para produtos e categorias
export {
  useActiveProducts, useCategories, useCreateCategory, useCreateProduct, useDeleteCategory, useDeleteProduct, useProduct, useProducts, useProductsByCategory, useSearchProducts, useUpdateCategory, useUpdateProduct
} from './useProducts'

// Hooks para pedidos
export {
  useCancelOrder, useCancelledOrders, useCreateOrder, useDeliveredOrders, useDeliveringOrders, useDeliveryOrders, useOrder,
  useOrderStats, useOrders, useOrdersByPeriod, useOrdersByStatus, useOrdersByType, usePendingOrders, usePickupOrders, usePreparingOrders,
  useReadyOrders, useUpdateOrder
} from './useOrders'

// Hooks existentes (manter compatibilidade)
export { useCardapioAuth } from './useCardapioAuth'

// Hooks para dashboard
export { useDashboardStats, type DashboardStats } from './useDashboardStats'

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
        status: 'PENDING',
        paymentStatus: 'PENDING',
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
  mutate: (data: any) => { },
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

export const useToggleProductAvailability = () => ({
  mutate: (data: any) => { },
  isLoading: false
});

