'use client';

import React, { useState } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { UpgradePrompt, PlanComparison } from '@/components/subscription/UpgradePrompt';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Crown, Zap, CheckCircle, XCircle, Clock, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

export default function AssinaturaPage() {
  const {
    subscriptionInfo,
    availablePlans,
    loading,
    error,
    startTrial,
    upgradePlan,
    cancelSubscription,
    getTrialDaysRemaining,
    isTrialValid,
    needsUpgrade,
  } = useSubscription();

  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isStartingTrial, setIsStartingTrial] = useState(false);

  const handleStartTrial = async () => {
    try {
      setIsStartingTrial(true);
      await startTrial('BASIC');
      toast.success('Trial iniciado com sucesso! Você tem 7 dias gratuitos.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao iniciar trial');
    } finally {
      setIsStartingTrial(false);
    }
  };

  const handleUpgrade = async (plan: 'BASIC' | 'PRO') => {
    try {
      setIsUpgrading(true);
      await upgradePlan(plan);
      toast.success(`Upgrade realizado com sucesso para o plano ${plan}!`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao fazer upgrade');
    } finally {
      setIsUpgrading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar informações da assinatura: {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Assinatura</h1>
          <p className="text-muted-foreground">
            Gerencie seu plano e funcionalidades
          </p>
        </div>
        {subscriptionInfo && (
          <Badge variant={subscriptionInfo.plan === 'PRO' ? 'default' : 'secondary'}>
            {subscriptionInfo.plan}
          </Badge>
        )}
      </div>

      {/* Status da Assinatura */}
      {subscriptionInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {subscriptionInfo.isTrial ? (
                <Clock className="h-5 w-5 text-blue-500" />
              ) : (
                <CreditCard className="h-5 w-5 text-green-500" />
              )}
              Status da Assinatura
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Plano Atual</p>
                <p className="text-lg font-semibold">{subscriptionInfo.plan}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-lg font-semibold">{subscriptionInfo.status}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {subscriptionInfo.isTrial ? 'Dias Restantes' : 'Período Atual'}
                </p>
                <p className="text-lg font-semibold">
                  {subscriptionInfo.isTrial
                    ? `${getTrialDaysRemaining()} dias`
                    : 'Ativo'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prompt de Upgrade */}
      <UpgradePrompt
        subscriptionInfo={subscriptionInfo || undefined}
        onUpgrade={() => handleUpgrade('PRO')}
        onStartTrial={handleStartTrial}
      />

      {/* Comparação de Planos */}
      <Tabs defaultValue="plans" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="plans">Planos Disponíveis</TabsTrigger>
          <TabsTrigger value="features">Funcionalidades</TabsTrigger>
        </TabsList>

        <TabsContent value="plans">
          <PlanComparison
            currentPlan={subscriptionInfo?.plan || 'BASIC'}
            onUpgrade={() => handleUpgrade('PRO')}
          />
        </TabsContent>

        <TabsContent value="features">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {availablePlans.map((plan) => (
              <Card key={plan.name}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {plan.name === 'PRO' && <Crown className="h-5 w-5 text-yellow-500" />}
                    {plan.displayName}
                  </CardTitle>
                  <CardDescription>{plan.price}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>{plan.limits.maxStores} loja{plan.limits.maxStores > 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>{plan.limits.maxProducts} produtos</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>{plan.limits.maxOrdersPerMonth} pedidos/mês</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {plan.limits.analytics ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span>Analytics</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {plan.limits.whatsappIntegration ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span>WhatsApp</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {plan.limits.ifoodIntegration ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span>iFood</span>
                      </div>
                    </div>

                    {plan.name === 'PRO' && subscriptionInfo?.plan !== 'PRO' && (
                      <Button
                        onClick={() => handleUpgrade('PRO')}
                        disabled={isUpgrading}
                        className="w-full"
                      >
                        <Crown className="mr-2 h-4 w-4" />
                        {isUpgrading ? 'Fazendo Upgrade...' : 'Fazer Upgrade'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Ações da Assinatura */}
      {subscriptionInfo && (
        <Card>
          <CardHeader>
            <CardTitle>Ações da Assinatura</CardTitle>
            <CardDescription>
              Gerencie sua assinatura e configurações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!subscriptionInfo.isTrial && (
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => cancelSubscription()}
                  className="text-red-600 hover:text-red-700"
                >
                  Cancelar Assinatura
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open('/suporte', '_blank')}
                >
                  Entrar em Contato
                </Button>
              </div>
            )}

            {subscriptionInfo.isTrial && (
              <Alert>
                <Zap className="h-4 w-4" />
                <AlertDescription>
                  <strong>Trial ativo!</strong> Você tem {getTrialDaysRemaining()} dias restantes.
                  Aproveite para testar todas as funcionalidades antes de fazer o upgrade.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
