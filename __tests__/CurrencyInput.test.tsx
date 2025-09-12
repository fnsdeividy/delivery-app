import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("CurrencyInput", () => {
  const defaultProps = {
    value: 0,
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve renderizar com valor inicial", () => {
    render(<CurrencyInput {...defaultProps} value={250} />);

    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("2,50");
  });

  it("deve exibir prefixo R$", () => {
    render(<CurrencyInput {...defaultProps} />);

    expect(screen.getByText("R$")).toBeInTheDocument();
  });

  it("deve aceitar entrada de números e formatar automaticamente", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<CurrencyInput {...defaultProps} onChange={onChange} />);

    const input = screen.getByRole("textbox");
    await user.type(input, "250");

    expect(input).toHaveValue("2,50");
    expect(onChange).toHaveBeenCalledWith(250);
  });

  it("deve aceitar entrada com vírgula", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<CurrencyInput {...defaultProps} onChange={onChange} />);

    const input = screen.getByRole("textbox");
    await user.type(input, "2,50");

    expect(input).toHaveValue("2,50");
    expect(onChange).toHaveBeenCalledWith(250);
  });

  it("deve aceitar entrada com ponto", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<CurrencyInput {...defaultProps} onChange={onChange} />);

    const input = screen.getByRole("textbox");
    await user.type(input, "2.50");

    expect(input).toHaveValue("2,50");
    expect(onChange).toHaveBeenCalledWith(250);
  });

  it("deve aceitar colagem de valores formatados", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<CurrencyInput {...defaultProps} onChange={onChange} />);

    const input = screen.getByRole("textbox");

    // Simular colagem
    fireEvent.paste(input, {
      clipboardData: {
        getData: () => "R$ 2,50",
      },
    });

    await waitFor(() => {
      expect(input).toHaveValue("2,50");
      expect(onChange).toHaveBeenCalledWith(250);
    });
  });

  it("deve permitir campo vazio quando allowEmpty é true", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <CurrencyInput {...defaultProps} onChange={onChange} allowEmpty={true} />
    );

    const input = screen.getByRole("textbox");
    await user.clear(input);

    expect(input).toHaveValue("");
    expect(onChange).toHaveBeenCalledWith(0);
  });

  it("deve mostrar valor mínimo quando allowEmpty é false", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <CurrencyInput {...defaultProps} onChange={onChange} allowEmpty={false} />
    );

    const input = screen.getByRole("textbox");
    await user.clear(input);

    expect(input).toHaveValue("0,00");
  });

  it("deve validar valor mínimo", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<CurrencyInput {...defaultProps} onChange={onChange} min={100} />);

    const input = screen.getByRole("textbox");
    await user.type(input, "50");

    expect(screen.getByText("Valor mínimo é R$ 1,00")).toBeInTheDocument();
  });

  it("deve validar valor máximo", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<CurrencyInput {...defaultProps} onChange={onChange} max={1000} />);

    const input = screen.getByRole("textbox");
    await user.type(input, "2000");

    expect(screen.getByText("Valor máximo é R$ 10,00")).toBeInTheDocument();
  });

  it("deve exibir label quando fornecido", () => {
    render(<CurrencyInput {...defaultProps} label="Preço" />);

    expect(screen.getByText("Preço")).toBeInTheDocument();
  });

  it("deve exibir asterisco quando required é true", () => {
    render(<CurrencyInput {...defaultProps} label="Preço" required />);

    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("deve exibir erro personalizado", () => {
    render(<CurrencyInput {...defaultProps} error="Erro personalizado" />);

    expect(screen.getByText("Erro personalizado")).toBeInTheDocument();
  });

  it("deve ser desabilitado quando disabled é true", () => {
    render(<CurrencyInput {...defaultProps} disabled />);

    const input = screen.getByRole("textbox");
    expect(input).toBeDisabled();
  });

  it("deve chamar onBlur quando perde o foco", async () => {
    const user = userEvent.setup();
    const onBlur = jest.fn();

    render(<CurrencyInput {...defaultProps} onBlur={onBlur} />);

    const input = screen.getByRole("textbox");
    await user.click(input);
    await user.tab();

    expect(onBlur).toHaveBeenCalledWith(0);
  });

  it("deve ter acessibilidade correta", () => {
    render(
      <CurrencyInput
        {...defaultProps}
        id="test-input"
        name="test"
        label="Preço"
        aria-describedby="help-text"
      />
    );

    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("id", "test-input");
    expect(input).toHaveAttribute("name", "test");
    expect(input).toHaveAttribute("aria-describedby", "help-text");
  });

  it("deve bloquear caracteres não numéricos", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<CurrencyInput {...defaultProps} onChange={onChange} />);

    const input = screen.getByRole("textbox");

    // Tentar digitar letras
    await user.type(input, "abc");
    expect(input).toHaveValue("");

    // Tentar digitar símbolos
    await user.type(input, "!@#");
    expect(input).toHaveValue("");

    // Números devem funcionar
    await user.type(input, "123");
    expect(input).toHaveValue("1,23");
  });

  it("deve manter cursor estável durante digitação", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<CurrencyInput {...defaultProps} onChange={onChange} />);

    const input = screen.getByRole("textbox");

    // Digitar "2"
    await user.type(input, "2");
    expect(input).toHaveValue("0,02");

    // Digitar "5" (deve virar "0,25")
    await user.type(input, "5");
    expect(input).toHaveValue("0,25");
  });
});
