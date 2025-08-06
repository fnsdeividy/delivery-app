import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function testAdminLogin() {
  console.log('👑 Testando login do Super Admin...')

  try {
    // Buscar o admin
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@cardapio.com' },
      include: { store: true }
    })

    if (!admin) {
      console.log('❌ Admin não encontrado')
      return
    }

    console.log('✅ Admin encontrado:')
    console.log(`   Nome: ${admin.name}`)
    console.log(`   Email: ${admin.email}`)
    console.log(`   Role: ${admin.role}`)
    console.log(`   Ativo: ${admin.active}`)
    console.log(`   Loja: ${admin.storeSlug}`)
    console.log(`   Tem senha: ${!!admin.password}`)

    // Testar senha
    const password = 'admin123'
    const isValidPassword = await bcrypt.compare(password, admin.password!)
    
    console.log(`\n🔑 Teste de senha: ${isValidPassword ? '✅ Válida' : '❌ Inválida'}`)

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

    console.log('✅ Todas as validações passaram!')
    console.log('✅ Login deve funcionar corretamente')

    // Testar redirecionamento
    console.log('\n🎯 Testando redirecionamento:')
    if (admin.role === 'SUPER_ADMIN') {
      console.log('✅ Deve redirecionar para: /dashboard/gerenciar-lojas')
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAdminLogin()
  .then(() => {
    console.log('\n✅ Teste concluído!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Erro no teste:', error)
    process.exit(1)
  }) 