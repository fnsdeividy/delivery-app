'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

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

interface PlanInfo {
  name: string;
  displayName: string;
  price: string;
  features: string[];
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
}

export function useSubscription() {
  const { user, isAuthenticated } = useAuth();
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [availablePlans, setAvailablePlans] = useState<PlanInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar informações da assinatura
  const fetchSubscriptionInfo = async () => {
    if (!isAuthenticated || !user) return;

    try {
      setLoading(true);
      const response = await fetch('/api/v1/subscription/info', {
        headers: {
          'Authorization': `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar informações da assinatura');
      }

      const data = await response.json();
      setSubscriptionInfo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  // Buscar planos disponíveis
  const fetchAvailablePlans = async () => {
    try {
      const response = await fetch('/api/v1/subscription/plans');
      
      if (!response.ok) {
        throw new Error('Erro ao buscar planos disponíveis');
      }

      const data = await response.json();
      setAvailablePlans(data.plans);
    } catch (err) {
      console.error('Erro ao buscar planos:', err);
    }
  };

  // Iniciar trial
  const startTrial = async (plan: 'BASIC' | 'PRO' = 'BASIC') => {
    if (!isAuthenticated || !user) return;

    try {
      setLoading(true);
      const response = await fetch('/api/v1/subscription/trial', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao iniciar trial');
      }

      const data = await response.json();
      setSubscriptionInfo(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fazer upgrade
  const upgradePlan = async (plan: 'BASIC' | 'PRO') => {
    if (!isAuthenticated || !user) return;

    try {
      setLoading(true);
      const response = await fetch('/api/v1/subscription/upgrade', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao fazer upgrade');
      }

      const data = await response.json();
      setSubscriptionInfo(data.newLimits);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Cancelar assinatura
  const cancelSubscription = async () => {
    if (!isAuthenticated || !user) return;

    try {
      setLoading(true);
      const response = await fetch('/api/v1/subscription/cancel', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao cancelar assinatura');
      }

      const data = await response.json();
      await fetchSubscriptionInfo(); // Recarregar informações
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Verificar acesso a módulo
  const checkModuleAccess = async (module: string): Promise<boolean> => {
    if (!isAuthenticated || !user) return false;

    try {
      const response = await fetch('/api/v1/subscription/check-access', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ module }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.hasAccess;
    } catch (err) {
      console.error('Erro ao verificar acesso ao módulo:', err);
      return false;
    }
  };

  // Obter dias restantes do trial
  const getTrialDaysRemaining = (): number => {
    if (!subscriptionInfo?.isTrial || !subscriptionInfo.trialEndsAt) {
      return 0;
    }

    const now = new Date();
    const trialEnd = new Date(subscriptionInfo.trialEndsAt);
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
  };

  // Verificar se pode acessar recurso
  const canAccess = (resource: keyof SubscriptionInfo['limits']): boolean => {
    if (!subscriptionInfo) return false;
    return subscriptionInfo.limits[resource];
  };

  // Verificar se está em trial válido
  const isTrialValid = (): boolean => {
    if (!subscriptionInfo?.isTrial) return false;
    return !subscriptionInfo.isTrialExpired && getTrialDaysRemaining() > 0;
  };

  // Verificar se precisa de upgrade
  const needsUpgrade = (): boolean => {
    if (!subscriptionInfo) return true;
    return subscriptionInfo.isTrialExpired || 
           (subscriptionInfo.plan === 'BASIC' && subscriptionInfo.canUpgrade);
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchSubscriptionInfo();
      fetchAvailablePlans();
    }
  }, [isAuthenticated, user]);

  return {
    subscriptionInfo,
    availablePlans,
    loading,
    error,
    startTrial,
    upgradePlan,
    cancelSubscription,
    checkModuleAccess,
    getTrialDaysRemaining,
    canAccess,
    isTrialValid,
    needsUpgrade,
    refreshSubscription: fetchSubscriptionInfo,
  };
}
