"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertTriangle,
  Calendar,
  Download,
  FileText,
  Mail,
  Shield,
  User,
} from "lucide-react";
import { useState } from "react";

export default function TermsOfUsePage() {
  const [activeSection, setActiveSection] = useState("acceptance");

  const sections = [
    {
      id: "acceptance",
      title: "1. Aceitação dos Termos",
      icon: <FileText className="w-5 h-5" />,
    },
    {
      id: "definitions",
      title: "2. Definições",
      icon: <User className="w-5 h-5" />,
    },
    {
      id: "services",
      title: "3. Serviços Oferecidos",
      icon: <Shield className="w-5 h-5" />,
    },
    {
      id: "obligations",
      title: "4. Obrigações do Usuário",
      icon: <AlertTriangle className="w-5 h-5" />,
    },
    {
      id: "payments",
      title: "5. Pagamentos e Taxas",
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      id: "privacy",
      title: "6. Privacidade e Dados",
      icon: <Shield className="w-5 h-5" />,
    },
    {
      id: "liability",
      title: "7. Limitação de Responsabilidade",
      icon: <AlertTriangle className="w-5 h-5" />,
    },
    {
      id: "modifications",
      title: "8. Modificações",
      icon: <FileText className="w-5 h-5" />,
    },
  ];

  const termsContent = {
    acceptance: {
      title: "Aceitação dos Termos",
      content: `
        <p>Estes Termos de Uso ("Termos") regem o uso da plataforma Cardap.IO ("Plataforma", "Serviço") operada pela empresa Cardap.IO Ltda. ("nós", "nossa", "nosso").</p>
        
        <p>Ao acessar ou usar nossa Plataforma, você concorda em ficar vinculado a estes Termos. Se você não concordar com qualquer parte destes termos, não deve usar nossa Plataforma.</p>
        
        <p>Estes Termos constituem um acordo legal entre você e a Cardap.IO Ltda. e devem ser lidos em conjunto com nossa Política de Privacidade.</p>
        
        <h3>1.1 Elegibilidade</h3>
        <p>Para usar nossa Plataforma, você deve:</p>
        <ul>
          <li>Ter pelo menos 18 anos de idade</li>
          <li>Ter capacidade legal para celebrar contratos</li>
          <li>Fornecer informações verdadeiras e precisas</li>
          <li>Manter a segurança de sua conta</li>
        </ul>
      `,
    },
    definitions: {
      title: "Definições",
      content: `
        <p>Para os fins destes Termos, as seguintes definições se aplicam:</p>
        
        <h3>2.1 Termos Principais</h3>
        <ul>
          <li><strong>"Plataforma"</strong>: O sistema Cardap.IO, incluindo website, aplicativo móvel e APIs</li>
          <li><strong>"Usuário"</strong>: Pessoa física ou jurídica que utiliza a Plataforma</li>
          <li><strong>"Loja"</strong>: Estabelecimento comercial cadastrado na Plataforma</li>
          <li><strong>"Cliente"</strong>: Consumidor final que faz pedidos através da Plataforma</li>
          <li><strong>"Pedido"</strong>: Solicitação de produtos ou serviços feita através da Plataforma</li>
        </ul>
        
        <h3>2.2 Tipos de Usuários</h3>
        <ul>
          <li><strong>Proprietário de Loja</strong>: Usuário que cadastra e gerencia uma loja na Plataforma</li>
          <li><strong>Funcionário</strong>: Usuário autorizado pelo Proprietário para gerenciar a loja</li>
          <li><strong>Cliente Final</strong>: Usuário que faz pedidos de produtos ou serviços</li>
        </ul>
      `,
    },
    services: {
      title: "Serviços Oferecidos",
      content: `
        <p>A Cardap.IO oferece uma plataforma digital que permite:</p>
        
        <h3>3.1 Para Proprietários de Loja</h3>
        <ul>
          <li>Criação e gerenciamento de cardápio digital</li>
          <li>Integração com sistemas de pagamento</li>
          <li>Integração com WhatsApp para recebimento de pedidos</li>
          <li>Ferramentas de gestão de pedidos e estoque</li>
          <li>Relatórios e analytics de vendas</li>
          <li>Integração com plataformas de delivery (iFood, etc.)</li>
        </ul>
        
        <h3>3.2 Para Clientes Finais</h3>
        <ul>
          <li>Visualização de cardápios digitais</li>
          <li>Realização de pedidos online</li>
          <li>Pagamento digital seguro</li>
          <li>Acompanhamento de pedidos em tempo real</li>
          <li>Comunicação direta com a loja</li>
        </ul>
        
        <h3>3.3 Disponibilidade do Serviço</h3>
        <p>Nos esforçamos para manter a Plataforma disponível 24/7, mas não garantimos disponibilidade ininterrupta. Podemos realizar manutenções programadas ou de emergência.</p>
      `,
    },
    obligations: {
      title: "Obrigações do Usuário",
      content: `
        <h3>4.1 Obrigações Gerais</h3>
        <p>Todos os usuários devem:</p>
        <ul>
          <li>Fornecer informações verdadeiras e atualizadas</li>
          <li>Manter a confidencialidade de suas credenciais</li>
          <li>Usar a Plataforma apenas para fins legais</li>
          <li>Respeitar os direitos de propriedade intelectual</li>
          <li>Não interferir no funcionamento da Plataforma</li>
        </ul>
        
        <h3>4.2 Obrigações dos Proprietários de Loja</h3>
        <ul>
          <li>Manter informações da loja atualizadas e precisas</li>
          <li>Garantir a qualidade dos produtos e serviços oferecidos</li>
          <li>Cumprir prazos de entrega estabelecidos</li>
          <li>Manter preços atualizados e transparentes</li>
          <li>Respeitar políticas de cancelamento e devolução</li>
          <li>Pagar taxas e comissões conforme acordado</li>
        </ul>
        
        <h3>4.3 Proibições</h3>
        <p>É expressamente proibido:</p>
        <ul>
          <li>Usar a Plataforma para atividades ilegais</li>
          <li>Vender produtos proibidos ou restritos</li>
          <li>Fazer spam ou comunicações não solicitadas</li>
          <li>Tentar hackear ou comprometer a segurança</li>
          <li>Usar contas falsas ou de terceiros</li>
        </ul>
      `,
    },
    payments: {
      title: "Pagamentos e Taxas",
      content: `
        <h3>5.1 Estrutura de Taxas</h3>
        <p>Nossa estrutura de taxas inclui:</p>
        <ul>
          <li><strong>Taxa de Cadastro</strong>: Gratuita para o plano básico</li>
          <li><strong>Taxa por Pedido</strong>: 2,9% do valor do pedido + R$ 0,39</li>
          <li><strong>Taxa de Integração</strong>: R$ 29,90/mês para integrações premium</li>
          <li><strong>Taxa de Pagamento</strong>: Conforme acordado com o processador</li>
        </ul>
        
        <h3>5.2 Formas de Pagamento</h3>
        <p>Aceitamos as seguintes formas de pagamento:</p>
        <ul>
          <li>Cartão de crédito (Visa, Mastercard, Elo)</li>
          <li>Cartão de débito</li>
          <li>PIX</li>
          <li>Boleto bancário</li>
        </ul>
        
        <h3>5.3 Repasse de Valores</h3>
        <p>Os valores dos pedidos são repassados conforme cronograma:</p>
        <ul>
          <li><strong>PIX</strong>: Imediato (após confirmação)</li>
          <li><strong>Cartão</strong>: 1 dia útil</li>
          <li><strong>Boleto</strong>: 2 dias úteis após compensação</li>
        </ul>
        
        <h3>5.4 Reembolsos</h3>
        <p>Reembolsos são processados conforme política da loja e regulamentações aplicáveis.</p>
      `,
    },
    privacy: {
      title: "Privacidade e Dados",
      content: `
        <h3>6.1 Coleta de Dados</h3>
        <p>Coletamos os seguintes tipos de dados:</p>
        <ul>
          <li><strong>Dados Pessoais</strong>: Nome, email, telefone, endereço</li>
          <li><strong>Dados de Pagamento</strong>: Processados por terceiros seguros</li>
          <li><strong>Dados de Uso</strong>: Interações com a Plataforma</li>
          <li><strong>Dados de Localização</strong>: Para entrega e serviços</li>
        </ul>
        
        <h3>6.2 Uso dos Dados</h3>
        <p>Utilizamos os dados para:</p>
        <ul>
          <li>Fornecer e melhorar nossos serviços</li>
          <li>Processar pedidos e pagamentos</li>
          <li>Comunicar com usuários</li>
          <li>Cumprir obrigações legais</li>
          <li>Análise e desenvolvimento de produtos</li>
        </ul>
        
        <h3>6.3 Compartilhamento</h3>
        <p>Compartilhamos dados apenas:</p>
        <ul>
          <li>Com processadores de pagamento</li>
          <li>Com prestadores de serviços de entrega</li>
          <li>Quando exigido por lei</li>
          <li>Com seu consentimento explícito</li>
        </ul>
        
        <h3>6.4 Segurança</h3>
        <p>Implementamos medidas de segurança técnicas e organizacionais para proteger seus dados.</p>
      `,
    },
    liability: {
      title: "Limitação de Responsabilidade",
      content: `
        <h3>7.1 Limitações Gerais</h3>
        <p>A Cardap.IO não se responsabiliza por:</p>
        <ul>
          <li>Danos indiretos, incidentais ou consequenciais</li>
          <li>Perda de lucros ou oportunidades de negócio</li>
          <li>Interrupções temporárias do serviço</li>
          <li>Ações de terceiros (entregadores, processadores de pagamento)</li>
        </ul>
        
        <h3>7.2 Responsabilidade do Usuário</h3>
        <p>O usuário é responsável por:</p>
        <ul>
          <li>Veracidade das informações fornecidas</li>
          <li>Qualidade dos produtos e serviços oferecidos</li>
          <li>Cumprimento de prazos e compromissos</li>
          <li>Respeito às leis e regulamentações aplicáveis</li>
        </ul>
        
        <h3>7.3 Limitação de Valor</h3>
        <p>Nossa responsabilidade total não excederá o valor pago pelo usuário nos últimos 12 meses.</p>
        
        <h3>7.4 Força Maior</h3>
        <p>Não seremos responsáveis por atrasos ou falhas causadas por eventos de força maior.</p>
      `,
    },
    modifications: {
      title: "Modificações",
      content: `
        <h3>8.1 Alterações nos Termos</h3>
        <p>Podemos modificar estes Termos a qualquer momento. As alterações entrarão em vigor:</p>
        <ul>
          <li>Imediatamente para novos usuários</li>
          <li>Após 30 dias para usuários existentes (com notificação)</li>
        </ul>
        
        <h3>8.2 Notificação de Mudanças</h3>
        <p>Notificaremos sobre mudanças significativas através de:</p>
        <ul>
          <li>Email para usuários cadastrados</li>
          <li>Notificação na Plataforma</li>
          <li>Atualização da data de vigência</li>
        </ul>
        
        <h3>8.3 Aceitação de Mudanças</h3>
        <p>O uso continuado da Plataforma após as mudanças constitui aceitação dos novos Termos.</p>
        
        <h3>8.4 Rescisão</h3>
        <p>Você pode rescindir sua conta a qualquer momento. Podemos suspender ou encerrar contas que violem estes Termos.</p>
        
        <h3>8.5 Disposições Finais</h3>
        <p>Estes Termos são regidos pelas leis brasileiras. Disputas serão resolvidas nos tribunais competentes de São Paulo/SP.</p>
      `,
    },
  };

  const currentContent =
    termsContent[activeSection as keyof typeof termsContent];

  return (
    <div className="p-8">
      {/* Header melhorado */}
      <div className="text-center mb-16 animate-fade-in">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-6 animate-float">
          <FileText className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          Termos de Uso
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
          Conheça os termos e condições que regem o uso da nossa plataforma
        </p>
        <div className="flex items-center justify-center space-x-6 text-sm text-gray-500 bg-gray-50 rounded-full px-6 py-3 inline-flex">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-purple-600" />
            <span className="font-medium">
              Última atualização: 10 de Setembro de 2025
            </span>
          </div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-blue-600" />
            <span className="font-medium">Versão 2.2</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navegação Lateral melhorada */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8 shadow-xl border border-gray-100 animate-slide-in-left">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-t-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <CardTitle className="text-lg font-bold text-gray-900">
                  Índice
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <nav className="space-y-1 p-4">
                {sections.map((section, index) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveSection(section.id);
                      document
                        .getElementById(section.id)
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`w-full text-left px-4 py-3 flex items-center space-x-3 text-sm transition-all duration-200 rounded-lg group ${
                      activeSection === section.id
                        ? "bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border border-purple-200 shadow-sm"
                        : "text-gray-700 hover:bg-gray-50 hover:text-purple-600"
                    }`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div
                      className={`transition-colors duration-200 ${
                        activeSection === section.id
                          ? "text-purple-600"
                          : "text-gray-500 group-hover:text-purple-600"
                      }`}
                    >
                      {section.icon}
                    </div>
                    <span className="font-medium">{section.title}</span>
                  </a>
                ))}
              </nav>
            </CardContent>
          </Card>

          {/* Ações melhoradas */}
          <div
            className="mt-6 space-y-3 animate-fade-in"
            style={{ animationDelay: "0.3s" }}
          >
            <Button
              variant="outline"
              className="w-full hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700 transition-all duration-200"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Baixar PDF
            </Button>
            <Button
              variant="outline"
              className="w-full hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all duration-200"
              size="sm"
            >
              <FileText className="w-4 h-4 mr-2" />
              Imprimir
            </Button>
          </div>
        </div>

        {/* Conteúdo Principal melhorado */}
        <div className="lg:col-span-3">
          {sections.map((section, index) => {
            const content =
              termsContent[section.id as keyof typeof termsContent];
            return (
              <div
                key={section.id}
                id={section.id}
                className="mb-12 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Card className="shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                  <CardHeader className="bg-gradient-to-r from-gray-50 to-purple-50 rounded-t-lg">
                    <CardTitle className="text-2xl flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                        <div className="text-white">{section.icon}</div>
                      </div>
                      <span className="text-gray-900">{content.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div
                      className="prose prose-lg prose-gray max-w-none [&_p]:text-gray-700 [&_h3]:text-gray-900 [&_ul]:text-gray-700 [&_li]:text-gray-700 [&_strong]:text-gray-900 [&_h3]:font-bold [&_h3]:text-xl [&_h3]:mb-4 [&_p]:leading-relaxed [&_ul]:space-y-2 [&_li]:leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: content.content }}
                    />
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rodapé com informações legais melhorado */}
      <Card className="mt-16 bg-gradient-to-r from-purple-50 via-blue-50 to-pink-50 border-0 shadow-xl animate-fade-in">
        <CardContent className="p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-6 animate-pulse">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Dúvidas sobre os Termos?
          </h3>
          <p className="text-gray-600 mb-8 text-lg max-w-2xl mx-auto">
            Nossa equipe jurídica está disponível para esclarecer qualquer
            dúvida sobre nossos termos e condições
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="gradient"
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:shadow-lg transition-all duration-300"
            >
              <Shield className="w-5 h-5 mr-2" />
              Falar com Suporte Jurídico
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
        </CardContent>
      </Card>
    </div>
  );
}
