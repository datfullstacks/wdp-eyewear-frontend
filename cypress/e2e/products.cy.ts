describe('Product Browsing', () => {
  beforeEach(() => {
    cy.visit('/products');
  });

  it('should display product list', () => {
    cy.get('[data-testid="product-card"]').should('have.length.greaterThan', 0);
  });

  it('should filter products by category', () => {
    cy.get('[data-testid="category-filter"]').select('Sunglasses');
    cy.url().should('include', 'category=sunglasses');
  });

  it('should search for products', () => {
    cy.get('[data-testid="search-input"]').type('aviator');
    cy.get('[data-testid="search-button"]').click();
    cy.get('[data-testid="product-card"]').should('contain', 'Aviator');
  });

  it('should view product details', () => {
    cy.get('[data-testid="product-card"]').first().click();
    cy.url().should('include', '/products/');
    cy.get('[data-testid="product-name"]').should('exist');
    cy.get('[data-testid="product-price"]').should('exist');
    cy.get('[data-testid="add-to-cart"]').should('exist');
  });
});
