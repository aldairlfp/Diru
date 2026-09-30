import { initializeDatabase } from "@/db/schema";
import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { StatusBar } from "expo-status-bar";
import { Suspense } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

function DatabaseLoading() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator color="#176c4c" />
    </View>
  );
}

export default function Layout() {
  return (
    <Suspense fallback={<DatabaseLoading />}>
      <SQLiteProvider
        databaseName="diru.db"
        onInit={initializeDatabase}
        useSuspense
      >
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: "#f3f6f4" },
            headerShadowVisible: false,
            headerTintColor: "#176c4c",
            headerTitleStyle: {
              color: "#182522",
              fontWeight: "700",
            },
            contentStyle: { backgroundColor: "#f3f6f4" },
          }}
        >
          <Stack.Screen name="index" options={{ title: "Diru" }} />
          <Stack.Screen name="accounts" options={{ title: "Accounts" }} />
        </Stack>
      </SQLiteProvider>
    </Suspense>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f6f4",
  },
});
