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
import { formatCurrency } from "@/utils/format";

const VERIFICATION_QUEUE = [
  {
    id: "BV-001",
    applicant: "Sunita Patel",
    bpid: "B-PID-MH-2026-002",
    address: "Survey No. 45/2, Thane Rural, Maharashtra",
    loanAmount: 6500000,
    cibil: 782,
    checks: {
      registrarVerified: true,
      titleClear: true,
      noDispute: true,
      noEncumbrance: true,
      docComplete: true,
      valuation: "₹82,00,000",
      ltv: 79,
      ownerMatch: true,
    },
    riskScore: 14,
    recommendation: "APPROVE",
    processingTime: "3 days",
  },
  {
    id: "BV-002",
    applicant: "Mohan Reddy",
    bpid: "B-PID-AP-2026-005",
    address: "Plot 4/22, Madhapur, Hyderabad, Telangana",
    loanAmount: 4800000,
    cibil: 698,
    checks: {
      registrarVerified: true,
      titleClear: true,
      noDispute: true,
      noEncumbrance: false,
      docComplete: false,
      valuation: "₹67,00,000",
      ltv: 72,
      ownerMatch: true,
    },
    riskScore: 38,
    recommendation: "REVIEW",
    processingTime: "1 day",
  },
  {
    id: "BV-003",
    applicant: "Ravi Tiwari",
    bpid: "B-PID-UP-2026-007",
    address: "Khasra 112, Sitapur Road, Lucknow, UP",
    loanAmount: 3800000,
    cibil: 612,
    checks: {
      registrarVerified: false,
      titleClear: false,
      noDispute: false,
      noEncumbrance: true,
      docComplete: false,
      valuation: "N/A",
      ltv: 0,
      ownerMatch: false,
    },
    riskScore: 76,
    recommendation: "REJECT",
    processingTime: "2 days",
  },
];

const LEGAL_REPORTS = [
  {
    bpid: "B-PID-MH-2026-001",
    address: "Flat 4B, Sunshine Residency, Andheri West",
    owner: "Rajesh Kumar Sharma",
    reportType: "Title Search Report",
    generatedOn: "02 May 2025",
    status: "clean",
    findings: ["No encumbrance found", "Clear title — 12-year chain verified", "No court orders", "Mutation current"],
  },
  {
    bpid: "B-PID-MH-2026-002",
    address: "Survey No. 45/2, Thane Rural",
    owner: "Rajesh Kumar Sharma",
    reportType: "Title Search Report",
    generatedOn: "01 May 2025",
    status: "risk",
    findings: ["ACTIVE DISPUTE: Civil Suit 2024-00441", "Inheritance chain has contested succession", "Mutation certificate pending", "Recommend: Legal hold — do not proceed"],
  },
];

const PORTFOLIO_RISK_BREAKDOWN = [
  { label: "AAA — Verified title, CIBIL 750+", count: 187, pct: 62, color: "#16a34a" },
  { label: "AA — Minor doc gaps, CIBIL 700-749", count: 63, pct: 21, color: "#22c55e" },
  { label: "BBB — Some risk, CIBIL 650-699", count: 36, pct: 12, color: "#d97706" },
  { label: "B — Dispute/doc issue, CIBIL <650", count: 12, pct: 4, color: "#f97316" },
  { label: "C — Active dispute / invalid title", count: 4, pct: 1, color: "#dc2626" },
];

function RiskScoreGauge({ score }: { score: number }) {
  const color = score <= 20 ? "#16a34a" : score <= 40 ? "#d97706" : "#dc2626";
  const label = score <= 20 ? "LOW RISK" : score <= 40 ? "MEDIUM" : "HIGH RISK";
  return (
    <View style={gaugeStyles.wrap}>
      <View style={[gaugeStyles.circle, { borderColor: color }]}>
        <Text style={[gaugeStyles.num, { color }]}>{score}</Text>
        <Text style={[gaugeStyles.label, { color }]}>{label}</Text>
      </View>
    </View>
  );
}
const gaugeStyles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center" },
  circle: { width: 68, height: 68, borderRadius: 34, borderWidth: 4, alignItems: "center", justifyContent: "center" },
  num: { fontSize: 20, fontWeight: "900" },
  label: { fontSize: 7, fontWeight: "800", marginTop: -2 },
});

