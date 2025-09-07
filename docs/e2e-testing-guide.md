# 🎯 Guia Completo de Testes E2E - Experiência do Comprador

Este guia mostra como usar o sistema completo de testes end-to-end (E2E) para validar a experiência do usuário comprador no Cardap.

## 📋 O que foi implementado

### 🌱 Sistema de Seed
- **4 lojas completas** com temas e configurações distintas
- **16 categorias** de produtos variadas
- **13 produtos** com preços, imagens e detalhes
- **5 usuários** (4 admins de loja + 1 cliente)
- **Ingredientes e adicionais** para produtos
- **Clientes de teste** para cada loja

### 🤖 Testes Automatizados
- **Teste completo da jornada do comprador**
- **Screenshots automáticos** de cada etapa
- **Relatórios detalhados** em JSON e console
- **Configuração flexível** via variáveis de ambiente
- **Execução em modo visual ou headless**

## 🚀 Como usar

### 1. Preparação do Ambiente

```bash
# Instalar dependências (se ainda não fez)
cd delivery-app
npm install

cd ../delivery-back
npm install
```

### 2. Iniciar os Serviços

```bash
# Terminal 1: Backend
cd delivery-back
npm run start:dev

# Terminal 2: Frontend  
cd delivery-app
npm run dev
```

### 3. Popular o Banco com Dados de Teste

```bash
# Opção 1: Executar seed diretamente
cd delivery-back
npx ts-node prisma/seed-test-data.ts

# Opção 2: Via script do frontend
cd delivery-app
npm run seed:test

# Opção 3: Setup completo (verifica serviços + seed)
npm run test:e2e:setup
```

### 4. Executar os Testes E2E

```bash
cd delivery-app

# Teste rápido (verificar se funciona)
node tests/e2e/quick-test.js

# Teste completo - modo visual (recomendado)
npm run test:e2e:buyer

# Teste completo - modo headless (para CI)
npm run test:e2e:buyer:headless

# Com configurações personalizadas
SLOW_MO=500 TEST_STORES=pizzaria-do-mario npm run test:e2e:buyer
```

## 🏪 Lojas de Teste Criadas

