"use client";

import { useTrialStatus } from "@/hooks/useTrialStatus";
import { AlertCircle, Clock, Crown } from "lucide-react";

export function TrialBanner() {
  const { data: trialStatus, isLoading } = useTrialStatus();

  // Não mostrar se estiver carregando ou se não há trial ativo
  if (isLoading || !trialStatus?.isTrialActive) {
    return null;
  }

  const { trialDaysRemaining, isTrialExpired } = trialStatus;

  // Se o trial expirou
  if (isTrialExpired) {
    return (
      <div className="bg-red-500 text-white px-4 py-3 text-center">
        <div className="flex items-center justify-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">
            Seu período de trial expirou. Entre em contato conosco para continuar usando o sistema.
          </span>
        </div>
      </div>
    );
  }

  // Se restam poucos dias (menos de 3)
  if (trialDaysRemaining <= 3) {
    return (
      <div className="bg-orange-500 text-white px-4 py-3 text-center">
        <div className="flex items-center justify-center gap-2">
          <Clock className="w-5 h-5" />
          <span className="font-medium">
            Seu trial expira em {trialDaysRemaining} dia{trialDaysRemaining !== 1 ? 's' : ''}.
            Entre em contato conosco para ativar sua assinatura.
          </span>
        </div>
      </div>
    );
  }

  // Trial ativo com mais de 3 dias
  return (
    <div className="bg-blue-500 text-white px-4 py-3 text-center">
      <div className="flex items-center justify-center gap-2">
        <Crown className="w-5 h-5" />
        <span className="font-medium">
          Período de trial ativo - {trialDaysRemaining} dias restantes
        </span>
      </div>
    </div>
  );
}



