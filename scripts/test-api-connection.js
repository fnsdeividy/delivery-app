const axios = require('axios');

async function testApiConnection() {
  const baseURL = 'http://localhost:3001/api/v1';
  
  console.log('🧪 Testando conectividade com a API backend...\n');
  
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
    
    // Teste 4: Teste de stores
    console.log('\n4️⃣ Testando endpoint de stores...');
    const storesResponse = await axios.get(`${baseURL}/stores`);
    console.log('✅ Stores:', storesResponse.data);
    
    console.log('\n🎉 Todos os testes passaram! API está funcionando perfeitamente.');
    
  } catch (error) {
    console.error('\n❌ Erro nos testes:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    process.exit(1);
  }
}

testApiConnection(); 