'use client'

import { apiClient } from '@/lib/api-client'
import { AuthResponse, User, UserStoreAssociation } from '@/types/cardapio-api'
import { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { useTokenSync } from '@/hooks/useTokenSync'
import { appConfig } from '@/lib/config'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  currentStore: UserStoreAssociation | null
  userStores: UserStoreAssociation[]
  login: (email: string, password: string, storeSlug?: string) => Promise<AuthResponse>
  register: (userData: any) => Promise<AuthResponse>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
  setCurrentStore: (storeSlug: string) => Promise<void>
  refreshUserData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userStores, setUserStores] = useState<UserStoreAssociation[]>([])
  const [currentStore, setCurrentStoreState] = useState<UserStoreAssociation | null>(null)

  // Sincronizar token entre localStorage e cookies
  const { isSynced } = useTokenSync()

  // Função para carregar dados completos do usuário
  const refreshUserData = async () => {
    try {
      if (apiClient.isAuthenticated()) {
        const authContext = await apiClient.getCurrentUserContext()
        const currentUser = authContext.user
        setUser(currentUser)
        setUserStores(currentUser.stores || [])

        // Definir loja atual baseada nos dados do usuário
        const currentStoreSlug = currentUser.currentStoreSlug || apiClient.getCurrentStoreSlug()
        if (currentStoreSlug) {
          const store = currentUser.stores?.find(s => s.storeSlug === currentStoreSlug)
          setCurrentStoreState(store || null)
        }

        // Persistir dados do usuário no localStorage
        localStorage.setItem('user', JSON.stringify(currentUser))
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados do usuário:', error)
      apiClient.logout()
      localStorage.removeItem('user')
      setUser(null)
      setUserStores([])
      setCurrentStoreState(null)
    }
  }

  // Verificar autenticação ao inicializar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Aguardar até que o token esteja sincronizado
        if (!isSynced) {
          if (appConfig.api.debug) {
            console.log('⏳ Aguardando sincronização do token...')
          }
          return
        }

        if (apiClient.isAuthenticated()) {
          if (appConfig.api.debug) {
            console.log('✅ Usuário autenticado, carregando dados...')
          }
          await refreshUserData()
        } else {
          // Tentar recuperar dados do usuário do localStorage
          const savedUser = localStorage.getItem('user')
          if (savedUser) {
            try {
              const userData = JSON.parse(savedUser)
              setUser(userData)
              setUserStores(userData.stores || [])

              const currentStoreSlug = userData.currentStoreSlug || apiClient.getCurrentStoreSlug()
              if (currentStoreSlug) {
                const store = userData.stores?.find((s: UserStoreAssociation) => s.storeSlug === currentStoreSlug)
                setCurrentStoreState(store || null)
              }

              if (appConfig.api.debug) {
                console.log('🔄 Dados do usuário recuperados do localStorage')
              }
            } catch (e) {
              if (appConfig.api.debug) {
                console.error('❌ Erro ao parsear dados do localStorage:', e)
              }
              localStorage.removeItem('user')
            }
          } else {
            if (appConfig.api.debug) {
              console.log('ℹ️ Nenhum usuário salvo encontrado')
            }
          }
        }
      } catch (error) {
        if (appConfig.api.debug) {
          console.error('❌ Erro na verificação de autenticação:', error)
        }
        apiClient.logout()
        localStorage.removeItem('user')
        setUser(null)
        setUserStores([])
        setCurrentStoreState(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [isSynced])

  const login = async (email: string, password: string, storeSlug?: string): Promise<AuthResponse> => {
    try {
      const response = await apiClient.authenticate(email, password, storeSlug)

      const userData = {
        ...response.user,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as User
      setUser(userData)
      setUserStores(userData.stores || [])

      // Definir loja atual se disponível
      if (userData.currentStoreSlug) {
        const store = userData.stores?.find(s => s.storeSlug === userData.currentStoreSlug)
        setCurrentStoreState(store || null)
      }

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
    setUserStores([])
    setCurrentStoreState(null)
    localStorage.removeItem('user')
    localStorage.removeItem('currentStoreSlug')
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
    }
  }

  const setCurrentStore = async (storeSlug: string) => {
    try {
      const updatedUser = await apiClient.setCurrentStore({ storeSlug })
      setUser(updatedUser)
      setUserStores(updatedUser.stores || [])

      const store = updatedUser.stores?.find(s => s.storeSlug === storeSlug)
      setCurrentStoreState(store || null)

      localStorage.setItem('user', JSON.stringify(updatedUser))
    } catch (error) {
      console.error('❌ Erro ao definir loja atual:', error)
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    currentStore,
    userStores,
    login,
    register,
    logout,
    updateUser,
    setCurrentStore,
    refreshUserData,
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