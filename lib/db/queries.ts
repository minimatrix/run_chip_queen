import type { SQLiteDatabase } from 'expo-sqlite';
import { pickPlayerColor } from '../colors';
import type { Game, Player, PlayerBuyIn, Round } from '../types';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function getAllPlayers(db: SQLiteDatabase): Promise<Player[]> {
  return db.getAllAsync<Player>(
    'SELECT id, name, color FROM players ORDER BY name COLLATE NOCASE',
  );
}

export async function insertPlayer(
  db: SQLiteDatabase,
  player: Player,
): Promise<void> {
  await db.runAsync(
    'INSERT INTO players (id, name, color) VALUES (?, ?, ?)',
    [player.id, player.name, player.color],
  );
}

export async function updatePlayer(
  db: SQLiteDatabase,
  player: Player,
): Promise<void> {
  await db.runAsync('UPDATE players SET name = ?, color = ? WHERE id = ?', [
    player.name,
    player.color,
    player.id,
  ]);
}

export async function deletePlayer(
  db: SQLiteDatabase,
  playerId: string,
): Promise<void> {
  await db.runAsync('DELETE FROM players WHERE id = ?', [playerId]);
}

export async function getAllGames(
  db: SQLiteDatabase,
): Promise<(Game & { playerCount: number })[]> {
  return db.getAllAsync<Game & { playerCount: number }>(`
    SELECT g.*, COUNT(gp.playerId) as playerCount
    FROM games g
    LEFT JOIN game_players gp ON g.id = gp.gameId
    GROUP BY g.id
    ORDER BY
      CASE WHEN g.status = 'active' THEN 0 ELSE 1 END,
      g.createdAt DESC
  `);
}

export async function getGame(
  db: SQLiteDatabase,
  gameId: string,
): Promise<Game | null> {
  return db.getFirstAsync<Game>(
    'SELECT * FROM games WHERE id = ?',
    [gameId],
  );
}

export async function insertGame(
  db: SQLiteDatabase,
  game: Game,
  playerIds: string[],
): Promise<void> {
  await db.runAsync(
    `INSERT INTO games (id, name, stakePerPotPence, startingBalancePence, status, createdAt, finishedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      game.id,
      game.name,
      game.stakePerPotPence,
      game.startingBalancePence,
      game.status,
      game.createdAt,
      game.finishedAt ?? null,
    ],
  );

  for (let index = 0; index < playerIds.length; index++) {
    await db.runAsync(
      'INSERT INTO game_players (gameId, playerId, playerOrder) VALUES (?, ?, ?)',
      [game.id, playerIds[index], index],
    );
  }
}

export async function finishGame(
  db: SQLiteDatabase,
  gameId: string,
): Promise<void> {
  await db.runAsync(
    `UPDATE games SET status = 'finished', finishedAt = ? WHERE id = ?`,
    [new Date().toISOString(), gameId],
  );
}

export async function deleteGame(
  db: SQLiteDatabase,
  gameId: string,
): Promise<void> {
  await db.runAsync('DELETE FROM games WHERE id = ?', [gameId]);
}

export async function getGamePlayers(
  db: SQLiteDatabase,
  gameId: string,
): Promise<Player[]> {
  return db.getAllAsync<Player>(
    `SELECT p.id, p.name, p.color
     FROM players p
     INNER JOIN game_players gp ON p.id = gp.playerId
     WHERE gp.gameId = ?
     ORDER BY gp.playerOrder ASC`,
    [gameId],
  );
}

export async function getGameBuyIns(
  db: SQLiteDatabase,
  gameId: string,
): Promise<PlayerBuyIn[]> {
  return db.getAllAsync<PlayerBuyIn>(
    `SELECT id, gameId, playerId, roundNumber, amountPence, createdAt
     FROM player_buy_ins
     WHERE gameId = ?
     ORDER BY roundNumber ASC, createdAt ASC`,
    [gameId],
  );
}

export async function insertPlayerBuyIn(
  db: SQLiteDatabase,
  buyIn: PlayerBuyIn,
): Promise<void> {
  await db.runAsync(
    `INSERT INTO player_buy_ins (id, gameId, playerId, roundNumber, amountPence, createdAt)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      buyIn.id,
      buyIn.gameId,
      buyIn.playerId,
      buyIn.roundNumber,
      buyIn.amountPence,
      buyIn.createdAt,
    ],
  );
}

