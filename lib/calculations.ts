import type { Game, Player, PlayerBuyIn, PlayerTotal, Round } from './types';

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

type SimulationOptions = {
  includeNextRoundStakes?: boolean;
  buyIns?: PlayerBuyIn[];
  /** Apply buy-ins for this round before checking who can play next. */
  pendingRoundNumber?: number;
};

function getNextRoundNumber(priorRounds: Round[]): number {
  if (priorRounds.length === 0) return 1;
  return Math.max(...priorRounds.map((round) => round.roundNumber)) + 1;
}

function applyBuyInsForRound(
  buyIns: PlayerBuyIn[],
  roundNumber: number,
  playerStates: Map<string, PlayerSimState>,
): void {
  for (const buyIn of buyIns) {
    if (buyIn.roundNumber !== roundNumber) continue;
    const state = playerStates.get(buyIn.playerId);
    if (!state) continue;
    state.balance += buyIn.amountPence;
  }
}

function getBuyInTotalForPlayer(
  buyIns: PlayerBuyIn[],
  playerId: string,
): number {
  return buyIns
    .filter((buyIn) => buyIn.playerId === playerId)
    .reduce((sum, buyIn) => sum + buyIn.amountPence, 0);
}

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
  options: SimulationOptions = {},
): SimulationResult {
  const playerRoundCost = getPlayerRoundCostPence(game);
  const startingBalance = game.startingBalancePence ?? 600;
  const buyIns = options.buyIns ?? [];
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
    applyBuyInsForRound(buyIns, round.roundNumber, playerStates);
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

  if (options.pendingRoundNumber !== undefined) {
    applyBuyInsForRound(buyIns, options.pendingRoundNumber, playerStates);
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
  buyIns: PlayerBuyIn[] = [],
): PotAmounts {
  return simulateGame(game, players, priorRounds, {
    includeNextRoundStakes: true,
    buyIns,
    pendingRoundNumber: getNextRoundNumber(priorRounds),
  }).currentPotValues;
}

export function getPotValuesForRound(
  game: Game,
  players: Player[],
  allRounds: Round[],
  roundNumber: number,
  buyIns: PlayerBuyIn[] = [],
): PotAmounts {
  const priorRounds = allRounds.filter(
    (round) => round.roundNumber < roundNumber,
  );
  const simulation = simulateGame(game, players, priorRounds, {
    includeNextRoundStakes: true,
    buyIns,
    pendingRoundNumber: roundNumber,
  });
  return simulation.currentPotValues;
}

export function getRoundPayouts(
  game: Game,
  players: Player[],
  allRounds: Round[],
  round: Round,
  buyIns: PlayerBuyIn[] = [],
): PotAmounts {
  const priorRounds = allRounds.filter(
    (item) => item.roundNumber < round.roundNumber,
  );
  const simulation = simulateGame(game, players, [...priorRounds, round], {
    buyIns,
  });
  const snapshot = simulation.rounds.find(
    (item) => item.roundNumber === round.roundNumber,
  );
  return snapshot?.payouts ?? { run: 0, chip: 0, queen: 0 };
}

export function getActivePlayerIdsForRound(
  game: Game,
  players: Player[],
  priorRounds: Round[],
  buyIns: PlayerBuyIn[] = [],
): string[] {
  return simulateGame(game, players, priorRounds, {
    buyIns,
    pendingRoundNumber: getNextRoundNumber(priorRounds),
  }).activePlayerIds;
}

/** Who has two hands this round - rotates through player order, skipping those out of funds. */
export function getTwoHandsPlayerForRound(
  game: Game,
  orderedPlayers: Player[],
  priorRounds: Round[],
  roundNumber: number,
  buyIns: PlayerBuyIn[] = [],
): Player | null {
  if (orderedPlayers.length === 0 || roundNumber < 1) {
    return null;
  }

  const playerRoundCost = getPlayerRoundCostPence(game);
  const simulation = simulateGame(game, orderedPlayers, priorRounds, {
    buyIns,
    pendingRoundNumber: roundNumber,
  });

  const activeIds = new Set(
    orderedPlayers
      .filter((player) => {
        const state = simulation.players.get(player.id);
        return state !== undefined && state.balance >= playerRoundCost;
      })
      .map((player) => player.id),
  );

  if (activeIds.size === 0) {
    return null;
  }

  const startIndex = (roundNumber - 1) % orderedPlayers.length;

  for (let offset = 0; offset < orderedPlayers.length; offset++) {
    const player = orderedPlayers[(startIndex + offset) % orderedPlayers.length];
    if (activeIds.has(player.id)) {
      return player;
    }
  }

  return null;
}

function buildPlayerTotals(
  game: Game,
  players: Player[],
  playerStates: Map<string, PlayerSimState>,
  options: {
    inCurrentRound?: Set<string>;
    includeGameStartingFunds?: boolean;
    buyIns?: PlayerBuyIn[];
  } = {},
): PlayerTotal[] {
  const playerRoundCost = getPlayerRoundCostPence(game);
  const { inCurrentRound, includeGameStartingFunds, buyIns = [] } = options;
  const gameStartingFunds = game.startingBalancePence ?? 600;

  return players
    .map((player) => {
      const state = playerStates.get(player.id);
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
        ...(inCurrentRound !== undefined
          ? { inCurrentRound: inCurrentRound.has(player.id) }
          : {}),
        ...(includeGameStartingFunds
          ? { startingFunds: gameStartingFunds }
          : {}),
        ...(buyIns.length > 0 || includeGameStartingFunds
          ? { buyInTotal: getBuyInTotalForPlayer(buyIns, player.id) }
          : {}),
      };
    })
    .sort((a, b) => b.remaining - a.remaining);
}

