import { AccountRepository } from "@/features/accounts/account.repository";
import type { Account } from "@/features/accounts/account.types";
import { CategoryRepository } from "@/features/categories/category.repository";
import type { Category } from "@/features/categories/category.types";
import { TransactionRepository } from "@/features/transactions/transaction.repository";
import { TransactionService } from "@/features/transactions/transaction.service";
import type {
  Transaction,
  TransactionType,
} from "@/features/transactions/transaction.types";
import { Link, useFocusEffect } from "expo-router";
import { useSQLiteContext, type SQLiteDatabase } from "expo-sqlite";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import TransactionCard from "../components/transaction-card";
import TransactionForm from "../components/transaction-form";
import type { Palette } from "../theme/colors";
import { useTheme } from "../theme/use-theme";
import { toDateString } from "../utils/date";

type PageData = {
  accounts: Account[];
  allAccounts: Account[];
  categories: Category[];
  transactions: Transaction[];
};

async function loadPageData(db: SQLiteDatabase): Promise<PageData> {
  const accountRepository = new AccountRepository(db);
  const [allAccounts, categories, transactions] = await Promise.all([
    accountRepository.getAll(true),
    new CategoryRepository(db).getAll(),
    new TransactionService(new TransactionRepository(db)).getAll(),
  ]);

  return {
    accounts: allAccounts.filter((account) => !account.archived),
    allAccounts,
    categories,
    transactions,
  };
}

