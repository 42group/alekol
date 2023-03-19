describe('page /', () => {
  beforeEach(() => cy.visit('/'));

  it('should display two buttons to log in', () => {
    cy.get('button').contains('Login with Discord');
    cy.get('button').contains('Login with 42');
  });
});
