# 🚀 Guia de Início - Sistema de Delivery Multi-Tenant

## 📋 Bem-vindo ao seu Sistema de Delivery!

Este é um sistema completo de delivery que permite criar e gerenciar múltiplas lojas de forma independente. Cada loja tem sua própria identidade visual, cardápio, configurações e dashboard administrativo.

---

## 🌐 Estrutura de URLs do Sistema

### **Para Clientes (Público)**
| URL | Descrição | Exemplo |
|-----|-----------|---------|
| `/loja/[slug-da-loja]` | Cardápio público da loja | `meusite.com/loja/pizzaria-do-joão` |

### **Para Proprietários (Administrativo)**
| URL | Descrição | Acesso |
|-----|-----------|--------|
| `/login/lojista` | Login do proprietário | Público |
| `/dashboard/[slug-da-loja]` | Painel administrativo | Privado |
| `/dashboard/[slug-da-loja]/produtos` | Gestão de produtos | Privado |
| `/dashboard/[slug-da-loja]/configuracoes` | Configurações da loja | Privado |

---

## 🏪 Como Criar sua Primeira Loja

### **Passo 1: Criar o Arquivo de Configuração**

1. **Navegue até:** `config/stores/`
2. **Copie o arquivo exemplo:**
   ```bash
   cp config/stores/boteco-do-joao.json config/stores/minha-loja.json
   ```

3. **Edite o arquivo com suas informações:**
   ```json
   {
     "slug": "minha-loja",
     "name": "Minha Loja Delivery",
     "description": "A melhor comida da cidade"
   }
   ```

### **Passo 2: Personalizar sua Loja**

```json
{
  "branding": {
    "logo": "/assets/stores/minha-loja/logo.png",
    "primaryColor": "#e53e3e",
    "secondaryColor": "#c53030",
    "backgroundColor": "#fff5f5",
    "textColor": "#1a202c",
    "accentColor": "#fc8181"
  }
}
```

### **Passo 3: Configurar Informações de Contato**

```json
{
  "business": {
    "phone": "(11) 99999-9999",
    "email": "contato@minhaloja.com",
    "socialMedia": {
      "instagram": "@minhaloja",
      "whatsapp": "5511999999999"
    }
  }
}
```

---

## 🔐 Como Acessar o Dashboard

### **1. Fazer Login**
- **Acesse:** `/login/lojista`
- **Insira:**
  - Email do proprietário
  - Senha
  - Slug da loja (ex: `minha-loja`)

### **2. Dashboard Principal**
- **URL:** `/dashboard/minha-loja`
- **Funcionalidades:**
  - Visão geral das vendas
  - Pedidos em tempo real
  - Métricas de performance
  - Ações rápidas

---

## 🍔 Gestão de Produtos e Cardápio

### **Estrutura do Cardápio**

O cardápio é organizado em:
- **Categorias** (ex: Pizzas, Bebidas)
- **Produtos** (com foto, preço, descrição)
- **Adicionais** (extras que o cliente pode escolher)

### **Exemplo de Produto:**

```json
{
  "id": "pizza-margherita",
  "name": "Pizza Margherita",
  "description": "Pizza clássica com molho, mussarela e manjericão",
  "price": 32.90,
  "image": "https://exemplo.com/pizza.jpg",
  "category": "pizzas",
  "ingredients": ["Molho de tomate", "Mussarela", "Manjericão"],
  "active": true,
  "addons": [
    {
      "id": "queijo-extra",
      "name": "Queijo extra",
      "price": 4.00
    }
  ]
}
```

### **Como Adicionar Produtos**

1. **Acesse:** `/dashboard/minha-loja/produtos`
2. **Clique em:** "Adicionar Produto"
3. **Preencha:**
   - Nome e descrição
   - Preço
   - Categoria
   - Ingredientes
   - Adicionais disponíveis

---

## 🎨 Personalização Visual

### **Cores da Marca**

Você pode personalizar 5 cores principais:

```json
{
  "branding": {
    "primaryColor": "#e53e3e",    // Cor principal (botões, destaques)
    "secondaryColor": "#c53030",  // Cor secundária
    "backgroundColor": "#fff5f5", // Fundo da página
    "textColor": "#1a202c",      // Cor do texto
    "accentColor": "#fc8181"     // Cor de destaque (badges, notificações)
  }
}
```

### **Logo e Imagens**

1. **Logo:** Adicione em `/assets/stores/minha-loja/logo.png`
2. **Banner:** Opcional, para destaque na página inicial
3. **Favicon:** Ícone que aparece na aba do navegador

### **Preview em Tempo Real**

- Faça mudanças no arquivo de configuração
- Recarregue `/loja/minha-loja` para ver as alterações

---

## 🚚 Configurações de Entrega

### **Configurar Área de Entrega**

```json
{
  "delivery": {
    "enabled": true,
    "radius": 5,              // Raio em km
    "fee": 5.00,             // Taxa padrão
    "freeDeliveryMinimum": 30.00, // Frete grátis acima de
    "estimatedTime": 45,     // Tempo estimado em minutos
    "areas": [
      {
        "id": "centro",
        "name": "Centro",
        "fee": 3.00,           // Taxa específica da área
        "estimatedTime": 30
      }
    ]
  }
}
```

### **Horário de Funcionamento**

```json
{
  "schedule": {
    "workingHours": {
      "monday": {
        "open": false,         // Fechado segunda
        "hours": []
      },
      "tuesday": {
        "open": true,
        "hours": [
          {
            "start": "18:00",
            "end": "23:30"
          }
        ]
      }
    },
    "closedMessage": "Estamos fechados no momento!"
  }
}
```

---

## 💳 Métodos de Pagamento

### **Configurar Pagamentos**

