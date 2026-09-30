import type { AccountType } from "@/features/accounts/account.types";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

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
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Account name</Text>
      <TextInput
        accessibilityLabel="Account name"
        style={styles.input}
        placeholder="e.g. Main bank"
        placeholderTextColor="#929b98"
        value={name}
        onChangeText={onNameChange}
        autoCapitalize="words"
      />

      <Text style={styles.label}>Initial balance</Text>
      <TextInput
        accessibilityLabel="Initial balance"
        style={styles.input}
        placeholder="0.00"
        placeholderTextColor="#929b98"
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

const styles = StyleSheet.create({
  container: {
    gap: 2,
  },
  label: {
    marginBottom: 7,
    color: "#53625b",
    fontSize: 12,
    fontWeight: "700",
  },
  input: {
    minHeight: 46,
    marginBottom: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#d8e1dc",
    borderRadius: 8,
    backgroundColor: "#ffffff",
    color: "#182522",
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
    borderColor: "#d8e1dc",
    borderRadius: 8,
    backgroundColor: "#ffffff",
  },
  selectedTypeOption: {
    backgroundColor: "#e8f2ed",
    borderColor: "#167253",
  },
  typeOptionText: {
    color: "#53625b",
    fontSize: 13,
  },
  selectedTypeOptionText: {
    color: "#16583f",
    fontWeight: "700",
  },
  submitButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
    borderRadius: 8,
    backgroundColor: "#176c4c",
  },
  submitButtonMuted: {
    opacity: 0.55,
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
  },
  errorText: {
    marginTop: 10,
    color: "#a33d32",
    fontSize: 13,
  },
});
