import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { formatCurrency } from "@/utils/format";

const VALUE_OPTIONS = [
  { label: "₹50L", value: 5000000 },
  { label: "₹1Cr", value: 10000000 },
  { label: "₹2Cr", value: 20000000 },
  { label: "₹3Cr", value: 30000000 },
  { label: "₹5Cr", value: 50000000 },
  { label: "₹10Cr", value: 100000000 },
];

const TRADITIONAL = [
  { label: "Stamp Duty", pct: 6, color: "#dc2626" },
  { label: "Registration Fee", pct: 1, color: "#f59e0b" },
  { label: "Brokerage (Unregulated)", pct: 2, color: "#f97316" },
  { label: "Legal / Lawyer", pct: 0.5, color: "#d97706" },
  { label: "Misc / Black Money Leakage", pct: 1, color: "#7f1d1d" },
];

const BPC_SYSTEM = [
  { label: "Govt Tax (Stamp + Reg)", pct: 7, color: "#1e3a8a" },
  { label: "CPF Broker (Regulated)", pct: 2, color: "#0ea5e9" },
  { label: "RERAW Platform Fee", pct: 1, color: "#f97316" },
  { label: "Legal + Bank (Included)", pct: 0, color: "#16a34a", included: true },
  { label: "Leakage / Black Money", pct: 0, color: "#16a34a", included: true },
];

function storeOnBlockchain(data: object): string {
  const str = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) & 0xffffffff;
  }
  return "0x" + Math.abs(hash).toString(16).padStart(8, "0").toUpperCase() +
    Math.abs(hash * 7 + 13).toString(16).padStart(8, "0").toUpperCase();
}

