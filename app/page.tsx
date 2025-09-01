"use client";

import { Header } from "@/components/Header";
import {
  Animated,
  AnimatedCard,
  Hero,
  StaggerItem,
  StaggerList,
} from "@/components/ui";
import {
  CheckCircle,
  MessageCircle,
  Phone,
  Shield,
  Star,
  Store,
  Truck,
  Zap,
} from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const features = [
    {
      icon: <Zap className="w-8 h-8 text-yellow-500" />,
      title: "Pedidos em 1 Minuto",
      description:
        "Seu cardápio online pronto em menos de 1 minuto, sem complicação",
    },
    {
      icon: <MessageCircle className="w-8 h-8 text-green-500" />,
      title: "WhatsApp Integration",
      description:
        "Receba pedidos diretamente pelo WhatsApp, sem taxas por pedido",
    },
    {
      icon: <Store className="w-8 h-8 text-blue-500" />,
      title: "Multi-Plataforma",
      description: "Seus produtos no Google, iFood e nosso app simultaneamente",
    },
  ];

  const testimonials = [
    {
      name: "Carlos Silva",
      store: "Hamburgueria Artesanal",
      text: "Aumentei minhas vendas em 40% depois que comecei a usar o Cardap.IO. O melhor é que não pago taxas absurdas como em outros apps.",
      avatar: "CS",
    },
    {
      name: "Mariana Santos",
      store: "Pizzaria Donatella",
      text: "Finalmente uma plataforma que entende as necessidades dos pequenos negócios. Fácil de usar e os clientes amam a experiência.",
      avatar: "MS",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white py-12 md:py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Hero>
              <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold mb-4 md:mb-6">
                Venda Mais Online
                <Animated
                  animation="slideIn"
                  config={{ direction: "up", delay: 0.2 }}
                  trigger="mount"
                  className="block text-blue-200"
                >
                  Sem Taxas Abusivas
                </Animated>
              </h1>
              <Animated
                animation="fadeIn"
                config={{ delay: 0.3 }}
                trigger="mount"
                className="text-lg md:text-xl lg:text-2xl text-blue-100 mb-6 md:mb-8 max-w-3xl mx-auto px-4"
              >
                Crie sua loja no Cardap.IO, receba pedidos direto pelo WhatsApp
                e apareça para milhares de clientes na sua região.
              </Animated>
              <Animated
                animation="scaleIn"
                config={{ delay: 0.5 }}
                trigger="mount"
                className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4"
              >
                <Link
                  href="/register/loja"
                  className="px-6 md:px-8 py-3 md:py-4 bg-white text-blue-600 rounded-lg font-semibold text-base md:text-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  ➕ Criar Minha Loja
                </Link>
              </Animated>
            </Hero>
          </div>
        </div>

        {/* Background Animation Elements */}
        <div className="absolute top-20 left-10 w-16 md:w-20 h-16 md:h-20 bg-white/10 rounded-full animate-float animate-delay-100 blur-sm"></div>
        <div className="absolute top-40 right-20 w-12 md:w-16 h-12 md:h-16 bg-white/5 rounded-full animate-float animate-delay-300 blur-md"></div>
        <div className="absolute bottom-20 left-1/4 w-8 md:w-12 h-8 md:h-12 bg-white/10 rounded-full animate-float animate-delay-500 blur-lg"></div>
      </section>

      {/* Social Proof Section */}
      {/* <section className="py-6 md:py-8 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Animated
              animation="fadeIn"
              config={{ delay: 0.1 }}
              className="text-sm font-semibold text-gray-500 uppercase mb-3 md:mb-4"
            >
              Confiado por centenas de lojistas
            </Animated>
            <Animated
              animation="slideIn"
              config={{ direction: "up", delay: 0.2 }}
              className="flex flex-wrap justify-center items-center gap-4 md:gap-8 lg:gap-16 opacity-60"
            >
              <div className="text-lg md:text-2xl font-bold text-gray-700">
                🥗 Salads & Cia
              </div>
              <div className="text-lg md:text-2xl font-bold text-gray-700">
                🍔 Burger Art
              </div>
              <div className="text-lg md:text-2xl font-bold text-gray-700">
                ☕ Café Brasil
              </div>
              <div className="text-lg md:text-2xl font-bold text-gray-700">
                🍕 Pizzaria Top
              </div>
            </Animated>
          </div>
        </div>
      </section> */}

      {/* Benefits Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-12">
            <Animated animation="fadeIn">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">
                Por que escolher o Cardap.IO?
              </h2>
            </Animated>
            <Animated animation="fadeIn" config={{ delay: 0.2 }}>
              <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-4">
                A plataforma completa para seu negócio de alimentação crescer
              </p>
            </Animated>
          </div>

          <StaggerList staggerDelay={0.1}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              <StaggerItem animation="scaleIn">
                <AnimatedCard className="text-center p-4 md:p-6 hover:shadow-lg transition-shadow duration-300">
                  <div className="bg-blue-100 w-12 md:w-16 h-12 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                    <Truck className="w-6 md:w-8 h-6 md:h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
                    Entrega Rápida
                  </h3>
                  <p className="text-sm md:text-base text-gray-600">
                    Receba seus pedidos em até 1 hora
                  </p>
                </AnimatedCard>
              </StaggerItem>

              <StaggerItem animation="scaleIn">
                <AnimatedCard className="text-center p-4 md:p-6 hover:shadow-lg transition-shadow duration-300">
                  <div className="bg-green-100 w-12 md:w-16 h-12 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                    <Shield className="w-6 md:w-8 h-6 md:h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
                    Compra Segura
                  </h3>
                  <p className="text-sm md:text-base text-gray-600">
                    Pagamento seguro e garantia de entrega
                  </p>
                </AnimatedCard>
              </StaggerItem>

              <StaggerItem animation="scaleIn">
                <AnimatedCard className="text-center p-4 md:p-6 hover:shadow-lg transition-shadow duration-300">
                  <div className="bg-purple-100 w-12 md:w-16 h-12 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                    <Store className="w-6 md:w-8 h-6 md:h-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
                    Lojas Verificadas
                  </h3>
                  <p className="text-sm md:text-base text-gray-600">
                    Todas as lojas são verificadas e confiáveis
                  </p>
                </AnimatedCard>
              </StaggerItem>

              <StaggerItem animation="scaleIn">
                <AnimatedCard className="text-center p-4 md:p-6 hover:shadow-lg transition-shadow duration-300">
                  <div className="bg-red-100 w-12 md:w-16 h-12 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                    <Phone className="w-6 md:w-8 h-6 md:h-8 text-red-600" />
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
                    WhatsApp Direct
                  </h3>
                  <p className="text-sm md:text-base text-gray-600">
                    Receba pedidos sem taxas pelo WhatsApp
                  </p>
                </AnimatedCard>
              </StaggerItem>
            </div>
          </StaggerList>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-12">
            <Animated animation="fadeIn">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">
                Como Funciona
              </h2>
            </Animated>
            <Animated animation="fadeIn" config={{ delay: 0.2 }}>
              <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-4">
                Em poucos minutos seu negócio está online e vendendo
              </p>
            </Animated>
          </div>

          <StaggerList staggerDelay={0.15}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {features.map((feature, index) => (
                <StaggerItem key={index} animation="scaleIn">
                  <AnimatedCard className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                    <div className="flex justify-center mb-3 md:mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 text-center">
                      {feature.title}
                    </h3>
                    <p className="text-sm md:text-base text-gray-600 text-center">
                      {feature.description}
                    </p>
                  </AnimatedCard>
                </StaggerItem>
              ))}
            </div>
          </StaggerList>

          <Animated
            animation="fadeIn"
            config={{ delay: 0.5 }}
            className="mt-8 md:mt-12 text-center"
          >
            <div className="inline-flex items-center bg-green-50 text-green-800 px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-medium">
              <CheckCircle className="w-4 md:w-5 h-4 md:h-5 mr-2" />
              <span>Sem necessidade de cartão de crédito para começar</span>
            </div>
          </Animated>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-12">
            <Animated animation="fadeIn">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">
                O que nossos lojistas dizem
              </h2>
            </Animated>
          </div>

          <StaggerList staggerDelay={0.2}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {testimonials.map((testimonial, index) => (
                <StaggerItem
                  key={index}
                  animation="slideIn"
                  config={{ direction: "left", delay: index * 0.2 }}
                >
                  <AnimatedCard className="bg-gray-50 p-4 md:p-6 rounded-lg hover:shadow-md transition-shadow duration-300">
                    <div className="flex items-center mb-3 md:mb-4">
                      <div className="w-10 md:w-12 h-10 md:h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3 md:mr-4">
                        <span className="font-semibold text-blue-800 text-sm md:text-base">
                          {testimonial.avatar}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm md:text-base">
                          {testimonial.name}
                        </h4>
                        <p className="text-gray-600 text-xs md:text-sm">
                          {testimonial.store}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-700 italic text-sm md:text-base">
                      "{testimonial.text}"
                    </p>
                    <div className="flex mt-3 md:mt-4">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 md:w-5 h-4 md:h-5 text-yellow-400 fill-current"
                        />
                      ))}
                    </div>
                  </AnimatedCard>
                </StaggerItem>
              ))}
            </div>
          </StaggerList>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-12">
            <Animated animation="fadeIn">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">
                Planos Acessíveis
              </h2>
            </Animated>
            <Animated animation="fadeIn" config={{ delay: 0.2 }}>
              <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-4">
                Escolha o plano ideal para o seu negócio
              </p>
            </Animated>
          </div>

          <StaggerList staggerDelay={0.1}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
              <StaggerItem animation="scaleIn">
                <AnimatedCard className="bg-gray-50 p-4 md:p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
                    Plano Básico
                  </h3>
                  <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">
                    Grátis
                  </div>
                  <ul className="space-y-2 md:space-y-3 text-gray-600 text-sm md:text-base">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 md:w-5 h-4 md:h-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Até 20 produtos</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 md:w-5 h-4 md:h-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Pedidos por WhatsApp</span>
                    </li>
                  </ul>
                  <Link
                    href="/register/loja"
                    className="mt-4 md:mt-6 block w-full bg-gray-200 text-gray-800 text-center py-2 md:py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-300 text-sm md:text-base"
                  >
                    Começar Grátis
                  </Link>
                </AnimatedCard>
              </StaggerItem>

              <StaggerItem animation="scaleIn">
                <AnimatedCard className="bg-blue-50 p-4 md:p-6 rounded-lg border border-blue-200 relative hover:shadow-lg transition-shadow duration-300">
                  <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-semibold px-2 md:px-3 py-1 rounded-bl-lg">
                    Popular
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
                    Plano Premium
                  </h3>
                  <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">
                    R$ 79
                    <span className="text-base md:text-lg font-normal">
                      /mês
                    </span>
                  </div>
                  <ul className="space-y-2 md:space-y-3 text-gray-600 text-sm md:text-base">
                    <li className="flex items-center"></li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 md:w-5 h-4 md:h-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Produtos ilimitados</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 md:w-5 h-4 md:h-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Pedidos por WhatsApp</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 md:w-5 h-4 md:h-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Integração com iFood</span>
                    </li>
                  </ul>
                  <Link
                    href="/register/loja"
                    className="mt-4 md:mt-6 block w-full bg-blue-600 text-white text-center py-2 md:py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 text-sm md:text-base"
                  >
                    Assinar Agora
                  </Link>
                </AnimatedCard>
              </StaggerItem>

              <StaggerItem animation="scaleIn">
                <AnimatedCard className="bg-gray-50 p-4 md:p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
                    Plano Empresarial
                  </h3>
                  <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">
                    R$ 149
                    <span className="text-base md:text-lg font-normal">
                      /mês
                    </span>
                  </div>
                  <ul className="space-y-2 md:space-y-3 text-gray-600 text-sm md:text-base">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 md:w-5 h-4 md:h-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Lojas ilimitadas</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 md:w-5 h-4 md:h-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Produtos ilimitados</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 md:w-5 h-4 md:h-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Pedidos multi-canais</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 md:w-5 h-4 md:h-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>Suporte prioritário</span>
                    </li>
                  </ul>
                  <Link
                    href="/register/loja"
                    className="mt-4 md:mt-6 block w-full bg-gray-200 text-gray-800 text-center py-2 md:py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-300 text-sm md:text-base"
                  >
                    Assinar Agora
                  </Link>
                </AnimatedCard>
              </StaggerItem>
            </div>
          </StaggerList>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <Animated animation="fadeIn">
            <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">
              Pronto para vender mais?
            </h2>
          </Animated>
          <Animated animation="fadeIn" config={{ delay: 0.2 }}>
            <p className="text-lg md:text-xl text-blue-100 mb-6 md:mb-8 max-w-2xl mx-auto px-4">
              Junte-se a milhares de lojistas que aumentaram suas vendas com o
              Cardap.IO
            </p>
          </Animated>
          <Animated
            animation="scaleIn"
            config={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4"
          >
            <Link
              href="/register/loja"
              className="px-6 md:px-8 py-3 md:py-4 bg-white text-blue-600 rounded-lg font-semibold text-base md:text-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Criar Minha Loja
            </Link>
            <Link
              href="/login"
              className="px-6 md:px-8 py-3 md:py-4 border-2 border-white text-white rounded-lg font-semibold text-base md:text-lg hover:bg-white hover:text-blue-600 transition-all duration-300"
            >
              Fazer Login
            </Link>
          </Animated>
          <Animated
            animation="fadeIn"
            config={{ delay: 0.5 }}
            className="mt-4 md:mt-6 text-blue-100 text-xs md:text-sm"
          >
            Não é necessário cartão de crédito. Comece gratuitamente.
          </Animated>
        </div>

        {/* Background Animation Elements */}
        <div className="absolute top-10 left-10 w-24 md:w-32 h-24 md:h-32 bg-white/5 rounded-full animate-float animate-delay-200 blur-sm"></div>
        <div className="absolute bottom-10 right-10 w-16 md:w-24 h-16 md:h-24 bg-white/5 rounded-full animate-float animate-delay-400 blur-md"></div>
        <div className="absolute top-1/2 left-1/3 w-12 md:w-16 h-12 md:h-16 bg-white/5 rounded-full animate-float animate-delay-600 blur-lg"></div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StaggerList staggerDelay={0.1}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              <StaggerItem animation="fadeIn">
                <div>
                  <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">
                    Cardap.IO
                  </h3>
                  <p className="text-gray-400 text-sm md:text-base">
                    A melhor plataforma para conectar clientes e lojistas locais
                  </p>
                </div>
              </StaggerItem>

              <StaggerItem animation="fadeIn">
                <div>
                  <h4 className="text-sm md:text-md font-semibold mb-3 md:mb-4">
                    Para Clientes
                  </h4>
                  <ul className="space-y-2 text-gray-400 text-sm md:text-base">
                    <li>
                      <Link
                        href="/lojas"
                        className="hover:text-white transition-colors"
                      >
                        Encontrar Lojas
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/categorias"
                        className="hover:text-white transition-colors"
                      >
                        Categorias
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/ofertas"
                        className="hover:text-white transition-colors"
                      >
                        Ofertas
                      </Link>
                    </li>
                  </ul>
                </div>
              </StaggerItem>

              <StaggerItem animation="fadeIn">
                <div>
                  <h4 className="text-sm md:text-md font-semibold mb-3 md:mb-4">
                    Para Lojistas
                  </h4>
                  <ul className="space-y-2 text-gray-400 text-sm md:text-base">
                    <li>
                      <Link
                        href="/register/loja"
                        className="hover:text-white transition-colors"
                      >
                        Cadastrar Loja
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/vender"
                        className="hover:text-white transition-colors"
                      >
                        Como Vender
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/suporte"
                        className="hover:text-white transition-colors"
                      >
                        Suporte
                      </Link>
                    </li>
                  </ul>
                </div>
              </StaggerItem>

              <StaggerItem animation="fadeIn">
                <div>
                  <h4 className="text-sm md:text-md font-semibold mb-3 md:mb-4">
                    Suporte
                  </h4>
                  <ul className="space-y-2 text-gray-400 text-sm md:text-base">
                    <li>
                      <Link
                        href="/ajuda"
                        className="hover:text-white transition-colors"
                      >
                        Central de Ajuda
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/contato"
                        className="hover:text-white transition-colors"
                      >
                        Contato
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/termos"
                        className="hover:text-white transition-colors"
                      >
                        Termos de Uso
                      </Link>
                    </li>
                  </ul>
                </div>
              </StaggerItem>
            </div>
          </StaggerList>

          <Animated
            animation="fadeIn"
            config={{ delay: 0.5 }}
            className="border-t border-gray-800 mt-6 md:mt-8 pt-6 md:pt-8 text-center text-gray-400"
          >
            <p className="text-sm md:text-base">
              &copy; 2024 Cardap.IO. Todos os direitos reservados.
            </p>
          </Animated>
        </div>
      </footer>
    </div>
  );
}
