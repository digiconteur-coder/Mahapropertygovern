import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

interface ConsentRule {
  id: string;
  entity: string;
  entityType: "bank" | "cpf" | "govt" | "developer" | "court" | "insurance";
  icon: string;
  dataTypes: { key: string; label: string; enabled: boolean }[];
  purpose: string;
  validTill: string;
  lastAccess?: string;
}

const ENTITY_COLORS: Record<string, string> = {
  bank: "#d97706",
  cpf: "#7c3aed",
  govt: "#1e3a8a",
  developer: "#059669",
  court: "#dc2626",
  insurance: "#0891b2",
};

const INITIAL_CONSENTS: ConsentRule[] = [
  {
    id: "c1",
    entity: "State Bank of India — Home Loans",
    entityType: "bank",
    icon: "credit-card",
    purpose: "Home loan appraisal and sanctioning",
    validTill: "30 Jun 2025",
    lastAccess: "Today, 10:14 AM",
    dataTypes: [
      { key: "property_value", label: "Property Market Value", enabled: true },
      { key: "loan_history", label: "Existing Loan Details", enabled: true },
      { key: "title_status", label: "Title / Legal Status", enabled: true },
      { key: "owner_id", label: "Owner Identity (Aadhaar/PAN)", enabled: true },
      { key: "transaction_history", label: "Transaction History", enabled: false },
      { key: "income_docs", label: "Income Documents", enabled: false },
    ],
  },
  {
    id: "c2",
    entity: "Priya Mehta (CPF Broker #PB-2204)",
    entityType: "cpf",
    icon: "user-check",
    purpose: "Property sale facilitation",
    validTill: "15 May 2025",
    lastAccess: "Yesterday, 4:00 PM",
    dataTypes: [
      { key: "property_details", label: "Property Details & Address", enabled: true },
      { key: "asking_price", label: "Asking Price", enabled: true },
      { key: "owner_contact", label: "Owner Contact Number", enabled: true },
      { key: "aadhaar", label: "Aadhaar Number", enabled: false },
      { key: "pan", label: "PAN Details", enabled: false },
      { key: "bank_account", label: "Bank Account Details", enabled: false },
    ],
  },
  {
    id: "c3",
    entity: "Sub-Registrar Office, Andheri",
    entityType: "govt",
    icon: "shield",
    purpose: "Property registration and mutation",
    validTill: "Permanent (by law)",
    lastAccess: "12 Apr 2025",
    dataTypes: [
      { key: "full_property", label: "Full Property Record", enabled: true },
      { key: "owner_identity", label: "Owner Identity", enabled: true },
      { key: "transaction_history", label: "Transaction History", enabled: true },
      { key: "loan_details", label: "Loan & Encumbrance", enabled: true },
      { key: "documents", label: "All Uploaded Documents", enabled: true },
      { key: "audit_log", label: "Audit Trail", enabled: true },
    ],
  },
  {
    id: "c4",
    entity: "HDFC Ergo Property Insurance",
    entityType: "insurance",
    icon: "umbrella",
    purpose: "Property insurance quote and issuance",
    validTill: "01 Aug 2025",
    lastAccess: "3 days ago",
    dataTypes: [
      { key: "property_type", label: "Property Type & Size", enabled: true },
      { key: "property_value", label: "Current Market Value", enabled: true },
      { key: "dispute_status", label: "Dispute / Legal Status", enabled: true },
      { key: "owner_id", label: "Owner Identity", enabled: true },
      { key: "loan_details", label: "Loan Details", enabled: false },
      { key: "bank_account", label: "Bank Account", enabled: false },
    ],
  },
];

const ACCESS_LOG = [
  { entity: "SBI Home Loans", action: "Viewed property valuation", time: "Today 10:14 AM", dataAccessed: "Market Value, Title Status" },
  { entity: "Priya Mehta (CPF)", action: "Viewed contact details", time: "Yesterday 4:00 PM", dataAccessed: "Phone, Property Address" },
  { entity: "SBI Home Loans", action: "Viewed loan eligibility data", time: "Yesterday 11:30 AM", dataAccessed: "Property Value, Owner ID" },
  { entity: "Sub-Registrar Andheri", action: "Accessed full property record", time: "12 Apr 2025", dataAccessed: "All permitted fields" },
  { entity: "HDFC Ergo Insurance", action: "Viewed property risk profile", time: "3 days ago", dataAccessed: "Type, Value, Dispute Status" },
];

