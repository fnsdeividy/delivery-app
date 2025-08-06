import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testCreateStore() {
  console.log('🏪 Testando criação de loja...')

  try {
    // Dados de teste para criação de loja
    const testData = {
      ownerName: 'Teste Silva',
      ownerEmail: 'teste@exemplo.com',
      ownerPhone: '(11) 12345-6789',
      password: 'teste123',
      storeName: 'Restaurante Teste',
      storeSlug: 'restaurante-teste',
      description: 'Restaurante de teste para validação',
      category: 'Restaurante',
      address: 'Rua Teste, 123',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
      deliveryEnabled: true,
      deliveryFee: '5.00',
      minimumOrder: '20.00'
    }

    console.log('📋 Dados de teste:')
    console.log(`   Proprietário: ${testData.ownerName}`)
    console.log(`   Email: ${testData.ownerEmail}`)
    console.log(`   Loja: ${testData.storeName}`)
    console.log(`   Slug: ${testData.storeSlug}`)

    // Verificar se usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: testData.ownerEmail }
    })

    if (existingUser) {
      console.log('❌ Usuário já existe no banco')
      return
    }

    // Verificar se loja já existe
    const existingStore = await prisma.store.findUnique({
      where: { slug: testData.storeSlug }
    })

    if (existingStore) {
      console.log('❌ Loja já existe no banco')
      return
    }

    console.log('✅ Dados válidos para criação')

    // Simular chamada da API
    console.log('\n🌐 Simulando chamada da API...')
    
    const response = await fetch('http://localhost:3000/api/auth/register/loja', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    })

    const data = await response.json()

    console.log(`📊 Status da resposta: ${response.status}`)
    console.log(`📄 Dados da resposta:`, data)

    if (response.ok) {
      console.log('✅ Loja criada com sucesso!')
      
      // Verificar se foi criada no banco
      const newUser = await prisma.user.findUnique({
        where: { email: testData.ownerEmail }
      })
      
      const newStore = await prisma.store.findUnique({
        where: { slug: testData.storeSlug }
      })

      console.log('\n📋 Verificação no banco:')
      console.log(`   Usuário criado: ${newUser ? '✅' : '❌'}`)
      console.log(`   Loja criada: ${newStore ? '✅' : '❌'}`)
      
      if (newUser && newStore) {
        console.log('🎉 Tudo funcionando corretamente!')
      }
    } else {
      console.log('❌ Erro na criação da loja')
      console.log(`   Erro: ${data.error}`)
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testCreateStore()
  .then(() => {
    console.log('\n✅ Teste concluído!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Erro no teste:', error)
    process.exit(1)
  }) 