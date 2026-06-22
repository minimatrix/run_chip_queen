import { describe, expect, it } from 'vitest';
import {
  calculatePlayerTotals,
  calculatePlayerTotalsForRoundEntry,
} from './calculations';
import type { Game, Player, Round } from './types';

const game: Game = {
  id: 'game-1',
  name: 'Test Table',
  stakePerPotPence: 100,
  startingBalancePence: 400,
  status: 'active',
  createdAt: '2024-01-01T00:00:00.000Z',
};

const alice: Player = { id: 'p1', name: 'Alice', color: '#E53935' };
const bob: Player = { id: 'p2', name: 'Bob', color: '#1E88E5' };

function makeRound(
  roundNumber: number,
  overrides: Partial<Round> = {},
): Round {
  return {
    id: `round-${roundNumber}`,
    gameId: game.id,
    roundNumber,
    createdAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('calculatePlayerTotalsForRoundEntry', () => {
  it('keeps a player in the current round after buy-in even if they cannot afford the next round', () => {
    const totals = calculatePlayerTotalsForRoundEntry(game, [], [alice]);

    expect(totals[0]).toMatchObject({
      playerId: alice.id,
      remaining: 100,
      canPlay: false,
      inCurrentRound: true,
    });
  });

  it('matches the £4 start, £3 round cost, £1 left example from the bug report', () => {
    const round1 = makeRound(1);
    const totals = calculatePlayerTotalsForRoundEntry(game, [round1], [alice]);

    expect(totals[0]).toMatchObject({
      remaining: 100,
      canPlay: false,
      inCurrentRound: false,
    });
  });

  it('still allows a player who ends round 1 with exactly the next buy-in to play round 2', () => {
    const round1 = makeRound(1);
    const totals = calculatePlayerTotalsForRoundEntry(game, [round1], [alice]);

    expect(totals[0].inCurrentRound).toBe(false);

    const exactBuyInGame: Game = {
      ...game,
      startingBalancePence: 600,
    };
    const round1Totals = calculatePlayerTotals(exactBuyInGame, [round1], [alice]);
    expect(round1Totals[0].remaining).toBe(300);

    const round2Totals = calculatePlayerTotalsForRoundEntry(
      exactBuyInGame,
      [round1],
      [alice],
    );
    expect(round2Totals[0]).toMatchObject({
      remaining: 0,
      canPlay: false,
      inCurrentRound: true,
    });
  });

  it('excludes every player who cannot afford to buy into the round being entered', () => {
    const round1 = makeRound(1);
    const totals = calculatePlayerTotalsForRoundEntry(
      game,
      [round1],
      [alice, bob],
    );

    expect(totals.every((row) => row.inCurrentRound === false)).toBe(true);
  });
});

describe('calculatePlayerTotals', () => {
  it('marks players out only when they cannot afford the next round after completed rounds', () => {
    const round1 = makeRound(1);
    const totals = calculatePlayerTotals(game, [round1], [alice]);

    expect(totals[0]).toMatchObject({
      remaining: 100,
      canPlay: false,
    });
    expect(totals[0].inCurrentRound).toBeUndefined();
  });
});
