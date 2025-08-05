#!/usr/bin/env npx tsx

/**
 * Script para criar usuário master para equipe de desenvolvimento
 * Execução: npm run create-dev-master
 */

import bcrypt from 'bcryptjs'
import { db } from '../lib/db'

async function createDevMaster() {
  try {
    console.log('🔧 Criando usuário master para desenvolvimento...')

    // Dados do usuário master
    const masterUser = {
      name: 'Master Developer',
      email: 'dev@cardap.io',
      password: 'dev123456', // Senha temporária - deve ser alterada em produção
      phone: '+55 11 99999-0000',
      role: 'SUPER_ADMIN' as const
    }

    // Verificar se já existe
    const existingUser = await db.user.findUnique({
      where: { email: masterUser.email }
    })

    if (existingUser) {
      console.log('⚠️  Usuário master já existe!')
      console.log(`📧 Email: ${existingUser.email}`)
      console.log(`👤 Nome: ${existingUser.name}`)
      console.log(`🔑 Role: ${existingUser.role}`)
      console.log('\n💡 Para redefinir senha, exclua o usuário primeiro.')
      return
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(masterUser.password, 12)

    // Criar usuário
    const user = await db.user.create({
      data: {
        name: masterUser.name,
        email: masterUser.email,
        password: hashedPassword,
        phone: masterUser.phone,
        role: masterUser.role,
        active: true
      }
    })

    console.log('✅ Usuário master criado com sucesso!')
    console.log('\n📋 CREDENCIAIS DE DESENVOLVIMENTO:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`👤 Nome: ${user.name}`)
    console.log(`📧 Email: ${user.email}`)
    console.log(`🔑 Senha: ${masterUser.password}`)
    console.log(`🛡️  Role: ${user.role}`)
    console.log(`📱 Telefone: ${user.phone}`)
    console.log(`🆔 ID: ${user.id}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    console.log('\n🌐 URLS DE ACESSO:')
    console.log(`🔑 Super Admin: http://localhost:3000/login/super-admin`)
    console.log(`🏪 Dashboard: http://localhost:3000/admin`)
    
    console.log('\n⚠️  IMPORTANTE:')
    console.log('• Este usuário tem acesso TOTAL ao sistema')
    console.log('• Pode gerenciar todas as lojas e usuários')
    console.log('• Altere a senha em produção!')
    console.log('• Use apenas para desenvolvimento e testes')

  } catch (error) {
    console.error('❌ Erro ao criar usuário master:', error)
    process.exit(1)
  } finally {
    await db.$disconnect()
  }
}

// Executar script
createDevMaster()
  .then(() => {
    console.log('\n🎉 Script executado com sucesso!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Erro fatal:', error)
    process.exit(1)
  })