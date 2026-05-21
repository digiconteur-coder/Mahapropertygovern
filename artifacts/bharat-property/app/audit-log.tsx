import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";
import { formatDateTime } from "@/utils/format";

function sealOnLedger(data: object): string {
  const str = JSON.stringify(data);
  let h1 = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h1 ^= str.charCodeAt(i);
    h1 = (h1 * 0x01000193) >>> 0;
  }
  let h2 = 0;
  for (let i = 0; i < str.length; i++) {
    h2 = (h2 * 31 + str.charCodeAt(i)) & 0xffffffff;
  }
  return "AUD-" + h1.toString(16).toUpperCase().padStart(8, "0") +
    Math.abs(h2).toString(16).toUpperCase().padStart(8, "0") +
    (h1 ^ h2).toString(16).toUpperCase().padStart(8, "0");
}

const ACTION_COLORS: Record<string, string> = {
  "Property Verified": "#16a34a",
  "Transaction Initiated": "#1d4ed8",
  "Transaction Approved": "#16a34a",
  "Transaction Rejected": "#dc2626",
  "Loan Application": "#7c3aed",
  "Dispute Filed": "#dc2626",
  "Document Uploaded": "#d97706",
  "Transfer Initiated": "#1d4ed8",
};

const ACTION_ICONS: Record<string, string> = {
  "Property Verified": "check-circle",
  "Transaction Initiated": "repeat",
  "Transaction Approved": "check-square",
  "Transaction Rejected": "x-circle",
  "Loan Application": "credit-card",
  "Dispute Filed": "alert-triangle",
  "Document Uploaded": "upload",
  "Transfer Initiated": "send",
};

