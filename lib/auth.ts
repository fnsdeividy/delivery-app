import { PrismaAdapter } from '@next-auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { db } from './db'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        userType: { label: 'User Type', type: 'text' },
        storeSlug: { label: 'Store Slug', type: 'text' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email e senha são obrigatórios')
        }

        try {
          // Buscar usuário no banco de dados
          const user = await db.user.findUnique({
            where: { email: credentials.email },
            include: { store: true }
          })

          if (!user) {
            throw new Error('Usuário não encontrado')
          }

          // Verificar senha
          if (!user.password) {
            throw new Error('Usuário deve ter senha configurada')
          }

          const isValidPassword = await bcrypt.compare(credentials.password, user.password)
          if (!isValidPassword) {
            throw new Error('Senha incorreta')
          }

          if (!user.active) {
            throw new Error('Conta desativada')
          }

          // Validações por role - mais flexível para permitir login
          if (credentials.userType === 'lojista') {
            // Para lojistas, aceitar ADMIN ou SUPER_ADMIN
            if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
              throw new Error('Acesso negado - apenas lojistas')
            }
          }

          if (credentials.userType === 'super-admin' && user.role !== 'SUPER_ADMIN') {
            throw new Error('Acesso negado - apenas super admins')
          }

          // Validação de loja apenas se storeSlug for fornecido
          if (credentials.userType === 'lojista' && credentials.storeSlug) {
            if (user.storeSlug && user.storeSlug !== credentials.storeSlug) {
              throw new Error('Acesso negado para esta loja')
            }
          }

          // Atualizar último login
          await db.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() }
          })

          return {
            id: user.id,
            email: user.email,
            name: user.name || user.email,
            role: user.role,
            storeSlug: user.storeSlug || undefined,
            active: user.active
          }
        } catch (error) {
          console.error('Erro na autenticação:', error)
          throw error
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Se for login social (Google), verificar se usuário existe
      if (account?.provider === 'google') {
        const existingUser = await db.user.findUnique({
          where: { email: user.email! }
        })

        if (!existingUser) {
          // Criar novo usuário com role CLIENTE por padrão
          await db.user.create({
            data: {
              email: user.email!,
              name: user.name!,
              image: user.image,
              role: 'CLIENTE',
              active: true
            }
          })
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role
        token.storeSlug = user.storeSlug
        token.active = user.active
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub as string
        session.user.role = token.role as any
        session.user.storeSlug = token.storeSlug as string
        session.user.active = token.active as boolean
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

// Funções auxiliares para verificação de roles
export function hasRole(session: any, role: string): boolean {
  return session?.user?.role === role
}

export function canAccessStore(session: any, storeSlug: string): boolean {
  if (!session?.user) return false
  
  // Super admin pode acessar qualquer loja
  if (session.user.role === 'SUPER_ADMIN') return true
  
  // Lojista só pode acessar sua própria loja
  if (session.user.role === 'ADMIN') {
    return session.user.storeSlug === storeSlug
  }
  
  return false
}

export function getRedirectUrl(role: string, storeSlug?: string): string {
  switch (role) {
    case 'SUPER_ADMIN':
      return '/admin'
    case 'ADMIN':
      return `/dashboard/${storeSlug}`
    case 'CLIENTE':
      return '/'
    default:
      return '/'
  }
}