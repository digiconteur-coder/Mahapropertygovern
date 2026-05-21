import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, FlatList, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useData } from "@/context/DataContext";
import { formatDateTime } from "@/utils/format";

const STATIC_NOTIFICATIONS = [
  { id: "n1", title: "Document Verified ✓", body: "Sale Deed for Flat 4B, Sunshine Residency has been verified by Sub-Registrar K. Iyer.", time: "2026-05-14T09:00:00Z", icon: "check-circle", color: "#16a34a", read: false, category: "document" },
  { id: "n2", title: "Loan Sanctioned — SBI", body: "Your loan application of ₹90L has been approved. Disbursement within 3–5 working days.", time: "2026-05-10T14:05:00Z", icon: "credit-card", color: "#7c3aed", read: true, category: "loan" },
  { id: "n3", title: "Govt Scheme Alert — PMAY 2.0", body: "You are eligible for PMAY 2.0 subsidy of ₹3L under 2026 Union Budget. Apply before 30 Jun 2026.", time: "2026-05-05T10:00:00Z", icon: "home", color: "#1e3a8a", read: true, category: "scheme" },
  { id: "n4", title: "Dispute Under Review", body: "Dispute on B-PID-DL-2026-003 has been assigned to Adv. Sunita Krishnamurthy. Next hearing: 20 May 2026.", time: "2026-05-01T11:15:00Z", icon: "alert-triangle", color: "#dc2626", read: true, category: "dispute" },
  { id: "n5", title: "RERAW 2026 Update", body: "New RERAW Act 2026 provisions effective 01 Jan 2026. Property transfer SLA reduced to 5 working days.", time: "2026-01-01T08:00:00Z", icon: "info", color: "#64748b", read: true, category: "system" },
];

const TRANSFER_STAGES = [
  { stage: 1, label: "Transfer Initiated", actor: "Rajesh Kumar Sharma (Seller)", eta: "Completed", done: true, color: "#16a34a" },
  { stage: 2, label: "CPF Broker Assigned", actor: "Sunil Mehta · CPF-MH-2026-0042", eta: "Completed", done: true, color: "#16a34a" },
  { stage: 3, label: "Document Verification", actor: "Sub-Registrar K. Iyer · Andheri Office", eta: "~2 hrs remaining", done: false, color: "#d97706", active: true },
  { stage: 4, label: "Legal Check by Lawyer", actor: "Adv. Sunita Krishnamurthy", eta: "Est. Tomorrow 11 AM", done: false, color: "#64748b" },
  { stage: 5, label: "Govt Approval (RERAW OS)", actor: "Tahsildar Office · Dist. Mumbai", eta: "Est. 2–3 working days", done: false, color: "#64748b" },
  { stage: 6, label: "Sovereign Ledger Registration", actor: "Auto-sealed — RERAW Sovereign Audit Ledger", eta: "Pending above steps", done: false, color: "#64748b" },
];

// ─── Live Advisor ─────────────────────────────────────────────────────────────
const ADVISORS = [
  {
    name: "Rohan Verma",
    role: "Property Legal Advisor",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces",
    status: "Available",
    wait: "0 min wait",
    lang: "Hindi · English",
    color: "#16a34a",
    statusDot: "#16a34a",
  },
  {
    name: "Meera Nair",
    role: "BPCS Transfer Expert",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces",
    status: "Available",
    wait: "0 min wait",
    lang: "Malayalam · English · Hindi",
    color: "#16a34a",
    statusDot: "#16a34a",
  },
  {
    name: "Arjun Pillai",
    role: "RERA & Loan Specialist",
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces",
    status: "Available",
    wait: "2 min wait",
    lang: "Tamil · English",
    color: "#d97706",
    statusDot: "#16a34a",
  },
];