export async function getGamePlayerMeta(
  db: SQLiteDatabase,
  gameId: string,
): Promise<{ playerId: string; buyInPromptedAtRound: number | null }[]> {
  return db.getAllAsync<{ playerId: string; buyInPromptedAtRound: number | null }>(
    `SELECT playerId, buyInPromptedAtRound
     FROM game_players
     WHERE gameId = ?`,
    [gameId],
  );
}

export async function setBuyInPromptedAtRound(
  db: SQLiteDatabase,
  gameId: string,
  playerId: string,
  roundNumber: number | null,
): Promise<void> {
  await db.runAsync(
    `UPDATE game_players
     SET buyInPromptedAtRound = ?
     WHERE gameId = ? AND playerId = ?`,
    [roundNumber, gameId, playerId],
  );
}

export async function clearBuyInPromptedAtRound(
  db: SQLiteDatabase,
  gameId: string,
  playerId: string,
): Promise<void> {
  await setBuyInPromptedAtRound(db, gameId, playerId, null);
}

export async function getGameRounds(
  db: SQLiteDatabase,
  gameId: string,
): Promise<Round[]> {
  return db.getAllAsync<Round>(
    'SELECT * FROM rounds WHERE gameId = ? ORDER BY roundNumber ASC',
    [gameId],
  );
}

export async function getRound(
  db: SQLiteDatabase,
  roundId: string,
): Promise<Round | null> {
  return db.getFirstAsync<Round>('SELECT * FROM rounds WHERE id = ?', [
    roundId,
  ]);
}

export async function insertRound(
  db: SQLiteDatabase,
  round: Round,
): Promise<void> {
  await db.runAsync(
    `INSERT INTO rounds (id, gameId, roundNumber, runWinnerId, chipWinnerId, queenWinnerId, notes, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      round.id,
      round.gameId,
      round.roundNumber,
      round.runWinnerId ?? null,
      round.chipWinnerId ?? null,
      round.queenWinnerId ?? null,
      round.notes ?? '',
      round.createdAt,
    ],
  );
}

export async function updateRound(
  db: SQLiteDatabase,
  round: Round,
): Promise<void> {
  await db.runAsync(
    `UPDATE rounds SET
      runWinnerId = ?,
      chipWinnerId = ?,
      queenWinnerId = ?,
      notes = ?
     WHERE id = ?`,
    [
      round.runWinnerId ?? null,
      round.chipWinnerId ?? null,
      round.queenWinnerId ?? null,
      round.notes ?? '',
      round.id,
    ],
  );
}

export async function deleteRound(
  db: SQLiteDatabase,
  roundId: string,
): Promise<void> {
  await db.runAsync('DELETE FROM rounds WHERE id = ?', [roundId]);
}

export async function getSettings(
  db: SQLiteDatabase,
): Promise<{
  currency: string;
  stakeIncrement: number;
  defaultStartingBalancePence: number;
  startingBalanceIncrement: number;
}> {
  const rows = await db.getAllAsync<{ key: string; value: string }>(
    'SELECT key, value FROM settings',
  );
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return {
    currency: map.currency ?? 'GBP',
    stakeIncrement: parseInt(map.stakeIncrement ?? '5', 10),
    defaultStartingBalancePence: parseInt(
      map.defaultStartingBalancePence ?? '600',
      10,
    ),
    startingBalanceIncrement: parseInt(
      map.startingBalanceIncrement ?? '50',
      10,
    ),
  };
}

export async function updateSettings(
  db: SQLiteDatabase,
  settings: {
    currency?: string;
    stakeIncrement?: number;
    defaultStartingBalancePence?: number;
    startingBalanceIncrement?: number;
  },
): Promise<void> {
  if (settings.currency !== undefined) {
    await db.runAsync(
      'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
      ['currency', settings.currency],
    );
  }
  if (settings.stakeIncrement !== undefined) {
    await db.runAsync(
      'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
      ['stakeIncrement', String(settings.stakeIncrement)],
    );
  }
  if (settings.defaultStartingBalancePence !== undefined) {
    await db.runAsync(
      'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
      [
        'defaultStartingBalancePence',
        String(settings.defaultStartingBalancePence),
      ],
    );
  }
  if (settings.startingBalanceIncrement !== undefined) {
    await db.runAsync(
      'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
      [
        'startingBalanceIncrement',
        String(settings.startingBalanceIncrement),
      ],
    );
  }
}

export { generateId };