export default function TransactionsScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [allAccounts, setAllAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string | null>(null);
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
  const [editingId, setEditingId] = useState<string | null>(null);
  // Mirrors editingId so loadData can read it without becoming a dependency.
  const editingIdRef = useRef<string | null>(null);
  const listRef = useRef<FlatList<Transaction>>(null);

  const db = useSQLiteContext();

  const loadData = useCallback(async () => {
    try {
      const data = await loadPageData(db);
      setAccounts(data.accounts);
      setAllAccounts(data.allAccounts);
      setCategories(data.categories);
      setCategoryId((current) =>
        current && data.categories.some((category) => category.id === current)
          ? current
          : null,
      );
      setTransactions(data.transactions);
      setAccountId((current) => {
        const selectable = editingIdRef.current
          ? data.allAccounts
          : data.accounts;
        return selectable.some((account) => account.id === current)
          ? current
          : (data.accounts[0]?.id ?? "");
      });
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

  function resetForm() {
    editingIdRef.current = null;
    setEditingId(null);
    setCategoryId(null);
    setAmount("");
    setDescription("");
    setDate(toDateString(new Date()));
    setFormError(null);
    setAccountId((current) =>
      accounts.some((account) => account.id === current)
        ? current
        : (accounts[0]?.id ?? ""),
    );
  }

  function handleTypeChange(next: TransactionType) {
    if (next === type) return;
    setType(next);
    // Categories belong to one type, so the old pick no longer applies.
    setCategoryId(null);
  }

  function startEdit(transaction: Transaction) {
    editingIdRef.current = transaction.id;
    setEditingId(transaction.id);
    setType(transaction.type);
    setCategoryId(transaction.categoryId);
    setAccountId(transaction.accountId);
    setAmount(String(transaction.amount));
    setDescription(transaction.description);
    setDate(transaction.date.slice(0, 10));
    setFormError(null);
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }

  function requestDelete(transaction: Transaction) {
    Alert.alert(
      "Delete transaction?",
      `"${transaction.description}" will be removed and the account balance will update.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            void deleteTransaction(transaction);
          },
        },
      ],
    );
  }

  async function deleteTransaction(transaction: Transaction) {
    try {
      await new TransactionService(new TransactionRepository(db)).delete(
        transaction.id,
      );
      if (editingIdRef.current === transaction.id) {
        resetForm();
      }
      await loadData();
    } catch (error) {
      Alert.alert(
        "Could not delete",
        error instanceof Error ? error.message : "Something went wrong.",
      );
    }
  }

  async function handleSubmit() {
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
      const original = editingId
        ? transactions.find((entry) => entry.id === editingId)
        : undefined;

      if (editingId && !original) {
        throw new Error("This transaction no longer exists.");
      }

      if (original) {
        await service.update({
          ...original,
          accountId,
          categoryId,
          type,
          amount: parsedAmount,
          description: description.trim(),
          date,
        });
      } else {
        await service.create({
          id: Date.now().toString(),
          accountId,
          categoryId,
          type,
          amount: parsedAmount,
          description: description.trim(),
          date,
        });
      }

      resetForm();
      await loadData();
      Keyboard.dismiss();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Could not save transaction.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  const formAccounts =
    editingId && !accounts.some((account) => account.id === accountId)
      ? [...accounts, ...allAccounts.filter((account) => account.id === accountId)]
      : accounts;

  return (
    <FlatList
      ref={listRef}
      style={styles.list}
      contentContainerStyle={styles.content}
      data={transactions}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={refreshData}
          colors={[colors.primary]}
          tintColor={colors.primary}
          progressBackgroundColor={colors.surface}
        />
      }
      ListHeaderComponent={
        <>
          <View style={styles.header}>
            <View>
              <Text style={styles.kicker}>MONEY FLOW</Text>
              <Text style={styles.title}>Transactions</Text>
            </View>
          </View>

          <View style={styles.links}>
            <Link href="/accounts" asChild>
              <Pressable accessibilityRole="button" style={styles.accountsLink}>
                <Text style={styles.accountsLinkText}>Accounts</Text>
              </Pressable>
            </Link>
            <Link href="/categories" asChild>
              <Pressable accessibilityRole="button" style={styles.accountsLink}>
                <Text style={styles.accountsLinkText}>Categories</Text>
              </Pressable>
            </Link>
            <Link href="/backup" asChild>
              <Pressable accessibilityRole="button" style={styles.accountsLink}>
                <Text style={styles.accountsLinkText}>Backup</Text>
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
            accounts={formAccounts}
            accountId={accountId}
            categories={categories}
            categoryId={categoryId}
            type={type}
            amount={amount}
            date={date}
            description={description}
            formError={formError}
            isSaving={isSaving}
            isEditing={editingId !== null}
            onAccountChange={setAccountId}
            onCategoryChange={setCategoryId}
            onTypeChange={handleTypeChange}
            onAmountChange={setAmount}
            onDateChange={setDate}
            onDescriptionChange={setDescription}
            onSubmit={handleSubmit}
            onCancelEdit={resetForm}
          />

          <Text style={styles.listTitle}>Recent activity</Text>
          {isLoading ? (
            <ActivityIndicator color={colors.primary} style={styles.loading} />
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
        const category = categories.find((entry) => entry.id === item.categoryId);
        return (
          <TransactionCard
            transaction={item}
            accountName={account?.name ?? "Account"}
            categoryLabel={
              category
                ? `${category.icon ? `${category.icon} ` : ""}${category.name}`
                : null
            }
            currency={account?.currency ?? "EUR"}
            isEditing={item.id === editingId}
            onEdit={startEdit}
            onDelete={requestDelete}
          />
        );
      }}
    />
  );
}

const createStyles = (colors: Palette) =>
  StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: colors.background,
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
    marginBottom: 12,
  },
  kicker: {
    marginBottom: 4,
    color: colors.primary,
    fontSize: 11,
    fontWeight: "800",
  },
  title: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: "800",
  },
  links: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  accountsLink: {
    minHeight: 42,
    justifyContent: "center",
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  accountsLinkText: {
    color: colors.onPrimarySurface,
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
    borderColor: colors.dangerBorder,
    borderRadius: 8,
    backgroundColor: colors.dangerSurface,
  },
  errorText: {
    flex: 1,
    color: colors.danger,
    fontSize: 13,
  },
  retryText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: "700",
  },
  listTitle: {
    marginBottom: 12,
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
  },
  loading: {
    marginVertical: 24,
  },
  emptyText: {
    paddingVertical: 18,
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
  },
});
