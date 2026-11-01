import { CategoryRepository } from "@/features/categories/category.repository";
import type { SQLiteDatabase } from "expo-sqlite";

// Bump when a migration step is added below.
const SCHEMA_VERSION = 1;

export async function initializeDatabase(db: SQLiteDatabase) {
  await db.execAsync(`
    PRAGMA foreign_keys = ON;
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      initial_balance REAL NOT NULL DEFAULT 0,
      currency TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      archived INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      icon TEXT
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY NOT NULL,

      type TEXT NOT NULL,

      amount REAL NOT NULL,

      account_id TEXT NOT NULL,

      from_account_id TEXT,
      to_account_id TEXT,

      category_id TEXT,

      date TEXT NOT NULL,

      description TEXT NOT NULL,

      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,

      FOREIGN KEY (account_id)
        REFERENCES accounts(id),

      FOREIGN KEY (from_account_id)
        REFERENCES accounts(id),

      FOREIGN KEY (to_account_id)
        REFERENCES accounts(id),

      FOREIGN KEY (category_id)
        REFERENCES categories(id)
    );
  `);

  const row = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version",
  );
  const currentVersion = row?.user_version ?? 0;

  if (currentVersion < 1) {
    // Seeded once, so categories the user deletes don't come back.
    await db.withTransactionAsync(async () => {
      await new CategoryRepository(db).seedDefaults();
    });
  }

  if (currentVersion < SCHEMA_VERSION) {
    await db.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION}`);
  }
}
