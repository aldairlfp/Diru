import { BackupService, parseBackup } from "@/features/backup/backup.service";
import { useSQLiteContext } from "expo-sqlite";
import { useState } from "react";
import {
  Alert,
  Keyboard,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type Notice = { kind: "success" | "error"; message: string };

export default function BackupScreen() {
  const db = useSQLiteContext();
  const [isExporting, setIsExporting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [backupText, setBackupText] = useState("");
  const [notice, setNotice] = useState<Notice | null>(null);

  async function handleExport() {
    setNotice(null);
    setIsExporting(true);
    try {
      const { json, accountCount, transactionCount } = await new BackupService(
        db,
      ).exportBackup();
      const result = await Share.share({ title: "Diru backup", message: json });

      if (result.action === Share.sharedAction) {
        setNotice({
          kind: "success",
          message: `Shared ${accountCount} accounts and ${transactionCount} transactions.`,
        });
      }
    } catch (error) {
      setNotice({
        kind: "error",
        message:
          error instanceof Error ? error.message : "Could not export backup.",
      });
    } finally {
      setIsExporting(false);
    }
  }

  function handleRestore() {
    setNotice(null);

    let backup;
    try {
      backup = parseBackup(backupText.trim());
    } catch (error) {
      setNotice({
        kind: "error",
        message:
          error instanceof Error ? error.message : "Could not read the backup.",
      });
      return;
    }

    Alert.alert(
      "Replace all data?",
      `This deletes everything in the app and restores ${backup.accounts.length} accounts and ${backup.transactions.length} transactions.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Restore",
          style: "destructive",
          onPress: () => {
            void restore(backup);
          },
        },
      ],
    );
  }

  async function restore(backup: ReturnType<typeof parseBackup>) {
    setIsRestoring(true);
    try {
      await new BackupService(db).restoreBackup(backup);
      setBackupText("");
      Keyboard.dismiss();
      setNotice({
        kind: "success",
        message: `Restored ${backup.accounts.length} accounts and ${backup.transactions.length} transactions.`,
      });
    } catch (error) {
      setNotice({
        kind: "error",
        message:
          error instanceof Error
            ? `Restore failed, your data was not changed. ${error.message}`
            : "Restore failed, your data was not changed.",
      });
    } finally {
      setIsRestoring(false);
    }
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.kicker}>DIRU / DATA</Text>
      <Text style={styles.title}>Backup</Text>
      <Text style={styles.intro}>
        Your data only lives on this phone. Export a backup regularly and keep
        it somewhere safe, like your email or a notes app.
      </Text>

      {notice ? (
        <View
          style={[
            styles.notice,
            notice.kind === "success"
              ? styles.noticeSuccess
              : styles.noticeError,
          ]}
        >
          <Text
            style={
              notice.kind === "success" ? styles.successText : styles.errorText
            }
          >
            {notice.message}
          </Text>
        </View>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Export</Text>
        <Text style={styles.cardText}>
          Opens the share sheet with your accounts and transactions as text.
          Send it to yourself or save it in a note.
        </Text>
        <Pressable
          accessibilityRole="button"
          disabled={isExporting}
          onPress={handleExport}
          style={({ pressed }) => [
            styles.primaryButton,
            (pressed || isExporting) && styles.muted,
          ]}
        >
          <Text style={styles.primaryButtonText}>
            {isExporting ? "Preparing..." : "Export backup"}
          </Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Restore</Text>
        <Text style={styles.cardText}>
          Paste a backup you exported before. Restoring replaces everything
          currently in the app.
        </Text>
        <TextInput
          accessibilityLabel="Backup text"
          multiline
          value={backupText}
          onChangeText={setBackupText}
          placeholder="Paste backup text here"
          placeholderTextColor="#929b98"
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
        />
        <Pressable
          accessibilityRole="button"
          disabled={isRestoring || !backupText.trim()}
          onPress={handleRestore}
          style={({ pressed }) => [
            styles.dangerButton,
            (pressed || isRestoring || !backupText.trim()) && styles.muted,
          ]}
        >
          <Text style={styles.dangerButtonText}>
            {isRestoring ? "Restoring..." : "Restore backup"}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 40,
    backgroundColor: "#f3f6f4",
  },
  kicker: {
    marginBottom: 4,
    color: "#167253",
    fontSize: 11,
    fontWeight: "800",
  },
  title: {
    color: "#182522",
    fontSize: 28,
    fontWeight: "800",
  },
  intro: {
    marginTop: 10,
    marginBottom: 20,
    color: "#53625b",
    fontSize: 14,
    lineHeight: 20,
  },
  notice: {
    marginBottom: 16,
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  noticeSuccess: {
    borderColor: "#bfdccc",
    backgroundColor: "#eaf6ef",
  },
  noticeError: {
    borderColor: "#edc2bd",
    backgroundColor: "#fff4f2",
  },
  successText: {
    color: "#16583f",
    fontSize: 13,
  },
  errorText: {
    color: "#a33d32",
    fontSize: 13,
  },
  card: {
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e1e8e4",
    borderRadius: 8,
    backgroundColor: "#ffffff",
  },
  sectionTitle: {
    marginBottom: 6,
    color: "#182522",
    fontSize: 18,
    fontWeight: "800",
  },
  cardText: {
    marginBottom: 14,
    color: "#68766f",
    fontSize: 13,
    lineHeight: 19,
  },
  input: {
    minHeight: 110,
    maxHeight: 200,
    marginBottom: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#d8e1dc",
    borderRadius: 8,
    backgroundColor: "#ffffff",
    color: "#182522",
    fontSize: 13,
    textAlignVertical: "top",
  },
  primaryButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#176c4c",
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
  },
  dangerButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#fff0ed",
    borderWidth: 1,
    borderColor: "#edc2bd",
  },
  dangerButtonText: {
    color: "#a33d32",
    fontSize: 15,
    fontWeight: "800",
  },
  muted: {
    opacity: 0.55,
  },
});
