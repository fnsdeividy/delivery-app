"use client";

import { useTrialStatus } from "@/hooks/useTrialStatus";
import { useToast } from "@/hooks/useToast";
import { useEffect, useState } from "react";

export function TrialWelcomeToast() {
  const { data: trialStatus } = useTrialStatus();
  const { showToast } = useToast();
  const [hasShownWelcome, setHasShownWelcome] = useState(false);

  useEffect(() => {
    // Verificar se já mostrou o toast de boas-vindas nesta sessão
    const welcomeShown = sessionStorage.getItem('trial-welcome-shown');

    if (trialStatus?.isTrialActive && !hasShownWelcome && !welcomeShown) {
      // Aguardar um momento para não conflitar com outros toasts
      const timer = setTimeout(() => {
        showToast(
          `🎉 Bem-vindo ao Cardap.IO! Você tem ${trialStatus.trialDaysRemaining} dias de trial gratuito para explorar todas as funcionalidades.`,
          "success"
        );
        setHasShownWelcome(true);
        sessionStorage.setItem('trial-welcome-shown', 'true');
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [trialStatus, hasShownWelcome, showToast]);

  return null; // Este componente não renderiza nada visualmente
}
