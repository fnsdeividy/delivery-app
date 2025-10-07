import { StoreManagement } from '@/components/StoreManagement'
import { ToastProvider } from '@/components/Toast'
import { AuthProvider } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api-client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import React from 'react'

// Mock do apiClient
jest.mock('@/lib/api-client')
const mockApiClient = apiClient as jest.Mocked<typeof apiClient>

// Wrapper para testes
function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

describe('Gerenciamento de Lojas - Integração', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const mockStores = [
    {
      id: 'store-1',
      name: 'Restaurante A',
      slug: 'restaurante-a',
      description: 'Restaurante de comida brasileira',
      config: {
        address: 'Rua A, 123 - São Paulo, SP',
        phone: '+5511999999999',
        email: 'contato@restaurantea.com',
        category: 'Restaurante',
        deliveryFee: 8.0,
        minimumOrder: 25.0,
        estimatedDeliveryTime: 45,
        businessHours: {},
        paymentMethods: ['CASH', 'CREDIT_CARD', 'PIX']
      },
      active: true,
      approved: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'store-2',
      name: 'Pizzaria B',
      slug: 'pizzaria-b',
      description: 'Pizzaria tradicional italiana',
      config: {
        address: 'Rua B, 456 - São Paulo, SP',
        phone: '+5511888888888',
        email: 'contato@pizzariab.com',
        category: 'Pizzaria',
        deliveryFee: 6.0,
        minimumOrder: 30.0,
        estimatedDeliveryTime: 35,
        businessHours: {},
        paymentMethods: ['CASH', 'CREDIT_CARD', 'PIX']
      },
      active: true,
      approved: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]

  const mockPaginatedStores = {
    data: mockStores,
    pagination: {
      page: 1,
      limit: 10,
      total: 2,
      totalPages: 1
    }
  }

  describe('Listagem de Lojas', () => {
    it('deve carregar e exibir lista de lojas', async () => {
      mockApiClient.getStores.mockResolvedValue(mockPaginatedStores)

      render(
        <TestWrapper>
          <StoreManagement />
        </TestWrapper>
      )

      // Aguardar carregamento
      await waitFor(() => {
        expect(screen.getByText('Gerenciamento de Lojas')).toBeInTheDocument()
      })

      // Verificar se as lojas são exibidas
      expect(screen.getByText('Restaurante A')).toBeInTheDocument()
      expect(screen.getByText('Pizzaria B')).toBeInTheDocument()
      expect(screen.getByText('restaurante-a')).toBeInTheDocument()
      expect(screen.getByText('pizzaria-b')).toBeInTheDocument()
    })

    it('deve filtrar lojas por busca', async () => {
      mockApiClient.getStores.mockResolvedValue(mockPaginatedStores)

      render(
        <TestWrapper>
          <StoreManagement />
        </TestWrapper>
      )

      // Aguardar carregamento
      await waitFor(() => {
        expect(screen.getByText('Restaurante A')).toBeInTheDocument()
      })

      // Buscar por "Pizzaria"
      const searchInput = screen.getByPlaceholderText('Buscar lojas...')
      fireEvent.change(searchInput, { target: { value: 'Pizzaria' } })

      // Verificar se apenas a pizzaria é exibida
      expect(screen.queryByText('Restaurante A')).not.toBeInTheDocument()
      expect(screen.getByText('Pizzaria B')).toBeInTheDocument()
    })
  })

  describe('Criação de Loja', () => {
    it('deve criar nova loja com sucesso', async () => {
      const newStore = {
        id: 'store-3',
        name: 'Nova Loja',
        slug: 'nova-loja',
        description: 'Nova loja de teste',
        config: {
          address: 'Rua C, 789 - São Paulo, SP',
          phone: '+5511777777777',
          email: 'contato@novaloja.com',
          category: 'Teste',
          deliveryFee: 5.0,
          minimumOrder: 20.0,
          estimatedDeliveryTime: 30,
          businessHours: {},
          paymentMethods: ['CASH', 'PIX']
        },
        active: true,
        approved: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      mockApiClient.getStores.mockResolvedValue(mockPaginatedStores)
      mockApiClient.createStore.mockResolvedValue(newStore)

      render(
        <TestWrapper>
          <StoreManagement />
        </TestWrapper>
      )

      // Aguardar carregamento
      await waitFor(() => {
        expect(screen.getByText('Gerenciamento de Lojas')).toBeInTheDocument()
      })

      // Abrir modal de criação
      fireEvent.click(screen.getByText('+ Nova Loja'))

      // Preencher formulário
      fireEvent.change(screen.getByLabelText(/nome da loja/i), {
        target: { value: 'Nova Loja' }
      })
      fireEvent.change(screen.getByLabelText(/slug da loja/i), {
        target: { value: 'nova-loja' }
      })
      fireEvent.change(screen.getByLabelText(/descrição/i), {
        target: { value: 'Nova loja de teste' }
      })
      fireEvent.change(screen.getByLabelText(/endereço/i), {
        target: { value: 'Rua C, 789 - São Paulo, SP' }
      })
      fireEvent.change(screen.getByLabelText(/telefone/i), {
        target: { value: '+5511777777777' }
      })
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'contato@novaloja.com' }
      })
      fireEvent.change(screen.getByLabelText(/categoria/i), {
        target: { value: 'Teste' }
      })
      fireEvent.change(screen.getByLabelText(/taxa de entrega/i), {
        target: { value: '5.0' }
      })
      fireEvent.change(screen.getByLabelText(/pedido mínimo/i), {
        target: { value: '20.0' }
      })

      // Submeter formulário
      fireEvent.click(screen.getByRole('button', { name: /criar/i }))

      // Aguardar criação
      await waitFor(() => {
        expect(mockApiClient.createStore).toHaveBeenCalledWith({
          name: 'Nova Loja',
          slug: 'nova-loja',
          description: 'Nova loja de teste',
          config: {
            address: 'Rua C, 789 - São Paulo, SP',
            phone: '+5511777777777',
            email: 'contato@novaloja.com',
            category: 'Teste',
            deliveryFee: 5.0,
            minimumOrder: 20.0,
            estimatedDeliveryTime: 30,
            businessHours: {
              monday: { open: true, openTime: '09:00', closeTime: '18:00' },
              tuesday: { open: true, openTime: '09:00', closeTime: '18:00' },
              wednesday: { open: true, openTime: '09:00', closeTime: '18:00' },
              thursday: { open: true, openTime: '09:00', closeTime: '18:00' },
              friday: { open: true, openTime: '09:00', closeTime: '18:00' },
              saturday: { open: true, openTime: '10:00', closeTime: '16:00' },
              sunday: { open: false }
            },
            paymentMethods: ['CASH', 'CREDIT_CARD', 'PIX']
          },
          active: true,
          approved: false
        })
      })
    })
  })

  describe('Edição de Loja', () => {
    it('deve editar loja existente com sucesso', async () => {
      mockApiClient.getStores.mockResolvedValue(mockPaginatedStores)
      mockApiClient.updateStore.mockResolvedValue({
        ...mockStores[0],
        name: 'Restaurante A Atualizado'
      })

      render(
        <TestWrapper>
          <StoreManagement />
        </TestWrapper>
      )

      // Aguardar carregamento
      await waitFor(() => {
        expect(screen.getByText('Restaurante A')).toBeInTheDocument()
      })

      // Abrir modal de edição
      const editButtons = screen.getAllByText('Editar')
      fireEvent.click(editButtons[0])

      // Verificar se o modal foi aberto
      await waitFor(() => {
        expect(screen.getByText('Editar Loja')).toBeInTheDocument()
      })

      // Alterar nome
      const nameInput = screen.getByLabelText(/nome da loja/i)
      fireEvent.change(nameInput, { target: { value: 'Restaurante A Atualizado' } })

      // Submeter formulário
      fireEvent.click(screen.getByRole('button', { name: /atualizar/i }))

      // Aguardar atualização
      await waitFor(() => {
        expect(mockApiClient.updateStore).toHaveBeenCalled()
      })
    })
  })

  describe('Aprovação/Rejeição de Lojas', () => {
    it('deve aprovar loja pendente', async () => {
      mockApiClient.getStores.mockResolvedValue(mockPaginatedStores)
      mockApiClient.approveStore.mockResolvedValue({
        ...mockStores[1],
        approved: true
      })

      render(
        <TestWrapper>
          <StoreManagement />
        </TestWrapper>
      )

      // Aguardar carregamento
      await waitFor(() => {
        expect(screen.getByText('Pizzaria B')).toBeInTheDocument()
      })

      // Aprovar loja
      const approveButtons = screen.getAllByText('Aprovar')
      fireEvent.click(approveButtons[0])

      // Aguardar aprovação
      await waitFor(() => {
        expect(mockApiClient.approveStore).toHaveBeenCalledWith('pizzaria-b')
      })
    })

    it('deve rejeitar loja pendente', async () => {
      mockApiClient.getStores.mockResolvedValue(mockPaginatedStores)
      mockApiClient.rejectStore.mockResolvedValue({
        ...mockStores[1],
        approved: false
      })

      render(
        <TestWrapper>
          <StoreManagement />
        </TestWrapper>
      )

      // Aguardar carregamento
      await waitFor(() => {
        expect(screen.getByText('Pizzaria B')).toBeInTheDocument()
      })

      // Rejeitar loja
      const rejectButtons = screen.getAllByText('Rejeitar')
      fireEvent.click(rejectButtons[0])

      // Aguardar rejeição
      await waitFor(() => {
        expect(mockApiClient.rejectStore).toHaveBeenCalledWith('pizzaria-b', undefined)
      })
    })
  })

  describe('Exclusão de Loja', () => {
    it('deve excluir loja com confirmação', async () => {
      // Mock do confirm
      global.confirm = jest.fn(() => true)

      mockApiClient.getStores.mockResolvedValue(mockPaginatedStores)
      mockApiClient.deleteStore.mockResolvedValue(undefined)

      render(
        <TestWrapper>
          <StoreManagement />
        </TestWrapper>
      )

      // Aguardar carregamento
      await waitFor(() => {
        expect(screen.getByText('Restaurante A')).toBeInTheDocument()
      })

      // Excluir loja
      const deleteButtons = screen.getAllByText('Excluir')
      fireEvent.click(deleteButtons[0])

      // Verificar confirmação
      expect(global.confirm).toHaveBeenCalledWith('Tem certeza que deseja excluir esta loja?')

      // Aguardar exclusão
      await waitFor(() => {
        expect(mockApiClient.deleteStore).toHaveBeenCalledWith('restaurante-a')
      })
    })

    it('deve cancelar exclusão quando usuário não confirmar', async () => {
      // Mock do confirm retornando false
      global.confirm = jest.fn(() => false)

      mockApiClient.getStores.mockResolvedValue(mockPaginatedStores)

      render(
        <TestWrapper>
          <StoreManagement />
        </TestWrapper>
      )

      // Aguardar carregamento
      await waitFor(() => {
        expect(screen.getByText('Restaurante A')).toBeInTheDocument()
      })

      // Tentar excluir loja
      const deleteButtons = screen.getAllByText('Excluir')
      fireEvent.click(deleteButtons[0])

      // Verificar confirmação
      expect(global.confirm).toHaveBeenCalledWith('Tem certeza que deseja excluir esta loja?')

      // Verificar se a exclusão não foi chamada
      expect(mockApiClient.deleteStore).not.toHaveBeenCalled()
    })
  })

  describe('Visualização de Estatísticas', () => {
    it('deve exibir estatísticas da loja selecionada', async () => {
      const mockStoreStats = {
        totalProducts: 25,
        totalOrders: 150,
        pendingOrders: 5,
        todaySales: 250.0,
        weekSales: 1200.0,
        lowStockProducts: 3,
        outOfStockProducts: 1
      }

      mockApiClient.getStores.mockResolvedValue(mockPaginatedStores)
      mockApiClient.getStoreStats.mockResolvedValue(mockStoreStats)

      render(
        <TestWrapper>
          <StoreManagement />
        </TestWrapper>
      )

      // Aguardar carregamento
      await waitFor(() => {
        expect(screen.getByText('Restaurante A')).toBeInTheDocument()
      })

      // Clicar em "Ver Stats" para a primeira loja
      const statsButtons = screen.getAllByText('Ver Stats')
      fireEvent.click(statsButtons[0])

      // Aguardar carregamento das estatísticas
      await waitFor(() => {
        expect(screen.getByText('Estatísticas - Restaurante A')).toBeInTheDocument()
      })

      // Verificar se as estatísticas são exibidas
      expect(screen.getByText('150')).toBeInTheDocument() // Total de Pedidos
      expect(screen.getByText('R$ 5000.00')).toBeInTheDocument() // Receita Total (corrigido formato)
      expect(screen.getByText('25')).toBeInTheDocument() // Total de Produtos
      expect(screen.getByText('80')).toBeInTheDocument() // Total de Clientes
    })
  })
}) 