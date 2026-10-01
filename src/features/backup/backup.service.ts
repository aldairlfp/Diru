import type { SQLiteDatabase } from "expo-sqlite";
import { AccountRepository } from "../accounts/account.repository";
import type { Account, AccountType } from "../accounts/account.types";
import { TransactionRepository } from "../transactions/transaction.repository";
import type {
  Transaction,
  TransactionType,
} from "../transactions/transaction.types";

const BACKUP_VERSION = 1;
const ACCOUNT_TYPES: AccountType[] = ["cash", "bank", "savings", "credit"];
const TRANSACTION_TYPES: TransactionType[] = ["income", "expense"];

export type BackupFile = {
  app: "diru";
  version: number;
  exportedAt: string;
  accounts: Account[];
  transactions: Transaction[];
};

function fail(message: string): never {
  throw new Error(`Invalid backup: ${message}`);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(record: Record<string, unknown>, field: string, where: string) {
  const value = record[field];
  if (typeof value !== "string" || !value.trim()) {
    fail(`${where} needs a "${field}" text value.`);
  }
  return value;
}

function amount(record: Record<string, unknown>, field: string, where: string) {
  const value = record[field];
  if (typeof value !== "number" || !Number.isFinite(value)) {
    fail(`${where} needs a numeric "${field}".`);
  }
  return value;
}

function oneOf<T extends string>(
  record: Record<string, unknown>,
  field: string,
  allowed: T[],
  where: string,
): T {
  const value = record[field];
  if (!allowed.includes(value as T)) {
    fail(`${where} has an unknown "${field}".`);
  }
  return value as T;
}

function parseAccount(raw: unknown, index: number): Account {
  const where = `account #${index + 1}`;
  if (!isRecord(raw)) fail(`${where} is not an object.`);

  return {
    id: text(raw, "id", where),
    name: text(raw, "name", where),
    type: oneOf(raw, "type", ACCOUNT_TYPES, where),
    initialBalance: amount(raw, "initialBalance", where),
    currency: text(raw, "currency", where),
    createdAt: text(raw, "createdAt", where),
    updatedAt: text(raw, "updatedAt", where),
    archived: raw.archived === true,
  };
}

function parseTransaction(raw: unknown, index: number): Transaction {
  const where = `transaction #${index + 1}`;
  if (!isRecord(raw)) fail(`${where} is not an object.`);

  const value = amount(raw, "amount", where);
  if (value <= 0) fail(`${where} needs an amount above zero.`);

  return {
    id: text(raw, "id", where),
    accountId: text(raw, "accountId", where),
    type: oneOf(raw, "type", TRANSACTION_TYPES, where),
    amount: value,
    description: text(raw, "description", where),
    date: text(raw, "date", where),
    createdAt: text(raw, "createdAt", where),
    updatedAt: text(raw, "updatedAt", where),
  };
}

export function parseBackup(json: string): BackupFile {
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    fail("the text is not valid JSON. Paste the full backup text.");
  }

  if (!isRecord(raw) || raw.app !== "diru") {
    fail("this is not a Diru backup.");
  }
  if (raw.version !== BACKUP_VERSION) {
    fail(`unsupported backup version ${String(raw.version)}.`);
  }
  if (!Array.isArray(raw.accounts) || !Array.isArray(raw.transactions)) {
    fail("accounts and transactions are missing.");
  }

  const accounts = raw.accounts.map(parseAccount);
  const transactions = raw.transactions.map(parseTransaction);

  const accountIds = new Set<string>();
  for (const account of accounts) {
    if (accountIds.has(account.id)) fail(`duplicate account id ${account.id}.`);
    accountIds.add(account.id);
  }

  const transactionIds = new Set<string>();
  for (const transaction of transactions) {
    if (transactionIds.has(transaction.id)) {
      fail(`duplicate transaction id ${transaction.id}.`);
    }
    transactionIds.add(transaction.id);
    if (!accountIds.has(transaction.accountId)) {
      fail(`transaction "${transaction.description}" points to a missing account.`);
    }
  }

  return {
    app: "diru",
    version: BACKUP_VERSION,
    exportedAt: typeof raw.exportedAt === "string" ? raw.exportedAt : "",
    accounts,
    transactions,
  };
}

export class BackupService {
  constructor(private db: SQLiteDatabase) {}

  async exportBackup() {
    const [accounts, transactions] = await Promise.all([
      new AccountRepository(this.db).getAll(true),
      new TransactionRepository(this.db).getAll(),
    ]);

    const backup: BackupFile = {
      app: "diru",
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      accounts,
      transactions,
    };

    return {
      json: JSON.stringify(backup),
      accountCount: accounts.length,
      transactionCount: transactions.length,
    };
  }

  // Replaces all data atomically: if any insert fails, the old data stays.
  async restoreBackup(backup: BackupFile): Promise<void> {
    const accountRepo = new AccountRepository(this.db);
    const transactionRepo = new TransactionRepository(this.db);

    await this.db.withTransactionAsync(async () => {
      await transactionRepo.deleteAll();
      await accountRepo.deleteAll();
      for (const account of backup.accounts) {
        await accountRepo.create(account);
      }
      for (const transaction of backup.transactions) {
        await transactionRepo.create(transaction);
      }
    });
  }
}
