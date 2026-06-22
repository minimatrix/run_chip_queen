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

type PlayerSimState = {
  balance: number;
  run: number;
  chip: number;
  queen: number;
  contributed: number;
};

export type RoundSnapshot = {
  roundNumber: number;
  activePlayerIds: string[];
  basePotValue: number;
  potValues: PotAmounts;
  payouts: PotAmounts;
};

type SimulationResult = {
  players: Map<string, PlayerSimState>;
  rounds: RoundSnapshot[];
  currentPotValues: PotAmounts;
  activePlayerIds: string[];
};

function sortRounds(rounds: Round[]): Round[] {
  return [...rounds].sort((a, b) => a.roundNumber - b.roundNumber);
}

function getActivePlayerIds(
  players: Player[],
  playerStates: Map<string, PlayerSimState>,
  playerRoundCost: number,
): string[] {
  return players
    .filter((player) => {
      const state = playerStates.get(player.id);
      return state !== undefined && state.balance >= playerRoundCost;
    })
    .map((player) => player.id);
}

function getBasePotValue(game: Game, activeCount: number): number {
  return game.stakePerPotPence * activeCount;
}

function addStakesToPots(state: PotState, basePotValue: number): PotAmounts {
  state.run += basePotValue;
  state.chip += basePotValue;
  state.queen += basePotValue;
  return { run: state.run, chip: state.chip, queen: state.queen };
}

function deductRoundCost(
  activePlayerIds: string[],
  playerStates: Map<string, PlayerSimState>,
  playerRoundCost: number,
): void {
  for (const playerId of activePlayerIds) {
    const state = playerStates.get(playerId);
    if (!state) continue;
    state.balance -= playerRoundCost;
    state.contributed += playerRoundCost;
  }
}

function payWinners(
  round: Round,
  potState: PotState,
  potValues: PotAmounts,
  playerStates: Map<string, PlayerSimState>,
): PotAmounts {
  const payouts: PotAmounts = { run: 0, chip: 0, queen: 0 };

  if (round.runWinnerId) {
    payouts.run = potValues.run;
    const winner = playerStates.get(round.runWinnerId);
    if (winner) {
      winner.run += payouts.run;
      winner.balance += payouts.run;
    }
    potState.run = 0;
  }

  if (round.chipWinnerId) {
    payouts.chip = potValues.chip;
    const winner = playerStates.get(round.chipWinnerId);
    if (winner) {
      winner.chip += payouts.chip;
      winner.balance += payouts.chip;
    }
    potState.chip = 0;
  }

  if (round.queenWinnerId) {
    payouts.queen = potValues.queen;
    const winner = playerStates.get(round.queenWinnerId);
    if (winner) {
      winner.queen += payouts.queen;
      winner.balance += payouts.queen;
    }
    potState.queen = 0;
  }

  return payouts;
}

function simulateGame(
  game: Game,
  players: Player[],
  rounds: Round[],
  options: { includeNextRoundStakes?: boolean } = {},
): SimulationResult {
  const playerRoundCost = getPlayerRoundCostPence(game);
  const startingBalance = game.startingBalancePence ?? 600;
  const potState: PotState = { run: 0, chip: 0, queen: 0 };

  const playerStates = new Map<string, PlayerSimState>(
    players.map((player) => [
      player.id,
      {
        balance: startingBalance,
        run: 0,
        chip: 0,
        queen: 0,
        contributed: 0,
      },
    ]),
  );

  const roundSnapshots: RoundSnapshot[] = [];

  for (const round of sortRounds(rounds)) {
    const activePlayerIds = getActivePlayerIds(
      players,
      playerStates,
      playerRoundCost,
    );
    const basePotValue = getBasePotValue(game, activePlayerIds.length);
    const potValues = addStakesToPots(potState, basePotValue);
    deductRoundCost(activePlayerIds, playerStates, playerRoundCost);
    const payouts = payWinners(round, potState, potValues, playerStates);

    roundSnapshots.push({
      roundNumber: round.roundNumber,
      activePlayerIds,
      basePotValue,
      potValues,
      payouts,
    });
  }

  const activePlayerIds = getActivePlayerIds(
    players,
    playerStates,
    playerRoundCost,
  );
  let currentPotValues: PotAmounts = {
    run: potState.run,
    chip: potState.chip,
    queen: potState.queen,
  };

  if (options.includeNextRoundStakes) {
    const nextBase = getBasePotValue(game, activePlayerIds.length);
    currentPotValues = addStakesToPots(potState, nextBase);
  }

  return {
    players: playerStates,
    rounds: roundSnapshots,
    currentPotValues,
    activePlayerIds,
  };
}

