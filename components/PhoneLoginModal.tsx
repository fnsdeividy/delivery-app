"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Phone, User } from "lucide-react";
import { apiClient } from "@/lib/api-client";

interface PhoneLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (authData: any) => void;
  storeSlug?: string;
}

export function PhoneLoginModal({ isOpen, onClose, onSuccess, storeSlug }: PhoneLoginModalProps) {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const formatPhone = (value: string) => {
    // Remove todos os caracteres não numéricos
    const numbers = value.replace(/\D/g, "");

    // Aplica máscara de telefone brasileiro
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else if (numbers.length <= 10) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Remove formatação do telefone para enviar apenas números
      const cleanPhone = phone.replace(/\D/g, "");

      if (cleanPhone.length < 10) {
        throw new Error("Telefone deve ter pelo menos 10 dígitos");
      }

      const authData = await apiClient.authenticateByPhone(cleanPhone, name || undefined);

      onSuccess(authData);
      onClose();

      // Reset form
      setPhone("");
      setName("");
    } catch (err: any) {
      console.error("Erro no login por telefone:", err);
      setError(
        err.message ||
        "Erro ao fazer login. Verifique seu telefone e tente novamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setPhone("");
      setName("");
      setError("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Login com Telefone
          </DialogTitle>
          <DialogDescription>
            Digite seu telefone para entrar. Se for sua primeira vez, criaremos sua conta automaticamente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Telefone
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(11) 99999-9999"
              value={phone}
              onChange={handlePhoneChange}
              disabled={isLoading}
              maxLength={15}
              required
              className="text-lg"
            />
            <p className="text-xs text-gray-500">
              Digite seu telefone com DDD
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Nome (opcional)
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              className="text-lg"
            />
            <p className="text-xs text-gray-500">
              Ajuda a personalizar seu atendimento
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || phone.replace(/\D/g, "").length < 10}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </div>
        </form>

        <div className="text-center text-xs text-gray-500 pt-4 border-t">
          Ao continuar, você concorda com nossos{" "}
          <a href="/termos" className="text-blue-600 hover:underline">
            Termos de Uso
          </a>{" "}
          e{" "}
          <a href="/privacidade" className="text-blue-600 hover:underline">
            Política de Privacidade
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}