function LiveAdvisorCard() {
  const colors = useColors();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [activeAdvisor, setActiveAdvisor] = useState(0);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.4, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const advisor = ADVISORS[activeAdvisor];

  return (
    <View style={[advisorStyles.card, { backgroundColor: colors.card, borderColor: "#bbf7d0" }]}>
      {/* Header */}
      <View style={advisorStyles.header}>
        <View style={advisorStyles.headerLeft}>
          <View style={advisorStyles.liveChip}>
            <Animated.View style={[advisorStyles.liveDot, { transform: [{ scale: pulseAnim }] }]} />
            <Text style={advisorStyles.liveText}>LIVE ADVISOR</Text>
          </View>
          <Text style={[advisorStyles.title, { color: colors.foreground }]}>Your Dedicated Property Expert</Text>
          <Text style={[advisorStyles.sub, { color: colors.mutedForeground }]}>
            No waiting. No transfer. Direct 1-on-1 help.
          </Text>
        </View>
        <View style={advisorStyles.noBusyBadge}>
          <Feather name="phone" size={10} color="#16a34a" />
          <Text style={advisorStyles.noBusyText}>Lines Open</Text>
        </View>
      </View>

      {/* Advisor profile */}
      <View style={advisorStyles.advisorRow}>
        <View style={advisorStyles.photoWrap}>
          <Image source={{ uri: advisor.photo }} style={advisorStyles.photo} />
          <Animated.View style={[advisorStyles.onlineDot, { transform: [{ scale: pulseAnim }] }]} />
        </View>
        <View style={{ flex: 1, gap: 3 }}>
          <Text style={[advisorStyles.advisorName, { color: colors.foreground }]}>{advisor.name}</Text>
          <Text style={[advisorStyles.advisorRole, { color: colors.mutedForeground }]}>{advisor.role}</Text>
          <View style={advisorStyles.metaRow}>
            <View style={[advisorStyles.availBadge, { backgroundColor: "#dcfce7" }]}>
              <Feather name="check-circle" size={10} color="#16a34a" />
              <Text style={advisorStyles.availText}>{advisor.status}</Text>
            </View>
            <View style={advisorStyles.waitBadge}>
              <Feather name="clock" size={10} color="#1d4ed8" />
              <Text style={advisorStyles.waitText}>{advisor.wait}</Text>
            </View>
          </View>
          <Text style={[advisorStyles.lang, { color: colors.mutedForeground }]}>
            <Feather name="globe" size={10} /> {advisor.lang}
          </Text>
        </View>
      </View>

      {/* All 3 advisors */}
      <View style={advisorStyles.allAdvisors}>
        {ADVISORS.map((adv, i) => (
          <TouchableOpacity
            key={i}
            style={[advisorStyles.thumbAdvisor, i === activeAdvisor && { borderColor: "#16a34a", borderWidth: 2 }]}
            onPress={() => setActiveAdvisor(i)}
          >
            <Image source={{ uri: adv.photo }} style={advisorStyles.thumbPhoto} />
            <View style={[advisorStyles.thumbDot, { backgroundColor: adv.statusDot }]} />
          </TouchableOpacity>
        ))}
        <Text style={[advisorStyles.allText, { color: colors.mutedForeground }]}>3 advisors online</Text>
      </View>

      {/* Action buttons */}
      <View style={advisorStyles.actions}>
        <TouchableOpacity style={[advisorStyles.actionBtn, { backgroundColor: "#16a34a" }]}>
          <Feather name="phone" size={16} color="#fff" />
          <Text style={advisorStyles.actionBtnText}>Call Now — Free</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[advisorStyles.actionBtnSm, { backgroundColor: "#1e3a8a" }]}>
          <Feather name="message-circle" size={16} color="#fff" />
          <Text style={advisorStyles.actionBtnSmText}>Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[advisorStyles.actionBtnSm, { backgroundColor: "#7c3aed" }]}>
          <Feather name="video" size={16} color="#fff" />
          <Text style={advisorStyles.actionBtnSmText}>Video</Text>
        </TouchableOpacity>
      </View>

      <Text style={advisorStyles.disclaimer}>
        🔒 All conversations recorded & stored on BPCS for your protection · Toll-free 1800-11-BPCS
      </Text>
    </View>
  );
}

