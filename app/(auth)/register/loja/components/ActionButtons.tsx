interface ActionButtonsProps {
  step: number;
  isLoading: boolean;
  creationStep: "idle" | "creating-user" | "creating-store" | "redirecting";
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

export default function ActionButtons({
  step,
  isLoading,
  creationStep,
  onPrevious,
  onNext,
  onSubmit
}: ActionButtonsProps) {
  return (
    <div className="mt-6 flex space-x-4">
      {step > 1 && (
        <button
          type="button"
          onClick={onPrevious}
          disabled={isLoading || creationStep !== "idle"}
          className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium disabled:opacity-50 transition-colors"
        >
          ← Voltar
        </button>
      )}

      {step < 3 ? (
        <button
          type="button"
          onClick={onNext}
          disabled={isLoading}
          className="flex-1 py-2 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md hover:from-blue-700 hover:to-purple-700 font-medium disabled:opacity-50 transition-all shadow-md flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Validando...
            </>
          ) : (
            `Continuar (${step}/3)`
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={onSubmit}
          disabled={isLoading || creationStep !== "idle"}
          className="flex-1 py-2 px-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-md hover:from-green-700 hover:to-blue-700 font-medium disabled:opacity-50 transition-all shadow-md"
        >
          {creationStep === "creating-user" && (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Criando usuário...
            </>
          )}
          {creationStep === "creating-store" && (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Criando loja...
            </>
          )}
          {creationStep === "redirecting" && (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Finalizando...
            </>
          )}
          {creationStep === "idle" && (
            <>
              {isLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>}
              {isLoading ? "Processando..." : "Criar Loja"}
            </>
          )}
        </button>
      )}
    </div>
  );
}
