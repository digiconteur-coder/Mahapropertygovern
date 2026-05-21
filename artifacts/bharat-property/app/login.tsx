import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert, Animated, Platform, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth, UserRole } from "@/context/AuthContext";

const ROLES: { role: UserRole; label: string; icon: string; desc: string; phone: string; color: string }[] = [
  { role: "citizen", label: "Citizen", icon: "user", desc: "Property Owner", phone: "9876543210", color: "#1e40af" },
  { role: "cpf", label: "CPF Broker", icon: "users", desc: "Facilitator", phone: "9123456780", color: "#7c3aed" },
  { role: "developer", label: "Developer", icon: "layers" as any, desc: "Builder / RERA", phone: "9000012345", color: "#059669" },
  { role: "govt", label: "Govt Officer", icon: "shield", desc: "Sub-Registrar", phone: "9700012345", color: "#dc2626" },
  { role: "bank", label: "Bank / NBFC", icon: "credit-card", desc: "Loan Provider", phone: "9800012345", color: "#d97706" },
];

const MARQUEE_ITEMS = [
  "🏠 PMAY 2.0 — ₹3L subsidy for eligible homebuyers under 2026 Budget",
  "⚡ Stamp Duty Waiver extended for Women & Senior Citizen Property Owners",
  "🔒 Digital Registration in 5 Working Days — RERAW Act 2026 SLA",
  "🛡️ RERA 2026 — Zero Fraud Protection · Mandatory BUID for all transfers",
  "📞 Free Legal Aid via BPCS Helpline 1800-11-BPCS · Open 24×7",
  "🗺️ GIS-linked property mapping now live across 28 states",
];

const KEY_STATS = [
  { num: "8.2L+", label: "Properties\nRegistered", icon: "home" },
  { num: "96%", label: "Faster than\nOffline", icon: "zap" },
  { num: "₹0", label: "Agent Fee\nNeeded", icon: "shield" },
  { num: "24×7", label: "Live\nSupport", icon: "headphones" },
];

const DPI_STACK = [
  { icon: "user-check", label: "Aadhaar", sub: "Identity Layer", color: "#1e40af" },
  { icon: "zap", label: "UPI", sub: "Payment Layer", color: "#059669" },
  { icon: "folder", label: "DigiLocker", sub: "Document Layer", color: "#d97706" },
  { icon: "grid", label: "BPC", sub: "Property Layer", color: "#f97316", highlight: true },
];

const HOW_IT_WORKS = [
  { step: "01", icon: "user-check", title: "eKYC", desc: "Aadhaar + PAN\nverification" },
  { step: "02", icon: "grid", title: "Get BUID", desc: "Unique Bharat\nProperty ID" },
  { step: "03", icon: "send", title: "Transfer", desc: "CPF-assisted\nDigital Deed" },
  { step: "04", icon: "check-circle", title: "Done", desc: "Sub-Registrar\napproves digitally" },
];

