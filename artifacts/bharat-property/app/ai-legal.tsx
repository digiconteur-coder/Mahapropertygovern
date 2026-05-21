import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useData } from "@/context/DataContext";
import { formatCurrency } from "@/utils/format";

const AI_SUMMARIES: Record<string, {
  overallStatus: "safe" | "caution" | "risk";
  score: number;
  headline: string;
  plainSummary: string;
  sections: {
    icon: string;
    title: string;
    status: "ok" | "warn" | "risk";
    points: string[];
  }[];
  legalAdvice: string;
  nextSteps: string[];
}> = {
  p1: {
    overallStatus: "safe",
    score: 87,
    headline: "Your flat in Andheri West has a clean, verified title with one active loan.",
    plainSummary:
      "This property is legally yours and fully registered in your name at the Andheri Sub-Registrar office. You have an ongoing home loan with SBI which is current and has no overdue amounts. All key documents — sale deed, encumbrance certificate — are verified. Only the property tax receipt is pending re-upload, which you should complete soon.",
    sections: [
      {
        icon: "shield",
        title: "Title & Ownership",
        status: "ok",
        points: [
          "Sale deed registered on 15 Jun 2021",
          "Mutation completed — your name in govt records",
          "No encumbrance / prior mortgage",
          "Original owner verified via Sub-Registrar"
        ],
      },
      {
        icon: "credit-card",
        title: "Loan Status",
        status: "warn",
        points: [
          "Active home loan: ₹90 Lakh with SBI",
          "EMI: ₹78,302/month",
          "No overdue EMIs",
          "Property is mortgaged with SBI until loan closes — you cannot sell without NOC"
        ],
      },
      {
        icon: "file-text",
        title: "Documents",
        status: "warn",
        points: [
          "Sale Deed — Verified ✓",
          "Encumbrance Certificate — Verified ✓",
          "Property Tax Receipt — Pending re-upload ⚠"
        ],
      },
      {
        icon: "alert-triangle",
        title: "Disputes & Risk",
        status: "ok",
        points: [
          "No active disputes",
          "No court orders found",
          "No government freeze",
          "Risk level: Low"
        ],
      },
    ],
    legalAdvice:
      "Your property is legally sound. The only pending item is uploading a fresh property tax receipt. If you plan to sell, you must obtain an NOC (No Objection Certificate) from SBI Home Loans first. The bank will close your loan from the sale proceeds before releasing the NOC.",
    nextSteps: [
      "Upload latest property tax receipt (due)",
      "Keep EMI payments on time to maintain clean record",
      "Contact SBI for NOC if planning to sell",
    ],
  },
  p2: {
    overallStatus: "risk",
    score: 42,
    headline: "This land in Thane has a live family dispute — you should not sell or transact until resolved.",
    plainSummary:
      "You own this agricultural land in Thane Rural since 2019. However, a family member of the previous owner (Anil Balwant) has filed a civil suit claiming a share in the property. Until the court resolves this dispute, the property title is 'clouded' — meaning any sale or loan could be legally challenged. You should consult a property lawyer immediately.",
    sections: [
      {
        icon: "shield",
        title: "Title & Ownership",
        status: "warn",
        points: [
          "Registered in your name since 22 Mar 2019",
          "Sold by Ramesh Balwant — sale deed executed",
          "Property was inherited land — title chain has gaps",
          "Previous inheritance mutation has a contested heir"
        ],
      },
      {
        icon: "alert-triangle",
        title: "Active Dispute",
        status: "risk",
        points: [
          "Civil suit filed by Anil Balwant on 10 Feb 2024",
          "Claim: undisclosed right in inherited property",
          "Court: District Civil Court, Thane",
          "Case #: CIVIL-SUIT-2024-00441",
          "Status: Under review — no verdict yet"
        ],
      },
      {
        icon: "file-text",
        title: "Documents",
        status: "warn",
        points: [
          "7/12 Extract — Verified ✓",
          "Mutation Certificate — Pending ⚠",
          "NA (Non-Agricultural) Order — Not applied",
          "Inheritance chain documents — Incomplete"
        ],
      },
      {
        icon: "credit-card",
        title: "Loan Status",
        status: "ok",
        points: [
          "No active loan on this property",
          "Loan application submitted (pending) — likely to be rejected due to dispute"
        ],
      },
    ],
    legalAdvice:
      "IMPORTANT: Do not sell, mortgage, or transfer this property while the civil dispute is active. Courts can invalidate any such transaction. Engage a qualified property lawyer to respond to the civil suit. If Anil Balwant's claim is invalid, file a reply and submit the full title chain to the court. Once the court dismisses the case, the property will regain a clear title.",
    nextSteps: [
      "Engage a property lawyer (urgent)",
      "File reply to civil suit with full title documents",
      "Do not proceed with pending loan application",
      "Complete mutation certificate upload",
      "Check NA order eligibility for land conversion",
    ],
  },
};

