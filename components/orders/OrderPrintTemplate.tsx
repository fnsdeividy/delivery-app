import { useOrderPrint } from "@/hooks/useOrderPrint";
import { Order } from "@/types/cardapio-api";
import { Download } from "@phosphor-icons/react";
import { forwardRef, useState } from "react";
import { OrderPrintContent } from "./OrderPrintContent";

interface OrderPrintTemplateProps {
  order: Order;
  onClose: () => void;
}

export const OrderPrintTemplate = forwardRef<
  HTMLDivElement,
  OrderPrintTemplateProps
>(({ order, onClose }, ref) => {
  const { generatePDF } = useOrderPrint({ order });
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleGeneratePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      await generatePDF();
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <>
      {/* Overlay para fechar */}
      <div
        className="no-print fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
        onClick={onClose}
      >
        <div
          ref={ref}
          className="print-content bg-white p-6 max-w-md mx-auto rounded-lg shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Botões de ação */}
          <div className="no-print mb-4 flex gap-2 justify-center">
            <button
              onClick={handleGeneratePDF}
              disabled={isGeneratingPDF}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isGeneratingPDF ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              ) : (
                <Download className="h-4 w-4" />
              )}
              {isGeneratingPDF ? "Gerando..." : "Baixar PDF"}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Fechar
            </button>
          </div>

          {/* Conteúdo do pedido para impressão */}
          <OrderPrintContent order={order} />
        </div>
      </div>
    </>
  );
});

OrderPrintTemplate.displayName = "OrderPrintTemplate";
