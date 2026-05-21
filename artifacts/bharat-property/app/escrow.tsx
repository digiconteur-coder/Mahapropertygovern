import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBadge } from "@/components/StatusBadge";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";
import { formatCurrency, formatDate } from "@/utils/format";

export default function EscrowScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { transactions } = useData();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const myTx = transactions.filter((t) => ["initiated", "verifying", "approved"].includes(t.status));
  const totalEscrow = myTx.filter((t) => t.escrowStatus === "held").reduce((s, t) => s + t.amount, 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.navBg, paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Escrow Management</Text>
      </View>

      <View style={[styles.escrowSummary, { backgroundColor: colors.navBg }]}>
        <View style={styles.escrowInfo}>
          <Feather name="lock" size={24} color="#f97316" />
          <View>
            <Text style={styles.escrowLabel}>Total Funds in Escrow</Text>
            <Text style={styles.escrowAmount}>{formatCurrency(totalEscrow)}</Text>
          </View>
        </View>
        <Text style={styles.escrowSub}>{myTx.filter((t) => t.escrowStatus === "held").length} transactions held</Text>
      </View>

      <FlatList
        data={myTx}
        keyExtractor={(t) => t.id}
        renderItem={({ item }) => (
          <View style={[styles.txCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.txHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.bpid, { color: colors.mutedForeground }]}>{item.bpid}</Text>
                <Text style={[styles.addr, { color: colors.foreground }]} numberOfLines={1}>{item.propertyAddress}</Text>
              </View>
              <StatusBadge status={item.escrowStatus} size="sm" />
            </View>
            <View style={styles.parties}>
              <Text style={[styles.partyText, { color: colors.mutedForeground }]}>{item.sellerName}</Text>
              <Feather name="arrow-right" size={14} color={colors.mutedForeground} />
              <Text style={[styles.partyText, { color: colors.mutedForeground }]}>{item.buyerName}</Text>
            </View>
            <View style={styles.footer}>
              <Text style={[styles.amount, { color: colors.primary }]}>{formatCurrency(item.amount)}</Text>
              <Text style={[styles.date, { color: colors.mutedForeground }]}>{formatDate(item.initiatedOn)}</Text>
            </View>
          </View>
        )}
        contentContainerStyle={[styles.list, { paddingBottom: botPad + 24 }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="shield" size={32} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No active escrow accounts</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingBottom: 16 },
  title: { color: "#fff", fontSize: 18, fontWeight: "700" },
  escrowSummary: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  escrowInfo: { flexDirection: "row", alignItems: "center", gap: 12 },
  escrowLabel: { color: "#94a3b8", fontSize: 13 },
  escrowAmount: { color: "#fff", fontSize: 24, fontWeight: "700" },
  escrowSub: { color: "#64748b", fontSize: 12, marginTop: 4 },
  list: { padding: 16, gap: 12 },
  txCard: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 10 },
  txHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  bpid: { fontSize: 10, fontWeight: "600" },
  addr: { fontSize: 14, fontWeight: "600", marginTop: 2 },
  parties: { flexDirection: "row", alignItems: "center", gap: 8 },
  partyText: { fontSize: 13, flex: 1 },
  footer: { flexDirection: "row", justifyContent: "space-between" },
  amount: { fontSize: 16, fontWeight: "700" },
  date: { fontSize: 12 },
  empty: { alignItems: "center", paddingVertical: 60, gap: 10 },
  emptyText: { fontSize: 14 },
});
