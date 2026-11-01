import { CategoryRepository } from "@/features/categories/category.repository";
import { CategoryService } from "@/features/categories/category.service";
import type {
  Category,
  CategoryType,
} from "@/features/categories/category.types";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { Palette } from "../theme/colors";
import { useTheme } from "../theme/use-theme";

const SECTIONS: { type: CategoryType; title: string }[] = [
  { type: "expense", title: "Expense categories" },
  { type: "income", title: "Income categories" },
];

export default function CategoriesScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const db = useSQLiteContext();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState<CategoryType>("expense");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadCategories = useCallback(async () => {
    try {
      setCategories(await new CategoryService(new CategoryRepository(db)).getAll());
      setLoadError(null);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Could not load categories.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [db]);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  async function handleAdd() {
    setFormError(null);
    setIsSaving(true);
    try {
      await new CategoryService(new CategoryRepository(db)).create({
        name,
        type,
      });
      setName("");
      Keyboard.dismiss();
      await loadCategories();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Could not add category.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  function requestDelete(category: Category) {
    Alert.alert(
      "Delete category?",
      `"${category.name}" will be removed. Transactions using it keep their data but lose the category.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            void deleteCategory(category);
          },
        },
      ],
    );
  }

  async function deleteCategory(category: Category) {
    try {
      await new CategoryService(new CategoryRepository(db)).delete(category.id);
      await loadCategories();
    } catch (error) {
      Alert.alert(
        "Could not delete",
        error instanceof Error ? error.message : "Something went wrong.",
      );
    }
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.kicker}>DIRU / ORGANISE</Text>
      <Text style={styles.title}>Categories</Text>
      <Text style={styles.intro}>
        Group your income and spending. Pick a category when you add a
        transaction.
      </Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Add category</Text>

        <View style={styles.segment}>
          {(["expense", "income"] as const).map((option) => (
            <Pressable
              key={option}
              accessibilityRole="button"
              accessibilityState={{ selected: type === option }}
              onPress={() => setType(option)}
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

        <TextInput
          accessibilityLabel="Category name"
          value={name}
          onChangeText={setName}
          placeholder="e.g. Groceries"
          placeholderTextColor={colors.placeholder}
          autoCapitalize="words"
          maxLength={24}
          returnKeyType="done"
          onSubmitEditing={handleAdd}
          style={styles.input}
        />

        {formError ? <Text style={styles.errorText}>{formError}</Text> : null}

        <Pressable
          accessibilityRole="button"
          disabled={isSaving || !name.trim()}
          onPress={handleAdd}
          style={({ pressed }) => [
            styles.primaryButton,
            (pressed || isSaving || !name.trim()) && styles.muted,
          ]}
        >
          <Text style={styles.primaryButtonText}>
            {isSaving ? "Adding..." : "Add category"}
          </Text>
        </Pressable>
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={styles.loading} />
      ) : loadError ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{loadError}</Text>
          <Pressable onPress={loadCategories} accessibilityRole="button">
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        SECTIONS.map((section) => {
          const items = categories.filter(
            (category) => category.type === section.type,
          );
          return (
            <View key={section.type} style={styles.list}>
              <Text style={styles.listTitle}>{section.title}</Text>
              {items.length === 0 ? (
                <Text style={styles.emptyText}>Nothing here yet.</Text>
              ) : (
                items.map((category) => (
                  <View key={category.id} style={styles.row}>
                    <Text style={styles.rowName} numberOfLines={1}>
                      {category.icon ? `${category.icon}  ` : ""}
                      {category.name}
                    </Text>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Delete ${category.name}`}
                      hitSlop={8}
                      onPress={() => requestDelete(category)}
                    >
                      <Text style={styles.deleteText}>Delete</Text>
                    </Pressable>
                  </View>
                ))
              )}
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const createStyles = (colors: Palette) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      paddingHorizontal: 20,
      paddingTop: 18,
      paddingBottom: 40,
      backgroundColor: colors.background,
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
    intro: {
      marginTop: 10,
      marginBottom: 20,
      color: colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
    },
    card: {
      marginBottom: 24,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      backgroundColor: colors.surface,
    },
    sectionTitle: {
      marginBottom: 14,
      color: colors.textPrimary,
      fontSize: 18,
      fontWeight: "800",
    },
    segment: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 14,
    },
    segmentOption: {
      minHeight: 42,
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.borderStrong,
      borderRadius: 8,
      backgroundColor: colors.surfaceMuted,
    },
    segmentIncomeSelected: {
      borderColor: colors.income,
      backgroundColor: colors.incomeSurface,
    },
    segmentExpenseSelected: {
      borderColor: colors.expense,
      backgroundColor: colors.expenseSurface,
    },
    segmentText: {
      color: colors.textSecondary,
      fontSize: 14,
      fontWeight: "700",
    },
    segmentTextSelected: {
      color: colors.textPrimary,
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
    errorText: {
      marginBottom: 12,
      color: colors.danger,
      fontSize: 13,
    },
    primaryButton: {
      minHeight: 48,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 8,
      backgroundColor: colors.primary,
    },
    primaryButtonText: {
      color: colors.onPrimary,
      fontSize: 15,
      fontWeight: "800",
    },
    muted: {
      opacity: 0.55,
    },
    loading: {
      marginVertical: 24,
    },
    errorBanner: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.dangerBorder,
      borderRadius: 8,
      backgroundColor: colors.dangerSurface,
    },
    errorBannerText: {
      flex: 1,
      color: colors.danger,
      fontSize: 13,
    },
    retryText: {
      color: colors.danger,
      fontSize: 14,
      fontWeight: "700",
    },
    list: {
      marginBottom: 20,
    },
    listTitle: {
      marginBottom: 10,
      color: colors.textPrimary,
      fontSize: 16,
      fontWeight: "700",
    },
    emptyText: {
      color: colors.textSecondary,
      fontSize: 14,
    },
    row: {
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
    rowName: {
      flex: 1,
      color: colors.textPrimary,
      fontSize: 15,
      fontWeight: "600",
    },
    deleteText: {
      color: colors.danger,
      fontSize: 13,
      fontWeight: "700",
    },
  });
