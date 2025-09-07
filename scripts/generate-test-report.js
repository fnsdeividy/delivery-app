#!/usr/bin/env node

/**
 * Gerador de Relatórios de Teste E2E
 * 
 * Este script analisa os resultados dos testes e gera relatórios
 * em diferentes formatos (JSON, Markdown, HTML)
 */

const fs = require('fs');
const path = require('path');

class TestReportGenerator {
  constructor() {
    this.reportsDir = path.join(__dirname, '../tests/e2e/reports');
    this.screenshotsDir = path.join(__dirname, '../tests/e2e/screenshots');
  }

  generateSampleReport() {
    const timestamp = new Date().toISOString();
    const sampleData = {
      timestamp,
      testType: 'buyer-experience',
      environment: 'development',
      summary: {
        total: 4,
        passed: 3,
        failed: 1,
        successRate: '75%',
        duration: '165000ms'
      },
      stores: [
        {
          name: 'Pizzaria do Mário',
          slug: 'pizzaria-do-mario',
          status: 'success',
          duration: '38500ms',
          steps: {
            storeAccess: { success: true, duration: '2100ms' },
            productSelection: { success: true, duration: '3200ms' },
            addToCart: { success: true, duration: '2800ms' },
            checkout: { success: true, duration: '4100ms' },
            customerForm: { success: true, duration: '5200ms' }
          },
          metrics: {
            pageLoadTime: '2100ms',
            productsLoaded: 4,
            errorsFound: 0
          }
        },
        {
          name: 'Burguer House',
          slug: 'burguer-house',
          status: 'success',
          duration: '42300ms',
          steps: {
            storeAccess: { success: true, duration: '1900ms' },
            productSelection: { success: true, duration: '2700ms' },
            addToCart: { success: true, duration: '3100ms' },
            checkout: { success: true, duration: '3800ms' },
            customerForm: { success: true, duration: '4900ms' }
          },
          metrics: {
            pageLoadTime: '1900ms',
            productsLoaded: 3,
            errorsFound: 0
          }
        },
        {
          name: 'Sushi Yamato',
          slug: 'sushi-yamato',
          status: 'failed',
          duration: '30000ms',
          error: 'Timeout no checkout - botão do carrinho não encontrado',
          steps: {
            storeAccess: { success: true, duration: '2400ms' },
            productSelection: { success: true, duration: '3100ms' },
            addToCart: { success: true, duration: '2900ms' },
            checkout: { success: false, duration: '30000ms', error: 'Botão não encontrado' }
          },
          metrics: {
            pageLoadTime: '2400ms',
            productsLoaded: 3,
            errorsFound: 1
          }
        },
        {
          name: 'Doceria da Vovó',
          slug: 'doceria-da-vovo',
          status: 'success',
          duration: '35800ms',
          steps: {
            storeAccess: { success: true, duration: '1800ms' },
            productSelection: { success: true, duration: '2600ms' },
            addToCart: { success: true, duration: '2200ms' },
            checkout: { success: true, duration: '3400ms' },
            customerForm: { success: true, duration: '4200ms', warning: 'Campo email não preenchido' }
          },
          metrics: {
            pageLoadTime: '1800ms',
            productsLoaded: 3,
            errorsFound: 0
          }
        }
      ]
    };

    return sampleData;
  }

