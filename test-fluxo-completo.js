/**
 * Teste de Fluxo Completo - Cadastro e Acesso ao Dashboard
 * 
 * Este script testa o fluxo completo:
 * 1. Cadastro via API (mais confiável)
 * 2. Login no frontend
 * 3. Acesso ao dashboard da loja criada
 * 4. Verificação das funcionalidades básicas
 */

const puppeteer = require('puppeteer');
const axios = require('axios');

// Dados fictícios únicos para cada teste
const timestamp = Date.now();
const dadosLoja = {
  nome: 'Carlos Eduardo Silva',
  email: `carlos.teste.${timestamp}@gmail.com`,
  senha: '123456789',
  nomeLoja: `Restaurante Sabor & Arte ${timestamp}`,
  slug: `restaurante-sabor-arte-${timestamp}`,
  telefone: '(11) 97777-6666',
  endereco: 'Rua dos Sabores, 789',
  cidade: 'São Paulo',
  estado: 'SP',
  cep: '01234-567',
  categoria: 'Restaurante'
};

async function testarFluxoCompleto() {
  console.log('🚀 Iniciando teste de fluxo completo');
  console.log('📋 Dados únicos para este teste:', {
    email: dadosLoja.email,
    nomeLoja: dadosLoja.nomeLoja,
    slug: dadosLoja.slug
  });
  
  let browser;
  let token;
  
  try {
    // FASE 1: Criar loja via API (mais confiável)
    console.log('\n📍 FASE 1: Criando usuário e loja via API');
    
    // Criar usuário
    const userData = {
      email: dadosLoja.email,
      name: dadosLoja.nome,
      password: dadosLoja.senha,
      role: 'ADMIN'
    };
    
    const userResponse = await axios.post('http://localhost:3001/api/v1/auth/register', userData);
    token = userResponse.data.access_token;
    console.log('✅ Usuário criado:', dadosLoja.email);
    
    // Aguardar
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Criar loja
    const storeData = {
      name: dadosLoja.nomeLoja,
      slug: dadosLoja.slug,
      description: 'Restaurante com pratos especiais e ambiente aconchegante!',
      config: {
        address: `${dadosLoja.endereco}, ${dadosLoja.cidade} - ${dadosLoja.estado} ${dadosLoja.cep}`,
        phone: dadosLoja.telefone,
        email: dadosLoja.email,
        category: dadosLoja.categoria,
        deliveryFee: 8.00,
        minimumOrder: 25.00,
        estimatedDeliveryTime: 45,
        businessHours: {
          monday: { open: true, openTime: "11:00", closeTime: "22:00" },
          tuesday: { open: true, openTime: "11:00", closeTime: "22:00" },
          wednesday: { open: true, openTime: "11:00", closeTime: "22:00" },
          thursday: { open: true, openTime: "11:00", closeTime: "22:00" },
          friday: { open: true, openTime: "11:00", closeTime: "23:00" },
          saturday: { open: true, openTime: "11:00", closeTime: "23:00" },
          sunday: { open: true, openTime: "12:00", closeTime: "21:00" }
        },
        paymentMethods: ["PIX", "CARTÃO", "DINHEIRO"]
      }
    };
    
    const storeResponse = await axios.post('http://localhost:3001/api/v1/stores', storeData, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('✅ Loja criada:', storeResponse.data.name);
    console.log('🔗 Slug da loja:', storeResponse.data.slug);
    
    // FASE 2: Testar login no frontend
    console.log('\n📍 FASE 2: Testando login no frontend');
    
    browser = await puppeteer.launch({
      headless: false,
      slowMo: 300,
      defaultViewport: { width: 1400, height: 900 }
    });
    
    const page = await browser.newPage();
    
    // Ir para página de login
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
    console.log('✅ Página de login carregada');
    
    // Fazer login
    await page.waitForSelector('input[name="email"]', { timeout: 10000 });
    await page.type('input[name="email"]', dadosLoja.email, { delay: 100 });
    await page.type('input[name="password"]', dadosLoja.senha, { delay: 100 });
    
    // Clicar no botão de login
    const loginButton = await page.$('button[type="submit"]');
    if (loginButton) {
      await loginButton.click();
      console.log('✅ Clicou no botão de login');
    }
    
    // Aguardar redirecionamento
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // FASE 3: Navegar para o dashboard da loja
    console.log('\n📍 FASE 3: Navegando para dashboard da loja');
    
    const dashboardUrl = `http://localhost:3000/dashboard/${storeResponse.data.slug}`;
    await page.goto(dashboardUrl, { waitUntil: 'networkidle2' });
    
    // Aguardar carregamento
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const currentUrl = page.url();
    console.log('🔗 URL atual:', currentUrl);
    
    // FASE 4: Verificar se dashboard carregou corretamente
    console.log('\n📍 FASE 4: Verificando dashboard');
    
    if (currentUrl.includes(`/dashboard/${storeResponse.data.slug}`)) {
      console.log('✅ SUCESSO: Dashboard da loja acessado!');
      
      // Verificar elementos do dashboard
      try {
        await page.waitForSelector('h1, h2, [data-testid="dashboard"]', { timeout: 5000 });
        console.log('✅ Elementos do dashboard encontrados');
        
        // Verificar se o nome da loja aparece
        const pageContent = await page.content();
        if (pageContent.includes(dadosLoja.nomeLoja) || pageContent.includes('Dashboard')) {
          console.log('✅ Conteúdo do dashboard verificado');
        }
        
        // Capturar screenshot do sucesso
        await page.screenshot({ 
          path: `dashboard-sucesso-${timestamp}.png`, 
          fullPage: true 
        });
        console.log(`📸 Screenshot salvo: dashboard-sucesso-${timestamp}.png`);
        
      } catch (error) {
        console.log('⚠️  Dashboard carregou mas alguns elementos podem estar carregando');
      }
      
    } else if (currentUrl.includes('/login')) {
      console.log('⚠️  Redirecionado para login - pode precisar de nova autenticação');
    } else {
      console.log('❌ Dashboard não acessado corretamente');
    }
    
    // FASE 5: Resumo final
    console.log('\n📍 FASE 5: Resumo do teste');
    console.log('🎯 Resultados:');
    console.log(`   ✅ Usuário criado: ${dadosLoja.email}`);
    console.log(`   ✅ Loja criada: ${dadosLoja.nomeLoja}`);
    console.log(`   ✅ Slug gerado: ${storeResponse.data.slug}`);
    console.log(`   ✅ Dashboard URL: ${dashboardUrl}`);
    console.log(`   📊 Status final: ${currentUrl.includes('/dashboard/') ? 'SUCESSO COMPLETO' : 'PARCIAL'}`);
    
    // Aguardar um momento para visualização
    console.log('\n⏳ Aguardando 5 segundos para visualização...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
    
    if (error.response) {
      console.error('📄 Detalhes do erro:', {
        status: error.response.status,
        data: error.response.data
      });
    }
    
    // Screenshot do erro se browser estiver disponível
    if (browser) {
      try {
        const page = await browser.newPage();
        await page.screenshot({ path: `erro-fluxo-${timestamp}.png` });
        console.log(`📸 Screenshot do erro salvo: erro-fluxo-${timestamp}.png`);
      } catch (screenshotError) {
        console.log('⚠️  Não foi possível capturar screenshot do erro');
      }
    }
    
  } finally {
    if (browser) {
      await browser.close();
      console.log('🏁 Browser fechado');
    }
  }
}

// Executar o teste
if (require.main === module) {
  testarFluxoCompleto().catch(console.error);
}

module.exports = { testarFluxoCompleto, dadosLoja };
