export type TransactionType = "income" | "expense";

export type Transaction = {
  id: string;
  accountId: string;
  type: TransactionType;
  amount: number;
  description: string;
  date: string;
  createdAt: string;
  updatedAt: string;
};

export function getTransactionDirection(amount: number, type: TransactionType) {
  return type === "income" ? amount : -amount;
}


