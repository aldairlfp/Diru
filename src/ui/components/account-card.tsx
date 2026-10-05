import type { Account } from "@/features/accounts/account.types";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Palette } from "../theme/colors";
import { useTheme } from "../theme/use-theme";
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
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

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

const createStyles = (colors: Palette) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      marginBottom: 8,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      backgroundColor: colors.surface,
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
      backgroundColor: colors.typeMarkBackground,
    },
    typeMarkText: {
      color: colors.typeMarkText,
      fontSize: 15,
      fontWeight: "800",
    },
    nameGroup: {
      flex: 1,
    },
    name: {
      color: colors.textPrimary,
      fontSize: 15,
      fontWeight: "700",
    },
    type: {
      marginTop: 2,
      color: colors.textSecondary,
      fontSize: 12,
    },
    balance: {
      color: colors.textPrimary,
      fontSize: 15,
      fontWeight: "800",
    },
    archiveButton: {
      minHeight: 40,
      justifyContent: "center",
      paddingHorizontal: 10,
      borderRadius: 8,
      backgroundColor: colors.archiveButtonBackground,
    },
    archiveButtonPressed: {
      opacity: 0.7,
    },
    archiveButtonText: {
      color: colors.archiveButtonText,
      fontSize: 12,
      fontWeight: "700",
    },
  });
