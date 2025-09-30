/**
 * Script para testar a integração de temas de loja
 * Executa testes automatizados para verificar se os temas estão sendo aplicados corretamente
 */

const puppeteer = require('puppeteer');

async function testThemeIntegration() {
  console.log('🎨 Iniciando testes de integração de temas...');
  
  const browser = await puppeteer.launch({ 
    headless: false, // Mostrar o navegador para debug
    slowMo: 0 
  });
  
  try {
    const page = await browser.newPage();
    
    // Configurar viewport
    await page.setViewport({ width: 1280, height: 720 });
    
    // Navegar para a página de teste
    console.log('📱 Navegando para a página de teste...');
    await page.goto('http://localhost:3000/teste-tema', { 
      waitUntil: 'networkidle2' 
    });
    
    // Aguardar o carregamento dos componentes
    await page.waitForSelector('[data-testid="theme-demo"]', { timeout: 10000 });
    
    console.log('✅ Página carregada com sucesso');
    
    // Testar cada tema de loja
    const themes = [
      { name: 'Loja Azul', selector: '[data-theme="loja-azul"]' },
      { name: 'Loja Verde', selector: '[data-theme="loja-verde"]' },
      { name: 'Loja Roxo', selector: '[data-theme="loja-roxo"]' },
      { name: 'Loja Escura', selector: '[data-theme="loja-escura"]' }
    ];
    
    for (const theme of themes) {
      console.log(`\n🎯 Testando tema: ${theme.name}`);
      
      // Clicar no botão de teste do tema
      const button = await page.$(theme.selector);
      if (button) {
        await button.click();
        
        // Aguardar o modal abrir
        await page.waitForSelector('.store-themed-modal', { timeout: 5000 });
        
        // Verificar se o modal tem as classes de tema aplicadas
        const modal = await page.$('.store-themed-modal');
        const hasThemeClass = await modal.evaluate(el => 
          el.classList.contains('store-themed-modal')
        );
        
        if (hasThemeClass) {
          console.log(`✅ ${theme.name}: Modal com tema aplicado`);
        } else {
          console.log(`❌ ${theme.name}: Modal sem tema aplicado`);
        }
        
        // Fechar o modal
        const closeButton = await page.$('.button-outline');
        if (closeButton) {
          await closeButton.click();
        }
        
        // Aguardar o modal fechar
        await page.waitForFunction(() => 
          !document.querySelector('.store-themed-modal')
        );
        
      } else {
        console.log(`⚠️  ${theme.name}: Botão não encontrado`);
      }
    }
    
    // Testar se os estilos CSS foram injetados
    console.log('\n🔍 Verificando injeção de estilos CSS...');
    const styles = await page.evaluate(() => {
      const styleElement = document.getElementById('store-theme-styles');
      return styleElement ? styleElement.textContent : null;
    });
    
    if (styles && styles.includes('--store-primary')) {
      console.log('✅ Estilos CSS injetados corretamente');
    } else {
      console.log('❌ Estilos CSS não foram injetados');
    }
    
    // Testar responsividade
    console.log('\n📱 Testando responsividade...');
    await page.setViewport({ width: 375, height: 667 }); // iPhone SE
    await page.waitForTimeout(1000);
    
    const modal = await page.$('.store-themed-modal');
    if (modal) {
      const isVisible = await modal.isIntersectingViewport();
      console.log(isVisible ? '✅ Modal visível em mobile' : '❌ Modal não visível em mobile');
    }
    
    console.log('\n🎉 Testes de integração concluídos!');
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
  } finally {
    await browser.close();
  }
}

// Executar os testes
if (require.main === module) {
  testThemeIntegration().catch(console.error);
}

module.exports = { testThemeIntegration };