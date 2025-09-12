"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { OrderStatus } from "@/types/cardapio-api";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";
import { useState } from "react";

interface TimelineStep {
  status: OrderStatus;
  label: string;
  description: string;
  icon: string;
  color: string;
  completed: boolean;
  current: boolean;
  canAdvance: boolean;
}

interface OrderTimelineProps {
  orderId: string;
  storeSlug: string;
  currentStatus: OrderStatus;
  onStatusChange?: (newStatus: OrderStatus) => void;
  onAdvance?: (orderId: string) => Promise<void>;
  isLoading?: boolean;
}

const timelineSteps: Omit<
  TimelineStep,
  "completed" | "current" | "canAdvance"
>[] = [
  {
    status: OrderStatus.RECEIVED,
    label: "Pedido Recebido",
    description: "Pedido foi recebido e está aguardando confirmação",
    icon: "📥",
    color: "blue",
  },
  {
    status: OrderStatus.CONFIRMED,
    label: "Confirmado",
    description: "Pedido confirmado pela loja",
    icon: "✅",
    color: "green",
  },
  {
    status: OrderStatus.PREPARING,
    label: "Preparação",
    description: "Lanche está sendo preparado",
    icon: "👨‍🍳",
    color: "orange",
  },
  {
    status: OrderStatus.READY,
    label: "Pronto",
    description: "Lanche está pronto para entrega/retirada",
    icon: "🎉",
    color: "emerald",
  },
  {
    status: OrderStatus.DELIVERING,
    label: "Saiu para Entrega",
    description: "Lanche saiu para entrega",
    icon: "🚚",
    color: "cyan",
  },
  {
    status: OrderStatus.DELIVERED,
    label: "Entregue",
    description: "Lanche foi entregue",
    icon: "🏠",
    color: "green",
  },
];

const statusOrder: OrderStatus[] = [
  OrderStatus.RECEIVED,
  OrderStatus.CONFIRMED,
  OrderStatus.PREPARING,
  OrderStatus.READY,
  OrderStatus.DELIVERING,
  OrderStatus.DELIVERED,
];

export function OrderTimeline({
  orderId,
  storeSlug,
  currentStatus,
  onStatusChange,
  onAdvance,
  isLoading = false,
}: OrderTimelineProps) {
  const [isAdvancing, setIsAdvancing] = useState(false);

  const getStepStatus = (step: (typeof timelineSteps)[0]): TimelineStep => {
    const currentIndex = statusOrder.indexOf(currentStatus);
    const stepIndex = statusOrder.indexOf(step.status);

    return {
      ...step,
      completed: stepIndex < currentIndex,
      current: stepIndex === currentIndex,
      canAdvance:
        stepIndex === currentIndex && stepIndex < statusOrder.length - 1,
    };
  };

  const handleAdvance = async () => {
    if (!onAdvance) return;

    setIsAdvancing(true);
    try {
      await onAdvance(orderId);
    } catch (error) {
      console.error("Erro ao avançar pedido:", error);
    } finally {
      setIsAdvancing(false);
    }
  };

  const getColorClasses = (step: TimelineStep) => {
    if (step.completed) {
      return {
        bg: "bg-green-50 border-green-200",
        icon: "text-green-600",
        text: "text-green-900",
        badge: "bg-green-100 text-green-800",
      };
    }

    if (step.current) {
      return {
        bg: "bg-blue-50 border-blue-200",
        icon: "text-blue-600",
        text: "text-blue-900",
        badge: "bg-blue-100 text-blue-800",
      };
    }

    return {
      bg: "bg-gray-50 border-gray-200",
      icon: "text-gray-400",
      text: "text-gray-500",
      badge: "bg-gray-100 text-gray-600",
    };
  };

  const getStatusIcon = (step: TimelineStep) => {
    if (step.completed) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    }

    if (step.current) {
      return <Clock className="w-5 h-5 text-blue-600" />;
    }

    return <div className="w-5 h-5 rounded-full bg-gray-300" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Linha do Tempo do Pedido
        </h3>
        {timelineSteps.find((step) => getStepStatus(step).canAdvance) && (
          <Button
            onClick={handleAdvance}
            disabled={isAdvancing || isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isAdvancing ? "Avançando..." : "Avançar Etapa"}
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {timelineSteps.map((step, index) => {
          const stepStatus = getStepStatus(step);
          const colors = getColorClasses(stepStatus);
          const isLast = index === timelineSteps.length - 1;

          return (
            <div key={step.status} className="relative">
              <Card
                className={cn(
                  "transition-all duration-200",
                  colors.bg,
                  stepStatus.current && "ring-2 ring-blue-200 shadow-md"
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {getStatusIcon(stepStatus)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{step.icon}</span>
                        <h4 className={cn("font-medium", colors.text)}>
                          {step.label}
                        </h4>
                        <Badge className={colors.badge}>
                          {stepStatus.completed
                            ? "Concluído"
                            : stepStatus.current
                            ? "Atual"
                            : "Pendente"}
                        </Badge>
                      </div>

                      <p className={cn("text-sm mt-1", colors.text)}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {!isLast && (
                <div className="absolute left-6 top-16 w-0.5 h-6 bg-gray-200" />
              )}
            </div>
          );
        })}
      </div>

      {currentStatus === OrderStatus.CANCELLED && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-900 font-medium">Pedido Cancelado</span>
            </div>
            <p className="text-red-700 text-sm mt-1">
              Este pedido foi cancelado e não pode mais ser processado.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
