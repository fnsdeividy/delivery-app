'use client'

import { ArrowRight, Crown, Search, Shield, Store, Users } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function HomePage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const handleStoreSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Navegar para a loja (por enquanto usa slug padrão)
      router.push(`/store/${searchQuery.trim().toLowerCase().replace(/\s+/g, '-')}`)
    }
  }

  const featuredStores = [
    {
      name: 'Boteco do João',
      slug: 'boteco-do-joao',
      description: 'Comida caseira e ambiente acolhedor',
      image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=300&fit=crop',
      rating: 4.8,
      categories: ['Brasileira', 'Caseira', 'Bebidas']
    },
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
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">Cardap.IO</h1>
              <span className="ml-3 px-3 py-1 bg-orange-100 text-orange-800 text-sm font-medium rounded-full">
                Multi-Tenant
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 font-medium"
              >
                Cadastrar
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-50 to-amber-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Plataforma Completa de
            <span className="text-orange-600"> Delivery</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Sistema multi-tenant para lojistas e clientes. Gerencie sua loja, 
            faça pedidos e monitore tudo em um só lugar.
          </p>

          {/* Search */}
          <form onSubmit={handleStoreSearch} className="max-w-md mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar loja pelo nome..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700"
              >
                Buscar
              </button>
            </div>
          </form>

          {/* Quick Access */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/store/boteco-do-joao"
              className="inline-flex items-center px-8 py-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold shadow-lg"
            >
              <Store className="w-5 h-5 mr-2" />
              Ver Loja Demo
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link
              href="/login/lojista"
              className="inline-flex items-center px-8 py-4 bg-white text-orange-600 border-2 border-orange-600 rounded-lg hover:bg-orange-50 font-semibold shadow-lg"
            >
              <Shield className="w-5 h-5 mr-2" />
              Dashboard Lojista
            </Link>
          </div>

                      {/* Dados de Demonstração */}
          <div className="mt-12 bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto border-2 border-orange-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">
              📋 Dados para Demonstração - ✅ CORRIGIDO
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {/* Lojista */}
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h4 className="font-semibold text-orange-800 mb-2">🏪 Login Lojista</h4>
                <div className="space-y-1 text-orange-700 font-mono">
                  <p><strong>Email:</strong> admin@boteco.com</p>
                  <p><strong>Senha:</strong> 123456</p>
                  <p><strong>Loja:</strong> boteco-do-joao</p>
                </div>
                <div className="mt-2 pt-2 border-t border-orange-200">
                  <Link
                    href="/login/lojista"
                    className="text-xs bg-orange-600 text-white px-3 py-1 rounded hover:bg-orange-700 transition-colors"
                  >
                    → Testar Login
                  </Link>
                </div>
              </div>

              {/* Super Admin */}
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-800 mb-2">👑 Login Super Admin</h4>
                <div className="space-y-1 text-purple-700 font-mono">
                  <p><strong>Email:</strong> superadmin@cardap.io</p>
                  <p><strong>Senha:</strong> admin123</p>
                  <p><strong>Acesso:</strong> Todas as lojas</p>
                </div>
                <div className="mt-2 pt-2 border-t border-purple-200">
                  <Link
                    href="/login/super-admin"
                    className="text-xs bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 transition-colors"
                  >
                    → Testar Login
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">✅ Sistema Corrigido</h4>
              <ul className="text-green-700 text-sm space-y-1">
                <li>• <strong>Hashes de senha</strong> atualizados corretamente</li>
                <li>• <strong>Roles padronizados</strong> (admin, super_admin)</li>
                <li>• <strong>Validações</strong> de autenticação corrigidas</li>
                <li>• <strong>Redirects</strong> funcionando para porta única</li>
              </ul>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">🧪 Fluxos de Teste</h4>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• <strong>Criar Loja:</strong> /register/loja (formulário multi-step)</li>
                <li>• <strong>Ver Cardápio:</strong> /store/boteco-do-joao (interface pública)</li>
                <li>• <strong>Dashboard:</strong> Login lojista → gestão completa</li>
                <li>• <strong>Super Admin:</strong> Login admin → controle global</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Para Cada Tipo de Usuário
            </h3>
            <p className="text-lg text-gray-600">
              Diferentes portais para diferentes necessidades
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Clientes */}
            <div className="bg-blue-50 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-4">Clientes</h4>
              <p className="text-gray-600 mb-6">
                Navegue pelos cardápios, faça pedidos e acompanhe entregas
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <p>🌐 Interface Pública</p>
                <p>📱 Cardápios personalizados</p>
                <p>🛒 Carrinho inteligente</p>
              </div>
            </div>

            {/* Lojistas */}
            <div className="bg-orange-50 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Store className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-4">Lojistas</h4>
              <p className="text-gray-600 mb-6">
                Gerencie produtos, pedidos e configure sua loja
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <p>📊 Dashboard Administrativo</p>
                <p>🍔 Gestão de produtos</p>
                <p>⚙️ Configurações da loja</p>
              </div>
            </div>

            {/* Super Admin */}
            <div className="bg-purple-50 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-4">Super Admin</h4>
              <p className="text-gray-600 mb-6">
                Controle total do sistema e todas as lojas
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <p>👑 Painel de Controle</p>
                <p>🏢 Gestão de lojas</p>
                <p>📈 Analytics globais</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Stores */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Lojas em Destaque
            </h3>
            <p className="text-lg text-gray-600">
              Experimente nosso sistema com estas lojas demo
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredStores.map((store) => (
              <Link
                key={store.slug}
                href={`/store/${store.slug}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <img
                  src={store.image}
                  alt={store.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-bold text-gray-900">{store.name}</h4>
                    <div className="flex items-center">
                      <span className="text-yellow-400">⭐</span>
                      <span className="text-sm text-gray-600 ml-1">{store.rating}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">{store.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {store.categories.map((category) => (
                      <span
                        key={category}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-orange-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Pronto para começar?
          </h3>
          <p className="text-xl text-orange-100 mb-8">
            Crie sua loja ou faça seu primeiro pedido
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/register/loja"
              className="inline-flex items-center px-8 py-4 bg-white text-orange-600 rounded-lg hover:bg-gray-100 font-semibold"
            >
              <Store className="w-5 h-5 mr-2" />
              Criar Minha Loja
            </Link>
            <Link
              href="/store/boteco-do-joao"
              className="inline-flex items-center px-8 py-4 bg-orange-700 text-white rounded-lg hover:bg-orange-800 font-semibold"
            >
              <Search className="w-5 h-5 mr-2" />
              Explorar Cardápios
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h5 className="text-lg font-bold mb-4">Cardap.IO</h5>
              <p className="text-gray-400">
                Plataforma multi-tenant completa para delivery
              </p>
            </div>
            <div>
              <h6 className="font-semibold mb-4">Para Clientes</h6>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/store/boteco-do-joao" className="hover:text-white">Ver Cardápios</Link></li>
                <li><Link href="/login" className="hover:text-white">Fazer Login</Link></li>
                <li><Link href="/register" className="hover:text-white">Criar Conta</Link></li>
              </ul>
            </div>
            <div>
              <h6 className="font-semibold mb-4">Para Lojistas</h6>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/login/lojista" className="hover:text-white">Dashboard</Link></li>
                <li><Link href="/register/loja" className="hover:text-white">Criar Loja</Link></li>
              </ul>
            </div>
            <div>
              <h6 className="font-semibold mb-4">Sistema</h6>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/login/super-admin" className="hover:text-white">Super Admin</Link></li>
                <li><a href="#" className="hover:text-white">Documentação</a></li>
                <li><a href="#" className="hover:text-white">Suporte</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 mt-8 text-center text-gray-400">
            <p>&copy; 2025 Cardap.IO. Sistema Multi-Tenant de Delivery.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}