export default function FinancialSimScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selectedIdx, setSelectedIdx] = useState(3);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const propValue = VALUE_OPTIONS[selectedIdx].value;
  const tradTotal = TRADITIONAL.reduce((s, i) => s + propValue * i.pct / 100, 0);
  const bpcTotal = BPC_SYSTEM.reduce((s, i) => s + propValue * i.pct / 100, 0);
  const saving = tradTotal - bpcTotal;
  const savingPct = ((saving / tradTotal) * 100).toFixed(1);

  const govtRevTrad = propValue * 0.07;
  const govtRevBpc = propValue * 0.07;
  const leakageReduced = propValue * 0.01;

  const blockchainHash = storeOnBlockchain({ propValue, bpcTotal, timestamp: Date.now() });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: "#1e3a8a", paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerSub}>Ministry of Housing & Urban Affairs</Text>
          <Text style={styles.headerTitle}>Financial Impact Simulator</Text>
        </View>
        <View style={styles.liveTag}>
          <Text style={styles.liveTagText}>DEMO</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.body, { paddingBottom: botPad + 40 }]} showsVerticalScrollIndicator={false}>
        {/* Property Value Selector */}
        <View style={[styles.selectorCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.selectorTitle, { color: colors.mutedForeground }]}>Select Property Value</Text>
          <View style={styles.optionsRow}>
            {VALUE_OPTIONS.map((opt, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.optionChip, {
                  backgroundColor: selectedIdx === i ? "#1e3a8a" : "#f1f5f9",
                  borderColor: selectedIdx === i ? "#1e3a8a" : colors.border,
                }]}
                onPress={() => setSelectedIdx(i)}
              >
                <Text style={[styles.optionText, { color: selectedIdx === i ? "#fff" : colors.foreground }]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[styles.selectedValue, { color: "#1e3a8a" }]}>{formatCurrency(propValue)}</Text>
        </View>

        {/* Saving Hero */}
        <View style={[styles.savingHero, { backgroundColor: "#16a34a" }]}>
          <Text style={styles.savingLabel}>Buyer Saves with BPC System</Text>
          <Text style={styles.savingAmount}>{formatCurrency(saving)}</Text>
          <Text style={styles.savingPct}>{savingPct}% less than traditional process</Text>
        </View>

        {/* Side-by-Side Comparison */}
        <View style={styles.comparisonRow}>
          {/* Traditional */}
          <View style={[styles.comparisonCol, { backgroundColor: "#fff5f5", borderColor: "#fca5a5" }]}>
            <View style={styles.compColHeader}>
              <Feather name="x-circle" size={14} color="#dc2626" />
              <Text style={styles.compColTitleBad}>Traditional</Text>
            </View>
            {TRADITIONAL.map((item, i) => (
              <View key={i} style={styles.compRow}>
                <View style={[styles.compDot, { backgroundColor: item.color }]} />
                <Text style={styles.compRowLabel}>{item.label}</Text>
                <Text style={[styles.compRowPct, { color: item.color }]}>{item.pct}%</Text>
              </View>
            ))}
            <View style={styles.compTotal}>
              <Text style={styles.compTotalLabel}>Total Cost</Text>
              <Text style={[styles.compTotalAmt, { color: "#dc2626" }]}>{formatCurrency(tradTotal)}</Text>
            </View>
            <View style={styles.compTotalPct}>
              <Text style={styles.compTotalPctText}>{TRADITIONAL.reduce((s, i) => s + i.pct, 0)}% of value</Text>
            </View>
          </View>

          {/* BPC System */}
          <View style={[styles.comparisonCol, { backgroundColor: "#f0fdf4", borderColor: "#86efac" }]}>
            <View style={styles.compColHeader}>
              <Feather name="check-circle" size={14} color="#16a34a" />
              <Text style={styles.compColTitleGood}>BPC System</Text>
            </View>
            {BPC_SYSTEM.map((item, i) => (
              <View key={i} style={styles.compRow}>
                <View style={[styles.compDot, { backgroundColor: item.color }]} />
                <Text style={styles.compRowLabel}>{item.label}</Text>
                {item.included ? (
                  <Text style={[styles.compRowPct, { color: "#16a34a", fontSize: 9 }]}>FREE</Text>
                ) : (
                  <Text style={[styles.compRowPct, { color: item.color }]}>{item.pct}%</Text>
                )}
              </View>
            ))}
            <View style={styles.compTotal}>
              <Text style={styles.compTotalLabel}>Total Cost</Text>
              <Text style={[styles.compTotalAmt, { color: "#16a34a" }]}>{formatCurrency(bpcTotal)}</Text>
            </View>
            <View style={styles.compTotalPct}>
              <Text style={styles.compTotalPctText}>{BPC_SYSTEM.reduce((s, i) => s + i.pct, 0)}% of value</Text>
            </View>
          </View>
        </View>

        {/* Govt Revenue Impact */}
        <View style={[styles.govtCard, { backgroundColor: "#1e3a8a" }]}>
          <View style={styles.govtCardHeader}>
            <Feather name="trending-up" size={16} color="#f97316" />
            <Text style={styles.govtCardTitle}>Government Revenue Impact</Text>
          </View>
          <View style={styles.govtRow}>
            <View style={styles.govtStat}>
              <Text style={styles.govtStatLabel}>Govt Revenue</Text>
              <Text style={styles.govtStatVal}>{formatCurrency(govtRevBpc)}</Text>
              <Text style={styles.govtStatSub}>Same as traditional</Text>
            </View>
            <View style={styles.govtDivider} />
            <View style={styles.govtStat}>
              <Text style={styles.govtStatLabel}>Leakage Reduced</Text>
              <Text style={styles.govtStatVal}>{formatCurrency(leakageReduced)}</Text>
              <Text style={styles.govtStatSub}>Black money eliminated</Text>
            </View>
            <View style={styles.govtDivider} />
            <View style={styles.govtStat}>
              <Text style={styles.govtStatLabel}>Compliance</Text>
              <Text style={styles.govtStatVal}>+28%</Text>
              <Text style={styles.govtStatSub}>More taxpayers</Text>
            </View>
          </View>
        </View>

        {/* Escrow Flow */}
        <View style={[styles.escrowFlow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Escrow Payment Flow</Text>
          <View style={styles.flowRow}>
            {[
              { icon: "user", label: "Buyer", sublabel: formatCurrency(propValue), color: "#1e3a8a" },
              { icon: "lock", label: "Escrow", sublabel: "Bank Holds", color: "#7c3aed" },
              { icon: "shield", label: "Govt OK", sublabel: "Registrar", color: "#f97316" },
              { icon: "check-circle", label: "Seller", sublabel: "Receives", color: "#16a34a" },
            ].map((step, i, arr) => (
              <React.Fragment key={step.label}>
                <View style={styles.flowStep}>
                  <View style={[styles.flowIcon, { backgroundColor: step.color }]}>
                    <Feather name={step.icon as any} size={14} color="#fff" />
                  </View>
                  <Text style={[styles.flowLabel, { color: colors.foreground }]}>{step.label}</Text>
                  <Text style={[styles.flowSub, { color: colors.mutedForeground }]}>{step.sublabel}</Text>
                </View>
                {i < arr.length - 1 && <Feather name="arrow-right" size={16} color="#94a3b8" style={styles.flowArrow} />}
              </React.Fragment>
            ))}
          </View>
          <View style={[styles.flowBenefit, { backgroundColor: "#dcfce7" }]}>
            <Feather name="check" size={12} color="#16a34a" />
            <Text style={[styles.flowBenefitText, { color: "#16a34a" }]}>
              No cash leakage • No fraud • Instant on Govt approval
            </Text>
          </View>
        </View>

        {/* Sovereign Audit Record */}
        <View style={[styles.blockchainCard, { backgroundColor: "#0f172a", borderColor: "#334155" }]}>
          <View style={styles.blockchainHeader}>
            <Feather name="shield" size={14} color="#34d399" />
            <Text style={styles.blockchainTitle}>Sovereign Audit Record Generated</Text>
          </View>
          <Text style={styles.blockchainHash}>{blockchainHash}</Text>
          <Text style={styles.blockchainDesc}>
            Every BPC transaction is permanently sealed in India's Permissioned Sovereign Audit Ledger — tamper-evident under RERAW Act 2026.
          </Text>
          <View style={styles.blockchainMeta}>
            <Text style={styles.blockchainMetaText}>Protocol: SovereignAudit.seal(txData)</Text>
            <View style={[styles.blockchainBadge]}>
              <Text style={styles.blockchainBadgeText}>SEALED</Text>
            </View>
          </View>
        </View>

        {/* Scalability Numbers */}
        <View style={[styles.scaleCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>National Scale Impact</Text>
          <ScaleRow icon="home" label="Properties registered per year" value="1.2 Crore" color="#1e3a8a" colors={colors} />
          <ScaleRow icon="trending-up" label="Total property transactions (India)" value="₹22 Lakh Crore" color="#16a34a" colors={colors} />
          <ScaleRow icon="shield" label="Stamp duty revenue potential" value="₹1.32 Lakh Crore" color="#f97316" colors={colors} />
          <ScaleRow icon="x-circle" label="Estimated black money leakage (current)" value="₹22,000 Crore" color="#dc2626" colors={colors} />
          <ScaleRow icon="check-circle" label="Leakage eliminated by BPC system" value="₹22,000 Crore" color="#16a34a" colors={colors} />
        </View>
      </ScrollView>
    </View>
  );
}

function ScaleRow({ icon, label, value, color, colors }: { icon: string; label: string; value: string; color: string; colors: any }) {
  return (
    <View style={[styles.scaleRow, { borderBottomColor: colors.border }]}>
      <Feather name={icon as any} size={14} color={color} />
      <Text style={[styles.scaleLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.scaleValue, { color }]}>{value}</Text>
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
  headerSub: { color: "rgba(255,255,255,0.55)", fontSize: 10, fontWeight: "600", letterSpacing: 0.5 },
  headerTitle: { color: "#fff", fontSize: 17, fontWeight: "700", marginTop: 2 },
  liveTag: { backgroundColor: "#f97316", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  liveTagText: { color: "#fff", fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  body: { padding: 16, gap: 14 },
  selectorCard: { borderRadius: 12, borderWidth: 1, padding: 14 },
  selectorTitle: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 },
  optionsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  optionChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  optionText: { fontSize: 13, fontWeight: "600" },
  selectedValue: { fontSize: 22, fontWeight: "800", marginTop: 10 },
  savingHero: { borderRadius: 14, padding: 18, alignItems: "center", gap: 4 },
  savingLabel: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: "600" },
  savingAmount: { color: "#fff", fontSize: 30, fontWeight: "800" },
  savingPct: { color: "rgba(255,255,255,0.7)", fontSize: 12 },
  comparisonRow: { flexDirection: "row", gap: 10 },
  comparisonCol: { flex: 1, borderRadius: 12, borderWidth: 1, padding: 12, gap: 6 },
  compColHeader: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 6 },
  compColTitleBad: { color: "#dc2626", fontSize: 12, fontWeight: "700" },
  compColTitleGood: { color: "#16a34a", fontSize: 12, fontWeight: "700" },
  compRow: { flexDirection: "row", alignItems: "center", gap: 5, paddingVertical: 3 },
  compDot: { width: 6, height: 6, borderRadius: 3 },
  compRowLabel: { flex: 1, fontSize: 9.5, color: "#475569", lineHeight: 13 },
  compRowPct: { fontSize: 11, fontWeight: "700", width: 26, textAlign: "right" },
  compTotal: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: "#e2e8f0" },
  compTotalLabel: { fontSize: 11, fontWeight: "600", color: "#475569" },
  compTotalAmt: { fontSize: 12, fontWeight: "800" },
  compTotalPct: { alignItems: "center", marginTop: 2 },
  compTotalPctText: { fontSize: 10, color: "#64748b" },
  govtCard: { borderRadius: 14, padding: 16, gap: 12 },
  govtCardHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  govtCardTitle: { color: "#fff", fontSize: 14, fontWeight: "700" },
  govtRow: { flexDirection: "row", alignItems: "flex-start" },
  govtStat: { flex: 1, alignItems: "center" },
  govtStatLabel: { color: "rgba(255,255,255,0.55)", fontSize: 10, fontWeight: "600", textAlign: "center" },
  govtStatVal: { color: "#fff", fontSize: 14, fontWeight: "800", marginTop: 4, textAlign: "center" },
  govtStatSub: { color: "rgba(255,255,255,0.4)", fontSize: 9, textAlign: "center", marginTop: 2 },
  govtDivider: { width: 1, height: 50, backgroundColor: "rgba(255,255,255,0.15)", marginTop: 4 },
  escrowFlow: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 12 },
  sectionTitle: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1 },
  flowRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  flowStep: { alignItems: "center", gap: 4 },
  flowIcon: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  flowLabel: { fontSize: 10, fontWeight: "700" },
  flowSub: { fontSize: 9, textAlign: "center" },
  flowArrow: { marginBottom: 10 },
  flowBenefit: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  flowBenefitText: { fontSize: 11, fontWeight: "600", flex: 1 },
  blockchainCard: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 8 },
  blockchainHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  blockchainTitle: { color: "#34d399", fontSize: 13, fontWeight: "700" },
  blockchainHash: { color: "#f97316", fontSize: 13, fontFamily: "monospace", letterSpacing: 0.5, fontWeight: "600" },
  blockchainDesc: { color: "#64748b", fontSize: 11, lineHeight: 16 },
  blockchainMeta: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  blockchainMetaText: { color: "#475569", fontSize: 10, fontFamily: "monospace" },
  blockchainBadge: { backgroundColor: "#16a34a", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  blockchainBadgeText: { color: "#fff", fontSize: 9, fontWeight: "800", letterSpacing: 1 },
  scaleCard: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 2 },
  scaleRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 9, borderBottomWidth: 1 },
  scaleLabel: { flex: 1, fontSize: 12, lineHeight: 16 },
  scaleValue: { fontSize: 12, fontWeight: "700", textAlign: "right" },
});
