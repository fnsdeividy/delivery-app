/**
 * Teste rápido para verificar se o ambiente está funcionando
 * Execute: node tests/e2e/quick-test.js
 */

const puppeteer = require('puppeteer');

async function quickTest() {
  console.log('🚀 Iniciando teste rápido...');

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false,
      slowMo: 0,
      defaultViewport: { width: 1366, height: 768 },
    });

    const page = await browser.newPage();

    // Testar acesso à primeira loja
    const testUrl = 'http://localhost:3000/pizzaria-do-mario';
    console.log(`📍 Acessando: ${testUrl}`);

    await page.goto(testUrl, { waitUntil: 'networkidle2' });

    const title = await page.title();
    console.log(`📄 Título da página: ${title}`);

    // Tirar screenshot
    await page.screenshot({
      path: 'tests/e2e/screenshots/quick-test.png',
      fullPage: true
    });
    console.log('📸 Screenshot salva: quick-test.png');

    // Verificar elementos básicos
    const storeNameExists = await page.$('h1') !== null;
    const productsExist = await page.$$eval('[data-testid*="product"], .product', els => els.length > 0).catch(() => false);

    console.log(`${storeNameExists ? '✅' : '❌'} Nome da loja encontrado`);
    console.log(`${productsExist ? '✅' : '❌'} Produtos encontrados`);

    if (storeNameExists && productsExist) {
      console.log('🎉 Teste rápido passou! Ambiente está funcionando.');
    } else {
      console.log('⚠️ Alguns elementos não foram encontrados, mas a página carregou.');
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

quickTest();
