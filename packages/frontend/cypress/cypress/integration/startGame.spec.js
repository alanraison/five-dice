describe('the home page', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });
  it('should let the user create a game', () => {
    cy.intercept(
      {
        method: 'POST',
        url: '/game?_data=routes%2Fgame%2Findex&index=',
      },
      {
        gameId: 'aabbccdd',
      }
    );
    cy.get('button').contains('Start Game').click();
  });
  it('should let you join an existing game', () => {
    cy.get('input[name=gameId]').type('abcde');
    cy.get('button').contains('Join Game');
  });
});
