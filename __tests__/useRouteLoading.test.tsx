import { act, render, screen, waitFor } from "@testing-library/react";
import { LoadingProvider } from "../contexts/LoadingContext";
import {
  useDashboardRouteLoading,
  useRouteLoading,
} from "../hooks/useRouteLoading";

// Mock do Next.js router
const mockPush = jest.fn();
const mockPathname = "/dashboard/test-store";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => mockPathname,
}));

// Componente de teste
function TestComponent() {
  const {
    navigateWithLoading,
    navigateWithoutLoading,
    stopLoading,
    isLoading,
    loadingMessage,
  } = useRouteLoading({
    minimumMs: 100,
    timeoutMs: 1000,
  });

  return (
    <div>
      <div data-testid="loading-status">
        {isLoading ? "loading" : "not-loading"}
      </div>
      <div data-testid="loading-message">{loadingMessage || "no-message"}</div>

      <button
        data-testid="navigate-with-loading"
        onClick={() => navigateWithLoading("/dashboard/test-store/produtos")}
      >
        Navigate with Loading
      </button>

      <button
        data-testid="navigate-without-loading"
        onClick={() => navigateWithoutLoading("/dashboard/test-store/pedidos")}
      >
        Navigate without Loading
      </button>

      <button data-testid="stop-loading" onClick={() => stopLoading()}>
        Stop Loading
      </button>
    </div>
  );
}

describe("useRouteLoading", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("deve navegar com loading quando navigateWithLoading é chamado", async () => {
    render(
      <LoadingProvider>
        <TestComponent />
      </LoadingProvider>
    );

    act(() => {
      screen.getByTestId("navigate-with-loading").click();
    });

    // Verifica se o loading foi iniciado
    await waitFor(() => {
      expect(screen.getByTestId("loading-status")).toHaveTextContent("loading");
      expect(screen.getByTestId("loading-message")).toHaveTextContent(
        "Navegando para /dashboard/test-store/produtos..."
      );
    });

    // Verifica se o router.push foi chamado
    expect(mockPush).toHaveBeenCalledWith("/dashboard/test-store/produtos");
  });

  it("deve navegar sem loading quando navigateWithoutLoading é chamado", () => {
    render(
      <LoadingProvider>
        <TestComponent />
      </LoadingProvider>
    );

    act(() => {
      screen.getByTestId("navigate-without-loading").click();
    });

    // Verifica se o loading não foi iniciado
    expect(screen.getByTestId("loading-status")).toHaveTextContent(
      "not-loading"
    );

    // Verifica se o router.push foi chamado
    expect(mockPush).toHaveBeenCalledWith("/dashboard/test-store/pedidos");
  });

  it("deve parar loading quando stopLoading é chamado", async () => {
    render(
      <LoadingProvider>
        <TestComponent />
      </LoadingProvider>
    );

    // Primeiro iniciar loading
    act(() => {
      screen.getByTestId("navigate-with-loading").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("loading-status")).toHaveTextContent("loading");
    });

    // Depois parar
    act(() => {
      screen.getByTestId("stop-loading").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("loading-status")).toHaveTextContent(
        "not-loading"
      );
    });
  });

  it("deve ignorar cliques adicionais quando já está carregando", async () => {
    render(
      <LoadingProvider>
        <TestComponent />
      </LoadingProvider>
    );

    // Primeiro clique
    act(() => {
      screen.getByTestId("navigate-with-loading").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("loading-status")).toHaveTextContent("loading");
    });

    // Segundo clique (deve ser ignorado)
    act(() => {
      screen.getByTestId("navigate-with-loading").click();
    });

    // Verifica se router.push foi chamado apenas uma vez
    expect(mockPush).toHaveBeenCalledTimes(1);
  });

  it("deve aplicar timeout de segurança", async () => {
    render(
      <LoadingProvider>
        <TestComponent />
      </LoadingProvider>
    );

    act(() => {
      screen.getByTestId("navigate-with-loading").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("loading-status")).toHaveTextContent("loading");
    });

    // Avançar tempo para o timeout
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(screen.getByTestId("loading-status")).toHaveTextContent(
        "not-loading"
      );
    });
  });

  it("deve aplicar tempo mínimo de exibição", async () => {
    render(
      <LoadingProvider>
        <TestComponent />
      </LoadingProvider>
    );

    act(() => {
      screen.getByTestId("navigate-with-loading").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("loading-status")).toHaveTextContent("loading");
    });

    // Tentar parar imediatamente
    act(() => {
      screen.getByTestId("stop-loading").click();
    });

    // Deve ainda estar carregando
    expect(screen.getByTestId("loading-status")).toHaveTextContent("loading");

    // Avançar tempo para o mínimo
    act(() => {
      jest.advanceTimersByTime(100);
    });

    await waitFor(() => {
      expect(screen.getByTestId("loading-status")).toHaveTextContent(
        "not-loading"
      );
    });
  });
});

describe("useDashboardRouteLoading", () => {
  it("deve usar configurações padrão do dashboard", () => {
    const TestDashboardComponent = () => {
      const { navigateWithLoading } = useDashboardRouteLoading();

      return (
        <button
          data-testid="dashboard-navigate"
          onClick={() => navigateWithLoading("/dashboard/test-store/analytics")}
        >
          Dashboard Navigate
        </button>
      );
    };

    render(
      <LoadingProvider>
        <TestDashboardComponent />
      </LoadingProvider>
    );

    act(() => {
      screen.getByTestId("dashboard-navigate").click();
    });

    expect(mockPush).toHaveBeenCalledWith("/dashboard/test-store/analytics");
  });
});
