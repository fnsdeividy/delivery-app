# Cardap.IO

Uma aplicação moderna de delivery de comida inspirada no design do Figma, construída com Next.js, TypeScript e Tailwind CSS.

## 🚀 Características

- **Interface Moderna**: Design responsivo e intuitivo
- **Performance Otimizada**: Construída com Next.js 14
- **TypeScript**: Código tipado para maior segurança
- **Tailwind CSS**: Estilização moderna e consistente
- **Componentes Reutilizáveis**: Arquitetura limpa e modular
- **Responsivo**: Funciona perfeitamente em todos os dispositivos
- **Modal de Personalização**: Interface completa para customizar produtos
- **Sistema de Filtros**: Busca e filtros por categoria
- **Carrinho Inteligente**: Com detalhes de personalização

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
NEXT_PUBLIC_APP_NAME="Cardap.IO"
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
│   ├── CustomizeModal.tsx  # Modal de personalização
│   ├── Notification.tsx    # Notificações
│   ├── Footer.tsx          # Rodapé
│   └── LoadingSpinner.tsx  # Spinner de carregamento
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
- **Cards**: Produtos com informações detalhadas
- **Botões**: Primário, secundário e outline
- **Inputs**: Barra de pesquisa e formulários
- **Modais**: Personalização e carrinho
- **Ícones**: Lucide React

## 📱 Funcionalidades

### Página Inicial
- **Header**: Logo e navegação
- **Busca**: Campo de pesquisa funcional
- **Categorias**: Filtros por tipo de comida
- **Produtos**: Grid com cards detalhados
- **Carrinho**: Sidebar deslizante
- **Notificações**: Feedback visual
- **Footer**: Links e informações

### Modal de Personalização
- **Informações do Produto**: Imagem, nome, descrição e preço
- **Seletor de Quantidade**: Botões +/- com input numérico
- **Lista de Ingredientes**: Checkboxes para remover ingredientes
- **Adicionais**: Checkboxes com preços para extras
- **Observações Especiais**: Campo de texto livre
- **Cálculo Dinâmico**: Total atualizado em tempo real

### Sistema de Filtros
- **Filtro por Categoria**: Pizzas, Hambúrgueres, Massas, etc.
- **Busca Inteligente**: Por nome, descrição ou ingredientes
- **Contadores**: Número de produtos por categoria
- **Estado Vazio**: Mensagem quando nenhum produto é encontrado

### Carrinho Inteligente
- **Produtos Personalizados**: Com detalhes de customização
- **Adicionais**: Listados com preços
- **Observações**: Especiais exibidas
- **Quantidade**: Controles +/- para cada item
- **Total Dinâmico**: Calculado automaticamente

### Interatividade
- **Busca**: Campo de pesquisa funcional
- **Filtros**: Seleção por categorias
- **Carrinho**: Adicionar/remover produtos
- **Personalização**: Modal completo para customizar
- **Notificações**: Feedback ao adicionar itens
- **Responsividade**: Adaptação para mobile

## 🔧 Scripts Disponíveis

- `npm run dev` - Executa o servidor de desenvolvimento
- `npm run build` - Gera a build de produção
- `npm run start` - Executa a aplicação em produção
- `npm run lint` - Executa o linter

## 🎨 Sistema de Personalização por Loja

### Configuração de Tema Dinâmica
- **JSON Config**: Sistema baseado em `theme-config.json` para cada loja
- **Cores Personalizáveis**: Primary, secondary, backgrounds, texto e estados
- **Logo Customizável**: Upload e configuração de logo próprio
- **Metadados**: Título, descrição e SEO personalizados por loja
- **Tipografia**: Controle de fontes, tamanhos e pesos

> 📁 Veja `config/README.md` para documentação completa do sistema de temas

## 🐛 Correções Realizadas

### v1.0.2 - Remoção do Seletor de Tema Manual
- **Header**: Removido botão de seleção de tema manual
- **Theme System**: Preparado para sistema baseado em JSON por loja
- **Estrutura**: Criada configuração exemplo em `config/theme-config.json`

### v1.0.1 - Correção de Erros Críticos
- **Cart.tsx**: Removida função `updateQuantity` duplicada que causava erro de compilação
- **UserProfile.tsx**: Adicionado import faltante do componente `Heart` do lucide-react
- **Compilação**: Todos os erros de TypeScript foram corrigidos
- **Tela de Perfil**: Agora funciona corretamente sem erros

## 🌟 Próximas Funcionalidades

- [ ] Sistema de autenticação completo
- [ ] Integração com banco de dados
- [ ] Sistema de pagamento com Stripe
- [ ] Rastreamento de pedidos em tempo real
- [ ] Avaliações e comentários
- [ ] Filtros avançados (preço, avaliação, etc.)
- [ ] Geolocalização
- [ ] Push notifications
- [ ] Sistema de cupons
- [ ] Histórico de pedidos
- [ ] Favoritos
- [ ] Comparação de produtos
- [ ] Recomendações personalizadas

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