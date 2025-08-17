'use client'

import { apiClient } from '@/lib/api-client'
import { AuthResponse, User } from '@/types/cardapio-api'
import { createContext, ReactNode, useContext, useEffect, useState } from 'react'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string, storeSlug?: string) => Promise<AuthResponse>
  register: (userData: any) => Promise<AuthResponse>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Verificar autenticação ao inicializar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('AuthContext - Verificando autenticação...')
        if (apiClient.isAuthenticated()) {
          console.log('AuthContext - API Client está autenticado')
          // Aqui você pode implementar uma chamada para obter dados do usuário atual
          // Por enquanto, vamos apenas verificar se o token existe
          const token = apiClient.getCurrentToken()
          if (token) {
            console.log('AuthContext - Token encontrado, decodificando...')
            // Decodificar o token JWT para obter informações básicas do usuário
            // Em produção, você deve implementar um endpoint /me para obter dados completos
            const tokenData = parseJwt(token)
            console.log('AuthContext - Token decodificado:', tokenData)
            if (tokenData) {
              const userData = {
                id: tokenData.sub,
                email: tokenData.email,
                name: tokenData.name || '',
                role: tokenData.role,
                storeSlug: tokenData.storeSlug,
                active: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }
              console.log('AuthContext - Dados do usuário criados:', userData)
              setUser(userData)

              // Persistir dados do usuário no localStorage
              localStorage.setItem('user', JSON.stringify(userData))
            }
          }
        } else {
          console.log('AuthContext - API Client não está autenticado, tentando localStorage...')
          // Tentar recuperar dados do usuário do localStorage
          const savedUser = localStorage.getItem('user')
          if (savedUser) {
            try {
              const userData = JSON.parse(savedUser)
              console.log('AuthContext - Usuário recuperado do localStorage:', userData)
              setUser(userData)
            } catch (e) {
              console.error('AuthContext - Erro ao parsear usuário do localStorage:', e)
              localStorage.removeItem('user')
            }
          }
        }
      } catch (error) {
        console.error('AuthContext - Erro ao verificar autenticação:', error)
        apiClient.logout()
        localStorage.removeItem('user')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string, storeSlug?: string): Promise<AuthResponse> => {
    try {
      console.log('AuthContext - Login iniciado para:', email, 'storeSlug:', storeSlug)
      const response = await apiClient.authenticate(email, password, storeSlug)
      console.log('AuthContext - Resposta da autenticação:', response)

      const userData = {
        ...response.user,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      console.log('AuthContext - Dados do usuário configurados:', userData)
      setUser(userData)

      // Persistir dados do usuário no localStorage
      localStorage.setItem('user', JSON.stringify(userData))
      console.log('AuthContext - Usuário salvo no localStorage')

      return response
    } catch (error) {
      console.error('AuthContext - Erro no login:', error)
      throw error
    }
  }

  const register = async (userData: any): Promise<AuthResponse> => {
    try {
      const response = await apiClient.register(userData)
      const userDataWithDates = {
        ...response.user,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      setUser(userDataWithDates)

      // Persistir dados do usuário no localStorage
      localStorage.setItem('user', JSON.stringify(userDataWithDates))

      return response
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    apiClient.logout()
    setUser(null)
    localStorage.removeItem('user')
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData })
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext deve ser usado dentro de um AuthProvider')
  }
  return context
}

// Função utilitária para decodificar JWT (apenas para desenvolvimento)
function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Erro ao decodificar JWT:', error)
    return null
  }
} 