const ROLE_INFO = [
  { icon: "user", title: "Citizens", desc: "Register, verify & transfer property ownership digitally. No queues.", color: "#1e40af" },
  { icon: "users", title: "CPF Brokers", desc: "Manage client pipelines, escrow & RERA compliance end-to-end.", color: "#7c3aed" },
  { icon: "layers" as any, title: "Developers", desc: "List inventory, manage RERA filings & buyer documentation.", color: "#059669" },
  { icon: "shield", title: "Govt Officers", desc: "Approve transfers, verify documents & access the Sovereign Audit Ledger.", color: "#dc2626" },
];

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { login } = useAuth();

  const [selectedRole, setSelectedRole] = useState<UserRole>("citizen");
  const [phone, setPhone] = useState("9876543210");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [marqueeIdx, setMarqueeIdx] = useState(0);
  const marqueeFade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.timing(marqueeFade, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
        setMarqueeIdx((i) => (i + 1) % MARQUEE_ITEMS.length);
        Animated.timing(marqueeFade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const selectedRoleInfo = ROLES.find((r) => r.role === selectedRole)!;

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setPhone(ROLES.find((r) => r.role === role)?.phone || "");
    setStep("phone");
    setOtp("");
    Haptics.selectionAsync();
  };

  const handleSendOtp = () => {
    if (phone.length !== 10) { Alert.alert("Invalid Number", "Please enter a valid 10-digit mobile number."); return; }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setStep("otp");
    Alert.alert("OTP Sent ✓", "Demo OTP: 123456\n\nIn production this is sent via UIDAI Aadhaar OTP.", [{ text: "OK" }]);
  };

  const handleLogin = async () => {
    if (otp.length !== 6) { Alert.alert("Invalid OTP", "Please enter the 6-digit OTP."); return; }
    if (otp !== "123456") { Alert.alert("Wrong OTP", "Demo OTP is 123456"); return; }
    setLoading(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try { await login(phone, selectedRole); router.replace("/(tabs)"); }
    finally { setLoading(false); }
  };

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const botInset = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: topInset + 12, paddingBottom: botInset + 24 }]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* ── GOVT HEADER ── */}
      <View style={styles.govtHeader}>
        <View style={styles.govtBadge}>
          <Feather name="shield" size={11} color="#f97316" />
          <Text style={styles.govtBadgeText}>GOVERNMENT OF INDIA · MINISTRY OF HOUSING & URBAN AFFAIRS</Text>
        </View>
      </View>

      {/* ── HERO — App Identity (NO personal name before login) ── */}
      <View style={styles.hero}>
        <View style={styles.logoBox}>
          <Feather name="layers" size={30} color="#fff" />
          <Text style={styles.logoBoxText}>BPCS</Text>
        </View>
        <Text style={styles.appTitle}>Bharat Property Card</Text>
        <Text style={styles.appTagline}>DigiLocker for Real Estate</Text>
        <Text style={styles.appMotto}>"Meri Zameen, Meri Pehchaan"</Text>
        <Text style={styles.appDesc}>राष्ट्रीय संपत्ति प्रबंधन प्रणाली · National Property Governance Infrastructure</Text>
        <View style={styles.actBadge}>
          <Feather name="check-circle" size={10} color="#4ade80" />
          <Text style={styles.actBadgeText}>Notified under RERAW Act 2026 · Effective 01 Jan 2026</Text>
        </View>
      </View>

      {/* ── SCROLLING MARQUEE — Live Updates ── */}
      <View style={styles.marqueeWrap}>
        <View style={styles.marqueeLive}>
          <Text style={styles.marqueeLiveText}>LIVE</Text>
        </View>
        <Animated.Text style={[styles.marqueeText, { opacity: marqueeFade }]} numberOfLines={1}>
          {MARQUEE_ITEMS[marqueeIdx]}
        </Animated.Text>
      </View>

      {/* ── KEY STATS ── */}
      <View style={styles.statsRow}>
        {KEY_STATS.map((stat) => (
          <View key={stat.num} style={styles.statCard}>
            <Feather name={stat.icon as any} size={14} color="#f97316" />
            <Text style={styles.statNum}>{stat.num}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* ── INDIA'S DIGITAL PUBLIC INFRASTRUCTURE STACK ── */}
      <View style={styles.dpiSection}>
        <Text style={styles.dpiTitle}>India's Digital Public Infrastructure</Text>
        <Text style={styles.dpiSub}>BPC completes India's DPI stack for the nation's largest asset class</Text>
        <View style={styles.dpiRow}>
          {DPI_STACK.map((item, i) => (
            <React.Fragment key={item.label}>
              <View style={[styles.dpiItem, item.highlight && styles.dpiItemHighlight]}>
                <View style={[styles.dpiIcon, { backgroundColor: item.color + (item.highlight ? "ff" : "22") }]}>
                  <Feather name={item.icon as any} size={item.highlight ? 18 : 14} color={item.highlight ? "#fff" : item.color} />
                </View>
                <Text style={[styles.dpiLabel, item.highlight && { color: "#f97316", fontWeight: "800" }]}>{item.label}</Text>
                <Text style={styles.dpiSublabel}>{item.sub}</Text>
                {item.highlight && (
                  <View style={styles.dpiNewBadge}>
                    <Text style={styles.dpiNewText}>2026</Text>
                  </View>
                )}
              </View>
              {i < DPI_STACK.length - 1 && (
                <Feather name="chevron-right" size={14} color="rgba(255,255,255,0.2)" style={{ marginTop: 12 }} />
              )}
            </React.Fragment>
          ))}
        </View>
      </View>

      {/* ── WHO IS THIS FOR? ── */}
      <View style={styles.roleSection}>
        <Text style={styles.roleSectionTitle}>Who Uses BPCS?</Text>
        <View style={styles.roleGrid}>
          {ROLE_INFO.map((r) => (
            <View key={r.title} style={[styles.roleInfoCard, { borderLeftColor: r.color }]}>
              <View style={[styles.roleInfoIcon, { backgroundColor: r.color + "18" }]}>
                <Feather name={r.icon as any} size={14} color={r.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.roleInfoTitle, { color: r.color }]}>{r.title}</Text>
                <Text style={styles.roleInfoDesc}>{r.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* ── HOW IT WORKS ── */}
      <View style={styles.howSection}>
        <Text style={styles.sectionHeading}>How BPCS Works</Text>
        <Text style={styles.sectionSub}>4 steps · Fully digital · Faster than any offline process</Text>
        <View style={styles.howRow}>
          {HOW_IT_WORKS.map((item, i) => (
            <React.Fragment key={item.step}>
              <View style={styles.howItem}>
                <View style={styles.howIconWrap}>
                  <Feather name={item.icon as any} size={13} color="#1e3a8a" />
                  <View style={styles.howBadge}>
                    <Text style={styles.howBadgeText}>{item.step}</Text>
                  </View>
                </View>
                <Text style={styles.howTitle}>{item.title}</Text>
                <Text style={styles.howDesc}>{item.desc}</Text>
              </View>
              {i < HOW_IT_WORKS.length - 1 && (
                <Feather name="chevron-right" size={13} color="rgba(255,255,255,0.25)" style={{ marginTop: 10 }} />
              )}
            </React.Fragment>
          ))}
        </View>
      </View>

      {/* ── POLICY BANNER ── */}
      <View style={styles.policyBanner}>
        <View style={styles.policyIcon}>
          <Feather name="zap" size={16} color="#f97316" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.policyTitle}>Faster than Offline — Always</Text>
          <Text style={styles.policyDesc}>
            RERAW Act 2026 mandates all property transfers complete within 5 working days.
            Zero queues. Zero middlemen. Zero bribes. Digital-first Bharat.
          </Text>
        </View>
      </View>

      {/* ── LOGIN CARD ── */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Select Your Role & Login</Text>
        <Text style={styles.cardSub}>Aadhaar-verified OTP authentication</Text>
        <View style={styles.rolesGrid}>
          {ROLES.map((r) => (
            <TouchableOpacity
              key={r.role}
              style={[
                styles.roleBtn,
                { borderColor: selectedRole === r.role ? r.color : "#e2e8f0" },
                selectedRole === r.role && { backgroundColor: r.color + "10" },
              ]}
              onPress={() => handleRoleSelect(r.role)}
              activeOpacity={0.7}
            >
              <View style={[styles.roleBtnIcon, { backgroundColor: selectedRole === r.role ? r.color : "#f1f5f9" }]}>
                <Feather name={r.icon as any} size={14} color={selectedRole === r.role ? "#fff" : "#64748b"} />
              </View>
              <Text style={[styles.roleLabel, { color: selectedRole === r.role ? r.color : "#0f172a" }]}>{r.label}</Text>
              <Text style={styles.roleDesc}>{r.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.divider} />

        {step === "phone" ? (
          <>
            <Text style={styles.inputLabel}>Mobile Number (Aadhaar-linked)</Text>
            <View style={styles.inputRow}>
              <View style={styles.prefixWrap}>
                <Text style={styles.prefix}>🇮🇳 +91</Text>
              </View>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="10-digit mobile"
                placeholderTextColor="#94a3b8"
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: selectedRoleInfo.color }]}
              onPress={handleSendOtp}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryBtnText}>Send OTP via Aadhaar</Text>
              <Feather name="arrow-right" size={18} color="#fff" />
            </TouchableOpacity>
            <View style={styles.altLoginRow}>
              <Feather name="smartphone" size={11} color="#94a3b8" />
              <Text style={styles.altLoginText}>Also available via DigiLocker · UIDAI eKYC · Face Auth</Text>
            </View>
          </>
        ) : (
          <>
            <View style={styles.otpHeader}>
              <View>
                <Text style={styles.inputLabel}>OTP sent to +91 {phone}</Text>
                <Text style={styles.otpMeta}>Valid for 5 minutes · 3 attempts allowed</Text>
              </View>
              <TouchableOpacity onPress={() => setStep("phone")}>
                <Text style={[styles.changeLink, { color: selectedRoleInfo.color }]}>Change →</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.otpInput}
              value={otp}
              onChangeText={setOtp}
              placeholder="● ● ● ● ● ●"
              placeholderTextColor="#cbd5e1"
              keyboardType="number-pad"
              maxLength={6}
            />
            <View style={styles.demoHintRow}>
              <Feather name="info" size={11} color="#7c3aed" />
              <Text style={styles.demoHint}>Demo OTP: 123456</Text>
            </View>
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: selectedRoleInfo.color, opacity: loading ? 0.7 : 1 }]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryBtnText}>{loading ? "Verifying…" : `Login as ${selectedRoleInfo.label}`}</Text>
              {!loading && <Feather name="check" size={18} color="#fff" />}
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footerSection}>
        <View style={styles.footerRow}>
          <Feather name="lock" size={11} color="#475569" />
          <Text style={styles.footerText}>256-bit SSL Encrypted · Powered by UIDAI Aadhaar OTP · NIC Hosting</Text>
        </View>
        <View style={styles.footerRow}>
          <Feather name="shield" size={11} color="#475569" />
          <Text style={styles.footerText}>Ministry of Housing & Urban Affairs · RERAW Act 2026 · v2.1.0</Text>
        </View>
        <View style={styles.footerRow}>
          <Feather name="calendar" size={11} color="#475569" />
          <Text style={styles.footerText}>Last updated: 15 May 2026 · Real-time data from NIC registry</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  content: { paddingHorizontal: 16, gap: 16 },

  govtHeader: { alignItems: "center" },
  govtBadge: { flexDirection: "row", alignItems: "center", gap: 5 },
  govtBadgeText: { color: "#f97316", fontSize: 8, fontWeight: "800", letterSpacing: 1 },

  hero: { alignItems: "center", gap: 6, paddingVertical: 16 },
  logoBox: { width: 70, height: 70, borderRadius: 18, backgroundColor: "#f97316", alignItems: "center", justifyContent: "center", gap: 2, marginBottom: 8 },
  logoBoxText: { color: "#fff", fontSize: 9, fontWeight: "800", letterSpacing: 1.5 },
  appTitle: { color: "#f8fafc", fontSize: 22, fontWeight: "800", textAlign: "center" },
  appTagline: { color: "#f97316", fontSize: 14, fontWeight: "700", textAlign: "center" },
  appMotto: { color: "#f8fafc", fontSize: 13, fontWeight: "600", fontStyle: "italic", textAlign: "center", opacity: 0.75 },
  appDesc: { color: "#475569", fontSize: 10, lineHeight: 16, textAlign: "center", paddingHorizontal: 16 },
  actBadge: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#14532d33", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: "#166534" },
  actBadgeText: { color: "#4ade80", fontSize: 9, fontWeight: "700" },

  marqueeWrap: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#1e293b", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  marqueeLive: { backgroundColor: "#dc2626", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  marqueeLiveText: { color: "#fff", fontSize: 8, fontWeight: "800", letterSpacing: 1 },
  marqueeText: { color: "#f97316", fontSize: 11, fontWeight: "600", flex: 1 },

  statsRow: { flexDirection: "row", gap: 8 },
  statCard: { flex: 1, backgroundColor: "#1e293b", borderRadius: 12, padding: 10, alignItems: "center", gap: 4 },
  statNum: { color: "#fff", fontSize: 14, fontWeight: "800" },
  statLabel: { color: "#64748b", fontSize: 8, fontWeight: "600", textAlign: "center", lineHeight: 12 },

  dpiSection: { backgroundColor: "#1e293b", borderRadius: 16, padding: 16, gap: 12 },
  dpiTitle: { color: "#f8fafc", fontSize: 14, fontWeight: "800" },
  dpiSub: { color: "#64748b", fontSize: 10, lineHeight: 15 },
  dpiRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  dpiItem: { alignItems: "center", gap: 4, flex: 1 },
  dpiItemHighlight: { },
  dpiIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  dpiLabel: { color: "#94a3b8", fontSize: 10, fontWeight: "700", textAlign: "center" },
  dpiSublabel: { color: "#475569", fontSize: 8, textAlign: "center" },
  dpiNewBadge: { backgroundColor: "#f97316", paddingHorizontal: 5, paddingVertical: 1, borderRadius: 6 },
  dpiNewText: { color: "#fff", fontSize: 7, fontWeight: "800" },

  roleSection: { gap: 10 },
  roleSectionTitle: { color: "#f8fafc", fontSize: 14, fontWeight: "800" },
  roleGrid: { gap: 8 },
  roleInfoCard: { flexDirection: "row", alignItems: "flex-start", gap: 10, backgroundColor: "#1e293b", borderRadius: 12, padding: 12, borderLeftWidth: 3 },
  roleInfoIcon: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  roleInfoTitle: { fontSize: 12, fontWeight: "700", marginBottom: 2 },
  roleInfoDesc: { color: "#64748b", fontSize: 10, lineHeight: 14 },

  howSection: { gap: 10 },
  sectionHeading: { color: "#fff", fontSize: 15, fontWeight: "800" },
  sectionSub: { color: "#64748b", fontSize: 10 },
  howRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  howItem: { flex: 1, alignItems: "center", gap: 5 },
  howIconWrap: { width: 34, height: 34, borderRadius: 10, backgroundColor: "#eff6ff", alignItems: "center", justifyContent: "center", position: "relative" },
  howBadge: { position: "absolute", top: -4, right: -4, width: 15, height: 15, borderRadius: 8, backgroundColor: "#f97316", alignItems: "center", justifyContent: "center" },
  howBadgeText: { color: "#fff", fontSize: 7, fontWeight: "800" },
  howTitle: { color: "#f8fafc", fontSize: 10, fontWeight: "700", textAlign: "center" },
  howDesc: { color: "#64748b", fontSize: 9, lineHeight: 12, textAlign: "center" },

  policyBanner: { flexDirection: "row", gap: 12, backgroundColor: "#1e293b", borderRadius: 14, padding: 14, alignItems: "flex-start", borderLeftWidth: 3, borderLeftColor: "#f97316" },
  policyIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: "rgba(249,115,22,0.15)", alignItems: "center", justifyContent: "center" },
  policyTitle: { color: "#fff", fontSize: 13, fontWeight: "700", marginBottom: 4 },
  policyDesc: { color: "#64748b", fontSize: 10, lineHeight: 15 },

  card: { borderRadius: 20, padding: 18, gap: 12, backgroundColor: "#fff" },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#0f172a" },
  cardSub: { fontSize: 11, color: "#64748b", marginTop: -6 },
  rolesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  roleBtn: { borderRadius: 12, borderWidth: 1.5, padding: 10, alignItems: "center", gap: 4, minWidth: "28%", flex: 1 },
  roleBtnIcon: { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  roleLabel: { fontSize: 10, fontWeight: "700", textAlign: "center" },
  roleDesc: { fontSize: 8, textAlign: "center", color: "#64748b" },
  divider: { height: 1, backgroundColor: "#e2e8f0" },
  inputLabel: { fontSize: 13, fontWeight: "600", color: "#374151" },
  inputRow: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10, height: 48, backgroundColor: "#f8fafc", overflow: "hidden" },
  prefixWrap: { paddingHorizontal: 12, height: "100%", justifyContent: "center", borderRightWidth: 1, borderRightColor: "#e2e8f0" },
  prefix: { fontSize: 13, fontWeight: "600", color: "#64748b" },
  input: { flex: 1, fontSize: 16, height: "100%", color: "#0f172a", paddingHorizontal: 12 },
  primaryBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 50, borderRadius: 12, marginTop: 4 },
  primaryBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  altLoginRow: { flexDirection: "row", alignItems: "center", gap: 5, justifyContent: "center" },
  altLoginText: { color: "#94a3b8", fontSize: 10 },
  otpHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  otpMeta: { color: "#94a3b8", fontSize: 10, marginTop: 1 },
  changeLink: { fontSize: 12, fontWeight: "600", marginTop: 4 },
  otpInput: { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10, paddingHorizontal: 16, height: 52, fontSize: 24, fontWeight: "700", letterSpacing: 8, backgroundColor: "#f8fafc", color: "#0f172a", textAlign: "center" },
  demoHintRow: { flexDirection: "row", alignItems: "center", gap: 5, justifyContent: "center" },
  demoHint: { fontSize: 12, color: "#7c3aed", fontWeight: "600" },

  footerSection: { gap: 5, alignItems: "center", paddingTop: 8 },
  footerRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  footerText: { color: "#334155", fontSize: 9 },
});
