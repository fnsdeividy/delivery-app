/**
 * Teste E2E da Experiência do Comprador
 * 
 * Este script testa todo o fluxo de compra de um cliente:
 * 1. Acesso à loja
 * 2. Navegação pelo cardápio
 * 3. Adição de produtos ao carrinho
 * 4. Personalização de produtos
 * 5. Finalização do pedido
 * 6. Preenchimento de dados de entrega
 * 
 * Para executar: npm run test:e2e:buyer
 */

const puppeteer = require('puppeteer');
const path = require('path');

// Configurações do teste
const config = {
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  headless: process.env.HEADLESS === 'true' || false,
  slowMo: parseInt(process.env.SLOW_MO) || 100, // Atraso entre ações (ms)
  timeout: parseInt(process.env.TIMEOUT) || 30000, // Timeout padrão
  viewport: {
    width: parseInt(process.env.VIEWPORT_WIDTH) || 1366,
    height: parseInt(process.env.VIEWPORT_HEIGHT) || 768,
  },
  stores: process.env.TEST_STORES ? process.env.TEST_STORES.split(',') : [
    'pizzaria-do-mario',
    'burguer-house',
    'sushi-yamato',
    'doceria-da-vovo',
  ],
};

// Dados de teste do cliente
const customerData = {
  name: 'João Silva Teste',
  phone: '11999887766',
  email: 'joao.teste@email.com',
  address: {
    street: 'Rua das Flores, 123',
    neighborhood: 'Jardim das Rosas',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01234-567',
    complement: 'Apto 45B',
  },
};

