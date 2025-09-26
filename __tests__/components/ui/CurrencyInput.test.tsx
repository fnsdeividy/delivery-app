import { CurrencyInput } from "@/components/ui/currency-input";
import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("CurrencyInput", () => {
  const defaultProps = {
    value: 0,
    onChange: jest.fn(),
    id: "test-currency-input",
    label: "Teste de Preço",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve renderizar corretamente", () => {
    render(<CurrencyInput {...defaultProps} />);

    expect(screen.getByLabelText("Teste de Preço")).toBeInTheDocument();
    expect(screen.getByText("Teste de Preço")).toBeInTheDocument();
  });

  it("deve exibir o valor formatado quando não está focado", () => {
    render(<CurrencyInput {...defaultProps} value={12.34} />);

    expect(screen.getByDisplayValue("12,34")).toBeInTheDocument();
  });

  it("deve permitir digitação de números", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<CurrencyInput {...defaultProps} onChange={onChange} />);

    const input = screen.getByLabelText("Teste de Preço");
    await user.type(input, "1234");

    expect(onChange).toHaveBeenCalledWith(12.34);
  });

  it("deve ignorar caracteres inválidos", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<CurrencyInput {...defaultProps} onChange={onChange} />);

    const input = screen.getByLabelText("Teste de Preço");
    await user.type(input, "abc123def");

    expect(onChange).toHaveBeenCalledWith(1.23);
  });

  it("deve processar valores colados corretamente", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<CurrencyInput {...defaultProps} onChange={onChange} />);

    const input = screen.getByLabelText("Teste de Preço");

    // Simular colar valor formatado
    fireEvent.paste(input, {
      clipboardData: {
        getData: () => "R$ 1.234,56",
      },
    });

    expect(onChange).toHaveBeenCalledWith(1234.56);
  });

  it("deve validar limites mínimo e máximo", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <CurrencyInput {...defaultProps} onChange={onChange} min={10} max={100} />
    );

    const input = screen.getByLabelText("Teste de Preço");

    // Teste valor abaixo do mínimo
    await user.type(input, "5");
    expect(onChange).toHaveBeenCalledWith(0.05);

    // Teste valor acima do máximo
    await user.clear(input);
    await user.type(input, "1000");
    expect(onChange).toHaveBeenCalledWith(10);
  });

  it("deve mostrar erro para campo obrigatório vazio", () => {
    render(<CurrencyInput {...defaultProps} required value={0} />);

    // Simular blur para ativar validação
    const input = screen.getByLabelText("Teste de Preço");
    fireEvent.blur(input);

    expect(screen.getByText("Este campo é obrigatório")).toBeInTheDocument();
  });

  it("deve ter atributos de acessibilidade corretos", () => {
    render(
      <CurrencyInput {...defaultProps} required helperText="Texto de ajuda" />
    );

    const input = screen.getByLabelText("Teste de Preço");

    expect(input).toHaveAttribute("aria-required", "true");
    expect(input).toHaveAttribute(
      "aria-describedby",
      "test-currency-input-helper"
    );
    expect(input).toHaveAttribute("role", "textbox");
    expect(input).toHaveAttribute("inputMode", "numeric");
  });

  it("deve mostrar preview do valor quando focado", async () => {
    const user = userEvent.setup();

    render(<CurrencyInput {...defaultProps} value={12.34} />);

    const input = screen.getByLabelText("Teste de Preço");
    await user.click(input);

    await waitFor(() => {
      expect(screen.getByText("Valor atual:")).toBeInTheDocument();
      expect(screen.getByText("R$ 12,34")).toBeInTheDocument();
    });
  });

  it("deve mostrar status de validação", async () => {
    const user = userEvent.setup();

    render(
      <CurrencyInput {...defaultProps} value={12.34} min={10} max={100} />
    );

    const input = screen.getByLabelText("Teste de Preço");
    await user.click(input);

    await waitFor(() => {
      expect(screen.getByText("✓ Valor válido")).toBeInTheDocument();
    });
  });

  it("deve ser desabilitado quando disabled=true", () => {
    render(<CurrencyInput {...defaultProps} disabled />);

    const input = screen.getByLabelText("Teste de Preço");
    expect(input).toBeDisabled();
  });

  it("deve mostrar texto de ajuda", () => {
    render(
      <CurrencyInput {...defaultProps} helperText="Digite o preço do produto" />
    );

    expect(screen.getByText("Digite o preço do produto")).toBeInTheDocument();
  });

  it("deve mostrar indicador de valor mínimo/máximo", () => {
    render(<CurrencyInput {...defaultProps} min={1} max={1000} />);

    expect(
      screen.getByText("Valor entre R$ 1,00 e R$ 1.000,00")
    ).toBeInTheDocument();
  });
});
