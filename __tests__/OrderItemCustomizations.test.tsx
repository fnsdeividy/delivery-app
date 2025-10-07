import { render, screen } from "@testing-library/react";
import { OrderItemCustomizations } from "../components/orders/OrderItemCustomizations";

// Mock do formatCurrency
jest.mock("../lib/utils/order-utils", () => ({
  formatCurrency: (value: number) => `R$ ${value.toFixed(2).replace(".", ",")}`,
}));

describe("OrderItemCustomizations", () => {
  const mockCustomizations = {
    removedIngredients: ["cebola", "tomate"],
    addons: [
      { name: "Borda Recheada", quantity: 1, price: 5.0 },
      { name: "Refrigerante", quantity: 2, price: 3.5 },
    ],
    observations: "Cortar em 8 pedaços",
  };

  const mockCustomizationsOnlyAddons = {
    addons: [{ name: "Borda Recheada", quantity: 1, price: 5.0 }],
  };

  const mockCustomizationsOnlyRemoved = {
    removedIngredients: ["cebola", "tomate", "alface"],
  };

  const mockCustomizationsOnlyObservations = {
    observations: "Sem sal",
  };

  const mockEmptyCustomizations = {
    removedIngredients: [],
    addons: [],
  };

  describe("Variant detailed", () => {
    it("deve exibir todas as customizações quando há adicionais, removidos e observações", () => {
      render(
        <OrderItemCustomizations
          customizations={mockCustomizations}
          variant="detailed"
        />
      );

      // Verificar ingredientes removidos
      expect(screen.getByText("Ingredientes Removidos")).toBeInTheDocument();
      expect(screen.getByText("cebola")).toBeInTheDocument();
      expect(screen.getByText("tomate")).toBeInTheDocument();

      // Verificar adicionais
      expect(screen.getByText("Adicionais Incluídos")).toBeInTheDocument();
      expect(screen.getByText("1x Borda Recheada")).toBeInTheDocument();
      expect(screen.getByText("+R$ 5,00")).toBeInTheDocument();
      expect(screen.getByText("2x Refrigerante")).toBeInTheDocument();
      expect(screen.getByText("+R$ 3,50")).toBeInTheDocument();

      // Verificar observações
      expect(screen.getByText("Observações")).toBeInTheDocument();
      expect(screen.getByText("Cortar em 8 pedaços")).toBeInTheDocument();
    });

    it("deve exibir apenas adicionais quando só há adicionais", () => {
      render(
        <OrderItemCustomizations
          customizations={mockCustomizationsOnlyAddons}
          variant="detailed"
        />
      );

      expect(screen.getByText("Adicionais Incluídos")).toBeInTheDocument();
      expect(screen.getByText("1x Borda Recheada")).toBeInTheDocument();
      expect(
        screen.queryByText("Ingredientes Removidos")
      ).not.toBeInTheDocument();
      expect(screen.queryByText("Observações")).not.toBeInTheDocument();
    });

    it("deve exibir apenas ingredientes removidos quando só há removidos", () => {
      render(
        <OrderItemCustomizations
          customizations={mockCustomizationsOnlyRemoved}
          variant="detailed"
        />
      );

      expect(screen.getByText("Ingredientes Removidos")).toBeInTheDocument();
      expect(screen.getByText("cebola")).toBeInTheDocument();
      expect(screen.getByText("tomate")).toBeInTheDocument();
      expect(screen.getByText("alface")).toBeInTheDocument();
      expect(
        screen.queryByText("Adicionais Incluídos")
      ).not.toBeInTheDocument();
      expect(screen.queryByText("Observações")).not.toBeInTheDocument();
    });

    it("deve exibir apenas observações quando só há observações", () => {
      render(
        <OrderItemCustomizations
          customizations={mockCustomizationsOnlyObservations}
          variant="detailed"
        />
      );

      expect(screen.getByText("Observações")).toBeInTheDocument();
      expect(screen.getByText("Sem sal")).toBeInTheDocument();
      expect(
        screen.queryByText("Ingredientes Removidos")
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText("Adicionais Incluídos")
      ).not.toBeInTheDocument();
    });

    it("deve exibir mensagem de sem customizações quando não há customizações", () => {
      render(
        <OrderItemCustomizations
          customizations={mockEmptyCustomizations}
          variant="detailed"
        />
      );

      expect(
        screen.getByText("Sem adicionais ou modificações")
      ).toBeInTheDocument();
    });

    it("não deve renderizar nada quando customizations é null", () => {
      const { container } = render(
        <OrderItemCustomizations customizations={null} variant="detailed" />
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe("Variant compact", () => {
    it("deve exibir customizações em formato compacto", () => {
      render(
        <OrderItemCustomizations
          customizations={mockCustomizations}
          variant="compact"
        />
      );

      // Verificar ingredientes removidos
      expect(screen.getByText("Remover: cebola, tomate")).toBeInTheDocument();

      // Verificar adicionais
      expect(
        screen.getByText("Adicionais: 1x Borda Recheada, 2x Refrigerante")
      ).toBeInTheDocument();

      // Verificar observações
      expect(screen.getByText("Obs: Cortar em 8 pedaços")).toBeInTheDocument();
    });

    it("não deve renderizar nada quando não há customizações no formato compacto", () => {
      const { container } = render(
        <OrderItemCustomizations
          customizations={mockEmptyCustomizations}
          variant="compact"
        />
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe("Responsividade", () => {
    it("deve aplicar classes CSS responsivas", () => {
      const { container } = render(
        <OrderItemCustomizations
          customizations={mockCustomizations}
          variant="detailed"
          className="custom-class"
        />
      );

      expect(container.firstChild).toHaveClass("custom-class");
    });
  });
});
