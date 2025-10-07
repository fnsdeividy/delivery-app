describe("Loading Navigation", () => {
  beforeEach(() => {
    // Mock de autenticação
    cy.intercept("GET", "/api/auth/session", {
      statusCode: 200,
      body: {
        user: {
          id: "1",
          name: "Test User",
          email: "test@example.com",
          role: "ADMIN",
        },
      },
    });

    // Mock de dados da loja
    cy.intercept("GET", "/api/v1/stores/test-store", {
      statusCode: 200,
      body: {
        data: {
          id: "1",
          name: "Test Store",
          slug: "test-store",
          branding: {
            logo: null,
          },
        },
      },
    });

    // Mock de navegação
    cy.intercept("GET", "/dashboard/test-store/produtos", {
      statusCode: 200,
      body: "<div>Produtos Page</div>",
    });

    cy.intercept("GET", "/dashboard/test-store/pedidos", {
      statusCode: 200,
      body: "<div>Pedidos Page</div>",
    });

    cy.intercept("GET", "/dashboard/test-store/analytics", {
      statusCode: 200,
      body: "<div>Analytics Page</div>",
    });

    cy.intercept("GET", "/dashboard/test-store/configuracoes", {
      statusCode: 200,
      body: "<div>Configurações Page</div>",
    });
  });

  it("deve exibir loading ao navegar entre telas do menu lateral", () => {
    // Visitar página do dashboard
    cy.visit("/dashboard/test-store");

    // Aguardar carregamento inicial
    cy.get('[data-testid="loading-status"]', { timeout: 10000 }).should(
      "not.exist"
    );

    // Clicar em "Produtos" e verificar loading
    cy.get("button").contains("Produtos").click();

    // Verificar se a barra de loading aparece
    cy.get(".fixed.top-0.left-0.right-0.z-50", { timeout: 1000 }).should(
      "be.visible"
    );

    // Verificar se o botão fica desabilitado
    cy.get("button").contains("Produtos").should("be.disabled");

    // Aguardar carregamento completo
    cy.get(".fixed.top-0.left-0.right-0.z-50", { timeout: 5000 }).should(
      "not.exist"
    );
    cy.get("button").contains("Produtos").should("not.be.disabled");
  });

  it("deve bloquear cliques múltiplos durante loading", () => {
    cy.visit("/dashboard/test-store");
    cy.get('[data-testid="loading-status"]', { timeout: 10000 }).should(
      "not.exist"
    );

    // Clicar em "Pedidos"
    cy.get("button").contains("Pedidos").click();

    // Verificar se está carregando
    cy.get(".fixed.top-0.left-0.right-0.z-50").should("be.visible");

    // Tentar clicar em outro item do menu (deve ser ignorado)
    cy.get("button").contains("Analytics").click();

    // Verificar se ainda está carregando para Pedidos
    cy.get(".fixed.top-0.left-0.right-0.z-50").should("be.visible");

    // Aguardar conclusão
    cy.get(".fixed.top-0.left-0.right-0.z-50", { timeout: 5000 }).should(
      "not.exist"
    );
  });

  it("deve exibir loading por tempo mínimo", () => {
    cy.visit("/dashboard/test-store");
    cy.get('[data-testid="loading-status"]', { timeout: 10000 }).should(
      "not.exist"
    );

    const startTime = Date.now();

    cy.get("button").contains("Configurações").click();

    // Verificar se loading aparece
    cy.get(".fixed.top-0.left-0.right-0.z-50").should("be.visible");

    // Aguardar conclusão
    cy.get(".fixed.top-0.left-0.right-0.z-50", { timeout: 5000 }).should(
      "not.exist"
    );

    // Verificar se passou tempo mínimo (aproximadamente 300ms)
    cy.then(() => {
      const elapsed = Date.now() - startTime;
      expect(elapsed).to.be.greaterThan(250); // Margem de erro
    });
  });

  it("deve funcionar com submenu de configurações", () => {
    cy.visit("/dashboard/test-store");
    cy.get('[data-testid="loading-status"]', { timeout: 10000 }).should(
      "not.exist"
    );

    // Clicar em Configurações para abrir submenu
    cy.get("button").contains("Configurações").click();

    // Aguardar submenu aparecer
    cy.get("button").contains("Visual").should("be.visible");

    // Clicar em item do submenu
    cy.get("button").contains("Visual").click();

    // Verificar loading
    cy.get(".fixed.top-0.left-0.right-0.z-50").should("be.visible");

    // Aguardar conclusão
    cy.get(".fixed.top-0.left-0.right-0.z-50", { timeout: 5000 }).should(
      "not.exist"
    );
  });

  it("deve ter acessibilidade adequada", () => {
    cy.visit("/dashboard/test-store");
    cy.get('[data-testid="loading-status"]', { timeout: 10000 }).should(
      "not.exist"
    );

    // Verificar se o conteúdo principal tem aria-busy
    cy.get("main .dashboard-container").should(
      "have.attr",
      "aria-busy",
      "false"
    );

    // Clicar em item do menu
    cy.get("button").contains("Produtos").click();

    // Verificar se aria-busy muda para true
    cy.get("main .dashboard-container").should(
      "have.attr",
      "aria-busy",
      "true"
    );

    // Aguardar conclusão
    cy.get(".fixed.top-0.left-0.right-0.z-50", { timeout: 5000 }).should(
      "not.exist"
    );

    // Verificar se aria-busy volta para false
    cy.get("main .dashboard-container").should(
      "have.attr",
      "aria-busy",
      "false"
    );
  });

  it("deve aplicar timeout em caso de erro", () => {
    // Mock de erro na navegação
    cy.intercept("GET", "/dashboard/test-store/erro", {
      statusCode: 500,
      body: { error: "Internal Server Error" },
    });

    cy.visit("/dashboard/test-store");
    cy.get('[data-testid="loading-status"]', { timeout: 10000 }).should(
      "not.exist"
    );

    // Clicar em item que causará erro
    cy.get("button").contains("Produtos").click();

    // Verificar se loading aparece
    cy.get(".fixed.top-0.left-0.right-0.z-50").should("be.visible");

    // Aguardar timeout (10 segundos)
    cy.get(".fixed.top-0.left-0.right-0.z-50", { timeout: 11000 }).should(
      "not.exist"
    );
  });
});
