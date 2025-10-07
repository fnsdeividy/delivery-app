import { render, screen } from "@testing-library/react";
import OrderDetailsModal from "../components/orders/OrderDetailsModal";
import { Order, OrderStatus, PaymentStatus } from "../types/cardapio-api";

// Mock do formatCurrency e outras funções
jest.mock("../lib/utils/order-utils", () => ({
  formatCurrency: (value: number) => `R$ ${value.toFixed(2).replace(".", ",")}`,
  formatDateTime: (date: string) => new Date(date).toLocaleString("pt-BR"),
  getStatusInfo: () => ({ icon: "📋", color: "gray" }),
  getPaymentStatusInfo: () => ({ label: "Pendente", color: "yellow" }),
}));

const mockOrderWithCustomizations: Order = {
  id: "1",
  orderNumber: "001",
  subtotal: 25.0,
  deliveryFee: 5.0,
  discount: 0,
  total: 30.0,
  status: OrderStatus.RECEIVED,
  type: "DELIVERY",
  paymentMethod: "card",
  paymentStatus: PaymentStatus.PENDING,
  customerId: "customer-1",
  storeSlug: "test-store",
  notes: "Observação geral do pedido",
  createdAt: "2024-01-01T10:00:00Z",
  updatedAt: "2024-01-01T10:00:00Z",
  items: [
    {
      id: "item-1",
      name: "Pizza Margherita",
      quantity: 1,
      price: 20.0,
      productId: "product-1",
      customizations: {
        removedIngredients: ["cebola", "tomate"],
        addons: [
          { name: "Borda Recheada", quantity: 1, price: 5.0 },
          { name: "Refrigerante", quantity: 2, price: 3.5 },
        ],
        observations: "Cortar em 8 pedaços",
      },
    },
    {
      id: "item-2",
      name: "Hambúrguer Clássico",
      quantity: 2,
      price: 15.0,
      productId: "product-2",
      customizations: {
        removedIngredients: ["alface"],
        addons: [{ name: "Bacon", quantity: 1, price: 4.0 }],
        observations: "Bem passado",
      },
    },
    {
      id: "item-3",
      name: "Batata Frita",
      quantity: 1,
      price: 8.0,
      productId: "product-3",
      customizations: null,
    },
  ],
  customer: {
    id: "customer-1",
    name: "João Silva",
    email: "joao@email.com",
    phone: "11999999999",
    storeSlug: "test-store",
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z",
  },
};

const mockOrderWithoutCustomizations: Order = {
  ...mockOrderWithCustomizations,
  items: [
    {
      id: "item-1",
      name: "Pizza Margherita",
      quantity: 1,
      price: 20.0,
      productId: "product-1",
      customizations: null,
    },
  ],
};

describe("OrderDetailsModal com Customizações", () => {
  it("deve exibir customizações detalhadas para cada item", () => {
    render(
      <OrderDetailsModal
        order={mockOrderWithCustomizations}
        isOpen={true}
        onClose={() => {}}
      />
    );

    // Verificar se os itens são exibidos
    expect(screen.getByText("Pizza Margherita")).toBeInTheDocument();
    expect(screen.getByText("Hambúrguer Clássico")).toBeInTheDocument();
    expect(screen.getByText("Batata Frita")).toBeInTheDocument();

    // Verificar customizações do primeiro item (Pizza)
    expect(screen.getByText("Ingredientes Removidos")).toBeInTheDocument();
    expect(screen.getByText("cebola")).toBeInTheDocument();
    expect(screen.getByText("tomate")).toBeInTheDocument();
    expect(screen.getByText("Adicionais Incluídos")).toBeInTheDocument();
    expect(screen.getByText("1x Borda Recheada")).toBeInTheDocument();
    expect(screen.getByText("2x Refrigerante")).toBeInTheDocument();
    expect(screen.getByText("Observações")).toBeInTheDocument();
    expect(screen.getByText("Cortar em 8 pedaços")).toBeInTheDocument();

    // Verificar customizações do segundo item (Hambúrguer)
    expect(screen.getByText("alface")).toBeInTheDocument();
    expect(screen.getByText("1x Bacon")).toBeInTheDocument();
    expect(screen.getByText("Bem passado")).toBeInTheDocument();

    // Verificar que o terceiro item (Batata) não tem customizações
    const batataItem = screen.getByText("Batata Frita").closest("div");
    expect(batataItem).not.toHaveTextContent("Ingredientes Removidos");
    expect(batataItem).not.toHaveTextContent("Adicionais Incluídos");
  });

  it("deve exibir mensagem de sem customizações quando não há customizações", () => {
    render(
      <OrderDetailsModal
        order={mockOrderWithoutCustomizations}
        isOpen={true}
        onClose={() => {}}
      />
    );

    expect(
      screen.getByText("Sem adicionais ou modificações")
    ).toBeInTheDocument();
  });

  it("não deve renderizar quando isOpen é false", () => {
    const { container } = render(
      <OrderDetailsModal
        order={mockOrderWithCustomizations}
        isOpen={false}
        onClose={() => {}}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it("não deve renderizar quando order é null", () => {
    const { container } = render(
      <OrderDetailsModal order={null} isOpen={true} onClose={() => {}} />
    );

    expect(container.firstChild).toBeNull();
  });
});
