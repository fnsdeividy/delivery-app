"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { AlertCircle, CheckCircle, Clock, Eye } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface OrderTimelineAdvancedProps {
  orderId: string;
  storeSlug: string;
  currentStatus: OrderStatus;
  onStatusChange?: (newStatus: OrderStatus) => void;
}

export function OrderTimelineAdvanced({
  orderId,
  storeSlug,
  currentStatus,
  onStatusChange,
}: OrderTimelineAdvancedProps) {
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

  const getStatusIcon = (
    status: OrderStatus,
    isCompleted: boolean,
    isCurrent: boolean
  ) => {
    if (isCompleted) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    }

    if (isCurrent) {
      return <Clock className="w-5 h-5 text-blue-600" />;
    }

    return <div className="w-5 h-5 rounded-full bg-gray-300" />;
  };

  const getStatusColor = (status: OrderStatus) => {
    const colors: Record<OrderStatus, string> = {
      [OrderStatus.RECEIVED]: "blue",
      [OrderStatus.CONFIRMED]: "green",
      [OrderStatus.PREPARING]: "orange",
      [OrderStatus.ASSEMBLING]: "purple",
      [OrderStatus.PACKAGING]: "indigo",
      [OrderStatus.READY]: "emerald",
      [OrderStatus.DELIVERING]: "cyan",
      [OrderStatus.DELIVERED]: "green",
      [OrderStatus.CANCELLED]: "red",
    };
    return colors[status] || "gray";
  };

  const getStatusInfo = (status: OrderStatus) => {
    const statusInfo: Record<
      OrderStatus,
      { label: string; description: string; icon: string }
    > = {
      [OrderStatus.RECEIVED]: {
        label: "Pedido Recebido",
        description: "Pedido foi recebido e está aguardando confirmação",
        icon: "📥",
      },
      [OrderStatus.CONFIRMED]: {
        label: "Confirmado",
        description: "Pedido confirmado pela loja",
        icon: "✅",
      },
      [OrderStatus.PREPARING]: {
        label: "Preparação",
        description: "Lanche está sendo preparado",
        icon: "👨‍🍳",
      },
      [OrderStatus.READY]: {
        label: "Pronto",
        description: "Lanche está pronto para entrega/retirada",
        icon: "🎉",
      },
      [OrderStatus.DELIVERING]: {
        label: "Saiu para Entrega",
        description: "Lanche saiu para entrega",
        icon: "🚚",
      },
      [OrderStatus.DELIVERED]: {
        label: "Entregue",
        description: "Lanche foi entregue",
        icon: "🏠",
      },
      [OrderStatus.CANCELLED]: {
        label: "Cancelado",
        description: "Pedido foi cancelado",
        icon: "❌",
      },
    };
    return statusInfo[status];
  };

  const statusOrder: OrderStatus[] = [
    OrderStatus.RECEIVED,
    OrderStatus.CONFIRMED,
    OrderStatus.PREPARING,
    OrderStatus.READY,
    OrderStatus.DELIVERING,
    OrderStatus.DELIVERED,
  ];

  const canAdvance = () => {
    const currentIndex = statusOrder.indexOf(currentStatus);
    return (
      currentIndex >= 0 &&
      currentIndex < statusOrder.length - 1 &&
      currentStatus !== OrderStatus.CANCELLED
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Linha do Tempo do Pedido
        </h3>

        <div className="flex items-center space-x-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                Ver Detalhes
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Histórico Completo do Pedido</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {timelineData?.timeline.map((entry, index) => {
                  const statusInfo = getStatusInfo(entry.status);
                  return (
                    <div
                      key={entry.id}
                      className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-shrink-0">
                        <span className="text-2xl">{statusInfo.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900">
                            {statusInfo.label}
                          </h4>
                          <Badge variant="outline">
                            {new Date(entry.createdAt).toLocaleString("pt-BR")}
                          </Badge>
                        </div>
                        {entry.message && (
                          <p className="text-sm text-gray-600 mt-1">
                            {entry.message}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </DialogContent>
          </Dialog>

          {canAdvance() && (
            <Button
              onClick={handleAdvance}
              disabled={advanceOrderMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {advanceOrderMutation.isPending
                ? "Avançando..."
                : "Avançar Etapa"}
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {statusOrder.map((status, index) => {
          const isCompleted =
            statusOrder.indexOf(status) < statusOrder.indexOf(currentStatus);
          const isCurrent = status === currentStatus;
          const statusInfo = getStatusInfo(status);
          const color = getStatusColor(status);
          const isLast = index === statusOrder.length - 1;

          return (
            <div key={status} className="relative">
              <Card
                className={cn(
                  "transition-all duration-200",
                  isCompleted && "bg-green-50 border-green-200",
                  isCurrent &&
                    "bg-blue-50 border-blue-200 ring-2 ring-blue-200 shadow-md",
                  !isCompleted && !isCurrent && "bg-gray-50 border-gray-200"
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {getStatusIcon(status, isCompleted, isCurrent)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{statusInfo.icon}</span>
                        <h4
                          className={cn(
                            "font-medium",
                            isCompleted && "text-green-900",
                            isCurrent && "text-blue-900",
                            !isCompleted && !isCurrent && "text-gray-500"
                          )}
                        >
                          {statusInfo.label}
                        </h4>
                        <Badge
                          className={cn(
                            isCompleted && "bg-green-100 text-green-800",
                            isCurrent && "bg-blue-100 text-blue-800",
                            !isCompleted &&
                              !isCurrent &&
                              "bg-gray-100 text-gray-600"
                          )}
                        >
                          {isCompleted
                            ? "Concluído"
                            : isCurrent
                            ? "Atual"
                            : "Pendente"}
                        </Badge>
                      </div>

                      <p
                        className={cn(
                          "text-sm mt-1",
                          isCompleted && "text-green-700",
                          isCurrent && "text-blue-700",
                          !isCompleted && !isCurrent && "text-gray-500"
                        )}
                      >
                        {statusInfo.description}
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
