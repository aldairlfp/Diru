import { initializeDatabase } from "@/db/schema";
import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { StatusBar } from "expo-status-bar";
import { Suspense } from "react";
import { ActivityIndicator, View } from "react-native";
import { useTheme } from "../ui/theme/use-theme";

function DatabaseLoading() {
  const { colors } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.background,
      }}
    >
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}

export default function Layout() {
  const { colors } = useTheme();

  return (
    <Suspense fallback={<DatabaseLoading />}>
      <SQLiteProvider
        databaseName="diru.db"
        onInit={initializeDatabase}
        useSuspense
      >
        <StatusBar style="auto" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.background },
            headerShadowVisible: false,
            headerTintColor: colors.primary,
            headerTitleStyle: {
              color: colors.textPrimary,
              fontWeight: "700",
            },
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="index" options={{ title: "Diru" }} />
          <Stack.Screen name="accounts" options={{ title: "Accounts" }} />
          <Stack.Screen name="backup" options={{ title: "Backup" }} />
        </Stack>
      </SQLiteProvider>
    </Suspense>
  );
}
