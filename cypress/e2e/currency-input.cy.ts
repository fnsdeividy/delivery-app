describe("Currency Input E2E Tests", () => {
  beforeEach(() => {
    // Visitar página de exemplo ou formulário de produto
    cy.visit("/teste-tema"); // Ajustar conforme necessário
  });

  it("deve formatar entrada de números corretamente", () => {
    cy.get('[data-testid="currency-input"]').first().as("input");

    // Digitar "250" deve resultar em "R$ 2,50"
    cy.get("@input").type("250");
    cy.get("@input").should("have.value", "2,50");

    // Limpar e testar "2,50"
    cy.get("@input").clear();
    cy.get("@input").type("2,50");
    cy.get("@input").should("have.value", "2,50");

    // Limpar e testar "2.50"
    cy.get("@input").clear();
    cy.get("@input").type("2.50");
    cy.get("@input").should("have.value", "2,50");
  });

  it("deve aceitar colagem de valores formatados", () => {
    cy.get('[data-testid="currency-input"]').first().as("input");

    // Colar "R$ 2,50"
    cy.get("@input")
      .invoke("val", "")
      .trigger("paste", {
        clipboardData: {
          getData: () => "R$ 2,50",
        },
      });
    cy.get("@input").should("have.value", "2,50");

    // Colar "2.50"
    cy.get("@input")
      .invoke("val", "")
      .trigger("paste", {
        clipboardData: {
          getData: () => "2.50",
        },
      });
    cy.get("@input").should("have.value", "2,50");
  });

  it("deve validar valores mínimos e máximos", () => {
    cy.get('[data-testid="currency-input"]').first().as("input");

    // Testar valor muito baixo (se min > 0)
    cy.get("@input").type("0");
    cy.get("@input").blur();
    // Verificar se erro aparece (depende da configuração)

    // Testar valor muito alto
    cy.get("@input").clear();
    cy.get("@input").type("99999999");
    cy.get("@input").blur();
    // Verificar se erro aparece (depende da configuração)
  });

  it("deve permitir campo vazio quando allowEmpty é true", () => {
    cy.get('[data-testid="currency-input-optional"]').as("input");

    cy.get("@input").clear();
    cy.get("@input").should("have.value", "");

    // Deve aceitar entrada vazia
    cy.get("@input").blur();
    cy.get("@input").should("not.have.class", "border-red-300");
  });

  it("deve bloquear caracteres não numéricos", () => {
    cy.get('[data-testid="currency-input"]').first().as("input");

    // Tentar digitar letras
    cy.get("@input").type("abc");
    cy.get("@input").should("have.value", "");

    // Tentar digitar símbolos
    cy.get("@input").type("!@#");
    cy.get("@input").should("have.value", "");

    // Números devem funcionar
    cy.get("@input").type("123");
    cy.get("@input").should("have.value", "1,23");
  });

  it("deve manter cursor estável durante digitação", () => {
    cy.get('[data-testid="currency-input"]').first().as("input");

    // Digitar "2"
    cy.get("@input").type("2");
    cy.get("@input").should("have.value", "0,02");

    // Digitar "5" (deve virar "0,25")
    cy.get("@input").type("5");
    cy.get("@input").should("have.value", "0,25");
  });

  it("deve exibir prefixo R$", () => {
    cy.get('[data-testid="currency-input"]').first().as("input");

    // Verificar se o prefixo R$ está visível
    cy.get("@input").parent().should("contain", "R$");
  });

  it("deve ter acessibilidade correta", () => {
    cy.get('[data-testid="currency-input"]').first().as("input");

    // Verificar atributos de acessibilidade
    cy.get("@input").should("have.attr", "aria-invalid");
    cy.get("@input").should("have.attr", "aria-describedby");

    // Verificar se label está associado
    cy.get("@input").should("have.attr", "id");
    cy.get(`label[for="${cy.get("@input").invoke("attr", "id")}"]`).should(
      "exist"
    );
  });

  it("deve funcionar em formulário de produto completo", () => {
    // Testar fluxo completo de criação de produto
    cy.get('[data-testid="product-name"]').type("Produto Teste");
    cy.get('[data-testid="product-category"]').select("1");

    // Testar preço do produto
    cy.get('[data-testid="product-price"]').type("1500");
    cy.get('[data-testid="product-price"]').should("have.value", "15,00");

    // Testar preço original
    cy.get('[data-testid="product-original-price"]').type("2000");
    cy.get('[data-testid="product-original-price"]').should(
      "have.value",
      "20,00"
    );

    // Testar adicional
    cy.get('[data-testid="addon-name"]').type("Bacon");
    cy.get('[data-testid="addon-price"]').type("500");
    cy.get('[data-testid="addon-price"]').should("have.value", "5,00");

    // Verificar se valores são enviados corretamente
    cy.get('[data-testid="submit-button"]').click();

    // Verificar se API recebeu valores em centavos
    cy.intercept("POST", "/api/products", (req) => {
      expect(req.body.price).to.equal(1500);
      expect(req.body.originalPrice).to.equal(2000);
      expect(req.body.addons[0].price).to.equal(500);
    });
  });
});
