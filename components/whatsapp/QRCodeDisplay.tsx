"use client";

import { QrCode, Spinner } from "@phosphor-icons/react";
import { useState, useEffect } from "react";

interface QRCodeDisplayProps {
  qrCode: string;
  expiryTime?: number; // segundos
  onExpired?: () => void;
}

export function QRCodeDisplay({
  qrCode,
  expiryTime = 60,
  onExpired,
}: QRCodeDisplayProps) {
  const [timeLeft, setTimeLeft] = useState(expiryTime);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isExpired) {
      setIsExpired(true);
      onExpired?.();
    }
  }, [timeLeft, isExpired, onExpired]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const percentage = (timeLeft / expiryTime) * 100;

  return (
    <div className="w-full max-w-md mx-auto">
      {/* QR Code */}
      <div className="relative">
        <div
          className={`p-6 bg-white rounded-2xl border-4 ${isExpired
              ? "border-red-300 opacity-50"
              : percentage > 30
                ? "border-green-500"
                : percentage > 10
                  ? "border-yellow-500"
                  : "border-red-500"
            } shadow-xl transition-all duration-300`}
        >
          {isExpired ? (
            <div className="w-64 h-64 flex items-center justify-center text-red-500">
              <div className="text-center">
                <QrCode className="h-16 w-16 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium">QR Code Expirado</p>
              </div>
            </div>
          ) : (
            <img
              src={qrCode}
              alt="QR Code WhatsApp"
              className="w-64 h-64 mx-auto"
            />
          )}
        </div>

        {/* Timer Badge */}
        {!isExpired && (
          <div className="absolute -top-3 -right-3">
            <div
              className={`px-4 py-2 rounded-full shadow-lg ${percentage > 30
                  ? "bg-green-500"
                  : percentage > 10
                    ? "bg-yellow-500"
                    : "bg-red-500"
                } text-white font-bold`}
            >
              {minutes}:{seconds.toString().padStart(2, "0")}
            </div>
          </div>
        )}

        {/* Progress Ring */}
        {!isExpired && (
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  className="text-gray-200"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  strokeDashoffset={`${2 * Math.PI * 28 * (1 - percentage / 100)
                    }`}
                  className={`${percentage > 30
                      ? "text-green-500"
                      : percentage > 10
                        ? "text-yellow-500"
                        : "text-red-500"
                    } transition-all duration-1000`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Spinner className="h-6 w-6 animate-spin text-green-500" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          Como escanear o QR Code:
        </h3>
        <ol className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
              1
            </span>
            <span>Abra o WhatsApp no seu celular</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
              2
            </span>
            <span>Toque em Mais opções (⋮) ou Configurações</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
              3
            </span>
            <span>Toque em &quot;Aparelhos conectados&quot;</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
              4
            </span>
            <span>Toque em &quot;Conectar um aparelho&quot;</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
              5
            </span>
            <span>Aponte a câmera para este código QR</span>
          </li>
        </ol>
      </div>

      {/* Status */}
      <div className="mt-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full">
          <Spinner className="h-4 w-4 animate-spin" />
          <span className="text-sm font-medium">Aguardando conexão...</span>
        </div>
      </div>
    </div>
  );
}

