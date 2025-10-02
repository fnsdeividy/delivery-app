/**
 * Utilitários para verificação do status da loja baseado nos horários de funcionamento
 */

export interface WorkingHours {
  [key: string]: {
    open: boolean;
    hours: Array<{
      start: string;
      end: string;
    }>;
  };
}

export interface StoreStatus {
  isOpen: boolean;
  message: string;
  reason?: string;
}

/**
 * Converte horário no formato HH:mm para minutos desde meia-noite
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * Obtém o nome do dia da semana em inglês
 */
function getDayOfWeek(day: number): string {
  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  return days[day];
}

/**
 * Verifica se a loja está aberta baseado nos horários de funcionamento
 * @param workingHours - Horários de funcionamento da loja
 * @param timezone - Fuso horário (padrão: America/Sao_Paulo)
 * @returns Status da loja (aberta/fechada)
 */
export function checkStoreStatus(
  workingHours: WorkingHours,
  timezone: string = "America/Sao_Paulo"
): StoreStatus {
  if (!workingHours) {
    return {
      isOpen: false,
      message: "Horários não configurados",
      reason: "workingHours_not_configured",
    };
  }

  // Usar fuso horário do Brasil
  const now = new Date();
  const brazilTime = new Date(
    now.toLocaleString("en-US", { timeZone: timezone })
  );
  const currentDay = getDayOfWeek(brazilTime.getDay());
  const currentTime = brazilTime.toTimeString().slice(0, 5); // HH:mm
  const currentMinutes = timeToMinutes(currentTime);

  const daySchedule = workingHours[currentDay];
  if (!daySchedule || !daySchedule.open) {
    return {
      isOpen: false,
      message: "Loja fechada hoje",
      reason: "closed_today",
    };
  }

  // Verificar se há horários configurados para o dia
  if (!daySchedule.hours || daySchedule.hours.length === 0) {
    return {
      isOpen: false,
      message: "Horários não definidos para hoje",
      reason: "no_hours_configured",
    };
  }

  // Verificar se o horário atual está dentro de alguma faixa de funcionamento
  for (const timeRange of daySchedule.hours) {
    const openMinutes = timeToMinutes(timeRange.start);
    const closeMinutes = timeToMinutes(timeRange.end);

    // Verificar se o horário passa da meia-noite (ex: 22:00-02:00)
    if (closeMinutes < openMinutes) {
      // Horário que passa da meia-noite
      if (currentMinutes >= openMinutes || currentMinutes <= closeMinutes) {
        return {
          isOpen: true,
          message: "Loja aberta",
          reason: "open",
        };
      }
    } else {
      // Horário normal (ex: 08:00-18:00)
      if (currentMinutes >= openMinutes && currentMinutes <= closeMinutes) {
        return {
          isOpen: true,
          message: "Loja aberta",
          reason: "open",
        };
      }
    }
  }

  return {
    isOpen: false,
    message: "Loja fechada",
    reason: "outside_hours",
  };
}

/**
 * Hook para verificar o status da loja com atualização automática
 */
export function useStoreStatus(workingHours: WorkingHours, timezone?: string) {
  const [status, setStatus] = useState<StoreStatus>(() =>
    checkStoreStatus(workingHours, timezone)
  );

  useEffect(() => {
    // Atualizar status imediatamente
    setStatus(checkStoreStatus(workingHours, timezone));

    // Atualizar a cada minuto
    const interval = setInterval(() => {
      setStatus(checkStoreStatus(workingHours, timezone));
    }, 60000);

    return () => clearInterval(interval);
  }, [workingHours, timezone]);

  return status;
}

// Import necessário para o hook
import { useEffect, useState } from "react";
