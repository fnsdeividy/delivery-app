"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ArrowRight,
  CheckCircle,
  Mail,
  MessageCircle,
  Send,
} from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    priority: "normal",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simular envio do formulário
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    setIsSubmitted(true);

    // Resetar formulário após 3 segundos
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
        priority: "normal",
      });
    }, 3000);
  };

  const contactMethods = [
    {
      icon: <MessageCircle className="w-8 h-8 text-green-500" />,
      title: "WhatsApp",
      description: "Resposta rápida em até 2 horas",
      contact: "(22) 99929-3439",
      action: "Conversar no WhatsApp",
      href: "https://wa.me/5522999293439",
    },
    {
      icon: <Mail className="w-8 h-8 text-purple-500" />,
      title: "Email",
      description: "Resposta em até 24 horas",
      contact: "suporte@cardap.io",
      action: "Enviar email",
      href: "mailto:suporte@cardap.io",
    },
  ];

  if (isSubmitted) {
    return (
      <div className="p-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Mensagem Enviada!
            </h1>
            <p className="text-gray-600 text-lg">
              Obrigado pelo seu contato. Nossa equipe responderá em breve.
            </p>
          </div>
          <Button
            variant="gradient"
            size="lg"
            onClick={() => setIsSubmitted(false)}
          >
            Enviar Nova Mensagem
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header melhorado */}
      <div className="text-center mb-16 animate-fade-in">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mb-6 animate-float">
          <Mail className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          Entre em Contato
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Estamos aqui para ajudar! Escolha a forma mais conveniente para entrar
          em contato conosco.
        </p>
      </div>

      {/* Métodos de Contato melhorados */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {contactMethods.map((method, index) => (
          <Card
            key={index}
            className="text-center hover:shadow-2xl transition-all duration-300 hover:scale-105 group cursor-pointer border border-gray-100"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <CardHeader className="pb-4">
              <div className="flex justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100 group-hover:from-purple-50 group-hover:to-blue-50 transition-all duration-300">
                  {method.icon}
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors duration-200">
                {method.title}
              </CardTitle>
              <CardDescription className="text-base text-gray-600 mb-4">
                {method.description}
              </CardDescription>
              <div className="text-sm font-medium text-gray-500 mb-4">
                {method.contact}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <a href={method.href} target="_blank" rel="noopener noreferrer">
                <Button
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:shadow-lg transition-all duration-300 group-hover:scale-105"
                  size="lg"
                >
                  {method.action}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                </Button>
              </a>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        {/* Formulário de Contato melhorado */}
        <div className="lg:col-span-3">
          <Card className="shadow-xl border border-gray-100">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-t-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Send className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    Envie uma Mensagem
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Preencha o formulário abaixo e entraremos em contato em
                    breve
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label
                      htmlFor="name"
                      className="block text-sm font-semibold text-gray-700"
                    >
                      Nome Completo *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Seu nome completo"
                      className="border-2 border-gray-200 focus:border-purple-500 rounded-lg py-3 px-4 transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="block text-sm font-semibold text-gray-700"
                    >
                      Email *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="seu@email.com"
                      className="border-2 border-gray-200 focus:border-purple-500 rounded-lg py-3 px-4 transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="subject"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Assunto *
                  </label>
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    required
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="Qual é o assunto da sua mensagem?"
                    className="border-2 border-gray-200 focus:border-purple-500 rounded-lg py-3 px-4 transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="priority"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Prioridade
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="low">🟢 Baixa</option>
                    <option value="normal">🟡 Normal</option>
                    <option value="high">🟠 Alta</option>
                    <option value="urgent">🔴 Urgente</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="message"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Mensagem *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Descreva sua dúvida ou solicitação..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-vertical transition-all duration-200"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:shadow-lg transition-all duration-300 py-4 text-lg font-semibold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Enviando mensagem...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-3" />
                      Enviar Mensagem
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
