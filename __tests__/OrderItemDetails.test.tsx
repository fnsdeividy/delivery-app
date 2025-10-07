import { render, screen } from "@testing-library/react";
import { OrderItemDetails } from "../components/orders/OrderItemDetails";
import { CartItem } from "../contexts/CartContext";
import { Product } from "../types/cardapio-api";

// Mock de um produto com adicionais e ingredientes
const mockProduct: Product = {
  id: "1",
  name: "Pizza Margherita",
  price: 25.9,
  description: "Pizza com molho de tomate, mussarela e manjericão",
  image: "",
  isAvailable: true,
  categoryId: "1",
  storeId: "1",
  addons: [
    {
      id: "addon-1",
      name: "Borda Recheada",
      price: 5.0,
      isRequired: false,
    },
    {
      id: "addon-2",
      name: "Extra Queijo",
      price: 3.0,
      isRequired: false,
    },
  ],
  ingredients: [
    {
      id: "ingredient-1",
      name: "Cebola",
      isRemovable: true,
    },
    {
      id: "ingredient-2",
      name: "Tomate",
      isRemovable: true,
    },
  ],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockCartItem: CartItem = {
  id: "item-1",
  product: mockProduct,
  quantity: 2,
  customizations: {
    selectedIngredients: ["ingredient-1"],
    removedIngredients: ["ingredient-2"],
    selectedAddons: {
      "addon-1": 1,
      "addon-2": 2,
    },
    specialInstructions: "Cortar em 8 pedaços",
  },
};

describe("OrderItemDetails", () => {
  it("deve exibir adicionais selecionados", () => {
    render(<OrderItemDetails item={mockCartItem} />);

    expect(screen.getByText("+1x Borda Recheada")).toBeInTheDocument();
    expect(screen.getByText("+2x Extra Queijo")).toBeInTheDocument();
    expect(screen.getByText("R$ 5,00")).toBeInTheDocument();
    expect(screen.getByText("R$ 6,00")).toBeInTheDocument();
  });

  it("deve exibir ingredientes removidos", () => {
    render(<OrderItemDetails item={mockCartItem} />);

    expect(screen.getByText("–Tomate")).toBeInTheDocument();
  });

  it("deve exibir instruções especiais", () => {
    render(<OrderItemDetails item={mockCartItem} />);

    expect(screen.getByText("Observação:")).toBeInTheDocument();
    expect(screen.getByText("Cortar em 8 pedaços")).toBeInTheDocument();
  });

  it("não deve exibir nada quando não há customizações", () => {
    const itemWithoutCustomizations: CartItem = {
      ...mockCartItem,
      customizations: undefined,
    };

    const { container } = render(
      <OrderItemDetails item={itemWithoutCustomizations} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("não deve exibir nada quando customizações estão vazias", () => {
    const itemWithEmptyCustomizations: CartItem = {
      ...mockCartItem,
      customizations: {
        selectedIngredients: [],
        removedIngredients: [],
        selectedAddons: {},
        specialInstructions: "",
      },
    };

    const { container } = render(
      <OrderItemDetails item={itemWithEmptyCustomizations} />
    );
    expect(container.firstChild).toBeNull();
  });
});
