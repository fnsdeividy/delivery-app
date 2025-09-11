"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  CheckCircle,
  Clock,
  FileText,
  Headphones,
  HelpCircle,
  Mail,
  MessageCircle,
  Shield,
  Star,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function SupportPage() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const supportOptions = [
    {
      icon: <HelpCircle className="w-8 h-8" />,
      title: "Central de Ajuda",
      description:
        "Encontre respostas para as perguntas mais frequentes e guias de uso",
      href: "/suporte/central-ajuda",
      buttonText: "Acessar Central",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      stats: "500+ artigos",
    },
    {
      icon: <Mail className="w-8 h-8" />,
      title: "Contato",
      description: "Entre em contato conosco para suporte personalizado",
      href: "/suporte/contato",
      buttonText: "Falar Conosco",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      stats: "Resposta em 2h",
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Termos de Uso",
      description: "Consulte nossos termos e condições de uso da plataforma",
      href: "/suporte/termos-uso",
      buttonText: "Ler Termos",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      stats: "Sempre atualizado",
    },
  ];

  const quickHelp = [
    {
      title: "Como criar minha primeira loja?",
      description: "Aprenda o passo a passo para configurar sua loja online",
      href: "/suporte/central-ajuda#criar-loja",
      icon: <Zap className="w-5 h-5 text-yellow-500" />,
      difficulty: "Fácil",
      time: "5 min",
    },
    {
      title: "Como configurar pagamentos?",
      description: "Configure métodos de pagamento para receber pedidos",
      href: "/suporte/central-ajuda#configurar-pagamentos",
      icon: <Shield className="w-5 h-5 text-green-500" />,
      difficulty: "Médio",
      time: "10 min",
    },
    {
      title: "Problemas com WhatsApp?",
      description: "Soluções para integração com WhatsApp",
      href: "/suporte/central-ajuda#whatsapp",
      icon: <MessageCircle className="w-5 h-5 text-green-500" />,
      difficulty: "Fácil",
      time: "3 min",
    },
    {
      title: "Como gerenciar pedidos?",
      description: "Aprenda a gerenciar e acompanhar seus pedidos",
      href: "/suporte/central-ajuda#gerenciar-pedidos",
      icon: <TrendingUp className="w-5 h-5 text-blue-500" />,
      difficulty: "Fácil",
      time: "7 min",
    },
  ];

  const features = [
    {
      icon: <Users className="w-6 h-6 text-purple-600" />,
      title: "Suporte 24/7",
      description: "Nossa equipe está sempre disponível para ajudar",
    },
    {
      icon: <CheckCircle className="w-6 h-6 text-green-600" />,
      title: "Respostas Rápidas",
      description: "Média de resposta em menos de 2 horas",
    },
    {
      icon: <Headphones className="w-6 h-6 text-blue-600" />,
      title: "Atendimento Personalizado",
      description: "Suporte dedicado para cada tipo de usuário",
    },
  ];

  return (
    <div className="p-8">
      {/* Header melhorado */}
      <div className="text-center mb-16 animate-fade-in">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-6 animate-float">
          <HelpCircle className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          Como podemos ajudar?
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Estamos aqui para ajudar você a aproveitar ao máximo nossa plataforma.
          Escolha uma das opções abaixo ou explore nossa central de ajuda.
        </p>
      </div>

      {/* Features destacadas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {features.map((feature, index) => (
          <div
            key={index}
            className="text-center p-6 rounded-xl bg-white border border-gray-100 hover:shadow-lg transition-all duration-300 hover:scale-105 animate-fade-in"
            style={{ animationDelay: `${index * 0.2}s` }}
          >
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-50 rounded-lg mb-4">
              {feature.icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {feature.title}
            </h3>
            <p className="text-gray-600 text-sm">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* Opções de Suporte melhoradas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {supportOptions.map((option, index) => (
          <Card
            key={index}
            className={`text-center hover:shadow-2xl transition-all duration-300 hover:scale-105 group cursor-pointer ${option.bgColor} border-0`}
            onMouseEnter={() => setHoveredCard(index)}
            onMouseLeave={() => setHoveredCard(null)}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <CardHeader className="pb-4">
              <div
                className={`flex justify-center mb-4 transition-transform duration-300 ${
                  hoveredCard === index ? "scale-110" : ""
                }`}
              >
                <div
                  className={`p-4 rounded-2xl bg-gradient-to-r ${option.color} shadow-lg`}
                >
                  {option.icon}
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                {option.title}
              </CardTitle>
              <CardDescription className="text-base text-gray-600 mb-4">
                {option.description}
              </CardDescription>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/80 text-sm font-medium text-gray-700">
                <Star className="w-4 h-4 mr-1 text-yellow-500" />
                {option.stats}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Link href={option.href}>
                <Button
                  className={`w-full bg-gradient-to-r ${option.color} hover:shadow-lg transition-all duration-300 group-hover:scale-105`}
                  size="lg"
                >
                  {option.buttonText}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Ajuda Rápida melhorada */}
      <div className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ajuda Rápida
          </h2>
          <p className="text-gray-600 text-lg">
            Encontre respostas para as dúvidas mais comuns
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickHelp.map((help, index) => (
            <Card
              key={index}
              className="hover:shadow-lg transition-all duration-300 hover:scale-105 group cursor-pointer border border-gray-100"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center group-hover:bg-gray-100 transition-colors duration-200">
                      {help.icon}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors duration-200">
                        {help.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                          {help.difficulty}
                        </span>
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full">
                          {help.time}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4 text-sm">
                      {help.description}
                    </p>
                    <Link href={help.href}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="group-hover:bg-purple-50 group-hover:border-purple-200 group-hover:text-purple-700 transition-all duration-200 text-purple-700"
                      >
                        Ver Resposta
                        <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Informações de Contato melhoradas */}
      <Card className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-0 shadow-xl animate-fade-in">
        <CardContent className="p-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-6 animate-pulse">
              <Headphones className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Precisa de ajuda imediata?
            </h2>
            <p className="text-gray-600 mb-8 text-lg">
              Nossa equipe está disponível para ajudar você com qualquer dúvida
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="flex items-center justify-center p-4 bg-white/80 rounded-xl hover:bg-white transition-colors duration-200">
                <MessageCircle className="w-6 h-6 text-green-500 mr-3" />
                <div className="text-left">
                  <div className="font-semibold text-gray-900">WhatsApp</div>
                  <div className="text-sm text-gray-600">(22) 99929-3439</div>
                </div>
              </div>
              <div className="flex items-center justify-center p-4 bg-white/80 rounded-xl hover:bg-white transition-colors duration-200">
                <Clock className="w-6 h-6 text-purple-500 mr-3" />
                <div className="text-left">
                  <div className="font-semibold text-gray-900">Horário</div>
                  <div className="text-sm text-gray-600">
                    Seg-Sex: 9h às 18h
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-lg transition-all duration-300"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Conversar no WhatsApp
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="hover:bg-purple-50 hover:border-purple-200 transition-all duration-300"
              >
                <Mail className="w-5 h-5 mr-2" />
                Enviar Email
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
