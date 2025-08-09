import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function listStoreProducts() {
  try {
    const storeSlug = 'restaurante-teste'
    
    // Verificar se a loja existe
    const store = await prisma.store.findUnique({
      where: { slug: storeSlug }
    })
    
    if (!store) {
      console.log('❌ Loja não encontrada:', storeSlug)
      return
    }
    
    console.log('✅ Loja encontrada:', store.name)
    
    // Buscar todos os produtos da loja
    const products = await prisma.product.findMany({
      where: { storeSlug: storeSlug },
      include: {
        category: true,
        inventory: true
      },
      orderBy: { name: 'asc' }
    })
    
    console.log(`\n📋 Produtos da loja (${products.length} total):`)
    
    if (products.length === 0) {
      console.log('  Nenhum produto encontrado')
      return
    }
    
    // Agrupar por categoria
    const productsByCategory = products.reduce((acc, product) => {
      const categoryName = product.category?.name || 'Sem categoria'
      if (!acc[categoryName]) {
        acc[categoryName] = []
      }
      acc[categoryName].push(product)
      return acc
    }, {} as Record<string, any[]>)
    
    Object.entries(productsByCategory).forEach(([categoryName, categoryProducts]) => {
      console.log(`\n${categoryName}:`)
      categoryProducts.forEach(product => {
        const status = product.active ? '✅ Ativo' : '❌ Inativo'
        const stock = product.inventory?.quantity || 0
        const minStock = product.inventory?.minStock || 0
        const stockStatus = stock > 0 ? `Estoque: ${stock}/${minStock}` : 'Sem estoque'
        
        console.log(`  - ${product.name} (R$ ${product.price.toFixed(2)})`)
        console.log(`    ${status} | ${stockStatus}`)
        console.log(`    ${product.description || 'Sem descrição'}`)
        if (product.tags && product.tags.length > 0) {
          console.log(`    Tags: ${product.tags.join(', ')}`)
        }
        console.log('')
      })
    })
    
    // Estatísticas
    const activeProducts = products.filter(p => p.active).length
    const inactiveProducts = products.filter(p => !p.active).length
    const productsWithStock = products.filter(p => (p.inventory?.quantity || 0) > 0).length
    
    console.log('\n📊 Estatísticas:')
    console.log(`  - Total de produtos: ${products.length}`)
    console.log(`  - Produtos ativos: ${activeProducts}`)
    console.log(`  - Produtos inativos: ${inactiveProducts}`)
    console.log(`  - Produtos com estoque: ${productsWithStock}`)
    
  } catch (error) {
    console.error('❌ Erro ao listar produtos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

listStoreProducts() 