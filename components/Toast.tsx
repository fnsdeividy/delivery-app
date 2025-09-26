"use client";

// Removido import de ícones para evitar problemas de SSR
import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose: () => void;
}

const toastConfig = {
  success: {
    icon: "✅",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    textColor: "text-green-800",
    iconColor: "text-green-400",
  },
  error: {
    icon: "❌",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    textColor: "text-red-800",
    iconColor: "text-red-400",
  },
  warning: {
    icon: "⚠️",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    textColor: "text-yellow-800",
    iconColor: "text-yellow-400",
  },
  info: {
    icon: "ℹ️",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-800",
    iconColor: "text-blue-400",
  },
};

export function Toast({
  type,
  title,
  message,
  duration = 5000,
  onClose,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const config = toastConfig[type];

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Aguardar animação de saída
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]); // Removido onClose da dependência

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`
      fixed top-4 right-4 z-50 max-w-sm w-full
      transform transition-all duration-300 ease-in-out
      ${isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
    `}
    >
      <div
        className={`
        ${config.bgColor} ${config.borderColor} border rounded-lg shadow-lg p-4
      `}
      >
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <span className={`text-lg ${config.iconColor}`}>{config.icon}</span>
          </div>
          <div className="ml-3 flex-1">
            <h3 className={`text-sm font-medium ${config.textColor}`}>
              {title}
            </h3>
            {message && (
              <p className={`mt-1 text-sm ${config.textColor} opacity-90`}>
                {message}
              </p>
            )}
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={handleClose}
              className={`
                ${config.textColor} hover:opacity-70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-${config.bgColor} focus:ring-${config.iconColor}
              `}
            >
              <span className="text-sm">✕</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook para gerenciar múltiplos toasts
export function useToast() {
  const [toasts, setToasts] = useState<
    Array<{
      id: string;
      type: ToastType;
      title: string;
      message?: string;
      duration?: number;
    }>
  >([]);

  const addToast = (
    type: ToastType,
    title: string,
    message?: string,
    duration?: number
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { id, type, title, message, duration };

    setToasts((prev) => [...prev, newToast]);

    return id;
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const success = (title: string, message?: string, duration?: number) =>
    addToast("success", title, message, duration);

  const error = (title: string, message?: string, duration?: number) =>
    addToast("error", title, message, duration);

  const warning = (title: string, message?: string, duration?: number) =>
    addToast("warning", title, message, duration);

  const info = (title: string, message?: string, duration?: number) =>
    addToast("info", title, message, duration);

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };
}

// Componente para renderizar múltiplos toasts
export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  );
}

// ToastProvider para gerenciar o contexto dos toasts
export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ToastContainer />
    </>
  );
}
