"use client";

import { CheckCircle, Info, WarningCircle, X } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

interface ErrorNotificationProps {
  message: string;
  type?: "error" | "success" | "warning" | "info";
  duration?: number;
  onClose?: () => void;
  show?: boolean;
}

export function ErrorNotification({
  message,
  type = "error",
  duration = 5000,
  onClose,
  show = true,
}: ErrorNotificationProps) {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    if (show) {
      setIsVisible(true);

      if (duration > 0) {
        const timer = setTimeout(() => {
          setIsVisible(false);
          setTimeout(() => onClose?.(), 300); // Aguardar animação de saída
        }, duration);

        return () => clearTimeout(timer);
      }
    }
  }, [show, duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose?.(), 300);
  };

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "warning":
        return <WarningCircle className="h-5 w-5 text-yellow-600" />;
      case "info":
        return <Info className="h-5 w-5 text-blue-600" />;
      default:
        return <WarningCircle className="h-5 w-5 text-red-600" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800";
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "info":
        return "bg-blue-50 border-blue-200 text-blue-800";
      default:
        return "bg-red-50 border-red-200 text-red-800";
    }
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-md w-full mx-4 transform transition-all duration-300 ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <div
        className={`${getStyles()} border rounded-lg p-4 shadow-lg flex items-start space-x-3`}
      >
        {getIcon()}
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// Hook para usar notificações facilmente
export function useErrorNotification() {
  const [notification, setNotification] = useState<{
    message: string;
    type: "error" | "success" | "warning" | "info";
    show: boolean;
  }>({
    message: "",
    type: "error",
    show: false,
  });

  const showNotification = (
    message: string,
    type: "error" | "success" | "warning" | "info" = "error"
  ) => {
    setNotification({ message, type, show: true });
  };

  const hideNotification = () => {
    setNotification((prev) => ({ ...prev, show: false }));
  };

  return {
    notification,
    showNotification,
    hideNotification,
  };
}
