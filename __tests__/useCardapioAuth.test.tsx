import { useCardapioAuth } from '@/hooks/useCardapioAuth'
import { apiClient } from '@/lib/api-client'
import { LoginDto } from '@/types/cardapio-api'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'

// Mock do apiClient
jest.mock('@/lib/api-client', () => ({
  apiClient: {
    authenticate: jest.fn(),
    post: jest.fn(),
    logout: jest.fn(),
    isAuthenticated: jest.fn(),
    getCurrentToken: jest.fn(),
  },
}))

// Mock do Next.js router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock do localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('useCardapioAuth', () => {
  let queryClient: QueryClient
  let mockApiClient: jest.Mocked<typeof apiClient>

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    
    mockApiClient = apiClient as jest.Mocked<typeof apiClient>
    
    // Reset mocks
    jest.clearAllMocks()
    mockPush.mockClear()
    localStorageMock.setItem.mockClear()
    localStorageMock.getItem.mockClear()
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )

  const mockLoginCredentials: LoginDto & { storeSlug?: string } = {
    email: 'admin@test.com',
    password: 'password123',
    storeSlug: 'test-store',
  }

  const mockAuthResponse = {
    access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQHRlc3QuY29tIiwic3ViIjoiYWRtaW4tMTIzIiwicm9sZSI6IkFETUlOIiwic3RvcmVTbHVnIjpudWxsLCJpYXQiOjE2MzUyNTU3MjYsImV4cCI6MTYzNTg2MDUyNn0.test',
    user: {
      id: 'admin-123',
      email: 'admin@test.com',
      name: 'Admin User',
      role: 'ADMIN',
      storeSlug: null,
    },
  }

  describe('login', () => {
    it('deve fazer login com sucesso para ADMIN com storeSlug e redirecionar para dashboard da loja', async () => {
      // Arrange
      mockApiClient.authenticate.mockResolvedValue(mockAuthResponse)
      localStorageMock.getItem.mockReturnValue(null) // Sem storeSlug no localStorage

      const { result } = renderHook(() => useCardapioAuth(), { wrapper })

      // Act
      result.current.login(mockLoginCredentials)

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(mockApiClient.authenticate).toHaveBeenCalledWith(
        'admin@test.com',
        'password123',
        'test-store'
      )
      expect(mockPush).toHaveBeenCalledWith('/dashboard/test-store')
    })

    it('deve fazer login com sucesso para ADMIN sem storeSlug e redirecionar para dashboard administrativo', async () => {
      // Arrange
      const credentialsWithoutStore = { ...mockLoginCredentials, storeSlug: undefined }
      mockApiClient.authenticate.mockResolvedValue(mockAuthResponse)
      localStorageMock.getItem.mockReturnValue(null)

      const { result } = renderHook(() => useCardapioAuth(), { wrapper })

      // Act
      result.current.login(credentialsWithoutStore)

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(mockPush).toHaveBeenCalledWith('/dashboard/gerenciar-lojas')
    })

    it('deve fazer login com sucesso para ADMIN usando storeSlug do localStorage', async () => {
      // Arrange
      const credentialsWithoutStore = { ...mockLoginCredentials, storeSlug: undefined }
      mockApiClient.authenticate.mockResolvedValue(mockAuthResponse)
      localStorageMock.getItem.mockReturnValue('stored-store')

      const { result } = renderHook(() => useCardapioAuth(), { wrapper })

      // Act
      result.current.login(credentialsWithoutStore)

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(mockPush).toHaveBeenCalledWith('/dashboard/stored-store')
    })

    it('deve fazer login com sucesso para SUPER_ADMIN e redirecionar para /admin', async () => {
      // Arrange
      const superAdminResponse = {
        ...mockAuthResponse,
        user: { ...mockAuthResponse.user, role: 'SUPER_ADMIN' },
      }
      mockApiClient.authenticate.mockResolvedValue(superAdminResponse)

      const { result } = renderHook(() => useCardapioAuth(), { wrapper })

      // Act
      result.current.login({ ...mockLoginCredentials, storeSlug: undefined })

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(mockPush).toHaveBeenCalledWith('/admin')
    })

    it('deve fazer login com sucesso para CLIENTE e redirecionar para home', async () => {
      // Arrange
      const clienteResponse = {
        ...mockAuthResponse,
        user: { ...mockAuthResponse.user, role: 'CLIENTE' },
      }
      mockApiClient.authenticate.mockResolvedValue(clienteResponse)

      const { result } = renderHook(() => useCardapioAuth(), { wrapper })

      // Act
      result.current.login({ ...mockLoginCredentials, storeSlug: undefined })

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(mockPush).toHaveBeenCalledWith('/')
    })

    it('deve lidar com erro de autenticação', async () => {
      // Arrange
      const errorMessage = 'Credenciais inválidas'
      mockApiClient.authenticate.mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useCardapioAuth(), { wrapper })

      // Act
      result.current.login(mockLoginCredentials)

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBe(errorMessage)
    })

    it('deve lidar com resposta inválida da API', async () => {
      // Arrange
      mockApiClient.authenticate.mockResolvedValue(null as any)

      const { result } = renderHook(() => useCardapioAuth(), { wrapper })

      // Act
      result.current.login(mockLoginCredentials)

      // Assert
      await waitFor(() => {
        expect(result.current.error).toBe('Resposta inválida da API')
      })
    })

    it('deve lidar com token inválido na resposta', async () => {
      // Arrange
      const invalidResponse = {
        ...mockAuthResponse,
        access_token: null,
      }
      mockApiClient.authenticate.mockResolvedValue(invalidResponse as any)

      const { result } = renderHook(() => useCardapioAuth(), { wrapper })

      // Act
      result.current.login(mockLoginCredentials)

      // Assert
      await waitFor(() => {
        expect(result.current.error).toBe('Token de acesso inválido ou ausente na resposta')
      })
    })
  })

  describe('logout', () => {
    it('deve fazer logout e redirecionar para login', () => {
      // Arrange
      const { result } = renderHook(() => useCardapioAuth(), { wrapper })

      // Act
      result.current.logout()

      // Assert
      expect(mockApiClient.logout).toHaveBeenCalled()
      expect(mockPush).toHaveBeenCalledWith('/login')
    })
  })

  describe('utilitários', () => {
    it('deve verificar se está autenticado', () => {
      // Arrange
      mockApiClient.isAuthenticated.mockReturnValue(true)
      const { result } = renderHook(() => useCardapioAuth(), { wrapper })

      // Act
      const isAuth = result.current.isAuthenticated()

      // Assert
      expect(isAuth).toBe(true)
      expect(mockApiClient.isAuthenticated).toHaveBeenCalled()
    })

    it('deve obter token atual', () => {
      // Arrange
      const mockToken = 'mock-token'
      mockApiClient.getCurrentToken.mockReturnValue(mockToken)
      const { result } = renderHook(() => useCardapioAuth(), { wrapper })

      // Act
      const token = result.current.getCurrentToken()

      // Assert
      expect(token).toBe(mockToken)
      expect(mockApiClient.getCurrentToken).toHaveBeenCalled()
    })
  })
})