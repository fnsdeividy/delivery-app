import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkOldProducts() {
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
    
    // Buscar todos os produtos da loja (incluindo inativos)
    const allProducts = await prisma.product.findMany({
      where: { storeSlug: storeSlug },
      include: {
        category: true,
        inventory: true
      },
      orderBy: { createdAt: 'desc' }
    })
    
    console.log(`\n📋 Todos os produtos da loja (${allProducts.length} total):`)
    
    if (allProducts.length === 0) {
      console.log('  Nenhum produto encontrado')
      return
    }
    
    // Agrupar por status
    const activeProducts = allProducts.filter(p => p.active)
    const inactiveProducts = allProducts.filter(p => !p.active)
    
    console.log(`\n✅ Produtos Ativos (${activeProducts.length}):`)
    activeProducts.forEach(product => {
      const categoryName = product.category?.name || 'Sem categoria'
      const stock = product.inventory?.quantity || 0
      const minStock = product.inventory?.minStock || 0
      
      console.log(`  - ${product.name} (${categoryName}) - R$ ${product.price.toFixed(2)}`)
      console.log(`    Estoque: ${stock}/${minStock} | Criado: ${product.createdAt.toISOString().split('T')[0]}`)
    })
    
    if (inactiveProducts.length > 0) {
      console.log(`\n❌ Produtos Inativos (${inactiveProducts.length}):`)
      inactiveProducts.forEach(product => {
        const categoryName = product.category?.name || 'Sem categoria'
        console.log(`  - ${product.name} (${categoryName}) - R$ ${product.price.toFixed(2)}`)
        console.log(`    Criado: ${product.createdAt.toISOString().split('T')[0]}`)
      })
    }
    
    // Verificar produtos sem categoria
    const productsWithoutCategory = allProducts.filter(p => !p.category)
    if (productsWithoutCategory.length > 0) {
      console.log(`\n⚠️  Produtos sem categoria (${productsWithoutCategory.length}):`)
      productsWithoutCategory.forEach(product => {
        console.log(`  - ${product.name} - R$ ${product.price.toFixed(2)}`)
      })
    }
    
    // Verificar produtos sem estoque
    const productsWithoutInventory = allProducts.filter(p => !p.inventory)
    if (productsWithoutInventory.length > 0) {
      console.log(`\n⚠️  Produtos sem estoque (${productsWithoutInventory.length}):`)
      productsWithoutInventory.forEach(product => {
        console.log(`  - ${product.name} - R$ ${product.price.toFixed(2)}`)
      })
    }
    
    // Verificar produtos duplicados por nome
    const productNames = allProducts.map(p => p.name)
    const duplicates = productNames.filter((name, index) => productNames.indexOf(name) !== index)
    if (duplicates.length > 0) {
      console.log(`\n⚠️  Produtos com nomes duplicados:`)
      const uniqueDuplicates = [...new Set(duplicates)]
      uniqueDuplicates.forEach(name => {
        const productsWithName = allProducts.filter(p => p.name === name)
        console.log(`  - "${name}" (${productsWithName.length} produtos)`)
        productsWithName.forEach(p => {
          console.log(`    ID: ${p.id} | Ativo: ${p.active} | Categoria: ${p.category?.name || 'Sem categoria'}`)
        })
      })
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar produtos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkOldProducts() 