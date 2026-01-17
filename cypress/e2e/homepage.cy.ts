describe('Homepage', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display the homepage', () => {
    cy.get('h1').should('exist');
  });

  it('should navigate to products page', () => {
    cy.contains('Products').click();
    cy.url().should('include', '/products');
  });
});
