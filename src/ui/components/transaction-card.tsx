import type { Transaction } from "@/features/transactions/transaction.types";
import { formatCurrency } from "@/ui/utils/format-currency";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { formatDateLabel, fromDateString } from "../utils/date";

type TransactionCardProps = {
  transaction: Transaction;
  accountName: string;
  currency: string;
  isEditing: boolean;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
};

export default function TransactionCard({
  transaction,
  accountName,
  currency,
  isEditing,
  onEdit,
  onDelete,
}: TransactionCardProps) {
  const isIncome = transaction.type === "income";

  return (
    <View style={[styles.container, isEditing && styles.containerEditing]}>
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
        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Edit ${transaction.description}`}
            hitSlop={8}
            onPress={() => onEdit(transaction)}
          >
            <Text style={styles.editText}>Edit</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Delete ${transaction.description}`}
            hitSlop={8}
            onPress={() => onDelete(transaction)}
          >
            <Text style={styles.deleteText}>Delete</Text>
          </Pressable>
        </View>
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
  containerEditing: {
    borderColor: "#167253",
    backgroundColor: "#f1f8f4",
  },
  actions: {
    flexDirection: "row",
    gap: 18,
    marginTop: 4,
  },
  editText: {
    color: "#176c4c",
    fontSize: 12,
    fontWeight: "700",
  },
  deleteText: {
    color: "#a33d32",
    fontSize: 12,
    fontWeight: "700",
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
