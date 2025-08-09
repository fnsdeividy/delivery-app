import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testEditProduct() {
  try {
    const storeSlug = 'restaurante-teste'
    
    // Buscar um produto para testar
    const product = await prisma.product.findFirst({
      where: { storeSlug, active: true },
      include: { category: true, inventory: true }
    })
    
    if (!product) {
      console.log('❌ Nenhum produto encontrado para teste')
      return
    }
    
    console.log('✅ Produto encontrado para teste:')
    console.log(`  - ID: ${product.id}`)
    console.log(`  - Nome: ${product.name}`)
    console.log(`  - Preço: R$ ${product.price}`)
    console.log(`  - Categoria: ${product.category?.name}`)
    console.log(`  - Estoque: ${product.inventory?.quantity || 0}`)
    
    // Testar atualização via API
    console.log('\n🔄 Testando atualização via API...')
    
    const updateData = {
      name: `${product.name} (Editado)`,
      description: `${product.description} - Editado em ${new Date().toLocaleString()}`,
      price: Number(product.price) + 1,
      categoryId: product.categoryId,
      image: product.image,
      active: product.active,
      stock: (product.inventory?.quantity || 0) + 5,
      minStock: (product.inventory?.minStock || 0) + 1
    }
    
    const response = await fetch(`http://localhost:3000/api/stores/${storeSlug}/products/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    })
    
    if (response.ok) {
      const result = await response.json()
      console.log('✅ Produto atualizado com sucesso!')
      console.log('📝 Dados atualizados:', result.product)
    } else {
      const error = await response.json()
      console.log('❌ Erro ao atualizar produto:', error)
    }
    
    // Verificar se a atualização foi aplicada
    console.log('\n🔍 Verificando atualização no banco...')
    const updatedProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: { category: true, inventory: true }
    })
    
    if (updatedProduct) {
      console.log('✅ Produto atualizado no banco:')
      console.log(`  - Nome: ${updatedProduct.name}`)
      console.log(`  - Preço: R$ ${updatedProduct.price}`)
      console.log(`  - Estoque: ${updatedProduct.inventory?.quantity || 0}`)
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testEditProduct() 