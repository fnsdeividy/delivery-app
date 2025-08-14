import { useAuth } from '@/hooks/useAuth'
import { apiClient } from '@/lib/api-client'
import { UserRole } from '@/types/cardapio-api'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import React from 'react'

// Mock do apiClient
jest.mock('@/lib/api-client', () => ({
  apiClient: {
    authenticate: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    isAuthenticated: jest.fn(),
    getCurrentToken: jest.fn(),
  },
}))

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>

// Wrapper para React Query
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockApiClient.isAuthenticated.mockReturnValue(false)
    mockApiClient.getCurrentToken.mockReturnValue(null)
  })

  it('deve retornar estado inicial correto', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.currentUser).toBeNull()
    expect(result.current.isLoadingUser).toBe(false)
    expect(result.current.isLoggingIn).toBe(false)
    expect(result.current.isRegistering).toBe(false)
    expect(result.current.isLoggingOut).toBe(false)
  })

  it('deve fazer login com sucesso', async () => {
    const mockResponse = {
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.ADMIN,
        storeSlug: 'test-store',
        active: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      access_token: 'mock-token',
    }

    mockApiClient.authenticate.mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })

    await waitFor(() => {
      result.current.login('test@example.com', 'password', 'test-store')
    })

    expect(mockApiClient.authenticate).toHaveBeenCalledWith(
      'test@example.com',
      'password',
      'test-store'
    )
  })

  it('deve fazer registro com sucesso', async () => {
    const mockResponse = {
      user: {
        id: '1',
        email: 'new@example.com',
        name: 'New User',
        role: UserRole.CLIENTE,
        active: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      access_token: 'mock-token',
    }

    mockApiClient.register.mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })

    const userData = {
      email: 'new@example.com',
      password: 'password',
      name: 'New User',
      role: UserRole.CLIENTE,
    }

    await waitFor(() => {
      result.current.register(userData)
    })

    expect(mockApiClient.register).toHaveBeenCalledWith(userData)
  })

  it('deve fazer logout', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })

    await waitFor(() => {
      result.current.logout()
    })

    expect(mockApiClient.logout).toHaveBeenCalled()
  })

  it('deve lidar com erro no login', async () => {
    const mockError = new Error('Credenciais inválidas')
    mockApiClient.authenticate.mockRejectedValue(mockError)

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })

    await waitFor(() => {
      result.current.login('invalid@example.com', 'wrong-password')
    })

    expect(mockApiClient.authenticate).toHaveBeenCalledWith(
      'invalid@example.com',
      'wrong-password',
      undefined
    )
  })

  it('deve lidar com erro no registro', async () => {
    const mockError = new Error('Email já existe')
    mockApiClient.register.mockRejectedValue(mockError)

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })

    const userData = {
      email: 'existing@example.com',
      password: 'password',
      name: 'Existing User',
      role: UserRole.CLIENTE,
    }

    await waitFor(() => {
      result.current.register(userData)
    })

    expect(mockApiClient.register).toHaveBeenCalledWith(userData)
  })

  it('deve resetar erros', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() })

    result.current.resetLoginError()
    result.current.resetRegisterError()

    // Verificar se as funções existem e podem ser chamadas
    expect(typeof result.current.resetLoginError).toBe('function')
    expect(typeof result.current.resetRegisterError).toBe('function')
  })
}) 