export type Player = {
  id: string;
  name: string;
  color: string;
};

export type Game = {
  id: string;
  name: string;
  stakePerPotPence: number;
  startingBalancePence: number;
  status: 'active' | 'finished';
  createdAt: string;
  finishedAt?: string;
};

export type GamePlayer = {
  gameId: string;
  playerId: string;
  playerOrder: number;
};

export type Round = {
  id: string;
  gameId: string;
  roundNumber: number;
  runWinnerId?: string | null;
  chipWinnerId?: string | null;
  queenWinnerId?: string | null;
  notes?: string;
  createdAt: string;
};

export type PlayerBuyIn = {
  id: string;
  gameId: string;
  playerId: string;
  roundNumber: number;
  amountPence: number;
  createdAt: string;
};

export type GamePlayerMeta = {
  playerId: string;
  buyInPromptedAtRound: number | null;
};

export type PlayerTotal = {
  playerId: string;
  name: string;
  color: string;
  run: number;
  chip: number;
  queen: number;
  total: number;
  contributed: number;
  net: number;
  remaining: number;
  /** Can afford to buy into the next round. */
  canPlay: boolean;
  /** Bought into the round being entered (round screen only). */
  inCurrentRound?: boolean;
  /** Amount the player started the game with. */
  startingFunds?: number;
  /** Total extra funds added via mid-game buy-ins. */
  buyInTotal?: number;
};

export type GameWithMeta = Game & {
  playerCount: number;
};

export type AppSettings = {
  currency: string;
  stakeIncrement: number;
  defaultStartingBalancePence: number;
  startingBalanceIncrement: number;
};

export type PotType = 'run' | 'chip' | 'queen';
