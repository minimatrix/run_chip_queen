import { describe, expect, it } from 'vitest';
import {
  calculatePlayerTotals,
  calculatePlayerTotalsForRoundEntry,
  getPlayersNeedingBuyInPrompt,
} from './calculations';
import type { Game, Player, PlayerBuyIn, Round } from './types';

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

function makeBuyIn(
  playerId: string,
  roundNumber: number,
  amountPence: number,
): PlayerBuyIn {
  return {
    id: `buyin-${playerId}-${roundNumber}`,
    gameId: game.id,
    playerId,
    roundNumber,
    amountPence,
    createdAt: '2024-01-01T00:00:00.000Z',
  };
}

describe('calculatePlayerTotalsForRoundEntry', () => {
  it('records starting funds as the game starting balance', () => {
    const totals = calculatePlayerTotalsForRoundEntry(game, [], [alice], 1);

    expect(totals[0]).toMatchObject({
      startingFunds: 400,
      remaining: 100,
    });
  });

  it('keeps game starting balance on later rounds', () => {
    const round1 = makeRound(1);
    const totals = calculatePlayerTotalsForRoundEntry(
      game,
      [round1],
      [alice],
      2,
    );

    expect(totals[0]).toMatchObject({
      startingFunds: 400,
      remaining: 100,
      inCurrentRound: false,
    });
  });

  it('keeps a player in the current round after buy-in even if they cannot afford the next round', () => {
    const totals = calculatePlayerTotalsForRoundEntry(game, [], [alice], 1);

    expect(totals[0]).toMatchObject({
      playerId: alice.id,
      remaining: 100,
      canPlay: false,
      inCurrentRound: true,
    });
  });

  it('matches the £4 start, £3 round cost, £1 left example from the bug report', () => {
    const round1 = makeRound(1);
    const totals = calculatePlayerTotalsForRoundEntry(
      game,
      [round1],
      [alice],
      2,
    );

    expect(totals[0]).toMatchObject({
      remaining: 100,
      canPlay: false,
      inCurrentRound: false,
    });
  });

  it('still allows a player who ends round 1 with exactly the next buy-in to play round 2', () => {
    const round1 = makeRound(1);
    const totals = calculatePlayerTotalsForRoundEntry(
      game,
      [round1],
      [alice],
      2,
    );

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
      2,
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
      2,
    );

    expect(totals.every((row) => row.inCurrentRound === false)).toBe(true);
  });

  it('lets a player rejoin after a mid-game buy-in', () => {
    const round1 = makeRound(1);
    const buyIns = [makeBuyIn(alice.id, 2, 300)];
    const totals = calculatePlayerTotalsForRoundEntry(
      game,
      [round1],
      [alice],
      2,
      buyIns,
    );

    expect(totals[0]).toMatchObject({
      remaining: 100,
      inCurrentRound: true,
      buyInTotal: 300,
    });
  });
});

describe('getPlayersNeedingBuyInPrompt', () => {
  it('prompts only on the first out round until a buy-in', () => {
    const round1 = makeRound(1);

    const round2Prompt = getPlayersNeedingBuyInPrompt(
      game,
      [round1],
      [alice],
      [],
      2,
      {},
    );
    expect(round2Prompt.map((player) => player.id)).toEqual([alice.id]);

    const round3NoPrompt = getPlayersNeedingBuyInPrompt(
      game,
      [round1, makeRound(2)],
      [alice],
      [],
      3,
      { [alice.id]: 2 },
    );
    expect(round3NoPrompt).toHaveLength(0);
  });

  it('prompts again after a later out streak', () => {
    const rounds = [makeRound(1), makeRound(2)];
    const buyIns = [makeBuyIn(alice.id, 3, 300)];

    const round4Prompt = getPlayersNeedingBuyInPrompt(
      game,
      [...rounds, makeRound(3)],
      [alice],
      buyIns,
      4,
      {},
    );

    expect(round4Prompt.map((player) => player.id)).toEqual([alice.id]);
  });

  it('does not re-prompt after a buy-in for the current round', () => {
    const round1 = makeRound(1);
    const buyIns = [makeBuyIn(alice.id, 2, 200)];

    const prompt = getPlayersNeedingBuyInPrompt(
      game,
      [round1],
      [alice],
      buyIns,
      2,
      {},
    );

    expect(prompt).toHaveLength(0);
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
