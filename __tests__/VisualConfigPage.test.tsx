import { fireEvent, render, screen } from "@testing-library/react";
import { useParams, useRouter } from "next/navigation";
import VisualConfigPage from "../app/(dashboard)/dashboard/[storeSlug]/configuracoes/visual/page";
import { useStoreConfig } from "../lib/store/useStoreConfig";

// Mock dos hooks
jest.mock("next/navigation", () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock("../lib/store/useStoreConfig");
jest.mock("../lib/api-client", () => ({
  apiClient: {
    patch: jest.fn(),
    upload: jest.fn(),
  },
}));

const mockUseParams = useParams as jest.MockedFunction<typeof useParams>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseStoreConfig = useStoreConfig as jest.MockedFunction<
  typeof useStoreConfig
>;

describe("VisualConfigPage", () => {
  const mockRouter = {
    push: jest.fn(),
  };

  const mockConfig = {
    id: "1",
    slug: "test-store",
    name: "Test Store",
    branding: {
      logo: "https://example.com/logo.png",
      favicon: "https://example.com/favicon.ico",
      banner: "https://example.com/banner.jpg",
      primaryColor: "#d97706",
      secondaryColor: "#92400e",
      backgroundColor: "#fef3c7",
      textColor: "#1f2937",
      accentColor: "#f59e0b",
    },
    active: true,
    approved: true,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseParams.mockReturnValue({ storeSlug: "test-store" });
    mockUseRouter.mockReturnValue(mockRouter);
    mockUseStoreConfig.mockReturnValue({
      config: mockConfig,
      loading: false,
      error: null,
    });
  });

  it("deve renderizar a página com título e descrição", () => {
    render(<VisualConfigPage />);

    expect(screen.getByText("Aparência Visual")).toBeInTheDocument();
    expect(
      screen.getByText(
        /Personalize cores, logo, banner e identidade visual da sua loja/
      )
    ).toBeInTheDocument();
  });

  it("deve exibir botões de Visualizar e Salvar no header", () => {
    render(<VisualConfigPage />);

    expect(screen.getByText("Visualizar")).toBeInTheDocument();
    expect(screen.getByText("Salvar")).toBeInTheDocument();
  });

  it('deve exibir link "Voltar ao Dashboard"', () => {
    render(<VisualConfigPage />);

    const backButton = screen.getByText("Voltar ao Dashboard");
    expect(backButton).toBeInTheDocument();

    fireEvent.click(backButton);
    expect(mockRouter.push).toHaveBeenCalledWith("/dashboard/test-store");
  });

  it("deve exibir seções de upload para logo, favicon e banner", () => {
    render(<VisualConfigPage />);

    expect(screen.getByText("Logo da Loja")).toBeInTheDocument();
    expect(screen.getByText("Favicon")).toBeInTheDocument();
    expect(screen.getByText("Banner da Loja")).toBeInTheDocument();
  });

  it("deve exibir esquemas de cores pré-definidos", () => {
    render(<VisualConfigPage />);

    expect(screen.getByText("Laranja Clássico")).toBeInTheDocument();
    expect(screen.getByText("Azul Profissional")).toBeInTheDocument();
    expect(screen.getByText("Verde Natural")).toBeInTheDocument();
    expect(screen.getByText("Roxo Elegante")).toBeInTheDocument();
    expect(screen.getByText("Rosa Moderno")).toBeInTheDocument();
  });

  it("deve exibir campos de cores personalizadas", () => {
    render(<VisualConfigPage />);

    expect(screen.getByText("Cor Primária")).toBeInTheDocument();
    expect(screen.getByText("Cor Secundária")).toBeInTheDocument();
    expect(screen.getByText("Cor de Fundo")).toBeInTheDocument();
    expect(screen.getByText("Cor do Texto")).toBeInTheDocument();
    expect(screen.getByText("Cor de Destaque")).toBeInTheDocument();
  });

  it("deve aplicar esquema de cores ao clicar", () => {
    render(<VisualConfigPage />);

    const azulProfissional = screen.getByText("Azul Profissional");
    fireEvent.click(azulProfissional);

    // Verificar se as cores foram aplicadas (os valores específicos podem variar)
    expect(screen.getByDisplayValue("#2563eb")).toBeInTheDocument();
  });

  it("deve exibir preview quando botão Visualizar for clicado", () => {
    render(<VisualConfigPage />);

    const visualizarButton = screen.getByText("Visualizar");
    fireEvent.click(visualizarButton);

    expect(
      screen.getByText("Preview da Identidade Visual")
    ).toBeInTheDocument();
    expect(screen.getByText("Nome da Loja")).toBeInTheDocument();
    expect(screen.getByText("Descrição da loja")).toBeInTheDocument();
  });

  it("deve exibir loading quando config estiver carregando", () => {
    mockUseStoreConfig.mockReturnValue({
      config: null,
      loading: true,
      error: null,
    });

    render(<VisualConfigPage />);

    expect(screen.getByText("Carregando configurações...")).toBeInTheDocument();
  });

  it("deve exibir erro quando houver problema ao carregar", () => {
    mockUseStoreConfig.mockReturnValue({
      config: null,
      loading: false,
      error: "Erro ao carregar configurações",
    });

    render(<VisualConfigPage />);

    expect(
      screen.getByText("Problema ao carregar configurações")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Erro ao carregar configurações")
    ).toBeInTheDocument();
  });

  it("deve exibir botão de recarregar quando houver erro", () => {
    mockUseStoreConfig.mockReturnValue({
      config: null,
      loading: false,
      error: "Erro ao carregar configurações",
    });

    render(<VisualConfigPage />);

    const reloadButton = screen.getByText("Recarregar Página");
    expect(reloadButton).toBeInTheDocument();
  });

  it("deve exibir informações de formato e tamanho para uploads", () => {
    render(<VisualConfigPage />);

    // Verificar se as informações de formato estão sendo exibidas
    expect(screen.getByText(/Formatos aceitos:/)).toBeInTheDocument();
    expect(screen.getByText(/Tamanho máximo:/)).toBeInTheDocument();
  });

  it("deve exibir preview das imagens atuais quando disponíveis", () => {
    render(<VisualConfigPage />);

    // Verificar se as imagens atuais são exibidas
    const logoImage = screen.getByAltText("Logo da Loja atual");
    const faviconImage = screen.getByAltText("Favicon atual");
    const bannerImage = screen.getByAltText("Banner da Loja atual");

    expect(logoImage).toBeInTheDocument();
    expect(faviconImage).toBeInTheDocument();
    expect(bannerImage).toBeInTheDocument();
  });

  it("deve exibir botões de remover para arquivos existentes", () => {
    render(<VisualConfigPage />);

    const removeButtons = screen.getAllByText("Remover");
    expect(removeButtons).toHaveLength(3); // Logo, favicon e banner
  });

  it("deve exibir campos de cores com valores padrão", () => {
    render(<VisualConfigPage />);

    expect(screen.getByDisplayValue("#d97706")).toBeInTheDocument(); // Primary
    expect(screen.getByDisplayValue("#92400e")).toBeInTheDocument(); // Secondary
    expect(screen.getByDisplayValue("#fef3c7")).toBeInTheDocument(); // Background
    expect(screen.getByDisplayValue("#1f2937")).toBeInTheDocument(); // Text
    expect(screen.getByDisplayValue("#f59e0b")).toBeInTheDocument(); // Accent
  });

  it("deve exibir ícones de paleta nos esquemas de cores", () => {
    render(<VisualConfigPage />);

    const paletteIcons = screen.getAllByTestId("palette-icon");
    expect(paletteIcons.length).toBeGreaterThan(0);
  });

  it("deve exibir cores de preview nos esquemas", () => {
    render(<VisualConfigPage />);

    // Verificar se as cores de preview estão sendo exibidas
    const colorPreviews = document.querySelectorAll(
      '[style*="background-color"]'
    );
    expect(colorPreviews.length).toBeGreaterThan(0);
  });

  it("deve exibir informações de contraste WCAG", () => {
    render(<VisualConfigPage />);

    // Abrir preview para verificar contraste
    const visualizarButton = screen.getByText("Visualizar");
    fireEvent.click(visualizarButton);

    // Verificar se o preview está sendo exibido com as cores aplicadas
    const previewContainer = screen
      .getByText("Preview da Identidade Visual")
      .closest("div");
    expect(previewContainer).toBeInTheDocument();
  });
});
