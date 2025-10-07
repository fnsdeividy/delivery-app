import { render, screen } from "@testing-library/react";
import { Header } from "../components/Header";

// Mock do Next.js Link
jest.mock("next/link", () => {
  return function MockLink({ children, href, ...props }: any) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

// Mock do componente Logo
jest.mock("../components/Logo", () => ({
  Logo: ({ size, ...props }: any) => (
    <div data-size={size} data-testid="logo" {...props}>
      Cardap.IO
    </div>
  ),
}));

// Mock do componente MobileMenu
jest.mock("../components/MobileMenu", () => ({
  MobileMenu: () => (
    <div data-testid="mobile-menu">
      <button data-testid="mobile-menu-toggle">Toggle Menu</button>
    </div>
  ),
}));

describe("Header", () => {
  it("deve renderizar o logo", () => {
    render(<Header />);
    expect(screen.getByTestId("logo")).toBeInTheDocument();
    expect(screen.getByText("Cardap.IO")).toBeInTheDocument();
  });

  it("deve renderizar os botões de ação no desktop", () => {
    render(<Header />);

    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.getByText("Cadastrar")).toBeInTheDocument();
  });

  it("deve renderizar o componente MobileMenu", () => {
    render(<Header />);
    expect(screen.getByTestId("mobile-menu")).toBeInTheDocument();
  });

  it("deve ter estrutura de header fixo", () => {
    render(<Header />);

    const header = screen.getByRole("banner");
    expect(header).toHaveClass("fixed", "top-0", "left-0", "right-0", "z-40");
  });

  it("deve ter spacer para compensar o header fixo", () => {
    render(<Header />);
    expect(screen.getByTestId("header-spacer")).toBeInTheDocument();
  });

  it("deve ter z-index alto para ficar sobre outros elementos", () => {
    render(<Header />);
    const header = screen.getByRole("banner");
    expect(header).toHaveClass("z-40");
  });

  it("deve ter links com hrefs corretos", () => {
    render(<Header />);

    const loginLink = screen.getByText("Login");
    const registerLink = screen.getByText("Cadastrar");

    expect(loginLink.closest("a")).toHaveAttribute("href", "/login");
    expect(registerLink.closest("a")).toHaveAttribute("href", "/register");
  });

  it("deve ter classes responsivas corretas", () => {
    render(<Header />);

    // Botões de ação devem ser hidden em lg
    const actionButtons = screen.getByText("Login").closest("div");
    expect(actionButtons).toHaveClass("hidden", "lg:flex");

    // Menu mobile deve estar sempre visível
    const mobileMenu = screen.getByTestId("mobile-menu");
    expect(mobileMenu).toBeInTheDocument();
  });
});
