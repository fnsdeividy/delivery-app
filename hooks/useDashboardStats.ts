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
          // Super admin vê todas as estatísticas do sistema
          const storesStatsResponse = await apiClient.get('/api/v1/stores/stats')
          const storesStats = storesStatsResponse as any

          stats.totalStores = storesStats.total || 0
          stats.activeStores = storesStats.active || 0
          stats.pendingStores = storesStats.pending || 0

          try {
            const allStoresResponse = await apiClient.get('/api/v1/stores')
            const allStores = (allStoresResponse as any).data || []

            let totalProducts = 0
            let totalOrders = 0
            let totalRevenue = 0

            // Para cada loja, buscar produtos e pedidos
            for (const store of allStores) {
              try {
                // Buscar produtos da loja
                const productsResponse = await apiClient.get(`/api/v1/stores/${store.slug}/products`)
                const products = (productsResponse as any).data || []
                totalProducts += products.length

                // Buscar pedidos da loja
                const ordersResponse = await apiClient.get(`/api/v1/stores/${store.slug}/orders`)
                const orders = (ordersResponse as any).data || []
                totalOrders += orders.length

                // Calcular receita total
                totalRevenue += orders.reduce((sum: number, order: any) => {
                  return sum + (parseFloat(order.total) || 0)
                }, 0)
              } catch (error) {
                console.warn(`Erro ao buscar dados da loja ${store.slug}:`, error)
              }
            }

            stats.totalProducts = totalProducts
            stats.totalOrders = totalOrders
            stats.totalRevenue = totalRevenue

          } catch (error) {
            console.warn('Erro ao buscar estatísticas gerais:', error)
          }


        } else if (userRole === 'ADMIN' && storeSlug) {

          // ADMIN vê estatísticas apenas da sua loja
          try {
            // Buscar dados da loja específica
            const store = await apiClient.getStoreBySlug(storeSlug)

            if (store) {
              stats.totalStores = 1
              stats.activeStores = store.active ? 1 : 0
              stats.pendingStores = store.approved ? 0 : 1

              // Buscar produtos da loja
              try {
                const productsResponse = await apiClient.getProducts(storeSlug, 1, 1000)
                stats.totalProducts = (productsResponse.data || []).length
              } catch (error) {
                console.warn('Erro ao buscar produtos da loja:', error)
                stats.totalProducts = 0
              }

              // Buscar pedidos da loja
              try {
                const ordersResponse = await apiClient.getOrders(storeSlug, 1, 1000)
                const orders = ordersResponse.data || []
                stats.totalOrders = orders.length

                // Calcular receita
                stats.totalRevenue = orders.reduce((sum: number, order: any) => {
                  return sum + (parseFloat(order.total) || 0)
                }, 0)
              } catch (error) {
                console.warn('Erro ao buscar pedidos da loja:', error)
                stats.totalOrders = 0
                stats.totalRevenue = 0
              }
            }
          } catch (error) {
            console.error('Erro ao buscar dados da loja:', error)
          }
        }

        return stats

      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error)
        throw error
      }
    },
    enabled: !!userRole, // Só executa quando userRole estiver disponível
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  })
} 