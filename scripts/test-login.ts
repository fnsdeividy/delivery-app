/**
 * Script para testar a autenticação
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function testLogin() {
  console.log('🔐 Testando login do lojista...')

  try {
    // Buscar o usuário
    const user = await prisma.user.findUnique({
      where: { email: 'joao@botecodojao.com' },
      include: { store: true }
    })

    if (!user) {
      console.log('❌ Usuário não encontrado')
      return
    }

    console.log('✅ Usuário encontrado:')
    console.log(`   Nome: ${user.name}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Role: ${user.role}`)
    console.log(`   Ativo: ${user.active}`)
    console.log(`   Loja: ${user.storeSlug}`)
    console.log(`   Tem senha: ${!!user.password}`)

    // Testar senha
    const password = 'lojista123'
    const isValidPassword = await bcrypt.compare(password, user.password!)
    
    console.log(`\n🔑 Teste de senha: ${isValidPassword ? '✅ Válida' : '❌ Inválida'}`)

    // Verificar se a loja existe
    if (user.storeSlug) {
      const store = await prisma.store.findUnique({
        where: { slug: user.storeSlug }
      })
      console.log(`🏪 Loja encontrada: ${store ? '✅' : '❌'} ${store?.name || 'N/A'}`)
    }

    // Simular validação do NextAuth
    console.log('\n🔍 Simulando validação do NextAuth:')
    
    if (!user.active) {
      console.log('❌ Usuário inativo')
      return
    }

    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      console.log('❌ Role não permitido para lojista')
      return
    }

    console.log('✅ Todas as validações passaram!')
    console.log('✅ Login deve funcionar corretamente')

  } catch (error) {
    console.error('❌ Erro no teste:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testLogin()
  .then(() => {
    console.log('\n✅ Teste concluído!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Erro no teste:', error)
    process.exit(1)
  }) 