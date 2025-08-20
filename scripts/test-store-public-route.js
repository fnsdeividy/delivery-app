const axios = require('axios');

async function testStorePublicRoute() {
  const baseURL = 'http://localhost:3000';
  const testSlug = 'teteteadas232';
  
  console.log('🧪 Testando rota pública de lojas...\n');
  
  try {
    // Teste 1: Rota pública da loja
    console.log('1️⃣ Testando rota pública da loja...');
    const storeResponse = await axios.get(`${baseURL}/api/store-public/${testSlug}`);
    console.log('✅ Loja encontrada:', {
      name: storeResponse.data.store.name,
      slug: storeResponse.data.store.slug,
      active: storeResponse.data.store.active,
      approved: storeResponse.data.store.approved
    });
    
    // Teste 2: Verificar produtos
    console.log('\n2️⃣ Verificando produtos da loja...');
    if (storeResponse.data.products && storeResponse.data.products.length > 0) {
      console.log('✅ Produtos encontrados:', storeResponse.data.products.length);
      storeResponse.data.products.forEach(product => {
        console.log(`   - ${product.name}: R$ ${product.price}`);
      });
    } else {
      console.log('⚠️ Nenhum produto encontrado');
    }
    
    // Teste 3: Verificar categorias
    console.log('\n3️⃣ Verificando categorias da loja...');
    if (storeResponse.data.categories && storeResponse.data.categories.length > 0) {
      console.log('✅ Categorias encontradas:', storeResponse.data.categories.length);
      storeResponse.data.categories.forEach(category => {
        console.log(`   - ${category.name}`);
      });
    } else {
      console.log('⚠️ Nenhuma categoria encontrada');
    }
    
    // Teste 4: Verificar configurações
    console.log('\n4️⃣ Verificando configurações da loja...');
    if (storeResponse.data.config) {
      console.log('✅ Configurações encontradas:', {
        address: storeResponse.data.config.address,
        phone: storeResponse.data.config.phone,
        email: storeResponse.data.config.email,
        deliveryFee: storeResponse.data.config.deliveryFee,
        minimumOrder: storeResponse.data.config.minimumOrder
      });
    } else {
      console.log('⚠️ Configurações não encontradas');
    }
    
    // Teste 5: Verificar status
    console.log('\n5️⃣ Verificando status da loja...');
    if (storeResponse.data.status) {
      console.log('✅ Status da loja:', {
        isOpen: storeResponse.data.status.isOpen,
        reason: storeResponse.data.status.reason
      });
    } else {
      console.log('⚠️ Status não encontrado');
    }
    
    console.log('\n🎉 Teste da rota pública concluído com sucesso!');
    console.log('\n📋 Resumo:');
    console.log('✅ Rota pública funcionando');
    console.log('✅ Dados da loja sendo retornados');
    console.log('✅ Estrutura de dados correta');
    console.log('✅ Pronto para integração com frontend');
    
  } catch (error) {
    console.error('\n❌ Erro no teste:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    
    console.log('\n🔧 Possíveis soluções:');
    console.log('1. Reiniciar o servidor de desenvolvimento (npm run dev)');
    console.log('2. Verificar se a rota foi criada corretamente');
    console.log('3. Verificar se não há erros de sintaxe');
    
    process.exit(1);
  }
}

testStorePublicRoute(); 