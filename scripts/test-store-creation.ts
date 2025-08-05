/**
 * Script para testar criação de loja e redirecionamento
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

async function testStoreCreation() {
  console.log('🏪 Testando criação de loja...')
  
  const testStoreData = {
    // Dados do proprietário
    ownerName: 'Teste Loja',
    ownerEmail: 'teste.loja@example.com',
    ownerPhone: '11999999999',
    password: '123456',
    
    // Dados da loja
    storeName: 'Loja Teste',
    storeSlug: 'loja-teste-' + Date.now(),
    description: 'Loja para testes',
    category: 'Restaurante',
    
    // Endereço
    address: 'Rua Teste, 123',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01234-567',
    
    // Configurações
    deliveryEnabled: true,
    deliveryFee: '5.00',
    minimumOrder: '20.00'
  }

  try {
    console.log('📝 Dados da loja de teste:')
    console.log(`   Nome: ${testStoreData.storeName}`)
    console.log(`   Slug: ${testStoreData.storeSlug}`)
    console.log(`   Email: ${testStoreData.ownerEmail}`)
    console.log('')

    // Verificar se usuário já existe
    const existingUser = await db.user.findUnique({
      where: { email: testStoreData.ownerEmail }
    })

    if (existingUser) {
      console.log('⚠️  Usuário já existe, removendo...')
      await db.user.delete({
        where: { email: testStoreData.ownerEmail }
      })
    }

    // Verificar se loja já existe
    const existingStore = await db.store.findUnique({
      where: { slug: testStoreData.storeSlug }
    })

    if (existingStore) {
      console.log('⚠️  Loja já existe, removendo...')
      await db.store.delete({
        where: { slug: testStoreData.storeSlug }
      })
    }

    console.log('🔧 Criando loja via API...')
    
    // Simular criação via API
    const hashedPassword = await bcrypt.hash(testStoreData.password, 12)
    
    const result = await db.$transaction(async (tx) => {
      // 1. Criar loja
      const store = await tx.store.create({
        data: {
          slug: testStoreData.storeSlug,
          name: testStoreData.storeName,
          description: testStoreData.description,
          active: true,
          config: {}
        }
      })

      // 2. Criar usuário proprietário
      const user = await tx.user.create({
        data: {
          name: testStoreData.ownerName,
          email: testStoreData.ownerEmail,
          password: hashedPassword,
          phone: testStoreData.ownerPhone,
          role: 'ADMIN',
          active: true,
          storeSlug: testStoreData.storeSlug
        }
      })

      return { store, user }
    })

    console.log('✅ Loja criada com sucesso!')
    console.log(`   Loja ID: ${result.store.id}`)
    console.log(`   Usuário ID: ${result.user.id}`)
    console.log('')

    // Testar login
    console.log('🔐 Testando login...')
    const user = await db.user.findUnique({
      where: { email: testStoreData.ownerEmail },
      include: { store: true }
    })

    if (user) {
      const isValidPassword = await bcrypt.compare(testStoreData.password, user.password!)
      console.log(`   Login válido: ${isValidPassword ? '✅ Sim' : '❌ Não'}`)
      console.log(`   Role: ${user.role}`)
      console.log(`   Loja: ${user.storeSlug}`)
      console.log('')

      if (isValidPassword) {
        console.log('🎯 URLs para teste:')
        console.log(`   Dashboard: http://localhost:3000/dashboard/${testStoreData.storeSlug}?welcome=true&message=Loja criada com sucesso! Configure sua loja.`)
        console.log(`   Loja Pública: http://localhost:3000/store/${testStoreData.storeSlug}`)
        console.log(`   Login: http://localhost:3000/login/lojista`)
        console.log('')
        console.log('🧪 Credenciais para teste:')
        console.log(`   Email: ${testStoreData.ownerEmail}`)
        console.log(`   Senha: ${testStoreData.password}`)
        console.log(`   Tipo: lojista`)
      }
    }

  } catch (error) {
    console.error('❌ Erro ao testar criação de loja:', error)
  }

  await db.$disconnect()
}

testStoreCreation().catch(console.error) 