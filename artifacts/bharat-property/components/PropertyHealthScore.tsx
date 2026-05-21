import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Property } from "@/context/DataContext";

interface Props {
  property: Property;
  compact?: boolean;
}

export interface HealthResult {
  score: number;
  grade: string;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
  components: { name: string; weight: number; earned: number; pass: boolean }[];
}

export function getHealthScore(property: Property): HealthResult {
  const components: { name: string; weight: number; earned: number; pass: boolean }[] = [];

  // 1. Ownership Verification (25%)
  const ownershipEarned =
    property.status === "verified" ? 25 :
    property.status === "under_review" ? 12 : 0;
  components.push({ name: "Ownership Verified", weight: 25, earned: ownershipEarned, pass: ownershipEarned >= 20 });

  // 2. Encumbrance Clarity (20%)
  const encumbranceEarned =
    property.status === "disputed" ? 0 :
    property.status === "frozen" ? 4 :
    property.loanStatus === "active" ? 14 : 20;
  components.push({ name: "Encumbrance Clear", weight: 20, earned: encumbranceEarned, pass: encumbranceEarned >= 15 });

  // 3. Tax Compliance (15%) — assume good for registered properties
  const taxEarned = property.status !== "disputed" ? 15 : 5;
  components.push({ name: "Tax Compliance", weight: 15, earned: taxEarned, pass: taxEarned >= 12 });

  // 4. Litigation Status (15%)
  const litigationEarned = property.status === "disputed" ? 0 : 15;
  components.push({ name: "Litigation Free", weight: 15, earned: litigationEarned, pass: litigationEarned >= 12 });

  // 5. Document Completeness (15%)
  const docs = property.documents;
  let docEarned = 7;
  if (docs.length > 0) {
    const verifiedRatio = docs.filter((d) => d.verifiedStatus === "verified").length / docs.length;
    const rejectedRatio = docs.filter((d) => d.verifiedStatus === "rejected").length / docs.length;
    if (rejectedRatio > 0) docEarned = 4;
    else docEarned = Math.round(15 * verifiedRatio);
  }
  components.push({ name: "Docs Complete", weight: 15, earned: docEarned, pass: docEarned >= 12 });

  // 6. Society / Encumbrance Approvals (10%)
  const societyEarned =
    (!property.loanStatus || property.loanStatus === "none" || property.loanStatus === "closed") ? 10 :
    property.loanStatus === "pending" ? 5 : 7;
  components.push({ name: "Society Approvals", weight: 10, earned: societyEarned, pass: societyEarned >= 8 });

  const score = components.reduce((s, c) => s + c.earned, 0);

  if (score >= 90) return { score, grade: "A+", label: "Transaction Ready", color: "#15803d", bgColor: "#dcfce7", borderColor: "#86efac", icon: "shield", components };
  if (score >= 75) return { score, grade: "A", label: "Low Risk", color: "#16a34a", bgColor: "#f0fdf4", borderColor: "#bbf7d0", icon: "check-circle", components };
  if (score >= 60) return { score, grade: "B", label: "Moderate Risk", color: "#d97706", bgColor: "#fef9c3", borderColor: "#fde68a", icon: "alert-circle", components };
  if (score >= 40) return { score, grade: "C", label: "High Caution", color: "#ea580c", bgColor: "#fff7ed", borderColor: "#fed7aa", icon: "alert-triangle", components };
  return { score, grade: "D", label: "Dispute Heavy", color: "#dc2626", bgColor: "#fee2e2", borderColor: "#fca5a5", icon: "x-circle", components };
}

export function PropertyHealthScore({ property, compact = false }: Props) {
  const h = getHealthScore(property);

  if (compact) {
    return (
      <View style={[styles.compactWrap, { backgroundColor: h.bgColor, borderColor: h.borderColor }]}>
        <Text style={[styles.compactGrade, { color: h.color }]}>{h.grade}</Text>
        <Text style={[styles.compactLabel, { color: h.color }]}>{h.label}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: h.bgColor, borderColor: h.borderColor }]}>
      <View style={styles.topRow}>
        <View style={styles.labelRow}>
          <Feather name={h.icon as any} size={15} color={h.color} />
          <Text style={[styles.label, { color: h.color }]}>Property Health Score™</Text>
        </View>
        <View style={[styles.gradeBadge, { backgroundColor: h.color }]}>
          <Text style={styles.gradeText}>{h.grade}</Text>
        </View>
      </View>

      <View style={styles.scoreRow}>
        <View style={styles.barBg}>
          <View style={[styles.barFill, { width: `${h.score}%` as any, backgroundColor: h.color }]} />
        </View>
        <Text style={[styles.scoreNum, { color: h.color }]}>{h.score}/100</Text>
      </View>

      <Text style={[styles.labelDesc, { color: h.color }]}>{h.label}</Text>

      <View style={styles.componentsGrid}>
        {h.components.map((c, i) => (
          <View key={i} style={styles.componentItem}>
            <Feather name={c.pass ? "check-circle" : "x-circle"} size={10} color={c.pass ? "#16a34a" : "#ef4444"} />
            <Text style={[styles.componentLabel, { color: c.pass ? "#16a34a" : "#ef4444" }]} numberOfLines={1}>
              {c.name}
            </Text>
            <Text style={[styles.componentScore, { color: c.pass ? "#15803d" : "#dc2626" }]}>
              {c.earned}/{c.weight}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <Feather name="lock" size={9} color={h.color} />
        <Text style={[styles.footerText, { color: h.color }]}>BPCS Property Health Score™ — RERAW Act 2026 · Updated in real-time</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 14, borderWidth: 1.5, padding: 14, gap: 10 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  labelRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  label: { fontSize: 13, fontWeight: "700" },
  gradeBadge: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  gradeText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  scoreRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  barBg: { flex: 1, height: 7, backgroundColor: "rgba(255,255,255,0.7)", borderRadius: 4, overflow: "hidden" },
  barFill: { height: 7, borderRadius: 4 },
  scoreNum: { fontSize: 13, fontWeight: "800", width: 48, textAlign: "right" },
  labelDesc: { fontSize: 11, fontWeight: "700", marginTop: -4 },
  componentsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  componentItem: { flexDirection: "row", alignItems: "center", gap: 3, width: "47%", paddingVertical: 2 },
  componentLabel: { fontSize: 10, fontWeight: "600", flex: 1 },
  componentScore: { fontSize: 9, fontWeight: "700" },
  footer: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  footerText: { fontSize: 9, fontWeight: "600", flex: 1, opacity: 0.8 },
  compactWrap: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  compactGrade: { fontSize: 12, fontWeight: "800" },
  compactLabel: { fontSize: 10, fontWeight: "600" },
});
