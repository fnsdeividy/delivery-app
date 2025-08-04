# ⚡ Quick Start - Sistema de Delivery

## 🚀 URLs para Testar

### **Demo da Loja**
```
http://localhost:3000/loja/boteco-do-joao
```
- Cardápio público do "Boteco do João"
- Interface personalizada com cores da marca
- Produtos, categorias e sistema de busca

### **Dashboard Administrativo**
```
http://localhost:3000/login/lojista
```

**Credenciais Demo:**
- **Email:** `admin@boteco.com`
- **Senha:** `123456`
- **Loja:** `boteco-do-joao`

---

## 🏪 Criar Sua Primeira Loja (2 minutos)

### **1. Copiar Arquivo de Configuração**
```bash
cp config/stores/boteco-do-joao.json config/stores/minha-loja.json
```

### **2. Editar Configurações Básicas**
Abra `config/stores/minha-loja.json` e altere:

```json
{
  "slug": "minha-loja",
  "name": "Minha Loja Delivery",
  "description": "A melhor comida da região",
  "branding": {
    "primaryColor": "#e53e3e",
    "secondaryColor": "#c53030",
    "backgroundColor": "#fff5f5"
  },
  "business": {
    "phone": "(11) 99999-9999",
    "email": "contato@minhaloja.com"
  }
}
```

### **3. Acessar sua Nova Loja**
```
http://localhost:3000/loja/minha-loja
```

---

## 🎨 Personalização Rápida

### **Mudar Cores**
```json
{
  "branding": {
    "primaryColor": "#1a365d",    // Azul
    "secondaryColor": "#2d3748",  // Cinza escuro
    "backgroundColor": "#f7fafc", // Fundo claro
    "textColor": "#1a202c",      // Texto escuro
    "accentColor": "#3182ce"     // Destaque azul
  }
}
```

### **Exemplos de Paletas:**

**🍕 Pizzaria (Vermelho)**
```json
"primaryColor": "#d32f2f"
"secondaryColor": "#b71c1c"
"backgroundColor": "#ffebee"
```

**🍔 Hamburgueria (Laranja)**
```json
"primaryColor": "#ff6f00"
"secondaryColor": "#e65100" 
"backgroundColor": "#fff3e0"
```

**🥗 Saudável (Verde)**
```json
"primaryColor": "#2e7d32"
"secondaryColor": "#1b5e20"
"backgroundColor": "#e8f5e8"
```

---

## 📱 Funcionalidades Prontas

✅ **Sistema Multi-Tenant** - Múltiplas lojas independentes  
✅ **Dashboard Administrativo** - Painel completo  
✅ **Personalização Visual** - Cores, logo, banner  
✅ **Gestão de Produtos** - Cardápio completo  
✅ **Sistema de Entrega** - Áreas, taxas, horários  
✅ **Animações Suaves** - Interface moderna  
✅ **Responsivo** - Mobile, tablet, desktop  
✅ **API REST** - Configurações via API  

---

## 🔧 API de Configuração

### **Buscar Configurações**
```bash
curl http://localhost:3000/api/stores/minha-loja/config
```

### **Atualizar Cor Primária**
```bash
curl -X PUT http://localhost:3000/api/stores/minha-loja/config \
  -H "Content-Type: application/json" \
  -d '{"branding": {"primaryColor": "#ff6b35"}}'
```

---

## 📚 Próximos Passos

1. **📖 [README_START.md](README_START.md)** - Guia completo para usuários
2. **🏗️ [README.md](README.md)** - Documentação técnica  
3. **🚀 [DEPLOY_MULTI_TENANT.md](DEPLOY_MULTI_TENANT.md)** - Deploy em produção

---

**🎉 Em menos de 2 minutos você tem uma loja delivery completa funcionando!**