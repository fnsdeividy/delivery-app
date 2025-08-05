/**
 * Testes unitários para autenticação
 */

import { authOptions } from '../lib/auth'
import bcrypt from 'bcryptjs'

// Mock do banco de dados
const mockDb = {
  user: {
    findUnique: jest.fn(),
    update: jest.fn()
  }
}

// Mock do NextAuth
jest.mock('next-auth', () => ({
  NextAuth: jest.fn()
}))

jest.mock('../lib/db', () => ({
  db: mockDb
}))

describe('Autenticação', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Credentials Provider', () => {
    it('deve autenticar um cliente válido', async () => {
      const hashedPassword = await bcrypt.hash('123456', 12)
      
      mockDb.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'cliente@teste.com',
        password: hashedPassword,
        name: 'Maria Santos',
        role: 'CLIENTE',
        active: true,
        storeSlug: null
      })

      mockDb.user.update.mockResolvedValue({})

      const credentials = {
        email: 'cliente@teste.com',
        password: '123456',
        userType: 'cliente'
      }

      const provider = authOptions.providers[0]
      const result = await provider.authorize!(credentials, {})

      expect(result).toEqual({
        id: '1',
        email: 'cliente@teste.com',
        name: 'Maria Santos',
        role: 'CLIENTE',
        storeSlug: undefined,
        active: true
      })
    })

    it('deve autenticar um lojista válido', async () => {
      const hashedPassword = await bcrypt.hash('123456', 12)
      
      mockDb.user.findUnique.mockResolvedValue({
        id: '2',
        email: 'teste@teste.com',
        password: hashedPassword,
        name: 'Vitor Nunes',
        role: 'ADMIN',
        active: true,
        storeSlug: null
      })

      mockDb.user.update.mockResolvedValue({})

      const credentials = {
        email: 'teste@teste.com',
        password: '123456',
        userType: 'lojista'
      }

      const provider = authOptions.providers[0]
      const result = await provider.authorize!(credentials, {})

      expect(result).toEqual({
        id: '2',
        email: 'teste@teste.com',
        name: 'Vitor Nunes',
        role: 'ADMIN',
        storeSlug: undefined,
        active: true
      })
    })

    it('deve rejeitar usuário com senha incorreta', async () => {
      const hashedPassword = await bcrypt.hash('123456', 12)
      
      mockDb.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'cliente@teste.com',
        password: hashedPassword,
        name: 'Maria Santos',
        role: 'CLIENTE',
        active: true
      })

      const credentials = {
        email: 'cliente@teste.com',
        password: 'senhaerrada',
        userType: 'cliente'
      }

      const provider = authOptions.providers[0]
      
      await expect(provider.authorize!(credentials, {})).rejects.toThrow('Senha incorreta')
    })

    it('deve rejeitar usuário inativo', async () => {
      const hashedPassword = await bcrypt.hash('123456', 12)
      
      mockDb.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'cliente@teste.com',
        password: hashedPassword,
        name: 'Maria Santos',
        role: 'CLIENTE',
        active: false
      })

      const credentials = {
        email: 'cliente@teste.com',
        password: '123456',
        userType: 'cliente'
      }

      const provider = authOptions.providers[0]
      
      await expect(provider.authorize!(credentials, {})).rejects.toThrow('Conta desativada')
    })

    it('deve rejeitar usuário não encontrado', async () => {
      mockDb.user.findUnique.mockResolvedValue(null)

      const credentials = {
        email: 'naoexiste@teste.com',
        password: '123456',
        userType: 'cliente'
      }

      const provider = authOptions.providers[0]
      
      await expect(provider.authorize!(credentials, {})).rejects.toThrow('Usuário não encontrado')
    })
  })

  describe('Callbacks', () => {
    it('deve incluir dados do usuário no token JWT', () => {
      const user = {
        id: '1',
        email: 'teste@teste.com',
        name: 'Vitor Nunes',
        role: 'ADMIN',
        storeSlug: 'loja-teste',
        active: true
      }

      const token = {}
      const result = authOptions.callbacks!.jwt!({ token, user })

      expect(result).toEqual({
        role: 'ADMIN',
        storeSlug: 'loja-teste',
        active: true
      })
    })

    it('deve incluir dados do token na sessão', () => {
      const token = {
        sub: '1',
        role: 'ADMIN',
        storeSlug: 'loja-teste',
        active: true
      }

      const session = {
        user: {
          email: 'teste@teste.com',
          name: 'Vitor Nunes'
        }
      }

      const result = authOptions.callbacks!.session!({ session, token })

      expect(result.user).toEqual({
        email: 'teste@teste.com',
        name: 'Vitor Nunes',
        id: '1',
        role: 'ADMIN',
        storeSlug: 'loja-teste',
        active: true
      })
    })
  })
}) 