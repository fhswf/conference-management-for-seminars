describe('LoginPage Test', () => {
  it('Should display the login page and handle the button click', () => {
    cy.visit('http://192.168.0.206:5173/conference/login');

    cy.contains('Login').should('exist');
    cy.get('button').should('exist');

    cy.window().then((win) => {
      cy.stub(win, 'open').as('windowOpen');
    });

    cy.get('button').click();

    cy.get('@windowOpen').should('be.calledWith', 'http://google.com');
  });
});
