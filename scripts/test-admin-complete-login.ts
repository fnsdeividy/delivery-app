import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function testAdminCompleteLogin() {
  console.log('👑 Testando login completo do Super Admin...')

  try {
    // Dados do admin
    const adminData = {
      email: 'admin@cardapio.com',
      password: 'admin123',
      userType: 'lojista' // Como está configurado na página de login
    }

    console.log('📋 Dados de login:')
    console.log(`   Email: ${adminData.email}`)
    console.log(`   Senha: ${adminData.password}`)
    console.log(`   UserType: ${adminData.userType}`)

    // Verificar se admin existe
    const admin = await prisma.user.findUnique({
      where: { email: adminData.email }
    })

    if (!admin) {
      console.log('❌ Admin não encontrado no banco')
      return
    }

    console.log('✅ Admin encontrado no banco')
    console.log(`   Nome: ${admin.name}`)
    console.log(`   Role: ${admin.role}`)
    console.log(`   Ativo: ${admin.active}`)

    // Testar senha
    const isValidPassword = await bcrypt.compare(adminData.password, admin.password!)
    console.log(`🔑 Senha válida: ${isValidPassword ? '✅' : '❌'}`)

    if (!isValidPassword) {
      console.log('❌ Senha incorreta')
      return
    }

    // Simular validação do NextAuth
    console.log('\n🔍 Simulando validação do NextAuth:')
    
    if (!admin.active) {
      console.log('❌ Admin inativo')
      return
    }

    if (admin.role !== 'SUPER_ADMIN') {
      console.log('❌ Role não é SUPER_ADMIN')
      return
    }

    // Verificar se userType 'lojista' aceita SUPER_ADMIN
    if (adminData.userType === 'lojista') {
      if (admin.role !== 'ADMIN' && admin.role !== 'SUPER_ADMIN') {
        console.log('❌ SUPER_ADMIN não é aceito com userType lojista')
        return
      }
      console.log('✅ SUPER_ADMIN é aceito com userType lojista')
    }

    console.log('✅ Todas as validações passaram!')

    // Testar redirecionamento
    console.log('\n🎯 Testando redirecionamento:')
    if (admin.role === 'SUPER_ADMIN') {
      console.log('✅ Deve redirecionar para: /dashboard/gerenciar-lojas')
    }

    // Simular chamada da API de login
    console.log('\n🌐 Simulando chamada da API de login...')
    
    const response = await fetch('http://localhost:3000/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(adminData),
    })

    console.log(`📊 Status da resposta: ${response.status}`)
    
    if (response.status === 302) {
      console.log('✅ Redirecionamento 302 (esperado para NextAuth)')
      const location = response.headers.get('location')
      console.log(`📍 Location: ${location}`)
    } else if (response.ok) {
      console.log('✅ Login bem-sucedido')
    } else {
      console.log('❌ Erro no login')
      const data = await response.text()
      console.log(`📄 Resposta: ${data}`)
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAdminCompleteLogin()
  .then(() => {
    console.log('\n✅ Teste concluído!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Erro no teste:', error)
    process.exit(1)
  }) 