import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function testLoginFlow() {
  console.log('🔄 Testando fluxo completo de login e redirecionamento...')

  try {
    // Testar com diferentes tipos de usuário
    const testUsers = [
      {
        name: 'Super Admin',
        email: 'admin@cardapio.com',
        password: 'admin123',
        expectedRole: 'SUPER_ADMIN',
        expectedRedirect: '/dashboard/gerenciar-lojas'
      },
      {
        name: 'Lojista João',
        email: 'joao@botecodojao.com',
        password: 'lojista123',
        expectedRole: 'ADMIN',
        expectedRedirect: '/dashboard/boteco-do-joao'
      },
      {
        name: 'Lojista Teste',
        email: 'teste@exemplo.com',
        password: 'teste123',
        expectedRole: 'ADMIN',
        expectedRedirect: '/dashboard/restaurante-teste'
      }
    ]

    for (const testUser of testUsers) {
      console.log(`\n👤 Testando: ${testUser.name}`)
      console.log('='.repeat(50))

      // Verificar se usuário existe
      const user = await prisma.user.findUnique({
        where: { email: testUser.email }
      })

      if (!user) {
        console.log('❌ Usuário não encontrado')
        continue
      }

      console.log(`✅ Usuário encontrado: ${user.name}`)
      console.log(`   Role: ${user.role}`)
      console.log(`   Loja: ${user.storeSlug || 'N/A'}`)
      console.log(`   Ativo: ${user.active}`)

      // Testar senha
      const isValidPassword = await bcrypt.compare(testUser.password, user.password!)
      console.log(`🔑 Senha válida: ${isValidPassword ? '✅' : '❌'}`)

      if (!isValidPassword) {
        console.log('❌ Senha incorreta')
        continue
      }

      // Verificar role
      if (user.role !== testUser.expectedRole) {
        console.log(`❌ Role incorreto. Esperado: ${testUser.expectedRole}, Encontrado: ${user.role}`)
        continue
      }

      console.log('✅ Role correto')

      // Verificar redirecionamento
      let expectedRedirect = testUser.expectedRedirect
      if (user.role === 'ADMIN' && user.storeSlug) {
        expectedRedirect = `/dashboard/${user.storeSlug}`
      } else if (user.role === 'SUPER_ADMIN') {
        expectedRedirect = '/dashboard/gerenciar-lojas'
      }

      console.log(`🎯 Redirecionamento esperado: ${expectedRedirect}`)

      // Verificar se a loja existe (para ADMIN)
      if (user.role === 'ADMIN' && user.storeSlug) {
        const store = await prisma.store.findUnique({
          where: { slug: user.storeSlug }
        })
        
        if (store) {
          console.log(`✅ Loja encontrada: ${store.name}`)
        } else {
          console.log(`❌ Loja não encontrada: ${user.storeSlug}`)
        }
      }

      // Simular login via API
      console.log('\n🌐 Simulando login via API...')
      
      const loginData = {
        email: testUser.email,
        password: testUser.password,
        userType: 'lojista'
      }

      const response = await fetch('http://localhost:3000/api/auth/callback/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      })

      console.log(`📊 Status da resposta: ${response.status}`)
      
      if (response.ok || response.status === 302) {
        console.log('✅ Login bem-sucedido')
        console.log(`🎯 Deve redirecionar para: ${expectedRedirect}`)
      } else {
        console.log('❌ Erro no login')
        const data = await response.text()
        console.log(`📄 Resposta: ${data}`)
      }

      console.log('✅ Teste concluído para este usuário')
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testLoginFlow()
  .then(() => {
    console.log('\n✅ Todos os testes concluídos!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Erro nos testes:', error)
    process.exit(1)
  }) 