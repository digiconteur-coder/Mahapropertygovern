import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

// Source hierarchy — 1 = highest authority
const SOURCE_HIERARCHY = [
  { rank: 1, name: "Registrar Record", short: "Registrar", color: "#16a34a", icon: "shield", desc: "Final legal authority. Registered sale deeds, mutations.", tag: "FINAL AUTHORITY" },
  { rank: 2, name: "Court Orders", short: "Court", color: "#1d4ed8", icon: "anchor", desc: "Overrides everything including registrar in legal disputes.", tag: "OVERRIDES ALL" },
  { rank: 3, name: "Govt Local Records", short: "Talathi/RoR", color: "#0891b2", icon: "map", desc: "7/12 extracts, Talathi records, city survey data.", tag: "STATE AUTHORITY" },
  { rank: 4, name: "Developer Records", short: "Developer", color: "#7c3aed", icon: "home", desc: "RERA-verified builder data, allotment letters, OC.", tag: "VERIFIED BUILDER" },
  { rank: 5, name: "Society Records", short: "Society", color: "#d97706", icon: "users", desc: "Housing society share certificates, NOC letters.", tag: "SOCIETY" },
  { rank: 6, name: "Private Data Providers", short: "Private DB", color: "#f97316", icon: "database", desc: "Landed, PropTiger, Spydra — aggregated market data.", tag: "THIRD PARTY" },
  { rank: 7, name: "User Uploads", short: "User", color: "#64748b", icon: "upload", desc: "Self-uploaded documents. Requires dual verification.", tag: "USER" },
];

const CONFLICTS = [
  {
    id: "CF-001",
    bpid: "B-PID-MH-2026-001",
    address: "Flat 4B, Sunshine Residency, Andheri West",
    field: "Owner Name",
    sources: [
      { source: "Registrar", value: "Rajesh Kumar Sharma", rank: 1 },
      { source: "Society", value: "Rajesh K. Sharma", rank: 5 },
      { source: "User Upload", value: "R.K. Sharma", rank: 7 },
    ],
    resolved: true,
    resolution: "Registrar record accepted as final authority",
    resolvedBy: "Sub-Registrar K. Iyer",
    resolvedOn: "2026-04-12",
    severity: "low",
  },
  {
    id: "CF-002",
    bpid: "B-PID-DL-2026-003",
    address: "Shop No. 12, DLF City Centre, Gurugram",
    field: "Ownership",
    sources: [
      { source: "Registrar", value: "Priya Mehta (registered 2022)", rank: 1 },
      { source: "Court Order", value: "Disputed — Suresh Gupta claim pending", rank: 2 },
      { source: "Private DB", value: "Priya Mehta", rank: 6 },
    ],
    resolved: false,
    resolution: null,
    resolvedBy: null,
    resolvedOn: null,
    severity: "critical",
  },
  {
    id: "CF-003",
    bpid: "B-PID-MH-2026-002",
    address: "Survey No. 45/2, Thane Rural, Maharashtra",
    field: "Land Area",
    sources: [
      { source: "Registrar", value: "2,400 sq ft (223 sqm)", rank: 1 },
      { source: "Talathi 7/12", value: "0.056 hectares (560 sqm)", rank: 3 },
      { source: "User Upload", value: "2,600 sq ft", rank: 7 },
    ],
    resolved: false,
    resolution: null,
    resolvedBy: null,
    resolvedOn: null,
    severity: "high",
  },
  {
    id: "CF-004",
    bpid: "B-PID-GJ-2026-004",
    address: "Plot 22, Sector 7, Gandhinagar, Gujarat",
    field: "Market Value",
    sources: [
      { source: "Govt Circle Rate", value: "₹38,00,000", rank: 3 },
      { source: "Private DB (PropTiger)", value: "₹52,00,000", rank: 6 },
      { source: "User Declaration", value: "₹41,00,000", rank: 7 },
    ],
    resolved: true,
    resolution: "Govt Circle Rate used for stamp duty; market value flagged for AI review",
    resolvedBy: "System Auto-Resolution",
    resolvedOn: "2026-05-01",
    severity: "medium",
  },
];

