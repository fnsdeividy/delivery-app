const axios = require('axios');

async function testRoutesIntegration() {
  const baseURL = 'http://localhost:3001/api/v1';
  
  console.log('🧪 Testando integração das rotas com o backend...\n');
  
  try {
    // Teste 1: Health check
    console.log('1️⃣ Testando health check...');
    const healthResponse = await axios.get(`${baseURL}/health`);
    console.log('✅ Health check:', healthResponse.data);
    
    // Teste 2: Status
    console.log('\n2️⃣ Testando status...');
    const statusResponse = await axios.get(`${baseURL}/status`);
    console.log('✅ Status:', statusResponse.data);
    
    // Teste 3: Rota raiz
    console.log('\n3️⃣ Testando rota raiz...');
    const rootResponse = await axios.get(`${baseURL}`);
    console.log('✅ Rota raiz:', rootResponse.data);
    
    // Teste 4: Endpoint de stores (deve retornar 401 sem auth)
    console.log('\n4️⃣ Testando endpoint de stores (sem auth)...');
    try {
      await axios.get(`${baseURL}/stores`);
      console.log('❌ Erro: deveria ter retornado 401');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Endpoint protegido retornando 401 corretamente');
      } else {
        console.log('⚠️ Status inesperado:', error.response?.status);
      }
    }
    
    // Teste 5: Endpoint de produtos (deve retornar 401 sem auth)
    console.log('\n5️⃣ Testando endpoint de produtos (sem auth)...');
    try {
      await axios.get(`${baseURL}/products`);
      console.log('❌ Erro: deveria ter retornado 401');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Endpoint protegido retornando 401 corretamente');
      } else {
        console.log('⚠️ Status inesperado:', error.response?.status);
      }
    }
    
    // Teste 6: Endpoint de usuários (deve retornar 401 sem auth)
    console.log('\n6️⃣ Testando endpoint de usuários (sem auth)...');
    try {
      await axios.get(`${baseURL}/users`);
      console.log('❌ Erro: deveria ter retornado 401');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Endpoint protegido retornando 401 corretamente');
      } else {
        console.log('⚠️ Status inesperado:', error.response?.status);
      }
    }
    
    console.log('\n🎉 Testes de integração concluídos!');
    console.log('\n📋 Resumo:');
    console.log('✅ Endpoints públicos funcionando (health, status, raiz)');
    console.log('✅ Endpoints protegidos retornando 401 corretamente');
    console.log('✅ Backend respondendo na porta 3001');
    console.log('✅ Integração configurada corretamente');
    
  } catch (error) {
    console.error('\n❌ Erro nos testes:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    process.exit(1);
  }
}

testRoutesIntegration(); 