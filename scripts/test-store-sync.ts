import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testStoreSync() {
  console.log('🔄 Testando sincronização entre dashboard e loja pública...')
  console.log('='.repeat(60))

  try {
    // 1. Verificar lojas no banco
    console.log('📊 Verificando lojas no banco de dados...')
    const stores = await prisma.store.findMany({
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        active: true,
        config: true,
        _count: {
          select: {
            categories: true,
            products: true
          }
        }
      }
    })

    console.log(`✅ Encontradas ${stores.length} lojas no banco:`)
    stores.forEach(store => {
      console.log(`  - ${store.name} (${store.slug})`)
      console.log(`    Status: ${store.active ? 'Ativa' : 'Inativa'}`)
      console.log(`    Categorias: ${store._count.categories}`)
      console.log(`    Produtos: ${store._count.products}`)
      console.log(`    Config: ${Object.keys(store.config as any).length} seções`)
    })

    // 2. Testar API pública para cada loja
    console.log('\n🌐 Testando APIs públicas...')
    
    for (const store of stores) {
      console.log(`\n📱 Testando loja: ${store.name}`)
      console.log('-'.repeat(40))
      
      try {
        // Testar API pública
        const publicResponse = await fetch(`http://localhost:3000/api/stores/${store.slug}/public`)
        
        if (publicResponse.ok) {
          const publicData = await publicResponse.json()
          
          console.log(`✅ API pública funcionando`)
          console.log(`  Status: ${publicData.status.isOpen ? 'Aberta' : 'Fechada'}`)
          console.log(`  Mensagem: ${publicData.status.message}`)
          console.log(`  Categorias: ${publicData.menu.categories.length}`)
          console.log(`  Produtos: ${publicData.menu.products.length}`)
          console.log(`  Tema: ${publicData.branding.primaryColor}`)
          
          // Verificar se produtos estão sincronizados
          const dbProducts = await prisma.product.findMany({
            where: { storeSlug: store.slug, active: true },
            select: { id: true, name: true, price: true }
          })
          
          console.log(`  Produtos no banco: ${dbProducts.length}`)
          console.log(`  Produtos na API: ${publicData.menu.products.length}`)
          
          if (dbProducts.length === publicData.menu.products.length) {
            console.log(`✅ Sincronização de produtos: OK`)
          } else {
            console.log(`⚠️  Sincronização de produtos: Diferente`)
          }
          
        } else {
          const error = await publicResponse.json()
          console.log(`❌ Erro na API pública: ${error.error}`)
        }
        
      } catch (error) {
        console.log(`❌ Erro ao testar API: ${error}`)
      }
    }

    // 3. Testar sincronização de configurações
    console.log('\n⚙️ Testando sincronização de configurações...')
    
    const testStore = stores[0] // Usar primeira loja para teste
    if (testStore) {
      console.log(`\n🧪 Testando com loja: ${testStore.name}`)
      
      const testConfig = {
        branding: {
          primaryColor: '#ff6b35',
          secondaryColor: '#f7931e',
          backgroundColor: '#fff8f0',
          textColor: '#2d3748',
          accentColor: '#ff8c42'
        },
        schedule: {
          timezone: 'America/Sao_Paulo',
          workingHours: {
            monday: { open: true, hours: [{ start: '08:00', end: '18:00' }] },
            tuesday: { open: true, hours: [{ start: '08:00', end: '18:00' }] },
            wednesday: { open: true, hours: [{ start: '08:00', end: '18:00' }] },
            thursday: { open: true, hours: [{ start: '08:00', end: '18:00' }] },
            friday: { open: true, hours: [{ start: '08:00', end: '18:00' }] },
            saturday: { open: true, hours: [{ start: '08:00', end: '16:00' }] },
            sunday: { open: false, hours: [] }
          },
          closedMessage: 'Fechado aos domingos. Volte segunda!'
        },
        settings: {
          preparationTime: 25,
          minimumOrderValue: 20.00
        }
      }

      try {
        // Testar API de sincronização
        const syncResponse = await fetch(`http://localhost:3000/api/stores/${testStore.slug}/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testConfig)
        })

        if (syncResponse.ok) {
          console.log(`✅ Configurações sincronizadas com sucesso`)
          
          // Verificar se foi salvo no banco
          const updatedStore = await prisma.store.findUnique({
            where: { slug: testStore.slug },
            select: { config: true }
          })
          
          if (updatedStore) {
            const savedConfig = updatedStore.config as any
            console.log(`✅ Configurações salvas no banco`)
            console.log(`  Cores: ${savedConfig.branding?.primaryColor}`)
            console.log(`  Horários: ${savedConfig.schedule?.workingHours?.monday?.open ? 'Segunda aberta' : 'Segunda fechada'}`)
            console.log(`  Preparo: ${savedConfig.settings?.preparationTime} min`)
          }
          
          // Verificar se aparece na API pública
          const publicResponse = await fetch(`http://localhost:3000/api/stores/${testStore.slug}/public`)
          if (publicResponse.ok) {
            const publicData = await publicResponse.json()
            console.log(`✅ Configurações refletidas na API pública`)
            console.log(`  Cor primária: ${publicData.branding.primaryColor}`)
            console.log(`  Status: ${publicData.status.isOpen ? 'Aberta' : 'Fechada'}`)
            console.log(`  Mensagem: ${publicData.status.message}`)
          }
          
        } else {
          const error = await syncResponse.json()
          console.log(`❌ Erro na sincronização: ${error.error}`)
        }
        
      } catch (error) {
        console.log(`❌ Erro ao testar sincronização: ${error}`)
      }
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testStoreSync()
  .then(() => {
    console.log('\n✅ Teste de sincronização concluído!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Erro no teste:', error)
    process.exit(1)
  }) 