'use client'

import { Storefront } from '@phosphor-icons/react'
import Link from 'next/link'
import { Header } from '../components/Header'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Container, Section } from '../components/ui'

export default function HomePage() {

  const featuredStores = [
    {
      name: 'Pizza Express',
      slug: 'pizza-express',
      description: 'As melhores pizzas da região',
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
      rating: 4.6,
      categories: ['Pizza', 'Italiana', 'Delivery']
    },
    {
      name: 'Burger House',
      slug: 'burger-house',
      description: 'Hambúrguers artesanais premium',
      image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop',
      rating: 4.7,
      categories: ['Hamburger', 'Americana', 'Gourmet']
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <Section variant="gradient" className="py-24">
        {/* Background SVG Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 1200 800" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1" className="text-blue-200"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            <circle cx="200" cy="150" r="80" fill="currentColor" className="text-blue-200 opacity-30"/>
            <circle cx="1000" cy="600" r="120" fill="currentColor" className="text-indigo-200 opacity-30"/>
            <rect x="800" y="200" width="200" height="150" rx="20" fill="currentColor" className="text-purple-200 opacity-20"/>
          </svg>
        </div>

        <Container size="lg" className="text-center relative z-10">
          <h1 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Delivery Multi-Tenant
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              em um só lugar
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Crie e gerencie cardápios digitais, pedidos e lojas com poucos cliques.
          </p>

          {/* CTA Button */}
          <div className="flex justify-center">
            <Button
              asChild
              variant="gradient"
              size="xl"
              className="shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200"
            >
              <Link href="/register/loja">
                <Storefront className="w-7 h-7 mr-3" />
                Criar Minha Loja
              </Link>
            </Button>
          </div>
        </Container>
      </Section>

      {/* Features */}
      <Section>
        <Container size="xl">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              O que o Cardap.IO oferece
            </h3>
            <p className="text-lg text-gray-600">
              Sistema completo com funcionalidades avançadas para cada tipo de usuário
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Clientes */}
            <Card className="text-center shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <CardHeader>
                <div className="text-6xl mb-6">🛒</div>
                <CardTitle className="text-2xl">Cliente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-left">
                  <div className="flex items-start gap-3">
                    <span className="text-blue-500 mt-1">•</span>
                    <span className="text-gray-600">Navegue pelos cardápios personalizados</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-blue-500 mt-1">•</span>
                    <span className="text-gray-600">Faça pedidos com poucos cliques</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-blue-500 mt-1">•</span>
                    <span className="text-gray-600">Acompanhe entregas em tempo real</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lojistas */}
            <Card className="text-center shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <CardHeader>
                <div className="text-6xl mb-6">📊</div>
                <CardTitle className="text-2xl">Lojista</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-left">
                  <div className="flex items-start gap-3">
                    <span className="text-purple-500 mt-1">•</span>
                    <span className="text-gray-600">Dashboard administrativo completo</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-purple-500 mt-1">•</span>
                    <span className="text-gray-600">Gerencie produtos e pedidos</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-purple-500 mt-1">•</span>
                    <span className="text-gray-600">Configure sua loja facilmente</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Super Admin */}
            <Card className="text-center shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <CardHeader>
                <div className="text-6xl mb-6">👑</div>
                <CardTitle className="text-2xl">Super Admin</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-left">
                  <div className="flex items-start gap-3">
                    <span className="text-indigo-500 mt-1">•</span>
                    <span className="text-gray-600">Controle total do sistema</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-indigo-500 mt-1">•</span>
                    <span className="text-gray-600">Gestão de todas as lojas</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-indigo-500 mt-1">•</span>
                    <span className="text-gray-600">Analytics globais e relatórios</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Funcionalidades Principais */}
          <Card className="shadow-lg border border-gray-100">
            <CardHeader>
              <CardTitle className="text-3xl text-center">
                Funcionalidades Principais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Cardápio Digital */}
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-3xl">🍔</span>
                  </div>
                  <div>
                    <h5 className="text-xl font-bold text-gray-900 mb-2">Cardápio Digital</h5>
                    <p className="text-gray-600 leading-relaxed">
                      Cardápios personalizados com fotos, descrições e preços. Interface intuitiva para clientes navegarem facilmente.
                    </p>
                  </div>
                </div>
                
                {/* Analytics */}
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-3xl">📈</span>
                  </div>
                  <div>
                    <h5 className="text-xl font-bold text-gray-900 mb-2">Analytics</h5>
                    <p className="text-gray-600 leading-relaxed">
                      Relatórios detalhados de vendas, produtos e performance. Tome decisões baseadas em dados reais.
                    </p>
                  </div>
                </div>
                
                {/* Configurações Avançadas */}
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-3xl">⚙️</span>
                  </div>
                  <div>
                    <h5 className="text-xl font-bold text-gray-900 mb-2">Configurações Avançadas</h5>
                    <p className="text-gray-600 leading-relaxed">
                      Personalização visual, horários de funcionamento e métodos de pagamento. Configure tudo do seu jeito.
                    </p>
                  </div>
                </div>
                
                {/* Entregas */}
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-3xl">🚚</span>
                  </div>
                  <div>
                    <h5 className="text-xl font-bold text-gray-900 mb-2">Entregas</h5>
                    <p className="text-gray-600 leading-relaxed">
                      Sistema completo de entregas com zonas, taxas e tempo estimado. Controle total sobre suas operações.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Container>
      </Section>

      {/* Benefícios */}
      <Section variant="gradient">
        <Container size="xl">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              Por que escolher o Cardap.IO?
            </h3>
            <p className="text-xl text-gray-600">
              Vantagens exclusivas para seu negócio
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Economia */}
            <Card className="text-center shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <CardHeader>
                <div className="text-5xl mb-4">💰</div>
                <CardTitle className="text-xl">Economia</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Sem taxas mensais abusivas. Pague apenas pelo que usar.
                </p>
              </CardContent>
            </Card>

            {/* Simplicidade */}
            <Card className="text-center shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <CardHeader>
                <div className="text-5xl mb-4">⚡</div>
                <CardTitle className="text-xl">Simplicidade</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Interface intuitiva que qualquer pessoa pode usar.
                </p>
              </CardContent>
            </Card>

            {/* Flexibilidade */}
            <Card className="text-center shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
              <CardHeader>
                <div className="text-5xl mb-4">🔧</div>
                <CardTitle className="text-xl">Flexibilidade</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Personalize tudo: cores, logo, horários e pagamentos.
                </p>
              </CardContent>
            </Card>
          </div>
        </Container>
      </Section>

      {/* Featured Stores */}
      <Section className="bg-gray-50">
        <Container size="xl">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              Lojas em Destaque
            </h3>
            <p className="text-xl text-gray-600">
              Inspire-se com estas lojas de sucesso
            </p>
          </div>

          {/* Carrossel */}
          <div className="relative">
            <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory">
              {featuredStores.map((store, index) => (
                <Card
                  key={store.slug}
                  className="flex-none w-80 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden snap-start"
                >
                  <div className="relative">
                    <img
                      src={store.image}
                      alt={store.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                      <span className="text-yellow-500">⭐</span>
                      <span className="text-sm font-semibold text-gray-800">{store.rating}</span>
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <h4 className="text-xl font-bold text-gray-900 mb-2">{store.name}</h4>
                    <p className="text-gray-600 mb-4 leading-relaxed">{store.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      {store.categories.map((category) => (
                        <Badge key={category} variant="blue">
                          {category}
                        </Badge>
                      ))}
                    </div>
                    
                    <Button
                      asChild
                      variant="gradient"
                      className="w-full transform hover:-translate-y-1"
                    >
                      <Link href={`/store/${store.slug}`}>
                        Ver Cardápio
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA Principal */}
          <div className="text-center mt-16">
            <Card className="shadow-lg border border-gray-100 max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-2xl">
                  Gostou do que viu?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">
                  Crie sua loja digital e tenha o mesmo sucesso. É rápido, fácil e acessível.
                </p>
                <Button
                  asChild
                  variant="gradientGreen"
                  size="lg"
                  className="transform hover:-translate-y-1"
                >
                  <Link href="/register/loja">
                    <Storefront className="w-6 h-6 mr-3" />
                    Quero uma loja assim
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </Container>
      </Section>

      {/* CTA Section */}
      <Section variant="dark" className="py-24">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 1200 600" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="60" fill="currentColor" className="text-white opacity-20"/>
            <circle cx="1100" cy="500" r="80" fill="currentColor" className="text-white opacity-20"/>
            <circle cx="900" cy="150" r="40" fill="currentColor" className="text-white opacity-30"/>
            <circle cx="200" cy="450" r="50" fill="currentColor" className="text-white opacity-25"/>
          </svg>
        </div>

        <Container size="lg" className="text-center relative z-10">
          <h3 className="text-5xl font-bold text-white mb-6 leading-tight">
            Pronto para começar?
          </h3>
          <p className="text-2xl text-purple-100 mb-12 max-w-3xl mx-auto leading-relaxed">
            Crie sua loja em minutos e comece a vender online.
          </p>
          
          <div className="flex justify-center">
            <Button
              asChild
              variant="white"
              size="xl"
              className="shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 transition-all duration-300"
            >
              <Link href="/register/loja">
                <Storefront className="w-7 h-7 mr-3" />
                Criar Minha Loja
              </Link>
            </Button>
          </div>
        </Container>
      </Section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-800 via-gray-900 to-indigo-900 text-white py-16">
        <Container size="lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Para Clientes */}
            <div>
              <h6 className="text-lg font-bold mb-6 text-white">Para Clientes</h6>
              <ul className="space-y-3">
                <li>
                  <Link href="/store/pizza-express" className="text-gray-400 hover:text-white transition-colors">
                    Cardápios
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="text-gray-400 hover:text-white transition-colors">
                    Login
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="text-gray-400 hover:text-white transition-colors">
                    Criar Conta
                  </Link>
                </li>
              </ul>
            </div>

            {/* Para Lojistas */}
            <div>
              <h6 className="text-lg font-bold mb-6 text-white">Para Lojistas</h6>
              <ul className="space-y-3">
                <li>
                  <Link href="/login/lojista" className="text-gray-400 hover:text-white transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/register/loja" className="text-gray-400 hover:text-white transition-colors">
                    Criar Loja
                  </Link>
                </li>
              </ul>
            </div>

            {/* Sistema */}
            <div>
              <h6 className="text-lg font-bold mb-6 text-white">Sistema</h6>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Documentação
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Suporte
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Rodapé */}
          <div className="border-t border-gray-800 pt-6 mt-12 text-center">
            <p className="text-gray-400 text-sm">
              &copy; 2025 Cardap.IO
            </p>
          </div>
        </Container>
      </footer>
    </div>
  )
}