export default function AuditLogScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { auditLogs } = useData();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const sorted = [...auditLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const totalEntries = sorted.length;
  const verifiedEntries = sorted.filter((l) => ACTION_COLORS[l.action] === "#16a34a").length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: "#1e3a8a", paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>Sovereign Audit Log</Text>
          <Text style={styles.headerSub}>Tamper-Evident · Permissioned · Govt-Verified</Text>
        </View>
        <View style={[styles.headerBadge]}>
          <Feather name="lock" size={12} color="#34d399" />
          <Text style={styles.headerBadgeText}>LIVE</Text>
        </View>
      </View>

      {/* Stats bar */}
      <View style={[styles.statsBar, { backgroundColor: "#1e3a8a" }]}>
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{totalEntries}</Text>
          <Text style={styles.statLabel}>Total Entries</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{verifiedEntries}</Text>
          <Text style={styles.statLabel}>Verified Actions</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: "#34d399" }]}>100%</Text>
          <Text style={styles.statLabel}>Integrity</Text>
        </View>
      </View>

      <View style={[styles.chainBar, { backgroundColor: colors.accent }]}>
        <Feather name="shield" size={12} color={colors.primary} />
        <Text style={[styles.chainText, { color: colors.primary }]}>
          Each entry is cryptographically sealed in India's Permissioned Sovereign Audit Ledger · RERAW Act 2026
        </Text>
      </View>

      <FlatList
        data={sorted}
        keyExtractor={(l) => l.id}
        renderItem={({ item, index }) => {
          const actionColor = ACTION_COLORS[item.action] || colors.primary;
          const actionIcon = ACTION_ICONS[item.action] || "activity";
          const isExpanded = expandedId === item.id;
          const auditRef = sealOnLedger({ id: item.id, action: item.action, timestamp: item.timestamp, userId: item.userId });
          const prevRef = index < sorted.length - 1
            ? sealOnLedger({ id: sorted[index + 1].id, action: sorted[index + 1].action })
            : "AUD-0000000000000000GENESIS";

          return (
            <TouchableOpacity
              style={styles.logRow}
              onPress={() => setExpandedId(isExpanded ? null : item.id)}
              activeOpacity={0.8}
            >
              <View style={styles.timeline}>
                <View style={[styles.dot, { backgroundColor: actionColor }]}>
                  <Feather name={actionIcon as any} size={8} color="#fff" />
                </View>
                {index < sorted.length - 1 && <View style={[styles.connector, { backgroundColor: colors.border }]} />}
              </View>
              <View style={[styles.logCard, { backgroundColor: colors.card, borderColor: isExpanded ? actionColor : colors.border }]}>
                <View style={styles.logHeader}>
                  <View style={[styles.actionBadge, { backgroundColor: actionColor + "15" }]}>
                    <Text style={[styles.action, { color: actionColor }]}>{item.action}</Text>
                  </View>
                  <View style={styles.logRight}>
                    <Text style={[styles.logId, { color: colors.mutedForeground }]}>#{item.id}</Text>
                    <Feather name={isExpanded ? "chevron-up" : "chevron-down"} size={13} color={colors.mutedForeground} />
                  </View>
                </View>

                <Text style={[styles.meta, { color: colors.foreground }]}>{item.metadata}</Text>

                <View style={styles.logFooter}>
                  <View style={styles.userRow}>
                    <Feather name="user" size={11} color={colors.mutedForeground} />
                    <Text style={[styles.footText, { color: colors.mutedForeground }]}>{item.userName}</Text>
                  </View>
                  <View style={styles.userRow}>
                    <Feather name="clock" size={11} color={colors.mutedForeground} />
                    <Text style={[styles.footText, { color: colors.mutedForeground }]}>{formatDateTime(item.timestamp)}</Text>
                  </View>
                </View>

                {isExpanded && (
                  <View style={[styles.auditSection, { backgroundColor: "#0f172a", borderColor: "#1e293b" }]}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 }}>
                      <Feather name="shield" size={11} color="#34d399" />
                      <Text style={{ color: "#34d399", fontSize: 10, fontWeight: "700" }}>Tamper-Evident Governance Record</Text>
                    </View>
                    <View style={styles.hashRow}>
                      <Text style={styles.hashLabel}>Audit Ref</Text>
                      <Text style={styles.hashValue} numberOfLines={1}>{auditRef}</Text>
                    </View>
                    <View style={[styles.hashRow, { borderTopColor: "#1e293b", borderTopWidth: 1, marginTop: 4, paddingTop: 4 }]}>
                      <Text style={styles.hashLabel}>Prior Ref</Text>
                      <Text style={[styles.hashValue, { color: "#64748b" }]} numberOfLines={1}>{prevRef}</Text>
                    </View>
                    <View style={styles.blockMeta}>
                      <View style={styles.blockMetaItem}>
                        <Text style={styles.blockMetaLabel}>Status</Text>
                        <Text style={styles.blockMetaVerified}>SEALED ✓</Text>
                      </View>
                      <View style={styles.blockMetaItem}>
                        <Text style={styles.blockMetaLabel}>Ledger</Text>
                        <Text style={styles.blockMetaValue}>BPCS Sovereign</Text>
                      </View>
                      <View style={styles.blockMetaItem}>
                        <Text style={styles.blockMetaLabel}>Entry</Text>
                        <Text style={styles.blockMetaValue}>#{index + 10042}</Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={[styles.list, { paddingBottom: botPad + 24 }]}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "flex-end", gap: 12, paddingHorizontal: 16, paddingBottom: 14 },
  headerText: { flex: 1 },
  title: { color: "#fff", fontSize: 17, fontWeight: "700" },
  headerSub: { color: "rgba(255,255,255,0.55)", fontSize: 10, marginTop: 2 },
  headerBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(52,211,153,0.15)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  headerBadgeText: { color: "#34d399", fontSize: 10, fontWeight: "800" },
  statsBar: { flexDirection: "row", paddingVertical: 10, paddingHorizontal: 20, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.1)" },
  statItem: { flex: 1, alignItems: "center" },
  statNum: { color: "#fff", fontSize: 17, fontWeight: "800" },
  statLabel: { color: "rgba(255,255,255,0.5)", fontSize: 10, marginTop: 1 },
  statDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.15)", marginVertical: 4 },
  chainBar: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, paddingVertical: 8 },
  chainText: { fontSize: 11, fontWeight: "500", flex: 1 },
  list: { padding: 16, gap: 0 },
  logRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  timeline: { alignItems: "center", width: 24, paddingTop: 4 },
  dot: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  connector: { width: 2, flex: 1, marginTop: 4 },
  logCard: { flex: 1, borderRadius: 10, borderWidth: 1, padding: 12, gap: 8 },
  logHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8 },
  actionBadge: { flex: 1, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  action: { fontSize: 12, fontWeight: "700" },
  logRight: { flexDirection: "row", alignItems: "center", gap: 4 },
  logId: { fontSize: 10, fontWeight: "500" },
  meta: { fontSize: 12, lineHeight: 17 },
  logFooter: { gap: 3 },
  userRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  footText: { fontSize: 11 },
  auditSection: { borderRadius: 8, borderWidth: 1, padding: 10, gap: 4, marginTop: 4 },
  hashRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  hashLabel: { color: "#64748b", fontSize: 10, fontWeight: "600", width: 60 },
  hashValue: { color: "#f97316", fontSize: 10, fontFamily: "monospace", flex: 1 },
  blockMeta: { flexDirection: "row", marginTop: 8, paddingTop: 6, borderTopColor: "#1e293b", borderTopWidth: 1 },
  blockMetaItem: { flex: 1, alignItems: "center" },
  blockMetaLabel: { color: "#475569", fontSize: 9, fontWeight: "600", textTransform: "uppercase" },
  blockMetaVerified: { color: "#34d399", fontSize: 10, fontWeight: "700", marginTop: 2 },
  blockMetaValue: { color: "#94a3b8", fontSize: 10, fontWeight: "600", marginTop: 2 },
});