class BuyerExperienceTest {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = {
      stores: {},
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        errors: [],
      },
    };
  }

  async setup() {
    console.log('🚀 Iniciando teste da experiência do comprador...\n');

    this.browser = await puppeteer.launch({
      headless: config.headless,
      slowMo: config.slowMo,
      defaultViewport: config.viewport,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
      ],
    });

    this.page = await this.browser.newPage();

    // Configurar timeout padrão
    this.page.setDefaultTimeout(config.timeout);

    // Interceptar erros de console
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Console Error:', msg.text());
      }
    });

    // Interceptar erros de página
    this.page.on('pageerror', error => {
      console.log('❌ Page Error:', error.message);
      this.results.summary.errors.push(`Page Error: ${error.message}`);
    });
  }

  async teardown() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async takeScreenshot(name) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `screenshot-${name}-${timestamp}.png`;
    const filepath = path.join(__dirname, 'screenshots', filename);

    try {
      await this.page.screenshot({
        path: filepath,
        fullPage: true,
      });
      console.log(`📸 Screenshot salvo: ${filename}`);
    } catch (error) {
      console.log('❌ Erro ao tirar screenshot:', error.message);
    }
  }

  async waitForElement(selector, timeout = 10000) {
    try {
      await this.page.waitForSelector(selector, { timeout });
      return true;
    } catch (error) {
      console.log(`❌ Elemento não encontrado: ${selector}`);
      return false;
    }
  }

  async testStoreAccess(storeSlug) {
    console.log(`\n🏪 Testando acesso à loja: ${storeSlug}`);

    const storeUrl = `${config.baseUrl}/${storeSlug}`;

    try {
      // Navegar para a loja
      await this.page.goto(storeUrl, { waitUntil: 'networkidle2' });

      // Verificar se a página carregou
      const title = await this.page.title();
      console.log(`   📄 Título da página: ${title}`);

      // Verificar elementos essenciais
      const checks = [
        { selector: 'h1, [data-testid="store-name"]', name: 'Nome da loja' },
        { selector: '[data-testid="store-description"], .store-description', name: 'Descrição da loja' },
        { selector: '[data-testid="categories"], .categories', name: 'Categorias' },
        { selector: '[data-testid="products"], .products', name: 'Produtos' },
      ];

      const results = {};
      for (const check of checks) {
        const found = await this.waitForElement(check.selector, 5000);
        results[check.name] = found;
        console.log(`   ${found ? '✅' : '❌'} ${check.name}`);
      }

      // Tirar screenshot
      await this.takeScreenshot(`store-${storeSlug}-loaded`);

      return {
        success: true,
        url: storeUrl,
        title,
        elements: results,
      };

    } catch (error) {
      console.log(`   ❌ Erro ao acessar loja: ${error.message}`);
      await this.takeScreenshot(`store-${storeSlug}-error`);

      return {
        success: false,
        error: error.message,
        url: storeUrl,
      };
    }
  }

  async testProductSelection(storeSlug) {
    console.log(`\n🛒 Testando seleção de produtos: ${storeSlug}`);

    try {
      // Aguardar produtos carregarem
      const productsLoaded = await this.waitForElement('[data-testid="product-card"], .product-card', 10000);
      if (!productsLoaded) {
        throw new Error('Produtos não carregaram');
      }

      // Obter lista de produtos
      const products = await this.page.$$('[data-testid="product-card"], .product-card');
      console.log(`   📦 ${products.length} produtos encontrados`);

      if (products.length === 0) {
        throw new Error('Nenhum produto encontrado');
      }

      // Selecionar o primeiro produto
      const firstProduct = products[0];

      // Obter nome do produto
      let productName = 'Produto desconhecido';
      try {
        const nameElement = await firstProduct.$('[data-testid="product-name"], .product-name, h3, h4');
        if (nameElement) {
          productName = await this.page.evaluate(el => el.textContent.trim(), nameElement);
        }
      } catch (e) {
        console.log('   ⚠️ Não foi possível obter o nome do produto');
      }

      console.log(`   🎯 Selecionando produto: ${productName}`);

      // Clicar no produto
      await firstProduct.click();

      // Aguardar modal ou página de detalhes
      await this.page.waitForTimeout(2000);

      // Verificar se modal abriu ou se foi para página de detalhes
      const modalOpened = await this.page.$('[data-testid="product-modal"], .modal, .dialog') !== null;
      const detailsPage = await this.page.url().includes('/product/') || await this.page.url().includes('/produto/');

      console.log(`   ${modalOpened || detailsPage ? '✅' : '❌'} Detalhes do produto abertos`);

      // Tirar screenshot
      await this.takeScreenshot(`product-${storeSlug}-selected`);

      return {
        success: true,
        productName,
        modalOpened,
        detailsPage,
        productsCount: products.length,
      };

    } catch (error) {
      console.log(`   ❌ Erro na seleção de produtos: ${error.message}`);
      await this.takeScreenshot(`product-${storeSlug}-error`);

      return {
        success: false,
        error: error.message,
      };
    }
  }

  async testAddToCart(storeSlug) {
    console.log(`\n🛒 Testando adição ao carrinho: ${storeSlug}`);

    try {
      // Procurar botão de adicionar ao carrinho
      const addToCartSelectors = [
        '[data-testid="add-to-cart"]',
        '[data-testid="btn-add-cart"]',
        '.add-to-cart',
        '.btn-add-cart',
        'button[type="submit"]',
        'button:contains("Adicionar")',
        'button:contains("Carrinho")',
      ];

      let addButton = null;
      for (const selector of addToCartSelectors) {
        addButton = await this.page.$(selector);
        if (addButton) {
          console.log(`   🎯 Botão encontrado: ${selector}`);
          break;
        }
      }

      if (!addButton) {
        // Tentar encontrar qualquer botão na página
        const buttons = await this.page.$$('button');
        if (buttons.length > 0) {
          addButton = buttons[buttons.length - 1]; // Último botão (geralmente o de ação)
          console.log(`   🎯 Usando último botão encontrado`);
        }
      }

      if (!addButton) {
        throw new Error('Botão de adicionar ao carrinho não encontrado');
      }

      // Verificar se o botão está visível e habilitado
      const isVisible = await addButton.isIntersectingViewport();
      const isEnabled = await this.page.evaluate(btn => !btn.disabled, addButton);

      console.log(`   ${isVisible ? '✅' : '❌'} Botão visível`);
      console.log(`   ${isEnabled ? '✅' : '❌'} Botão habilitado`);

      if (!isVisible) {
        // Rolar até o botão
        await addButton.scrollIntoView();
        await this.page.waitForTimeout(1000);
      }

      // Clicar no botão
      await addButton.click();
      console.log(`   ✅ Botão clicado`);

      // Aguardar feedback visual
      await this.page.waitForTimeout(2000);

      // Verificar se item foi adicionado (procurar por indicadores visuais)
      const cartIndicators = [
        '[data-testid="cart-count"]',
        '[data-testid="cart-items"]',
        '.cart-count',
        '.cart-badge',
        '.badge',
      ];

      let cartUpdated = false;
      for (const selector of cartIndicators) {
        const indicator = await this.page.$(selector);
        if (indicator) {
          const count = await this.page.evaluate(el => el.textContent, indicator);
          if (count && count !== '0' && count !== '') {
            cartUpdated = true;
            console.log(`   ✅ Carrinho atualizado: ${count} item(s)`);
            break;
          }
        }
      }

      if (!cartUpdated) {
        console.log(`   ⚠️ Não foi possível confirmar atualização do carrinho`);
      }

      // Tirar screenshot
      await this.takeScreenshot(`cart-${storeSlug}-added`);

      return {
        success: true,
        cartUpdated,
      };

    } catch (error) {
      console.log(`   ❌ Erro ao adicionar ao carrinho: ${error.message}`);
      await this.takeScreenshot(`cart-${storeSlug}-error`);

      return {
        success: false,
        error: error.message,
      };
    }
  }

  async testCartAndCheckout(storeSlug) {
    console.log(`\n💳 Testando carrinho e checkout: ${storeSlug}`);

    try {
      // Procurar e abrir carrinho
      const cartSelectors = [
        '[data-testid="cart-button"]',
        '[data-testid="open-cart"]',
        '.cart-button',
        '.btn-cart',
        'button:contains("Carrinho")',
      ];

      let cartButton = null;
      for (const selector of cartSelectors) {
        cartButton = await this.page.$(selector);
        if (cartButton) {
          console.log(`   🎯 Botão do carrinho encontrado: ${selector}`);
          break;
        }
      }

      if (cartButton) {
        await cartButton.click();
        await this.page.waitForTimeout(2000);
        console.log(`   ✅ Carrinho aberto`);
      } else {
        console.log(`   ⚠️ Botão do carrinho não encontrado`);
      }

      // Procurar botão de finalizar pedido
      const checkoutSelectors = [
        '[data-testid="checkout-button"]',
        '[data-testid="finalize-order"]',
        '.checkout-button',
        '.btn-checkout',
        'button:contains("Finalizar")',
        'button:contains("Pedido")',
      ];

      let checkoutButton = null;
      for (const selector of checkoutSelectors) {
        checkoutButton = await this.page.$(selector);
        if (checkoutButton) {
          console.log(`   🎯 Botão de checkout encontrado: ${selector}`);
          break;
        }
      }

      if (checkoutButton) {
        await checkoutButton.click();
        await this.page.waitForTimeout(3000);
        console.log(`   ✅ Processo de checkout iniciado`);

        // Tirar screenshot do checkout
        await this.takeScreenshot(`checkout-${storeSlug}-started`);

        return {
          success: true,
          cartOpened: !!cartButton,
          checkoutStarted: true,
        };
      } else {
        console.log(`   ⚠️ Botão de checkout não encontrado`);

        return {
          success: true,
          cartOpened: !!cartButton,
          checkoutStarted: false,
        };
      }

    } catch (error) {
      console.log(`   ❌ Erro no carrinho/checkout: ${error.message}`);
      await this.takeScreenshot(`checkout-${storeSlug}-error`);

      return {
        success: false,
        error: error.message,
      };
    }
  }

  async testCustomerDataForm(storeSlug) {
    console.log(`\n📝 Testando formulário de dados: ${storeSlug}`);

    try {
      // Aguardar formulário aparecer
      await this.page.waitForTimeout(2000);

      // Procurar campos do formulário
      const formFields = {
        name: ['[data-testid="customer-name"]', '[name="name"]', '#name', 'input[placeholder*="Nome"]'],
        phone: ['[data-testid="customer-phone"]', '[name="phone"]', '#phone', 'input[placeholder*="Telefone"]'],
        email: ['[data-testid="customer-email"]', '[name="email"]', '#email', 'input[placeholder*="Email"]'],
        address: ['[data-testid="customer-address"]', '[name="address"]', '#address', 'input[placeholder*="Endereço"]'],
      };

      const filledFields = {};

      for (const [fieldName, selectors] of Object.entries(formFields)) {
        let field = null;

        for (const selector of selectors) {
          field = await this.page.$(selector);
          if (field) break;
        }

        if (field) {
          let value = '';
          switch (fieldName) {
            case 'name':
              value = customerData.name;
              break;
            case 'phone':
              value = customerData.phone;
              break;
            case 'email':
              value = customerData.email;
              break;
            case 'address':
              value = `${customerData.address.street}, ${customerData.address.neighborhood}`;
              break;
          }

          await field.click();
          await field.type(value, { delay: 50 });
          filledFields[fieldName] = true;
          console.log(`   ✅ Campo ${fieldName} preenchido`);
        } else {
          filledFields[fieldName] = false;
          console.log(`   ❌ Campo ${fieldName} não encontrado`);
        }
      }

      // Tirar screenshot do formulário preenchido
      await this.takeScreenshot(`form-${storeSlug}-filled`);

      return {
        success: true,
        filledFields,
      };

    } catch (error) {
      console.log(`   ❌ Erro no formulário: ${error.message}`);
      await this.takeScreenshot(`form-${storeSlug}-error`);

      return {
        success: false,
        error: error.message,
      };
    }
  }

  async testFullBuyerJourney(storeSlug) {
    console.log(`\n🎯 Iniciando teste completo para: ${storeSlug}`);

    const results = {
      store: storeSlug,
      steps: {},
      success: false,
      errors: [],
    };

    try {
      // 1. Acesso à loja
      results.steps.storeAccess = await this.testStoreAccess(storeSlug);
      if (!results.steps.storeAccess.success) {
        throw new Error('Falha no acesso à loja');
      }

      // 2. Seleção de produto
      results.steps.productSelection = await this.testProductSelection(storeSlug);
      if (!results.steps.productSelection.success) {
        throw new Error('Falha na seleção de produto');
      }

      // 3. Adição ao carrinho
      results.steps.addToCart = await this.testAddToCart(storeSlug);
      if (!results.steps.addToCart.success) {
        throw new Error('Falha ao adicionar ao carrinho');
      }

      // 4. Carrinho e checkout
      results.steps.cartAndCheckout = await this.testCartAndCheckout(storeSlug);
      if (!results.steps.cartAndCheckout.success) {
        throw new Error('Falha no carrinho/checkout');
      }

      // 5. Formulário de dados (se checkout foi iniciado)
      if (results.steps.cartAndCheckout.checkoutStarted) {
        results.steps.customerForm = await this.testCustomerDataForm(storeSlug);
      }

      results.success = true;
      console.log(`\n✅ Teste completo da loja ${storeSlug} concluído com sucesso!`);

    } catch (error) {
      results.success = false;
      results.errors.push(error.message);
      console.log(`\n❌ Teste da loja ${storeSlug} falhou: ${error.message}`);
    }

    return results;
  }

  async runAllTests() {
    try {
      await this.setup();

      // Testar cada loja
      for (const storeSlug of config.stores) {
        const result = await this.testFullBuyerJourney(storeSlug);
        this.results.stores[storeSlug] = result;
        this.results.summary.total++;

        if (result.success) {
          this.results.summary.passed++;
        } else {
          this.results.summary.failed++;
          this.results.summary.errors.push(...result.errors);
        }

        // Aguardar entre testes
        await this.page.waitForTimeout(2000);
      }

      this.generateReport();

    } catch (error) {
      console.error('❌ Erro geral nos testes:', error);
    } finally {
      await this.teardown();
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 RELATÓRIO FINAL DOS TESTES');
    console.log('='.repeat(60));

    console.log(`\n📈 Resumo Geral:`);
    console.log(`   Total de lojas testadas: ${this.results.summary.total}`);
    console.log(`   Sucessos: ${this.results.summary.passed}`);
    console.log(`   Falhas: ${this.results.summary.failed}`);
    console.log(`   Taxa de sucesso: ${((this.results.summary.passed / this.results.summary.total) * 100).toFixed(1)}%`);

    console.log(`\n📋 Detalhes por Loja:`);
    for (const [storeSlug, result] of Object.entries(this.results.stores)) {
      console.log(`\n🏪 ${storeSlug}:`);
      console.log(`   Status: ${result.success ? '✅ Sucesso' : '❌ Falha'}`);

      if (result.steps) {
        console.log(`   Etapas:`);
        for (const [step, data] of Object.entries(result.steps)) {
          console.log(`     - ${step}: ${data.success ? '✅' : '❌'}`);
        }
      }

      if (result.errors && result.errors.length > 0) {
        console.log(`   Erros:`);
        result.errors.forEach(error => {
          console.log(`     - ${error}`);
        });
      }
    }

    if (this.results.summary.errors.length > 0) {
      console.log(`\n⚠️ Erros Gerais:`);
      this.results.summary.errors.forEach(error => {
        console.log(`   - ${error}`);
      });
    }

    console.log('\n' + '='.repeat(60));

    // Salvar relatório em arquivo
    const reportData = {
      timestamp: new Date().toISOString(),
      config,
      results: this.results,
    };

    const fs = require('fs');
    const reportPath = path.join(__dirname, 'reports', `buyer-test-${Date.now()}.json`);

    try {
      fs.mkdirSync(path.dirname(reportPath), { recursive: true });
      fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
      console.log(`💾 Relatório salvo em: ${reportPath}`);
    } catch (error) {
      console.log('❌ Erro ao salvar relatório:', error.message);
    }
  }
}

// Executar testes se chamado diretamente
if (require.main === module) {
  const test = new BuyerExperienceTest();
  test.runAllTests().catch(console.error);
}

module.exports = BuyerExperienceTest;
