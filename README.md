# Delivery App

Uma aplicação moderna de delivery inspirada no design do Figma, construída com Next.js, TypeScript e Tailwind CSS.

## 🚀 Características

- **Interface Moderna**: Design responsivo e intuitivo
- **Performance Otimizada**: Construída com Next.js 14
- **TypeScript**: Código tipado para maior segurança
- **Tailwind CSS**: Estilização moderna e consistente
- **Componentes Reutilizáveis**: Arquitetura limpa e modular
- **Responsivo**: Funciona perfeitamente em todos os dispositivos

## 🛠️ Tecnologias

- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS
- **Lucide React** - Ícones
- **React Hooks** - Gerenciamento de estado

## 📦 Instalação

1. **Clone o repositório**
   ```bash
   git clone <repository-url>
   cd delivery-app
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   ```bash
   cp env.local.example .env.local
   ```
   
   **Importante:** Edite o arquivo `.env.local` com suas configurações reais:
   
   - **Banco de Dados**: Configure sua conexão PostgreSQL
   - **Autenticação**: Gere uma chave secreta para NextAuth
   - **Pagamento**: Adicione suas chaves do Stripe
   - **Email**: Configure SMTP para notificações
   - **Upload**: Configure Cloudinary para imagens
   - **Geocoding**: Adicione sua API key do Google Maps

4. **Execute o projeto**
   ```bash
   npm run dev
   ```

5. **Acesse a aplicação**
   Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## 🔧 Configuração das Variáveis de Ambiente

### Variáveis Obrigatórias para Desenvolvimento:

```env
# Configurações da Aplicação
NEXT_PUBLIC_APP_NAME="Sabor Express"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Autenticação (obrigatório)
NEXTAUTH_SECRET="sua-chave-secreta-aqui"
NEXTAUTH_URL="http://localhost:3000"
```

### Variáveis Opcionais (para funcionalidades avançadas):

```env
# Banco de Dados (para persistência)
DATABASE_URL="postgresql://username:password@localhost:5432/delivery_app"

# Pagamento (para checkout)
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Email (para notificações)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="seu-email@gmail.com"
SMTP_PASS="sua-senha-de-app"

# Upload (para imagens)
CLOUDINARY_CLOUD_NAME="seu-cloud-name"
CLOUDINARY_API_KEY="sua-api-key"
CLOUDINARY_API_SECRET="seu-api-secret"

# Geocoding (para localização)
GOOGLE_MAPS_API_KEY="sua-google-maps-api-key"
```

## 🏗️ Estrutura do Projeto

```
delivery-app/
├── app/
│   ├── globals.css          # Estilos globais
│   ├── layout.tsx           # Layout principal
│   └── page.tsx             # Página inicial
├── components/              # Componentes reutilizáveis
│   ├── Cart.tsx            # Carrinho de compras
│   └── Notification.tsx    # Notificações
├── lib/                     # Utilitários e configurações
├── public/                  # Arquivos estáticos
├── env.local.example        # Exemplo de variáveis de ambiente
├── .env.local              # Suas variáveis de ambiente (não commitado)
├── package.json             # Dependências do projeto
├── tailwind.config.js       # Configuração do Tailwind
└── tsconfig.json           # Configuração do TypeScript
```

## 🎨 Design System

### Cores
- **Primary**: Laranja (#ed7516) - Cor principal da marca
- **Secondary**: Cinza (#64748b) - Cor secundária
- **Background**: Cinza claro (#f8fafc) - Fundo da aplicação

### Tipografia
- **Fonte**: Inter (Google Fonts)
- **Pesos**: 300, 400, 500, 600, 700

### Componentes
- **Cards**: Restaurantes e categorias
- **Botões**: Primário, secundário e outline
- **Inputs**: Barra de pesquisa e formulários
- **Ícones**: Lucide React

## 📱 Funcionalidades

### Página Inicial
- **Header**: Logo e navegação
- **Busca**: Campo de pesquisa funcional
- **Categorias**: Filtros por tipo de comida
- **Produtos**: Grid com cards detalhados
- **Carrinho**: Sidebar deslizante
- **Notificações**: Feedback visual

### Interatividade
- **Busca**: Campo de pesquisa funcional
- **Filtros**: Seleção por categorias
- **Carrinho**: Adicionar/remover produtos
- **Notificações**: Feedback ao adicionar itens
- **Responsividade**: Adaptação para mobile

## 🔧 Scripts Disponíveis

- `npm run dev` - Executa o servidor de desenvolvimento
- `npm run build` - Gera a build de produção
- `npm run start` - Executa a aplicação em produção
- `npm run lint` - Executa o linter

## 🌟 Próximas Funcionalidades

- [ ] Sistema de autenticação completo
- [ ] Integração com banco de dados
- [ ] Sistema de pagamento com Stripe
- [ ] Rastreamento de pedidos em tempo real
- [ ] Avaliações e comentários
- [ ] Filtros avançados
- [ ] Geolocalização
- [ ] Push notifications
- [ ] Sistema de cupons
- [ ] Histórico de pedidos

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

Se você tiver alguma dúvida ou problema, abra uma issue no repositório. 