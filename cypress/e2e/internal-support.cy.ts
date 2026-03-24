describe('Internal support console smoke', () => {
  const password = Cypress.env('INTERNAL_DASHBOARD_PASSWORD');
  const salesEmail = Cypress.env('SALES_EMAIL');
  const operationsEmail = Cypress.env('OPERATIONS_EMAIL');
  const managerEmail = Cypress.env('MANAGER_EMAIL');

  const requireCredentials = (email?: string) => {
    if (!email || !password) {
      cy.log(
        'Skipping smoke test because INTERNAL_DASHBOARD_PASSWORD or role email is not configured.',
      );
      return false;
    }

    return true;
  };

  it('sales sees live after-sales workspace and owns prescription clarification', function () {
    if (!requireCredentials(salesEmail)) {
      this.skip();
    }

    cy.login(String(salesEmail), String(password));
    cy.visit('/sale/cases/returns');
    cy.contains('After-sales support').should('exist');
    cy.contains('Return').should('exist');
    cy.contains('Warranty').should('exist');

    cy.visit('/operation/orders/prescription-needed');
    cy.url().should('include', '/sale/orders/prescription-needed');
    cy.contains('Prescription clarification').should('exist');
  });

  it('operations uses warranty service queue and sees blocker on old prescription URL', function () {
    if (!requireCredentials(operationsEmail)) {
      this.skip();
    }

    cy.login(String(operationsEmail), String(password));
    cy.visit('/operation/cases/warranties');
    cy.contains('Warranty service queue').should('exist');

    cy.visit('/operation/orders/prescription-needed');
    cy.contains('This clarification queue is owned by sales/support').should('exist');
  });

  it('manager sees cross-store support overview', function () {
    if (!requireCredentials(managerEmail)) {
      this.skip();
    }

    cy.login(String(managerEmail), String(password));
    cy.visit('/manager/cases/support');
    cy.contains('Business support overview').should('exist');
    cy.contains('Prescription').should('exist');
  });
});
