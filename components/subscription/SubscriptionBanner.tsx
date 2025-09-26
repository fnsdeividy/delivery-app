'use client';

import React from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { UpgradePrompt } from './UpgradePrompt';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Crown, Zap, Clock, XCircle } from 'lucide-react';
import Link from 'next/link';

interface SubscriptionBannerProps {
  className?: string;
  showOnTrial?: boolean;
  showOnBasic?: boolean;
  showOnExpired?: boolean;
}

export function SubscriptionBanner({
  className,
  showOnTrial = true,
  showOnBasic = true,
  showOnExpired = true
}: SubscriptionBannerProps) {
  const { subscriptionInfo, getTrialDaysRemaining, isTrialValid, needsUpgrade } = useSubscription();

  if (!subscriptionInfo) {
    return null;
  }

  // Não mostrar se não atender aos critérios
  if (subscriptionInfo.isTrial && !showOnTrial) return null;
  if (subscriptionInfo.plan === 'BASIC' && !showOnBasic) return null;
  if (subscriptionInfo.isTrialExpired && !showOnExpired) return null;

  // Trial expirado
  if (subscriptionInfo.isTrialExpired) {
    return (
      <Alert className={`border-red-200 bg-red-50 ${className}`}>
        <XCircle className="h-4 w-4 text-red-500" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <strong className="text-red-800">Seu trial expirou!</strong>
            <p className="text-sm text-red-600 mt-1">
              Faça upgrade para continuar usando a plataforma.
            </p>
          </div>
          <Button asChild size="sm" className="bg-red-600 hover:bg-red-700">
            <Link href="/assinatura">
              <Crown className="mr-2 h-4 w-4" />
              Fazer Upgrade
            </Link>
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Trial ativo
  if (subscriptionInfo.isTrial && isTrialValid()) {
    const daysRemaining = getTrialDaysRemaining();

    return (
      <Alert className={`border-blue-200 bg-blue-50 ${className}`}>
        <Clock className="h-4 w-4 text-blue-500" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <strong className="text-blue-800">Trial ativo - {daysRemaining} dias restantes</strong>
            <p className="text-sm text-blue-600 mt-1">
              Aproveite para testar todas as funcionalidades!
            </p>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link href="/assinatura">
              <Zap className="mr-2 h-4 w-4" />
              Fazer Upgrade
            </Link>
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Plano Basic com possibilidade de upgrade
  if (subscriptionInfo.plan === 'BASIC' && subscriptionInfo.canUpgrade) {
    return (
      <Alert className={`border-yellow-200 bg-yellow-50 ${className}`}>
        <Crown className="h-4 w-4 text-yellow-500" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <strong className="text-yellow-800">Desbloqueie funcionalidades PRO!</strong>
            <p className="text-sm text-yellow-600 mt-1">
              Analytics, WhatsApp, iFood e muito mais no plano PRO.
            </p>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link href="/assinatura">
              <Crown className="mr-2 h-4 w-4" />
              Fazer Upgrade
            </Link>
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}

interface FeatureLockProps {
  feature: string;
  children: React.ReactNode;
  className?: string;
}

export function FeatureLock({ feature, children, className }: FeatureLockProps) {
  const { canAccess, subscriptionInfo } = useSubscription();

  // Se tem acesso, renderiza normalmente
  if (canAccess(feature as any)) {
    return <>{children}</>;
  }

  // Se não tem acesso, mostra lock
  return (
    <div className={`relative ${className}`}>
      <div className="opacity-50 pointer-events-none">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
        <div className="bg-white p-4 rounded-lg shadow-lg text-center">
          <Crown className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
          <h3 className="font-semibold text-gray-800 mb-1">
            Funcionalidade PRO
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            Esta funcionalidade está disponível apenas no plano PRO.
          </p>
          <Button asChild size="sm">
            <Link href="/assinatura">
              <Crown className="mr-2 h-4 w-4" />
              Fazer Upgrade
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

interface LimitWarningProps {
  resource: 'stores' | 'products' | 'orders';
  current: number;
  max: number;
  className?: string;
}

export function LimitWarning({ resource, current, max, className }: LimitWarningProps) {
  const { subscriptionInfo } = useSubscription();

  if (!subscriptionInfo) return null;

  const percentage = (current / max) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = current >= max;

  if (!isNearLimit && !isAtLimit) return null;

  const resourceNames = {
    stores: 'lojas',
    products: 'produtos',
    orders: 'pedidos'
  };

  return (
    <Alert className={`${isAtLimit ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'} ${className}`}>
      <XCircle className={`h-4 w-4 ${isAtLimit ? 'text-red-500' : 'text-yellow-500'}`} />
      <AlertDescription>
        <div className="flex items-center justify-between">
          <div>
            <strong className={isAtLimit ? 'text-red-800' : 'text-yellow-800'}>
              {isAtLimit ? 'Limite atingido!' : 'Limite quase atingido!'}
            </strong>
            <p className={`text-sm mt-1 ${isAtLimit ? 'text-red-600' : 'text-yellow-600'}`}>
              Você está usando {current} de {max} {resourceNames[resource]} permitidos no plano {subscriptionInfo.plan}.
            </p>
          </div>
          <Button asChild size="sm" variant={isAtLimit ? 'default' : 'outline'}>
            <Link href="/assinatura">
              <Crown className="mr-2 h-4 w-4" />
              {isAtLimit ? 'Fazer Upgrade' : 'Ver Planos'}
            </Link>
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
