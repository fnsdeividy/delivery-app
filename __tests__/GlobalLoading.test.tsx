import { render, screen } from "@testing-library/react";
import GlobalLoading, { LoadingContent } from "../components/GlobalLoading";

// Mock do contexto para testes
const mockLoadingContext = {
  loadingState: {
    isLoading: false,
    loadingMessage: undefined,
    variant: "topbar" as const,
  },
  setLoading: jest.fn(),
  startRouteLoading: jest.fn(),
  stopRouteLoading: jest.fn(),
};

jest.mock("../contexts/LoadingContext", () => ({
  ...jest.requireActual("../contexts/LoadingContext"),
  useLoadingContext: () => mockLoadingContext,
}));

describe("GlobalLoading", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("não deve renderizar quando isLoading é false", () => {
    mockLoadingContext.loadingState.isLoading = false;

    render(<GlobalLoading />);

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("deve renderizar barra de progresso quando isLoading é true e variant é topbar", () => {
    mockLoadingContext.loadingState.isLoading = true;
    mockLoadingContext.loadingState.variant = "topbar";
    mockLoadingContext.loadingState.loadingMessage = "Carregando...";

    render(<GlobalLoading />);

    // Verifica se a barra de progresso está presente
    const progressBar = document.querySelector(
      ".fixed.top-0.left-0.right-0.z-50"
    );
    expect(progressBar).toBeInTheDocument();
  });

  it("deve renderizar overlay quando isLoading é true e variant é overlay", () => {
    mockLoadingContext.loadingState.isLoading = true;
    mockLoadingContext.loadingState.variant = "overlay";
    mockLoadingContext.loadingState.loadingMessage = "Carregando...";

    render(<GlobalLoading />);

    // Verifica se o overlay está presente
    const overlay = document.querySelector(".fixed.inset-0.z-50");
    expect(overlay).toBeInTheDocument();

    // Verifica se o spinner está presente
    const spinner = document.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();

    // Verifica se a mensagem está presente (usando getAllByText para evitar erro de múltiplos elementos)
    expect(screen.getAllByText("Carregando...")).toHaveLength(2); // Anúncio + mensagem visível
  });

  it("deve incluir anúncio para leitores de tela", () => {
    mockLoadingContext.loadingState.isLoading = true;
    mockLoadingContext.loadingState.loadingMessage = "Navegando...";

    render(<GlobalLoading />);

    // Verifica se o elemento de anúncio está presente
    const announcement = document.querySelector('.sr-only[aria-live="polite"]');
    expect(announcement).toBeInTheDocument();
  });
});

describe("LoadingContent", () => {
  it("deve aplicar aria-busy quando isLoading é true", () => {
    mockLoadingContext.loadingState.isLoading = true;

    render(
      <LoadingContent>
        <div>Conteúdo de teste</div>
      </LoadingContent>
    );

    const content = screen.getByText("Conteúdo de teste").parentElement;
    expect(content).toHaveAttribute("aria-busy", "true");
    expect(content).toHaveAttribute("aria-live", "polite");
  });

  it("deve aplicar aria-busy false quando isLoading é false", () => {
    mockLoadingContext.loadingState.isLoading = false;

    render(
      <LoadingContent>
        <div>Conteúdo de teste</div>
      </LoadingContent>
    );

    const content = screen.getByText("Conteúdo de teste").parentElement;
    expect(content).toHaveAttribute("aria-busy", "false");
    expect(content).toHaveAttribute("aria-live", "off");
  });

  it("deve aplicar className customizada", () => {
    mockLoadingContext.loadingState.isLoading = false;

    render(
      <LoadingContent className="custom-class">
        <div>Conteúdo de teste</div>
      </LoadingContent>
    );

    const content = screen.getByText("Conteúdo de teste").parentElement;
    expect(content).toHaveClass("custom-class");
  });
});
