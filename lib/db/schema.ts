export const SCHEMA_VERSION = 3;

export const CREATE_TABLES = `
CREATE TABLE IF NOT EXISTS schema_migrations (
  version INTEGER PRIMARY KEY NOT NULL
);

CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS games (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  stakePerPotPence INTEGER NOT NULL,
  startingBalancePence INTEGER NOT NULL DEFAULT 600,
  status TEXT NOT NULL CHECK(status IN ('active', 'finished')),
  createdAt TEXT NOT NULL,
  finishedAt TEXT
);

CREATE TABLE IF NOT EXISTS game_players (
  gameId TEXT NOT NULL,
  playerId TEXT NOT NULL,
  playerOrder INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (gameId, playerId),
  FOREIGN KEY (gameId) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY (playerId) REFERENCES players(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS rounds (
  id TEXT PRIMARY KEY NOT NULL,
  gameId TEXT NOT NULL,
  roundNumber INTEGER NOT NULL,
  runWinnerId TEXT,
  chipWinnerId TEXT,
  queenWinnerId TEXT,
  notes TEXT,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (gameId) REFERENCES games(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL
);
`;

export const DEFAULT_SETTINGS = {
  currency: 'GBP',
  stakeIncrement: '5',
  defaultStartingBalancePence: '600',
  startingBalanceIncrement: '50',
} as const;
