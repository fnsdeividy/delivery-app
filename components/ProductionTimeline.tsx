"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAdvanceOrder, useOrderTimeline } from "@/hooks/useTimeline";
import { cn } from "@/lib/utils";
import { OrderStatus } from "@/types/cardapio-api";
import {
  CheckCircle,
  ChefHat,
  Clock,
  Eye,
  Home,
  Package,
  Truck,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ProductionStep {
  status: OrderStatus;
  label: string;
  description: string;
  icon: string;
  color: string;
  completed: boolean;
  current: boolean;
  canAdvance: boolean;
  prerequisites?: OrderStatus[];
  whatsappMessage?: string;
}

interface ProductionTimelineProps {
  orderId: string;
  storeSlug: string;
  currentStatus: OrderStatus;
  onStatusChange?: (newStatus: OrderStatus) => void;
  showAdvanceButton?: boolean;
  compact?: boolean;
}

// Definição das etapas específicas para produção de lanches
const productionSteps: Omit<
  ProductionStep,
  "completed" | "current" | "canAdvance"
>[] = [
  {
    status: OrderStatus.RECEIVED,
    label: "Pedido Recebido",
    description: "Pedido foi recebido e está aguardando confirmação",
    icon: "📥",
    color: "blue",
    whatsappMessage: "Seu pedido foi recebido e está sendo processado! 🍔",
  },
  {
    status: OrderStatus.CONFIRMED,
    label: "Confirmado",
    description: "Pedido confirmado pela loja",
    icon: "✅",
    color: "green",
    prerequisites: [OrderStatus.RECEIVED],
    whatsappMessage:
      "Seu pedido foi confirmado! Iniciaremos o preparo em breve 🍽️",
  },
  {
    status: OrderStatus.PREPARING,
    label: "Preparação",
    description: "Ingredientes sendo preparados e cozidos",
    icon: "👨‍🍳",
    color: "orange",
    prerequisites: [OrderStatus.CONFIRMED],
    whatsappMessage:
      "Seu lanche está sendo preparado com carinho! Os ingredientes estão sendo cozidos 👨‍🍳",
  },
  {
    status: OrderStatus.ASSEMBLING,
    label: "Montagem",
    description: "Lanche está sendo montado e finalizado",
    icon: "🥪",
    color: "amber",
    prerequisites: [OrderStatus.PREPARING],
    whatsappMessage: "Seu lanche está sendo montado! Quase pronto! 🥪",
  },
  {
    status: OrderStatus.PACKAGING,
    label: "Embalagem",
    description: "Lanche está sendo embalado para entrega",
    icon: "📦",
    color: "purple",
    prerequisites: [OrderStatus.ASSEMBLING],
    whatsappMessage: "Seu lanche está sendo embalado com cuidado! 📦",
  },
  {
    status: OrderStatus.READY,
    label: "Pronto",
    description: "Lanche está pronto para entrega/retirada",
    icon: "🎉",
    color: "emerald",
    prerequisites: [OrderStatus.PACKAGING],
    whatsappMessage:
      "Seu lanche está pronto! Pode vir buscar ou aguardar a entrega! 🎉",
  },
  {
    status: OrderStatus.DELIVERING,
    label: "Saiu para Entrega",
    description: "Lanche saiu para entrega",
    icon: "🚚",
    color: "cyan",
    prerequisites: [OrderStatus.READY],
    whatsappMessage: "Seu lanche saiu para entrega! Chegará em breve 🚚",
  },
  {
    status: OrderStatus.DELIVERED,
    label: "Entregue",
    description: "Lanche foi entregue",
    icon: "🏠",
    color: "green",
    prerequisites: [OrderStatus.DELIVERING],
    whatsappMessage: "Seu lanche foi entregue! Aproveite! 🏠",
  },
  {
    status: OrderStatus.CANCELLED,
    label: "Cancelado",
    description: "Pedido foi cancelado",
    icon: "❌",
    color: "red",
    whatsappMessage:
      "Seu pedido foi cancelado. Entre em contato conosco para mais informações.",
  },
];

const getStatusIcon = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.RECEIVED:
      return <Clock className="h-4 w-4" />;
    case OrderStatus.CONFIRMED:
      return <CheckCircle className="h-4 w-4" />;
    case OrderStatus.PREPARING:
      return <ChefHat className="h-4 w-4" />;
    case OrderStatus.ASSEMBLING:
      return <Package className="h-4 w-4" />;
    case OrderStatus.PACKAGING:
      return <Package className="h-4 w-4" />;
    case OrderStatus.READY:
      return <CheckCircle className="h-4 w-4" />;
    case OrderStatus.DELIVERING:
      return <Truck className="h-4 w-4" />;
    case OrderStatus.DELIVERED:
      return <Home className="h-4 w-4" />;
    case OrderStatus.CANCELLED:
      return <X className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

const getColorClasses = (
  color: string,
  completed: boolean,
  current: boolean
) => {
  const baseClasses = "transition-all duration-300";

  if (completed) {
    return `${baseClasses} bg-green-100 text-green-800 border-green-200`;
  }

  if (current) {
    switch (color) {
      case "blue":
        return `${baseClasses} bg-blue-100 text-blue-800 border-blue-200`;
      case "green":
        return `${baseClasses} bg-green-100 text-green-800 border-green-200`;
      case "orange":
        return `${baseClasses} bg-orange-100 text-orange-800 border-orange-200`;
      case "amber":
        return `${baseClasses} bg-amber-100 text-amber-800 border-amber-200`;
      case "purple":
        return `${baseClasses} bg-purple-100 text-purple-800 border-purple-200`;
      case "emerald":
        return `${baseClasses} bg-emerald-100 text-emerald-800 border-emerald-200`;
      case "cyan":
        return `${baseClasses} bg-cyan-100 text-cyan-800 border-cyan-200`;
      case "red":
        return `${baseClasses} bg-red-100 text-red-800 border-red-200`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 border-gray-200`;
    }
  }

  return `${baseClasses} bg-gray-50 text-gray-500 border-gray-200`;
};

export function ProductionTimeline({
  orderId,
  storeSlug,
  currentStatus,
  onStatusChange,
  showAdvanceButton = true,
  compact = false,
}: ProductionTimelineProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [customMessage, setCustomMessage] = useState("");

  const { data: timelineData, isLoading } = useOrderTimeline(
    orderId,
    storeSlug
  );
  const advanceOrderMutation = useAdvanceOrder();

  const handleAdvance = async () => {
    try {
      const result = await advanceOrderMutation.mutateAsync({
        orderId,
        storeSlug,
      });

      if (result.success) {
        toast.success(result.message);
        onStatusChange?.(result.newStatus!);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Erro ao avançar pedido");
      console.error("Erro ao avançar pedido:", error);
    }
  };

  const getCurrentStepIndex = () => {
    return productionSteps.findIndex((step) => step.status === currentStatus);
  };

  const getNextStep = () => {
    const currentIndex = getCurrentStepIndex();
    return currentIndex < productionSteps.length - 1
      ? productionSteps[currentIndex + 1]
      : null;
  };

  const canAdvance = () => {
    const nextStep = getNextStep();
    if (!nextStep) return false;

    // Verificar pré-requisitos
    if (nextStep.prerequisites) {
      return nextStep.prerequisites.includes(currentStatus);
    }

    return true;
  };

  const steps = productionSteps.map((step, index) => {
    const currentIndex = getCurrentStepIndex();
    const completed = index < currentIndex;
    const current = index === currentIndex;

    return {
      ...step,
      completed,
      current,
      canAdvance: current && canAdvance(),
    };
  });

  const currentStep = steps.find((step) => step.current);
  const nextStep = getNextStep();

  if (compact) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">{currentStep?.icon}</div>
              <div>
                <h3 className="font-semibold text-sm">{currentStep?.label}</h3>
                <p className="text-xs text-gray-600">
                  {currentStep?.description}
                </p>
              </div>
            </div>
            {showAdvanceButton && canAdvance() && (
              <Button
                onClick={handleAdvance}
                disabled={advanceOrderMutation.isPending}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                {advanceOrderMutation.isPending ? "Avançando..." : "Avançar"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Linha do Tempo de Produção</span>
          <Dialog open={showDetails} onOpenChange={setShowDetails}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Detalhes
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Histórico Completo da Timeline</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {timelineData?.timeline?.map((entry: any, index: number) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="text-lg">{entry.step?.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-medium">{entry.step?.label}</h4>
                      <p className="text-sm text-gray-600">{entry.message}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(entry.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Timeline Steps */}
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div
                key={step.status}
                className={cn(
                  "flex items-center space-x-4 p-3 rounded-lg border-2 transition-all duration-300",
                  getColorClasses(step.color, step.completed, step.current)
                )}
              >
                <div className="flex-shrink-0">
                  {step.completed ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : step.current ? (
                    <div className="h-6 w-6 rounded-full bg-current border-2 border-current animate-pulse" />
                  ) : (
                    <div className="h-6 w-6 rounded-full bg-gray-300" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{step.icon}</span>
                    <h3 className="font-semibold text-sm">{step.label}</h3>
                    {step.current && (
                      <Badge variant="secondary" className="text-xs">
                        Atual
                      </Badge>
                    )}
                    {step.completed && (
                      <Badge variant="default" className="text-xs bg-green-600">
                        Concluído
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {step.description}
                  </p>

                  {step.prerequisites && step.prerequisites.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500">
                        Pré-requisitos: {step.prerequisites.join(", ")}
                      </p>
                    </div>
                  )}
                </div>

                {step.current && step.canAdvance && showAdvanceButton && (
                  <Button
                    onClick={handleAdvance}
                    disabled={advanceOrderMutation.isPending}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {advanceOrderMutation.isPending
                      ? "Avançando..."
                      : "Avançar"}
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Next Step Preview */}
          {nextStep && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">
                Próxima Etapa
              </h4>
              <div className="flex items-center space-x-3">
                <span className="text-xl">{nextStep.icon}</span>
                <div>
                  <h5 className="font-medium text-blue-800">
                    {nextStep.label}
                  </h5>
                  <p className="text-sm text-blue-600">
                    {nextStep.description}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* WhatsApp Message Preview */}
          {currentStep?.whatsappMessage && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-900 mb-2 text-sm">
                Mensagem WhatsApp
              </h4>
              <p className="text-sm text-green-800">
                {currentStep.whatsappMessage}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
