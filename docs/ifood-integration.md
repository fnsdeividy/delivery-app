# Integração iFood - Documentação Completa

## 📋 Visão Geral

A integração com o iFood permite que sua loja sincronize automaticamente produtos, receba pedidos e gerencie o fluxo de trabalho diretamente do sistema de delivery. Esta integração oferece uma solução completa para restaurantes e estabelecimentos que desejam expandir suas vendas através da plataforma iFood.

## 🚀 Funcionalidades Principais

### 1. **Sincronização de Menu**
- Envio automático de produtos para o iFood
- Sincronização de preços e disponibilidade
- Gerenciamento de categorias
- Controle de produtos excluídos

### 2. **Gestão de Pedidos**
- Recebimento automático de pedidos do iFood
- Atualização de status em tempo real
- Sincronização bidirecional de pedidos
- Controle de tempo de preparo e entrega

### 3. **Configurações Avançadas**
- Modo sandbox para testes
- Webhooks para atualizações em tempo real
- Configurações personalizadas por loja
- Validação automática de credenciais

## 🔧 Configuração Inicial

### Pré-requisitos
1. Conta ativa no iFood para Restaurantes
2. Credenciais de API (Client ID, Client Secret)
3. Merchant ID e Store ID
4. Acesso à API do iFood

### Passos de Configuração

#### 1. Obter Credenciais do iFood
```bash
# Acesse o painel do iFood para Restaurantes
# Vá em Configurações > API
# Gere suas credenciais de acesso
```

#### 2. Configurar no Sistema
1. Acesse: `Dashboard > Configurações > Integração iFood`
2. Preencha as credenciais obrigatórias:
   - **Client ID**: Seu identificador de cliente
   - **Client Secret**: Sua chave secreta
   - **Merchant ID**: ID do seu estabelecimento
   - **Store ID**: ID da sua loja

#### 3. Configurações de Negócio
- Nome da empresa
- CNPJ
- Endereço completo
- Telefone de contato
- Email
- Horário de funcionamento

## ⚙️ Configurações Avançadas

### Tipos de Integração

#### **Integração Completa**
- Sincroniza menu e pedidos automaticamente
- Ideal para estabelecimentos com alta demanda

#### **Sincronização de Pedidos**
- Apenas recebe pedidos do iFood
- Menu gerenciado manualmente

#### **Sincronização de Menu**
- Apenas envia produtos para o iFood
- Pedidos gerenciados manualmente

### Configurações de Menu

#### **Sincronização Automática**
```json
{
  "autoSync": true,
  "syncInterval": 30, // minutos
  "syncPrices": true,
  "syncAvailability": true,
  "syncCategories": true
}
```

#### **Produtos Excluídos**
- Lista de categorias não sincronizadas
- Lista de produtos específicos excluídos
- Controle granular de sincronização

### Configurações de Pedidos

#### **Automação**
```json
{
  "autoAccept": false,
  "autoConfirm": false,
  "maxPreparationTime": 45, // minutos
  "maxDeliveryTime": 60, // minutos
  "syncOrderStatus": true,
  "sendNotifications": true
}
```

#### **Configurações de Entrega**
- Valor mínimo do pedido
- Taxa de entrega
- Métodos de pagamento aceitos
- Tempos de preparo e entrega

## 🔌 API Endpoints

### Configurações
```typescript
// Buscar configurações
GET /stores/{slug}/ifood/config

// Atualizar configurações
PATCH /stores/{slug}/ifood/config

// Buscar status
GET /stores/{slug}/ifood/status
```

### Sincronização
```typescript
// Sincronizar produtos
POST /stores/{slug}/ifood/sync-products

// Sincronizar pedidos
POST /stores/{slug}/ifood/sync-orders

// Testar conexão
POST /stores/{slug}/ifood/test-connection
```

### Webhooks
```typescript
// Receber eventos do iFood
POST /stores/{slug}/ifood/webhook
```

## 📊 Monitoramento e Status

### Status de Sincronização
- **Ativo**: Integração funcionando normalmente
- **Erro**: Problema na sincronização
- **Sincronizando**: Processo em andamento
- **Desabilitado**: Integração inativa

### Logs e Histórico
- Última sincronização
- Quantidade de produtos sincronizados
- Quantidade de pedidos recebidos
- Erros e avisos

## 🧪 Testes e Validação

### Teste de Conexão
1. Acesse a aba "Teste de Conexão"
2. Verifique se as credenciais estão corretas
3. Execute o teste de conectividade
4. Valide a resposta da API

### Teste de Sincronização
1. Configure alguns produtos de teste
2. Execute sincronização manual
3. Verifique se aparecem no iFood
4. Teste recebimento de pedidos

## 🚨 Solução de Problemas

### Erros Comuns

#### **Credenciais Inválidas**
```
Erro: Client ID e Client Secret são obrigatórios
Solução: Verifique se as credenciais estão corretas
```

#### **Falha na Conexão**
```
Erro: Não foi possível obter token de acesso
Solução: Verifique se a API do iFood está acessível
```

#### **Produtos Não Sincronizados**
```
Erro: Produto não encontrado no iFood
Solução: Verifique se o produto está ativo e com preço válido
```

### Verificações de Diagnóstico

1. **Status da API**
   - Verifique se o iFood está online
   - Teste conectividade de rede

2. **Configurações**
   - Valide credenciais
   - Verifique permissões da API

3. **Produtos**
   - Confirme se estão ativos
   - Verifique preços e disponibilidade

4. **Webhooks**
   - Teste recebimento de eventos
   - Verifique configuração de URL

## 🔒 Segurança

### Autenticação
- JWT tokens para acesso ao sistema
- Validação de permissões por loja
- Credenciais criptografadas

### Webhooks
- Validação de assinatura (opcional)
- Rate limiting para proteção
- Logs de auditoria

### Dados Sensíveis
- Credenciais nunca expostas no frontend
- Comunicação HTTPS obrigatória
- Validação de entrada rigorosa

## 📈 Melhores Práticas

### 1. **Configuração Inicial**
- Use modo sandbox para testes
- Configure webhooks para atualizações em tempo real
- Defina intervalos de sincronização apropriados

### 2. **Gestão de Produtos**
- Mantenha produtos organizados por categoria
- Atualize preços regularmente
- Monitore disponibilidade de estoque

### 3. **Gestão de Pedidos**
- Configure tempos realistas de preparo
- Implemente notificações automáticas
- Mantenha status atualizados

### 4. **Monitoramento**
- Verifique logs regularmente
- Monitore status de sincronização
- Configure alertas para erros

## 🔄 Atualizações e Manutenção

### Versões da API
- Suporte à versão mais recente da API do iFood
- Atualizações automáticas de segurança
- Compatibilidade com versões anteriores

### Backup e Recuperação
- Backup automático das configurações
- Histórico de alterações
- Restauração de configurações anteriores

## 📞 Suporte

### Documentação
- Guias de configuração
- Exemplos de uso
- FAQ e solução de problemas

### Contato
- Suporte técnico disponível
- Comunidade de desenvolvedores
- Atualizações e novidades

## 📝 Changelog

### v1.0.0 (Atual)
- Integração completa com iFood
- Sincronização automática de menu
- Gestão de pedidos em tempo real
- Interface de configuração completa
- Sistema de webhooks
- Modo sandbox para testes

### Próximas Versões
- Dashboard de analytics
- Relatórios de sincronização
- Integração com outros marketplaces
- API pública para desenvolvedores

---

**Última atualização**: Dezembro 2024  
**Versão**: 1.0.0  
**Compatibilidade**: iFood API v2+
