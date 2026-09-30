import * as SQLite from "expo-sqlite";

export const DATABASE_NAME = "diru.db";

export function openDatabase() {
  return SQLite.openDatabaseAsync(DATABASE_NAME);
}
