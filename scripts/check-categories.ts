import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkCategories() {
  try {
    const storeSlug = 'restaurante-teste'
    
    console.log('🔍 Verificando categorias da loja...')
    
    // Buscar categorias diretamente do banco
    const dbCategories = await prisma.category.findMany({
      where: { storeSlug },
      orderBy: { order: 'asc' }
    })
    
    console.log(`📊 Categorias no banco de dados (${dbCategories.length} total):`)
    dbCategories.forEach(cat => {
      console.log(`  - ${cat.name} (ID: ${cat.id}, Ativa: ${cat.active}, Ordem: ${cat.order})`)
    })
    
    // Testar a API pública
    console.log('\n🌐 Testando API pública...')
    const response = await fetch(`http://localhost:3000/api/stores/${storeSlug}/public`)
    
    if (response.ok) {
      const data = await response.json()
      const apiCategories = data.menu?.categories || []
      
      console.log(`📊 Categorias da API (${apiCategories.length} total):`)
      apiCategories.forEach((cat: any) => {
        console.log(`  - ${cat.name} (ID: ${cat.id}, Ativa: ${cat.active}, Ordem: ${cat.order})`)
      })
      
      // Verificar se há diferenças
      if (dbCategories.length !== apiCategories.length) {
        console.log('\n⚠️  DIFERENÇA ENCONTRADA!')
        console.log(`Banco: ${dbCategories.length} categorias`)
        console.log(`API: ${apiCategories.length} categorias`)
      } else {
        console.log('\n✅ Número de categorias coincide')
      }
      
      // Verificar categorias ativas
      const activeDbCategories = dbCategories.filter(c => c.active)
      const activeApiCategories = apiCategories.filter((c: any) => c.active)
      
      console.log(`\n✅ Categorias ativas no banco: ${activeDbCategories.length}`)
      console.log(`✅ Categorias ativas na API: ${activeApiCategories.length}`)
      
      if (activeDbCategories.length === 0) {
        console.log('\n❌ PROBLEMA: Nenhuma categoria ativa encontrada!')
        console.log('Isso pode explicar por que o campo categoria não aparece no formulário.')
      }
      
    } else {
      console.log('❌ Erro ao acessar API pública:', response.status)
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar categorias:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkCategories() 