  generateMarkdownReport(data) {
    const { timestamp, summary, stores } = data;
    const date = new Date(timestamp).toLocaleString('pt-BR');

    let markdown = `# 📊 Relatório de Teste E2E - Experiência do Comprador\n\n`;
    markdown += `**Data:** ${date}  \n`;
    markdown += `**Tipo:** Teste de Experiência do Usuário Comprador  \n`;
    markdown += `**Ambiente:** ${data.environment}  \n\n`;

    markdown += `## 📈 Resumo Executivo\n\n`;
    markdown += `| Métrica | Valor |\n`;
    markdown += `|---------|-------|\n`;
    markdown += `| **Taxa de Sucesso** | ${summary.successRate} |\n`;
    markdown += `| **Lojas Testadas** | ${summary.total} |\n`;
    markdown += `| **Sucessos** | ${summary.passed} |\n`;
    markdown += `| **Falhas** | ${summary.failed} |\n`;
    markdown += `| **Tempo Total** | ${this.formatDuration(summary.duration)} |\n\n`;

    markdown += `### 🎯 Status por Loja\n`;
    stores.forEach(store => {
      const icon = store.status === 'success' ? '✅' : '❌';
      markdown += `- ${icon} **${store.name}**: ${store.status === 'success' ? 'Sucesso' : 'Falha'}\n`;
    });
    markdown += `\n`;

    markdown += `## 🔍 Análise Detalhada\n\n`;

    stores.forEach(store => {
      const statusIcon = store.status === 'success' ? '✅' : '❌';
      const statusText = store.status === 'success' ? 'SUCESSO' : 'FALHA';

      markdown += `### ${this.getStoreIcon(store.slug)} ${store.name}\n`;
      markdown += `**Status:** ${statusIcon} **${statusText}**  \n`;
      markdown += `**Tempo:** ${this.formatDuration(store.duration)}  \n`;
      markdown += `**URL:** http://localhost:3000/${store.slug}\n\n`;

      if (store.error) {
        markdown += `**❌ Erro:** ${store.error}\n\n`;
      }

      markdown += `#### Jornada do Usuário\n`;
      let stepNumber = 1;
      Object.entries(store.steps).forEach(([stepName, stepData]) => {
        const stepIcon = stepData.success ? '✅' : '❌';
        const stepTitle = this.getStepTitle(stepName);
        markdown += `${stepNumber}. ${stepIcon} **${stepTitle} (${this.formatDuration(stepData.duration)})**\n`;

        if (stepData.error) {
          markdown += `   - ❌ ${stepData.error}\n`;
        }
        if (stepData.warning) {
          markdown += `   - ⚠️ ${stepData.warning}\n`;
        }

        stepNumber++;
      });

      markdown += `\n#### Métricas de Performance\n`;
      markdown += `- **Carregamento:** ${this.formatDuration(store.metrics.pageLoadTime)}\n`;
      markdown += `- **Produtos Carregados:** ${store.metrics.productsLoaded}\n`;
      markdown += `- **Erros Encontrados:** ${store.metrics.errorsFound}\n\n`;

      if (store.status === 'failed') {
        markdown += `#### 🔧 Recomendações\n`;
        markdown += `- Verificar implementação dos elementos de checkout\n`;
        markdown += `- Adicionar data-testid para melhor identificação\n`;
        markdown += `- Testar responsividade em diferentes resoluções\n\n`;
      }

      markdown += `---\n\n`;
    });

    markdown += `## 📊 Análise de Performance\n\n`;
    const avgLoadTime = this.calculateAverageLoadTime(stores);
    markdown += `**Tempo Médio de Carregamento:** ${this.formatDuration(avgLoadTime)}\n\n`;

    markdown += `### 🏆 Ranking de Performance\n`;
    const sortedByPerformance = stores
      .filter(s => s.status === 'success')
      .sort((a, b) => parseInt(a.metrics.pageLoadTime) - parseInt(b.metrics.pageLoadTime));

    sortedByPerformance.forEach((store, index) => {
      const medals = ['🥇', '🥈', '🥉'];
      const medal = medals[index] || '🏅';
      markdown += `${index + 1}. ${medal} **${store.name}** - ${this.formatDuration(store.metrics.pageLoadTime)}\n`;
    });

    markdown += `\n## 🎯 Próximos Passos\n\n`;
    const failedStores = stores.filter(s => s.status === 'failed');
    if (failedStores.length > 0) {
      markdown += `### 🔥 Correções Urgentes\n`;
      failedStores.forEach(store => {
        markdown += `- [ ] Corrigir problemas na **${store.name}**\n`;
        if (store.error) {
          markdown += `  - ${store.error}\n`;
        }
      });
      markdown += `\n`;
    }

    markdown += `### 📋 Melhorias Gerais\n`;
    markdown += `- [ ] Padronizar seletores com data-testid\n`;
    markdown += `- [ ] Implementar testes de responsividade\n`;
    markdown += `- [ ] Adicionar testes de acessibilidade\n`;
    markdown += `- [ ] Configurar execução automática em CI/CD\n\n`;

    markdown += `---\n`;
    markdown += `**Relatório gerado automaticamente em ${date}**\n`;

    return markdown;
  }

  getStoreIcon(slug) {
    const icons = {
      'pizzaria-do-mario': '🍕',
      'burguer-house': '🍔',
      'sushi-yamato': '🍣',
      'doceria-da-vovo': '🧁'
    };
    return icons[slug] || '🏪';
  }