const SEVERITY_CONFIG = {
  critical: { color: "#dc2626", bg: "#fee2e2", label: "Critical" },
  high:     { color: "#f97316", bg: "#fff7ed", label: "High" },
  medium:   { color: "#d97706", bg: "#fef9c3", label: "Medium" },
  low:      { color: "#16a34a", bg: "#dcfce7", label: "Low" },
};

type Tab = "conflicts" | "hierarchy" | "resolved";

export default function ConflictResolutionScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;
  const [tab, setTab] = useState<Tab>("conflicts");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const unresolved = CONFLICTS.filter((c) => !c.resolved);
  const resolved = CONFLICTS.filter((c) => c.resolved);
  const critical = unresolved.filter((c) => c.severity === "critical");

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: "#1e3a8a", paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Conflict Resolution</Text>
          <Text style={styles.headerSub}>Source Hierarchy Engine — Govt Portal</Text>
        </View>
        {critical.length > 0 && (
          <View style={styles.criticalBadge}>
            <Feather name="alert-triangle" size={12} color="#fff" />
            <Text style={styles.criticalBadgeText}>{critical.length} Critical</Text>
          </View>
        )}
      </View>

      {/* Stats */}
      <View style={[styles.statsRow, { backgroundColor: "#1e3a8a", borderTopColor: "rgba(255,255,255,0.1)", borderTopWidth: 1 }]}>
        <View style={styles.statCell}>
          <Text style={styles.statNum}>{CONFLICTS.length}</Text>
          <Text style={styles.statLabel}>Total Conflicts</Text>
        </View>
        <View style={styles.statDiv} />
        <View style={styles.statCell}>
          <Text style={[styles.statNum, { color: "#f87171" }]}>{unresolved.length}</Text>
          <Text style={styles.statLabel}>Unresolved</Text>
        </View>
        <View style={styles.statDiv} />
        <View style={styles.statCell}>
          <Text style={[styles.statNum, { color: "#34d399" }]}>{resolved.length}</Text>
          <Text style={styles.statLabel}>Resolved</Text>
        </View>
        <View style={styles.statDiv} />
        <View style={styles.statCell}>
          <Text style={[styles.statNum, { color: "#fb923c" }]}>7</Text>
          <Text style={styles.statLabel}>Data Sources</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={[styles.tabRow, { backgroundColor: colors.card, borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
        {(["conflicts", "hierarchy", "resolved"] as Tab[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
            onPress={() => { setTab(t); Haptics.selectionAsync(); }}
          >
            <Text style={[styles.tabText, { color: tab === t ? "#1e3a8a" : colors.mutedForeground }]}>
              {t === "conflicts" ? "Open Conflicts" : t === "hierarchy" ? "Authority Hierarchy" : "Resolved"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={[styles.body, { paddingBottom: botPad + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── OPEN CONFLICTS ── */}
        {tab === "conflicts" && (
          <>
            <View style={[styles.infoBox, { backgroundColor: "#fef3c7", borderColor: "#fbbf24" }]}>
              <Feather name="info" size={14} color="#92400e" />
              <Text style={[styles.infoText, { color: "#92400e" }]}>
                These conflicts exist between multiple data sources. Resolution follows the Source Hierarchy below. Government officers must escalate critical cases.
              </Text>
            </View>

            {unresolved.map((cf) => {
              const sev = SEVERITY_CONFIG[cf.severity as keyof typeof SEVERITY_CONFIG];
              const isOpen = expandedId === cf.id;
              return (
                <TouchableOpacity
                  key={cf.id}
                  style={[styles.conflictCard, { backgroundColor: colors.card, borderColor: isOpen ? sev.color : colors.border, borderLeftWidth: 4, borderLeftColor: sev.color }]}
                  onPress={() => { setExpandedId(isOpen ? null : cf.id); Haptics.selectionAsync(); }}
                  activeOpacity={0.85}
                >
                  <View style={styles.conflictHeader}>
                    <View style={{ flex: 1 }}>
                      <View style={styles.conflictTopRow}>
                        <Text style={[styles.conflictId, { color: colors.mutedForeground }]}>{cf.id}</Text>
                        <View style={[styles.sevBadge, { backgroundColor: sev.bg }]}>
                          <Text style={[styles.sevText, { color: sev.color }]}>{sev.label}</Text>
                        </View>
                      </View>
                      <Text style={[styles.conflictBpid, { color: colors.primary }]}>{cf.bpid}</Text>
                      <Text style={[styles.conflictAddr, { color: colors.foreground }]} numberOfLines={1}>{cf.address}</Text>
                      <View style={styles.conflictFieldRow}>
                        <Feather name="alert-circle" size={11} color={sev.color} />
                        <Text style={[styles.conflictField, { color: sev.color }]}>Field in conflict: {cf.field}</Text>
                      </View>
                    </View>
                    <Feather name={isOpen ? "chevron-up" : "chevron-down"} size={16} color={colors.mutedForeground} />
                  </View>

                  {isOpen && (
                    <View style={styles.conflictBody}>
                      <Text style={[styles.conflictSectionLabel, { color: colors.mutedForeground }]}>Conflicting Values by Source</Text>
                      {cf.sources.map((src, i) => (
                        <View key={i} style={[styles.sourceRow, { backgroundColor: src.rank === 1 ? "#f0fdf4" : src.rank === 2 ? "#eff6ff" : colors.background }]}>
                          <View style={[styles.rankBubble, {
                            backgroundColor:
                              src.rank <= 2 ? "#1e3a8a" : src.rank <= 3 ? "#0891b2" : "#64748b"
                          }]}>
                            <Text style={styles.rankNum}>#{src.rank}</Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.sourceName, { color: colors.foreground }]}>{src.source}</Text>
                            <Text style={[styles.sourceValue, { color: src.rank === 1 ? "#16a34a" : colors.mutedForeground }]}>{src.value}</Text>
                          </View>
                          {src.rank === 1 && (
                            <View style={styles.authorityBadge}>
                              <Text style={styles.authorityText}>FINAL</Text>
                            </View>
                          )}
                        </View>
                      ))}

                      <TouchableOpacity style={[styles.escalateBtn, { backgroundColor: "#dc2626" }]}>
                        <Feather name="send" size={13} color="#fff" />
                        <Text style={styles.escalateBtnText}>Escalate to DM / Court</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}

            {unresolved.length === 0 && (
              <View style={styles.emptyState}>
                <Feather name="check-circle" size={36} color="#16a34a" />
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No open conflicts</Text>
              </View>
            )}
          </>
        )}

        {/* ── SOURCE HIERARCHY ── */}
        {tab === "hierarchy" && (
          <>
            <View style={[styles.infoBox, { backgroundColor: "#eff6ff", borderColor: "#bfdbfe" }]}>
              <Feather name="layers" size={14} color="#1e3a8a" />
              <Text style={[styles.infoText, { color: "#1e3a8a" }]}>
                Rank 1 = Highest legal authority. All conflicts are resolved top-down. Court orders override even the Registrar in active disputes.
              </Text>
            </View>
            {SOURCE_HIERARCHY.map((src, i) => (
              <View key={i} style={[styles.hierarchyCard, { backgroundColor: colors.card, borderColor: colors.border, borderLeftWidth: 4, borderLeftColor: src.color }]}>
                <View style={styles.hierarchyLeft}>
                  <View style={[styles.rankCircle, { backgroundColor: src.color }]}>
                    <Text style={styles.rankCircleText}>#{src.rank}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.hierarchyTitleRow}>
                      <Text style={[styles.hierarchyName, { color: colors.foreground }]}>{src.name}</Text>
                      <View style={[styles.tagPill, { backgroundColor: src.color + "20" }]}>
                        <Text style={[styles.tagText, { color: src.color }]}>{src.tag}</Text>
                      </View>
                    </View>
                    <Text style={[styles.hierarchyDesc, { color: colors.mutedForeground }]}>{src.desc}</Text>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}

        {/* ── RESOLVED ── */}
        {tab === "resolved" && (
          <>
            {resolved.map((cf) => {
              const sev = SEVERITY_CONFIG[cf.severity as keyof typeof SEVERITY_CONFIG];
              return (
                <View key={cf.id} style={[styles.conflictCard, { backgroundColor: "#f0fdf4", borderColor: "#bbf7d0", borderLeftWidth: 4, borderLeftColor: "#16a34a" }]}>
                  <View style={styles.conflictTopRow}>
                    <Text style={[styles.conflictId, { color: "#64748b" }]}>{cf.id}</Text>
                    <View style={[styles.sevBadge, { backgroundColor: "#dcfce7" }]}>
                      <Text style={[styles.sevText, { color: "#16a34a" }]}>Resolved</Text>
                    </View>
                  </View>
                  <Text style={[styles.conflictBpid, { color: "#0f172a" }]}>{cf.bpid}</Text>
                  <Text style={[styles.conflictAddr, { color: "#374151" }]} numberOfLines={1}>{cf.address}</Text>
                  <Text style={[styles.conflictField, { color: "#64748b" }]}>Field: {cf.field}</Text>
                  <View style={[styles.resolutionBox, { backgroundColor: "#dcfce7", borderColor: "#86efac" }]}>
                    <Feather name="check-circle" size={12} color="#16a34a" />
                    <Text style={[styles.resolutionText, { color: "#15803d" }]}>{cf.resolution}</Text>
                  </View>
                  <Text style={[{ fontSize: 10, color: "#64748b", marginTop: 4 }]}>
                    By {cf.resolvedBy} · {cf.resolvedOn}
                  </Text>
                </View>
              );
            })}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "flex-end", gap: 12, paddingHorizontal: 16, paddingBottom: 14 },
  headerTitle: { color: "#fff", fontSize: 17, fontWeight: "700" },
  headerSub: { color: "rgba(255,255,255,0.55)", fontSize: 10, marginTop: 1 },
  criticalBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#dc2626", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  criticalBadgeText: { color: "#fff", fontSize: 10, fontWeight: "800" },
  statsRow: { flexDirection: "row", paddingVertical: 10, paddingHorizontal: 8 },
  statCell: { flex: 1, alignItems: "center" },
  statNum: { color: "#fff", fontSize: 18, fontWeight: "800" },
  statLabel: { color: "rgba(255,255,255,0.5)", fontSize: 9, marginTop: 1 },
  statDiv: { width: 1, backgroundColor: "rgba(255,255,255,0.15)" },
  tabRow: { flexDirection: "row" },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: "center", borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabBtnActive: { borderBottomColor: "#1e3a8a" },
  tabText: { fontSize: 11, fontWeight: "700" },
  body: { padding: 16, gap: 12 },
  infoBox: { flexDirection: "row", gap: 8, padding: 12, borderRadius: 10, borderWidth: 1, alignItems: "flex-start" },
  infoText: { flex: 1, fontSize: 12, lineHeight: 17 },
  conflictCard: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 8 },
  conflictHeader: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  conflictTopRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 },
  conflictId: { fontSize: 10, fontWeight: "600" },
  sevBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20 },
  sevText: { fontSize: 10, fontWeight: "700" },
  conflictBpid: { fontSize: 11, fontWeight: "700", marginBottom: 1 },
  conflictAddr: { fontSize: 13, fontWeight: "600" },
  conflictFieldRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 },
  conflictField: { fontSize: 11, fontWeight: "600" },
  conflictBody: { gap: 8, marginTop: 4, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#e2e8f0" },
  conflictSectionLabel: { fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  sourceRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 10, borderRadius: 8 },
  rankBubble: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  rankNum: { color: "#fff", fontSize: 9, fontWeight: "800" },
  sourceName: { fontSize: 12, fontWeight: "600" },
  sourceValue: { fontSize: 12, marginTop: 1 },
  authorityBadge: { backgroundColor: "#16a34a", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  authorityText: { color: "#fff", fontSize: 9, fontWeight: "800" },
  escalateBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, height: 40, borderRadius: 8 },
  escalateBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  hierarchyCard: { flexDirection: "row", borderRadius: 12, borderWidth: 1, padding: 12, gap: 10 },
  hierarchyLeft: { flexDirection: "row", gap: 10, flex: 1 },
  rankCircle: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  rankCircleText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  hierarchyTitleRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 2 },
  hierarchyName: { fontSize: 13, fontWeight: "700" },
  tagPill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  tagText: { fontSize: 9, fontWeight: "800" },
  hierarchyDesc: { fontSize: 11, lineHeight: 16 },
  resolutionBox: { flexDirection: "row", gap: 6, padding: 8, borderRadius: 8, borderWidth: 1, alignItems: "flex-start", marginTop: 4 },
  resolutionText: { fontSize: 11, flex: 1, fontWeight: "500" },
  emptyState: { alignItems: "center", paddingVertical: 40, gap: 8 },
  emptyText: { fontSize: 14, fontWeight: "600" },
});
