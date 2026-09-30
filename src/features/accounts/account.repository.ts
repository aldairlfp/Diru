import type { SQLiteDatabase } from "expo-sqlite";
import { Account } from "./account.types";

type AccountRow = {
  id: string;
  name: string;
  type: Account["type"];
  initial_balance: number;
  currency: string;
  created_at: string;
  updated_at: string;
  archived: number;
};

function toAccount(row: AccountRow): Account {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    initialBalance: row.initial_balance,
    currency: row.currency,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    archived: row.archived === 1,
  };
}

export class AccountRepository {
  constructor(private db: SQLiteDatabase) {}

  async getAll(includeArchived = false): Promise<Account[]> {
    const rows = await this.db.getAllAsync<AccountRow>(
      includeArchived
        ? `SELECT * FROM accounts`
        : `SELECT * FROM accounts WHERE archived = 0`,
    );

    return rows.map(toAccount);
  }

  async getById(id: string): Promise<Account | null> {
    const row = await this.db.getFirstAsync<AccountRow>(
      "SELECT * FROM accounts WHERE id = ?",
      [id],
    );

    return row ? toAccount(row) : null;
  }

  async create(account: Account): Promise<void> {
    await this.db.runAsync(
      `INSERT INTO accounts (id, name, type, initial_balance, currency, created_at, updated_at, archived)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        account.id,
        account.name,
        account.type,
        account.initialBalance,
        account.currency,
        account.createdAt,
        account.updatedAt,
        account.archived ?? 0,
      ],
    );
  }

  async update(account: Account): Promise<void> {
    await this.db.runAsync(
      "UPDATE accounts SET name=?, type=?, initial_balance=?, currency=?, created_at=?, updated_at=?, archived=? WHERE id = ?",
      [
        account.name,
        account.type,
        account.initialBalance,
        account.currency,
        account.createdAt,
        account.updatedAt,
        account.archived ?? 0,
        account.id,
      ],
    );
  }

  async archive(id: string): Promise<void> {
    await this.db.runAsync("UPDATE accounts SET archived=1 WHERE id = ?", [id]);
  }
}
