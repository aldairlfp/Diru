import { AccountRepository } from "@/features/accounts/account.repository";
import type { Account } from "@/features/accounts/account.types";
import { TransactionRepository } from "@/features/transactions/transaction.repository";
import { TransactionService } from "@/features/transactions/transaction.service";
import type {
  Transaction,
  TransactionType,
} from "@/features/transactions/transaction.types";
import { Link, useFocusEffect } from "expo-router";
import { useSQLiteContext, type SQLiteDatabase } from "expo-sqlite";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import TransactionCard from "../components/transaction-card";
import TransactionForm from "../components/transaction-form";
import { toDateString } from "../utils/date";

type PageData = {
  accounts: Account[];
  allAccounts: Account[];
  transactions: Transaction[];
};

async function loadPageData(db: SQLiteDatabase): Promise<PageData> {
  const accountRepository = new AccountRepository(db);
  const [allAccounts, transactions] = await Promise.all([
    accountRepository.getAll(true),
    new TransactionService(new TransactionRepository(db)).getAll(),
  ]);

  return {
    accounts: allAccounts.filter((account) => !account.archived),
    allAccounts,
    transactions,
  };
}

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [allAccounts, setAllAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [type, setType] = useState<TransactionType>("expense");
  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(() => toDateString(new Date()));

  const db = useSQLiteContext();

  const loadData = useCallback(async () => {
    try {
      const data = await loadPageData(db);
      setAccounts(data.accounts);
      setAllAccounts(data.allAccounts);
      setTransactions(data.transactions);
      setAccountId((current) =>
        data.accounts.some((account) => account.id === current)
          ? current
          : (data.accounts[0]?.id ?? ""),
      );
      setLoadError(null);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Could not load data.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [db]);

  // The stack keeps this screen mounted, so reload when returning from Accounts.
  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData]),
  );

  async function refreshData() {
    setIsRefreshing(true);
    try {
      await loadData();
    } finally {
      setIsRefreshing(false);
    }
  }

  async function handleCreateTransaction() {
    setFormError(null);

    if (!accountId) {
      setFormError("Create an account before adding a transaction.");
      return;
    }

    const parsedAmount = Number(amount.trim().replace(",", "."));
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setFormError("Enter an amount greater than zero.");
      return;
    }

    if (!description.trim()) {
      setFormError("Add a description.");
      return;
    }

    setIsSaving(true);
    try {
      const service = new TransactionService(new TransactionRepository(db));
      await service.create({
        id: Date.now().toString(),
        accountId,
        type,
        amount: parsedAmount,
        description: description.trim(),
        date,
      });

      setTransactions(await service.getAll());
      setAmount("");
      setDescription("");
      setDate(toDateString(new Date()));
      Keyboard.dismiss();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Could not save transaction.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.content}
      data={transactions}
      keyExtractor={(item) => item.id}
      refreshing={isRefreshing}
      onRefresh={refreshData}
      ListHeaderComponent={
        <>
          <View style={styles.header}>
            <View>
              <Text style={styles.kicker}>MONEY FLOW</Text>
              <Text style={styles.title}>Transactions</Text>
            </View>
            <Link href="/accounts" asChild>
              <Pressable accessibilityRole="button" style={styles.accountsLink}>
                <Text style={styles.accountsLinkText}>Accounts</Text>
              </Pressable>
            </Link>
          </View>

          {loadError ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{loadError}</Text>
              <Pressable onPress={refreshData} accessibilityRole="button">
                <Text style={styles.retryText}>Retry</Text>
              </Pressable>
            </View>
          ) : null}

          <TransactionForm
            accounts={accounts}
            accountId={accountId}
            type={type}
            amount={amount}
            date={date}
            description={description}
            formError={formError}
            isSaving={isSaving}
            onAccountChange={setAccountId}
            onTypeChange={setType}
            onAmountChange={setAmount}
            onDateChange={setDate}
            onDescriptionChange={setDescription}
            onSubmit={handleCreateTransaction}
          />

          <Text style={styles.listTitle}>Recent activity</Text>
          {isLoading ? (
            <ActivityIndicator color="#167253" style={styles.loading} />
          ) : null}
        </>
      }
      ListEmptyComponent={
        !isLoading && !loadError ? (
          <Text style={styles.emptyText}>No transactions yet.</Text>
        ) : null
      }
      renderItem={({ item }) => {
        const account = allAccounts.find((entry) => entry.id === item.accountId);
        return (
          <TransactionCard
            transaction={item}
            accountName={account?.name ?? "Account"}
            currency={account?.currency ?? "EUR"}
          />
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: "#f3f6f4",
  },
  content: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 36,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  kicker: {
    marginBottom: 4,
    color: "#167253",
    fontSize: 11,
    fontWeight: "800",
  },
  title: {
    color: "#182522",
    fontSize: 28,
    fontWeight: "800",
  },
  accountsLink: {
    minHeight: 42,
    justifyContent: "center",
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#c8d7d0",
    borderRadius: 8,
    backgroundColor: "#ffffff",
  },
  accountsLinkText: {
    color: "#245b49",
    fontSize: 14,
    fontWeight: "700",
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#edc2bd",
    borderRadius: 8,
    backgroundColor: "#fff4f2",
  },
  errorText: {
    flex: 1,
    color: "#a33d32",
    fontSize: 13,
  },
  retryText: {
    color: "#8e332b",
    fontSize: 14,
    fontWeight: "700",
  },
  listTitle: {
    marginBottom: 12,
    color: "#182522",
    fontSize: 18,
    fontWeight: "700",
  },
  loading: {
    marginVertical: 24,
  },
  emptyText: {
    paddingVertical: 18,
    color: "#68766f",
    fontSize: 14,
    textAlign: "center",
  },
});