// ─── Live Transfer Tracker ─────────────────────────────────────────────────────
function LiveTransferTracker() {
  const colors = useColors();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.3, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <View style={[styles.trackerCard, { backgroundColor: colors.card, borderColor: "#bfdbfe" }]}>
      <View style={styles.trackerHeader}>
        <View style={styles.trackerLeft}>
          <View style={styles.liveChip}>
            <Animated.View style={[styles.liveDot, { transform: [{ scale: pulseAnim }] }]} />
            <Text style={styles.liveText}>LIVE TRANSFER</Text>
          </View>
          <Text style={[styles.trackerTitle, { color: colors.foreground }]}>B-PID-MH-2026-002-L</Text>
          <Text style={[styles.trackerSub, { color: colors.mutedForeground }]}>Survey No. 45/2, Thane Rural · ₹85L</Text>
        </View>
        <View style={styles.etaBadge}>
          <Feather name="clock" size={12} color="#1d4ed8" />
          <Text style={styles.etaText}>~3 days</Text>
        </View>
      </View>

      <View style={[styles.slaBanner, { backgroundColor: "#eff6ff" }]}>
        <Feather name="zap" size={11} color="#1d4ed8" />
        <Text style={styles.slaText}>
          BPCS SLA: All transfers complete within 7 working days. Delay triggers auto-escalation to Tahsildar.
        </Text>
      </View>

      <View style={styles.timeline}>
        {TRANSFER_STAGES.map((s, i) => (
          <View key={s.stage} style={styles.timelineRow}>
            <View style={styles.timelineLeft}>
              <View style={[styles.stageDot, {
                backgroundColor: s.done ? "#16a34a" : (s as any).active ? "#d97706" : "#e2e8f0",
                borderColor: s.done ? "#16a34a" : (s as any).active ? "#d97706" : "#cbd5e1",
              }]}>
                {s.done ? <Feather name="check" size={10} color="#fff" />
                  : (s as any).active ? <Animated.View style={[styles.activeDotInner, { transform: [{ scale: pulseAnim }] }]} />
                    : <Text style={styles.stageNum}>{s.stage}</Text>}
              </View>
              {i < TRANSFER_STAGES.length - 1 && (
                <View style={[styles.stageLine, { backgroundColor: s.done ? "#16a34a" : "#e2e8f0" }]} />
              )}
            </View>
            <View style={[styles.timelineContent, { opacity: s.done || (s as any).active ? 1 : 0.5 }]}>
              <View style={styles.stageRow}>
                <Text style={[styles.stageLabel, {
                  color: s.done ? "#16a34a" : (s as any).active ? "#d97706" : colors.mutedForeground,
                  fontWeight: (s as any).active ? "700" : "600",
                }]}>{s.label}</Text>
                {(s as any).active && <View style={styles.activeChip}><Text style={styles.activeChipText}>IN PROGRESS</Text></View>}
              </View>
              <Text style={[styles.stageActor, { color: colors.mutedForeground }]}>{s.actor}</Text>
              <Text style={[styles.stageEta, { color: s.done ? "#16a34a" : (s as any).active ? "#d97706" : colors.mutedForeground }]}>
                ⏱ {s.eta}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function NotificationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { transactions } = useData();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const activeTransfer = transactions.find((t) => ["initiated", "verifying"].includes(t.status));
  const txNotif = activeTransfer ? [{
    id: "live_tx",
    title: "🔴 Live Transfer Update",
    body: `${activeTransfer.bpid} is at Stage 3 — Document Verification. Estimated: 2–3 working days.`,
    time: new Date().toISOString(),
    icon: "repeat",
    color: "#1d4ed8",
    read: false,
    category: "transfer",
    isLive: true,
  }] : [];

  const allNotifs = [...txNotif, ...STATIC_NOTIFICATIONS];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.navBg, paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications & Advisor</Text>
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{txNotif.length + 1} New</Text>
        </View>
      </View>

      <FlatList
        data={allNotifs}
        keyExtractor={(n) => n.id}
        ListHeaderComponent={
          <View style={{ padding: 16, paddingBottom: 0, gap: 16 }}>
            {/* Live Advisor — always shown first */}
            <LiveAdvisorCard />
            {/* Active transfer tracker */}
            {activeTransfer && <LiveTransferTracker />}
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.notif, { backgroundColor: item.read ? colors.card : colors.accent, borderColor: colors.border }]}
            activeOpacity={0.7}
          >
            <View style={[styles.notifIcon, { backgroundColor: (item as any).isLive ? "#dbeafe" : item.color + "15" }]}>
              <Feather name={item.icon as any} size={18} color={item.color} />
            </View>
            <View style={styles.notifContent}>
              <View style={styles.notifHeader}>
                <Text style={[styles.notifTitle, { color: colors.foreground }]}>{item.title}</Text>
                {!item.read && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
              </View>
              <Text style={[styles.notifBody, { color: colors.mutedForeground }]}>{item.body}</Text>
              <Text style={[styles.notifTime, { color: colors.mutedForeground }]}>{formatDateTime(item.time)}</Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={[styles.list, { paddingBottom: botPad + 40 }]}
        ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: colors.border }]} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const advisorStyles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1.5, borderColor: "#bbf7d0", padding: 16, gap: 12 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  headerLeft: { flex: 1, gap: 3 },
  liveChip: { flexDirection: "row", alignItems: "center", gap: 5 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#16a34a" },
  liveText: { color: "#16a34a", fontSize: 9, fontWeight: "800", letterSpacing: 1 },
  title: { fontSize: 15, fontWeight: "800" },
  sub: { fontSize: 11, lineHeight: 15 },
  noBusyBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#dcfce7", paddingHorizontal: 8, paddingVertical: 5, borderRadius: 20 },
  noBusyText: { color: "#16a34a", fontSize: 10, fontWeight: "700" },
  advisorRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  photoWrap: { position: "relative" },
  photo: { width: 58, height: 58, borderRadius: 29, borderWidth: 2, borderColor: "#16a34a" },
  onlineDot: { position: "absolute", bottom: 2, right: 2, width: 12, height: 12, borderRadius: 6, backgroundColor: "#16a34a", borderWidth: 2, borderColor: "#fff" },
  advisorName: { fontSize: 15, fontWeight: "700" },
  advisorRole: { fontSize: 11 },
  metaRow: { flexDirection: "row", gap: 8, alignItems: "center", marginTop: 3 },
  availBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  availText: { color: "#16a34a", fontSize: 10, fontWeight: "700" },
  waitBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#dbeafe", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  waitText: { color: "#1d4ed8", fontSize: 10, fontWeight: "700" },
  lang: { fontSize: 10 },
  allAdvisors: { flexDirection: "row", alignItems: "center", gap: 8 },
  thumbAdvisor: { width: 38, height: 38, borderRadius: 19, overflow: "hidden", borderWidth: 2, borderColor: "transparent", position: "relative" },
  thumbPhoto: { width: "100%", height: "100%" },
  thumbDot: { position: "absolute", bottom: 1, right: 1, width: 9, height: 9, borderRadius: 5, borderWidth: 1.5, borderColor: "#fff" },
  allText: { fontSize: 11, fontWeight: "600", marginLeft: 4 },
  actions: { flexDirection: "row", gap: 8 },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12, borderRadius: 12 },
  actionBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  actionBtnSm: { width: 52, height: 46, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  actionBtnSmText: { color: "#fff", fontSize: 10, fontWeight: "700", marginTop: 2 },
  disclaimer: { color: "#94a3b8", fontSize: 9, textAlign: "center", lineHeight: 14 },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingBottom: 16 },
  title: { color: "#fff", fontSize: 17, fontWeight: "700", flex: 1 },
  unreadBadge: { backgroundColor: "#f97316", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  unreadText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  list: { paddingHorizontal: 0 },
  notif: { flexDirection: "row", gap: 12, padding: 16, alignItems: "flex-start" },
  notifIcon: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center", marginTop: 2 },
  notifContent: { flex: 1, gap: 4 },
  notifHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  notifTitle: { fontSize: 14, fontWeight: "700", flex: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: 4 },
  notifBody: { fontSize: 13, lineHeight: 18 },
  notifTime: { fontSize: 11 },
  separator: { height: 1 },
  // Tracker
  trackerCard: { borderRadius: 14, borderWidth: 1.5, padding: 14, gap: 12 },
  trackerHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  trackerLeft: { gap: 2 },
  liveChip: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 4 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#dc2626" },
  liveText: { color: "#dc2626", fontSize: 9, fontWeight: "800", letterSpacing: 1 },
  trackerTitle: { fontSize: 14, fontWeight: "800" },
  trackerSub: { fontSize: 11 },
  etaBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#dbeafe", paddingHorizontal: 8, paddingVertical: 5, borderRadius: 10 },
  etaText: { color: "#1d4ed8", fontSize: 12, fontWeight: "700" },
  slaBanner: { flexDirection: "row", alignItems: "flex-start", gap: 6, padding: 8, borderRadius: 8 },
  slaText: { color: "#1d4ed8", fontSize: 10, flex: 1, lineHeight: 15 },
  timeline: { gap: 0 },
  timelineRow: { flexDirection: "row", gap: 10 },
  timelineLeft: { alignItems: "center", width: 22 },
  stageDot: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  activeDotInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#d97706" },
  stageNum: { fontSize: 9, fontWeight: "700", color: "#94a3b8" },
  stageLine: { width: 2, flex: 1, minHeight: 16, marginVertical: 3 },
  timelineContent: { flex: 1, paddingBottom: 12 },
  stageRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  stageLabel: { fontSize: 12, flex: 1 },
  activeChip: { backgroundColor: "#fef3c7", paddingHorizontal: 6, paddingVertical: 1, borderRadius: 6 },
  activeChipText: { color: "#d97706", fontSize: 8, fontWeight: "800", letterSpacing: 0.5 },
  stageActor: { fontSize: 10, marginTop: 1 },
  stageEta: { fontSize: 10, marginTop: 2 },
});
