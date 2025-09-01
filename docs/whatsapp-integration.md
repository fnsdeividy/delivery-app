# Integração WhatsApp Business

Esta documentação explica como configurar e usar a integração com WhatsApp Business no sistema de delivery.

## Visão Geral

A integração WhatsApp permite:
- Envio automático de mensagens para clientes
- Notificações de status de pedidos
- Mensagens de boas-vindas
- Templates personalizáveis
- Webhook para receber mensagens

## Configuração Inicial

### 1. Configurar WhatsApp Business API

1. Acesse o [Facebook Developers](https://developers.facebook.com/)
2. Crie uma aplicação do tipo "Business"
3. Adicione o produto "WhatsApp Business API"
4. Configure sua conta comercial
5. Obtenha o Token de Acesso e ID da Conta Comercial

### 2. Configurar no Sistema

1. Acesse: `Dashboard > Configurações > Integração WhatsApp`
2. Preencha os campos obrigatórios:
   - **Número do WhatsApp Business**: Número no formato internacional (+5511999999999)
   - **ID da Conta Comercial**: ID fornecido pelo Facebook
   - **Token de Acesso**: Token de acesso da API
3. Configure o webhook (opcional):
   - **URL do Webhook**: `https://seu-dominio.com/api/stores/{storeSlug}/whatsapp/webhook`
   - **Segredo do Webhook**: Chave secreta para validação

### 3. Testar a Conexão

Use o botão "Testar Conexão" para verificar se as configurações estão corretas.

## Templates de Mensagem

### Tipos Disponíveis

1. **Mensagem de Boas-vindas**: Enviada quando um novo cliente inicia conversa
2. **Confirmação de Pedido**: Enviada quando um pedido é confirmado
3. **Pedido Pronto**: Enviada quando o pedido está pronto para retirada/entrega
4. **Pedido Entregue**: Enviada quando o pedido é entregue
5. **Pedido Cancelado**: Enviada quando um pedido é cancelado

### Variáveis Disponíveis

Use as seguintes variáveis nos templates:

- `{{businessName}}`: Nome da empresa
- `{{businessAddress}}`: Endereço da empresa
- `{{orderNumber}}`: Número do pedido
- `{{total}}`: Valor total do pedido
- `{{estimatedTime}}`: Tempo estimado de entrega
- `{{reason}}`: Motivo do cancelamento (apenas para pedidos cancelados)

### Exemplo de Template

```
Olá! Bem-vindo(a) à {{businessName}}! 🎉

Seu pedido #{{orderNumber}} foi confirmado!
Total: R$ {{total}}
Tempo estimado: {{estimatedTime}} minutos

Obrigado por escolher a {{businessName}}!
```

## Configurações Avançadas

### Envio Automático
- **Envio Automático de Mensagens**: Ativa/desativa envio automático
- **Notificações de Pedidos**: Controla notificações de status
- **Mensagens para Clientes**: Permite envio direto para clientes

### Delay entre Mensagens
Configure um delay (em segundos) entre o envio de mensagens para evitar spam.

### Consentimento do Cliente
- **Requer Consentimento**: Cliente deve autorizar recebimento de mensagens
- **Mensagem de Consentimento**: Texto da mensagem de autorização

## API Endpoints

### Backend

#### GET `/stores/{slug}/whatsapp/config`
Busca configurações do WhatsApp da loja.

#### PATCH `/stores/{slug}/whatsapp/config`
Atualiza configurações do WhatsApp.

```json
{
  "whatsapp": {
    "enabled": true,
    "phoneNumber": "+5511999999999",
    "businessAccountId": "123456789012345",
    "accessToken": "EAAxxxxxxxxxxxxxxxxxxxxx",
    "autoSendMessages": true,
    "sendOrderNotifications": true
  }
}
```

#### POST `/stores/{slug}/whatsapp/test-connection`
Testa a conexão com a API do WhatsApp.

#### POST `/stores/{slug}/whatsapp/send-message`
Envia uma mensagem via WhatsApp.

```json
{
  "to": "+5511999999999",
  "type": "welcome",
  "message": "Olá! Como podemos ajudar?",
  "variables": {
    "businessName": "Minha Loja"
  }
}
```

#### GET `/stores/{slug}/whatsapp/templates`
Busca templates de mensagem da loja.

#### POST `/stores/{slug}/whatsapp/webhook`
Endpoint para receber webhooks do WhatsApp (sem autenticação JWT).

### Frontend

#### Hook `useWhatsAppConfig`

```typescript
const { 
  config, 
  loading, 
  error, 
  updateConfig, 
  testConnection, 
  sendMessage, 
  getTemplates 
} = useWhatsAppConfig(storeSlug);
```

## Webhook do WhatsApp

### Configuração no Facebook

1. Acesse sua aplicação no Facebook Developers
2. Vá para WhatsApp > Configuration
3. Configure a URL do webhook: `https://seu-dominio.com/api/stores/{storeSlug}/whatsapp/webhook`
4. Configure o token de verificação
5. Inscreva-se nos eventos desejados

### Eventos Suportados

- `message`: Mensagem recebida
- `message_status`: Status de mensagem enviada

### Estrutura do Webhook

```json
{
  "id": "wamid.xxx",
  "timestamp": "1234567890",
  "type": "message",
  "from": "5511999999999",
  "to": "5511888888888",
  "message": {
    "id": "wamid.xxx",
    "type": "text",
    "text": {
      "body": "Olá!"
    }
  }
}
```

## Segurança

### Validação de Webhook
O sistema valida a assinatura do webhook usando o segredo configurado.

### Permissões
Apenas administradores da loja podem:
- Configurar a integração
- Enviar mensagens
- Acessar logs

### Dados Sensíveis
- Tokens são armazenados de forma segura
- Logs não expõem informações sensíveis
- Webhooks são validados antes do processamento

## Troubleshooting

### Erro de Conexão
1. Verifique se o token de acesso está correto
2. Confirme se o ID da conta comercial está correto
3. Teste a conexão usando o botão no painel

### Mensagens Não Enviadas
1. Verifique se a integração está ativada
2. Confirme se o tipo de mensagem está permitido
3. Verifique se o template está habilitado
4. Confirme se o número de destino está no formato correto

### Webhook Não Funciona
1. Verifique se a URL está acessível publicamente
2. Confirme se o segredo está configurado corretamente
3. Verifique os logs do servidor para erros

## Limitações

- Máximo de 1000 mensagens por dia (limite do WhatsApp)
- Mensagens devem seguir as políticas do WhatsApp
- Templates devem ser aprovados pelo WhatsApp (para mensagens comerciais)
- Rate limit de 80 mensagens por segundo

## Suporte

Para dúvidas ou problemas:
1. Consulte esta documentação
2. Verifique os logs do sistema
3. Entre em contato com o suporte técnico
