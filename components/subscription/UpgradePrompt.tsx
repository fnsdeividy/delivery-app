'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Crown, Zap, CheckCircle, XCircle } from 'lucide-react';

interface SubscriptionInfo {
  plan: 'BASIC' | 'PRO';
  status: 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  isTrial: boolean;
  isTrialExpired: boolean;
  trialEndsAt?: string;
  limits: {
    maxStores: number;
    maxProducts: number;
    maxOrdersPerMonth: number;
    analytics: boolean;
    whatsappIntegration: boolean;
    ifoodIntegration: boolean;
    customDomain: boolean;
    prioritySupport: boolean;
  };
  canUpgrade: boolean;
}

interface UpgradePromptProps {
  subscriptionInfo?: SubscriptionInfo;
  onUpgrade?: () => void;
  onStartTrial?: () => void;
  className?: string;
}

export function UpgradePrompt({ 
  subscriptionInfo, 
  onUpgrade, 
  onStartTrial,
  className 
}: UpgradePromptProps) {
  const [trialDaysRemaining, setTrialDaysRemaining] = useState<number>(0);

  useEffect(() => {
    if (subscriptionInfo?.isTrial && subscriptionInfo.trialEndsAt) {
      const now = new Date();
      const trialEnd = new Date(subscriptionInfo.trialEndsAt);
      const diffTime = trialEnd.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setTrialDaysRemaining(Math.max(0, diffDays));
    }
  }, [subscriptionInfo]);

  if (!subscriptionInfo) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Inicie seu Trial Gratuito
          </CardTitle>
          <CardDescription>
            Teste todas as funcionalidades por 7 dias sem compromisso
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onStartTrial} className="w-full">
            <Zap className="mr-2 h-4 w-4" />
            Começar Trial Gratuito
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (subscriptionInfo.isTrialExpired) {
    return (
      <Alert className={className}>
        <XCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <div>
              <strong>Seu trial expirou!</strong>
              <p className="text-sm text-muted-foreground mt-1">
                Faça upgrade para continuar usando a plataforma.
              </p>
            </div>
            <Button onClick={onUpgrade} size="sm">
              Fazer Upgrade
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (subscriptionInfo.isTrial && trialDaysRemaining > 0) {
    return (
      <Alert className={className}>
        <Zap className="h-4 w-4" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <div>
              <strong>Trial ativo - {trialDaysRemaining} dias restantes</strong>
              <p className="text-sm text-muted-foreground mt-1">
                Aproveite para testar todas as funcionalidades!
              </p>
            </div>
            <Button onClick={onUpgrade} size="sm" variant="outline">
              Fazer Upgrade Agora
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (subscriptionInfo.plan === 'BASIC' && subscriptionInfo.canUpgrade) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Upgrade para PRO
          </CardTitle>
          <CardDescription>
            Desbloqueie funcionalidades avançadas e aumente seus limites
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Analytics Avançados</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Integração WhatsApp</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Integração iFood</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Domínio Customizado</span>
              </div>
            </div>
            <Button onClick={onUpgrade} className="w-full">
              <Crown className="mr-2 h-4 w-4" />
              Fazer Upgrade para PRO
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}

interface PlanComparisonProps {
  currentPlan: 'BASIC' | 'PRO';
  onUpgrade?: () => void;
  className?: string;
}

export function PlanComparison({ currentPlan, onUpgrade, className }: PlanComparisonProps) {
  const plans = [
    {
      name: 'BASIC',
      displayName: 'Plano Básico',
      price: 'R$ 29,90/mês',
      features: [
        '1 loja',
        'Até 50 produtos',
        'Até 100 pedidos/mês',
        'Suporte por email',
        'Trial de 7 dias'
      ],
      current: currentPlan === 'BASIC'
    },
    {
      name: 'PRO',
      displayName: 'Plano Pro',
      price: 'R$ 79,90/mês',
      features: [
        'Até 5 lojas',
        'Até 500 produtos',
        'Até 1000 pedidos/mês',
        'Analytics avançados',
        'Integração WhatsApp',
        'Integração iFood',
        'Domínio customizado',
        'Suporte prioritário',
        'Trial de 7 dias'
      ],
      current: currentPlan === 'PRO',
      popular: true
    }
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${className}`}>
      {plans.map((plan) => (
        <Card key={plan.name} className={plan.popular ? 'ring-2 ring-yellow-500' : ''}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{plan.displayName}</CardTitle>
              {plan.popular && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  Mais Popular
                </Badge>
              )}
              {plan.current && (
                <Badge variant="outline">Plano Atual</Badge>
              )}
            </div>
            <div className="text-2xl font-bold">{plan.price}</div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>
            {!plan.current && plan.name === 'PRO' && (
              <Button onClick={onUpgrade} className="w-full">
                <Crown className="mr-2 h-4 w-4" />
                Fazer Upgrade
              </Button>
            )}
            {plan.current && (
              <Button variant="outline" className="w-full" disabled>
                Plano Atual
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
