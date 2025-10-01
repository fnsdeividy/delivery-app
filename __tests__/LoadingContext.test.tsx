import { act, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { LoadingProvider, useLoadingContext } from "../contexts/LoadingContext";

// Componente de teste para usar o contexto
function TestComponent() {
  const { loadingState, setLoading, startRouteLoading, stopRouteLoading } =
    useLoadingContext();
  const [testLoading, setTestLoading] = useState(false);

  return (
    <div>
      <div data-testid="loading-status">
        {loadingState.isLoading ? "loading" : "not-loading"}
      </div>
      <div data-testid="loading-message">
        {loadingState.loadingMessage || "no-message"}
      </div>
      <div data-testid="loading-variant">
        {loadingState.variant || "no-variant"}
      </div>

      <button
        data-testid="set-loading-true"
        onClick={() => setLoading(true, { loadingMessage: "Test loading" })}
      >
        Set Loading True
      </button>

      <button data-testid="set-loading-false" onClick={() => setLoading(false)}>
        Set Loading False
      </button>

      <button
        data-testid="start-route-loading"
        onClick={() => startRouteLoading("/test-route", { variant: "overlay" })}
      >
        Start Route Loading
      </button>

      <button
        data-testid="stop-route-loading"
        onClick={() => stopRouteLoading()}
      >
        Stop Route Loading
      </button>
    </div>
  );
}

describe("LoadingContext", () => {
  it("deve fornecer estado inicial correto", () => {
    render(
      <LoadingProvider>
        <TestComponent />
      </LoadingProvider>
    );

    expect(screen.getByTestId("loading-status")).toHaveTextContent(
      "not-loading"
    );
    expect(screen.getByTestId("loading-message")).toHaveTextContent(
      "no-message"
    );
    expect(screen.getByTestId("loading-variant")).toHaveTextContent("topbar");
  });

  it("deve atualizar estado quando setLoading(true) é chamado", async () => {
    render(
      <LoadingProvider>
        <TestComponent />
      </LoadingProvider>
    );

    act(() => {
      screen.getByTestId("set-loading-true").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("loading-status")).toHaveTextContent("loading");
      expect(screen.getByTestId("loading-message")).toHaveTextContent(
        "Test loading"
      );
    });
  });

  it("deve atualizar estado quando setLoading(false) é chamado", async () => {
    render(
      <LoadingProvider>
        <TestComponent />
      </LoadingProvider>
    );

    // Primeiro ativar loading
    act(() => {
      screen.getByTestId("set-loading-true").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("loading-status")).toHaveTextContent("loading");
    });

    // Depois desativar
    act(() => {
      screen.getByTestId("set-loading-false").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("loading-status")).toHaveTextContent(
        "not-loading"
      );
      expect(screen.getByTestId("loading-message")).toHaveTextContent(
        "no-message"
      );
    });
  });

  it("deve funcionar startRouteLoading corretamente", async () => {
    render(
      <LoadingProvider>
        <TestComponent />
      </LoadingProvider>
    );

    act(() => {
      screen.getByTestId("start-route-loading").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("loading-status")).toHaveTextContent("loading");
      expect(screen.getByTestId("loading-message")).toHaveTextContent(
        "Navegando"
      );
      expect(screen.getByTestId("loading-variant")).toHaveTextContent(
        "overlay"
      );
    });
  });

  it("deve funcionar stopRouteLoading corretamente", async () => {
    render(
      <LoadingProvider>
        <TestComponent />
      </LoadingProvider>
    );

    // Primeiro ativar loading
    act(() => {
      screen.getByTestId("start-route-loading").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("loading-status")).toHaveTextContent("loading");
    });

    // Depois parar
    act(() => {
      screen.getByTestId("stop-route-loading").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("loading-status")).toHaveTextContent(
        "not-loading"
      );
    });
  });

  it("deve aplicar timeout de segurança", async () => {
    jest.useFakeTimers();

    render(
      <LoadingProvider>
        <TestComponent />
      </LoadingProvider>
    );

    act(() => {
      screen.getByTestId("set-loading-true").click();
    });

    expect(screen.getByTestId("loading-status")).toHaveTextContent("loading");

    // Avançar tempo para o timeout (10 segundos)
    act(() => {
      jest.advanceTimersByTime(10000);
    });

    await waitFor(() => {
      expect(screen.getByTestId("loading-status")).toHaveTextContent(
        "not-loading"
      );
    });

    jest.useRealTimers();
  });

  it("deve aplicar tempo mínimo de exibição", async () => {
    jest.useFakeTimers();

    render(
      <LoadingProvider>
        <TestComponent />
      </LoadingProvider>
    );

    act(() => {
      screen.getByTestId("set-loading-true").click();
    });

    expect(screen.getByTestId("loading-status")).toHaveTextContent("loading");

    // Tentar parar imediatamente
    act(() => {
      screen.getByTestId("set-loading-false").click();
    });

    // Deve ainda estar carregando
    expect(screen.getByTestId("loading-status")).toHaveTextContent("loading");

    // Avançar tempo para o mínimo (300ms)
    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(screen.getByTestId("loading-status")).toHaveTextContent(
        "not-loading"
      );
    });

    jest.useRealTimers();
  });
});
