import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/AuthContext'
import { ToastProvider } from '@/components/Toast'
import { LoginModal } from '@/components/LoginModal'
import { Dashboard } from '@/components/Dashboard'
import { apiClient } from '@/lib/api-client'

// Mock do apiClient
jest.mock('@/lib/api-client')
const mockApiClient = apiClient as jest.Mocked<typeof apiClient>

// Mock do router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

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

describe('Fluxo de Autenticação - Integração', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  describe('Login de Usuário', () => {
    it('deve fazer login completo e redirecionar para dashboard', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'ADMIN' as const,
        storeSlug: 'test-store',
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const mockAuthResponse = {
        access_token: 'mock-jwt-token',
        user: mockUser
      }

      // Mock do login
      mockApiClient.authenticate.mockResolvedValue(mockAuthResponse)

      render(
        <TestWrapper>
          <LoginModal isOpen={true} onClose={jest.fn()} />
        </TestWrapper>
      )

      // Preencher formulário
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' }
      })
      fireEvent.change(screen.getByLabelText(/senha/i), {
        target: { value: 'password123' }
      })

      // Submeter formulário
      fireEvent.click(screen.getByRole('button', { name: /entrar/i }))

      // Aguardar login
      await waitFor(() => {
        expect(mockApiClient.authenticate).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123'
        })
      })

      // Verificar se o token foi armazenado
      expect(localStorage.getItem('cardapio_token')).toBe('mock-jwt-token')
    })

    it('deve mostrar erro para credenciais inválidas', async () => {
      // Mock do erro de login
      mockApiClient.authenticate.mockRejectedValue(new Error('Credenciais inválidas'))

      render(
        <TestWrapper>
          <LoginModal isOpen={true} onClose={jest.fn()} />
        </TestWrapper>
      )

      // Preencher formulário
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'invalid@example.com' }
      })
      fireEvent.change(screen.getByLabelText(/senha/i), {
        target: { value: 'wrongpassword' }
      })

      // Submeter formulário
      fireEvent.click(screen.getByRole('button', { name: /entrar/i }))

      // Aguardar erro
      await waitFor(() => {
        expect(mockApiClient.authenticate).toHaveBeenCalled()
      })

      // Verificar se o erro foi exibido
      await waitFor(() => {
        expect(screen.getByText(/credenciais inválidas/i)).toBeInTheDocument()
      })
    })
  })

  describe('Registro de Usuário', () => {
    it('deve fazer registro completo e redirecionar', async () => {
      const mockUser = {
        id: '456',
        email: 'new@example.com',
        name: 'New User',
        role: 'CLIENTE' as const,
        storeSlug: null,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const mockAuthResponse = {
        access_token: 'mock-jwt-token',
        user: mockUser
      }

      // Mock do registro
      mockApiClient.register.mockResolvedValue(mockAuthResponse)

      render(
        <TestWrapper>
          <LoginModal isOpen={true} onClose={jest.fn()} />
        </TestWrapper>
      )

      // Mudar para modo de registro
      fireEvent.click(screen.getByText(/criar conta/i))

      // Preencher formulário
      fireEvent.change(screen.getByLabelText(/nome/i), {
        target: { value: 'New User' }
      })
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'new@example.com' }
      })
      fireEvent.change(screen.getByLabelText(/senha/i), {
        target: { value: 'password123' }
      })

      // Submeter formulário
      fireEvent.click(screen.getByRole('button', { name: /criar conta/i }))

      // Aguardar registro
      await waitFor(() => {
        expect(mockApiClient.register).toHaveBeenCalledWith({
          name: 'New User',
          email: 'new@example.com',
          password: 'password123',
          role: 'CLIENTE',
          storeSlug: '',
          phone: ''
        })
      })

      // Verificar se o token foi armazenado
      expect(localStorage.getItem('cardapio_token')).toBe('mock-jwt-token')
    })
  })

  describe('Dashboard com Usuário Autenticado', () => {
    it('deve mostrar dashboard para usuário autenticado', async () => {
      // Mock de dados de loja
      const mockStore = {
        id: 'store-123',
        name: 'Test Store',
        slug: 'test-store',
        description: 'Test store description',
        config: {
          address: 'Test Address',
          phone: '+5511999999999',
          email: 'store@test.com',
          category: 'Restaurant',
          deliveryFee: 5.0,
          minimumOrder: 20.0,
          estimatedDeliveryTime: 30,
          businessHours: {},
          paymentMethods: ['CASH', 'CREDIT_CARD']
        },
        active: true,
        approved: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const mockStoreStats = {
        totalOrders: 150,
        totalRevenue: 5000.0,
        totalProducts: 25,
        totalCustomers: 80
      }

      // Mock das APIs
      mockApiClient.getStoreBySlug.mockResolvedValue(mockStore)
      mockApiClient.getStoreStats.mockResolvedValue(mockStoreStats)

      // Simular usuário autenticado
      localStorage.setItem('cardapio_token', 'mock-token')

      render(
        <TestWrapper>
          <Dashboard storeSlug="test-store" />
        </TestWrapper>
      )

      // Aguardar carregamento
      await waitFor(() => {
        expect(screen.getByText(/dashboard - test store/i)).toBeInTheDocument()
      })

      // Verificar se as estatísticas são exibidas
      expect(screen.getByText('150')).toBeInTheDocument() // Total de Pedidos
      expect(screen.getByText('R$ 5000,00')).toBeInTheDocument() // Receita Total
      expect(screen.getByText('25')).toBeInTheDocument() // Total de Produtos
      expect(screen.getByText('80')).toBeInTheDocument() // Total de Clientes
    })

    it('deve mostrar mensagem de acesso negado para usuário não autenticado', () => {
      // Não definir token
      render(
        <TestWrapper>
          <Dashboard storeSlug="test-store" />
        </TestWrapper>
      )

      expect(screen.getByText(/acesso negado/i)).toBeInTheDocument()
      expect(screen.getByText(/você precisa estar logado para acessar o dashboard/i)).toBeInTheDocument()
    })
  })

  describe('Logout', () => {
    it('deve limpar token e redirecionar após logout', async () => {
      // Simular usuário autenticado
      localStorage.setItem('cardapio_token', 'mock-token')

      render(
        <TestWrapper>
          <Dashboard storeSlug="test-store" />
        </TestWrapper>
      )

      // Aguardar carregamento
      await waitFor(() => {
        expect(screen.getByText(/acesso negado/i)).toBeInTheDocument()
      })

      // Verificar se o token foi limpo
      expect(localStorage.getItem('cardapio_token')).toBeNull()
    })
  })
}) 