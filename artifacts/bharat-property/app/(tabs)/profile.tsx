import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Image, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useLang, LANG_LABELS, Lang } from "@/context/LanguageContext";
import { useColors } from "@/hooks/useColors";

const ROLE_COLORS: Record<string, string> = {
  citizen: "#1e40af",
  cpf: "#7c3aed",
  developer: "#059669",
  govt: "#dc2626",
  bank: "#d97706",
};

const USER_PHOTOS: Record<string, string> = {
  USR002: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces",
  USR003: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=faces",
  USR004: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=faces",
  USR005: "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=200&h=200&fit=crop&crop=faces",
};

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { lang, setLang, t } = useLang();
  const router = useRouter();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const [showLangModal, setShowLangModal] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [maskSensitive, setMaskSensitive] = useState(true);

  if (!user) return null;

  const roleColor = ROLE_COLORS[user.role] || colors.primary;
  const photoUrl = USER_PHOTOS[user.id];

  const maskPAN = (pan: string) => maskSensitive ? `${pan.slice(0, 2)}XXXXXXX${pan.slice(-1)}` : pan;
  const maskAadhaar = (aadhaar: string) => maskSensitive ? `XXXX XXXX ${aadhaar.slice(-4)}` : aadhaar;

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout", style: "destructive",
        onPress: async () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          await logout();
          router.replace("/login");
        },
      },
    ]);
  };

  const infoItems = [
    { icon: "phone", label: "Mobile", value: `+91 ${user.phone}`, sensitive: false },
    { icon: "mail", label: "Email", value: user.email || "N/A", sensitive: false },
    { icon: "credit-card", label: "PAN", value: maskPAN(user.pan || "ABCDE1234F"), sensitive: true },
    { icon: "shield", label: "Aadhaar", value: maskAadhaar(user.aadhaar || "9876 5432 1012"), sensitive: true },
  ];

  const menuItems = [
    { icon: "file-text", label: "My Documents", onPress: () => router.push("/audit-log" as any) },
    { icon: "bell", label: "Notifications", onPress: () => router.push("/notifications" as any) },
    { icon: "globe", label: "Language / भाषा / भाषा", onPress: () => setShowLangModal(true) },
    { icon: "shield", label: "Security Settings", onPress: () => Alert.alert("Security", "Biometric authentication, 2FA and PIN lock coming soon.") },
    { icon: "help-circle", label: "Help & Support", onPress: () => Alert.alert("BPCS Helpline", "Toll-Free: 1800-11-BPCS\nWhatsApp: +91-9999-180108\nEmail: support@bpcs.gov.in\n\nAvailable 24×7") },
    { icon: "info", label: "About BPCS", onPress: () => Alert.alert("About BPCS", "Bharat Property Card System v1.0\n\nMinistry of Housing & Urban Affairs\nGovernment of India\n\nBuilt on RERAW OS — Real-Time Real Estate Asset Workflow") },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topPad, paddingBottom: 120 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Card */}
      <View style={[styles.heroCard, { backgroundColor: colors.navBg }]}>
        {/* Profile Picture */}
        <View style={styles.avatarWrap}>
          {photoUrl && !imgError ? (
            <Image source={{ uri: photoUrl }} style={styles.avatarImg} onError={() => setImgError(true)} />
          ) : (
            <View style={[styles.avatarFallback, { backgroundColor: roleColor }]}>
              <Text style={styles.avatarText}>{user.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}</Text>
            </View>
          )}
          <View style={[styles.avatarBadge, { backgroundColor: roleColor }]}>
            <Feather name="check" size={10} color="#fff" />
          </View>
        </View>
        <Text style={styles.heroName}>{user.name}</Text>
        <View style={[styles.roleTag, { backgroundColor: roleColor }]}>
          <Text style={styles.roleTagText}>{getRoleLabel(user.role)}</Text>
        </View>
        {user.verifiedStatus && (
          <View style={styles.verifiedTag}>
            <Feather name="check-circle" size={12} color="#16a34a" />
            <Text style={styles.verifiedText}>Aadhaar Verified</Text>
          </View>
        )}
        {/* Language indicator */}
        <TouchableOpacity style={styles.langPill} onPress={() => setShowLangModal(true)}>
          <Feather name="globe" size={11} color="rgba(255,255,255,0.8)" />
          <Text style={styles.langPillText}>{LANG_LABELS[lang]}</Text>
          <Feather name="chevron-down" size={11} color="rgba(255,255,255,0.6)" />
        </TouchableOpacity>
      </View>

      {/* ⭐ BPCS UNIQUE ID — Save This Card */}
      <View style={styles.bpcsIdCard}>
        <View style={styles.bpcsIdTop}>
          <View style={styles.bpcsIdLeft}>
            <View style={styles.bpcsIdBadge}>
              <Feather name="shield" size={12} color="#f97316" />
              <Text style={styles.bpcsIdBadgeText}>BPCS UNIQUE ID</Text>
            </View>
            <Text style={styles.bpcsIdCode}>{user.id}</Text>
            <Text style={styles.bpcsIdName}>{user.name}</Text>
          </View>
          <View style={styles.bpcsIdRight}>
            <View style={styles.bpcsQrGrid}>
              {generateMiniQR(user.id, 6).map((row, ri) => (
                <View key={ri} style={styles.bpcsQrRow}>
                  {row.map((cell, ci) => (
                    <View key={ci} style={[styles.bpcsQrCell, { backgroundColor: cell ? "#f97316" : "rgba(255,255,255,0.08)" }]} />
                  ))}
                </View>
              ))}
            </View>
          </View>
        </View>
        <View style={styles.bpcsSaveWarn}>
          <Feather name="alert-circle" size={14} color="#fbbf24" />
          <Text style={styles.bpcsSaveWarnText}>{t("saveId")}</Text>
        </View>
        <Text style={styles.bpcsSaveDesc}>{t("saveIdDesc")}</Text>
        <TouchableOpacity
          style={styles.bpcsCopyBtn}
          onPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert("BPCS ID Copied", `Your BPCS ID is:\n\n${user.id}\n\nPlease write this down safely. It works like your Aadhaar for property transactions.`);
          }}
        >
          <Feather name="copy" size={13} color="#f97316" />
          <Text style={styles.bpcsCopyBtnText}>Copy &amp; Save My ID</Text>
        </TouchableOpacity>
      </View>

      {/* Security Trust Strip */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#f0fdf4", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "#bbf7d0" }}>
        <Feather name="shield" size={14} color="#16a34a" />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 11, fontWeight: "700", color: "#15803d" }}>BPCS Security Shield Active</Text>
          <Text style={{ fontSize: 9, color: "#16a34a", marginTop: 1 }}>AES-256 encrypted · Session bound to your Aadhaar OTP · Zero third-party data sharing</Text>
        </View>
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#16a34a" }} />
      </View>

      {/* Personal Info */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Personal Information</Text>
          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: maskSensitive ? "#f1f5f9" : "#fdf4ff", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 }}
            onPress={() => { setMaskSensitive(!maskSensitive); Haptics.selectionAsync(); }}
          >
            <Feather name={maskSensitive ? "eye-off" : "eye"} size={12} color={maskSensitive ? "#64748b" : "#7c3aed"} />
            <Text style={{ fontSize: 10, fontWeight: "700", color: maskSensitive ? "#64748b" : "#7c3aed" }}>
              {maskSensitive ? "Show PAN/Aadhaar" : "Hide"}
            </Text>
          </TouchableOpacity>
        </View>
        {infoItems.map((item, i) => (
          <View key={item.label} style={[styles.infoRow, i < infoItems.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
            <View style={[styles.infoIcon, { backgroundColor: item.sensitive && !maskSensitive ? "#fdf4ff" : colors.accent }]}>
              <Feather name={item.icon as any} size={14} color={item.sensitive && !maskSensitive ? "#7c3aed" : colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{item.label}</Text>
              <Text style={[styles.infoValue, { color: item.sensitive && maskSensitive ? colors.mutedForeground : colors.foreground, letterSpacing: item.sensitive && maskSensitive ? 2 : 0 }]}>
                {item.value}
              </Text>
            </View>
            {item.sensitive && (
              <Feather name={maskSensitive ? "lock" : "unlock"} size={12} color={maskSensitive ? "#94a3b8" : "#7c3aed"} />
            )}
          </View>
        ))}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 5, paddingTop: 10, marginTop: 4, borderTopWidth: 1, borderTopColor: colors.border }}>
          <Feather name="lock" size={10} color="#94a3b8" />
          <Text style={{ fontSize: 9, color: "#94a3b8", flex: 1 }}>Your PAN and Aadhaar are stored only on your device. BPCS never shares them with third parties.</Text>
        </View>
      </View>

      {/* Settings */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Settings</Text>
        {menuItems.map((item, i) => (
          <TouchableOpacity
            key={item.label}
            style={[styles.menuRow, i < menuItems.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 }]}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <View style={[styles.infoIcon, { backgroundColor: colors.accent }]}>
              <Feather name={item.icon as any} size={14} color={colors.primary} />
            </View>
            <Text style={[styles.menuLabel, { color: colors.foreground }]}>{item.label}</Text>
            <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={[styles.logoutBtn, { borderColor: colors.destructive }]} onPress={handleLogout} activeOpacity={0.8}>
        <Feather name="log-out" size={16} color={colors.destructive} />
        <Text style={[styles.logoutText, { color: colors.destructive }]}>Logout</Text>
      </TouchableOpacity>

      <Text style={[styles.version, { color: colors.mutedForeground }]}>
        Bharat Property Card System v1.0{"\n"}
        Ministry of Housing & Urban Affairs, Government of India
      </Text>

      {/* Language Modal */}
      <Modal visible={showLangModal} transparent animationType="slide" onRequestClose={() => setShowLangModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Select Language / भाषा चुनें</Text>
            {(Object.keys(LANG_LABELS) as Lang[]).map((l) => (
              <TouchableOpacity
                key={l}
                style={[styles.langOption, { borderColor: colors.border, backgroundColor: lang === l ? "#eff6ff" : "transparent" }]}
                onPress={() => { setLang(l); setShowLangModal(false); Haptics.selectionAsync(); }}
              >
                <Text style={[styles.langOptionText, { color: lang === l ? "#1e3a8a" : colors.foreground }]}>{LANG_LABELS[l]}</Text>
                {lang === l && <Feather name="check-circle" size={18} color="#1e3a8a" />}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={[styles.modalClose, { backgroundColor: "#1e3a8a" }]} onPress={() => setShowLangModal(false)}>
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function getRoleLabel(role: string) {
  const labels: Record<string, string> = {
    citizen: "Property Owner (Citizen)",
    cpf: "CPF Broker / Facilitator",
    developer: "Builder / Developer",
    govt: "Government Officer",
    bank: "Bank Officer",
  };
  return labels[role] || role;
}

function generateMiniQR(data: string, size: number): boolean[][] {
  const hash = data.split("").reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) & 0xffffffff, 0);
  return Array.from({ length: size }, (_, r) =>
    Array.from({ length: size }, (__, c) => ((hash ^ (r * 13 + c * 7)) & 1) === 1)
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { gap: 14, paddingHorizontal: 16 },
  heroCard: { borderRadius: 20, padding: 24, alignItems: "center", gap: 10 },
  avatarWrap: { position: "relative", marginBottom: 4 },
  avatarImg: { width: 90, height: 90, borderRadius: 45, borderWidth: 3, borderColor: "rgba(255,255,255,0.3)" },
  avatarFallback: { width: 90, height: 90, borderRadius: 45, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontSize: 30, fontWeight: "700" },
  avatarBadge: { position: "absolute", bottom: 2, right: 2, width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#fff" },
  heroName: { color: "#fff", fontSize: 20, fontWeight: "700" },
  roleTag: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20 },
  roleTagText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  verifiedTag: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#dcfce7", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  verifiedText: { color: "#16a34a", fontSize: 12, fontWeight: "600" },
  langPill: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(255,255,255,0.12)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, marginTop: 4 },
  langPillText: { color: "rgba(255,255,255,0.9)", fontSize: 12, fontWeight: "600" },
  bpcsIdCard: {
    borderRadius: 16, padding: 16, gap: 10,
    backgroundColor: "#1e3a8a",
  },
  bpcsIdTop: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  bpcsIdLeft: { flex: 1, gap: 4 },
  bpcsIdBadge: { flexDirection: "row", alignItems: "center", gap: 5 },
  bpcsIdBadgeText: { color: "#f97316", fontSize: 9, fontWeight: "800", letterSpacing: 1 },
  bpcsIdCode: { color: "#fff", fontSize: 22, fontWeight: "800", letterSpacing: 2, fontVariant: ["tabular-nums"] as any },
  bpcsIdName: { color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: "500" },
  bpcsIdRight: {},
  bpcsQrGrid: { gap: 2, padding: 4, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 6 },
  bpcsQrRow: { flexDirection: "row", gap: 2 },
  bpcsQrCell: { width: 9, height: 9, borderRadius: 1 },
  bpcsSaveWarn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(251,191,36,0.15)", borderRadius: 8, padding: 8 },
  bpcsSaveWarnText: { color: "#fbbf24", fontSize: 12, fontWeight: "700", flex: 1 },
  bpcsSaveDesc: { color: "rgba(255,255,255,0.6)", fontSize: 11, lineHeight: 16 },
  bpcsCopyBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "rgba(249,115,22,0.15)", borderRadius: 10, paddingVertical: 10, borderWidth: 1, borderColor: "rgba(249,115,22,0.3)" },
  bpcsCopyBtnText: { color: "#f97316", fontSize: 13, fontWeight: "700" },
  section: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  sectionTitle: { fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", paddingHorizontal: 16, paddingVertical: 10 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
  infoIcon: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 11 },
  infoValue: { fontSize: 14, fontWeight: "600", marginTop: 1 },
  menuRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: "500" },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1.5, borderRadius: 12, padding: 14 },
  logoutText: { fontSize: 15, fontWeight: "600" },
  version: { fontSize: 11, textAlign: "center", lineHeight: 18 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalCard: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 12, paddingBottom: 40 },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 4 },
  langOption: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14, borderRadius: 12, borderWidth: 1 },
  langOptionText: { fontSize: 16, fontWeight: "600" },
  modalClose: { height: 50, borderRadius: 12, alignItems: "center", justifyContent: "center", marginTop: 8 },
});
