'use client';

import React from 'react';
import { SubscriptionBanner, FeatureLock, LimitWarning } from '@/components/subscription/SubscriptionBanner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Users, ShoppingCart } from 'lucide-react';

export default function AnalyticsPage() {
  // Simulando dados (em produção, viriam de uma API)
  const mockData = {
    totalOrders: 150,
    totalProducts: 25,
    totalStores: 1,
    maxOrders: 100, // Limite do plano Basic
    maxProducts: 50,
    maxStores: 1,
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Acompanhe o desempenho da sua loja
          </p>
        </div>
      </div>

      {/* Banner de assinatura */}
      <SubscriptionBanner
        showOnTrial={true}
        showOnBasic={true}
        showOnExpired={true}
      />

      {/* Avisos de limite */}
      <LimitWarning
        resource="orders"
        current={mockData.totalOrders}
        max={mockData.maxOrders}
      />

      <LimitWarning
        resource="products"
        current={mockData.totalProducts}
        max={mockData.maxProducts}
      />

      {/* Cards de métricas básicas (sempre visíveis) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              +20.1% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              +5 novos produtos este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lojas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockData.totalStores}</div>
            <p className="text-xs text-muted-foreground">
              Lojas ativas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics avançados (apenas PRO) */}
      <FeatureLock feature="analytics">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Vendas por Período
              </CardTitle>
              <CardDescription>
                Acompanhe o desempenho das suas vendas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Gráfico de vendas apareceria aqui</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Produtos Mais Vendidos
              </CardTitle>
              <CardDescription>
                Top 5 produtos com melhor desempenho
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: 'Pizza Margherita', sales: 45, revenue: 'R$ 675,00' },
                  { name: 'Hambúrguer Clássico', sales: 32, revenue: 'R$ 480,00' },
                  { name: 'Coca-Cola 350ml', sales: 28, revenue: 'R$ 84,00' },
                  { name: 'Batata Frita', sales: 25, revenue: 'R$ 125,00' },
                  { name: 'Salada Caesar', sales: 18, revenue: 'R$ 162,00' },
                ].map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.sales} vendas</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{product.revenue}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </FeatureLock>

      {/* Integração WhatsApp (apenas PRO) */}
      <FeatureLock feature="whatsappIntegration">
        <Card>
          <CardHeader>
            <CardTitle>Integração WhatsApp</CardTitle>
            <CardDescription>
              Configure notificações automáticas via WhatsApp
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Funcionalidades WhatsApp</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Notificações automáticas de pedidos</li>
                  <li>• Confirmação de pedidos via WhatsApp</li>
                  <li>• Chat automatizado com clientes</li>
                  <li>• Relatórios de conversas</li>
                </ul>
              </div>
              <Button className="w-full">
                Configurar WhatsApp
              </Button>
            </div>
          </CardContent>
        </Card>
      </FeatureLock>

      {/* Integração iFood (apenas PRO) */}
      <FeatureLock feature="ifoodIntegration">
        <Card>
          <CardHeader>
            <CardTitle>Integração iFood</CardTitle>
            <CardDescription>
              Sincronize seu cardápio com o iFood
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-orange-50 rounded-lg">
                <h4 className="font-semibold text-orange-800 mb-2">Funcionalidades iFood</h4>
                <ul className="text-sm text-orange-700 space-y-1">
                  <li>• Sincronização automática de produtos</li>
                  <li>• Gestão de preços unificada</li>
                  <li>• Controle de estoque integrado</li>
                  <li>• Relatórios de vendas do iFood</li>
                </ul>
              </div>
              <Button className="w-full">
                Conectar com iFood
              </Button>
            </div>
          </CardContent>
        </Card>
      </FeatureLock>
    </div>
  );
}