### 🍕 Pizzaria do Mário
- **URL**: http://localhost:3000/pizzaria-do-mario
- **Admin**: mario@pizzariadomario.com.br / 123456
- **Produtos**: Pizza Margherita, Pizza Calabresa, Pizza do Chefe
- **Tema**: Vermelho (#e53e3e)

### 🍔 Burguer House
- **URL**: http://localhost:3000/burguer-house
- **Admin**: carlos@burguerhouse.com.br / 123456
- **Produtos**: Classic Burger, Bacon Cheeseburger, Batata Frita
- **Tema**: Verde (#38a169)

### 🍣 Sushi Yamato
- **URL**: http://localhost:3000/sushi-yamato
- **Admin**: hiroshi@sushiyamato.com.br / 123456
- **Produtos**: Combo Salmão, Sushi de Atum, Hot Roll
- **Tema**: Cinza escuro (#2d3748)

### 🧁 Doceria da Vovó
- **URL**: http://localhost:3000/doceria-da-vovo
- **Admin**: maria@doceriadavovo.com.br / 123456
- **Produtos**: Bolo de Chocolate, Brigadeiros, Bolo de Cenoura
- **Tema**: Rosa (#d53f8c)

## 📊 O que é Testado

### Jornada Completa do Comprador
1. ✅ **Acesso à loja**: Carregamento da página
2. ✅ **Elementos essenciais**: Nome, descrição, categorias
3. ✅ **Seleção de produtos**: Clique e abertura de detalhes
4. ✅ **Adição ao carrinho**: Botão funcional
5. ✅ **Visualização do carrinho**: Abertura e itens
6. ✅ **Processo de checkout**: Finalização do pedido
7. ✅ **Formulário de dados**: Preenchimento de informações

### Validações Automáticas
- ✅ **Performance**: Tempo de carregamento
- ✅ **Responsividade**: Elementos visíveis
- ✅ **Funcionalidade**: Botões clicáveis
- ✅ **Dados**: Produtos carregados
- ✅ **Erros**: Captura de erros JavaScript

## 📈 Relatórios Gerados

### Console Output
```
📊 RELATÓRIO FINAL DOS TESTES
============================================================

📈 Resumo Geral:
   Total de lojas testadas: 4
   Sucessos: 4
   Falhas: 0
   Taxa de sucesso: 100.0%

📋 Detalhes por Loja:

🏪 pizzaria-do-mario:
   Status: ✅ Sucesso
   Etapas:
     - storeAccess: ✅
     - productSelection: ✅
     - addToCart: ✅
     - cartAndCheckout: ✅
```

### Arquivos Gerados
- **Screenshots**: `tests/e2e/screenshots/screenshot-{acao}-{loja}-{timestamp}.png`
- **Relatórios**: `tests/e2e/reports/buyer-test-{timestamp}.json`

## ⚙️ Configurações Avançadas

### Variáveis de Ambiente

```bash
# Configurações básicas
export BASE_URL="http://localhost:3000"
export HEADLESS="false"
export SLOW_MO="100"
export TIMEOUT="30000"

# Configurações de viewport
export VIEWPORT_WIDTH="1366"
export VIEWPORT_HEIGHT="768"

# Lojas específicas para testar
export TEST_STORES="pizzaria-do-mario,burguer-house"

# Executar com configurações
npm run test:e2e:buyer
```

### Arquivo .env.test
```env
BASE_URL=http://localhost:3000
HEADLESS=false
SLOW_MO=250
TIMEOUT=60000
VIEWPORT_WIDTH=1920
VIEWPORT_HEIGHT=1080
TEST_STORES=pizzaria-do-mario,sushi-yamato
```

## 🔧 Solução de Problemas

### Problemas Comuns

#### 1. "Erro ao acessar loja"
```bash
# Verificar se os serviços estão rodando
curl http://localhost:3000/pizzaria-do-mario
curl http://localhost:3000/api/stores

# Recriar dados de teste
npm run seed:test
```

#### 2. "Produtos não encontrados"
```bash
# Verificar se a seed foi executada
npm run seed:test

# Verificar dados no banco
cd delivery-back
npx prisma studio
```

#### 3. "Timeout nos testes"
```bash
# Aumentar timeout
TIMEOUT=60000 npm run test:e2e:buyer

# Diminuir velocidade
SLOW_MO=500 npm run test:e2e:buyer
```

#### 4. "Screenshots não são salvas"
```bash
# Criar diretórios
mkdir -p tests/e2e/screenshots tests/e2e/reports

# Verificar permissões
chmod 755 tests/e2e/screenshots
```

### Debug Avançado

#### Modo Debug Visual
```bash
# Executar lentamente com DevTools
HEADLESS=false SLOW_MO=1000 npm run test:e2e:buyer
```

#### Testar Loja Específica
```bash
# Apenas uma loja
TEST_STORES=pizzaria-do-mario npm run test:e2e:buyer

# Múltiplas lojas específicas
TEST_STORES=pizzaria-do-mario,burguer-house npm run test:e2e:buyer
```

#### Logs Detalhados
Editar `tests/e2e/buyer-experience.test.js` e adicionar:
```javascript
// Capturar logs do console
this.page.on('console', msg => {
  console.log('🔍 Console:', msg.text());
});

// Capturar requisições de rede
this.page.on('request', request => {
  console.log('🌐 Request:', request.url());
});
```

## 🚀 Integração CI/CD

### GitHub Actions
```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: |
          cd delivery-back && npm ci
          cd ../delivery-app && npm ci
          
      - name: Setup database
        run: |
          cd delivery-back
          npx prisma migrate deploy
          npx ts-node prisma/seed-test-data.ts
          
      - name: Start services
        run: |
          cd delivery-back && npm run start:dev &
          cd delivery-app && npm run build && npm start &
          sleep 30
          
      - name: Run E2E tests
        run: |
          cd delivery-app
          npm run test:e2e:buyer:headless
          
      - name: Upload screenshots
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: e2e-screenshots
          path: delivery-app/tests/e2e/screenshots/
```

## 📚 Extensões Futuras

### Testes Adicionais Sugeridos

1. **Teste de Performance**
   - Core Web Vitals
   - Tempo de carregamento
   - Métricas de rede

2. **Teste de Responsividade**
   - Mobile (375x667)
   - Tablet (768x1024)
   - Desktop (1920x1080)

3. **Teste de Acessibilidade**
   - Validação WCAG
   - Screen readers
   - Navegação por teclado

4. **Teste de Pagamento**
   - Fluxo completo
   - Métodos de pagamento
   - Validação de dados

### Melhorias no Código

1. **Page Objects**
```javascript
class StorePage {
  constructor(page) {
    this.page = page;
  }
  
  async selectProduct(productName) {
    await this.page.click(`[data-product="${productName}"]`);
  }
}
```

2. **Fixtures de Dados**
```javascript
const testData = {
  customer: {
    name: 'João Silva',
    phone: '11999887766',
    // ...
  }
};
```

3. **Execução Paralela**
```javascript
// Testar múltiplas lojas simultaneamente
const tests = stores.map(store => testStore(store));
await Promise.all(tests);
```

## 📞 Suporte

### Comandos Úteis
```bash
# Verificar status dos serviços
npm run test:e2e:setup

# Recriar dados de teste
npm run seed:test

# Teste rápido
node tests/e2e/quick-test.js

# Limpeza de dados
cd delivery-back && npx prisma migrate reset
```

### Estrutura de Arquivos
```
delivery-app/
├── tests/e2e/
│   ├── buyer-experience.test.js    # Teste principal
│   ├── quick-test.js               # Teste rápido
│   ├── screenshots/                # Screenshots
│   ├── reports/                    # Relatórios JSON
│   └── README.md                   # Documentação
├── scripts/
│   └── setup-test-environment.js   # Setup automático
└── docs/
    └── e2e-testing-guide.md        # Este arquivo
```

### Logs e Debugging
- **Console do navegador**: Capturado automaticamente
- **Erros de página**: Salvos nos relatórios
- **Screenshots**: Tirados em cada etapa importante
- **Relatórios JSON**: Dados completos para análise

---

## 🎉 Resumo

Você agora tem um sistema completo de testes E2E que:

✅ **Popula o banco** com dados realistas de 4 lojas  
✅ **Testa a jornada completa** do comprador  
✅ **Gera relatórios detalhados** com screenshots  
✅ **Funciona em modo visual** para desenvolvimento  
✅ **Funciona em modo headless** para CI/CD  
✅ **É configurável** via variáveis de ambiente  
✅ **Documenta problemas** automaticamente  

**Para começar agora:**
```bash
npm run test:e2e:setup  # Configura tudo
npm run test:e2e:buyer  # Executa os testes
```

🚀 **Happy Testing!**
