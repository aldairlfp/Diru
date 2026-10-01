import type { Account } from "@/features/accounts/account.types";
import type { TransactionType } from "@/features/transactions/transaction.types";
import DateTimePicker from "@expo/ui/community/datetime-picker";
import { useState } from "react";
import {
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { formatDateLabel, fromDateString, toDateString } from "../utils/date";

type TransactionFormProps = {
  accounts: Account[];
  accountId: string;
  type: TransactionType;
  amount: string;
  date: string;
  description: string;
  formError: string | null;
  isSaving: boolean;
  isEditing: boolean;
  onAccountChange: (accountId: string) => void;
  onTypeChange: (type: TransactionType) => void;
  onAmountChange: (amount: string) => void;
  onDateChange: (date: string) => void;
  onDescriptionChange: (description: string) => void;
  onSubmit: () => void;
  onCancelEdit: () => void;
};

export default function TransactionForm({
  accounts,
  accountId,
  type,
  amount,
  date,
  description,
  formError,
  isSaving,
  isEditing,
  onAccountChange,
  onTypeChange,
  onAmountChange,
  onDateChange,
  onDescriptionChange,
  onSubmit,
  onCancelEdit,
}: TransactionFormProps) {
  const isDisabled = isSaving || accounts.length === 0;
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const selectedDate = fromDateString(date);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>
        {isEditing ? "Edit transaction" : "New transaction"}
      </Text>

      <View style={styles.segment}>
        {(["expense", "income"] as const).map((option) => (
          <Pressable
            key={option}
            accessibilityRole="button"
            accessibilityState={{ selected: type === option }}
            onPress={() => onTypeChange(option)}
            style={[
              styles.segmentOption,
              type === option &&
                (option === "income"
                  ? styles.segmentIncomeSelected
                  : styles.segmentExpenseSelected),
            ]}
          >
            <Text
              style={[
                styles.segmentText,
                type === option && styles.segmentTextSelected,
              ]}
            >
              {option === "income" ? "Income" : "Expense"}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Account</Text>
      {accounts.length > 0 ? (
        <View style={styles.accountOptions}>
          {accounts.map((account) => (
            <Pressable
              key={account.id}
              accessibilityRole="button"
              accessibilityState={{ selected: accountId === account.id }}
              onPress={() => onAccountChange(account.id)}
              style={[
                styles.accountOption,
                accountId === account.id && styles.accountOptionSelected,
              ]}
            >
              <Text
                style={[
                  styles.accountOptionText,
                  accountId === account.id && styles.accountOptionTextSelected,
                ]}
              >
                {account.name}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : (
        <Text style={styles.helperText}>
          No accounts yet. Add an account to continue.
        </Text>
      )}

      <View style={styles.inputRow}>
        <View style={styles.amountField}>
          <Text style={styles.label}>Amount</Text>
          <TextInput
            accessibilityLabel="Amount"
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={onAmountChange}
            placeholder="0.00"
            placeholderTextColor="#929b98"
            style={styles.input}
          />
        </View>
        <View style={styles.dateField}>
          <Text style={styles.label}>Date</Text>
          {Platform.OS === "ios" ? (
            <View style={styles.iosDate}>
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="compact"
                accentColor="#176c4c"
                onValueChange={(_event, next) =>
                  onDateChange(toDateString(next))
                }
              />
            </View>
          ) : (
            <>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Transaction date, ${formatDateLabel(selectedDate)}`}
                onPress={() => setIsPickerOpen(true)}
                style={[styles.input, styles.dateButton]}
              >
                <Text style={styles.dateText}>
                  {formatDateLabel(selectedDate)}
                </Text>
              </Pressable>
              {isPickerOpen ? (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  presentation="dialog"
                  accentColor="#176c4c"
                  onValueChange={(_event, next) => {
                    setIsPickerOpen(false);
                    onDateChange(toDateString(next));
                  }}
                  onDismiss={() => setIsPickerOpen(false)}
                />
              ) : null}
            </>
          )}
        </View>
      </View>

      <Text style={styles.label}>Description</Text>
      <TextInput
        accessibilityLabel="Description"
        value={description}
        onChangeText={onDescriptionChange}
        placeholder="What was it for?"
        placeholderTextColor="#929b98"
        style={styles.input}
        returnKeyType="done"
        onSubmitEditing={Keyboard.dismiss}
      />

      {formError ? <Text style={styles.errorText}>{formError}</Text> : null}

      <Pressable
        accessibilityRole="button"
        disabled={isDisabled}
        onPress={onSubmit}
        style={({ pressed }) => [
          styles.saveButton,
          (pressed || isDisabled) && styles.saveButtonMuted,
        ]}
      >
        <Text style={styles.saveButtonText}>
          {isSaving
            ? "Saving..."
            : isEditing
              ? "Save changes"
              : "Save transaction"}
        </Text>
      </Pressable>

      {isEditing ? (
        <Pressable
          accessibilityRole="button"
          disabled={isSaving}
          onPress={onCancelEdit}
          style={styles.cancelButton}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e1e8e4",
    borderRadius: 8,
    backgroundColor: "#ffffff",
  },
  sectionTitle: {
    marginBottom: 14,
    color: "#182522",
    fontSize: 18,
    fontWeight: "700",
  },
  segment: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  segmentOption: {
    minHeight: 42,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#d8e1dc",
    borderRadius: 8,
    backgroundColor: "#f8faf9",
  },
  segmentIncomeSelected: {
    borderColor: "#17734f",
    backgroundColor: "#e8f5ee",
  },
  segmentExpenseSelected: {
    borderColor: "#bd5147",
    backgroundColor: "#fff0ed",
  },
  segmentText: {
    color: "#55645d",
    fontSize: 14,
    fontWeight: "700",
  },
  segmentTextSelected: {
    color: "#182522",
  },
  label: {
    marginBottom: 7,
    color: "#53625b",
    fontSize: 12,
    fontWeight: "700",
  },
  accountOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  accountOption: {
    minHeight: 38,
    justifyContent: "center",
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#d8e1dc",
    borderRadius: 8,
    backgroundColor: "#ffffff",
  },
  accountOptionSelected: {
    borderColor: "#167253",
    backgroundColor: "#e8f2ed",
  },
  accountOptionText: {
    color: "#53625b",
    fontSize: 13,
    fontWeight: "600",
  },
  accountOptionTextSelected: {
    color: "#16583f",
  },
  helperText: {
    marginBottom: 16,
    color: "#68766f",
    fontSize: 13,
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
  },
  amountField: {
    flex: 1,
  },
  dateField: {
    flex: 1.3,
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
  dateButton: {
    justifyContent: "center",
  },
  dateText: {
    color: "#182522",
    fontSize: 15,
  },
  iosDate: {
    minHeight: 46,
    alignItems: "flex-start",
    justifyContent: "center",
    marginBottom: 14,
  },
  errorText: {
    marginBottom: 12,
    color: "#a33d32",
    fontSize: 13,
  },
  saveButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
    borderRadius: 8,
    backgroundColor: "#176c4c",
  },
  saveButtonMuted: {
    opacity: 0.55,
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
  },
  cancelButton: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  cancelButtonText: {
    color: "#53625b",
    fontSize: 14,
    fontWeight: "700",
  },
});
