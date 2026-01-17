describe('Shopping Cart', () => {
  beforeEach(() => {
    cy.visit('/products');
  });

  it('should add product to cart', () => {
    cy.get('[data-testid="product-card"]').first().click();
    cy.get('[data-testid="add-to-cart"]').click();
    cy.get('[data-testid="cart-count"]').should('contain', '1');
  });

  it('should view cart items', () => {
    cy.get('[data-testid="cart-icon"]').click();
    cy.url().should('include', '/cart');
    cy.get('[data-testid="cart-item"]').should('have.length.greaterThan', 0);
  });

  it('should update item quantity', () => {
    cy.visit('/cart');
    cy.get('[data-testid="quantity-increase"]').first().click();
    cy.get('[data-testid="item-quantity"]').first().should('contain', '2');
  });

  it('should remove item from cart', () => {
    cy.visit('/cart');
    cy.get('[data-testid="remove-item"]').first().click();
    cy.get('[data-testid="cart-item"]').should('have.length', 0);
  });

  it('should proceed to checkout', () => {
    cy.visit('/cart');
    cy.get('[data-testid="checkout-button"]').click();
    cy.url().should('include', '/checkout');
  });
});
