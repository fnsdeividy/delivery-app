# Testes E2E - Experiência do Comprador

Este diretório contém testes end-to-end (E2E) para validar a experiência completa do usuário comprador no sistema Cardap.

## 📋 O que é testado

### Jornada Completa do Comprador
1. **Acesso à loja**: Verificação do carregamento da página da loja
2. **Navegação**: Visualização de categorias e produtos
3. **Seleção de produtos**: Abertura de detalhes e customização
4. **Carrinho**: Adição de produtos e visualização do carrinho
5. **Checkout**: Processo de finalização do pedido
6. **Dados do cliente**: Preenchimento de informações de entrega

### Lojas Testadas
- 🍕 Pizzaria do Mário
- 🍔 Burguer House  
- 🍣 Sushi Yamato
- 🧁 Doceria da Vovó

## 🚀 Como executar

### Pré-requisitos
1. Backend rodando na porta 3000
2. Frontend rodando na porta 3000 (ou configurar BASE_URL)
3. Banco de dados com dados de teste

### Configuração do Ambiente
```bash
# 1. Configurar dados de teste
npm run seed:test

# 2. Ou usar o script de setup completo
npm run test:e2e:setup
```

### Executar Testes

#### Modo Visual (recomendado para desenvolvimento)
```bash
npm run test:e2e:buyer
```

#### Modo Headless (para CI/CD)
```bash
npm run test:e2e:buyer:headless
```

#### Executar diretamente com opções
```bash
# Com configurações personalizadas
HEADLESS=true SLOW_MO=50 BASE_URL=http://localhost:3001 npm run test:e2e:buyer

# Testar apenas algumas lojas
TEST_STORES=pizzaria-do-mario,burguer-house npm run test:e2e:buyer
```

## ⚙️ Configurações

### Variáveis de Ambiente

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `BASE_URL` | `http://localhost:3000` | URL base da aplicação |
| `HEADLESS` | `false` | Executar sem interface gráfica |
| `SLOW_MO` | `100` | Atraso entre ações (ms) |
| `TIMEOUT` | `30000` | Timeout padrão (ms) |
| `VIEWPORT_WIDTH` | `1366` | Largura da viewport |
| `VIEWPORT_HEIGHT` | `768` | Altura da viewport |
| `TEST_STORES` | (todas) | Lojas a testar (separadas por vírgula) |

### Exemplo de .env para testes
```env
# .env.test
BASE_URL=http://localhost:3001
HEADLESS=true
SLOW_MO=50
TIMEOUT=60000
TEST_STORES=pizzaria-do-mario,burguer-house
```

## 📊 Relatórios

### Screenshots
Durante a execução, screenshots são salvos em:
- `tests/e2e/screenshots/`
- Nomeação: `screenshot-{acao}-{loja}-{timestamp}.png`

### Relatórios JSON
Relatórios detalhados são salvos em:
- `tests/e2e/reports/`
- Nomeação: `buyer-test-{timestamp}.json`

### Console Output
O teste gera um relatório detalhado no console:
```
📊 RELATÓRIO FINAL DOS TESTES
============================================================

📈 Resumo Geral:
   Total de lojas testadas: 4
   Sucessos: 3
   Falhas: 1
   Taxa de sucesso: 75.0%

📋 Detalhes por Loja:

🏪 pizzaria-do-mario:
   Status: ✅ Sucesso
   Etapas:
     - storeAccess: ✅
     - productSelection: ✅
     - addToCart: ✅
     - cartAndCheckout: ✅
```

## 🛠️ Estrutura dos Testes

### Classe Principal: `BuyerExperienceTest`

#### Métodos Principais
- `testStoreAccess()`: Verifica carregamento da loja
- `testProductSelection()`: Testa seleção de produtos
- `testAddToCart()`: Valida adição ao carrinho
- `testCartAndCheckout()`: Testa processo de checkout
- `testCustomerDataForm()`: Valida formulário de dados

