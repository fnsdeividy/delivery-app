import { config } from 'dotenv'
import { resolve } from 'path'

// Carregar variáveis de ambiente
config({ path: resolve(__dirname, '../.env.local') })

async function testDashboardCategories() {
  try {
    const storeSlug = 'restaurante-teste'
    
    console.log('🧪 Testando carregamento de categorias para o dashboard...')
    
    // Simular a mesma chamada que o dashboard faz
    const response = await fetch(`http://localhost:3000/api/stores/${storeSlug}/public`, { 
      cache: 'no-store' 
    })
    
    if (!response.ok) {
      console.log('❌ Erro na API:', response.status)
      return
    }
    
    const data = await response.json()
    const categories = data.menu?.categories || []
    
    console.log(`📊 Categorias retornadas pela API: ${categories.length}`)
    
    // Filtrar categorias ativas (como o dashboard faz)
    const activeCategories = categories.filter((c: any) => c.active)
    
    console.log(`✅ Categorias ativas: ${activeCategories.length}`)
    
    if (activeCategories.length > 0) {
      console.log('📝 Lista de categorias ativas:')
      activeCategories.forEach((cat: any) => {
        console.log(`  - ${cat.name} (ID: ${cat.id})`)
      })
      
      console.log('\n🎯 Campo categoria deve mostrar um select com essas opções')
    } else {
      console.log('❌ Nenhuma categoria ativa encontrada!')
      console.log('O campo categoria deve mostrar um input de texto para criar nova categoria')
    }
    
    // Verificar se há categorias inativas
    const inactiveCategories = categories.filter((c: any) => !c.active)
    if (inactiveCategories.length > 0) {
      console.log(`\n⚠️  Categorias inativas (não aparecem no select): ${inactiveCategories.length}`)
      inactiveCategories.forEach((cat: any) => {
        console.log(`  - ${cat.name} (ID: ${cat.id})`)
      })
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error)
  }
}

testDashboardCategories() 