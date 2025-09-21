import { Storefront } from "@phosphor-icons/react";

interface RegistrationHeaderProps {
  step: number;
  creationStep: "idle" | "creating-user" | "creating-store" | "redirecting";
}

export default function RegistrationHeader({ step, creationStep }: RegistrationHeaderProps) {
  return (
    <div className="sm:mx-auto sm:w-full sm:max-w-md">
      {/* Ícone */}
      <div className="flex justify-center">
        <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-lg">
          <Storefront className="w-7 h-7 text-white" />
        </div>
      </div>

      {/* Título */}
      <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">
        Criar Nova Loja
      </h2>
      <p className="mt-2 text-center text-sm text-white/80">
        Configure sua loja em poucos passos
      </p>

      {/* Progress */}
      <div className="mt-8">
        <div className="flex items-center justify-center space-x-4">
          {[1, 2, 3].map((stepNumber) => (
            <div
              key={stepNumber}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= stepNumber
                  ? "bg-white/20 text-white border-2 border-white/30"
                  : "bg-white/10 text-white/60 border-2 border-white/20"
              }`}
            >
              {stepNumber}
            </div>
          ))}
        </div>
        <div className="flex justify-center space-x-8 mt-2">
          <span className="text-xs text-white/80">Proprietário</span>
          <span className="text-xs text-white/80">Loja</span>
          <span className="text-xs text-white/80">Confirmação</span>
        </div>
      </div>

      {/* Progresso da Criação */}
      {creationStep !== "idle" && (
        <div className="mt-4">
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="text-sm text-white/90">
                {creationStep === "creating-user" &&
                  "Criando conta de usuário..."}
                {creationStep === "creating-store" &&
                  "Configurando sua loja..."}
                {creationStep === "redirecting" && "Finalizando cadastro..."}
              </span>
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
