import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";
import { formatCurrency, generateId } from "@/utils/format";

const BANKS = [
  { id: "sbi", name: "State Bank of India", rate: 8.5 },
  { id: "hdfc", name: "HDFC Bank", rate: 8.75 },
  { id: "icici", name: "ICICI Bank", rate: 8.9 },
  { id: "pnb", name: "Punjab National Bank", rate: 8.45 },
  { id: "bob", name: "Bank of Baroda", rate: 8.6 },
];

export default function ApplyLoanScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { properties, addLoan, addAuditLog } = useData();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const myProperties = properties.filter((p) => p.ownerId === user?.id && p.loanStatus === "none");
  const [selectedPropId, setSelectedPropId] = useState("");
  const [selectedBankId, setSelectedBankId] = useState("");
  const [amount, setAmount] = useState("");
  const [tenure, setTenure] = useState("240");

  const selectedProperty = myProperties.find((p) => p.id === selectedPropId);
  const selectedBank = BANKS.find((b) => b.id === selectedBankId);
  const loanAmount = parseFloat(amount) || 0;
  const tenureMonths = parseInt(tenure) || 240;
  const rate = (selectedBank?.rate || 8.5) / 100 / 12;
  const emi = loanAmount > 0 ? Math.round((loanAmount * rate * Math.pow(1 + rate, tenureMonths)) / (Math.pow(1 + rate, tenureMonths) - 1)) : 0;
  const liveBank = selectedBank ? {
    bankSubmitted: true,
    bankCalled: false,
    docsRequested: false,
    kycComplete: false,
    verifiedAccounts: ["SBI", "HDFC", "PNB"],
    recommendedBank: selectedBank.name,
    notes: "Application is sent directly to the bank first. Bank officer will call, confirm details, request missing documents, and move the loan into review.",
  } : undefined;

  const handleSubmit = () => {
    if (!selectedPropId || !selectedBankId || !amount) {
      Alert.alert("Incomplete", "Please fill all required fields.");
      return;
    }
    if (!user || !selectedProperty || !selectedBank) return;
    const loanId = generateId("LOAN");
    addLoan({
      id: loanId,
      propertyId: selectedProperty.id,
      bpid: selectedProperty.bpid,
      propertyAddress: selectedProperty.address,
      applicantId: user.id,
      applicantName: user.name,
      bankId: "USR005",
      bankName: selectedBank.name,
      amount: loanAmount,
      tenure: tenureMonths,
      interestRate: selectedBank.rate,
      status: "pending",
      appliedOn: new Date().toISOString(),
      tracker: liveBank,
    });
    addAuditLog({
      action: "Loan Application",
      userId: user.id,
      userName: user.name,
      timestamp: new Date().toISOString(),
      metadata: `Loan application submitted to ${selectedBank.name} for ${formatCurrency(loanAmount)}`,
      propertyId: selectedProperty.id,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Application Submitted", `Loan ID: ${loanId}\n\nYour loan application was sent directly to ${selectedBank.name}.\n\nThe bank officer will call to confirm details and ask for any missing documents.\n\nExpected processing: 5-10 working days`, [
      { text: "Done", onPress: () => router.back() },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.navBg, paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Apply for Home Loan</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.body, { paddingBottom: botPad + 80 }]} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Select Property</Text>
        {myProperties.map((p) => (
          <TouchableOpacity
            key={p.id}
            style={[styles.selectCard, { backgroundColor: colors.card, borderColor: selectedPropId === p.id ? colors.primary : colors.border }]}
            onPress={() => { setSelectedPropId(p.id); Haptics.selectionAsync(); }}
          >
            <Text style={[styles.bpid, { color: colors.mutedForeground }]}>{p.bpid}</Text>
            <Text style={[styles.addr, { color: colors.foreground }]} numberOfLines={1}>{p.address}</Text>
            <Text style={[styles.val, { color: colors.primary }]}>Max eligible: {formatCurrency(p.value * 0.8)}</Text>
            {selectedPropId === p.id && <Feather name="check-circle" size={20} color={colors.primary} style={styles.checkIcon} />}
          </TouchableOpacity>
        ))}
        {myProperties.length === 0 && (
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No eligible properties (must have no existing loan)</Text>
          </View>
        )}

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Select Bank</Text>
        <View style={{ gap: 8 }}>
          {BANKS.map((bank) => (
            <TouchableOpacity
              key={bank.id}
              style={[styles.bankCard, { backgroundColor: colors.card, borderColor: selectedBankId === bank.id ? colors.primary : colors.border }]}
              onPress={() => { setSelectedBankId(bank.id); Haptics.selectionAsync(); }}
            >
              <View style={[styles.bankIcon, { backgroundColor: colors.accent }]}>
                <Feather name="credit-card" size={16} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.bankName, { color: colors.foreground }]}>{bank.name}</Text>
                <Text style={[styles.bankRate, { color: colors.primary }]}>{bank.rate}% p.a.</Text>
              </View>
              {selectedBankId === bank.id && <Feather name="check-circle" size={20} color={colors.primary} />}
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Loan Details</Text>
        <View style={{ gap: 12 }}>
          <View>
            <Text style={[styles.label, { color: colors.foreground }]}>Loan Amount (₹)</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.secondary }]}
              value={amount}
              onChangeText={setAmount}
              placeholder="e.g. 5000000"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="number-pad"
            />
          </View>
          <View>
            <Text style={[styles.label, { color: colors.foreground }]}>Tenure (months)</Text>
            <View style={styles.tenureRow}>
              {[120, 180, 240, 300, 360].map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.tenureChip, { backgroundColor: tenure === String(t) ? colors.primary : colors.secondary }]}
                  onPress={() => setTenure(String(t))}
                >
                  <Text style={{ color: tenure === String(t) ? "#fff" : colors.foreground, fontSize: 12, fontWeight: "600" }}>
                    {t / 12}yr
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {emi > 0 && selectedBank && (
          <View style={[styles.emiCard, { backgroundColor: colors.navBg }]}>
            <Text style={styles.emiLabel}>Estimated Monthly EMI</Text>
            <Text style={styles.emiAmount}>{formatCurrency(emi)}</Text>
            <Text style={styles.emiSub}>
              {formatCurrency(loanAmount)} at {selectedBank.rate}% for {tenureMonths / 12} years
            </Text>
          </View>
        )}

        {selectedBank && (
          <View style={[styles.trackerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.trackerTitle, { color: colors.foreground }]}>Live Loan Tracker</Text>
            <TrackerRow done label="Sent to bank" />
            <TrackerRow done={false} label="Bank officer call" />
            <TrackerRow done={false} label="Documents requested" />
            <TrackerRow done={false} label="KYC / verification" />
            <TrackerRow done={false} label="Final sanction" />
            <Text style={[styles.trackerNote, { color: colors.mutedForeground }]}>{liveBank?.notes}</Text>
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: botPad + 10 }]}>
        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: colors.primary }]}
          onPress={handleSubmit}
          activeOpacity={0.8}
        >
          <Feather name="send" size={18} color="#fff" />
          <Text style={styles.submitBtnText}>Submit Application</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingBottom: 16 },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
  body: { padding: 16, gap: 14 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginTop: 4 },
  selectCard: { borderRadius: 12, borderWidth: 1.5, padding: 14, position: "relative" },
  bpid: { fontSize: 10, fontWeight: "600" },
  addr: { fontSize: 14, fontWeight: "600", marginTop: 2 },
  val: { fontSize: 13, fontWeight: "600", marginTop: 4 },
  checkIcon: { position: "absolute", top: 12, right: 12 },
  bankCard: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 12, borderWidth: 1, padding: 12 },
  bankIcon: { width: 36, height: 36, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  bankName: { fontSize: 14, fontWeight: "600" },
  bankRate: { fontSize: 13, fontWeight: "700", marginTop: 2 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, height: 48, fontSize: 16 },
  tenureRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  tenureChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  emiCard: { borderRadius: 14, padding: 20, alignItems: "center", gap: 6 },
  emiLabel: { color: "#94a3b8", fontSize: 13 },
  emiAmount: { color: "#fff", fontSize: 32, fontWeight: "700" },
  emiSub: { color: "#94a3b8", fontSize: 12 },
  footer: { paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1 },
  submitBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 52, borderRadius: 12 },
  submitBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  empty: { paddingVertical: 20 },
  emptyText: { fontSize: 13, textAlign: "center" },
  trackerCard: { borderWidth: 1, borderRadius: 14, padding: 14, gap: 10 },
  trackerTitle: { fontSize: 15, fontWeight: "700" },
  trackerRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  trackerDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#cbd5e1" },
  trackerDotDone: { backgroundColor: "#16a34a" },
  trackerLabel: { fontSize: 13, fontWeight: "600" },
  trackerNote: { fontSize: 11, lineHeight: 16, marginTop: 2 },
});

function TrackerRow({ done, label }: { done: boolean; label: string }) {
  return (
    <View style={styles.trackerRow}>
      <View style={[styles.trackerDot, done && styles.trackerDotDone]} />
      <Text style={styles.trackerLabel}>{label}</Text>
    </View>
  );
}