export function getPotValuePence(game: Game, activePlayerCount: number): number {
  return game.stakePerPotPence * activePlayerCount;
}

export function getRoundTotalPence(game: Game, activePlayerCount: number): number {
  return getPotValuePence(game, activePlayerCount) * 3;
}

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

export function getCurrentPotValues(
  game: Game,
  players: Player[],
  priorRounds: Round[],
): PotAmounts {
  return simulateGame(game, players, priorRounds, {
    includeNextRoundStakes: true,
  }).currentPotValues;
}

export function getPotValuesForRound(
  game: Game,
  players: Player[],
  allRounds: Round[],
  roundNumber: number,
): PotAmounts {
  const priorRounds = allRounds.filter(
    (round) => round.roundNumber < roundNumber,
  );
  const simulation = simulateGame(game, players, priorRounds, {
    includeNextRoundStakes: true,
  });
  return simulation.currentPotValues;
}

export function getRoundPayouts(
  game: Game,
  players: Player[],
  allRounds: Round[],
  round: Round,
): PotAmounts {
  const priorRounds = allRounds.filter(
    (item) => item.roundNumber < round.roundNumber,
  );
  const simulation = simulateGame(game, players, [...priorRounds, round]);
  const snapshot = simulation.rounds.find(
    (item) => item.roundNumber === round.roundNumber,
  );
  return snapshot?.payouts ?? { run: 0, chip: 0, queen: 0 };
}

export function getActivePlayerIdsForRound(
  game: Game,
  players: Player[],
  priorRounds: Round[],
): string[] {
  return simulateGame(game, players, priorRounds).activePlayerIds;
}

export function calculatePlayerTotals(
  game: Game,
  rounds: Round[],
  players: Player[],
): PlayerTotal[] {
  const playerRoundCost = getPlayerRoundCostPence(game);
  const simulation = simulateGame(game, players, rounds);

  return players
    .map((player) => {
      const state = simulation.players.get(player.id);
      const balance = state?.balance ?? game.startingBalancePence ?? 600;
      const run = state?.run ?? 0;
      const chip = state?.chip ?? 0;
      const queen = state?.queen ?? 0;
      const contributed = state?.contributed ?? 0;
      const total = run + chip + queen;

      return {
        playerId: player.id,
        name: player.name,
        color: player.color,
        run,
        chip,
        queen,
        total,
        contributed,
        net: total - contributed,
        remaining: Math.max(0, balance),
        canPlay: balance >= playerRoundCost,
      };
    })
    .sort((a, b) => b.remaining - a.remaining);
}

export function getTotalGameValuePence(
  game: Game,
  rounds: Round[],
  players: Player[],
): number {
  const simulation = simulateGame(game, players, rounds);
  let total = 0;
  for (const state of simulation.players.values()) {
    total += state.contributed;
  }
  return total;
}

export function getAverageRoundValuePence(
  game: Game,
  rounds: Round[],
  players: Player[],
): number {
  if (rounds.length === 0) {
    const simulation = simulateGame(game, players, [], {
      includeNextRoundStakes: true,
    });
    return getRoundTotalPence(game, simulation.activePlayerIds.length);
  }

  const simulation = simulateGame(game, players, rounds);
  const roundTotal = simulation.rounds.reduce(
    (sum, snapshot) => sum + snapshot.basePotValue * 3,
    0,
  );
  return Math.round(roundTotal / rounds.length);
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
