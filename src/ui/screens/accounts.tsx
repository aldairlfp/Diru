import { AccountRepository } from "@/features/accounts/account.repository";
import { AccountService } from "@/features/accounts/account.service";
import type { Account, AccountType } from "@/features/accounts/account.types";
import { TransactionRepository } from "@/features/transactions/transaction.repository";
import { useSQLiteContext, type SQLiteDatabase } from "expo-sqlite";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AccountCard from "../components/account-card";
import AccountForm from "../components/account-form";
import { formatCurrency } from "../utils/format-currency";

type AccountWithBalance = Account & { balance: number };

const accountTypes: AccountType[] = ["bank", "cash", "savings", "credit"];

function createAccountService(db: SQLiteDatabase) {
  return new AccountService(
    new AccountRepository(db),
    new TransactionRepository(db),
  );
}

export default function AccountsScreen() {
  const [accounts, setAccounts] = useState<AccountWithBalance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [name, setName] = useState("");
  const [initialBalance, setInitialBalance] = useState("");
  const [type, setType] = useState<AccountType>("bank");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [archivingAccountId, setArchivingAccountId] = useState<string | null>(
    null,
  );

  const db = useSQLiteContext();

  const loadAccounts = useCallback(async () => {
    setLoadError(null);

    const accountService = createAccountService(db);

    try {
      const loadedAccounts = await accountService.getAllWithBalance();
      setAccounts(loadedAccounts);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Error loading accounts",
      );
    } finally {
      setIsLoading(false);
    }
  }, [db]);

  useEffect(() => {
    void loadAccounts();
  }, [loadAccounts]);

  async function handleAddAccount() {
    if (isLoading || isSaving) {
      return;
    }

    if (!name.trim()) {
      setFormError("Name must not be empty");
      return;
    }

    const parsedBalance = Number(initialBalance.trim().replace(",", "."));

    if (initialBalance.trim() && !Number.isFinite(parsedBalance)) {
      setFormError("Balance must be a valid number");
      return;
    }

    setErrorMessage(null);
    setFormError(null);
    setIsSaving(true);

    try {
      const accountService = createAccountService(db);

      await accountService.create({
        id: Date.now().toString(),
        name: name.trim(),
        type,
        initialBalance: initialBalance.trim() ? parsedBalance : 0,
        currency: "EUR",
      });

      setName("");
      setInitialBalance("");
      setType("bank");

      await loadAccounts();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not add account.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  function requestArchiveAccount(accountId: string) {
    Alert.alert(
      "Archive account?",
      "It will be hidden from your account list.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Archive",
          style: "destructive",
          onPress: () => {
            void archiveAccount(accountId);
          },
        },
      ],
    );
  }

  async function archiveAccount(accountId: string) {
    setErrorMessage(null);
    setArchivingAccountId(accountId);

    try {
      const accountService = createAccountService(db);
      await accountService.archiveAccount(accountId);
      await loadAccounts();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not archive account.",
      );
    } finally {
      setArchivingAccountId(null);
    }
  }

  async function refreshAccounts() {
    setIsRefreshing(true);
    try {
      await loadAccounts();
    } finally {
      setIsRefreshing(false);
    }
  }

  const totalBalance = accounts.reduce(
    (total, account) => total + account.balance,
    0,
  );
  const accountTotal = accounts.length;

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={refreshAccounts} />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>DIRU / OVERVIEW</Text>
          <Text style={styles.title}>Accounts</Text>
        </View>
        <Text style={styles.headerCount}>
          {accountTotal.toString().padStart(2, "0")}
        </Text>
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryLabel}>Total balance</Text>
        <Text style={styles.totalBalance}>
          {formatCurrency(totalBalance, "EUR")}
        </Text>
        <Text style={styles.summaryMeta}>
          Across {accountTotal} {accountTotal === 1 ? "account" : "accounts"}
        </Text>
      </View>

      {errorMessage ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}

      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Add account</Text>
        <AccountForm
          name={name}
          initialBalance={initialBalance}
          type={type}
          formError={formError}
          isSaving={isSaving}
          isDisabled={isLoading || isSaving}
          accountTypes={accountTypes}
          onNameChange={setName}
          onBalanceChange={setInitialBalance}
          onTypeChange={setType}
          onSubmit={handleAddAccount}
        />
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.sectionTitle}>Your accounts</Text>
        <Text style={styles.listCount}>{accountTotal}</Text>
      </View>

      {isLoading ? (
        <View style={styles.stateContainer}>
          <ActivityIndicator color="#176c4c" />
          <Text style={styles.stateText}>Loading accounts</Text>
        </View>
      ) : loadError ? (
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>
            Your accounts could not be loaded.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={refreshAccounts}
            style={styles.retryButton}
          >
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      ) : accounts.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No accounts yet</Text>
          <Text style={styles.stateText}>
            Add your first account above to get started.
          </Text>
        </View>
      ) : (
        accounts.map((account) => (
          <AccountCard
            key={account.id}
            account={account}
            isArchiving={archivingAccountId === account.id}
            onArchive={requestArchiveAccount}
          />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 40,
    backgroundColor: "#f3f6f4",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  kicker: {
    marginBottom: 4,
    color: "#167253",
    fontSize: 11,
    fontWeight: "800",
  },
  headerCount: {
    color: "#9aaba2",
    fontSize: 22,
    fontWeight: "700",
  },
  title: {
    color: "#182522",
    fontSize: 28,
    fontWeight: "800",
  },
  summary: {
    marginBottom: 24,
    padding: 20,
    borderRadius: 8,
    backgroundColor: "#174f3b",
  },
  summaryLabel: {
    marginBottom: 8,
    color: "#c6ded2",
    fontSize: 13,
    fontWeight: "600",
  },
  totalBalance: {
    color: "#ffffff",
    fontSize: 30,
    fontWeight: "800",
  },
  summaryMeta: {
    marginTop: 8,
    color: "#c6ded2",
    fontSize: 13,
  },
  formSection: {
    marginBottom: 26,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e1e8e4",
    borderRadius: 8,
    backgroundColor: "#ffffff",
  },
  sectionTitle: {
    color: "#182522",
    fontSize: 18,
    fontWeight: "800",
  },
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  listCount: {
    color: "#77847d",
    fontSize: 14,
    fontWeight: "700",
  },
  errorBanner: {
    marginBottom: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#edc2bd",
    borderRadius: 8,
    backgroundColor: "#fff4f2",
  },
  errorText: {
    color: "#a33d32",
    fontSize: 13,
  },
  stateContainer: {
    alignItems: "center",
    gap: 12,
    paddingVertical: 28,
  },
  stateText: {
    color: "#68766f",
    fontSize: 14,
    textAlign: "center",
  },
  retryButton: {
    minHeight: 42,
    justifyContent: "center",
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: "#176c4c",
  },
  retryText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  emptyState: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 28,
  },
  emptyTitle: {
    color: "#263a31",
    fontSize: 16,
    fontWeight: "700",
  },
});