```json
{
  "payments": {
    "pix": true,           // Aceita PIX
    "cash": true,          // Dinheiro na entrega
    "card": true,          // Cartão na entrega
    "online": false,       // Pagamento online (requer integração)
    "integrations": {
      "stripe": {          // Para pagamento online
        "publicKey": "pk_test_...",
        "secretKey": "sk_test_..."
      }
    }
  }
}
```

---

## 🎯 Exemplos Práticos

### **Exemplo 1: Pizzaria**

```json
{
  "slug": "pizzaria-bella",
  "name": "Pizzaria Bella Napoli",
  "description": "Pizzas artesanais com massa tradicional italiana",
  "branding": {
    "primaryColor": "#d32f2f",
    "secondaryColor": "#b71c1c",
    "backgroundColor": "#ffebee"
  },
  "delivery": {
    "enabled": true,
    "fee": 6.00,
    "freeDeliveryMinimum": 40.00
  }
}
```

### **Exemplo 2: Hamburgueria**

```json
{
  "slug": "burger-house",
  "name": "Burger House",
  "description": "Os melhores burgers artesanais da cidade",
  "branding": {
    "primaryColor": "#ff6f00",
    "secondaryColor": "#e65100",
    "backgroundColor": "#fff3e0"
  },
  "delivery": {
    "enabled": true,
    "fee": 4.50,
    "estimatedTime": 35
  }
}
```

### **Exemplo 3: Lanchonete Saudável**

```json
{
  "slug": "vida-saudavel",
  "name": "Vida Saudável",
  "description": "Alimentação natural e nutritiva",
  "branding": {
    "primaryColor": "#2e7d32",
    "secondaryColor": "#1b5e20",
    "backgroundColor": "#e8f5e8"
  },
  "delivery": {
    "enabled": true,
    "fee": 5.00,
    "freeDeliveryMinimum": 25.00
  }
}
```

---

## 📱 URLs de Acesso Rápido

### **Para sua Loja:**
- **Cardápio Público:** `meusite.com/loja/minha-loja`
- **Login Admin:** `meusite.com/login/lojista`
- **Dashboard:** `meusite.com/dashboard/minha-loja`

### **Para Configurações:**
- **Produtos:** `meusite.com/dashboard/minha-loja/produtos`
- **Visual:** `meusite.com/dashboard/minha-loja/configuracoes/visual`
- **Entrega:** `meusite.com/dashboard/minha-loja/configuracoes/entrega`

---

## 🔧 Configurações Avançadas

### **Cupons de Desconto**

```json
{
  "promotions": {
    "coupons": [
      {
        "code": "BEMVINDO10",
        "name": "Primeira Compra",
        "type": "percentage",
        "value": 10,
        "minimumValue": 20.00,
        "validUntil": "2024-12-31"
      }
    ]
  }
}
```

### **Programa de Fidelidade**

```json
{
  "promotions": {
    "loyaltyProgram": {
      "enabled": true,
      "pointsPerReal": 1,     // 1 ponto por real gasto
      "pointsToReal": 100     // 100 pontos = R$ 1,00
    }
  }
}
```

### **Templates de WhatsApp**

```json
{
  "settings": {
    "whatsappTemplate": "Olá! Gostaria de fazer um pedido na Pizzaria Bella. 🍕",
    "preparationTime": 25    // Tempo médio de preparo
  }
}
```

---

## 🆘 Resolução de Problemas

### **Problema: Loja não aparece**
- ✅ Verifique se o arquivo de configuração está na pasta correta
- ✅ Confirme se o slug está correto na URL
- ✅ Verifique se o JSON está formatado corretamente

### **Problema: Não consigo fazer login**
- ✅ Verifique email e senha
- ✅ Confirme se o slug da loja está correto
- ✅ Tente limpar cache do navegador

### **Problema: Cores não mudam**
- ✅ Recarregue a página com Ctrl+F5
- ✅ Verifique se as cores estão no formato hexadecimal (#ff0000)
- ✅ Confirme se salvou o arquivo de configuração

### **Problema: Produtos não aparecem**
- ✅ Verifique se `"active": true` está configurado
- ✅ Confirme se a categoria existe
- ✅ Verifique se o JSON está válido

---

## 📞 Suporte e Contato

### **Para Suporte Técnico:**
- 📧 Email: suporte@sistema.com
- 📱 WhatsApp: (11) 99999-9999
- 🕐 Horário: Segunda a Sexta, 9h às 18h

### **Documentação Adicional:**
- 📚 [Guia Técnico Completo](README.md)
- 🎨 [Guia de Design](DESIGN_GUIDE.md)
- 🚀 [Deploy em Produção](DEPLOY_MULTI_TENANT.md)

---

## ✅ Checklist de Lançamento

### **Antes de ir ao ar:**
- [ ] ✅ Arquivo de configuração criado
- [ ] ✅ Logo da loja adicionado
- [ ] ✅ Cores personalizadas definidas
- [ ] ✅ Cardápio completo cadastrado
- [ ] ✅ Horário de funcionamento configurado
- [ ] ✅ Área de entrega definida
- [ ] ✅ Métodos de pagamento configurados
- [ ] ✅ Telefone e WhatsApp atualizados
- [ ] ✅ Teste de pedido realizado

### **Após o lançamento:**
- [ ] ✅ Divulgar URL da loja
- [ ] ✅ Treinar equipe no dashboard
- [ ] ✅ Configurar notificações
- [ ] ✅ Acompanhar primeiros pedidos

---

**🎉 Parabéns! Sua loja está pronta para receber pedidos!**

> 💡 **Dica:** Mantenha sempre uma cópia de backup do seu arquivo de configuração antes de fazer alterações importantes.