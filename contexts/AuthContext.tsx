'use client'

import { ReactNode, createContext, useContext, useEffect, useState } from 'react'
import { UserData, mockUser, mockUsers } from '../data/mockUser'

// Tipos para o contexto de autenticação
interface AuthContextType {
  user: UserData | null
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  loginWithFacebook: () => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
}

interface RegisterData {
  name: string
  email: string
  password: string
  phone: string
}

interface AuthProviderProps {
  children: ReactNode
}

// Criação do contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Simulação de delays de API
const API_DELAY = 1000

// Função para simular autenticação
const mockLogin = async (email: string, password: string): Promise<UserData> => {
  await new Promise(resolve => setTimeout(resolve, API_DELAY))
  
  // Buscar usuário pelos dados mock
  const user = mockUsers.find(u => u.email === email)
  
  // Para demo, aceitar qualquer senha com pelo menos 6 caracteres
  if (!user || password.length < 6) {
    throw new Error('Email ou senha inválidos')
  }
  
  return user
}

// Função para simular registro
const mockRegister = async (userData: RegisterData): Promise<UserData> => {
  await new Promise(resolve => setTimeout(resolve, API_DELAY))
  
  // Verificar se email já existe
  const existingUser = mockUsers.find(u => u.email === userData.email)
  if (existingUser) {
    throw new Error('Este email já está em uso')
  }
  
  // Criar novo usuário baseado no template mockUser
  const newUser: UserData = {
    id: `user_${Date.now()}`,
    name: userData.name,
    email: userData.email,
    phone: userData.phone,
    addresses: [
      {
        id: `addr_${Date.now()}`,
        type: 'home',
        label: 'Casa',
        street: 'Rua Nova',
        number: '100',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01000-000',
        isDefault: true
      }
    ],
    preferences: {
      favoriteCategories: [],
      dietaryRestrictions: [],
      spicyLevel: 'none',
      notifications: {
        orderUpdates: true,
        promotions: true,
        newItems: false
      }
    },
    paymentMethods: [
      {
        id: `payment_${Date.now()}`,
        type: 'pix',
        label: `PIX - ${userData.email}`,
        isDefault: true
      }
    ],
    orderHistory: []
  }
  
  return newUser
}

// Função para simular login social
const mockSocialLogin = async (provider: 'google' | 'facebook'): Promise<UserData> => {
  await new Promise(resolve => setTimeout(resolve, 800))
  
  // Criar usuário social baseado no provider
  const socialUser: UserData = {
    ...mockUser,
    id: `${provider}_${Date.now()}`,
    email: `usuario@${provider}.com`,
    name: `Usuário ${provider === 'google' ? 'Google' : 'Facebook'}`,
    phone: '(11) 99999-9999'
  }
  
  return socialUser
}

// Provider do contexto
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  // Carregar usuário do localStorage na inicialização
  useEffect(() => {
    const loadUserFromStorage = () => {
      try {
        const storedUser = localStorage.getItem('cardapio_auth_user')
        if (storedUser) {
          const userData = JSON.parse(storedUser)
          setUser(userData)
        }
      } catch (error) {
        console.error('Erro ao carregar usuário do localStorage:', error)
        localStorage.removeItem('cardapio_auth_user')
      } finally {
        setLoading(false)
      }
    }

    loadUserFromStorage()
  }, [])

  // Salvar usuário no localStorage
  const saveUserToStorage = (userData: UserData | null) => {
    if (userData) {
      localStorage.setItem('cardapio_auth_user', JSON.stringify(userData))
    } else {
      localStorage.removeItem('cardapio_auth_user')
    }
  }

  // Função de login
  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const userData = await mockLogin(email, password)
      setUser(userData)
      saveUserToStorage(userData)
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Função de login com Google
  const loginWithGoogle = async () => {
    setLoading(true)
    try {
      const userData = await mockSocialLogin('google')
      setUser(userData)
      saveUserToStorage(userData)
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Função de login com Facebook
  const loginWithFacebook = async () => {
    setLoading(true)
    try {
      const userData = await mockSocialLogin('facebook')
      setUser(userData)
      saveUserToStorage(userData)
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Função de registro
  const register = async (userData: RegisterData) => {
    setLoading(true)
    try {
      const newUser = await mockRegister(userData)
      setUser(newUser)
      saveUserToStorage(newUser)
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Função de logout
  const logout = () => {
    setUser(null)
    saveUserToStorage(null)
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    loginWithGoogle,
    loginWithFacebook,
    register,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook customizado para usar o contexto
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}