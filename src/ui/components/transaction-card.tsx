import type { Transaction } from "@/features/transactions/transaction.types";
import { formatCurrency } from "@/ui/utils/format-currency";
import { StyleSheet, Text, View } from "react-native";
import { formatDateLabel, fromDateString } from "../utils/date";

type TransactionCardProps = {
  transaction: Transaction;
  accountName: string;
  currency: string;
};

export default function TransactionCard({
  transaction,
  accountName,
  currency,
}: TransactionCardProps) {
  const isIncome = transaction.type === "income";

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.marker,
          isIncome ? styles.incomeMarker : styles.expenseMarker,
        ]}
      />
      <View style={styles.details}>
        <Text style={styles.description}>{transaction.description}</Text>
        <Text style={styles.meta}>
          {accountName} · {formatDateLabel(fromDateString(transaction.date))}
        </Text>
      </View>
      <Text style={[styles.amount, isIncome ? styles.income : styles.expense]}>
        {isIncome ? "+" : "-"}
        {formatCurrency(transaction.amount, currency)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e5ebe7",
    borderRadius: 8,
    backgroundColor: "#ffffff",
  },
  marker: {
    width: 9,
    height: 34,
    borderRadius: 4,
  },
  incomeMarker: {
    backgroundColor: "#16805c",
  },
  expenseMarker: {
    backgroundColor: "#d45151",
  },
  details: {
    flex: 1,
    gap: 4,
  },
  description: {
    color: "#1d2c26",
    fontSize: 14,
    fontWeight: "700",
  },
  meta: {
    color: "#77847d",
    fontSize: 12,
  },
  amount: {
    fontSize: 14,
    fontWeight: "800",
  },
  income: {
    color: "#167253",
  },
  expense: {
    color: "#ba4b42",
  },
});
