import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBadge } from "@/components/StatusBadge";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";
import { formatCurrency, formatDate } from "@/utils/format";

export default function ApprovalsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { transactions, updateTransactionStatus, addAuditLog } = useData();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const pending = transactions.filter((t) => t.status === "verifying");
  const all = transactions.filter((t) => ["verifying", "approved", "completed", "rejected"].includes(t.status));

  const handleApprove = (txId: string, bpid: string) => {
    Alert.alert("Approve Transaction", `Approve the transfer of ${bpid}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Approve",
        onPress: () => {
          updateTransactionStatus(txId, "approved");
          addAuditLog({
            action: "Transaction Approved",
            userId: user?.id || "",
            userName: user?.name || "",
            timestamp: new Date().toISOString(),
            metadata: `Transaction ${txId} approved for ${bpid}`,
          });
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Alert.alert("Approved", "Transaction has been approved and will proceed to completion.");
        },
      },
    ]);
  };

  const handleReject = (txId: string, bpid: string) => {
    Alert.alert("Reject Transaction", `Reject the transfer of ${bpid}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reject",
        style: "destructive",
        onPress: () => {
          updateTransactionStatus(txId, "rejected");
          addAuditLog({
            action: "Transaction Rejected",
            userId: user?.id || "",
            userName: user?.name || "",
            timestamp: new Date().toISOString(),
            metadata: `Transaction ${txId} rejected for ${bpid}`,
          });
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          Alert.alert("Rejected", "Transaction has been rejected.");
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.navBg, paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction Approvals</Text>
        {pending.length > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{pending.length}</Text>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={[styles.body, { paddingBottom: botPad + 24 }]} showsVerticalScrollIndicator={false}>
        {pending.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Pending Approval</Text>
            {pending.map((tx) => (
              <View key={tx.id} style={[styles.txCard, { backgroundColor: "#fef9c3", borderColor: "#fef08a" }]}>
                <View style={styles.txHeader}>
                  <View>
                    <Text style={[styles.bpid, { color: "#a16207" }]}>{tx.bpid}</Text>
                    <Text style={[styles.addr, { color: "#1e293b" }]} numberOfLines={1}>{tx.propertyAddress}</Text>
                  </View>
                  <Text style={[styles.amount, { color: "#1e40af" }]}>{formatCurrency(tx.amount)}</Text>
                </View>

                <View style={styles.parties}>
                  <View style={styles.party}>
                    <Text style={styles.partyLabel}>Seller</Text>
                    <Text style={[styles.partyName, { color: "#0f172a" }]}>{tx.sellerName}</Text>
                  </View>
                  <Feather name="arrow-right" size={14} color="#64748b" />
                  <View style={styles.party}>
                    <Text style={styles.partyLabel}>Buyer</Text>
                    <Text style={[styles.partyName, { color: "#0f172a" }]}>{tx.buyerName}</Text>
                  </View>
                </View>

                <View style={styles.aiRisk}>
                  <View style={[styles.riskDot, { backgroundColor: "#16a34a" }]} />
                  <Text style={styles.riskText}>AI Verification: Low Risk (Score: 92/100)</Text>
                </View>

                <Text style={styles.date}>Initiated: {formatDate(tx.initiatedOn)}</Text>

                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.rejectBtn}
                    onPress={() => handleReject(tx.id, tx.bpid)}
                  >
                    <Feather name="x" size={16} color="#dc2626" />
                    <Text style={styles.rejectText}>Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.approveBtn}
                    onPress={() => handleApprove(tx.id, tx.bpid)}
                  >
                    <Feather name="check" size={16} color="#fff" />
                    <Text style={styles.approveText}>Approve</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>All Transactions</Text>
        {all.map((tx) => (
          <View key={tx.id} style={[styles.txCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.txHeader}>
              <View>
                <Text style={[styles.bpid, { color: colors.mutedForeground }]}>{tx.bpid}</Text>
                <Text style={[styles.addr, { color: colors.foreground }]} numberOfLines={1}>{tx.propertyAddress}</Text>
              </View>
              <StatusBadge status={tx.status} size="sm" />
            </View>
            <Text style={[styles.date, { color: colors.mutedForeground }]}>
              {tx.sellerName} → {tx.buyerName}
            </Text>
            <Text style={[styles.amount, { color: colors.primary, alignSelf: "flex-start" }]}>{formatCurrency(tx.amount)}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "700", flex: 1 },
  badge: { backgroundColor: "#f97316", borderRadius: 12, minWidth: 24, height: 24, alignItems: "center", justifyContent: "center", paddingHorizontal: 6 },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  body: { padding: 16, gap: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginTop: 4, marginBottom: 4 },
  txCard: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 10 },
  txHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  bpid: { fontSize: 10, fontWeight: "700", letterSpacing: 0.5 },
  addr: { fontSize: 14, fontWeight: "600", marginTop: 2 },
  amount: { fontSize: 16, fontWeight: "700" },
  parties: { flexDirection: "row", alignItems: "center", gap: 8 },
  party: { flex: 1, gap: 2 },
  partyLabel: { fontSize: 10, color: "#64748b", fontWeight: "600", textTransform: "uppercase" },
  partyName: { fontSize: 13, fontWeight: "600" },
  aiRisk: { flexDirection: "row", alignItems: "center", gap: 6 },
  riskDot: { width: 8, height: 8, borderRadius: 4 },
  riskText: { fontSize: 12, color: "#16a34a", fontWeight: "600" },
  date: { fontSize: 12, color: "#64748b" },
  actions: { flexDirection: "row", gap: 10 },
  rejectBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#dc2626",
    borderRadius: 8,
    paddingVertical: 10,
  },
  rejectText: { color: "#dc2626", fontWeight: "600" },
  approveBtn: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#16a34a",
    borderRadius: 8,
    paddingVertical: 10,
  },
  approveText: { color: "#fff", fontWeight: "700" },
});
