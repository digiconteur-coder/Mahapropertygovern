import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBadge } from "@/components/StatusBadge";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";
import { formatCurrency, formatDate } from "@/utils/format";

export default function LoanApprovalsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { loans, updateLoanStatus, addAuditLog } = useData();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const myLoans = loans.filter((l) => l.bankId === "USR005");
  const pending = myLoans.filter((l) => l.status === "pending");
  const others = myLoans.filter((l) => l.status !== "pending");

  const handleApprove = (loanId: string) => {
    Alert.alert("Approve Loan", "Approve this loan application?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Approve",
        onPress: () => {
          updateLoanStatus(loanId, "approved");
          addAuditLog({
            action: "Loan Approved",
            userId: user?.id || "",
            userName: user?.name || "",
            timestamp: new Date().toISOString(),
            metadata: `Loan ${loanId} approved by ${user?.name}`,
          });
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Alert.alert("Approved", "Loan application has been approved.");
        },
      },
    ]);
  };

  const handleReject = (loanId: string) => {
    Alert.alert("Reject Loan", "Reject this loan application?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reject",
        style: "destructive",
        onPress: () => {
          updateLoanStatus(loanId, "rejected");
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          Alert.alert("Rejected", "Loan application has been rejected.");
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.navBg, paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Loan Applications</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.body, { paddingBottom: botPad + 24 }]} showsVerticalScrollIndicator={false}>
        {pending.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Pending Review</Text>
            {pending.map((loan) => (
              <View key={loan.id} style={[styles.loanCard, { backgroundColor: "#fef9c3", borderColor: "#fef08a" }]}>
                <View style={styles.loanHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.bpid, { color: "#a16207" }]}>{loan.bpid}</Text>
                    <Text style={[styles.applicant, { color: "#0f172a" }]}>{loan.applicantName}</Text>
                    <Text style={[styles.addr, { color: "#64748b" }]} numberOfLines={1}>{loan.propertyAddress}</Text>
                  </View>
                  <Text style={[styles.amount, { color: "#1e40af" }]}>{formatCurrency(loan.amount)}</Text>
                </View>

                <View style={styles.loanMeta}>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Tenure</Text>
                    <Text style={styles.metaValue}>{loan.tenure} months</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Rate</Text>
                    <Text style={styles.metaValue}>{loan.interestRate}%</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Applied</Text>
                    <Text style={styles.metaValue}>{formatDate(loan.appliedOn)}</Text>
                  </View>
                </View>

                <View style={styles.aiSection}>
                  <Feather name="cpu" size={12} color="#7c3aed" />
                  <Text style={{ color: "#7c3aed", fontSize: 12, fontWeight: "600" }}>
                    AI Risk Score: 78/100 — Moderate Risk
                  </Text>
                </View>

                <View style={styles.actions}>
                  <TouchableOpacity style={styles.rejectBtn} onPress={() => handleReject(loan.id)}>
                    <Feather name="x" size={16} color="#dc2626" />
                    <Text style={styles.rejectText}>Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.approveBtn} onPress={() => handleApprove(loan.id)}>
                    <Feather name="check" size={16} color="#fff" />
                    <Text style={styles.approveText}>Approve Loan</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>All Applications</Text>
        {others.map((loan) => (
          <View key={loan.id} style={[styles.loanCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.loanHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.bpid, { color: colors.mutedForeground }]}>{loan.bpid}</Text>
                <Text style={[styles.applicant, { color: colors.foreground }]}>{loan.applicantName}</Text>
              </View>
              <View style={{ alignItems: "flex-end", gap: 4 }}>
                <Text style={[styles.amount, { color: colors.primary }]}>{formatCurrency(loan.amount)}</Text>
                <StatusBadge status={loan.status} size="sm" />
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingBottom: 16 },
  title: { color: "#fff", fontSize: 18, fontWeight: "700" },
  body: { padding: 16, gap: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginTop: 4, marginBottom: 4 },
  loanCard: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 10 },
  loanHeader: { flexDirection: "row", alignItems: "flex-start" },
  bpid: { fontSize: 10, fontWeight: "700" },
  applicant: { fontSize: 15, fontWeight: "700", marginTop: 2 },
  addr: { fontSize: 12, marginTop: 2 },
  amount: { fontSize: 17, fontWeight: "700" },
  loanMeta: { flexDirection: "row", gap: 16 },
  metaItem: { gap: 2 },
  metaLabel: { fontSize: 10, color: "#64748b", textTransform: "uppercase", fontWeight: "600" },
  metaValue: { fontSize: 13, fontWeight: "600", color: "#0f172a" },
  aiSection: { flexDirection: "row", gap: 6, alignItems: "center" },
  actions: { flexDirection: "row", gap: 10 },
  rejectBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderWidth: 1, borderColor: "#dc2626", borderRadius: 8, paddingVertical: 10 },
  rejectText: { color: "#dc2626", fontWeight: "600" },
  approveBtn: { flex: 2, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "#16a34a", borderRadius: 8, paddingVertical: 10 },
  approveText: { color: "#fff", fontWeight: "700" },
});
