import { apiClient } from '@/lib/api-client'
import { useQuery } from '@tanstack/react-query'

export interface DashboardStats {
  totalStores: number
  activeStores: number
  pendingStores: number
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  totalUsers: number
}

export function useDashboardStats(userRole: string | null, storeSlug?: string | null) {
  return useQuery({
    queryKey: ['dashboard', 'stats', userRole, storeSlug],
    queryFn: async (): Promise<DashboardStats> => {
      try {
        console.log('📊 Dashboard: Buscando estatísticas para role:', userRole, 'storeSlug:', storeSlug)
        
        let stats: DashboardStats = {
          totalStores: 0,
          activeStores: 0,
          pendingStores: 0,
          totalProducts: 0,
          totalOrders: 0,
          totalRevenue: 0,
          totalUsers: 0
        }

        if (userRole === 'SUPER_ADMIN') {
          // Super admin vê todas as estatísticas
          console.log('👑 Dashboard: Super admin - buscando todas as estatísticas')
          
          // Buscar todas as lojas
          const storesResponse = await apiClient.getStores(1, 1000)
          const stores = storesResponse.data || []
          
          stats.totalStores = stores.length
          stats.activeStores = stores.filter(store => store.active).length
          stats.pendingStores = stores.filter(store => !store.approved).length
          
          // Calcular produtos e pedidos totais
          let totalProducts = 0
          let totalOrders = 0
          let totalRevenue = 0
          
          for (const store of stores) {
            try {
              // Buscar produtos da loja
              const productsResponse = await apiClient.getProducts(store.slug, 1, 1000)
              totalProducts += (productsResponse.data || []).length
              
              // Buscar pedidos da loja
              const ordersResponse = await apiClient.getOrders(store.slug, 1, 1000)
              const orders = ordersResponse.data || []
              totalOrders += orders.length
              
              // Calcular receita (assumindo que cada pedido tem um valor)
              totalRevenue += orders.reduce((sum, order) => sum + (order.total || 0), 0)
            } catch (error) {
              console.warn(`⚠️ Dashboard: Erro ao buscar dados da loja ${store.slug}:`, error)
            }
          }
          
          stats.totalProducts = totalProducts
          stats.totalOrders = totalOrders
          stats.totalRevenue = totalRevenue
          
        } else if (userRole === 'ADMIN' && storeSlug) {
          // ADMIN vê estatísticas apenas da sua loja
          console.log('🏪 Dashboard: ADMIN - buscando estatísticas da loja:', storeSlug)
          
          try {
            // Buscar dados da loja específica
            const store = await apiClient.getStore(storeSlug)
            stats.totalStores = 1
            stats.activeStores = store.active ? 1 : 0
            stats.pendingStores = store.approved ? 0 : 1
            
            // Buscar produtos da loja
            const productsResponse = await apiClient.getProducts(storeSlug, 1, 1000)
            stats.totalProducts = (productsResponse.data || []).length
            
            // Buscar pedidos da loja
            const ordersResponse = await apiClient.getOrders(storeSlug, 1, 1000)
            const orders = ordersResponse.data || []
            stats.totalOrders = orders.length
            
            // Calcular receita
            stats.totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0)
            
          } catch (error) {
            console.error('❌ Dashboard: Erro ao buscar dados da loja:', error)
          }
        } else {
          console.log('ℹ️ Dashboard: Usuário sem permissões ou role não reconhecido')
        }
        
        console.log('✅ Dashboard: Estatísticas calculadas:', stats)
        return stats
        
      } catch (error) {
        console.error('❌ Dashboard: Erro ao buscar estatísticas:', error)
        throw error
      }
    },
    enabled: !!userRole, // Só executa quando userRole estiver disponível
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
  })
} 