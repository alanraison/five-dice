import { handler } from '.';

describe('challenge validator', () => {
  it('should return success if the bid is too high', async () => {
    const result = handler({
      bid: {
        q: 4,
        v: 4,
      },
      dice: {
        player1: [2, 2, 2, 2],
        player2: [1, 2, 3, 4],
      },
    });
    await expect(result).resolves.toMatchObject({
      success: true,
    });
  });
  it('should return no success if the bid is lower than the dice count', async () => {
    const result = handler({
      bid: {
        q: 3,
        v: 4,
      },
      dice: {
        player1: [1, 2, 4, 4],
        player2: [4, 4, 5, 6],
      },
    });
    await expect(result).resolves.toMatchObject({
      success: false,
    });
  });
  it('should return no success if the bid is equal to the dice count', async () => {
    const result = handler({
      bid: {
        q: 4,
        v: 4,
      },
      dice: {
        player1: [1, 2, 4, 4],
        player2: [4, 4, 5, 6],
      },
    });
    await expect(result).resolves.toMatchObject({
      success: false,
    });
  });
  it('should take account of aces when calculating the success of a bid', async () => {
    const result = handler({
      bid: {
        q: 4,
        v: 4,
      },
      dice: {
        player1: [2, 4, 7],
        player2: [2, 4, 7],
      },
    });
    await expect(result).resolves.toMatchObject({
      success: false,
    });
  });
  it('should return the number of matching dice each player holds', async () => {
    const result = handler({
      bid: {
        q: 4,
        v: 4,
      },
      dice: {
        player1: [2, 2, 2, 2, 7],
        player2: [1, 2, 3, 4],
      },
    });
    await expect(result).resolves.toMatchObject({
      counts: {
        player1: [7],
        player2: [4],
      },
    });
  });
});
