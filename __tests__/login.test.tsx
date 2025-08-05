/**
 * Teste simples para o componente de login
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LoginPage from '../app/(auth)/login/page'

// Mock do NextAuth
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(() => Promise.resolve({ ok: true, error: null })),
  useSession: jest.fn(() => ({ data: null, status: 'unauthenticated' })),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock do Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}))

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('deve renderizar o formulário de login', () => {
    render(<LoginPage />)
    
    expect(screen.getByText('Faça login em sua conta')).toBeInTheDocument()
    expect(screen.getByLabelText('Tipo de conta')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Senha')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument()
  })

  it('deve permitir alterar o tipo de conta', () => {
    render(<LoginPage />)
    
    const userTypeSelect = screen.getByLabelText('Tipo de conta')
    fireEvent.change(userTypeSelect, { target: { value: 'lojista' } })
    
    expect(userTypeSelect).toHaveValue('lojista')
  })

  it('deve permitir digitar email e senha', () => {
    render(<LoginPage />)
    
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Senha')
    
    fireEvent.change(emailInput, { target: { value: 'teste@teste.com' } })
    fireEvent.change(passwordInput, { target: { value: '123456' } })
    
    expect(emailInput).toHaveValue('teste@teste.com')
    expect(passwordInput).toHaveValue('123456')
  })

  it('deve mostrar/ocultar senha ao clicar no ícone', () => {
    render(<LoginPage />)
    
    const passwordInput = screen.getByLabelText('Senha')
    const toggleButton = screen.getByRole('button', { name: '' }) // Botão do olho
    
    // Inicialmente deve estar oculta
    expect(passwordInput).toHaveAttribute('type', 'password')
    
    // Clicar para mostrar
    fireEvent.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'text')
    
    // Clicar para ocultar novamente
    fireEvent.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('deve mostrar link para criar conta', () => {
    render(<LoginPage />)
    
    const createAccountLink = screen.getByText('crie uma nova conta')
    expect(createAccountLink).toBeInTheDocument()
    expect(createAccountLink).toHaveAttribute('href', '/register')
  })

  it('deve mostrar link para esqueceu a senha', () => {
    render(<LoginPage />)
    
    const forgotPasswordLink = screen.getByText('Esqueceu a senha?')
    expect(forgotPasswordLink).toBeInTheDocument()
    expect(forgotPasswordLink).toHaveAttribute('href', '/forgot-password')
  })

  it('deve mostrar link para voltar ao início', () => {
    render(<LoginPage />)
    
    const backLink = screen.getByText('Voltar ao início')
    expect(backLink).toBeInTheDocument()
    expect(backLink).toHaveAttribute('href', '/')
  })
}) 