import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkProductCategories() {
  try {
    const storeSlug = 'restaurante-teste'
    
    console.log('🔍 Verificando produtos e suas categorias...')
    
    // Buscar produtos com suas categorias
    const products = await prisma.product.findMany({
      where: { storeSlug },
      include: {
        category: true,
        inventory: true
      },
      orderBy: { name: 'asc' }
    })
    
    console.log(`📊 Produtos encontrados: ${products.length}`)
    
    let problematicProducts = 0
    
    products.forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.name}`)
      console.log(`   - ID: ${product.id}`)
      console.log(`   - Categoria ID: ${product.categoryId}`)
      console.log(`   - Categoria Nome: ${product.category?.name || 'N/A'}`)
      console.log(`   - Estoque: ${product.inventory?.quantity || 0}`)
      console.log(`   - Estoque Mínimo: ${product.inventory?.minStock || 0}`)
      
      // Verificar se há problemas
      if (!product.category) {
        console.log('   ❌ PROBLEMA: Produto sem categoria!')
        problematicProducts++
      } else if (product.category.name === '232' || product.category.name === '232') {
        console.log('   ❌ PROBLEMA: Categoria com nome numérico suspeito!')
        problematicProducts++
      }
    })
    
    if (problematicProducts > 0) {
      console.log(`\n⚠️  ${problematicProducts} produtos com problemas encontrados!`)
    } else {
      console.log('\n✅ Todos os produtos estão com categorias corretas')
    }
    
    // Verificar se há categorias com nomes numéricos
    console.log('\n🔍 Verificando categorias...')
    const categories = await prisma.category.findMany({
      where: { storeSlug },
      orderBy: { name: 'asc' }
    })
    
    categories.forEach(cat => {
      if (!isNaN(Number(cat.name))) {
        console.log(`❌ CATEGORIA PROBLEMÁTICA: ${cat.name} (ID: ${cat.id})`)
      }
    })
    
  } catch (error) {
    console.error('❌ Erro ao verificar produtos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkProductCategories() 