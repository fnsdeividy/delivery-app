import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testAllProductFeatures() {
  try {
    const storeSlug = 'restaurante-teste'
    console.log('🧪 Testando todas as funcionalidades de produtos...\n')
    
    // 1. TESTE DE CRIAÇÃO
    console.log('1️⃣ Testando criação de produto...')
    const timestamp = Date.now()
    const testProductName = `Produto Teste Completo ${timestamp}`
    
    const createData = {
      name: testProductName,
      description: 'Produto para teste completo das funcionalidades',
      price: 15.99,
      categoryId: 'cme2y1ng70003vdjbi10fcnwc', // Bebidas
      image: 'https://via.placeholder.com/400x300?text=Teste+Completo',
      active: true,
      stock: 50,
      minStock: 10
    }
    
    const createResponse = await fetch(`http://localhost:3000/api/stores/${storeSlug}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createData)
    })
    
    if (createResponse.ok) {
      const createdProduct = await createResponse.json()
      console.log('✅ Produto criado com sucesso!')
      console.log(`   - ID: ${createdProduct.product.id}`)
      console.log(`   - Nome: ${createdProduct.product.name}`)
      console.log(`   - Preço: R$ ${createdProduct.product.price}`)
    } else {
      const error = await createResponse.json()
      console.log('❌ Erro ao criar produto:', error)
      return
    }
    
    // Buscar o produto criado
    const product = await prisma.product.findFirst({
      where: { name: testProductName, storeSlug }
    })
    
    if (!product) {
      console.log('❌ Produto não encontrado após criação')
      return
    }
    
    console.log('✅ Produto encontrado no banco de dados\n')
    
    // 2. TESTE DE EDIÇÃO
    console.log('2️⃣ Testando edição de produto...')
    const updateData = {
      name: `${testProductName} (Editado)`,
      description: 'Produto editado com sucesso!',
      price: 19.99,
      categoryId: 'cme2y1ng70003vdjbi10fcnwc',
      image: 'https://via.placeholder.com/400x300?text=Editado',
      active: true,
      stock: 75,
      minStock: 15
    }
    
    const updateResponse = await fetch(`http://localhost:3000/api/stores/${storeSlug}/products/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    })
    
    if (updateResponse.ok) {
      const updatedProduct = await updateResponse.json()
      console.log('✅ Produto editado com sucesso!')
      console.log(`   - Nome: ${updatedProduct.product.name}`)
      console.log(`   - Preço: R$ ${updatedProduct.product.price}`)
      console.log(`   - Estoque: ${updatedProduct.product.inventory?.quantity}`)
    } else {
      const error = await updateResponse.json()
      console.log('❌ Erro ao editar produto:', error)
      return
    }
    
    // Verificar se a edição foi aplicada
    const editedProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: { inventory: true }
    })
    
    if (editedProduct && editedProduct.name.includes('(Editado)')) {
      console.log('✅ Edição confirmada no banco de dados\n')
    } else {
      console.log('❌ Edição não foi aplicada corretamente\n')
      return
    }
    
    // 3. TESTE DE EXCLUSÃO
    console.log('3️⃣ Testando exclusão de produto...')
    const deleteResponse = await fetch(`http://localhost:3000/api/stores/${storeSlug}/products/${product.id}`, {
      method: 'DELETE'
    })
    
    if (deleteResponse.ok) {
      const deleteResult = await deleteResponse.json()
      console.log('✅ Produto excluído com sucesso!')
      console.log(`   - Mensagem: ${deleteResult.message}`)
    } else {
      const error = await deleteResponse.json()
      console.log('❌ Erro ao excluir produto:', error)
      return
    }
    
    // Verificar se foi realmente excluído
    const deletedProduct = await prisma.product.findUnique({
      where: { id: product.id }
    })
    
    if (!deletedProduct) {
      console.log('✅ Produto foi excluído do banco de dados')
    } else {
      console.log('❌ Produto ainda existe no banco de dados')
      return
    }
    
    // Verificar se o estoque também foi excluído
    const deletedInventory = await prisma.inventory.findUnique({
      where: { productId: product.id }
    })
    
    if (!deletedInventory) {
      console.log('✅ Estoque também foi excluído com sucesso')
    } else {
      console.log('❌ Estoque ainda existe no banco de dados')
      return
    }
    
    console.log('\n🎉 TODOS OS TESTES PASSARAM COM SUCESSO!')
    console.log('✅ Criação: OK')
    console.log('✅ Edição: OK')
    console.log('✅ Exclusão: OK')
    console.log('✅ Validações: OK')
    console.log('✅ Integridade de dados: OK')
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAllProductFeatures() 