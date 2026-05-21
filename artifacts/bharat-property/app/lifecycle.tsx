import { Feather } from "@expo/vector-icons";
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

type LifecycleStage =
  | "created"
  | "registered"
  | "loan"
  | "sold"
  | "transferred"
  | "disputed"
  | "resolved"
  | "inherited"
  | "demolished";

interface LifecycleEvent {
  id: string;
  stage: LifecycleStage;
  label: string;
  date: string;
  actor: string;
  actorRole: string;
  details: string;
  value?: number;
  docRef?: string;
  blockHash: string;
}

const STAGE_CONFIG: Record<LifecycleStage, { color: string; icon: string; bg: string }> = {
  created:     { color: "#7c3aed", icon: "plus-circle",   bg: "#faf5ff" },
  registered:  { color: "#1d4ed8", icon: "shield",        bg: "#eff6ff" },
  loan:        { color: "#d97706", icon: "credit-card",   bg: "#fef9c3" },
  sold:        { color: "#059669", icon: "repeat",        bg: "#f0fdf4" },
  transferred: { color: "#0891b2", icon: "send",          bg: "#f0f9ff" },
  disputed:    { color: "#dc2626", icon: "alert-triangle",bg: "#fff5f5" },
  resolved:    { color: "#16a34a", icon: "check-circle",  bg: "#f0fdf4" },
  inherited:   { color: "#7c3aed", icon: "users",         bg: "#faf5ff" },
  demolished:  { color: "#64748b", icon: "trash-2",       bg: "#f8fafc" },
};

const PROPERTIES_LIFECYCLE: {
  id: string;
  bpid: string;
  address: string;
  type: string;
  currentOwner: string;
  events: LifecycleEvent[];
}[] = [
  {
    id: "p1",
    bpid: "B-PID-MH-2026-001",
    address: "Flat 4B, Sunshine Residency, Andheri West, Mumbai",
    type: "Flat",
    currentOwner: "Rajesh Kumar Sharma",
    events: [
      {
        id: "lc1",
        stage: "created",
        label: "Property Created",
        date: "2018-03-10",
        actor: "Amit Builders Pvt. Ltd.",
        actorRole: "Developer",
        details: "New flat constructed. BBID assigned. OC received from BMC.",
        docRef: "OC-BMC-2018-04412",
        blockHash: "0xA1B2C3D4E5F60011",
      },
      {
        id: "lc2",
        stage: "registered",
        label: "First Registration",
        date: "2018-06-22",
        actor: "Vikram Patel",
        actorRole: "First Owner",
        details: "Sale deed executed. Registered at Sub-Registrar Office, Andheri.",
        value: 8500000,
        docRef: "SALE-DEED-2018-08812",
        blockHash: "0xB2C3D4E5F6A10022",
      },
      {
        id: "lc3",
        stage: "loan",
        label: "Home Loan Sanctioned",
        date: "2018-06-22",
        actor: "State Bank of India",
        actorRole: "Bank",
        details: "₹60L home loan sanctioned at 9.2% p.a. for 20 years. Mortgage created.",
        value: 6000000,
        docRef: "SBI-LN-2018-00334",
        blockHash: "0xC3D4E5F6A1B20033",
      },
      {
        id: "lc4",
        stage: "sold",
        label: "Property Sold",
        date: "2021-05-01",
        actor: "Vikram Patel → Rajesh Kumar Sharma",
        actorRole: "Seller → Buyer",
        details: "Property sold via BPCS platform. Loan closed. Title transferred.",
        value: 15000000,
        docRef: "SALE-DEED-2021-04412",
        blockHash: "0xD4E5F6A1B2C30044",
      },
      {
        id: "lc5",
        stage: "transferred",
        label: "Ownership Transferred",
        date: "2021-06-15",
        actor: "Sub-Registrar K. Iyer",
        actorRole: "Government Officer",
        details: "Mutation completed. New owner recorded in government records.",
        docRef: "MUT-2021-11221",
        blockHash: "0xE5F6A1B2C3D40055",
      },
      {
        id: "lc6",
        stage: "loan",
        label: "New Home Loan",
        date: "2021-06-15",
        actor: "State Bank of India",
        actorRole: "Bank",
        details: "₹90L fresh home loan by new owner at 8.5% p.a. for 20 years.",
        value: 9000000,
        docRef: "SBI-LN-2021-00891",
        blockHash: "0xF6A1B2C3D4E50066",
      },
    ],
  },
  {
    id: "p2",
    bpid: "B-PID-MH-2026-002",
    address: "Survey No. 45/2, Thane Rural, Maharashtra",
    type: "Land",
    currentOwner: "Rajesh Kumar Sharma",
    events: [
      {
        id: "lc7",
        stage: "registered",
        label: "Original Registration",
        date: "2001-11-15",
        actor: "Balwant Ramchandra",
        actorRole: "Original Owner",
        details: "Agricultural land registered. 7/12 extract issued by Talathi.",
        value: 500000,
        docRef: "712-THANE-2001-00332",
        blockHash: "0xA2B3C4D5E6F70077",
      },
      {
        id: "lc8",
        stage: "inherited",
        label: "Inherited by Family",
        date: "2011-04-20",
        actor: "Balwant Ramchandra Estate",
        actorRole: "Succession",
        details: "Property inherited after owner's death. Will probated. Mutation updated.",
        docRef: "WILL-2011-00112",
        blockHash: "0xB3C4D5E6F7A20088",
      },
      {
        id: "lc9",
        stage: "sold",
        label: "Sold",
        date: "2019-03-22",
        actor: "Ramesh Balwant → Rajesh Kumar Sharma",
        actorRole: "Seller → Buyer",
        details: "Land sold for conversion to residential plot. NA order applied for.",
        value: 8500000,
        docRef: "SALE-DEED-2019-02211",
        blockHash: "0xC4D5E6F7A2B30099",
      },
      {
        id: "lc10",
        stage: "disputed",
        label: "Dispute Raised",
        date: "2024-02-10",
        actor: "Anil Balwant (Claimant)",
        actorRole: "Legal Claimant",
        details: "Family member claims undisclosed right in property. Civil suit filed.",
        docRef: "CIVIL-SUIT-2024-00441",
        blockHash: "0xD5E6F7A2B3C400AA",
      },
    ],
  },
];