function TypingText({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(iv);
    }, 14);
    return () => clearInterval(iv);
  }, [text]);
  return <Text style={ttStyles.text}>{displayed}<Text style={{ opacity: 0.5 }}>|</Text></Text>;
}
const ttStyles = StyleSheet.create({
  text: { color: "#f0fdf4", fontSize: 13, lineHeight: 20 },
});

const STATUS_CONFIG = {
  safe:    { color: "#16a34a", bg: "#dcfce7", icon: "shield" as const,        label: "Safe" },
  caution: { color: "#d97706", bg: "#fef9c3", icon: "alert-circle" as const,  label: "Caution" },
  risk:    { color: "#dc2626", bg: "#fee2e2", icon: "alert-triangle" as const, label: "Legal Risk" },
};

const SECTION_STATUS_CONFIG = {
  ok:   { color: "#16a34a", bg: "#f0fdf4", icon: "check-circle" as const  },
  warn: { color: "#d97706", bg: "#fef9c3", icon: "alert-circle" as const  },
  risk: { color: "#dc2626", bg: "#fee2e2", icon: "alert-triangle" as const },
};

export default function AILegalScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { properties } = useData();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const myProps = properties.filter((p) => p.ownerId === "USR001");
  const [selectedId, setSelectedId] = useState(myProps[0]?.id || "");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(true);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const summary = AI_SUMMARIES[selectedId];
  const statusCfg = summary ? STATUS_CONFIG[summary.overallStatus] : null;

  const runAnalysis = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setAnalyzed(false);
    setIsAnalyzing(true);
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start();
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalyzed(true);
      pulseAnim.stopAnimation();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 2800);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: "#0f172a", paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>AI Legal Summary</Text>
          <Text style={styles.headerSub}>Plain-language property status — powered by BPCS AI</Text>
        </View>
        <View style={[styles.aiBadge]}>
          <Feather name="cpu" size={11} color="#a78bfa" />
          <Text style={styles.aiBadgeText}>AI</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.body, { paddingBottom: botPad + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Property selector */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>SELECT PROPERTY</Text>
        {myProps.map((p) => (
          <TouchableOpacity
            key={p.id}
            style={[styles.propCard, {
              backgroundColor: selectedId === p.id ? "#0f172a" : colors.card,
              borderColor: selectedId === p.id ? "#7c3aed" : colors.border,
            }]}
            onPress={() => { setSelectedId(p.id); setAnalyzed(false); Haptics.selectionAsync(); }}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.propBpid, { color: selectedId === p.id ? "#a78bfa" : colors.mutedForeground }]}>{p.bpid}</Text>
              <Text style={[styles.propAddr, { color: selectedId === p.id ? "#fff" : colors.foreground }]} numberOfLines={1}>{p.address}</Text>
              <Text style={[styles.propValue, { color: selectedId === p.id ? "#34d399" : colors.primary }]}>{formatCurrency(p.value)}</Text>
            </View>
            {selectedId === p.id && <Feather name="check-circle" size={18} color="#7c3aed" />}
          </TouchableOpacity>
        ))}

        {/* Analyze button */}
        {!analyzed && !isAnalyzing && (
          <TouchableOpacity style={styles.analyzeBtn} onPress={runAnalysis}>
            <Feather name="cpu" size={16} color="#fff" />
            <Text style={styles.analyzeBtnText}>Run AI Legal Analysis</Text>
          </TouchableOpacity>
        )}

        {/* Analyzing */}
        {isAnalyzing && (
          <Animated.View style={[styles.analyzingCard, { transform: [{ scale: pulseAnim }] }]}>
            <Feather name="cpu" size={22} color="#a78bfa" />
            <View style={{ flex: 1 }}>
              <Text style={styles.analyzingTitle}>Analysing…</Text>
              <Text style={styles.analyzingDesc}>Checking registrar records, court orders, loan status, document completeness, dispute history…</Text>
            </View>
          </Animated.View>
        )}

        {/* Result */}
        {analyzed && summary && statusCfg && (
          <>
            {/* Score card */}
            <View style={[styles.scoreCard, { backgroundColor: "#0f172a" }]}>
              <View style={styles.scoreTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.scoreLabel}>BPCS LEGAL HEALTH SCORE</Text>
                  <Text style={styles.scoreNum}>{summary.score}<Text style={styles.scoreOf}>/100</Text></Text>
                  <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
                    <Feather name={statusCfg.icon} size={12} color={statusCfg.color} />
                    <Text style={[styles.statusText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
                  </View>
                </View>
                <View style={styles.scoreArc}>
                  <View style={[styles.scoreCircle, { borderColor: statusCfg.color }]}>
                    <Text style={[styles.scoreCircleNum, { color: statusCfg.color }]}>{summary.score}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.scoreBarWrap}>
                <View style={[styles.scoreBarFill, {
                  width: `${summary.score}%` as any,
                  backgroundColor: statusCfg.color,
                }]} />
              </View>
            </View>

            {/* Plain-language headline */}
            <View style={[styles.aiHeadlineCard, { backgroundColor: "#0f172a" }]}>
              <View style={styles.aiChip}>
                <Feather name="cpu" size={10} color="#a78bfa" />
                <Text style={styles.aiChipText}>AI Summary</Text>
              </View>
              <TypingText text={summary.headline} />
            </View>

            {/* Plain summary */}
            <View style={[styles.plainCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.plainTitle, { color: colors.foreground }]}>What this means for you</Text>
              <Text style={[styles.plainText, { color: colors.mutedForeground }]}>{summary.plainSummary}</Text>
            </View>

            {/* Sections */}
            {summary.sections.map((sec, i) => {
              const scfg = SECTION_STATUS_CONFIG[sec.status];
              return (
                <View key={i} style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border, borderLeftWidth: 4, borderLeftColor: scfg.color }]}>
                  <View style={styles.sectionHeader}>
                    <View style={[styles.sectionIconWrap, { backgroundColor: scfg.bg }]}>
                      <Feather name={sec.icon as any} size={14} color={scfg.color} />
                    </View>
                    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{sec.title}</Text>
                    <View style={[styles.sectionStatusPill, { backgroundColor: scfg.bg }]}>
                      <Feather name={scfg.icon} size={10} color={scfg.color} />
                      <Text style={[styles.sectionStatusText, { color: scfg.color }]}>
                        {sec.status === "ok" ? "OK" : sec.status === "warn" ? "Review" : "Risk"}
                      </Text>
                    </View>
                  </View>
                  {sec.points.map((pt, j) => (
                    <View key={j} style={styles.pointRow}>
                      <View style={[styles.pointDot, { backgroundColor: scfg.color }]} />
                      <Text style={[styles.pointText, { color: colors.foreground }]}>{pt}</Text>
                    </View>
                  ))}
                </View>
              );
            })}

            {/* Legal advice */}
            <View style={[styles.adviceCard, { backgroundColor: "#fef3c7", borderColor: "#fbbf24" }]}>
              <View style={styles.adviceHeader}>
                <Feather name="book-open" size={14} color="#92400e" />
                <Text style={[styles.adviceTitle, { color: "#92400e" }]}>Legal Advice</Text>
                <Text style={[styles.adviceDisclaimer, { color: "#a16207" }]}>AI-generated · Not a legal opinion</Text>
              </View>
              <Text style={[styles.adviceText, { color: "#78350f" }]}>{summary.legalAdvice}</Text>
            </View>

            {/* Next steps */}
            <View style={[styles.nextStepsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.nextStepsTitle, { color: colors.foreground }]}>Recommended Next Steps</Text>
              {summary.nextSteps.map((step, i) => (
                <View key={i} style={styles.nextStepRow}>
                  <View style={styles.stepNumCircle}>
                    <Text style={styles.stepNum}>{i + 1}</Text>
                  </View>
                  <Text style={[styles.stepText, { color: colors.foreground }]}>{step}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity style={[styles.rerunBtn, { borderColor: colors.border }]} onPress={runAnalysis}>
              <Feather name="refresh-cw" size={13} color={colors.mutedForeground} />
              <Text style={[styles.rerunText, { color: colors.mutedForeground }]}>Re-run Analysis</Text>
            </TouchableOpacity>
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
  headerSub: { color: "rgba(255,255,255,0.5)", fontSize: 10, marginTop: 1 },
  aiBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(167,139,250,0.2)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  aiBadgeText: { color: "#a78bfa", fontSize: 10, fontWeight: "800" },
  body: { padding: 16, gap: 12 },
  sectionLabel: { fontSize: 9, fontWeight: "800", letterSpacing: 0.5 },
  propCard: { borderRadius: 12, borderWidth: 1.5, padding: 14, flexDirection: "row", alignItems: "center", gap: 10 },
  propBpid: { fontSize: 10, fontWeight: "700" },
  propAddr: { fontSize: 13, fontWeight: "600", marginTop: 2 },
  propValue: { fontSize: 13, fontWeight: "700", marginTop: 2 },
  analyzeBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#7c3aed", height: 50, borderRadius: 12 },
  analyzeBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  analyzingCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#0f172a", borderRadius: 14, padding: 16 },
  analyzingTitle: { color: "#a78bfa", fontSize: 13, fontWeight: "700" },
  analyzingDesc: { color: "#64748b", fontSize: 11, lineHeight: 16, marginTop: 3 },
  scoreCard: { borderRadius: 14, padding: 18, gap: 12 },
  scoreTop: { flexDirection: "row", alignItems: "flex-start" },
  scoreLabel: { color: "rgba(255,255,255,0.4)", fontSize: 9, fontWeight: "800", letterSpacing: 0.8 },
  scoreNum: { color: "#fff", fontSize: 44, fontWeight: "900", lineHeight: 50 },
  scoreOf: { color: "rgba(255,255,255,0.3)", fontSize: 20, fontWeight: "400" },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, alignSelf: "flex-start", marginTop: 6 },
  statusText: { fontSize: 11, fontWeight: "700" },
  scoreArc: { alignItems: "center", justifyContent: "center" },
  scoreCircle: { width: 72, height: 72, borderRadius: 36, borderWidth: 4, alignItems: "center", justifyContent: "center" },
  scoreCircleNum: { fontSize: 22, fontWeight: "800" },
  scoreBarWrap: { height: 6, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 3, overflow: "hidden" },
  scoreBarFill: { height: 6, borderRadius: 3 },
  aiHeadlineCard: { borderRadius: 12, padding: 14, gap: 8 },
  aiChip: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(167,139,250,0.15)", paddingHorizontal: 7, paddingVertical: 3, borderRadius: 20, alignSelf: "flex-start" },
  aiChipText: { color: "#a78bfa", fontSize: 9, fontWeight: "800" },
  plainCard: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 6 },
  plainTitle: { fontSize: 13, fontWeight: "700" },
  plainText: { fontSize: 12, lineHeight: 18 },
  sectionCard: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 8 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionIconWrap: { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  sectionTitle: { fontSize: 13, fontWeight: "700", flex: 1 },
  sectionStatusPill: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20 },
  sectionStatusText: { fontSize: 9, fontWeight: "800" },
  pointRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  pointDot: { width: 6, height: 6, borderRadius: 3, marginTop: 5 },
  pointText: { fontSize: 12, lineHeight: 18, flex: 1 },
  adviceCard: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 8 },
  adviceHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  adviceTitle: { fontSize: 13, fontWeight: "700", flex: 1 },
  adviceDisclaimer: { fontSize: 9, fontWeight: "600" },
  adviceText: { fontSize: 12, lineHeight: 18 },
  nextStepsCard: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 10 },
  nextStepsTitle: { fontSize: 14, fontWeight: "700" },
  nextStepRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  stepNumCircle: { width: 22, height: 22, borderRadius: 11, backgroundColor: "#1e3a8a", alignItems: "center", justifyContent: "center" },
  stepNum: { color: "#fff", fontSize: 11, fontWeight: "800" },
  stepText: { fontSize: 12, lineHeight: 17, flex: 1 },
  rerunBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12, borderRadius: 10, borderWidth: 1 },
  rerunText: { fontSize: 13, fontWeight: "600" },
});
