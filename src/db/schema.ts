import type { SQLiteDatabase } from "expo-sqlite";

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
}
