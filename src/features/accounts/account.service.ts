import type { TransactionRepository } from "../transactions/transaction.repository";
import { getTransactionDirection } from "../transactions/transaction.types";
import { AccountRepository } from "./account.repository";
import { Account } from "./account.types";

export class AccountService {
  constructor(
    private repo: AccountRepository,
    private transactionRepo: TransactionRepository,
  ) {}

  /**
   * Get all active accounts with their balance.
   * balance = initialBalance + income - expenses.
   */
  async getAllWithBalance(): Promise<(Account & { balance: number })[]> {
    const [accounts, transactions] = await Promise.all([
      this.repo.getAll(),
      this.transactionRepo.getAll(),
    ]);

    const movement = new Map<string, number>();
    for (const transaction of transactions) {
      movement.set(
        transaction.accountId,
        (movement.get(transaction.accountId) ?? 0) +
          getTransactionDirection(transaction.amount, transaction.type),
      );
    }

    return accounts.map((account) => ({
      ...account,
      // Rounded to cents to hide floating-point drift from REAL columns.
      balance:
        Math.round((account.initialBalance + (movement.get(account.id) ?? 0)) * 100) /
        100,
    }));
  }

  /**
   * Create a new account.
   * Adds timestamps automatically.
   */

  async create(
    account: Omit<Account, "createdAt" | "updatedAt">,
  ): Promise<void> {
    const now = new Date().toISOString();
    await this.repo.create({
      ...account,
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * Archive an account (soft delete).
   */
  async archiveAccount(id: string): Promise<void> {
    await this.repo.archive(id);
  }
}
