import type { SQLiteDatabase } from 'expo-sqlite';
import { DEFAULT_SETTINGS, SCHEMA_VERSION } from './schema';

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

    await db.runAsync('UPDATE schema_migrations SET version = ?', [
      SCHEMA_VERSION,
    ]);
  }
}
