describe('Sistema de Temas de Loja', () => {
  beforeEach(() => {
    cy.visit('/teste-tema');
  });

  it('deve carregar a página de demonstração de temas', () => {
    cy.get('[data-testid="theme-demo"]').should('be.visible');
    cy.contains('Demonstração de Temas de Loja').should('be.visible');
  });

  it('deve exibir cards de diferentes temas de loja', () => {
    cy.get('[data-theme="loja-azul"]').should('be.visible');
    cy.get('[data-theme="loja-verde"]').should('be.visible');
    cy.get('[data-theme="loja-roxo"]').should('be.visible');
    cy.get('[data-theme="loja-escura"]').should('be.visible');
  });

  it('deve abrir modal de login com tema da loja azul', () => {
    cy.get('[data-theme="loja-azul"]').click();
    
    // Verificar se o modal abriu
    cy.get('.store-themed-modal').should('be.visible');
    
    // Verificar se tem as classes de tema
    cy.get('.store-themed-modal').should('have.class', 'store-themed-modal');
    
    // Verificar se os elementos têm as classes corretas
    cy.get('.icon').should('exist');
    cy.get('.button-primary').should('exist');
    cy.get('.button-outline').should('exist');
    
    // Fechar o modal
    cy.get('.button-outline').click();
    cy.get('.store-themed-modal').should('not.exist');
  });

  it('deve aplicar estilos CSS dinâmicos', () => {
    // Verificar se os estilos foram injetados
    cy.get('head').should('contain', 'store-theme-styles');
    cy.get('#store-theme-styles').should('exist');
  });

  it('deve funcionar em diferentes resoluções', () => {
    // Teste em mobile
    cy.viewport(375, 667);
    cy.get('[data-theme="loja-verde"]').click();
    cy.get('.store-themed-modal').should('be.visible');
    cy.get('.button-outline').click();
    
    // Teste em tablet
    cy.viewport(768, 1024);
    cy.get('[data-theme="loja-roxo"]').click();
    cy.get('.store-themed-modal').should('be.visible');
    cy.get('.button-outline').click();
    
    // Teste em desktop
    cy.viewport(1280, 720);
    cy.get('[data-theme="loja-escura"]').click();
    cy.get('.store-themed-modal').should('be.visible');
    cy.get('.button-outline').click();
  });

  it('deve validar formulário de login', () => {
    cy.get('[data-theme="loja-azul"]').click();
    
    // Tentar enviar sem telefone
    cy.get('.button-primary').click();
    
    // Verificar se o campo é obrigatório
    cy.get('input[type="tel"]').should('have.attr', 'required');
    
    // Preencher telefone inválido
    cy.get('input[type="tel"]').type('123');
    cy.get('.button-primary').should('be.disabled');
    
    // Preencher telefone válido
    cy.get('input[type="tel"]').clear().type('11999999999');
    cy.get('.button-primary').should('not.be.disabled');
    
    // Preencher nome opcional
    cy.get('input[type="text"]').type('João Silva');
    
    // Fechar modal
    cy.get('.button-outline').click();
  });

  it('deve exibir links de termos e privacidade', () => {
    cy.get('[data-theme="loja-verde"]').click();
    
    cy.contains('Termos de Uso').should('be.visible');
    cy.contains('Política de Privacidade').should('be.visible');
    
    cy.get('.consent-link').should('have.length', 2);
    
    cy.get('.button-outline').click();
  });
});