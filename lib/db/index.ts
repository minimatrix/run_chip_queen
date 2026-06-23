import * as SQLite from 'expo-sqlite';
import { CREATE_TABLES, DEFAULT_SETTINGS, SCHEMA_VERSION } from './schema';
import { runMigrations } from './migrations';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  const db = await SQLite.openDatabaseAsync('runchipqueen.db');
  await db.execAsync('PRAGMA foreign_keys = ON;');
  await db.execAsync(CREATE_TABLES);

  const row = await db.getFirstAsync<{ version: number }>(
    'SELECT version FROM schema_migrations LIMIT 1',
  );

  if (!row) {
    await db.runAsync('INSERT INTO schema_migrations (version) VALUES (?)', [
      SCHEMA_VERSION,
    ]);

    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
      await db.runAsync(
        'INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)',
        [key, value],
      );
    }

  } else if (row.version < SCHEMA_VERSION) {
    await runMigrations(db, row.version);
  }

  dbInstance = db;
  return db;
}

export async function resetDatabase(): Promise<void> {
  const db = await getDatabase();
  await db.execAsync(`
    DELETE FROM player_buy_ins;
    DELETE FROM rounds;
    DELETE FROM game_players;
    DELETE FROM games;
    DELETE FROM players;
    DELETE FROM settings;
  `);

  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    await db.runAsync(
      'INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)',
      [key, value],
    );
  }
}
