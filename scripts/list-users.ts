/**
 * Script para listar todos os usuários
 */

import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function listUsers() {
  console.log('👥 Listando todos os usuários...\n')
  
  try {
    const users = await db.user.findMany({
      include: { store: true },
      orderBy: { createdAt: 'asc' }
    })

    console.log(`📊 Total de usuários: ${users.length}\n`)

    for (const user of users) {
      console.log(`👤 ${user.name || 'Sem nome'}`)
      console.log(`   📧 Email: ${user.email}`)
      console.log(`   🏷️  Role: ${user.role}`)
      console.log(`   🏪 Loja: ${user.storeSlug || 'N/A'}`)
      console.log(`   🔐 Tem senha: ${user.password ? 'Sim' : 'Não'}`)
      console.log(`   ✅ Ativo: ${user.active ? 'Sim' : 'Não'}`)
      console.log(`   📅 Criado: ${user.createdAt.toLocaleDateString('pt-BR')}`)
      console.log('')
    }

    // Mostrar dados de teste
    console.log('🧪 DADOS PARA TESTE:')
    console.log('')
    
    const adminUsers = users.filter(u => u.role === 'ADMIN' && u.password)
    if (adminUsers.length > 0) {
      console.log('🏪 Lojistas (senha: 123456):')
      adminUsers.forEach(user => {
        console.log(`   • ${user.email}`)
      })
      console.log('')
    }

    const superAdminUsers = users.filter(u => u.role === 'SUPER_ADMIN' && u.password)
    if (superAdminUsers.length > 0) {
      console.log('👑 Super Admins (senha: admin123):')
      superAdminUsers.forEach(user => {
        console.log(`   • ${user.email}`)
      })
      console.log('')
    }

    const clientUsers = users.filter(u => u.role === 'CLIENTE' && u.password)
    if (clientUsers.length > 0) {
      console.log('👤 Clientes (senha: 123456):')
      clientUsers.slice(0, 5).forEach(user => {
        console.log(`   • ${user.email}`)
      })
      if (clientUsers.length > 5) {
        console.log(`   ... e mais ${clientUsers.length - 5} clientes`)
      }
      console.log('')
    }

  } catch (error) {
    console.error('❌ Erro ao listar usuários:', error)
  }

  await db.$disconnect()
}

listUsers().catch(console.error) 