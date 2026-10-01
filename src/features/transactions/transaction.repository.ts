import {
  Transaction,
  TransactionType,
} from "@/features/transactions/transaction.types";
import { SQLiteDatabase } from "expo-sqlite";

type TransactionRow = {
  id: string;
  account_id: string;
  amount: number;
  type: TransactionType;
  description: string;
  date: string;
  created_at: string;
  updated_at: string;
};

function toTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    accountId: row.account_id,
    amount: row.amount,
    type: row.type,
    description: row.description,
    date: row.date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class TransactionRepository {
  constructor(private db: SQLiteDatabase) {}

  async getAll(): Promise<Transaction[]> {
    const rows = await this.db.getAllAsync<TransactionRow>(
      "SELECT * FROM transactions ORDER BY date DESC, created_at DESC",
    );
    return rows.map(toTransaction);
  }

  async getById(id: string): Promise<Transaction | null> {
    const row = await this.db.getFirstAsync<TransactionRow>(
      "SELECT * FROM transactions WHERE id = ?",
      [id],
    );
    return row ? toTransaction(row) : null;
  }

  async create(transaction: Transaction): Promise<void> {
    await this.db.runAsync(
      `INSERT INTO transactions (id, account_id, amount, type, description, date, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        transaction.id,
        transaction.accountId,
        transaction.amount,
        transaction.type,
        transaction.description,
        transaction.date,
        transaction.createdAt,
        transaction.updatedAt,
      ],
    );
  }

  async update(transaction: Transaction): Promise<void> {
    await this.db.runAsync(
      `UPDATE transactions
       SET account_id = ?, amount = ?, type = ?, description = ?, date = ?, created_at = ?, updated_at = ?
       WHERE id = ?`,
      [
        transaction.accountId,
        transaction.amount,
        transaction.type,
        transaction.description,
        transaction.date,
        transaction.createdAt,
        transaction.updatedAt,
        transaction.id,
      ],
    );
  }

  async delete(id: string): Promise<void> {
    await this.db.runAsync("DELETE FROM transactions WHERE id = ?", [id]);
  }

  async deleteAll(): Promise<void> {
    await this.db.runAsync("DELETE FROM transactions");
  }
}