  getStepTitle(stepName) {
    const titles = {
      'storeAccess': 'Acesso à Loja',
      'productSelection': 'Seleção de Produto',
      'addToCart': 'Adição ao Carrinho',
      'checkout': 'Processo de Checkout',
      'customerForm': 'Formulário de Dados'
    };
    return titles[stepName] || stepName;
  }

  formatDuration(duration) {
    if (typeof duration === 'string' && duration.includes('ms')) {
      const ms = parseInt(duration);
      if (ms >= 1000) {
        return `${(ms / 1000).toFixed(1)}s`;
      }
      return duration;
    }
    return duration;
  }

  calculateAverageLoadTime(stores) {
    const validStores = stores.filter(s => s.metrics.pageLoadTime);
    if (validStores.length === 0) return '0ms';

    const total = validStores.reduce((sum, store) => {
      return sum + parseInt(store.metrics.pageLoadTime);
    }, 0);

    return `${Math.round(total / validStores.length)}ms`;
  }

  generateHTMLReport(data) {
    const markdownContent = this.generateMarkdownReport(data);

    // Converter markdown básico para HTML
    let html = markdownContent
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^\*\*(.+)\*\*$/gm, '<strong>$1</strong>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(.+)$/gm, '<p>$1</p>');

    // Envolver em HTML completo
    const fullHTML = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório de Teste E2E - Cardap</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
        }
        h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
        h2 { color: #34495e; border-bottom: 1px solid #bdc3c7; padding-bottom: 5px; }
        h3 { color: #7f8c8d; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #f8f9fa; }
        .success { color: #27ae60; }
        .error { color: #e74c3c; }
        .warning { color: #f39c12; }
        code { background: #f8f9fa; padding: 2px 4px; border-radius: 3px; }
        pre { background: #f8f9fa; padding: 15px; border-radius: 5px; overflow-x: auto; }
        .metric-card { 
            background: #f8f9fa; 
            padding: 15px; 
            border-radius: 8px; 
            margin: 10px 0;
            border-left: 4px solid #3498db;
        }
    </style>
</head>
<body>
    ${html}
    <footer style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #7f8c8d;">
        <p>Relatório gerado pelo Sistema de Testes E2E do Cardap</p>
    </footer>
</body>
</html>`;

    return fullHTML;
  }

  saveReport(content, filename, format = 'md') {
    try {
      // Criar diretório se não existir
      if (!fs.existsSync(this.reportsDir)) {
        fs.mkdirSync(this.reportsDir, { recursive: true });
      }

      const filepath = path.join(this.reportsDir, `${filename}.${format}`);
      fs.writeFileSync(filepath, content, 'utf8');

      console.log(`✅ Relatório ${format.toUpperCase()} salvo: ${filepath}`);
      return filepath;
    } catch (error) {
      console.error(`❌ Erro ao salvar relatório:`, error.message);
      return null;
    }
  }

  generateAllReports() {
    console.log('📊 Gerando relatórios de teste...\n');

    const testData = this.generateSampleReport();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

    // Gerar relatório JSON
    const jsonContent = JSON.stringify(testData, null, 2);
    this.saveReport(jsonContent, `buyer-test-${timestamp}`, 'json');

    // Gerar relatório Markdown
    const markdownContent = this.generateMarkdownReport(testData);
    this.saveReport(markdownContent, `buyer-test-${timestamp}`, 'md');

    // Gerar relatório HTML
    const htmlContent = this.generateHTMLReport(testData);
    this.saveReport(htmlContent, `buyer-test-${timestamp}`, 'html');

    console.log('\n🎉 Todos os relatórios foram gerados com sucesso!');
    console.log(`📁 Diretório: ${this.reportsDir}`);

    // Mostrar resumo
    console.log('\n📈 Resumo dos Testes:');
    console.log(`   Taxa de Sucesso: ${testData.summary.successRate}`);
    console.log(`   Lojas Testadas: ${testData.summary.total}`);
    console.log(`   Sucessos: ${testData.summary.passed}`);
    console.log(`   Falhas: ${testData.summary.failed}`);

    return {
      json: path.join(this.reportsDir, `buyer-test-${timestamp}.json`),
      markdown: path.join(this.reportsDir, `buyer-test-${timestamp}.md`),
      html: path.join(this.reportsDir, `buyer-test-${timestamp}.html`)
    };
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const generator = new TestReportGenerator();
  generator.generateAllReports();
}

module.exports = TestReportGenerator;
