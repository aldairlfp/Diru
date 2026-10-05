import type { AccountType } from "@/features/accounts/account.types";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { Palette } from "../theme/colors";
import { useTheme } from "../theme/use-theme";

type AccountFormProps = {
  name: string;
  initialBalance: string;
  type: AccountType;
  formError: string | null;
  isSaving: boolean;
  isDisabled: boolean;
  accountTypes: AccountType[];
  onNameChange: (value: string) => void;
  onBalanceChange: (value: string) => void;
  onTypeChange: (value: AccountType) => void;
  onSubmit: () => void;
};

export default function AccountForm({
  name,
  initialBalance,
  type,
  formError,
  isSaving,
  isDisabled,
  accountTypes,
  onNameChange,
  onBalanceChange,
  onTypeChange,
  onSubmit,
}: AccountFormProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Account name</Text>
      <TextInput
        accessibilityLabel="Account name"
        style={styles.input}
        placeholder="e.g. Main bank"
        placeholderTextColor={colors.placeholder}
        value={name}
        onChangeText={onNameChange}
        autoCapitalize="words"
      />

      <Text style={styles.label}>Initial balance</Text>
      <TextInput
        accessibilityLabel="Initial balance"
        style={styles.input}
        placeholder="0.00"
        placeholderTextColor={colors.placeholder}
        value={initialBalance}
        onChangeText={onBalanceChange}
        keyboardType="decimal-pad"
      />

      <Text style={styles.label}>Account type</Text>
      <View style={styles.typeOptions}>
        {accountTypes.map((accountType) => (
          <Pressable
            key={accountType}
            accessibilityRole="button"
            accessibilityState={{ selected: type === accountType }}
            onPress={() => onTypeChange(accountType)}
            style={[
              styles.typeOption,
              type === accountType && styles.selectedTypeOption,
            ]}
          >
            <Text
              style={[
                styles.typeOptionText,
                type === accountType && styles.selectedTypeOptionText,
              ]}
            >
              {accountType}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={onSubmit}
        disabled={isDisabled}
        style={({ pressed }) => [
          styles.submitButton,
          (pressed || isDisabled) && styles.submitButtonMuted,
        ]}
      >
        <Text style={styles.submitButtonText}>
          {isSaving ? "Adding..." : "Add account"}
        </Text>
      </Pressable>

      {formError ? <Text style={styles.errorText}>{formError}</Text> : null}
    </View>
  );
}

const createStyles = (colors: Palette) =>
  StyleSheet.create({
  container: {
    gap: 2,
  },
  label: {
    marginBottom: 7,
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "700",
  },
  input: {
    minHeight: 46,
    marginBottom: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 8,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    fontSize: 15,
  },
  typeOptions: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  typeOption: {
    minHeight: 38,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  selectedTypeOption: {
    backgroundColor: colors.primarySurface,
    borderColor: colors.primary,
  },
  typeOptionText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  selectedTypeOptionText: {
    color: colors.onPrimarySurface,
    fontWeight: "700",
  },
  submitButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  submitButtonMuted: {
    opacity: 0.55,
  },
  submitButtonText: {
    color: colors.onPrimary,
    fontSize: 15,
    fontWeight: "800",
  },
  errorText: {
    marginTop: 10,
    color: colors.danger,
    fontSize: 13,
  },
});
