"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  DollarSign,
  HelpCircle,
  Mail,
  MessageCircle,
  Search,
  Settings,
  ShoppingBag,
  Users,
} from "lucide-react";
import { useState } from "react";

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const faqCategories = [
    {
      id: "getting-started",
      title: "Primeiros Passos",
      icon: <BookOpen className="w-5 h-5" />,
      items: [
        {
          id: "criar-loja",
          question: "Como criar minha primeira loja?",
          answer:
            "Para criar sua primeira loja, acesse o dashboard e clique em 'Criar Nova Loja'. Preencha as informações básicas como nome, descrição e endereço. Em seguida, configure suas categorias e produtos.",
        },
        {
          id: "configurar-perfil",
          question: "Como configurar meu perfil de usuário?",
          answer:
            "Acesse 'Configurações' no menu lateral e preencha suas informações pessoais. Certifique-se de adicionar uma foto e verificar seu email para receber notificações importantes.",
        },
        {
          id: "primeiro-produto",
          question: "Como adicionar meu primeiro produto?",
          answer:
            "No dashboard da sua loja, vá em 'Produtos' e clique em 'Adicionar Produto'. Preencha nome, descrição, preço e adicione fotos. Configure a disponibilidade e categorias do produto.",
        },
      ],
    },
    {
      id: "loja-configuration",
      title: "Configuração da Loja",
      icon: <Settings className="w-5 h-5" />,
      items: [
        {
          id: "configurar-pagamentos",
          question: "Como configurar métodos de pagamento?",
          answer:
            "Acesse 'Configurações' > 'Pagamentos' e configure os métodos disponíveis. Suportamos PIX, cartão de crédito/débito e dinheiro. Configure as taxas e prazos de recebimento.",
        },
        {
          id: "whatsapp",
          question: "Como integrar com WhatsApp?",
          answer:
            "Vá em 'Configurações' > 'Integrações' > 'WhatsApp' e conecte sua conta. Configure as mensagens automáticas e notificações de pedidos.",
        },
        {
          id: "delivery-config",
          question: "Como configurar entrega e retirada?",
          answer:
            "Em 'Configurações' > 'Entrega', defina as áreas de entrega, valores de frete e horários de funcionamento. Configure também as opções de retirada no local.",
        },
        {
          id: "dominio-personalizado",
          question: "Posso usar meu próprio domínio?",
          answer:
            "Sim, você pode configurar um domínio personalizado para sua loja. Acesse 'Configurações' > 'Domínio' e siga as instruções para apontar seu domínio para nossos servidores.",
        },
      ],
    },
    {
      id: "orders-management",
      title: "Gestão de Pedidos",
      icon: <ShoppingBag className="w-5 h-5" />,
      items: [
        {
          id: "gerenciar-pedidos",
          question: "Como gerenciar pedidos recebidos?",
          answer:
            "Acesse 'Pedidos' no dashboard para ver todos os pedidos. Use os filtros para organizar por status, data ou cliente. Clique em um pedido para ver detalhes e atualizar status.",
        },
        {
          id: "status-pedidos",
          question: "Quais são os status dos pedidos?",
          answer:
            "Os status são: Pendente (aguardando confirmação), Confirmado (em preparo), Pronto (aguardando entrega/retirada), Em Trânsito (sendo entregue) e Entregue (finalizado).",
        },
        {
          id: "notificacoes",
          question: "Como funcionam as notificações?",
          answer:
            "Você recebe notificações por email e WhatsApp para novos pedidos, mudanças de status e mensagens de clientes. Configure suas preferências em 'Configurações' > 'Notificações'.",
        },
      ],
    },
    {
      id: "financeiro",
      title: "Financeiro",
      icon: <DollarSign className="w-5 h-5" />,
      items: [
        {
          id: "ver-faturamento",
          question: "Como ver meu faturamento?",
          answer:
            "Acesse o 'Dashboard' para ter uma visão geral do seu faturamento. Para relatórios detalhados, vá em 'Relatórios' > 'Financeiro'.",
        },
        {
          id: "taxas",
          question: "Quais são as taxas da plataforma?",
          answer:
            "As taxas variam de acordo com seu plano e os métodos de pagamento utilizados. Você pode ver um detalhamento completo em 'Configurações' > 'Plano e Cobrança'.",
        },
      ],
    },
    {
      id: "clientes",
      title: "Clientes",
      icon: <Users className="w-5 h-5" />,
      items: [
        {
          id: "ver-clientes",
          question: "Onde vejo minha lista de clientes?",
          answer:
            "Acesse a seção 'Clientes' no menu lateral para ver todos os seus clientes, histórico de pedidos e informações de contato.",
        },
        {
          id: "exportar-clientes",
          question: "Posso exportar minha lista de clientes?",
          answer:
            "Sim, na seção 'Clientes', você encontrará a opção de exportar sua lista de clientes em formato CSV.",
        },
      ],
    },
  ];

  const filteredCategories = faqCategories
    .map((category) => ({
      ...category,
      items: category.items.filter(
        (item) =>
          item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.answer.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((category) => category.items.length > 0);

  return (
    <div className="p-8">
      {/* Header melhorado */}
      <div className="mb-12 animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4 animate-float">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Central de Ajuda
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Encontre respostas para suas dúvidas e aprenda a usar nossa
            plataforma
          </p>
        </div>

        {/* Barra de Pesquisa melhorada */}
        <div className="relative max-w-3xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
            <Input
              type="text"
              placeholder="Pesquisar na central de ajuda..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-4 text-lg border-2 border-gray-200 focus:border-purple-500 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                ✕
              </button>
            )}
          </div>
          {searchQuery && (
            <div className="mt-2 text-sm text-gray-500 text-center">
              {filteredCategories.reduce(
                (total, cat) => total + cat.items.length,
                0
              )}{" "}
              resultado(s) encontrado(s)
            </div>
          )}
        </div>
      </div>

      {/* FAQ por Categoria melhorado */}
      <div className="space-y-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Perguntas Frequentes
          </h2>
          <p className="text-gray-600 text-lg">
            Encontre respostas rápidas para as dúvidas mais comuns
          </p>
        </div>

        {filteredCategories.map((category, categoryIndex) => (
          <div
            key={category.id}
            className="animate-fade-in"
            style={{ animationDelay: `${categoryIndex * 0.1}s` }}
          >
            <div className="flex items-center mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mr-4">
                <div className="text-white">{category.icon}</div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                {category.title}
              </h3>
            </div>

            <div className="space-y-3">
              {category.items.map((item, itemIndex) => (
                <Card
                  key={item.id}
                  className="hover:shadow-lg transition-all duration-300 border border-gray-100"
                  style={{
                    animationDelay: `${
                      categoryIndex * 0.1 + itemIndex * 0.05
                    }s`,
                  }}
                >
                  <CardContent className="p-0">
                    <button
                      onClick={() => toggleExpanded(item.id)}
                      className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-gray-50 group transition-colors duration-200"
                    >
                      <span className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors duration-200 text-lg">
                        {item.question}
                      </span>
                      <div className="flex items-center">
                        {expandedItems.has(item.id) ? (
                          <ChevronDown className="w-5 h-5 text-purple-600 transform transition-transform duration-200" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-purple-600 transition-colors duration-200" />
                        )}
                      </div>
                    </button>

                    {expandedItems.has(item.id) && (
                      <div className="px-6 pb-6 border-t border-gray-100">
                        <div className="pt-4">
                          <p className="text-gray-700 leading-relaxed text-base">
                            {item.answer}
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Ainda Precisa de Ajuda? melhorado */}
      <Card className="mt-16 bg-gradient-to-r from-purple-50 via-blue-50 to-pink-50 border-0 shadow-xl animate-fade-in">
        <CardContent className="p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-6 animate-pulse">
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ainda precisa de ajuda?
          </h2>
          <p className="text-gray-600 mb-8 text-lg max-w-2xl mx-auto">
            Nossa equipe está pronta para ajudar você com qualquer dúvida. Entre
            em contato conosco e receba suporte personalizado.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="gradient"
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:shadow-lg transition-all duration-300"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Entrar em Contato
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="hover:bg-purple-50 hover:border-purple-200 transition-all duration-300 text-purple-700"
            >
              <Mail className="w-5 h-5 mr-2 text-purple-700" />
              Enviar Email
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
