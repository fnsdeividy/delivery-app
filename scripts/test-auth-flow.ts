#!/usr/bin/env npx tsx

/**
 * Script para testar o fluxo completo de autenticação
 * Execução: npm run test-auth
 */

import bcrypt from 'bcryptjs'
import { db } from '../lib/db'

async function testAuthFlow() {
  console.log('🧪 Testando fluxo de autenticação...\n')

  try {
    // 1. Testar criação de cliente
    console.log('1️⃣ Testando criação de cliente...')
    
    const clienteData = {
      name: 'Cliente Teste',
      email: 'cliente.teste@email.com',
      password: 'senha123',
      phone: '+55 11 98765-4321',
      role: 'CLIENTE' as const
    }

    // Verificar se já existe e deletar
    const existingCliente = await db.user.findUnique({
      where: { email: clienteData.email }
    })
    
    if (existingCliente) {
      await db.user.delete({ where: { email: clienteData.email } })
      console.log('   ✅ Cliente existente removido')
    }

    // Criar cliente
    const hashedPassword = await bcrypt.hash(clienteData.password, 12)
    const cliente = await db.user.create({
      data: {
        ...clienteData,
        password: hashedPassword
      }
    })
    
    console.log(`   ✅ Cliente criado: ${cliente.name} (${cliente.email})`)
    console.log(`   🆔 ID: ${cliente.id}`)

    // 2. Testar criação de lojista
    console.log('\n2️⃣ Testando criação de lojista...')
    
    const lojistaData = {
      name: 'Lojista Teste',
      email: 'lojista.teste@email.com',
      password: 'senha123',
      phone: '+55 11 99999-1234',
      role: 'ADMIN' as const,
      storeSlug: 'loja-teste'
    }

    // Verificar se já existe e deletar
    const existingLojista = await db.user.findUnique({
      where: { email: lojistaData.email }
    })
    
    if (existingLojista) {
      await db.user.delete({ where: { email: lojistaData.email } })
      console.log('   ✅ Lojista existente removido')
    }

    // Verificar se loja existe e deletar
    const existingStore = await db.store.findUnique({
      where: { slug: lojistaData.storeSlug }
    })
    
    if (existingStore) {
      await db.store.delete({ where: { slug: lojistaData.storeSlug } })
      console.log('   ✅ Loja existente removida')
    }

    // Criar loja primeiro
    const store = await db.store.create({
      data: {
        slug: lojistaData.storeSlug,
        name: 'Loja Teste',
        description: 'Loja criada para testes',
        active: true,
        config: {}
      }
    })

    // Criar lojista
    const hashedPasswordLojista = await bcrypt.hash(lojistaData.password, 12)
    const lojista = await db.user.create({
      data: {
        ...lojistaData,
        password: hashedPasswordLojista
      }
    })
    
    console.log(`   ✅ Loja criada: ${store.name} (${store.slug})`)
    console.log(`   ✅ Lojista criado: ${lojista.name} (${lojista.email})`)
    console.log(`   🆔 ID Loja: ${store.id}`)
    console.log(`   🆔 ID Lojista: ${lojista.id}`)

    // 3. Verificar usuário master
    console.log('\n3️⃣ Verificando usuário master...')
    
    const masterUser = await db.user.findUnique({
      where: { email: 'dev@cardap.io' }
    })
    
    if (masterUser) {
      console.log(`   ✅ Master encontrado: ${masterUser.name} (${masterUser.role})`)
    } else {
      console.log('   ❌ Master não encontrado')
    }

    // 4. Testar autenticação
    console.log('\n4️⃣ Testando autenticação...')
    
    // Testar senha do cliente
    const clienteAuth = await bcrypt.compare('senha123', cliente.password!)
    console.log(`   Cliente auth: ${clienteAuth ? '✅' : '❌'}`)
    
    // Testar senha do lojista
    const lojistaAuth = await bcrypt.compare('senha123', lojista.password!)
    console.log(`   Lojista auth: ${lojistaAuth ? '✅' : '❌'}`)
    
    if (masterUser) {
      const masterAuth = await bcrypt.compare('dev123456', masterUser.password!)
      console.log(`   Master auth: ${masterAuth ? '✅' : '❌'}`)
    }

    // 5. Listar todos os usuários
    console.log('\n5️⃣ Resumo dos usuários...')
    
    const allUsers = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        storeSlug: true,
        active: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })

    console.log(`\n📋 Total de usuários: ${allUsers.length}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`)
      console.log(`   🔑 Role: ${user.role}`)
      console.log(`   🏪 Loja: ${user.storeSlug || 'N/A'}`)
      console.log(`   📅 Criado: ${user.createdAt.toLocaleDateString('pt-BR')}`)
      console.log('')
    })

    console.log('🎉 Teste completo realizado com sucesso!')
    
    console.log('\n📝 CREDENCIAIS PARA TESTE:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('👤 CLIENTE:')
    console.log(`   Email: ${clienteData.email}`)
    console.log(`   Senha: ${clienteData.password}`)
    console.log('')
    console.log('🏪 LOJISTA:')
    console.log(`   Email: ${lojistaData.email}`)
    console.log(`   Senha: ${lojistaData.password}`)
    console.log(`   Loja: ${lojistaData.storeSlug}`)
    console.log('')
    console.log('👑 MASTER:')
    console.log('   Email: dev@cardap.io')
    console.log('   Senha: dev123456')

  } catch (error) {
    console.error('❌ Erro no teste:', error)
    process.exit(1)
  } finally {
    await db.$disconnect()
  }
}

// Executar teste
testAuthFlow()
  .then(() => {
    console.log('\n✨ Teste finalizado!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Erro fatal:', error)
    process.exit(1)
  })