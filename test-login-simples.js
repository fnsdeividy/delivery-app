/**
 * Teste Simples - Login e Verificação de Token
 * 
 * Este script testa:
 * 1. Login via browser
 * 2. Verificação se token foi armazenado
 * 3. Acesso ao dashboard
 */

const puppeteer = require('puppeteer');

async function testarLoginSimples() {
  console.log('🚀 Iniciando teste simples de login');
  
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 500,
    defaultViewport: { width: 1400, height: 900 }
  });
  
  const page = await browser.newPage();
  
  try {
    // PASSO 1: Ir para página de login
    console.log('\n📍 PASSO 1: Acessando página de login');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
    
    // PASSO 2: Fazer login com usuário existente
    console.log('\n📍 PASSO 2: Fazendo login');
    
    // Usar dados do usuário criado anteriormente
    const email = 'maria.teste.loja2@gmail.com';
    const senha = '123456789';
    
    await page.waitForSelector('input[name="email"]', { timeout: 10000 });
    await page.type('input[name="email"]', email, { delay: 100 });
    await page.type('input[name="password"]', senha, { delay: 100 });
    
    console.log(`✅ Preencheu credenciais: ${email}`);
    
    // Clicar no botão de login
    const loginButton = await page.$('button[type="submit"]');
    if (loginButton) {
      await loginButton.click();
      console.log('✅ Clicou no botão de login');
    }
    
    // Aguardar redirecionamento
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // PASSO 3: Verificar se token foi armazenado
    console.log('\n📍 PASSO 3: Verificando token');
    
    const token = await page.evaluate(() => {
      return localStorage.getItem('cardapio_token');
    });
    
    const cookies = await page.cookies();
    const tokenCookie = cookies.find(c => c.name === 'cardapio_token');
    
    console.log('📄 Token localStorage:', token ? 'Presente' : 'Ausente');
    console.log('📄 Token cookie:', tokenCookie ? 'Presente' : 'Ausente');
    
    if (token) {
      // Decodificar payload do token para verificar
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('📄 Payload do token:', {
          email: payload.email,
          role: payload.role,
          exp: new Date(payload.exp * 1000).toLocaleString()
        });
      } catch (e) {
        console.log('⚠️  Erro ao decodificar token');
      }
    }
    
    // PASSO 4: Tentar acessar dashboard
    console.log('\n📍 PASSO 4: Tentando acessar dashboard');
    
    const currentUrl = page.url();
    console.log('🔗 URL atual após login:', currentUrl);
    
    // Tentar navegar para dashboard da loja criada
    const dashboardUrl = 'http://localhost:3000/dashboard/hamburgueria-top-burger';
    console.log('🔗 Navegando para:', dashboardUrl);
    
    await page.goto(dashboardUrl, { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const finalUrl = page.url();
    console.log('🔗 URL final:', finalUrl);
    
    // PASSO 5: Verificar resultado
    console.log('\n📍 PASSO 5: Resultado do teste');
    
    if (finalUrl.includes('/dashboard/hamburgueria-top-burger')) {
      console.log('✅ SUCESSO: Dashboard acessado com sucesso!');
      
      // Capturar screenshot
      await page.screenshot({ 
        path: 'dashboard-sucesso-manual.png', 
        fullPage: true 
      });
      console.log('📸 Screenshot salvo: dashboard-sucesso-manual.png');
      
    } else if (finalUrl.includes('/unauthorized')) {
      console.log('❌ ERRO: Acesso negado (unauthorized)');
      console.log('🔍 Possíveis causas:');
      console.log('   - Token não está sendo enviado corretamente');
      console.log('   - Middleware não está reconhecendo o token');
      console.log('   - Usuário não tem permissão para esta loja');
      
    } else if (finalUrl.includes('/login')) {
      console.log('❌ ERRO: Redirecionado para login');
      console.log('🔍 Token pode ter expirado ou não foi armazenado');
      
    } else {
      console.log('⚠️  Resultado inesperado');
    }
    
    // Aguardar para visualização
    console.log('\n⏳ Aguardando 10 segundos para visualização...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
    
    await page.screenshot({ path: 'erro-login-simples.png' });
    console.log('📸 Screenshot do erro salvo: erro-login-simples.png');
    
  } finally {
    await browser.close();
    console.log('🏁 Teste finalizado');
  }
}

// Executar o teste
if (require.main === module) {
  testarLoginSimples().catch(console.error);
}

module.exports = { testarLoginSimples };
