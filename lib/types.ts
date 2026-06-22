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
  canPlay: boolean;
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
