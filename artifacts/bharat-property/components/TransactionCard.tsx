import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { Transaction } from "@/context/DataContext";
import { TransactionStageTracker } from "./TransactionStageTracker";
import { formatCurrency, formatDate } from "@/utils/format";

// Meaningful client status per stage — replaces generic "Escrow: held"
const STAGE_CLIENT_STATUS: Record<number, { label: string; color: string; icon: string }> = {
  1: { label: "Awaiting CPF Broker", color: "#7c3aed", icon: "user-check" },
  2: { label: "CPF Broker Assigned — KYC in Progress", color: "#7c3aed", icon: "users" },
  3: { label: "Docs Under Verification — Sub-Registrar", color: "#d97706", icon: "file-text" },
  4: { label: "Legal Due Diligence — Lawyer Review", color: "#1e40af", icon: "briefcase" },
  5: { label: "Govt Approval — Tahsildar Office", color: "#dc2626", icon: "shield" },
  6: { label: "Sovereign Ledger Sealed — Transfer Complete", color: "#16a34a", icon: "check-circle" },
};

const ESCROW_STATUS: Record<string, { label: string; color: string }> = {
  pending: { label: "Escrow: Awaiting Funds", color: "#d97706" },
  held: { label: "Funds Secured in Bharat Escrow", color: "#059669" },
  released: { label: "Funds Released to Seller", color: "#16a34a" },
};

export function TransactionCard({ tx }: { tx: Transaction }) {
  const colors = useColors();
  const router = useRouter();

  const currentStage = Math.min(tx.stage || 1, 6);
  const stageInfo = STAGE_CLIENT_STATUS[currentStage] || STAGE_CLIENT_STATUS[1];
  const escrowInfo = ESCROW_STATUS[tx.escrowStatus] || ESCROW_STATUS.pending;

  // Mini QR for this transaction
  const qrPayload = `BPCS-TX://${tx.id}|BUID:${tx.bpid}|STAGE:${currentStage}/6|AMOUNT:${Math.round(tx.amount / 100000)}L|BUYER:${tx.buyerName}|STATUS:${tx.status.toUpperCase()}`;
  const txQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=60x60&color=1e3a8a&data=${encodeURIComponent(qrPayload)}`;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => router.push(`/transaction/${tx.id}` as any)}
      activeOpacity={0.75}
    >
      {/* Top row: BUID + QR */}
      <View style={styles.topRow}>
        <View style={styles.idWrap}>
          <Text style={[styles.bpid, { color: colors.mutedForeground }]}>{tx.bpid}</Text>
          <Text style={[styles.address, { color: colors.foreground }]} numberOfLines={1}>
            {tx.propertyAddress}
          </Text>
          <Text style={[styles.txId, { color: colors.mutedForeground }]}>TX · {tx.id}</Text>
        </View>
        <View style={styles.qrWrap}>
          <Image source={{ uri: txQrUrl }} style={styles.qrImg} />
          <Text style={styles.qrLabel}>TX QR</Text>
        </View>
      </View>

      {/* Stage tracker */}
      <TransactionStageTracker stage={tx.stage} />

      {/* Client status — meaningful HWC-style */}
      <View style={[styles.clientStatus, { backgroundColor: stageInfo.color + "12", borderColor: stageInfo.color + "30" }]}>
        <Feather name={stageInfo.icon as any} size={13} color={stageInfo.color} />
        <Text style={[styles.clientStatusText, { color: stageInfo.color }]} numberOfLines={1}>
          Stage {currentStage}/6 · {stageInfo.label}
        </Text>
      </View>

      {/* Parties */}
      <View style={styles.parties}>
        <View style={styles.party}>
          <Feather name="arrow-up-circle" size={13} color="#ef4444" />
          <Text style={[styles.partyText, { color: colors.mutedForeground }]} numberOfLines={1}>{tx.sellerName}</Text>
        </View>
        <Feather name="arrow-right" size={13} color={colors.mutedForeground} />
        <View style={styles.party}>
          <Feather name="arrow-down-circle" size={13} color="#16a34a" />
          <Text style={[styles.partyText, { color: colors.mutedForeground }]} numberOfLines={1}>{tx.buyerName}</Text>
        </View>
      </View>

      {/* Footer: amount + escrow */}
      <View style={styles.footer}>
        <Text style={[styles.amount, { color: colors.primary }]}>{formatCurrency(tx.amount)}</Text>
        <View style={[styles.escrowBadge, { backgroundColor: escrowInfo.color + "15" }]}>
          <Feather name="lock" size={10} color={escrowInfo.color} />
          <Text style={[styles.escrow, { color: escrowInfo.color }]}>{escrowInfo.label}</Text>
        </View>
      </View>

      {/* CPF broker if assigned */}
      {tx.cpfName && (
        <View style={[styles.cpfRow, { borderTopColor: colors.border }]}>
          <Feather name="users" size={11} color="#7c3aed" />
          <Text style={[styles.cpfText, { color: "#7c3aed" }]}>CPF: {tx.cpfName}</Text>
          <Feather name="chevron-right" size={13} color={colors.mutedForeground} style={{ marginLeft: "auto" }} />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 12, gap: 10 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  idWrap: { flex: 1, marginRight: 10 },
  bpid: { fontSize: 10, fontWeight: "600", letterSpacing: 0.5 },
  address: { fontSize: 13, fontWeight: "600", marginTop: 2 },
  txId: { fontSize: 9, marginTop: 2, letterSpacing: 0.3 },
  qrWrap: { alignItems: "center", gap: 3 },
  qrImg: { width: 46, height: 46, borderRadius: 6, borderWidth: 1, borderColor: "#1e3a8a" },
  qrLabel: { color: "#64748b", fontSize: 8, fontWeight: "700" },
  clientStatus: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10, borderWidth: 1 },
  clientStatusText: { fontSize: 11, fontWeight: "600", flex: 1 },
  parties: { flexDirection: "row", alignItems: "center", gap: 6 },
  party: { flexDirection: "row", alignItems: "center", gap: 4, flex: 1, overflow: "hidden" },
  partyText: { fontSize: 11, flex: 1 },
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  amount: { fontSize: 15, fontWeight: "700" },
  escrowBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  escrow: { fontSize: 10, fontWeight: "600" },
  cpfRow: { flexDirection: "row", alignItems: "center", gap: 6, borderTopWidth: 1, paddingTop: 8 },
  cpfText: { fontSize: 11, fontWeight: "600" },
});
