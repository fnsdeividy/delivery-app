# 📱 Guia de Configuração do WhatsApp Business

## O que é necessário?

Para integrar o WhatsApp ao seu sistema de delivery, você precisa de 3 informações principais:

### 1. 🔑 **Token de Acesso (Access Token)**

Este é o token fornecido pelo Facebook/Meta que permite seu sistema enviar mensagens pelo WhatsApp.

**Como obter:**
1. Acesse [Meta for Developers](https://developers.facebook.com/)
2. Crie ou acesse seu App
3. Adicione o produto "WhatsApp Business"
4. Na seção "API Setup", você encontrará o token
5. Para produção, crie um token permanente em "System Users"

**Formato:** `EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` (cerca de 200 caracteres)

### 2. 📱 **Número de Telefone WhatsApp Business**

O número de telefone que você configurou na plataforma WhatsApp Business.

**Formato:** `+5511999999999` (formato internacional com código do país)

**Exemplo:**
- ✅ Correto: `+5511987654321`
- ❌ Errado: `(11) 98765-4321`
- ❌ Errado: `11987654321`

### 3. 🏢 **ID da Conta Comercial (Business Account ID)**

Identificador único da sua conta comercial do WhatsApp.

**Formato:** `123456789012345` (apenas números)

**Onde encontrar:**
- No painel do WhatsApp Business API
- Geralmente exibido junto ao nome da conta

## 📋 Passo a Passo de Configuração

### No Sistema Cardap.IO

1. **Acesse o Dashboard**
   - Faça login no sistema
   - Selecione sua loja

2. **Vá para Configurações do WhatsApp**
   ```
   Dashboard → Configurações → WhatsApp
   ```

3. **Preencha os Campos Obrigatórios**
   - **Número do WhatsApp Business:** Seu número no formato internacional
   - **ID da Conta Comercial:** O ID fornecido pelo Meta
   - **Token de Acesso:** O token gerado no Meta for Developers

4. **Configure as Opções**
   - ✅ Ativar integração WhatsApp
   - ✅ Envio automático de mensagens
   - ✅ Notificações de pedidos
   - ✅ Mensagens para clientes

5. **Teste a Conexão**
   - Clique em "Testar Conexão"
   - Aguarde a confirmação
   - Se houver erro, verifique as credenciais

6. **Personalize os Templates**
   - Acesse a aba "Templates"
   - Edite as mensagens conforme sua marca
   - Use as variáveis disponíveis: `{{orderNumber}}`, `{{businessName}}`, etc.

## 🎯 Mensagens Automáticas Disponíveis

### 1. 🎉 Boas-vindas
Enviada quando um cliente inicia conversa pela primeira vez.

### 2. ✅ Confirmação de Pedido
```
Pedido confirmado! ✅

Número do pedido: #{{orderNumber}}
Total: R$ {{total}}

Seu pedido está sendo preparado e será entregue em aproximadamente {{estimatedTime}} minutos.

Obrigado por escolher a {{businessName}}!
```

### 3. 🍕 Pedido Pronto
```
Seu pedido está pronto! 🍕

Pedido #{{orderNumber}} está pronto para retirada/entrega.

{{businessName}}
{{businessAddress}}
```

### 4. 🚚 Pedido Entregue
```
Pedido entregue! 🚚

Seu pedido #{{orderNumber}} foi entregue com sucesso!

Esperamos que tenha gostado!

{{businessName}}
```

### 5. ❌ Pedido Cancelado
```
Pedido cancelado ❌

Seu pedido #{{orderNumber}} foi cancelado.

Motivo: {{reason}}

Se você não solicitou este cancelamento, entre em contato conosco.

{{businessName}}
```

## 🔧 Variáveis Disponíveis

Use estas variáveis nos templates para personalizar as mensagens:

- `{{orderNumber}}` - Número do pedido
- `{{customerName}}` - Nome do cliente
- `{{total}}` - Valor total do pedido
- `{{estimatedTime}}` - Tempo estimado de entrega
- `{{businessName}}` - Nome da sua loja
- `{{businessAddress}}` - Endereço da loja
- `{{businessPhone}}` - Telefone da loja
- `{{reason}}` - Motivo do cancelamento

## ⚠️ Erros Comuns e Soluções

### ❌ "Token de acesso é obrigatório"
**Problema:** O campo Token de Acesso está vazio ou inválido.

**Solução:**
1. Verifique se você copiou o token completo
2. Certifique-se que não há espaços antes ou depois
3. Verifique se o token não expirou (use token permanente para produção)

### ❌ "ID da conta comercial é obrigatório"
**Problema:** O campo Business Account ID está vazio.

**Solução:**
1. Acesse o painel do Meta for Developers
2. Copie o ID da conta comercial
3. Cole apenas os números, sem espaços

### ❌ "Formato do número de telefone inválido"
**Problema:** O número não está no formato internacional correto.

**Solução:**
1. Use o formato: `+[código do país][DDD][número]`
2. Exemplo para Brasil: `+5511987654321`
3. Remova todos os espaços, parênteses e hífens

### ❌ "Erro na API do WhatsApp"
**Problema:** As credenciais estão incorretas ou a conta não está ativa.

**Solução:**
1. Verifique se o token é válido e não expirou
2. Confirme que o Business Account ID está correto
3. Verifique se o número de telefone está ativo no WhatsApp Business
4. Certifique-se que seu app no Meta está em produção

## 🚀 Próximos Passos

Após configurar o WhatsApp:

1. **Faça um Pedido de Teste**
   - Crie um pedido teste na sua loja
   - Verifique se a mensagem foi enviada
   - Confirme o recebimento no WhatsApp

2. **Monitore os Envios**
   - Acompanhe as mensagens enviadas
   - Verifique a taxa de entrega
   - Ajuste os templates se necessário

3. **Otimize os Templates**
   - Teste diferentes mensagens
   - Peça feedback dos clientes
   - Ajuste o tom conforme sua marca

## 📚 Recursos Adicionais

- [Documentação oficial do WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)
- [Como criar templates de mensagem](https://developers.facebook.com/docs/whatsapp/business-management-api/message-templates)
- [Políticas do WhatsApp Business](https://www.whatsapp.com/legal/business-policy)

## 💡 Dicas Importantes

✅ **Sempre teste primeiro** - Use o botão "Testar Conexão" antes de ativar

✅ **Personalize as mensagens** - Ajuste o tom para combinar com sua marca

✅ **Obtenha consentimento** - Certifique-se que os clientes aceitam receber mensagens

✅ **Monitore os limites** - O WhatsApp tem limites de mensagens por dia

✅ **Use token permanente** - Para produção, não use token temporário

❌ **Não envie spam** - Envie apenas mensagens relevantes

❌ **Não compartilhe o token** - Mantenha suas credenciais seguras

❌ **Não ignore erros** - Se algo não funcionar, verifique os logs

## 🆘 Precisa de Ajuda?

Se ainda tiver dúvidas:

1. Verifique a documentação no arquivo `WHATSAPP_SETUP.md` no backend
2. Consulte a [documentação oficial do Meta](https://developers.facebook.com/docs/whatsapp)
3. Entre em contato com o suporte técnico

---

**Última atualização:** Outubro 2025

