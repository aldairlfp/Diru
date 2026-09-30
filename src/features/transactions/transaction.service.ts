import { TransactionRepository } from "./transaction.repository";
import { Transaction } from "./transaction.types";

export class TransactionService {
  constructor(private transactionRepository: TransactionRepository) {}

  private validateTransaction(
    transaction: Pick<Transaction, "amount" | "date" | "description">,
  ): string {
    if (!Number.isFinite(transaction.amount) || transaction.amount <= 0) {
      throw new Error("Amount must be a finite number greater than zero");
    }

    if (!transaction.date.trim()) {
      throw new Error("Transaction date is required");
    }

    const description = transaction.description.trim();
    if (!description) {
      throw new Error("Transaction description is required");
    }

    return description;
  }

  /**
   * Retrieves all transactions.
   * @returns A promise that resolves to an array of all transactions.
   */
  async getAll(): Promise<Transaction[]> {
    return this.transactionRepository.getAll();
  }

  /**
   * Retrieves a transaction by its ID.
   * @param id The ID of the transaction to retrieve.
   * @returns A promise that resolves to the transaction with the specified ID, or null if not found.
   */
  async getById(id: string): Promise<Transaction | null> {
    return this.transactionRepository.getById(id);
  }

  /**
   * Creates a new transaction.
   * @param transaction The transaction data to create.
   * @returns A promise that resolves when the transaction is created.
   */
  async create(
    transaction: Omit<Transaction, "createdAt" | "updatedAt">,
  ): Promise<void> {
    const now = new Date().toISOString();
    return this.transactionRepository.create({
      ...transaction,
      description: this.validateTransaction(transaction),
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * Updates an existing transaction.
   * @param transaction The transaction data to update.
   * @returns A promise that resolves when the transaction is updated.
   */
  async update(transaction: Transaction): Promise<void> {
    const now = new Date().toISOString();
    return this.transactionRepository.update({
      ...transaction,
      description: this.validateTransaction(transaction),
      updatedAt: now,
    });
  }

  /**
   * Deletes a transaction by its ID.
   * @param id The ID of the transaction to delete.
   * @returns A promise that resolves when the transaction is deleted.
   */
  async delete(id: string): Promise<void> {
    return this.transactionRepository.delete(id);
  }
}
