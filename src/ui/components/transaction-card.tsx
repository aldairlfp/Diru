import type { Transaction } from "@/features/transactions/transaction.types";
import { formatCurrency } from "@/ui/utils/format-currency";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Palette } from "../theme/colors";
import { useTheme } from "../theme/use-theme";
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
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
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

const createStyles = (colors: Palette) =>
  StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  marker: {
    width: 9,
    height: 34,
    borderRadius: 4,
  },
  containerEditing: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySurface,
  },
  actions: {
    flexDirection: "row",
    gap: 18,
    marginTop: 4,
  },
  editText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
  },
  deleteText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: "700",
  },
  incomeMarker: {
    backgroundColor: colors.income,
  },
  expenseMarker: {
    backgroundColor: colors.expense,
  },
  details: {
    flex: 1,
    gap: 4,
  },
  description: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "700",
  },
  meta: {
    color: colors.textMuted,
    fontSize: 12,
  },
  amount: {
    fontSize: 14,
    fontWeight: "800",
  },
  income: {
    color: colors.income,
  },
  expense: {
    color: colors.expense,
  },
});
