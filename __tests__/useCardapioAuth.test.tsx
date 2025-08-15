import { useCardapioAuth } from '@/hooks/useCardapioAuth'
import { apiClient } from '@/lib/api-client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'

// Mock do Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

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

// Mock do console para evitar logs durante os testes
const originalConsole = { ...console }
beforeAll(() => {
  console.log = jest.fn()
  console.warn = jest.fn()
  console.error = jest.fn()
})

afterAll(() => {
  console.log = originalConsole.log
  console.warn = originalConsole.warn
  console.error = originalConsole.error
})

describe('useCardapioAuth', () => {
  let queryClient: QueryClient
  let mockRouter: any

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })

    mockRouter = {
      push: jest.fn(),
    }
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)

    // Limpar todos os mocks
    jest.clearAllMocks()
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  describe('login', () => {
    it('deve fazer login com sucesso e redirecionar ADMIN para dashboard da loja', async () => {
      const mockResponse = {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwicm9sZSI6IkFETUlOIiwic3RvcmVTbHVnIjoibG9qYS10ZXN0ZSIsImVtYWlsIjoidGVzdGVAbG9qYS5jb20iLCJpYXQiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        user: {
          id: '1234567890',
          email: 'teste@loja.com',
          name: 'João Doe',
          role: 'ADMIN',
          storeSlug: 'loja-teste',
        },
      }

      ;(apiClient.authenticate as jest.Mock).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useCardapioAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      result.current.login({
        email: 'teste@loja.com',
        password: 'senha123',
        storeSlug: 'loja-teste',
      })

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/dashboard/loja-teste')
      })
    })

    it('deve fazer login com sucesso e redirecionar SUPER_ADMIN para /admin', async () => {
      const mockResponse = {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwicm9sZSI6IlNVUEVSX0FETUlOIiwic3RvcmVTbHVnIjpudWxsLCJlbWFpbCI6InN1cGVyQGFkbWluLmNvbSIsImlhdCI6MTUxNjIzOTAyMn0.test',
        user: {
          id: '1234567890',
          email: 'super@admin.com',
          name: 'Super Admin',
          role: 'SUPER_ADMIN',
          storeSlug: null,
        },
      }

      ;(apiClient.authenticate as jest.Mock).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useCardapioAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      result.current.login({
        email: 'super@admin.com',
        password: 'senha123',
      })

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/admin')
      })
    })

    it('deve fazer login com sucesso e redirecionar ADMIN sem loja para dashboard geral', async () => {
      const mockResponse = {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwicm9sZSI6IkFETUlOIiwic3RvcmVTbHVnIjpudWxsLCJlbWFpbCI6ImFkbWluQGFkbWluLmNvbSIsImlhdCI6MTUxNjIzOTAyMn0.test',
        user: {
          id: '1234567890',
          email: 'admin@admin.com',
          name: 'Admin',
          role: 'ADMIN',
          storeSlug: null,
        },
      }

      ;(apiClient.authenticate as jest.Mock).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useCardapioAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      result.current.login({
        email: 'admin@admin.com',
        password: 'senha123',
      })

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/dashboard')
      })
    })

    it('deve fazer login com sucesso e redirecionar CLIENTE para home', async () => {
      const mockResponse = {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwicm9sZSI6IkNMSUVOVEUiLCJzdG9yZVNsdWciOm51bGwsImVtYWlsIjoiY2xpZW50ZUBjbGllbnRlLmNvbSIsImlhdCI6MTUxNjIzOTAyMn0.test',
        user: {
          id: '1234567890',
          email: 'cliente@cliente.com',
          name: 'Cliente',
          role: 'CLIENTE',
          storeSlug: null,
        },
      }

      ;(apiClient.authenticate as jest.Mock).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useCardapioAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      result.current.login({
        email: 'cliente@cliente.com',
        password: 'senha123',
      })

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/')
      })
    })

    it('deve usar fallback para dados do usuário quando JWT falhar na decodificação', async () => {
      const mockResponse = {
        access_token: 'invalid.jwt.token',
        user: {
          id: '1234567890',
          email: 'teste@loja.com',
          name: 'João Doe',
          role: 'ADMIN',
          storeSlug: 'loja-teste',
        },
      }

      ;(apiClient.authenticate as jest.Mock).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useCardapioAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      result.current.login({
        email: 'teste@loja.com',
        password: 'senha123',
        storeSlug: 'loja-teste',
      })

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/dashboard/loja-teste')
      })
    })

    it('deve lançar erro quando a resposta da API for inválida', async () => {
      ;(apiClient.authenticate as jest.Mock).mockResolvedValue(null)

      const { result } = renderHook(() => useCardapioAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      result.current.login({
        email: 'teste@loja.com',
        password: 'senha123',
      })

      await waitFor(() => {
        expect(result.current.error).toBe('Resposta inválida da API')
      })
    })

    it('deve lançar erro quando access_token estiver ausente', async () => {
      const mockResponse = {
        user: {
          id: '1234567890',
          email: 'teste@loja.com',
          name: 'João Doe',
          role: 'ADMIN',
        },
      }

      ;(apiClient.authenticate as jest.Mock).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useCardapioAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      result.current.login({
        email: 'teste@loja.com',
        password: 'senha123',
      })

      await waitFor(() => {
        expect(result.current.error).toBe('Token de acesso inválido ou ausente na resposta')
      })
    })

    it('deve lançar erro quando access_token não for string', async () => {
      const mockResponse = {
        access_token: 123,
        user: {
          id: '1234567890',
          email: 'teste@loja.com',
          name: 'João Doe',
          role: 'ADMIN',
        },
      }

      ;(apiClient.authenticate as jest.Mock).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useCardapioAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      result.current.login({
        email: 'teste@loja.com',
        password: 'senha123',
      })

      await waitFor(() => {
        expect(result.current.error).toBe('Token de acesso inválido ou ausente na resposta')
      })
    })

    it('deve lançar erro quando JWT tiver formato inválido', async () => {
      const mockResponse = {
        access_token: 'invalid-jwt-format',
        user: {
          id: '1234567890',
          email: 'teste@loja.com',
          name: 'João Doe',
          role: 'ADMIN',
        },
      }

      ;(apiClient.authenticate as jest.Mock).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useCardapioAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      result.current.login({
        email: 'teste@loja.com',
        password: 'senha123',
      })

      await waitFor(() => {
        expect(result.current.error).toBe('Formato de token JWT inválido')
      })
    })

    it('deve lançar erro quando não conseguir obter informações do usuário', async () => {
      const mockResponse = {
        access_token: 'invalid.jwt.token',
        // Sem user na resposta
      }

      ;(apiClient.authenticate as jest.Mock).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useCardapioAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      result.current.login({
        email: 'teste@loja.com',
        password: 'senha123',
      })

      await waitFor(() => {
        expect(result.current.error).toBe('Não foi possível obter informações do usuário')
      })
    })
  })

  describe('register', () => {
    it('deve fazer registro com sucesso e fazer login automático', async () => {
      const mockResponse = {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwicm9sZSI6IkFETUlOIiwic3RvcmVTbHVnIjpudWxsLCJlbWFpbCI6InRlc3RlQGxvamEuY29tIiwiaWF0IjoxNTE2MjM5MDIyfQ.test',
        user: {
          id: '1234567890',
          email: 'teste@loja.com',
          name: 'João Doe',
          role: 'ADMIN',
          storeSlug: null,
        },
      }

      ;(apiClient.post as jest.Mock).mockResolvedValue(mockResponse)
      ;(apiClient.authenticate as jest.Mock).mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useCardapioAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      result.current.register({
        email: 'teste@loja.com',
        password: 'senha123',
        name: 'João Doe',
        role: 'ADMIN',
      })

      await waitFor(() => {
        expect(apiClient.post).toHaveBeenCalledWith('/auth/register', {
          email: 'teste@loja.com',
          password: 'senha123',
          name: 'João Doe',
          role: 'ADMIN',
        })
      })
    })

    it('deve lançar erro durante o registro', async () => {
      const errorMessage = 'Email já cadastrado'
      ;(apiClient.post as jest.Mock).mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useCardapioAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      result.current.register({
        email: 'teste@loja.com',
        password: 'senha123',
        name: 'João Doe',
        role: 'ADMIN',
      })

      await waitFor(() => {
        expect(result.current.error).toBe(errorMessage)
      })
    })
  })

  describe('logout', () => {
    it('deve fazer logout e redirecionar para login', () => {
      ;(apiClient.logout as jest.Mock).mockImplementation(() => {})
      ;(apiClient.isAuthenticated as jest.Mock).mockReturnValue(false)

      const { result } = renderHook(() => useCardapioAuth(), { wrapper })

      result.current.logout()

      expect(apiClient.logout).toHaveBeenCalled()
      expect(mockRouter.push).toHaveBeenCalledWith('/login')
    })
  })

  describe('utilitários', () => {
    it('deve verificar se está autenticado', () => {
      ;(apiClient.isAuthenticated as jest.Mock).mockReturnValue(true)

      const { result } = renderHook(() => useCardapioAuth(), { wrapper })

      expect(result.current.isAuthenticated()).toBe(true)
    })

    it('deve obter token atual', () => {
      const mockToken = 'mock-token'
      ;(apiClient.getCurrentToken as jest.Mock).mockReturnValue(mockToken)

      const { result } = renderHook(() => useCardapioAuth(), { wrapper })

      expect(result.current.getCurrentToken()).toBe(mockToken)
    })
  })

  describe('estados', () => {
    it('deve gerenciar estado de loading', async () => {
      // Criar uma Promise que não resolve imediatamente para testar o loading
      let resolveAuth: (value: any) => void
      const authPromise = new Promise<any>((resolve) => {
        resolveAuth = resolve
      })

      ;(apiClient.authenticate as jest.Mock).mockReturnValue(authPromise)

      const { result } = renderHook(() => useCardapioAuth(), { wrapper })

      expect(result.current.isLoading).toBe(false)

      result.current.login({
        email: 'teste@loja.com',
        password: 'senha123',
      })

      // O loading deve ser true durante a operação
      await waitFor(() => {
        expect(result.current.isLoading).toBe(true)
      })

      // Resolver a Promise para finalizar o teste
      resolveAuth!({
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwicm9sZSI6IkFETUlOIiwic3RvcmVTbHVnIjpudWxsLCJlbWFpbCI6InRlc3RlQGxvamEuY29tIiwiaWF0IjoxNTE2MjM5MDIyfQ.test',
        user: {
          id: '1234567890',
          email: 'teste@loja.com',
          name: 'João Doe',
          role: 'ADMIN',
          storeSlug: null,
        },
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('deve gerenciar estado de erro', async () => {
      const errorMessage = 'Credenciais inválidas'
      ;(apiClient.authenticate as jest.Mock).mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useCardapioAuth(), { wrapper })

      expect(result.current.error).toBe(null)

      result.current.login({
        email: 'teste@loja.com',
        password: 'senha123',
      })

      await waitFor(() => {
        expect(result.current.error).toBe(errorMessage)
      })
    })
  })
})