export function calculatePlayerTotals(
  game: Game,
  rounds: Round[],
  players: Player[],
  buyIns: PlayerBuyIn[] = [],
  options: {
    includeGameStartingFunds?: boolean;
    applyBuyInsBeforeRound?: number;
  } = {},
): PlayerTotal[] {
  const simulation = simulateGame(game, players, rounds, {
    buyIns,
    pendingRoundNumber: options.applyBuyInsBeforeRound,
  });
  return buildPlayerTotals(game, players, simulation.players, {
    buyIns,
    includeGameStartingFunds: options.includeGameStartingFunds,
  });
}

/** Totals for the round entry screen - includes buy-in for the round being played. */
export function calculatePlayerTotalsForRoundEntry(
  game: Game,
  priorRounds: Round[],
  players: Player[],
  roundNumber: number,
  buyIns: PlayerBuyIn[] = [],
): PlayerTotal[] {
  const playerRoundCost = getPlayerRoundCostPence(game);
  const simulation = simulateGame(game, players, priorRounds, {
    buyIns,
    pendingRoundNumber: roundNumber,
  });
  const inCurrentRound = new Set(
    getActivePlayerIds(players, simulation.players, playerRoundCost),
  );

  for (const playerId of inCurrentRound) {
    const state = simulation.players.get(playerId);
    if (!state) continue;
    state.balance -= playerRoundCost;
    state.contributed += playerRoundCost;
  }

  return buildPlayerTotals(game, players, simulation.players, {
    inCurrentRound,
    includeGameStartingFunds: true,
    buyIns,
  });
}

export function getPlayerBalanceBeforeRound(
  game: Game,
  priorRounds: Round[],
  players: Player[],
  playerId: string,
  buyIns: PlayerBuyIn[] = [],
  pendingRoundNumber?: number,
): number {
  const simulation = simulateGame(game, players, priorRounds, {
    buyIns,
    pendingRoundNumber,
  });
  return (
    simulation.players.get(playerId)?.balance ??
    game.startingBalancePence ??
    600
  );
}

/** Players who need a buy-in prompt at the start of this round. */
export function getPlayersNeedingBuyInPrompt(
  game: Game,
  priorRounds: Round[],
  players: Player[],
  buyIns: PlayerBuyIn[],
  currentRoundNumber: number,
  buyInPromptedAtRound: Record<string, number | null>,
): Player[] {
  const playerRoundCost = getPlayerRoundCostPence(game);
  const simulation = simulateGame(game, players, priorRounds, {
    buyIns,
    pendingRoundNumber: currentRoundNumber,
  });

  return players.filter((player) => {
    const state = simulation.players.get(player.id);
    const isOut = state === undefined || state.balance < playerRoundCost;
    if (!isOut) return false;

    const prompted = buyInPromptedAtRound[player.id] ?? null;
    if (prompted === null) return true;
    return false;
  });
}

export function getTotalGameValuePence(
  game: Game,
  rounds: Round[],
  players: Player[],
  buyIns: PlayerBuyIn[] = [],
): number {
  const simulation = simulateGame(game, players, rounds, { buyIns });
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
  buyIns: PlayerBuyIn[] = [],
): number {
  if (rounds.length === 0) {
    const simulation = simulateGame(game, players, [], {
      includeNextRoundStakes: true,
      buyIns,
      pendingRoundNumber: 1,
    });
    return getRoundTotalPence(game, simulation.activePlayerIds.length);
  }

  const simulation = simulateGame(game, players, rounds, { buyIns });
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

export type SettlementTransfer = {
  fromId: string;
  fromName: string;
  fromColor: string;
  toId: string;
  toName: string;
  toColor: string;
  amountPence: number;
};

export function computeSettlementTransfers(
  totals: PlayerTotal[],
): SettlementTransfer[] {
  const debtors = totals
    .filter((t) => t.net < 0)
    .map((t) => ({ ...t, remaining: Math.abs(t.net) }))
    .sort((a, b) => b.remaining - a.remaining);
  const creditors = totals
    .filter((t) => t.net > 0)
    .map((t) => ({ ...t, remaining: t.net }))
    .sort((a, b) => b.remaining - a.remaining);

  const transfers: SettlementTransfer[] = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const amount = Math.min(debtors[i].remaining, creditors[j].remaining);
    if (amount > 0) {
      transfers.push({
        fromId: debtors[i].playerId,
        fromName: debtors[i].name,
        fromColor: debtors[i].color,
        toId: creditors[j].playerId,
        toName: creditors[j].name,
        toColor: creditors[j].color,
        amountPence: amount,
      });
    }
    debtors[i].remaining -= amount;
    creditors[j].remaining -= amount;
    if (debtors[i].remaining <= 0) i += 1;
    if (creditors[j].remaining <= 0) j += 1;
  }

  return transfers;
}
