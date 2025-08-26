import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { Dashboard } from "../components/Dashboard";
import { useAuthContext } from "../contexts/AuthContext";

// Mock dos hooks
jest.mock("../contexts/AuthContext");
jest.mock("../hooks", () => ({
  useStores: jest.fn(),
  useStore: jest.fn(),
  useStoreStats: jest.fn(),
  useOrders: jest.fn(),
  useOrderStats: jest.fn(),
  useDashboardStats: jest.fn(),
  useProducts: jest.fn(),
  useCategories: jest.fn(),
  useCreateProduct: jest.fn(),
  useUpdateProduct: jest.fn(),
  useDeleteProduct: jest.fn(),
  useCreateCategory: jest.fn(),
  useUpdateCategory: jest.fn(),
  useDeleteCategory: jest.fn(),
}));

const mockUseAuthContext = useAuthContext as jest.MockedFunction<
  typeof useAuthContext
>;
const mockHooks = require("../hooks");

describe("Dashboard", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Mock padrão do contexto de autenticação
    mockUseAuthContext.mockReturnValue({
      user: {
        id: "1",
        name: "Usuário Teste",
        email: "teste@exemplo.com",
        role: "ADMIN",
        active: true,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      },
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
    });

    // Mock padrão dos hooks
    mockHooks.useStores.mockReturnValue({
      data: { data: [] },
      isLoading: false,
    });

    mockHooks.useStore.mockReturnValue({
      data: {
        id: "1",
        slug: "loja-teste",
        name: "Loja Teste",
        active: true,
        approved: true,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        config: {} as any,
      },
      isLoading: false,
    });

    mockHooks.useStoreStats.mockReturnValue({
      data: {
        totalOrders: 156,
        totalRevenue: 12500.5,
        averageOrderValue: 80.13,
        totalProducts: 24,
        activeProducts: 20,
        totalCustomers: 45,
      },
      isLoading: false,
    });

    mockHooks.useOrders.mockReturnValue({
      data: {
        data: [
          {
            id: "1",
            orderNumber: "001",
            status: "RECEIVED",
            total: 45.9,
            customer: { name: "Cliente 1" },
            createdAt: "2024-01-01T10:00:00Z",
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
      },
      isLoading: false,
    });

    mockHooks.useOrderStats.mockReturnValue({
      data: {
        totalOrders: 156,
        ordersByStatus: { RECEIVED: 8, CONFIRMED: 5, PREPARING: 3 },
        totalRevenue: 12500.5,
        averageOrderValue: 80.13,
        ordersByType: { DELIVERY: 100, PICKUP: 56 },
      },
      isLoading: false,
    });

    mockHooks.useDashboardStats.mockReturnValue({
      totalProducts: 24,
      totalOrders: 156,
      pendingOrders: 8,
      dailySales: 1250.5,
      isLoading: false,
      error: null,
    });

    mockHooks.useProducts.mockReturnValue({
      data: {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        pagination: {
          totalPages: 1,
          currentPage: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      },
      isLoading: false,
    });

    mockHooks.useCategories.mockReturnValue({
      data: [],
      isLoading: false,
    });

    mockHooks.useCreateProduct.mockReturnValue({
      mutateAsync: jest.fn(),
      isLoading: false,
    });

    mockHooks.useUpdateProduct.mockReturnValue({
      mutateAsync: jest.fn(),
      isLoading: false,
    });

    mockHooks.useDeleteProduct.mockReturnValue({
      mutateAsync: jest.fn(),
      isLoading: false,
    });

    mockHooks.useCreateCategory.mockReturnValue({
      mutateAsync: jest.fn(),
      isLoading: false,
    });

    mockHooks.useUpdateCategory.mockReturnValue({
      mutateAsync: jest.fn(),
      isLoading: false,
    });

    mockHooks.useDeleteCategory.mockReturnValue({
      mutateAsync: jest.fn(),
      isLoading: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("deve renderizar a dashboard com estatísticas corretas", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Dashboard storeSlug="loja-teste" />
      </QueryClientProvider>
    );

    // Verificar se os cards de estatísticas estão presentes
    expect(screen.getByText("Total de Produtos")).toBeInTheDocument();
    expect(screen.getByText("24")).toBeInTheDocument();

    expect(screen.getByText("Total de Pedidos")).toBeInTheDocument();
    expect(screen.getByText("156")).toBeInTheDocument();

    expect(screen.getByText("Pedidos Pendentes")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();

    expect(screen.getByText("Vendas do Dia")).toBeInTheDocument();
    expect(screen.getByText("R$ 1250.50")).toBeInTheDocument();
  });

  it('deve mostrar botões "Ver todos" nos cards de estatísticas', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Dashboard storeSlug="loja-teste" />
      </QueryClientProvider>
    );

    // Verificar se os botões "Ver todos" estão presentes
    const verTodosButtons = screen.getAllByText("Ver todos");
    expect(verTodosButtons).toHaveLength(3); // Total de Produtos, Total de Pedidos, Pedidos Pendentes
  });

  it('deve navegar para a aba correta ao clicar em "Ver todos"', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Dashboard storeSlug="loja-teste" />
      </QueryClientProvider>
    );

    // Clicar no botão "Ver todos" do card de produtos
    const verTodosProdutos = screen.getAllByText("Ver todos")[0];
    fireEvent.click(verTodosProdutos);

    // Verificar se a aba de produtos foi ativada (usando o h2 principal)
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Gerenciamento de Produtos",
      })
    ).toBeInTheDocument();
  });

  it("deve mostrar loading state quando os dados estão carregando", () => {
    mockHooks.useDashboardStats.mockReturnValue({
      totalProducts: 0,
      totalOrders: 0,
      pendingOrders: 0,
      dailySales: 0,
      isLoading: true,
      error: null,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <Dashboard storeSlug="loja-teste" />
      </QueryClientProvider>
    );

    // Verificar se o loading está sendo exibido
    expect(screen.getByText("Carregando...")).toBeInTheDocument();
  });

  it("deve mostrar erro quando há falha ao carregar estatísticas", () => {
    mockHooks.useDashboardStats.mockReturnValue({
      totalProducts: 0,
      totalOrders: 0,
      pendingOrders: 0,
      dailySales: 0,
      isLoading: false,
      error: new Error("Erro ao carregar dados"),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <Dashboard storeSlug="loja-teste" />
      </QueryClientProvider>
    );

    // Verificar se a mensagem de erro está sendo exibida
    expect(
      screen.getByText("Erro ao carregar estatísticas")
    ).toBeInTheDocument();
    expect(screen.getByText("Erro ao carregar dados")).toBeInTheDocument();
    expect(screen.getByText("Tentar novamente")).toBeInTheDocument();
  });

  it("deve mostrar todas as abas de navegação", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Dashboard storeSlug="loja-teste" />
      </QueryClientProvider>
    );

    // Verificar se todas as abas estão presentes
    expect(screen.getByText("Visão Geral")).toBeInTheDocument();
    expect(screen.getByText("Usuários")).toBeInTheDocument();
    expect(screen.getByText("Lojas")).toBeInTheDocument();
    expect(screen.getByText("Produtos")).toBeInTheDocument();
    expect(screen.getByText("Pedidos")).toBeInTheDocument();
    expect(screen.getByText("Analytics")).toBeInTheDocument();
  });

  it("deve mostrar pedidos recentes quando disponíveis", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Dashboard storeSlug="loja-teste" />
      </QueryClientProvider>
    );

    // Verificar se a seção de pedidos recentes está presente
    expect(screen.getByText("Pedidos Recentes")).toBeInTheDocument();
    expect(screen.getByText("Cliente 1")).toBeInTheDocument();
    expect(screen.getByText("R$ 45.90")).toBeInTheDocument();
  });

  it("deve mostrar mensagem de acesso negado quando não autenticado", () => {
    mockUseAuthContext.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <Dashboard storeSlug="loja-teste" />
      </QueryClientProvider>
    );

    expect(screen.getByText("Acesso Negado")).toBeInTheDocument();
    expect(
      screen.getByText("Você precisa estar logado para acessar o dashboard.")
    ).toBeInTheDocument();
  });
});
