import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TransactionStageTracker, TX_STAGES } from "@/components/TransactionStageTracker";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";
import { formatCurrency, formatDate } from "@/utils/format";

export default function TransactionDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { transactions, advanceTransactionStage, startLiveSimulation, stopLiveSimulation, liveSimulationTxId } = useData();
  const { user } = useAuth();
  const router = useRouter();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const tx = transactions.find((t) => t.id === id);
  const isSimulating = liveSimulationTxId === id;

  const handleStartDemo = () => {
    if (!tx || tx.stage >= 6) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    startLiveSimulation(id);
  };

  const handleStopDemo = () => {
    stopLiveSimulation();
    Haptics.selectionAsync();
  };

  const handleManualAdvance = () => {
    if (!tx || tx.stage >= 6) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    advanceTransactionStage(id);
  };

  useEffect(() => {
    return () => {
      stopLiveSimulation();
    };
  }, []);

  if (!tx) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { marginTop: topPad + 16, marginLeft: 16 }]}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={{ color: colors.foreground, padding: 20 }}>Transaction not found.</Text>
      </View>
    );
  }

  const currentStageInfo = TX_STAGES[tx.stage - 1];
  const isComplete = tx.stage === 6;
  const canAdvance = !isComplete && !isSimulating && (user?.role === "govt" || user?.role === "bank" || user?.role === "cpf");

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.navBg, paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerSub}>{tx.bpid}</Text>
          <Text style={styles.headerTitle}>Transaction Tracker</Text>
        </View>
        {isSimulating && (
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={[styles.body, { paddingBottom: botPad + 100 }]} showsVerticalScrollIndicator={false}>
        {/* Current Stage Banner */}
        <View style={[styles.stageBanner, { backgroundColor: currentStageInfo.color + "15", borderColor: currentStageInfo.color + "40" }]}>
          <View style={[styles.stageIconWrap, { backgroundColor: currentStageInfo.color }]}>
            <Feather name={currentStageInfo.icon as any} size={22} color="#fff" />
          </View>
          <View style={styles.stageBannerContent}>
            <Text style={[styles.stageBannerLabel, { color: colors.mutedForeground }]}>Current Stage</Text>
            <Text style={[styles.stageBannerTitle, { color: currentStageInfo.color }]}>{currentStageInfo.label}</Text>
            <Text style={[styles.stageBannerSub, { color: colors.mutedForeground }]}>
              Stage {tx.stage} of 6
            </Text>
          </View>
          {isComplete && (
            <Feather name="check-circle" size={32} color="#16a34a" />
          )}
        </View>

        {/* Live Demo Controls */}
        {!isComplete && (
          <View style={[styles.demoCard, { backgroundColor: "#1e3a8a08", borderColor: "#1e3a8a30" }]}>
            <View style={styles.demoHeader}>
              <Feather name="zap" size={15} color="#1e3a8a" />
              <Text style={[styles.demoTitle, { color: "#1e3a8a" }]}>Live Demo Engine</Text>
            </View>
            <Text style={[styles.demoDesc, { color: colors.mutedForeground }]}>
              Simulate real-time transaction progression as it would appear during a live government demonstration.
            </Text>
            <View style={styles.demoBtnRow}>
              {!isSimulating ? (
                <>
                  <TouchableOpacity
                    style={[styles.demoBtn, { backgroundColor: "#1e3a8a" }]}
                    onPress={handleStartDemo}
                    activeOpacity={0.8}
                  >
                    <Feather name="play" size={14} color="#fff" />
                    <Text style={styles.demoBtnText}>Auto-Advance (Live)</Text>
                  </TouchableOpacity>
                  {canAdvance && (
                    <TouchableOpacity
                      style={[styles.demoBtn, { backgroundColor: "#f97316" }]}
                      onPress={handleManualAdvance}
                      activeOpacity={0.8}
                    >
                      <Feather name="skip-forward" size={14} color="#fff" />
                      <Text style={styles.demoBtnText}>Next Stage</Text>
                    </TouchableOpacity>
                  )}
                </>
              ) : (
                <TouchableOpacity
                  style={[styles.demoBtn, { backgroundColor: "#dc2626" }]}
                  onPress={handleStopDemo}
                  activeOpacity={0.8}
                >
                  <Feather name="square" size={14} color="#fff" />
                  <Text style={styles.demoBtnText}>Stop Simulation</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Stage Progress Tracker */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Transaction Pipeline</Text>
          <TransactionStageTracker stage={tx.stage} />
          {/* Stage details */}
          <View style={styles.stagesDetail}>
            {TX_STAGES.map((s, i) => {
              const stageNum = i + 1;
              const done = tx.stage > stageNum;
              const active = tx.stage === stageNum;
              const histEntry = tx.stageHistory.find((h) => h.stage === stageNum);
              return (
                <View key={s.short} style={[styles.stageRow, { borderBottomColor: colors.border, borderBottomWidth: i < TX_STAGES.length - 1 ? 1 : 0 }]}>
                  <View style={[styles.stageNumCircle, {
                    backgroundColor: done ? s.color : active ? s.color : "#f1f5f9",
                    borderColor: done || active ? s.color : colors.border,
                  }]}>
                    {done ? (
                      <Feather name="check" size={10} color="#fff" />
                    ) : (
                      <Text style={[styles.stageNum, { color: active ? "#fff" : "#94a3b8" }]}>{stageNum}</Text>
                    )}
                  </View>
                  <View style={styles.stageInfo}>
                    <Text style={[styles.stageName, { color: done || active ? colors.foreground : colors.mutedForeground, fontWeight: active ? "700" : "500" }]}>
                      {s.label}
                    </Text>
                    {histEntry ? (
                      <Text style={[styles.stageTime, { color: colors.mutedForeground }]}>
                        {histEntry.actor} • {new Date(histEntry.timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </Text>
                    ) : (
                      <Text style={[styles.stageTime, { color: "#cbd5e1" }]}>Pending</Text>
                    )}
                  </View>
                  <View style={[styles.stageDoneIcon, { opacity: done ? 1 : 0 }]}>
                    <Feather name="check-circle" size={16} color={s.color} />
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Transaction Details */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Transaction Details</Text>
          <InfoRow label="Property" value={tx.propertyAddress} colors={colors} />
          <InfoRow label="B-PID" value={tx.bpid} colors={colors} />
          <InfoRow label="Amount" value={formatCurrency(tx.amount)} colors={colors} highlight />
          <InfoRow label="Seller" value={tx.sellerName} colors={colors} />
          <InfoRow label="Buyer" value={tx.buyerName} colors={colors} />
          {tx.cpfName && <InfoRow label="CPF Broker" value={tx.cpfName} colors={colors} />}
          <InfoRow label="Initiated" value={formatDate(tx.initiatedOn)} colors={colors} />
          {tx.completedOn && <InfoRow label="Completed" value={formatDate(tx.completedOn)} colors={colors} />}
        </View>

        {/* Escrow Status */}
        <View style={[styles.escrowCard, {
          backgroundColor: tx.escrowStatus === "released" ? "#dcfce7" : tx.escrowStatus === "held" ? "#fef9c3" : "#f1f5f9",
          borderColor: tx.escrowStatus === "released" ? "#86efac" : tx.escrowStatus === "held" ? "#fde68a" : "#e2e8f0",
        }]}>
          <Feather
            name={tx.escrowStatus === "released" ? "unlock" : tx.escrowStatus === "held" ? "lock" : "clock"}
            size={22}
            color={tx.escrowStatus === "released" ? "#16a34a" : tx.escrowStatus === "held" ? "#d97706" : "#64748b"}
          />
          <View>
            <Text style={[styles.escrowTitle, { color: tx.escrowStatus === "released" ? "#16a34a" : tx.escrowStatus === "held" ? "#d97706" : "#64748b" }]}>
              Escrow {tx.escrowStatus === "held" ? "Active" : tx.escrowStatus === "released" ? "Released" : "Pending"}
            </Text>
            <Text style={[styles.escrowDesc, { color: "#64748b" }]}>
              {tx.escrowStatus === "held"
                ? `${formatCurrency(tx.amount)} held securely by bank until govt approval`
                : tx.escrowStatus === "released"
                ? `${formatCurrency(tx.amount)} transferred to seller on completion`
                : "Awaiting buyer to fund escrow account"}
            </Text>
          </View>
        </View>

        {/* Mock Integrations */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>System Verification</Text>
          <MockIntegration icon="shield" label="Govt Registry Check" status={tx.stage >= 5 ? "verified" : tx.stage >= 3 ? "pending" : "queued"} />
          <MockIntegration icon="credit-card" label="Bank Escrow Clearance" status={tx.stage >= 4 ? "verified" : "queued"} />
          <MockIntegration icon="file-text" label="Legal Document Scan" status={tx.stage >= 3 ? "verified" : "queued"} />
          <MockIntegration icon="user-check" label="KYC Verification" status="verified" />
        </View>
      </ScrollView>
    </View>
  );
}

function InfoRow({ label, value, colors, highlight }: { label: string; value: string; colors: any; highlight?: boolean }) {
  return (
    <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
      <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: highlight ? colors.primary : colors.foreground, fontWeight: highlight ? "700" : "500" }]}>
        {value}
      </Text>
    </View>
  );
}

function MockIntegration({ icon, label, status }: { icon: string; label: string; status: "verified" | "pending" | "queued" }) {
  const colors = useColors();
  const statusConfig = {
    verified: { color: "#16a34a", bg: "#dcfce7", text: "Verified ✓" },
    pending: { color: "#d97706", bg: "#fef9c3", text: "In Progress..." },
    queued: { color: "#94a3b8", bg: "#f1f5f9", text: "Queued" },
  };
  const cfg = statusConfig[status];

  return (
    <View style={[styles.integrationRow, { borderBottomColor: colors.border }]}>
      <View style={[styles.integrationIcon, { backgroundColor: cfg.bg }]}>
        <Feather name={icon as any} size={14} color={cfg.color} />
      </View>
      <Text style={[styles.integrationLabel, { color: colors.foreground }]}>{label}</Text>
      <Text style={[styles.integrationStatus, { color: cfg.color }]}>{cfg.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  backBtn: { padding: 4 },
  headerContent: { flex: 1 },
  headerSub: { color: "#94a3b8", fontSize: 11, fontWeight: "600", letterSpacing: 0.5 },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "700", marginTop: 2 },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#dc2626",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#fff" },
  liveText: { color: "#fff", fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  body: { padding: 16, gap: 14 },
  stageBanner: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  stageIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  stageBannerContent: { flex: 1 },
  stageBannerLabel: { fontSize: 11, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  stageBannerTitle: { fontSize: 20, fontWeight: "800", marginTop: 2 },
  stageBannerSub: { fontSize: 12, marginTop: 2 },
  demoCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  demoHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  demoTitle: { fontSize: 13, fontWeight: "700" },
  demoDesc: { fontSize: 12, lineHeight: 17 },
  demoBtnRow: { flexDirection: "row", gap: 8, marginTop: 4 },
  demoBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  demoBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  sectionCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 2,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  stagesDetail: { gap: 0, marginTop: 12 },
  stageRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 12,
  },
  stageNumCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  stageNum: { fontSize: 11, fontWeight: "700" },
  stageInfo: { flex: 1 },
  stageName: { fontSize: 13 },
  stageTime: { fontSize: 11, marginTop: 1 },
  stageDoneIcon: {},
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 12,
  },
  infoLabel: { fontSize: 13 },
  infoValue: { fontSize: 13, textAlign: "right", flex: 1 },
  escrowCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  escrowTitle: { fontSize: 14, fontWeight: "700" },
  escrowDesc: { fontSize: 12, lineHeight: 17, marginTop: 4 },
  integrationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  integrationIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  integrationLabel: { flex: 1, fontSize: 13 },
  integrationStatus: { fontSize: 12, fontWeight: "600" },
});