export default function ConsentEngineScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;
  const [tab, setTab] = useState<"consents" | "log">("consents");
  const [consents, setConsents] = useState(INITIAL_CONSENTS);
  const [expandedId, setExpandedId] = useState<string | null>("c1");

  const toggleDataType = (consentId: string, dataKey: string, isGovt: boolean) => {
    if (isGovt) {
      Alert.alert("Cannot Modify", "Government access to your property record is mandated by law and cannot be restricted.");
      return;
    }
    Haptics.selectionAsync();
    setConsents((prev) =>
      prev.map((c) =>
        c.id !== consentId ? c : {
          ...c,
          dataTypes: c.dataTypes.map((d) =>
            d.key !== dataKey ? d : { ...d, enabled: !d.enabled }
          ),
        }
      )
    );
  };

  const revokeConsent = (consentId: string, entity: string) => {
    Alert.alert(
      "Revoke Access",
      `This will immediately revoke ${entity}'s access to your property data. Are you sure?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Revoke",
          style: "destructive",
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            setConsents((prev) => prev.filter((c) => c.id !== consentId));
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: "#0891b2", paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Consent Engine</Text>
          <Text style={styles.headerSub}>Your data, your control — manage who sees what</Text>
        </View>
        <View style={[styles.headerBadge, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
          <Feather name="lock" size={12} color="#fff" />
          <Text style={styles.headerBadgeText}>{consents.length} Active</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={[styles.tabRow, { backgroundColor: colors.card, borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
        {(["consents", "log"] as const).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
            onPress={() => { setTab(t); Haptics.selectionAsync(); }}
          >
            <Text style={[styles.tabText, { color: tab === t ? "#0891b2" : colors.mutedForeground }]}>
              {t === "consents" ? "Active Consents" : "Access Log"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={[styles.body, { paddingBottom: botPad + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {tab === "consents" && (
          <>
            <View style={[styles.infoBox, { backgroundColor: "#e0f2fe", borderColor: "#7dd3fc" }]}>
              <Feather name="info" size={13} color="#0369a1" />
              <Text style={[styles.infoText, { color: "#0369a1" }]}>
                You control exactly what each entity can see. Toggle data fields on/off. Government access is fixed by law and cannot be changed.
              </Text>
            </View>

            {consents.map((c) => {
              const entityColor = ENTITY_COLORS[c.entityType];
              const isOpen = expandedId === c.id;
              const isGovt = c.entityType === "govt";
              const enabledCount = c.dataTypes.filter((d) => d.enabled).length;

              return (
                <View key={c.id} style={[styles.consentCard, { backgroundColor: colors.card, borderColor: isOpen ? entityColor : colors.border }]}>
                  <TouchableOpacity
                    style={styles.consentHeader}
                    onPress={() => { setExpandedId(isOpen ? null : c.id); Haptics.selectionAsync(); }}
                    activeOpacity={0.85}
                  >
                    <View style={[styles.entityIcon, { backgroundColor: entityColor + "18" }]}>
                      <Feather name={c.icon as any} size={16} color={entityColor} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.entityName, { color: colors.foreground }]} numberOfLines={1}>{c.entity}</Text>
                      <Text style={[styles.entityPurpose, { color: colors.mutedForeground }]} numberOfLines={1}>{c.purpose}</Text>
                      <View style={styles.consentMeta}>
                        <View style={[styles.typePill, { backgroundColor: entityColor + "18" }]}>
                          <Text style={[styles.typeText, { color: entityColor }]}>{c.entityType.toUpperCase()}</Text>
                        </View>
                        <Text style={[styles.validText, { color: colors.mutedForeground }]}>
                          Valid till: {c.validTill}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.consentRight}>
                      <Text style={[styles.enabledCount, { color: entityColor }]}>{enabledCount}/{c.dataTypes.length}</Text>
                      <Text style={[styles.enabledLabel, { color: colors.mutedForeground }]}>fields</Text>
                      <Feather name={isOpen ? "chevron-up" : "chevron-down"} size={14} color={colors.mutedForeground} style={{ marginTop: 4 }} />
                    </View>
                  </TouchableOpacity>

                  {isOpen && (
                    <View style={[styles.consentBody, { borderTopColor: colors.border }]}>
                      {c.lastAccess && (
                        <View style={[styles.lastAccessRow, { backgroundColor: colors.background }]}>
                          <Feather name="eye" size={11} color={colors.mutedForeground} />
                          <Text style={[styles.lastAccessText, { color: colors.mutedForeground }]}>
                            Last accessed: {c.lastAccess}
                          </Text>
                        </View>
                      )}

                      <Text style={[styles.dataLabel, { color: colors.mutedForeground }]}>DATA ACCESS CONTROLS</Text>
                      {c.dataTypes.map((d) => (
                        <View key={d.key} style={[styles.dataRow, { borderBottomColor: colors.border }]}>
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.dataRowLabel, { color: colors.foreground }]}>{d.label}</Text>
                            {isGovt && (
                              <Text style={[styles.mandatoryText, { color: "#dc2626" }]}>Mandatory by law</Text>
                            )}
                          </View>
                          <Switch
                            value={d.enabled}
                            onValueChange={() => toggleDataType(c.id, d.key, isGovt)}
                            trackColor={{ false: "#e2e8f0", true: entityColor + "40" }}
                            thumbColor={d.enabled ? entityColor : "#94a3b8"}
                            disabled={isGovt}
                          />
                        </View>
                      ))}

                      {!isGovt && (
                        <TouchableOpacity
                          style={[styles.revokeBtn, { borderColor: "#dc2626" }]}
                          onPress={() => revokeConsent(c.id, c.entity)}
                        >
                          <Feather name="x-circle" size={14} color="#dc2626" />
                          <Text style={styles.revokeBtnText}>Revoke All Access</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </>
        )}

        {tab === "log" && (
          <>
            <View style={[styles.infoBox, { backgroundColor: "#fef3c7", borderColor: "#fbbf24" }]}>
              <Feather name="clock" size={13} color="#92400e" />
              <Text style={[styles.infoText, { color: "#92400e" }]}>
                Every access to your property data is logged here. You can report unauthorized access to the grievance officer.
              </Text>
            </View>
            {ACCESS_LOG.map((log, i) => (
              <View key={i} style={[styles.logCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.logTop}>
                  <View style={[styles.logDot, { backgroundColor: "#0891b2" }]} />
                  <Text style={[styles.logEntity, { color: colors.foreground }]}>{log.entity}</Text>
                  <Text style={[styles.logTime, { color: colors.mutedForeground }]}>{log.time}</Text>
                </View>
                <Text style={[styles.logAction, { color: colors.foreground }]}>{log.action}</Text>
                <View style={[styles.logDataBox, { backgroundColor: "#f0f9ff" }]}>
                  <Feather name="eye" size={10} color="#0891b2" />
                  <Text style={{ fontSize: 11, color: "#0369a1" }}>{log.dataAccessed}</Text>
                </View>
              </View>
            ))}
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
  headerBadgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  tabRow: { flexDirection: "row" },
  tabBtn: { flex: 1, paddingVertical: 11, alignItems: "center", borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabBtnActive: { borderBottomColor: "#0891b2" },
  tabText: { fontSize: 12, fontWeight: "700" },
  body: { padding: 16, gap: 12 },
  infoBox: { flexDirection: "row", gap: 8, padding: 12, borderRadius: 10, borderWidth: 1, alignItems: "flex-start" },
  infoText: { flex: 1, fontSize: 12, lineHeight: 17 },
  consentCard: { borderRadius: 12, borderWidth: 1, overflow: "hidden" },
  consentHeader: { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 14 },
  entityIcon: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  entityName: { fontSize: 13, fontWeight: "700" },
  entityPurpose: { fontSize: 11, marginTop: 1 },
  consentMeta: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  typePill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  typeText: { fontSize: 9, fontWeight: "800" },
  validText: { fontSize: 10 },
  consentRight: { alignItems: "center" },
  enabledCount: { fontSize: 18, fontWeight: "800" },
  enabledLabel: { fontSize: 9, marginTop: -2 },
  consentBody: { borderTopWidth: 1, paddingHorizontal: 14, paddingBottom: 14, gap: 8 },
  lastAccessRow: { flexDirection: "row", alignItems: "center", gap: 5, padding: 8, borderRadius: 8, marginTop: 8 },
  lastAccessText: { fontSize: 11 },
  dataLabel: { fontSize: 9, fontWeight: "800", letterSpacing: 0.5, marginTop: 4 },
  dataRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1 },
  dataRowLabel: { fontSize: 13, fontWeight: "500" },
  mandatoryText: { fontSize: 10, fontWeight: "600", marginTop: 1 },
  revokeBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 8, borderWidth: 1, marginTop: 4 },
  revokeBtnText: { color: "#dc2626", fontSize: 13, fontWeight: "700" },
  logCard: { borderRadius: 10, borderWidth: 1, padding: 12, gap: 6 },
  logTop: { flexDirection: "row", alignItems: "center", gap: 7 },
  logDot: { width: 8, height: 8, borderRadius: 4 },
  logEntity: { fontSize: 13, fontWeight: "700", flex: 1 },
  logTime: { fontSize: 10 },
  logAction: { fontSize: 12 },
  logDataBox: { flexDirection: "row", gap: 5, padding: 7, borderRadius: 7, alignItems: "center" },
});
