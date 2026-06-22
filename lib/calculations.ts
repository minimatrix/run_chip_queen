import type { Game, Player, PlayerTotal, Round } from './types';

export type PotAmounts = {
  run: number;
  chip: number;
  queen: number;
};

type PotState = {
  run: number;
  chip: number;
  queen: number;
};

function sortRounds(rounds: Round[]): Round[] {
  return [...rounds].sort((a, b) => a.roundNumber - b.roundNumber);
}

function addRoundStakes(state: PotState, basePotValue: number): PotAmounts {
  state.run += basePotValue;
  state.chip += basePotValue;
  state.queen += basePotValue;
  return { run: state.run, chip: state.chip, queen: state.queen };
}

function resolveRoundWinners(state: PotState, round: Round): PotAmounts {
  const available = { run: state.run, chip: state.chip, queen: state.queen };

  if (round.runWinnerId) {
    state.run = 0;
  }
  if (round.chipWinnerId) {
    state.chip = 0;
  }
  if (round.queenWinnerId) {
    state.queen = 0;
  }

  return available;
}

export function getPotValuePence(game: Game, players: Player[]): number {
  return game.stakePerPotPence * players.length;
}

export function getRoundTotalPence(game: Game, players: Player[]): number {
  return getPotValuePence(game, players) * 3;
}

/** What one player puts in each round (stake into run + chip + queen). */
export function getPlayerRoundCostPence(game: Game): number {
  return game.stakePerPotPence * 3;
}

export function getRoundsForDisplay(
  allRounds: Round[],
  options: {
    editingRoundId?: string | null;
    upToRoundNumber?: number;
  } = {},
): Round[] {
  if (options.editingRoundId) {
    return allRounds.filter((round) => round.id !== options.editingRoundId);
  }

  if (options.upToRoundNumber !== undefined) {
    return allRounds.filter(
      (round) => round.roundNumber < options.upToRoundNumber!,
    );
  }

  return allRounds;
}

/** Pot values available to win for the current round entry (includes carryover). */
export function getCurrentPotValues(
  priorRounds: Round[],
  basePotValue: number,
  includeCurrentRoundStakes = true,
): PotAmounts {
  const state: PotState = { run: 0, chip: 0, queen: 0 };

  for (const round of sortRounds(priorRounds)) {
    addRoundStakes(state, basePotValue);
    resolveRoundWinners(state, round);
  }

  if (includeCurrentRoundStakes) {
    addRoundStakes(state, basePotValue);
  }

  return { run: state.run, chip: state.chip, queen: state.queen };
}

/** Pot values that were available when a specific round was played. */
export function getPotValuesForRound(
  allRounds: Round[],
  roundNumber: number,
  basePotValue: number,
): PotAmounts {
  const priorRounds = allRounds.filter(
    (round) => round.roundNumber < roundNumber,
  );
  return getCurrentPotValues(priorRounds, basePotValue, true);
}

/** Amount each winner actually received for a completed round. */
export function getRoundPayouts(
  allRounds: Round[],
  round: Round,
  basePotValue: number,
): PotAmounts {
  const priorRounds = allRounds.filter(
    (item) => item.roundNumber < round.roundNumber,
  );
  const state: PotState = { run: 0, chip: 0, queen: 0 };

  for (const priorRound of sortRounds(priorRounds)) {
    addRoundStakes(state, basePotValue);
    resolveRoundWinners(state, priorRound);
  }

  const available = addRoundStakes(state, basePotValue);

  return {
    run: round.runWinnerId ? available.run : 0,
    chip: round.chipWinnerId ? available.chip : 0,
    queen: round.queenWinnerId ? available.queen : 0,
  };
}

export function calculatePlayerTotals(
  game: Game,
  rounds: Round[],
  players: Player[],
): PlayerTotal[] {
  const basePotValue = getPotValuePence(game, players);
  const playerRoundCost = getPlayerRoundCostPence(game);
  const startingBalance = game.startingBalancePence ?? 600;
  const state: PotState = { run: 0, chip: 0, queen: 0 };

  const totals = Object.fromEntries(
    players.map((player) => [
      player.id,
      {
        playerId: player.id,
        name: player.name,
        color: player.color,
        run: 0,
        chip: 0,
        queen: 0,
        total: 0,
        contributed: game.stakePerPotPence * 3 * rounds.length,
        net: 0,
        remaining: startingBalance,
        canPlay: startingBalance >= playerRoundCost,
      },
    ]),
  );

  for (const round of sortRounds(rounds)) {
    addRoundStakes(state, basePotValue);

    if (round.runWinnerId && totals[round.runWinnerId]) {
      totals[round.runWinnerId].run += state.run;
      totals[round.runWinnerId].total += state.run;
      state.run = 0;
    }

    if (round.chipWinnerId && totals[round.chipWinnerId]) {
      totals[round.chipWinnerId].chip += state.chip;
      totals[round.chipWinnerId].total += state.chip;
      state.chip = 0;
    }

    if (round.queenWinnerId && totals[round.queenWinnerId]) {
      totals[round.queenWinnerId].queen += state.queen;
      totals[round.queenWinnerId].total += state.queen;
      state.queen = 0;
    }
  }

  for (const total of Object.values(totals)) {
    total.net = total.total - total.contributed;
    total.remaining = startingBalance + total.net;
    total.canPlay = total.remaining >= playerRoundCost;
  }

  return Object.values(totals).sort((a, b) => b.remaining - a.remaining);
}

export function getTotalGameValuePence(
  game: Game,
  rounds: Round[],
  players: Player[],
): number {
  return getRoundTotalPence(game, players) * rounds.length;
}

export function getPotColumnTotals(totals: PlayerTotal[]): PotAmounts {
  return totals.reduce(
    (acc, row) => ({
      run: acc.run + row.run,
      chip: acc.chip + row.chip,
      queen: acc.queen + row.queen,
    }),
    { run: 0, chip: 0, queen: 0 },
  );
}
