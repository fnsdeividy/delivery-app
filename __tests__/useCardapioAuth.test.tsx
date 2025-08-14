import { useCardapioAuth } from '@/hooks/useCardapioAuth'
import { apiClient } from '@/lib/api-client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'

// Mock do apiClient
jest.mock('@/lib/api-client', () => ({
  apiClient: {
    authenticate: jest.fn(),
    logout: jest.fn(),
    isAuthenticated: jest.fn(),
    getCurrentToken: jest.fn(),
  },
}))

// Mock do router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock do queryClient
const mockInvalidateQueries = jest.fn()
const mockClear = jest.fn()

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  
  // Mock dos métodos do queryClient
  queryClient.invalidateQueries = mockInvalidateQueries
  queryClient.clear = mockClear
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('useCardapioAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockPush.mockClear()
    mockInvalidateQueries.mockClear()
    mockClear.mockClear()
  })

  describe('login', () => {
    it('deve fazer login com sucesso e redirecionar para dashboard de lojista', async () => {
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiZW1haWwiOiJhZG1pbkBib3RlY28uY29tIiwicm9sZSI6IkFETUlOIiwic3RvcmVTbHVnIjoiYm90ZWNvLWRvLWpvYW8iLCJpYXQiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
      
      ;(apiClient.authenticate as jest.Mock).mockResolvedValue(mockToken)

      const { result } = renderHook(() => useCardapioAuth(), {
        wrapper: createWrapper(),
      })

      await result.current.login({
        email: 'admin@boteco.com',
        password: '123456',
        storeSlug: 'boteco-do-joao'
      })

      await waitFor(() => {
        expect(apiClient.authenticate).toHaveBeenCalledWith(
          'admin@boteco.com',
          '123456',
          'boteco-do-joao'
        )
        expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['user'] })
        expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['stores'] })
        expect(mockPush).toHaveBeenCalledWith('/dashboard/boteco-do-joao')
      })
    })

    it('deve fazer login com sucesso e redirecionar super admin para /admin', async () => {
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlN1cGVyIEFkbWluIiwiZW1haWwiOiJzdXBlcmFkbWluQGNhcmRhcC5pbyIsInJvbGUiOiJTVVBFUl9BRE1JTiIsImlhdCI6MTUxNjIzOTAyMn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
      
      ;(apiClient.authenticate as jest.Mock).mockResolvedValue(mockToken)

      const { result } = renderHook(() => useCardapioAuth(), {
        wrapper: createWrapper(),
      })

      await result.current.login({
        email: 'superadmin@cardap.io',
        password: 'admin123'
      })

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/admin')
      })
    })

    it('deve redirecionar para dashboard administrativo quando ADMIN não tem storeSlug', async () => {
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiZW1haWwiOiJhZG1pbkBib3RlY28uY29tIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
      
      ;(apiClient.authenticate as jest.Mock).mockResolvedValue(mockToken)

      const { result } = renderHook(() => useCardapioAuth(), {
        wrapper: createWrapper(),
      })

      await result.current.login({
        email: 'admin@boteco.com',
        password: '123456'
      })

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard')
      })
    })

    it('deve tratar erro de autenticação', async () => {
      const mockError = new Error('Credenciais inválidas')
      ;(apiClient.authenticate as jest.Mock).mockRejectedValue(mockError)

      const { result } = renderHook(() => useCardapioAuth(), {
        wrapper: createWrapper(),
      })

      await result.current.login({
        email: 'admin@boteco.com',
        password: 'senha-errada'
      })

      await waitFor(() => {
        expect(result.current.error).toBe('Credenciais inválidas')
      })
    })
  })

  describe('logout', () => {
    it('deve fazer logout e redirecionar para login', async () => {
      const { result } = renderHook(() => useCardapioAuth(), {
        wrapper: createWrapper(),
      })

      result.current.logout()

      expect(apiClient.logout).toHaveBeenCalled()
      expect(mockClear).toHaveBeenCalled()
      expect(mockPush).toHaveBeenCalledWith('/login')
    })
  })

  describe('estados', () => {
    it('deve retornar estado de loading durante autenticação', async () => {
      let resolveAuth: (value: string) => void
      const authPromise = new Promise<string>((resolve) => {
        resolveAuth = resolve
      })
      
      ;(apiClient.authenticate as jest.Mock).mockReturnValue(authPromise)

      const { result } = renderHook(() => useCardapioAuth(), {
        wrapper: createWrapper(),
      })

      const loginPromise = result.current.login({
        email: 'admin@boteco.com',
        password: '123456',
        storeSlug: 'boteco-do-joao'
      })

      // Aguardar o estado de loading ser definido
      await waitFor(() => {
        expect(result.current.isLoading).toBe(true)
      })

      resolveAuth!('mock-token')
      await loginPromise

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('deve limpar erro ao fazer nova tentativa de login', async () => {
      const mockError = new Error('Erro anterior')
      ;(apiClient.authenticate as jest.Mock).mockRejectedValue(mockError)

      const { result } = renderHook(() => useCardapioAuth(), {
        wrapper: createWrapper(),
      })

      // Primeira tentativa com erro
      await result.current.login({
        email: 'admin@boteco.com',
        password: 'senha-errada'
      })

      await waitFor(() => {
        expect(result.current.error).toBe('Erro anterior')
      })

      // Segunda tentativa deve limpar erro
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiZW1haWwiOiJhZG1pbkBib3RlY28uY29tIiwicm9sZSI6IkFETUlOIiwic3RvcmVTbHVnIjoiYm90ZWNvLWRvLWpvYW8iLCJpYXQiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
      ;(apiClient.authenticate as jest.Mock).mockResolvedValue(mockToken)

      await result.current.login({
        email: 'admin@boteco.com',
        password: '123456',
        storeSlug: 'boteco-do-joao'
      })

      await waitFor(() => {
        expect(result.current.error).toBeNull()
      })
    })
  })
}) 