export type AccountType = "cash" | "bank" | "savings" | "credit";

export type Account = {
  id: string;
  name: string;
  type: AccountType;
  initialBalance: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  archived?: boolean;
};
