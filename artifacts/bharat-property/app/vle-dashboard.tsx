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

const VLES = [
  {
    id: "VLE-001",
    name: "Ramesh Patil",
    village: "Shirsad, Raigad, Maharashtra",
    trustScore: 92,
    uploads: 148,
    accuracy: 96,
    complaints: 1,
    verifications: 144,
    status: "active",
    lastActive: "Today, 10:42 AM",
    device: "Samsung Galaxy A14",
    badges: ["Top Performer", "Zero Fraud"],
  },
  {
    id: "VLE-002",
    name: "Sunita Bai Devi",
    village: "Koraon, Prayagraj, UP",
    trustScore: 78,
    uploads: 82,
    accuracy: 89,
    complaints: 3,
    verifications: 74,
    status: "active",
    lastActive: "Today, 08:15 AM",
    device: "Redmi 12",
    badges: ["Consistent"],
  },
  {
    id: "VLE-003",
    name: "Anand Kumar Yadav",
    village: "Baroli, Samastipur, Bihar",
    trustScore: 54,
    uploads: 37,
    accuracy: 71,
    complaints: 6,
    verifications: 29,
    status: "flagged",
    lastActive: "2 days ago",
    device: "Unknown Device",
    badges: [],
  },
  {
    id: "VLE-004",
    name: "Lakshmi Narayanan",
    village: "Thirukazhukundram, Chengalpet, TN",
    trustScore: 88,
    uploads: 113,
    accuracy: 94,
    complaints: 0,
    verifications: 109,
    status: "active",
    lastActive: "Today, 09:30 AM",
    device: "Realme Narzo 50",
    badges: ["Zero Complaints", "Verified Expert"],
  },
  {
    id: "VLE-005",
    name: "Mohammed Umar Khan",
    village: "Beawar, Ajmer, Rajasthan",
    trustScore: 34,
    uploads: 21,
    accuracy: 58,
    complaints: 9,
    verifications: 12,
    status: "suspended",
    lastActive: "15 days ago",
    device: "Multiple devices (anomaly)",
    badges: [],
  },
];

const GEO_UPLOADS = [
  {
    vle: "Ramesh Patil",
    bpid: "B-PID-MH-2026-001",
    property: "Survey 12/4, Shirsad Village",
    lat: "18.4142° N",
    lng: "73.0631° E",
    time: "05 May 2025, 10:38 AM",
    deviceId: "IMEI-86753-09100",
    verified: true,
    distance: "14m from property boundary",
  },
  {
    vle: "Sunita Bai Devi",
    bpid: "B-PID-UP-2026-022",
    property: "Plot 6B, Koraon Mandi Road",
    lat: "25.3018° N",
    lng: "81.9920° E",
    time: "04 May 2025, 02:11 PM",
    deviceId: "IMEI-35290-11042",
    verified: true,
    distance: "8m from property boundary",
  },
  {
    vle: "Anand Kumar Yadav",
    bpid: "B-PID-BR-2026-007",
    property: "Khasra 44/2, Baroli",
    lat: "25.8810° N",
    lng: "85.7820° E",
    time: "03 May 2025, 11:54 PM",
    deviceId: "IMEI-UNKNOWN",
    verified: false,
    distance: "ANOMALY — 2.3 km from property",
  },
];

function TrustScoreBar({ score }: { score: number }) {
  const color = score >= 80 ? "#16a34a" : score >= 60 ? "#d97706" : "#dc2626";
  return (
    <View style={tsStyles.wrap}>
      <View style={[tsStyles.bar, { backgroundColor: color + "22" }]}>
        <View style={[tsStyles.fill, { width: `${score}%` as any, backgroundColor: color }]} />
      </View>
      <Text style={[tsStyles.num, { color }]}>{score}</Text>
    </View>
  );
}
const tsStyles = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", gap: 6 },
  bar: { flex: 1, height: 6, borderRadius: 3, overflow: "hidden" },
  fill: { height: 6, borderRadius: 3 },
  num: { fontSize: 12, fontWeight: "800", width: 26, textAlign: "right" },
});

