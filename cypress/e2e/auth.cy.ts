describe('Authentication', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should display login form', () => {
    cy.get('input[type="email"]').should('exist');
    cy.get('input[type="password"]').should('exist');
    cy.get('button[type="submit"]').should('exist');
  });

  it('should show validation errors for empty form', () => {
    cy.get('button[type="submit"]').click();
    cy.contains('Invalid email address').should('exist');
    cy.contains('Password must be at least 6 characters').should('exist');
  });

  it('should login successfully with valid credentials', () => {
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();

    // Should redirect to dashboard after successful login
    cy.url().should('include', '/dashboard');
  });

  it('should navigate to register page', () => {
    cy.contains('Register').click();
    cy.url().should('include', '/register');
  });
});