function stageHashShort(hash: string) {
  return hash.slice(0, 12) + "…";
}

export default function LifecycleScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;
  const [selectedProp, setSelectedProp] = useState(PROPERTIES_LIFECYCLE[0].id);

  const prop = PROPERTIES_LIFECYCLE.find((p) => p.id === selectedProp)!;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: "#059669", paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Property Life-Cycle Engine</Text>
          <Text style={styles.headerSub}>Full history — Creation → Inheritance · Sovereign Audit Sealed</Text>
        </View>
      </View>

      {/* Property selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.selectorRow}
        style={{ backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border }}
      >
        {PROPERTIES_LIFECYCLE.map((p) => (
          <TouchableOpacity
            key={p.id}
            style={[styles.propChip, selectedProp === p.id && styles.propChipActive]}
            onPress={() => setSelectedProp(p.id)}
          >
            <Text style={[styles.propChipBpid, { color: selectedProp === p.id ? "#fff" : colors.mutedForeground }]}>{p.bpid}</Text>
            <Text style={[styles.propChipType, { color: selectedProp === p.id ? "rgba(255,255,255,0.7)" : colors.mutedForeground }]}>{p.type}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={[styles.body, { paddingBottom: botPad + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Property header card */}
        <View style={[styles.propSummaryCard, { backgroundColor: "#059669" }]}>
          <Text style={styles.propSummaryBpid}>{prop.bpid}</Text>
          <Text style={styles.propSummaryAddr}>{prop.address}</Text>
          <View style={styles.propSummaryRow}>
            <View style={styles.propSummaryItem}>
              <Text style={styles.propSummaryLabel}>Type</Text>
              <Text style={styles.propSummaryValue}>{prop.type}</Text>
            </View>
            <View style={styles.propSummaryDivider} />
            <View style={styles.propSummaryItem}>
              <Text style={styles.propSummaryLabel}>Current Owner</Text>
              <Text style={styles.propSummaryValue}>{prop.currentOwner}</Text>
            </View>
            <View style={styles.propSummaryDivider} />
            <View style={styles.propSummaryItem}>
              <Text style={styles.propSummaryLabel}>Events</Text>
              <Text style={styles.propSummaryValue}>{prop.events.length}</Text>
            </View>
          </View>
        </View>

        {/* Stage legend */}
        <View style={[styles.legendCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.legendTitle, { color: colors.mutedForeground }]}>LIFECYCLE STAGES</Text>
          <View style={styles.legendRow}>
            {(["created", "registered", "loan", "sold", "transferred", "disputed", "inherited"] as LifecycleStage[]).map((s) => {
              const cfg = STAGE_CONFIG[s];
              return (
                <View key={s} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: cfg.color }]} />
                  <Text style={[styles.legendLabel, { color: colors.mutedForeground }]}>{s}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Timeline */}
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>TIMELINE — OLDEST TO LATEST</Text>
        {prop.events.map((ev, idx) => {
          const cfg = STAGE_CONFIG[ev.stage];
          const isLast = idx === prop.events.length - 1;
          const isLatest = idx === prop.events.length - 1;
          return (
            <View key={ev.id} style={styles.timelineRow}>
              {/* Left — connector */}
              <View style={styles.timelineLeft}>
                <View style={[styles.timelineDot, { backgroundColor: cfg.color }]}>
                  <Feather name={cfg.icon as any} size={10} color="#fff" />
                </View>
                {!isLast && <View style={[styles.timelineConnector, { backgroundColor: colors.border }]} />}
              </View>

              {/* Right — event card */}
              <View style={[styles.eventCard, { backgroundColor: colors.card, borderColor: isLatest ? cfg.color : colors.border }]}>
                <View style={styles.eventTop}>
                  <View style={[styles.stagePill, { backgroundColor: cfg.bg }]}>
                    <Text style={[styles.stagePillText, { color: cfg.color }]}>{ev.stage.toUpperCase()}</Text>
                  </View>
                  <Text style={[styles.eventDate, { color: colors.mutedForeground }]}>{ev.date}</Text>
                  {isLatest && (
                    <View style={styles.latestBadge}>
                      <Text style={styles.latestBadgeText}>LATEST</Text>
                    </View>
                  )}
                </View>

                <Text style={[styles.eventLabel, { color: colors.foreground }]}>{ev.label}</Text>
                <Text style={[styles.eventDetails, { color: colors.mutedForeground }]}>{ev.details}</Text>

                {ev.value && (
                  <View style={styles.eventValueRow}>
                    <Text style={[styles.eventValue, { color: "#059669" }]}>{formatCurrency(ev.value)}</Text>
                  </View>
                )}

                <View style={styles.eventMetaRow}>
                  <Feather name="user" size={10} color={colors.mutedForeground} />
                  <Text style={[styles.eventMeta, { color: colors.mutedForeground }]}>{ev.actor}</Text>
                  <Text style={[styles.eventMetaDivider, { color: colors.border }]}>·</Text>
                  <Text style={[styles.eventMeta, { color: colors.mutedForeground }]}>{ev.actorRole}</Text>
                </View>

                {ev.docRef && (
                  <View style={styles.docRefRow}>
                    <Feather name="file-text" size={10} color="#1d4ed8" />
                    <Text style={[styles.docRefText, { color: "#1d4ed8" }]}>{ev.docRef}</Text>
                  </View>
                )}

                <View style={[styles.hashRow, { backgroundColor: "#0f172a" }]}>
                  <Feather name="link" size={9} color="#34d399" />
                  <Text style={styles.hashText} numberOfLines={1}>{stageHashShort(ev.blockHash)}</Text>
                  <Text style={styles.hashVerified}>VERIFIED</Text>
                </View>
              </View>
            </View>
          );
        })}

        {/* Add future event hint */}
        <View style={[styles.futureCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="plus-circle" size={18} color={colors.mutedForeground} />
          <Text style={[styles.futureText, { color: colors.mutedForeground }]}>Next event will be auto-recorded by BPCS on any registered action</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "flex-end", gap: 12, paddingHorizontal: 16, paddingBottom: 14 },
  headerTitle: { color: "#fff", fontSize: 17, fontWeight: "700" },
  headerSub: { color: "rgba(255,255,255,0.55)", fontSize: 10, marginTop: 1 },
  selectorRow: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  propChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: "#f1f5f9", borderWidth: 1, borderColor: "#e2e8f0" },
  propChipActive: { backgroundColor: "#1e3a8a", borderColor: "#1e3a8a" },
  propChipBpid: { fontSize: 11, fontWeight: "700" },
  propChipType: { fontSize: 9, marginTop: 1 },
  body: { padding: 16, gap: 14 },
  propSummaryCard: { borderRadius: 14, padding: 16, gap: 6 },
  propSummaryBpid: { color: "rgba(255,255,255,0.6)", fontSize: 10, fontWeight: "700" },
  propSummaryAddr: { color: "#fff", fontSize: 14, fontWeight: "700", lineHeight: 19 },
  propSummaryRow: { flexDirection: "row", marginTop: 6 },
  propSummaryItem: { flex: 1, alignItems: "center" },
  propSummaryLabel: { color: "rgba(255,255,255,0.5)", fontSize: 9, fontWeight: "600" },
  propSummaryValue: { color: "#fff", fontSize: 12, fontWeight: "700", marginTop: 2 },
  propSummaryDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.2)" },
  legendCard: { borderRadius: 10, borderWidth: 1, padding: 12, gap: 8 },
  legendTitle: { fontSize: 9, fontWeight: "800", letterSpacing: 0.5 },
  legendRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontSize: 10, fontWeight: "500" },
  sectionTitle: { fontSize: 9, fontWeight: "800", letterSpacing: 0.6, textTransform: "uppercase" },
  timelineRow: { flexDirection: "row", gap: 10 },
  timelineLeft: { alignItems: "center", width: 26, paddingTop: 2 },
  timelineDot: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  timelineConnector: { width: 2, flex: 1, marginTop: 4, marginBottom: -4 },
  eventCard: { flex: 1, borderRadius: 10, borderWidth: 1, padding: 12, gap: 6, marginBottom: 12 },
  eventTop: { flexDirection: "row", alignItems: "center", gap: 6 },
  stagePill: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  stagePillText: { fontSize: 9, fontWeight: "800" },
  eventDate: { fontSize: 10, flex: 1 },
  latestBadge: { backgroundColor: "#1e3a8a", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  latestBadgeText: { color: "#fff", fontSize: 9, fontWeight: "800" },
  eventLabel: { fontSize: 13, fontWeight: "700" },
  eventDetails: { fontSize: 11, lineHeight: 16 },
  eventValueRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  eventValue: { fontSize: 13, fontWeight: "700" },
  eventMetaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  eventMeta: { fontSize: 10 },
  eventMetaDivider: { fontSize: 10 },
  docRefRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  docRefText: { fontSize: 10, fontWeight: "600" },
  hashRow: { flexDirection: "row", alignItems: "center", gap: 6, padding: 6, borderRadius: 6 },
  hashText: { color: "#f97316", fontSize: 9, fontFamily: "monospace", flex: 1 },
  hashVerified: { color: "#34d399", fontSize: 9, fontWeight: "800" },
  futureCard: { alignItems: "center", gap: 8, padding: 20, borderRadius: 12, borderWidth: 1, borderStyle: "dashed" },
  futureText: { fontSize: 12, textAlign: "center" },
});
