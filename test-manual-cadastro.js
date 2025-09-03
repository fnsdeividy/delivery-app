/**
 * Teste Manual - Cadastro de Loja via API
 * 
 * Este script testa diretamente as APIs de cadastro:
 * 1. Criar usuário via API
 * 2. Criar loja via API
 * 3. Verificar se o redirecionamento funcionaria
 */

const axios = require('axios');

// Dados fictícios para o teste
const dadosLoja = {
  // Dados do usuário
  nome: 'Maria Silva Oliveira',
  email: 'maria.teste.loja2@gmail.com',
  senha: '123456789',
  
  // Dados da loja
  nomeLoja: 'Hamburgueria Top Burger',
  slug: 'hamburgueria-top-burger',
  telefone: '(11) 98888-7777',
  endereco: 'Rua das Palmeiras, 456',
  cidade: 'São Paulo',
  estado: 'SP',
  cep: '01234-567',
  categoria: 'Hamburgueria'
};

async function testarCadastroViaAPI() {
  console.log('🚀 Iniciando teste manual via API');
  console.log('📋 Dados fictícios:', dadosLoja);
  
  try {
    // PASSO 1: Criar usuário
    console.log('\n📍 PASSO 1: Criando usuário via API');
    
    const userData = {
      email: dadosLoja.email,
      name: dadosLoja.nome,
      password: dadosLoja.senha,
      role: 'ADMIN'
    };
    
    const userResponse = await axios.post('http://localhost:3001/api/v1/auth/register', userData);
    console.log('✅ Usuário criado com sucesso');
    console.log('📄 Resposta:', {
      id: userResponse.data.user?.id,
      email: userResponse.data.user?.email,
      token: userResponse.data.access_token ? 'Token recebido' : 'Sem token'
    });
    
    const token = userResponse.data.access_token;
    if (!token) {
      throw new Error('❌ Token de autenticação não recebido');
    }
    
    // PASSO 2: Aguardar um momento
    console.log('\n⏳ Aguardando 2 segundos...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // PASSO 3: Criar loja
    console.log('\n📍 PASSO 2: Criando loja via API');
    
    const storeData = {
      name: dadosLoja.nomeLoja,
      slug: dadosLoja.slug,
      description: 'Melhor hamburgueria da região com ingredientes frescos e entrega rápida!',
      config: {
        address: `${dadosLoja.endereco}, ${dadosLoja.cidade} - ${dadosLoja.estado} ${dadosLoja.cep}`,
        phone: dadosLoja.telefone,
        email: dadosLoja.email,
        logo: '',
        banner: '',
        category: dadosLoja.categoria,
        deliveryFee: 5.00,
        minimumOrder: 20.00,
        estimatedDeliveryTime: 30,
        businessHours: {
          monday: { open: true, openTime: "08:00", closeTime: "18:00" },
          tuesday: { open: true, openTime: "08:00", closeTime: "18:00" },
          wednesday: { open: true, openTime: "08:00", closeTime: "18:00" },
          thursday: { open: true, openTime: "08:00", closeTime: "18:00" },
          friday: { open: true, openTime: "08:00", closeTime: "18:00" },
          saturday: { open: true, openTime: "08:00", closeTime: "18:00" },
          sunday: { open: false }
        },
        paymentMethods: ["PIX", "CARTÃO", "DINHEIRO"]
      }
    };
    
    const storeResponse = await axios.post('http://localhost:3001/api/v1/stores', storeData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Loja criada com sucesso');
    console.log('📄 Resposta:', {
      id: storeResponse.data.id,
      name: storeResponse.data.name,
      slug: storeResponse.data.slug
    });
    
    // PASSO 4: Verificar URL do dashboard
    const dashboardUrl = `http://localhost:3000/dashboard/${storeResponse.data.slug}`;
    console.log('\n📍 PASSO 3: URL do dashboard gerada');
    console.log('🔗 Dashboard URL:', dashboardUrl);
    
    // PASSO 5: Testar acesso ao dashboard
    console.log('\n📍 PASSO 4: Testando acesso ao dashboard');
    try {
      const dashboardResponse = await axios.get(dashboardUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        timeout: 5000
      });
      console.log('✅ Dashboard acessível (status:', dashboardResponse.status, ')');
    } catch (dashboardError) {
      console.log('⚠️  Dashboard pode requerer autenticação via browser');
      console.log('📝 Erro:', dashboardError.message);
    }
    
    console.log('\n🎉 SUCESSO: Fluxo de cadastro via API funcionou!');
    console.log('📋 Resumo:');
    console.log(`   👤 Usuário: ${dadosLoja.nome} (${dadosLoja.email})`);
    console.log(`   🏪 Loja: ${dadosLoja.nomeLoja} (${storeResponse.data.slug})`);
    console.log(`   🔗 Dashboard: ${dashboardUrl}`);
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
    
    if (error.response) {
      console.error('📄 Resposta do servidor:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    }
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error('🔌 Backend não está rodando na porta 3001');
    }
  }
}

// Executar o teste
if (require.main === module) {
  testarCadastroViaAPI().catch(console.error);
}

module.exports = { testarCadastroViaAPI, dadosLoja };