#### Seletores Utilizados
O teste usa múltiplos seletores para encontrar elementos:
```javascript
const addToCartSelectors = [
  '[data-testid="add-to-cart"]',
  '[data-testid="btn-add-cart"]', 
  '.add-to-cart',
  '.btn-add-cart',
  'button[type="submit"]',
  'button:contains("Adicionar")',
];
```

## 🔧 Solução de Problemas

### Problemas Comuns

#### 1. Timeout nos testes
```bash
# Aumentar timeout
TIMEOUT=60000 npm run test:e2e:buyer
```

#### 2. Elementos não encontrados
- Verificar se os dados de teste foram criados
- Confirmar se as lojas estão ativas
- Verificar seletores nos componentes

#### 3. Screenshots não são salvas
```bash
# Criar diretório manualmente
mkdir -p tests/e2e/screenshots
```

#### 4. Serviços não estão rodando
```bash
# Usar script de setup
npm run test:e2e:setup
```

### Debug

#### Modo Debug (mais lento, com logs)
```bash
SLOW_MO=500 HEADLESS=false npm run test:e2e:buyer
```

#### Testar uma loja específica
```bash
TEST_STORES=pizzaria-do-mario npm run test:e2e:buyer
```

#### Executar com DevTools aberto
Editar o arquivo de teste e adicionar:
```javascript
this.browser = await puppeteer.launch({
  headless: false,
  devtools: true, // Adicionar esta linha
  // ... outras opções
});
```

## 📝 Dados de Teste

### Lojas Criadas pela Seed
Cada loja possui:
- ✅ Categorias de produtos
- ✅ Produtos com preços e imagens
- ✅ Ingredientes e adicionais
- ✅ Configurações de entrega
- ✅ Horários de funcionamento

### Produtos de Exemplo
- **Pizzaria**: Pizza Margherita, Pizza Calabresa, Pizza do Chefe
- **Hamburgueria**: Classic Burger, Bacon Cheeseburger, Batata Frita
- **Japonesa**: Combo Salmão, Sushi de Atum, Hot Roll Salmão
- **Doceria**: Bolo de Chocolate, Bolo de Cenoura, Brigadeiros

## 🚀 Integração CI/CD

### GitHub Actions (exemplo)
```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Setup test environment
        run: npm run test:e2e:setup
        
      - name: Run E2E tests
        run: npm run test:e2e:buyer:headless
        
      - name: Upload screenshots
        if: failure()
        uses: actions/upload-artifact@v2
        with:
          name: screenshots
          path: tests/e2e/screenshots/
```

## 🔍 Monitoramento

### Métricas Coletadas
- ✅ Taxa de sucesso por loja
- ✅ Tempo de carregamento das páginas
- ✅ Elementos encontrados/não encontrados
- ✅ Erros de JavaScript capturados
- ✅ Screenshots de falhas

### Alertas Recomendados
- Taxa de sucesso < 80%
- Tempo de carregamento > 5s
- Mais de 2 lojas falhando

## 📚 Extensões Futuras

### Testes Adicionais Sugeridos
1. **Teste de Performance**: Medição de Core Web Vitals
2. **Teste de Responsividade**: Múltiplos tamanhos de tela
3. **Teste de Acessibilidade**: Validação WCAG
4. **Teste de Pagamento**: Fluxo completo com mock
5. **Teste de Notificações**: Push notifications e emails

### Melhorias no Código
1. **Page Objects**: Organizar seletores em classes
2. **Fixtures**: Dados de teste mais robustos
3. **Parallel Testing**: Executar lojas em paralelo
4. **Visual Regression**: Comparação de screenshots
5. **API Testing**: Validar chamadas de rede

## 🤝 Contribuindo

### Adicionando Novos Testes
1. Criar método na classe `BuyerExperienceTest`
2. Adicionar ao fluxo em `testFullBuyerJourney()`
3. Atualizar documentação
4. Adicionar screenshots relevantes

### Adicionando Novas Lojas
1. Incluir na seed: `prisma/seed-test-data.ts`
2. Adicionar ao array `config.stores`
3. Executar seed: `npm run seed:test`
4. Testar: `TEST_STORES=nova-loja npm run test:e2e:buyer`
