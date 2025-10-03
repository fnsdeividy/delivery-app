import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { RefObject, useCallback } from "react";
import { useReactToPrint } from "react-to-print";

interface UseOrderPrintProps {
  order: any;
  printRef?: RefObject<HTMLDivElement>;
}

export function useOrderPrint({ order, printRef }: UseOrderPrintProps) {
  const generatePDF = useCallback(async () => {
    if (!printRef?.current) {
      console.error("Referência do elemento não encontrada");
      return;
    }

    try {
      // Aguardar um pouco para garantir que o elemento está renderizado
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Garantir que imagens e fontes estejam carregadas e que não taint o canvas
      const rootEl = printRef.current;
      const images: HTMLImageElement[] = Array.from(
        rootEl.querySelectorAll("img")
      );

      await Promise.all(
        images.map((img) => {
          return new Promise<void>((resolveImg) => {
            try {
              // Forçar CORS anônimo quando for URL absoluta
              const isAbsolute = /^https?:\/\//i.test(img.src);
              if (isAbsolute) {
                img.crossOrigin = "anonymous";
              }

              if (img.complete && img.naturalWidth > 0) {
                resolveImg();
                return;
              }

              const onLoad = () => {
                img.removeEventListener("load", onLoad);
                img.removeEventListener("error", onError);
                resolveImg();
              };
              const onError = () => {
                // Se falhar, escondemos a imagem para não quebrar a captura
                img.style.visibility = "hidden";
                img.removeEventListener("load", onLoad);
                img.removeEventListener("error", onError);
                resolveImg();
              };
              img.addEventListener("load", onLoad);
              img.addEventListener("error", onError);
            } catch {
              // Em qualquer problema, não bloquear a geração
              resolveImg();
            }
          });
        })
      );

      // Capturar o elemento como canvas
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        width: printRef.current.scrollWidth,
        height: printRef.current.scrollHeight,
      });

      // Criar PDF
      const imgData = canvas.toDataURL("image/png");
      if (!imgData || !imgData.startsWith("data:image/png")) {
        throw new Error("Falha ao capturar imagem do canvas");
      }
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Calcular dimensões
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      // Adicionar primeira página
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Adicionar páginas adicionais se necessário
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Salvar PDF
      const fileName = `pedido-${order.orderNumber || order.id}.pdf`;
      pdf.save(fileName);

      console.log(`PDF gerado com sucesso: ${fileName}`);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      throw new Error("Falha ao gerar PDF do pedido");
    }
  }, [order, printRef]);

  const handlePrint = useCallback(async () => {
    try {
      // Tentar imprimir diretamente
      window.print();
    } catch (error) {
      console.error("Erro ao imprimir:", error);
      // Fallback para PDF se a impressão falhar
      await generatePDF();
    }
  }, [generatePDF]);

  // Configuração do react-to-print para impressão isolada
  const handlePrintWithReactToPrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Pedido ${order.orderNumber || order.id}`,
    onAfterPrint: () => {
      console.log("Impressão concluída");
    },
    onPrintError: (error) => {
      console.error("Erro na impressão:", error);
      // Fallback para PDF em caso de erro
      generatePDF();
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

  const handlePrintOrPDF = useCallback(async () => {
    try {
      // Usar react-to-print para impressão isolada
      await handlePrintWithReactToPrint();
    } catch (error) {
      console.error("Erro na impressão:", error);
      // Fallback para PDF em caso de erro
      await generatePDF();
    }
  }, [handlePrintWithReactToPrint, generatePDF]);

  return {
    printRef: printRef || null,
    handlePrintOrPDF,
    generatePDF,
    handlePrint,
    handlePrintWithReactToPrint,
  };
}
