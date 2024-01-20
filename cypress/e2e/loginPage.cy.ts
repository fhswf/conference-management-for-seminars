describe('LoginPage Test', () => {
  it('Should display the login page, login click should send GET request to backend', () => {
    cy.intercept('GET', `${Cypress.env('VITE_BACKEND_URL')}/login`, {
      statusCode: 200,
      body: 'Hello World',
    }).as('loginPage');

    cy.visit('http://192.168.0.206:5173/conference/login');

    cy.contains('Login').should('exist');
    cy.get('button').should('exist')
        .click();

    cy.wait('@loginPage').should("exist");
  });
});
