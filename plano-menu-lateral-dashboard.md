# Plano: Habilitar Menu Lateral do Dashboard

## Objetivo
Implementar um menu lateral funcional no dashboard que permita navegação entre diferentes seções e acesso aos dados das lojas.

## Estrutura Proposta

### 1. Navegação Principal
- **Dashboard**: Visão geral e estatísticas
- **Minhas Lojas**: Lista de lojas do usuário
- **Gerenciar Lojas**: Administração de lojas (para super admins)
- **Usuários**: Gestão de usuários (para super admins)

### 2. Navegação por Loja
- **Visão Geral**: Dashboard da loja
- **Produtos**: Gestão de produtos
- **Pedidos**: Gestão de pedidos
- **Analytics**: Estatísticas da loja
- **Configurações**: Configurações da loja

### 3. Componentes a Modificar
- `app/(dashboard)/dashboard/layout.tsx` - Layout principal
- `hooks/useStores.ts` - Hook para buscar lojas do usuário
- `contexts/AuthContext.tsx` - Contexto de autenticação
- `components/UserStoreStatus.tsx` - Status do usuário

### 4. Funcionalidades
- Menu lateral responsivo
- Navegação hierárquica
- Seleção de loja ativa
- Breadcrumbs dinâmicos
- Controle de permissões

## Benefícios
- Navegação intuitiva entre seções
- Acesso rápido aos dados das lojas
- Melhor organização da interface
- Experiência de usuário aprimorada

## Implementação
1. Modificar o layout para sempre mostrar o sidebar
2. Criar navegação principal para todas as páginas
3. Implementar seleção de loja ativa
4. Adicionar navegação hierárquica por loja
5. Integrar com sistema de autenticação existente 