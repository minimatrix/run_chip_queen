import type { SQLiteDatabase } from 'expo-sqlite';
import { DEFAULT_SETTINGS, SCHEMA_VERSION } from './schema';

async function backfillPlayerOrder(db: SQLiteDatabase): Promise<void> {
  const games = await db.getAllAsync<{ id: string }>('SELECT id FROM games');

  for (const game of games) {
    const players = await db.getAllAsync<{ playerId: string; name: string }>(
      `SELECT gp.playerId, p.name
       FROM game_players gp
       INNER JOIN players p ON p.id = gp.playerId
       WHERE gp.gameId = ?
       ORDER BY p.name COLLATE NOCASE`,
      [game.id],
    );

    for (let index = 0; index < players.length; index++) {
      await db.runAsync(
        'UPDATE game_players SET playerOrder = ? WHERE gameId = ? AND playerId = ?',
        [index, game.id, players[index].playerId],
      );
    }
  }
}

export async function runMigrations(
  db: SQLiteDatabase,
  fromVersion: number,
): Promise<void> {
  if (fromVersion < 2) {
    try {
      await db.execAsync(`
        ALTER TABLE games ADD COLUMN startingBalancePence INTEGER NOT NULL DEFAULT 600;
      `);
    } catch {
      // Column may already exist from a partial migration.
    }

    for (const [key, value] of [
      ['defaultStartingBalancePence', DEFAULT_SETTINGS.defaultStartingBalancePence],
      ['startingBalanceIncrement', DEFAULT_SETTINGS.startingBalanceIncrement],
    ] as const) {
      await db.runAsync(
        'INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)',
        [key, value],
      );
    }
  }

  if (fromVersion < 3) {
    try {
      await db.execAsync(`
        ALTER TABLE game_players ADD COLUMN playerOrder INTEGER NOT NULL DEFAULT 0;
      `);
    } catch {
      // Column may already exist from a partial migration.
    }

    await backfillPlayerOrder(db);
  }

  await db.runAsync('UPDATE schema_migrations SET version = ?', [SCHEMA_VERSION]);
}
