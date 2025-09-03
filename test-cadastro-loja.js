/**
 * Teste de Fluxo - Cadastro de Nova Loja
 * 
 * Este script testa o fluxo completo:
 * 1. Acesso à página inicial
 * 2. Navegação para cadastro de loja
 * 3. Preenchimento com dados fictícios
 * 4. Submissão do formulário
 * 5. Verificação do redirecionamento para dashboard
 */

const puppeteer = require('puppeteer');

// Dados fictícios para o teste
const dadosLoja = {
  // Dados do usuário
  nome: 'João Silva Santos',
  email: 'joao.teste.loja@gmail.com',
  senha: '123456789',
  confirmarSenha: '123456789',
  
  // Dados da loja
  nomeLoja: 'Pizzaria Bella Vista',
  telefone: '(11) 99999-8888',
  endereco: 'Rua das Flores, 123',
  cidade: 'São Paulo',
  estado: 'SP',
  cep: '01234-567',
  
  // Dados adicionais
  cnpj: '12.345.678/0001-90',
  categoria: 'Pizzaria'
};

async function testarFluxoCadastroLoja() {
  console.log('🚀 Iniciando teste de fluxo - Cadastro de Loja');
  console.log('📋 Dados fictícios:', dadosLoja);
  
  const browser = await puppeteer.launch({
    headless: false, // Mostrar o browser para visualizar o teste
    slowMo: 500,     // Delay entre ações para melhor visualização
    defaultViewport: { width: 1200, height: 800 }
  });
  
  const page = await browser.newPage();
  
  try {
    // PASSO 1: Acessar página inicial
    console.log('\n📍 PASSO 1: Acessando página inicial (localhost:3000)');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // PASSO 2: Navegar para cadastro de loja
    console.log('\n📍 PASSO 2: Navegando para cadastro de loja');
    
    // Procurar botão "Cadastrar" ou link para registro
    const cadastrarButton = await page.$('a[href*="register"]');
    if (cadastrarButton) {
      await cadastrarButton.click();
      console.log('✅ Clicou no botão Cadastrar');
    } else {
      // Tentar navegar diretamente
      await page.goto('http://localhost:3000/register', { waitUntil: 'networkidle2' });
      console.log('✅ Navegou diretamente para /register');
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Verificar se existe opção para cadastro de loja
    const lojaOption = await page.$('a[href*="loja"]');
    if (lojaOption) {
      await lojaOption.click();
      console.log('✅ Selecionou opção de cadastro de loja');
      await new Promise(resolve => setTimeout(resolve, 2000));
    } else {
      // Navegar diretamente para cadastro de loja
      await page.goto('http://localhost:3000/register/loja', { waitUntil: 'networkidle2' });
      console.log('✅ Navegou diretamente para /register/loja');
    }
    
    // PASSO 3: Preencher formulário
    console.log('\n📍 PASSO 3: Preenchendo formulário com dados fictícios');
    
    // Aguardar formulário carregar
    await page.waitForSelector('form', { timeout: 10000 });
    
    // STEP 1: Preencher dados do proprietário
    await preencherCampo(page, 'input[name="ownerName"]', dadosLoja.nome, 'Nome do Proprietário');
    await preencherCampo(page, 'input[name="ownerEmail"]', dadosLoja.email, 'Email do Proprietário');
    await preencherCampo(page, 'input[name="ownerPhone"]', dadosLoja.telefone, 'Telefone do Proprietário');
    await preencherCampo(page, 'input[name="password"]', dadosLoja.senha, 'Senha');
    await preencherCampo(page, 'input[name="confirmPassword"]', dadosLoja.confirmarSenha, 'Confirmar Senha');
    
    // Clicar em "Próximo" para ir para step 2
    console.log('📍 Avançando para Step 2 - Dados da Loja');
    await clicarBotao(page, 'Próximo', 'Próximo Step 2');
    
    // STEP 2: Preencher dados da loja
    await preencherCampo(page, 'input[name="storeName"]', dadosLoja.nomeLoja, 'Nome da Loja');
    await preencherCampoOpcional(page, 'textarea[name="description"]', 'Melhor pizzaria da região com ingredientes frescos e entrega rápida!', 'Descrição');
    await selecionarCategoria(page, dadosLoja.categoria);
    await preencherCampo(page, 'input[name="zipCode"]', dadosLoja.cep, 'CEP');
    await new Promise(resolve => setTimeout(resolve, 3000)); // Aguardar preenchimento automático do endereço
    await preencherCampo(page, 'input[name="address"]', dadosLoja.endereco, 'Endereço');
    await preencherCampo(page, 'input[name="city"]', dadosLoja.cidade, 'Cidade');
    await preencherCampo(page, 'input[name="state"]', dadosLoja.estado, 'Estado');
    
    // Clicar em "Próximo" para ir para step 3
    console.log('📍 Avançando para Step 3 - Confirmação');
    await clicarBotao(page, 'Próximo', 'Próximo Step 3');
    
    // Campos opcionais se existirem
    await preencherCampoOpcional(page, 'input[name="cnpj"]', dadosLoja.cnpj, 'CNPJ');
    
    console.log('✅ Formulário preenchido com sucesso');
    
    // PASSO 4: Submeter formulário
    console.log('\n📍 PASSO 4: Submetendo formulário');
    
    // No step 3, procurar pelo botão "Criar Loja" ou similar
    await clicarBotao(page, 'Criar', 'Criar Loja');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Aguardar redirecionamento ou resposta
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // PASSO 5: Verificar redirecionamento
    console.log('\n📍 PASSO 5: Verificando redirecionamento para dashboard');
    
    const currentUrl = page.url();
    console.log('🔗 URL atual:', currentUrl);
    
    if (currentUrl.includes('/dashboard/') && currentUrl.includes('/')) {
      console.log('✅ SUCESSO: Redirecionado para dashboard da loja!');
      
      // Extrair slug da loja da URL
      const urlParts = currentUrl.split('/dashboard/');
      if (urlParts.length > 1) {
        const storeSlug = urlParts[1].split('/')[0];
        console.log('🏪 Slug da loja criada:', storeSlug);
      }
      
      // Verificar se página do dashboard carregou
      await page.waitForSelector('h1, h2, [data-testid="dashboard"]', { timeout: 10000 });
      console.log('✅ Dashboard carregado com sucesso');
      
    } else if (currentUrl.includes('/login')) {
      console.log('⚠️  Redirecionado para login - pode ser necessário autenticação');
    } else {
      console.log('❌ Redirecionamento inesperado ou erro no cadastro');
    }
    
    // Screenshot final
    await page.screenshot({ path: 'teste-cadastro-resultado.png', fullPage: true });
    console.log('📸 Screenshot salvo como teste-cadastro-resultado.png');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
    await page.screenshot({ path: 'teste-cadastro-erro.png', fullPage: true });
    console.log('📸 Screenshot do erro salvo como teste-cadastro-erro.png');
  } finally {
    console.log('\n🏁 Teste finalizado');
    await browser.close();
  }
}

// Função auxiliar para preencher campos
async function preencherCampo(page, selector, valor, nomeCampo) {
  try {
    await page.waitForSelector(selector, { timeout: 5000 });
    await page.click(selector);
    await page.evaluate((sel) => document.querySelector(sel).value = '', selector);
    await page.type(selector, valor, { delay: 100 });
    console.log(`✅ ${nomeCampo}: ${valor}`);
  } catch (error) {
    console.log(`⚠️  Campo ${nomeCampo} (${selector}) não encontrado`);
  }
}

// Função auxiliar para campos opcionais
async function preencherCampoOpcional(page, selector, valor, nomeCampo) {
  try {
    const elemento = await page.$(selector);
    if (elemento) {
      await page.click(selector);
      await page.evaluate((sel) => document.querySelector(sel).value = '', selector);
      await page.type(selector, valor, { delay: 100 });
      console.log(`✅ ${nomeCampo}: ${valor}`);
    }
  } catch (error) {
    console.log(`⚠️  Campo opcional ${nomeCampo} não encontrado`);
  }
}

// Função auxiliar para selecionar categoria
async function selecionarCategoria(page, categoria) {
  try {
    await page.waitForSelector('select[name="category"]', { timeout: 5000 });
    await page.select('select[name="category"]', categoria);
    console.log(`✅ Categoria selecionada: ${categoria}`);
  } catch (error) {
    console.log(`⚠️  Não foi possível selecionar categoria: ${categoria}`);
  }
}

// Função auxiliar para clicar em botões
async function clicarBotao(page, texto, nomeBotao) {
  try {
    // Tentar diferentes seletores para encontrar o botão
    const seletores = [
      `button:contains("${texto}")`,
      `button[type="button"]`,
      `button[type="submit"]`,
      `input[type="submit"]`,
      `[role="button"]`
    ];
    
    let botaoEncontrado = false;
    for (const seletor of seletores) {
      try {
        const botao = await page.$(seletor);
        if (botao) {
          const textoVisivel = await page.evaluate(el => el.textContent, botao);
          if (textoVisivel && textoVisivel.toLowerCase().includes(texto.toLowerCase())) {
            await botao.click();
            console.log(`✅ Clicou no botão: ${nomeBotao}`);
            botaoEncontrado = true;
            break;
          }
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!botaoEncontrado) {
      // Tentar clicar em qualquer botão visível
      const botoes = await page.$$('button:not([disabled])');
      if (botoes.length > 0) {
        await botoes[botoes.length - 1].click(); // Clicar no último botão (geralmente é o de ação)
        console.log(`✅ Clicou no botão disponível: ${nomeBotao}`);
      } else {
        console.log(`⚠️  Botão ${nomeBotao} não encontrado`);
      }
    }
  } catch (error) {
    console.log(`⚠️  Erro ao clicar no botão ${nomeBotao}:`, error.message);
  }
}

// Executar o teste
if (require.main === module) {
  testarFluxoCadastroLoja().catch(console.error);
}

module.exports = { testarFluxoCadastroLoja, dadosLoja };
