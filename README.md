# 🚀 Delivery App - Cardap.IO

Aplicação de delivery completa com sistema de autenticação, gerenciamento de lojas e pedidos.

## ✨ Funcionalidades

- **Sistema de Autenticação**: Login para lojistas e super admins
- **Dashboard de Lojista**: Gerenciamento de produtos, pedidos e configurações
- **Painel Super Admin**: Administração de múltiplas lojas
- **API RESTful**: Backend robusto com NestJS e Prisma
- **Interface Moderna**: UI responsiva com Tailwind CSS e Shadcn UI

## 🔧 Stack Tecnológica

### Frontend
- **Next.js 14** com App Router
- **React 18** com TypeScript
- **Tailwind CSS** para estilização
- **Shadcn UI** para componentes
- **React Query** para gerenciamento de estado
- **Jest** para testes unitários

### Backend
- **NestJS** com TypeScript
- **Prisma ORM** com PostgreSQL
- **JWT** para autenticação
- **Passport.js** para estratégias de auth
- **Swagger** para documentação da API

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- PostgreSQL
- npm ou yarn

### Frontend (delivery-app)
```bash
cd delivery-app
npm install
npm run dev
```

### Backend (delivery-back)
```bash
cd delivery-back
npm install
npm run start:dev
```

## 🔐 Sistema de Autenticação

### ✅ Problemas Corrigidos
- **Redirecionamento após login**: Implementado sistema JWT customizado funcional
- **Middleware de proteção**: Refatorado para trabalhar com JWT ao invés de NextAuth.js
- **Tratamento de status HTTP**: Aceita tanto 200 quanto 201 como sucesso
- **Armazenamento de storeSlug**: Garantido que o token JWT contenha informações necessárias

### 🔑 Fluxo de Autenticação
1. **Login Lojista**: Redireciona para `/dashboard/[storeSlug]`
2. **Login Super Admin**: Redireciona para `/admin`
3. **Proteção de Rotas**: Middleware valida tokens JWT automaticamente
4. **Fallback**: Usuários sem storeSlug são redirecionados para home

### 📱 Páginas de Login
- **Lojista**: `/login/lojista` - Requer email, senha e slug da loja
- **Super Admin**: `/login/super-admin` - Acesso administrativo global
- **Cliente**: `/login` - Acesso público para pedidos

## 🧪 Testes

### Testes Unitários
```bash
npm test                    # Executa todos os testes
npm test -- --watch        # Modo watch
npm test -- useCardapioAuth # Testes específicos
```

### Cobertura de Testes
- ✅ **useCardapioAuth**: Hook de autenticação (7/7 testes passando)
- ✅ **LoadingSpinner**: Componente de loading
- ✅ **Componentes Simples**: Validação de renderização
- ✅ **API Client**: Cliente HTTP e autenticação

## 📁 Estrutura do Projeto

```
delivery-app/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Rotas de autenticação
│   ├── (dashboard)/       # Dashboard de lojistas
│   ├── (store)/           # Loja pública
│   └── (superadmin)/      # Painel super admin
├── components/             # Componentes React reutilizáveis
├── hooks/                  # Hooks customizados
├── lib/                    # Utilitários e configurações
├── types/                  # Definições TypeScript
└── __tests__/             # Testes unitários
```

## 🔧 Configuração

### Variáveis de Ambiente
```bash
# .env.local
NEXT_PUBLIC_CARDAPIO_API_URL=http://localhost:3001/api/v1
```

### Banco de Dados
```bash
# delivery-back/.env
DATABASE_URL="postgresql://user:password@localhost:5432/delivery_app"
JWT_SECRET="your-secret-key"
```

## 🎯 Demonstração

### Credenciais de Teste
```bash
npm run demo
```

**Lojista Demo:**
- Email: `admin@boteco.com`
- Senha: `123456`
- Loja: `boteco-do-joao`

**Super Admin Demo:**
- Email: `superadmin@cardap.io`
- Senha: `admin123`

## 🚀 Deploy

### Docker
```bash
docker build -t delivery-app .
docker run -p 3000:3000 delivery-app
```

### Produção
```bash
npm run build
npm start
```

## 📝 Changelog

### v0.1.0 - Correção de Autenticação
- ✅ **Corrigido**: Redirecionamento após login
- ✅ **Implementado**: Sistema JWT customizado funcional
- ✅ **Refatorado**: Middleware para JWT ao invés de NextAuth.js
- ✅ **Melhorado**: Tratamento de erros e validação
- ✅ **Adicionado**: Testes unitários abrangentes
- ✅ **Documentado**: README atualizado com instruções

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Para suporte e dúvidas:
- Abra uma issue no GitHub
- Consulte a documentação da API
- Verifique os logs de erro no console

---

**Desenvolvido com ❤️ pela equipe Cardap.IO**