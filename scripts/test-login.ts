/**
 * Script para testar a autenticação
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

async function testLogin() {
  console.log('🧪 Testando autenticação...')
  
  // Testar com usuários existentes
  const testUsers = [
    {
      email: 'superadmin@cardap.io',
      password: 'admin123',
      userType: 'super-admin'
    },
    {
      email: 'admin@burgerstation.com',
      password: '123456',
      userType: 'lojista'
    },
    {
      email: 'teste@teste.com',
      password: '123456',
      userType: 'lojista'
    },
    {
      email: 'cliente@teste.com',
      password: '123456',
      userType: 'cliente'
    }
  ]

  for (const testUser of testUsers) {
    console.log(`\n🔍 Testando login: ${testUser.email}`)
    
    try {
      // Buscar usuário
      const user = await db.user.findUnique({
        where: { email: testUser.email },
        include: { store: true }
      })

      if (!user) {
        console.log('❌ Usuário não encontrado')
        continue
      }

      console.log(`✅ Usuário encontrado: ${user.name} (${user.role})`)
      console.log(`📧 Email: ${user.email}`)
      console.log(`🏪 Loja: ${user.storeSlug || 'N/A'}`)
      console.log(`🔐 Tem senha: ${user.password ? 'Sim' : 'Não'}`)
      console.log(`✅ Ativo: ${user.active ? 'Sim' : 'Não'}`)

      if (user.password) {
        // Testar senha
        const isValidPassword = await bcrypt.compare(testUser.password, user.password)
        console.log(`🔑 Senha válida: ${isValidPassword ? 'Sim' : 'Não'}`)
        
        if (isValidPassword) {
          console.log('🎉 Login válido!')
        } else {
          console.log('❌ Senha incorreta')
        }
      } else {
        console.log('❌ Usuário não tem senha configurada')
      }

    } catch (error) {
      console.error('❌ Erro ao testar:', error)
    }
  }

  await db.$disconnect()
}

testLogin().catch(console.error) 