function CheckRow({ label, ok }: { label: string; ok: boolean }) {
  return (
    <View style={checkStyles.row}>
      <Feather name={ok ? "check-circle" : "x-circle"} size={13} color={ok ? "#16a34a" : "#dc2626"} />
      <Text style={[checkStyles.label, { color: ok ? "#15803d" : "#dc2626" }]}>{label}</Text>
    </View>
  );
}
const checkStyles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 3 },
  label: { fontSize: 12, fontWeight: "500" },
});

type Tab = "queue" | "reports" | "portfolio";

export default function BankVerificationScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;
  const [tab, setTab] = useState<Tab>("queue");
  const [expandedId, setExpandedId] = useState<string | null>("BV-001");

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: "#92400e", paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Bank Verification Portal</Text>
          <Text style={styles.headerSub}>Independent verification — not dependent on BPCS platform</Text>
        </View>
        <View style={[styles.headerBadge, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
          <Feather name="shield" size={11} color="#fde68a" />
          <Text style={styles.headerBadgeText}>SBI</Text>
        </View>
      </View>

      {/* Bank philosophy banner */}
      <View style={[styles.philosophyBanner, { backgroundColor: "#fef9c3", borderBottomColor: "#fbbf24", borderBottomWidth: 1 }]}>
        <Feather name="info" size={12} color="#92400e" />
        <Text style={[styles.philosophyText, { color: "#78350f" }]}>
          Bank is not dependent on BPCS — this portal provides independent access to govt registrar, CIBIL, and court records. BPCS enhances, not replaces, bank verification.
        </Text>
      </View>

      {/* Tabs */}
      <View style={[styles.tabRow, { backgroundColor: colors.card, borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
        {(["queue", "reports", "portfolio"] as Tab[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
            onPress={() => { setTab(t); Haptics.selectionAsync(); }}
          >
            <Text style={[styles.tabText, { color: tab === t ? "#92400e" : colors.mutedForeground }]}>
              {t === "queue" ? "Verification Queue" : t === "reports" ? "Legal Reports" : "Portfolio Risk"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={[styles.body, { paddingBottom: botPad + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── QUEUE ── */}
        {tab === "queue" && (
          <>
            {VERIFICATION_QUEUE.map((item) => {
              const isOpen = expandedId === item.id;
              const recColor = item.recommendation === "APPROVE" ? "#16a34a" : item.recommendation === "REVIEW" ? "#d97706" : "#dc2626";
              const recBg = item.recommendation === "APPROVE" ? "#dcfce7" : item.recommendation === "REVIEW" ? "#fef9c3" : "#fee2e2";

              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.verCard, { backgroundColor: colors.card, borderColor: isOpen ? recColor : colors.border }]}
                  onPress={() => { setExpandedId(isOpen ? null : item.id); Haptics.selectionAsync(); }}
                  activeOpacity={0.85}
                >
                  <View style={styles.verCardTop}>
                    <View style={{ flex: 1 }}>
                      <View style={styles.verTopRow}>
                        <Text style={[styles.verId, { color: colors.mutedForeground }]}>{item.id}</Text>
                        <View style={[styles.recBadge, { backgroundColor: recBg }]}>
                          <Text style={[styles.recText, { color: recColor }]}>{item.recommendation}</Text>
                        </View>
                      </View>
                      <Text style={[styles.verApplicant, { color: colors.foreground }]}>{item.applicant}</Text>
                      <Text style={[styles.verBpid, { color: colors.primary }]}>{item.bpid}</Text>
                      <Text style={[styles.verAddr, { color: colors.mutedForeground }]} numberOfLines={1}>{item.address}</Text>
                      <View style={styles.verMeta}>
                        <Text style={[styles.verAmount, { color: colors.foreground }]}>{formatCurrency(item.loanAmount)}</Text>
                        <Text style={[styles.verCibil, { color: item.cibil >= 750 ? "#16a34a" : item.cibil >= 700 ? "#d97706" : "#dc2626" }]}>
                          CIBIL {item.cibil}
                        </Text>
                        <Text style={[styles.verWait, { color: colors.mutedForeground }]}>Wait: {item.processingTime}</Text>
                      </View>
                    </View>
                    <RiskScoreGauge score={item.riskScore} />
                  </View>

                  {isOpen && (
                    <View style={[styles.verBody, { borderTopColor: colors.border }]}>
                      <Text style={[styles.checkTitle, { color: colors.mutedForeground }]}>BPCS VERIFICATION CHECKS</Text>
                      <CheckRow label="Registrar record verified" ok={item.checks.registrarVerified} />
                      <CheckRow label="Title clear (no prior claim)" ok={item.checks.titleClear} />
                      <CheckRow label="No active disputes" ok={item.checks.noDispute} />
                      <CheckRow label="No encumbrance / prior mortgage" ok={item.checks.noEncumbrance} />
                      <CheckRow label="All documents complete" ok={item.checks.docComplete} />
                      <CheckRow label="Owner identity match (Aadhaar/PAN)" ok={item.checks.ownerMatch} />

                      <View style={[styles.valuationBox, { backgroundColor: "#eff6ff", borderColor: "#bfdbfe" }]}>
                        <View style={styles.valuationRow}>
                          <Text style={styles.valuationLabel}>Property Valuation</Text>
                          <Text style={[styles.valuationValue, { color: "#1d4ed8" }]}>{item.checks.valuation}</Text>
                        </View>
                        {item.checks.ltv > 0 && (
                          <View style={styles.valuationRow}>
                            <Text style={styles.valuationLabel}>LTV Ratio</Text>
                            <Text style={[styles.valuationValue, {
                              color: item.checks.ltv <= 75 ? "#16a34a" : item.checks.ltv <= 85 ? "#d97706" : "#dc2626"
                            }]}>{item.checks.ltv}%</Text>
                          </View>
                        )}
                      </View>

                      <View style={styles.actionRow}>
                        <TouchableOpacity style={[styles.approveBtn, { backgroundColor: recColor }]}>
                          <Feather name={item.recommendation === "APPROVE" ? "check" : item.recommendation === "REVIEW" ? "eye" : "x"} size={14} color="#fff" />
                          <Text style={styles.approveBtnText}>
                            {item.recommendation === "APPROVE" ? "Sanction Loan" : item.recommendation === "REVIEW" ? "Request More Docs" : "Reject Application"}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.downloadBtn, { borderColor: colors.border }]}>
                          <Feather name="download" size={14} color={colors.mutedForeground} />
                          <Text style={[styles.downloadBtnText, { color: colors.mutedForeground }]}>Report</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </>
        )}

        {/* ── LEGAL REPORTS ── */}
        {tab === "reports" && (
          <>
            <View style={[styles.infoBox, { backgroundColor: "#eff6ff", borderColor: "#bfdbfe" }]}>
              <Feather name="file-text" size={13} color="#1d4ed8" />
              <Text style={[styles.infoText, { color: "#1e40af" }]}>
                Title search reports are auto-generated from registrar, court, and dispute databases. Banks can rely on these without a separate legal opinion for standard cases.
              </Text>
            </View>
            {LEGAL_REPORTS.map((rep, i) => (
              <View key={i} style={[styles.reportCard, {
                backgroundColor: colors.card,
                borderColor: rep.status === "clean" ? "#bbf7d0" : "#fca5a5",
                borderLeftWidth: 4,
                borderLeftColor: rep.status === "clean" ? "#16a34a" : "#dc2626",
              }]}>
                <View style={styles.reportHeader}>
                  <View style={[styles.reportStatusDot, { backgroundColor: rep.status === "clean" ? "#16a34a" : "#dc2626" }]} />
                  <Text style={[styles.reportType, { color: colors.foreground }]}>{rep.reportType}</Text>
                  <View style={[styles.reportStatusBadge, { backgroundColor: rep.status === "clean" ? "#dcfce7" : "#fee2e2" }]}>
                    <Text style={{ fontSize: 9, fontWeight: "800", color: rep.status === "clean" ? "#16a34a" : "#dc2626" }}>
                      {rep.status === "clean" ? "CLEAN TITLE" : "RISK FOUND"}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.reportBpid, { color: colors.primary }]}>{rep.bpid}</Text>
                <Text style={[styles.reportAddr, { color: colors.foreground }]}>{rep.address}</Text>
                <Text style={[styles.reportOwner, { color: colors.mutedForeground }]}>Owner: {rep.owner}</Text>
                <Text style={[styles.reportDate, { color: colors.mutedForeground }]}>Generated: {rep.generatedOn}</Text>
                <View style={[styles.findingsBox, { backgroundColor: rep.status === "clean" ? "#f0fdf4" : "#fff5f5" }]}>
                  {rep.findings.map((f, j) => (
                    <View key={j} style={styles.findingRow}>
                      <Feather name={rep.status === "clean" ? "check" : "alert-triangle"} size={10} color={rep.status === "clean" ? "#16a34a" : "#dc2626"} />
                      <Text style={[styles.findingText, { color: rep.status === "clean" ? "#15803d" : "#dc2626" }]}>{f}</Text>
                    </View>
                  ))}
                </View>
                <TouchableOpacity style={[styles.downloadFullBtn, { backgroundColor: "#1e3a8a" }]}>
                  <Feather name="download" size={13} color="#fff" />
                  <Text style={styles.downloadFullText}>Download Full Report (PDF)</Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}

        {/* ── PORTFOLIO RISK ── */}
        {tab === "portfolio" && (
          <>
            <View style={[styles.portfolioHeroCard, { backgroundColor: "#92400e" }]}>
              <Text style={styles.portfolioHeroLabel}>SBI Home Loan Portfolio — Risk Rating</Text>
              <Text style={styles.portfolioHeroNum}>302</Text>
              <Text style={styles.portfolioHeroSub}>Active loans · Avg CIBIL: 726 · NPA: 1.3%</Text>
            </View>
            {PORTFOLIO_RISK_BREAKDOWN.map((bucket, i) => (
              <View key={i} style={[styles.riskBucket, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.riskBucketLeft}>
                  <View style={[styles.riskGradeDot, { backgroundColor: bucket.color }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.riskBucketLabel, { color: colors.foreground }]}>{bucket.label}</Text>
                    <View style={styles.riskBarWrap}>
                      <View style={[styles.riskBarFill, { width: `${bucket.pct}%` as any, backgroundColor: bucket.color }]} />
                    </View>
                  </View>
                </View>
                <View style={styles.riskBucketRight}>
                  <Text style={[styles.riskCount, { color: bucket.color }]}>{bucket.count}</Text>
                  <Text style={[styles.riskPct, { color: colors.mutedForeground }]}>{bucket.pct}%</Text>
                </View>
              </View>
            ))}
            <View style={[styles.infoBox, { backgroundColor: "#f0fdf4", borderColor: "#86efac", marginTop: 4 }]}>
              <Feather name="trending-up" size={13} color="#16a34a" />
              <Text style={[styles.infoText, { color: "#15803d" }]}>
                Portfolio quality improved 8% since BPCS integration. Title verification now automated — saves 3 days per application. NPA risk scoring accuracy: 91%.
              </Text>
            </View>
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
  headerBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  headerBadgeText: { color: "#fde68a", fontSize: 11, fontWeight: "800" },
  philosophyBanner: { flexDirection: "row", gap: 8, paddingHorizontal: 14, paddingVertical: 10, alignItems: "flex-start" },
  philosophyText: { flex: 1, fontSize: 11, lineHeight: 16 },
  tabRow: { flexDirection: "row" },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: "center", borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabBtnActive: { borderBottomColor: "#92400e" },
  tabText: { fontSize: 11, fontWeight: "700" },
  body: { padding: 16, gap: 12 },
  verCard: { borderRadius: 12, borderWidth: 1, overflow: "hidden" },
  verCardTop: { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 14 },
  verTopRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 },
  verId: { fontSize: 10, fontWeight: "600" },
  recBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  recText: { fontSize: 10, fontWeight: "800" },
  verApplicant: { fontSize: 15, fontWeight: "700" },
  verBpid: { fontSize: 11, fontWeight: "700", marginTop: 1 },
  verAddr: { fontSize: 11, marginTop: 1 },
  verMeta: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 4 },
  verAmount: { fontSize: 13, fontWeight: "700" },
  verCibil: { fontSize: 11, fontWeight: "700" },
  verWait: { fontSize: 10 },
  verBody: { borderTopWidth: 1, padding: 14, gap: 6 },
  checkTitle: { fontSize: 9, fontWeight: "800", letterSpacing: 0.5, marginBottom: 2 },
  valuationBox: { borderRadius: 8, borderWidth: 1, padding: 10, gap: 4, marginTop: 4 },
  valuationRow: { flexDirection: "row", justifyContent: "space-between" },
  valuationLabel: { fontSize: 12, color: "#64748b" },
  valuationValue: { fontSize: 13, fontWeight: "700" },
  actionRow: { flexDirection: "row", gap: 8, marginTop: 6 },
  approveBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 8 },
  approveBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  downloadBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, borderWidth: 1 },
  downloadBtnText: { fontSize: 12, fontWeight: "600" },
  infoBox: { flexDirection: "row", gap: 8, padding: 12, borderRadius: 10, borderWidth: 1, alignItems: "flex-start" },
  infoText: { flex: 1, fontSize: 12, lineHeight: 17 },
  reportCard: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 6 },
  reportHeader: { flexDirection: "row", alignItems: "center", gap: 7 },
  reportStatusDot: { width: 8, height: 8, borderRadius: 4 },
  reportType: { fontSize: 13, fontWeight: "700", flex: 1 },
  reportStatusBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20 },
  reportBpid: { fontSize: 11, fontWeight: "700" },
  reportAddr: { fontSize: 12, fontWeight: "600" },
  reportOwner: { fontSize: 11 },
  reportDate: { fontSize: 10 },
  findingsBox: { borderRadius: 8, padding: 10, gap: 5 },
  findingRow: { flexDirection: "row", alignItems: "flex-start", gap: 6 },
  findingText: { fontSize: 11, fontWeight: "500", flex: 1, lineHeight: 16 },
  downloadFullBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 8, marginTop: 2 },
  downloadFullText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  portfolioHeroCard: { borderRadius: 14, padding: 16, gap: 4 },
  portfolioHeroLabel: { color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: "600" },
  portfolioHeroNum: { color: "#fff", fontSize: 42, fontWeight: "900" },
  portfolioHeroSub: { color: "rgba(255,255,255,0.5)", fontSize: 11 },
  riskBucket: { borderRadius: 10, borderWidth: 1, padding: 12, flexDirection: "row", alignItems: "center", gap: 8 },
  riskBucketLeft: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  riskGradeDot: { width: 10, height: 10, borderRadius: 5 },
  riskBucketLabel: { fontSize: 11, fontWeight: "500", marginBottom: 4 },
  riskBarWrap: { height: 5, backgroundColor: "#e2e8f0", borderRadius: 3, overflow: "hidden" },
  riskBarFill: { height: 5, borderRadius: 3 },
  riskBucketRight: { alignItems: "flex-end", minWidth: 40 },
  riskCount: { fontSize: 16, fontWeight: "800" },
  riskPct: { fontSize: 10, fontWeight: "600" },
});
