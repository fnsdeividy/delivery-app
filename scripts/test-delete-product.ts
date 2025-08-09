import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testDeleteProduct() {
  try {
    const storeSlug = 'restaurante-teste'
    
    // Criar um produto temporário para teste de exclusão
    console.log('🔄 Criando produto temporário para teste...')
    
    const timestamp = Date.now()
    const testProduct = await prisma.product.create({
      data: {
        name: `Produto Teste para Exclusão ${timestamp}`,
        description: 'Este produto será excluído em breve',
        price: 9.99,
        categoryId: 'cme2y1ng70003vdjbi10fcnwc', // ID da categoria Bebidas
        storeSlug: storeSlug,
        active: true,
        tags: ['teste'],
        tagColor: '#ff0000',
        image: 'https://via.placeholder.com/400x300?text=Teste'
      },
      include: { category: true }
    })
    
    console.log('✅ Produto temporário criado:')
    console.log(`  - ID: ${testProduct.id}`)
    console.log(`  - Nome: ${testProduct.name}`)
    console.log(`  - Categoria: ${testProduct.category?.name}`)
    
    // Criar estoque para o produto
    await prisma.inventory.create({
      data: {
        productId: testProduct.id,
        quantity: 10,
        minStock: 2,
        storeSlug: storeSlug
      }
    })
    
    console.log('✅ Estoque criado para o produto')
    
    // Aguardar um pouco antes de excluir
    console.log('\n⏳ Aguardando 2 segundos antes de excluir...')
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Testar exclusão via API
    console.log('🗑️  Testando exclusão via API...')
    
    const response = await fetch(`http://localhost:3000/api/stores/${storeSlug}/products/${testProduct.id}`, {
      method: 'DELETE'
    })
    
    if (response.ok) {
      const result = await response.json()
      console.log('✅ Produto excluído com sucesso!')
      console.log('📝 Resultado:', result.message)
    } else {
      const error = await response.json()
      console.log('❌ Erro ao excluir produto:', error)
    }
    
    // Verificar se o produto foi realmente excluído
    console.log('\n🔍 Verificando se o produto foi excluído...')
    const deletedProduct = await prisma.product.findUnique({
      where: { id: testProduct.id }
    })
    
    if (!deletedProduct) {
      console.log('✅ Produto foi excluído com sucesso do banco de dados')
    } else {
      console.log('❌ Produto ainda existe no banco de dados')
    }
    
    // Verificar se o estoque também foi excluído
    const deletedInventory = await prisma.inventory.findUnique({
      where: { productId: testProduct.id }
    })
    
    if (!deletedInventory) {
      console.log('✅ Estoque também foi excluído com sucesso')
    } else {
      console.log('❌ Estoque ainda existe no banco de dados')
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testDeleteProduct() 