type Tab = "vles" | "geo" | "fraud";

export default function VLEDashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;
  const [tab, setTab] = useState<Tab>("vles");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const active = VLES.filter((v) => v.status === "active");
  const flagged = VLES.filter((v) => v.status === "flagged" || v.status === "suspended");

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: "#7c3aed", paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>VLE Trust Dashboard</Text>
          <Text style={styles.headerSub}>Village Level Executors — Ground Network</Text>
        </View>
        <View style={styles.livePill}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={[styles.statsRow, { backgroundColor: "#7c3aed", borderTopColor: "rgba(255,255,255,0.1)", borderTopWidth: 1 }]}>
        <View style={styles.statCell}>
          <Text style={styles.statNum}>{VLES.length}</Text>
          <Text style={styles.statLabel}>Total VLEs</Text>
        </View>
        <View style={styles.statDiv} />
        <View style={styles.statCell}>
          <Text style={[styles.statNum, { color: "#86efac" }]}>{active.length}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statDiv} />
        <View style={styles.statCell}>
          <Text style={[styles.statNum, { color: "#fca5a5" }]}>{flagged.length}</Text>
          <Text style={styles.statLabel}>Flagged</Text>
        </View>
        <View style={styles.statDiv} />
        <View style={styles.statCell}>
          <Text style={[styles.statNum, { color: "#fde68a" }]}>401</Text>
          <Text style={styles.statLabel}>Uploads</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={[styles.tabRow, { backgroundColor: colors.card, borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
        {(["vles", "geo", "fraud"] as Tab[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
            onPress={() => { setTab(t); Haptics.selectionAsync(); }}
          >
            <Text style={[styles.tabText, { color: tab === t ? "#7c3aed" : colors.mutedForeground }]}>
              {t === "vles" ? "VLE Scores" : t === "geo" ? "Geo Proof" : "Fraud Signals"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={[styles.body, { paddingBottom: botPad + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── VLE SCORES ── */}
        {tab === "vles" && (
          <>
            <View style={[styles.infoBox, { backgroundColor: "#faf5ff", borderColor: "#d8b4fe" }]}>
              <Feather name="info" size={13} color="#7c3aed" />
              <Text style={[styles.infoText, { color: "#6d28d9" }]}>
                Trust Score = weighted average of upload accuracy (50%), complaint rate (30%), and verification success (20%). Suspended below 40.
              </Text>
            </View>

            {VLES.map((vle) => {
              const statusColor = vle.status === "active" ? "#16a34a" : vle.status === "flagged" ? "#d97706" : "#dc2626";
              const isOpen = expandedId === vle.id;
              return (
                <TouchableOpacity
                  key={vle.id}
                  style={[styles.vleCard, { backgroundColor: colors.card, borderColor: isOpen ? statusColor : colors.border }]}
                  onPress={() => { setExpandedId(isOpen ? null : vle.id); Haptics.selectionAsync(); }}
                  activeOpacity={0.85}
                >
                  <View style={styles.vleTop}>
                    <View style={[styles.vleAvatar, { backgroundColor: statusColor + "20" }]}>
                      <Text style={[styles.vleAvatarText, { color: statusColor }]}>{vle.name[0]}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <Text style={[styles.vleName, { color: colors.foreground }]}>{vle.name}</Text>
                        <View style={[styles.statusPill, { backgroundColor: statusColor + "18" }]}>
                          <Text style={[styles.statusText, { color: statusColor }]}>
                            {vle.status === "active" ? "Active" : vle.status === "flagged" ? "Flagged" : "Suspended"}
                          </Text>
                        </View>
                      </View>
                      <Text style={[styles.vleVillage, { color: colors.mutedForeground }]} numberOfLines={1}>{vle.village}</Text>
                      <TrustScoreBar score={vle.trustScore} />
                    </View>
                    <Feather name={isOpen ? "chevron-up" : "chevron-down"} size={16} color={colors.mutedForeground} />
                  </View>

                  {isOpen && (
                    <View style={[styles.vleDetails, { borderTopColor: colors.border }]}>
                      <View style={styles.metricsGrid}>
                        <MetricBox label="Uploads" value={String(vle.uploads)} color="#1d4ed8" />
                        <MetricBox label="Accuracy" value={`${vle.accuracy}%`} color={vle.accuracy >= 90 ? "#16a34a" : "#d97706"} />
                        <MetricBox label="Complaints" value={String(vle.complaints)} color={vle.complaints === 0 ? "#16a34a" : "#dc2626"} />
                        <MetricBox label="Verified" value={String(vle.verifications)} color="#7c3aed" />
                      </View>
                      <View style={styles.deviceRow}>
                        <Feather name="smartphone" size={12} color={colors.mutedForeground} />
                        <Text style={[styles.deviceText, { color: colors.mutedForeground }]}>{vle.device}</Text>
                      </View>
                      <View style={styles.deviceRow}>
                        <Feather name="clock" size={12} color={colors.mutedForeground} />
                        <Text style={[styles.deviceText, { color: colors.mutedForeground }]}>Last active: {vle.lastActive}</Text>
                      </View>
                      {vle.badges.length > 0 && (
                        <View style={styles.badgeRow}>
                          {vle.badges.map((b, i) => (
                            <View key={i} style={styles.badge}>
                              <Feather name="star" size={9} color="#d97706" />
                              <Text style={styles.badgeText}>{b}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                      {vle.status === "suspended" && (
                        <View style={[styles.warningBox, { backgroundColor: "#fee2e2", borderColor: "#fca5a5" }]}>
                          <Feather name="alert-octagon" size={13} color="#dc2626" />
                          <Text style={{ color: "#dc2626", fontSize: 12, fontWeight: "600", flex: 1 }}>
                            Account suspended due to fraud signals. Escalated to district officer.
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </>
        )}

        {/* ── GEO PROOF ── */}
        {tab === "geo" && (
          <>
            <View style={[styles.infoBox, { backgroundColor: "#f0fdf4", borderColor: "#86efac" }]}>
              <Feather name="map-pin" size={13} color="#16a34a" />
              <Text style={[styles.infoText, { color: "#15803d" }]}>
                Every VLE upload is tagged with GPS coordinates, timestamp, and device IMEI. Uploads from more than 500m away are automatically rejected.
              </Text>
            </View>
            {GEO_UPLOADS.map((u, i) => (
              <View key={i} style={[styles.geoCard, {
                backgroundColor: u.verified ? colors.card : "#fff5f5",
                borderColor: u.verified ? colors.border : "#fca5a5",
                borderLeftWidth: 4,
                borderLeftColor: u.verified ? "#16a34a" : "#dc2626",
              }]}>
                <View style={styles.geoHeader}>
                  <View style={[styles.geoStatusDot, { backgroundColor: u.verified ? "#16a34a" : "#dc2626" }]} />
                  <Text style={[styles.geoVle, { color: colors.foreground }]}>{u.vle}</Text>
                  <View style={[styles.geoVerPill, { backgroundColor: u.verified ? "#dcfce7" : "#fee2e2" }]}>
                    <Text style={{ fontSize: 9, fontWeight: "800", color: u.verified ? "#16a34a" : "#dc2626" }}>
                      {u.verified ? "VERIFIED" : "ANOMALY"}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.geoBpid, { color: colors.primary }]}>{u.bpid}</Text>
                <Text style={[styles.geoAddr, { color: colors.foreground }]}>{u.property}</Text>
                <View style={styles.geoMeta}>
                  <View style={styles.geoMetaItem}>
                    <Feather name="map-pin" size={10} color={colors.mutedForeground} />
                    <Text style={[styles.geoMetaText, { color: colors.mutedForeground }]}>{u.lat}, {u.lng}</Text>
                  </View>
                  <View style={styles.geoMetaItem}>
                    <Feather name="clock" size={10} color={colors.mutedForeground} />
                    <Text style={[styles.geoMetaText, { color: colors.mutedForeground }]}>{u.time}</Text>
                  </View>
                  <View style={styles.geoMetaItem}>
                    <Feather name="smartphone" size={10} color={colors.mutedForeground} />
                    <Text style={[styles.geoMetaText, { color: colors.mutedForeground }]}>{u.deviceId}</Text>
                  </View>
                </View>
                <View style={[styles.distancePill, { backgroundColor: u.verified ? "#dcfce7" : "#fee2e2" }]}>
                  <Feather name="navigation" size={10} color={u.verified ? "#16a34a" : "#dc2626"} />
                  <Text style={{ fontSize: 11, fontWeight: "600", color: u.verified ? "#15803d" : "#dc2626" }}>{u.distance}</Text>
                </View>
              </View>
            ))}
          </>
        )}

        {/* ── FRAUD SIGNALS ── */}
        {tab === "fraud" && (
          <>
            <View style={[styles.infoBox, { backgroundColor: "#fff5f5", borderColor: "#fca5a5" }]}>
              <Feather name="alert-triangle" size={13} color="#dc2626" />
              <Text style={[styles.infoText, { color: "#dc2626" }]}>
                Fraud detection uses geo-anomaly, device fingerprint, upload speed, and complaint correlation. Three signals = automatic suspension.
              </Text>
            </View>

            {[
              { signal: "Geo Mismatch", desc: "VLE-005 uploaded documents from 2.3 km away from property. GPS spoofing suspected.", severity: "critical", vle: "Mohammed Umar Khan", time: "03 May, 11:54 PM" },
              { signal: "Multiple Devices", desc: "VLE-005 logged in from 4 different devices in 24 hours. IMEI rotation detected.", severity: "critical", vle: "Mohammed Umar Khan", time: "02 May, 09:11 AM" },
              { signal: "Speed Anomaly", desc: "VLE-003 uploaded 8 property documents in 6 minutes — physically impossible.", severity: "high", vle: "Anand Kumar Yadav", time: "01 May, 02:35 PM" },
              { signal: "Complaint Cluster", desc: "VLE-003 received 3 complaints in one district within 7 days. Pattern match.", severity: "high", vle: "Anand Kumar Yadav", time: "28 Apr, 04:00 PM" },
              { signal: "Night Upload", desc: "VLE-002 uploaded property photos at 1:47 AM. Flagged for manual review.", severity: "medium", vle: "Sunita Bai Devi", time: "27 Apr, 01:47 AM" },
            ].map((f, i) => {
              const c = f.severity === "critical" ? "#dc2626" : f.severity === "high" ? "#f97316" : "#d97706";
              const bg = f.severity === "critical" ? "#fee2e2" : f.severity === "high" ? "#fff7ed" : "#fef9c3";
              return (
                <View key={i} style={[styles.fraudCard, { backgroundColor: colors.card, borderColor: colors.border, borderLeftWidth: 4, borderLeftColor: c }]}>
                  <View style={styles.fraudHeader}>
                    <Feather name="alert-circle" size={14} color={c} />
                    <Text style={[styles.fraudSignal, { color: c }]}>{f.signal}</Text>
                    <View style={[styles.sevPill, { backgroundColor: bg }]}>
                      <Text style={[styles.sevText, { color: c }]}>{f.severity.toUpperCase()}</Text>
                    </View>
                  </View>
                  <Text style={[styles.fraudDesc, { color: colors.foreground }]}>{f.desc}</Text>
                  <View style={styles.fraudMeta}>
                    <Feather name="user" size={10} color={colors.mutedForeground} />
                    <Text style={[styles.fraudMetaText, { color: colors.mutedForeground }]}>{f.vle}</Text>
                    <Feather name="clock" size={10} color={colors.mutedForeground} style={{ marginLeft: 8 }} />
                    <Text style={[styles.fraudMetaText, { color: colors.mutedForeground }]}>{f.time}</Text>
                  </View>
                </View>
              );
            })}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function MetricBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={[mbStyles.cell, { borderColor: color + "30", backgroundColor: color + "08" }]}>
      <Text style={[mbStyles.val, { color }]}>{value}</Text>
      <Text style={mbStyles.lbl}>{label}</Text>
    </View>
  );
}
const mbStyles = StyleSheet.create({
  cell: { flex: 1, alignItems: "center", paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  val: { fontSize: 16, fontWeight: "800" },
  lbl: { fontSize: 9, color: "#64748b", marginTop: 2, fontWeight: "600" },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "flex-end", gap: 12, paddingHorizontal: 16, paddingBottom: 14 },
  headerTitle: { color: "#fff", fontSize: 17, fontWeight: "700" },
  headerSub: { color: "rgba(255,255,255,0.55)", fontSize: 10, marginTop: 1 },
  livePill: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#dc2626", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#fff" },
  liveText: { color: "#fff", fontSize: 9, fontWeight: "800", letterSpacing: 1 },
  statsRow: { flexDirection: "row", paddingVertical: 10, paddingHorizontal: 8 },
  statCell: { flex: 1, alignItems: "center" },
  statNum: { color: "#fff", fontSize: 18, fontWeight: "800" },
  statLabel: { color: "rgba(255,255,255,0.5)", fontSize: 9, marginTop: 1 },
  statDiv: { width: 1, backgroundColor: "rgba(255,255,255,0.15)" },
  tabRow: { flexDirection: "row" },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: "center", borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabBtnActive: { borderBottomColor: "#7c3aed" },
  tabText: { fontSize: 11, fontWeight: "700" },
  body: { padding: 16, gap: 12 },
  infoBox: { flexDirection: "row", gap: 8, padding: 12, borderRadius: 10, borderWidth: 1, alignItems: "flex-start" },
  infoText: { flex: 1, fontSize: 12, lineHeight: 17 },
  vleCard: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 10 },
  vleTop: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  vleAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  vleAvatarText: { fontSize: 16, fontWeight: "700" },
  vleName: { fontSize: 14, fontWeight: "700" },
  vleVillage: { fontSize: 11, marginBottom: 4 },
  statusPill: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20 },
  statusText: { fontSize: 9, fontWeight: "800" },
  vleDetails: { borderTopWidth: 1, paddingTop: 10, gap: 8 },
  metricsGrid: { flexDirection: "row", gap: 6 },
  deviceRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  deviceText: { fontSize: 11 },
  badgeRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  badge: { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "#fef9c3", paddingHorizontal: 7, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 10, fontWeight: "600", color: "#92400e" },
  warningBox: { flexDirection: "row", gap: 6, padding: 10, borderRadius: 8, borderWidth: 1, alignItems: "flex-start" },
  geoCard: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 6 },
  geoHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  geoStatusDot: { width: 8, height: 8, borderRadius: 4 },
  geoVle: { fontSize: 13, fontWeight: "700", flex: 1 },
  geoVerPill: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20 },
  geoBpid: { fontSize: 11, fontWeight: "700" },
  geoAddr: { fontSize: 13, fontWeight: "600" },
  geoMeta: { gap: 3 },
  geoMetaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  geoMetaText: { fontSize: 10 },
  distancePill: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, alignSelf: "flex-start", marginTop: 2 },
  fraudCard: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 6 },
  fraudHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  fraudSignal: { fontSize: 13, fontWeight: "700", flex: 1 },
  sevPill: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20 },
  sevText: { fontSize: 9, fontWeight: "800" },
  fraudDesc: { fontSize: 12, lineHeight: 17 },
  fraudMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  fraudMetaText: { fontSize: 10 },
});
