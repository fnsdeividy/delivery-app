import { useOrderPrint } from "@/hooks/useOrderPrint";
import { Order } from "@/types/cardapio-api";
import { Download, Printer } from "@phosphor-icons/react";
import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { OrderPrintContent } from "./OrderPrintContent";

interface OrderPrintModalProps {
  order: Order;
  onClose: () => void;
}

export function OrderPrintModal({ order, onClose }: OrderPrintModalProps) {
  const componentRef = useRef<HTMLDivElement>(null);
  const { generatePDF } = useOrderPrint({ order, printRef: componentRef });
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Pedido ${order.orderNumber || order.id}`,
    onAfterPrint: () => {
      console.log("Impressão concluída");
    },
    onPrintError: (error) => {
      console.error("Erro na impressão:", error);
    },
    pageStyle: `
      @page {
        margin: 0.5in;
        size: A4;
      }
      @media print {
        body * {
          visibility: hidden;
        }
        .print-content,
        .print-content * {
          visibility: visible;
        }
        .print-content {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          background: white;
        }
        .no-print {
          display: none !important;
        }
      }
    `,
  });

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
      {/* Modal com preview e botões */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Cabeçalho do modal */}
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold text-center">
              Impressão do Pedido #{order.orderNumber}
            </h3>
          </div>

          {/* Preview do conteúdo (também é a área capturada para impressão/PDF) */}
          <div className="p-4 overflow-y-auto max-h-[60vh]">
            <div
              ref={componentRef}
              className="print-content bg-gray-50 p-4 rounded-lg"
            >
              <OrderPrintContent order={order} />
            </div>
          </div>

          {/* Botões de ação */}
          <div className="p-4 border-t bg-gray-50">
            <div className="flex gap-2 justify-center">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Printer className="h-4 w-4" />
                🖨️ Imprimir Pedido
              </button>
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
                {isGeneratingPDF ? "Gerando..." : "⬇️ Baixar PDF"}
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                ❌ Fechar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Removido bloco oculto: a referência agora aponta para o preview visível */}
    </>
  );
}
