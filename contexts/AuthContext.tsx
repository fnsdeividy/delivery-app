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
        if (apiClient.isAuthenticated()) {
          // Aqui você pode implementar uma chamada para obter dados do usuário atual
          // Por enquanto, vamos apenas verificar se o token existe
          const token = apiClient.getCurrentToken()
          if (token) {
            // Decodificar o token JWT para obter informações básicas do usuário
            // Em produção, você deve implementar um endpoint /me para obter dados completos
            const tokenData = parseJwt(token)
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
              setUser(userData)

              // Persistir dados do usuário no localStorage
              localStorage.setItem('user', JSON.stringify(userData))
            }
          }
        } else {
          // Tentar recuperar dados do usuário do localStorage
          const savedUser = localStorage.getItem('user')
          if (savedUser) {
            try {
              const userData = JSON.parse(savedUser)
              setUser(userData)
            } catch (e) {
              localStorage.removeItem('user')
            }
          }
        }
      } catch (error) {
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
      const response = await apiClient.authenticate(email, password, storeSlug)

      const userData = {
        ...response.user,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      setUser(userData)

      // Persistir dados do usuário no localStorage
      localStorage.setItem('user', JSON.stringify(userData))

      return response
    } catch (error) {
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

    return null
  }
} 