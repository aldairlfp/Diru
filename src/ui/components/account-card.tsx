import type { Account } from "@/features/accounts/account.types";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { formatCurrency } from "../utils/format-currency";

const accountTypeLabels: Record<Account["type"], string> = {
  bank: "Bank account",
  cash: "Cash",
  savings: "Savings",
  credit: "Credit card",
};

type AccountCardProps = {
  account: Account & { balance: number };
  isArchiving: boolean;
  onArchive: (accountId: string) => void;
};

export default function AccountCard({
  account,
  isArchiving,
  onArchive,
}: AccountCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.details}>
        <View style={styles.identity}>
          <View style={styles.typeMark}>
            <Text style={styles.typeMarkText}>
              {accountTypeLabels[account.type].slice(0, 1)}
            </Text>
          </View>
          <View style={styles.nameGroup}>
            <Text style={styles.name} numberOfLines={1}>
              {account.name}
            </Text>
            <Text style={styles.type}>{accountTypeLabels[account.type]}</Text>
          </View>
        </View>
        <Text style={styles.balance}>
          {formatCurrency(account.balance, account.currency)}
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Archive ${account.name}`}
        style={({ pressed }) => [
          styles.archiveButton,
          pressed && styles.archiveButtonPressed,
        ]}
        onPress={() => onArchive(account.id)}
        disabled={isArchiving}
      >
        <Text style={styles.archiveButtonText}>
          {isArchiving ? "Archiving..." : "Archive"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e5ebe7",
    borderRadius: 8,
    backgroundColor: "#ffffff",
  },
  details: {
    flex: 1,
    gap: 10,
  },
  identity: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  typeMark: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#e8f2ed",
  },
  typeMarkText: {
    color: "#176c4c",
    fontSize: 15,
    fontWeight: "800",
  },
  nameGroup: {
    flex: 1,
  },
  name: {
    color: "#1d2c26",
    fontSize: 15,
    fontWeight: "700",
  },
  type: {
    marginTop: 2,
    color: "#77847d",
    fontSize: 12,
  },
  balance: {
    color: "#1d2c26",
    fontSize: 15,
    fontWeight: "800",
  },
  archiveButton: {
    minHeight: 40,
    justifyContent: "center",
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#fff0ed",
  },
  archiveButtonPressed: {
    opacity: 0.7,
  },
  archiveButtonText: {
    color: "#a33d32",
    fontSize: 12,
    fontWeight: "700",
  },
});
