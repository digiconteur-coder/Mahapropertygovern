import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert, Image, Platform, ScrollView, StyleSheet,
  Text, TouchableOpacity, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";
import { formatCurrency } from "@/utils/format";
import { PropertyCard } from "@/components/PropertyCard";

// ─── Shared helpers ───────────────────────────────────────────────────────────
function RoleHeader({ bg, icon, title, sub, badge }: { bg: string; icon: string; title: string; sub: string; badge?: { label: string; color: string } }) {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  return (
    <View style={[styles.header, { backgroundColor: bg, paddingTop: topPad + 8 }]}>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Feather name={icon as any} size={18} color="#fff" />
          <Text style={styles.headerTitle}>{title}</Text>
        </View>
        <Text style={styles.headerSub}>{sub}</Text>
      </View>
      {badge && (
        <View style={[styles.headerBadge, { backgroundColor: badge.color }]}>
          <Text style={styles.headerBadgeText}>{badge.label}</Text>
        </View>
      )}
    </View>
  );
}

function MetricRow({ items }: { items: { label: string; value: string; sub?: string; color?: string }[] }) {
  return (
    <View style={styles.metricRow}>
      {items.map((item, i) => (
        <React.Fragment key={item.label}>
          <View style={styles.metricItem}>
            <Text style={[styles.metricVal, { color: item.color || "#fff" }]}>{item.value}</Text>
            {item.sub && <Text style={styles.metricSub}>{item.sub}</Text>}
            <Text style={styles.metricLabel}>{item.label}</Text>
          </View>
          {i < items.length - 1 && <View style={styles.metricDiv} />}
        </React.Fragment>
      ))}
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CITIZEN — My Registered Properties
// ═══════════════════════════════════════════════════════════════════════════════
function CitizenView() {
  const { user } = useAuth();
  const { properties, transactions } = useData();
  const colors = useColors();
  const router = useRouter();
  const myProps = properties.filter((p) => p.ownerId === user?.id);
  const myDeals = transactions.filter((t) => (t.buyerId === user?.id || t.sellerId === user?.id) && t.status !== "completed");
  const totalValue = myProps.reduce((s, p) => s + p.value, 0);
  const loans = myProps.filter((p) => p.loanStatus === "active");

  return (
    <>
      <RoleHeader bg="#1e3a8a" icon="home" title="My Properties" sub={`${myProps.length} registered · BPCS verified`}
        badge={myDeals.length > 0 ? { label: `${myDeals.length} Active Deal`, color: "#dc2626" } : undefined} />
      <MetricRow items={[
        { label: "Total Properties", value: String(myProps.length) },
        { label: "Portfolio Value", value: `₹${(totalValue / 10000000).toFixed(1)}Cr` },
        { label: "Loans Active", value: String(loans.length), color: loans.length > 0 ? "#fbbf24" : "#fff" },
        { label: "Active Deals", value: String(myDeals.length), color: myDeals.length > 0 ? "#f97316" : "#fff" },
      ]} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.body, { backgroundColor: colors.background }]}>
        <View style={[styles.infoBanner, { backgroundColor: "#eff6ff", borderColor: "#bfdbfe" }]}>
          <Feather name="shield" size={12} color="#1d4ed8" />
          <Text style={{ color: "#1d4ed8", fontSize: 10, flex: 1, lineHeight: 15 }}>
            Your properties are digitally verified and governance-sealed under <Text style={{ fontWeight: "700" }}>RERAW Act 2026</Text>. Tap any card to view QR certificate, documents, and BUID details.
          </Text>
        </View>
        {myProps.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="home" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No properties registered yet</Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>Register your first property using Aadhaar + PAN. Takes under 10 minutes.</Text>
          </View>
        ) : myProps.map((p) => (
          <PropertyCard key={p.id} property={p} onPress={() => router.push(`/property/${p.id}` as any)} />
        ))}
        {myDeals.length > 0 && (
          <View style={{ marginTop: 8 }}>
            <Text style={[styles.sectionHead, { color: colors.mutedForeground }]}>ACTIVE DEALS</Text>
            {myDeals.map((t) => {
              const stageLabel = ["", "Initiated", "CPF Assigned", "Doc Verification", "Legal Review", "Govt Approval", "Done"][Math.min(t.stage, 6)];
              return (
                <TouchableOpacity key={t.id} style={[styles.simpleCard, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.push("/notifications" as any)}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.mutedForeground, fontSize: 10, fontWeight: "600" }}>{t.bpid}</Text>
                    <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: "600", marginTop: 2 }} numberOfLines={1}>{t.propertyAddress}</Text>
                    <Text style={{ color: "#1e3a8a", fontSize: 14, fontWeight: "800", marginTop: 2 }}>{formatCurrency(t.amount)}</Text>
                  </View>
                  <View style={{ alignItems: "flex-end", gap: 5 }}>
                    <View style={{ backgroundColor: "#eff6ff", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                      <Text style={{ color: "#1e3a8a", fontSize: 10, fontWeight: "700" }}>Stage {t.stage}/6</Text>
                    </View>
                    <Text style={{ color: "#64748b", fontSize: 9 }}>{stageLabel}</Text>
                    <Feather name="chevron-right" size={14} color="#64748b" />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
        {myProps.length > 0 && (
          <TouchableOpacity style={styles.dealCtaBtn} onPress={() => Alert.alert("Start a Deal", "Go to the Deals & Services section from the main tab to start a transfer, apply for loan, or raise a dispute.")}>
            <Feather name="plus-circle" size={18} color="#f97316" />
            <View style={{ flex: 1 }}>
              <Text style={styles.dealCtaTitle}>Start a Deal</Text>
              <Text style={styles.dealCtaSub}>Transfer · Loan · Dispute · Co-Owner</Text>
            </View>
            <Feather name="chevron-right" size={16} color="rgba(255,255,255,0.5)" />
          </TouchableOpacity>
        )}
      </ScrollView>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CPF BROKER — Deal Assignments (their core workspace)
// ═══════════════════════════════════════════════════════════════════════════════
const CPF_ASSIGNMENTS = [
  {
    id: "DA-001", bpid: "B-PID-MH-2026-002", address: "Survey No. 45/2, Thane Rural, Maharashtra",
    type: "flat", sellerName: "Rajesh Kumar Sharma", sellerPhone: "98765 43210",
    buyerName: "Sunita Patel", buyerPhone: "91234 56780",
    amount: 8500000, stage: 3, commission: 170000, escrow: "HELD",
    urgentAction: "Upload Encumbrance Certificate — Due by 3 PM TODAY",
    actionType: "upload", sellerPhoto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop&crop=faces",
    buyerPhoto: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=faces",
    assignedOn: "12 May 2026", daysActive: 3,
  },
  {
    id: "DA-002", bpid: "B-PID-GJ-2026-004", address: "Plot 22, Sector 7, Gandhinagar, Gujarat",
    type: "land", sellerName: "Vikram Singh", sellerPhone: "97001 23456",
    buyerName: "Meena Reddy", buyerPhone: "98001 23456",
    amount: 4400000, stage: 2, commission: 88000, escrow: "PENDING",
    urgentAction: "Complete KYC for Meena Reddy (Buyer) — PAN + Aadhaar required",
    actionType: "kyc", sellerPhoto: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=60&h=60&fit=crop&crop=faces",
    buyerPhoto: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=60&h=60&fit=crop&crop=faces",
    assignedOn: "10 May 2026", daysActive: 5,
  },
  {
    id: "DA-003", bpid: "B-PID-MH-2026-005", address: "Flat 8A, Emerald Heights, Powai, Mumbai",
    type: "flat", sellerName: "Amit Builders", sellerPhone: "90000 12345",
    buyerName: "Deepak Joshi", buyerPhone: "98765 00001",
    amount: 12500000, stage: 5, commission: 250000, escrow: "HELD",
    urgentAction: "Govt Approval pending — monitor Sub-Registrar portal",
    actionType: "monitor", sellerPhoto: "https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?w=60&h=60&fit=crop&crop=faces",
    buyerPhoto: "https://images.unsplash.com/photo-1542178243-bc20204b769f?w=60&h=60&fit=crop&crop=faces",
    assignedOn: "05 May 2026", daysActive: 10,
  },
];

const ACTION_ICONS: Record<string, string> = { upload: "upload", kyc: "user-check", monitor: "eye", call: "phone-call" };
const ACTION_COLORS: Record<string, string> = { upload: "#dc2626", kyc: "#7c3aed", monitor: "#d97706", call: "#16a34a" };
const STAGE_LABELS = ["", "Initiated", "CPF Assigned", "Doc Verification", "Legal Review", "Govt Approval", "Complete"];

function CPFView() {
  const colors = useColors();
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>("DA-001");
  const totalCommission = CPF_ASSIGNMENTS.reduce((s, a) => s + a.commission, 0);
  const monthlyTarget = 500000;

  return (
    <>
      <RoleHeader bg="#5b21b6" icon="users" title="Deal Assignments" sub={`${CPF_ASSIGNMENTS.length} active · RERAW 2026 licensed`}
        badge={{ label: `₹${(totalCommission / 1000).toFixed(0)}K commission`, color: "#16a34a" }} />
      <MetricRow items={[
        { label: "Active Deals", value: String(CPF_ASSIGNMENTS.length) },
        { label: "Pending Action", value: String(CPF_ASSIGNMENTS.filter(a => a.actionType !== "monitor").length), color: "#f97316" },
        { label: "Month Commission", value: `₹${(totalCommission / 1000).toFixed(0)}K` },
        { label: "Target %", value: `${Math.round((totalCommission / monthlyTarget) * 100)}%` },
      ]} />
      <ScrollView showsVerticalScrollIndicator={false} style={{ backgroundColor: colors.background }} contentContainerStyle={styles.body}>

        {/* Monthly commission bar */}
        <View style={[styles.commissionBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
            <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: "700" }}>May 2026 Commission Progress</Text>
            <Text style={{ color: "#7c3aed", fontSize: 12, fontWeight: "800" }}>₹{(totalCommission / 1000).toFixed(0)}K / ₹{(monthlyTarget / 1000)}K</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.min(100, (totalCommission / monthlyTarget) * 100)}%` as any, backgroundColor: "#7c3aed" }]} />
          </View>
          <Text style={{ color: colors.mutedForeground, fontSize: 10, marginTop: 4 }}>
            {Math.round((totalCommission / monthlyTarget) * 100)}% of monthly target · {CPF_ASSIGNMENTS.filter(a => a.stage === 6).length} deals closed this month
          </Text>
        </View>

        <Text style={[styles.sectionHead, { color: colors.mutedForeground }]}>MY ASSIGNMENTS — ACTION NEEDED FIRST</Text>

        {CPF_ASSIGNMENTS.sort((a, b) => (a.actionType === "monitor" ? 1 : -1)).map((deal) => {
          const isExpanded = expandedId === deal.id;
          const acColor = ACTION_COLORS[deal.actionType];
          const stageColors = ["", "#64748b", "#7c3aed", "#d97706", "#1e40af", "#dc2626", "#16a34a"];
          const sc = stageColors[deal.stage] || "#64748b";

          return (
            <TouchableOpacity key={deal.id} style={[styles.assignCard, { backgroundColor: colors.card, borderColor: deal.actionType !== "monitor" ? acColor + "44" : colors.border, borderLeftColor: acColor, borderLeftWidth: 3 }]} onPress={() => setExpandedId(isExpanded ? null : deal.id)} activeOpacity={0.85}>
              {/* Action needed banner */}
              {deal.actionType !== "monitor" && (
                <View style={[styles.actionBanner, { backgroundColor: acColor + "15" }]}>
                  <Feather name={ACTION_ICONS[deal.actionType] as any} size={12} color={acColor} />
                  <Text style={{ color: acColor, fontSize: 10, fontWeight: "700", flex: 1 }}>⚡ {deal.urgentAction}</Text>
                </View>
              )}
              {deal.actionType === "monitor" && (
                <View style={[styles.actionBanner, { backgroundColor: "#fef3c7" }]}>
                  <Feather name="clock" size={12} color="#d97706" />
                  <Text style={{ color: "#d97706", fontSize: 10, fontWeight: "600", flex: 1 }}>{deal.urgentAction}</Text>
                </View>
              )}

              {/* Main deal info */}
              <View style={styles.assignMain}>
                <View style={{ flex: 1, gap: 3 }}>
                  <Text style={{ color: colors.mutedForeground, fontSize: 9, fontWeight: "700" }}>{deal.bpid}</Text>
                  <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: "600" }} numberOfLines={1}>{deal.address}</Text>
                  <Text style={{ color: "#1e3a8a", fontSize: 14, fontWeight: "800" }}>{formatCurrency(deal.amount)}</Text>
                </View>
                <View style={{ alignItems: "flex-end", gap: 4 }}>
                  <View style={[styles.stagePill, { backgroundColor: sc + "20" }]}>
                    <Text style={{ color: sc, fontSize: 9, fontWeight: "700" }}>Stage {deal.stage}/6</Text>
                  </View>
                  <Text style={{ color: colors.mutedForeground, fontSize: 9 }}>Day {deal.daysActive}</Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "#f0fdf4", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                    <Text style={{ color: "#16a34a", fontSize: 9, fontWeight: "700" }}>₹{(deal.commission / 1000).toFixed(0)}K</Text>
                  </View>
                </View>
              </View>

              {/* Stage progress */}
              <View style={styles.stageRow}>
                {[1, 2, 3, 4, 5, 6].map((s) => (
                  <View key={s} style={[styles.stageSeg, { backgroundColor: s <= deal.stage ? sc : "#e2e8f0" }]} />
                ))}
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ color: colors.mutedForeground, fontSize: 9 }}>{STAGE_LABELS[deal.stage]}</Text>
                <Text style={{ color: colors.mutedForeground, fontSize: 9 }}>Escrow: {deal.escrow}</Text>
              </View>

              {/* Expanded: Buyer/Seller + Actions */}
              {isExpanded && (
                <View style={[styles.expandedSection, { borderTopColor: colors.border }]}>
                  {/* Parties */}
                  <View style={styles.partiesRow}>
                    <View style={styles.partyItem}>
                      <Image source={{ uri: deal.sellerPhoto }} style={styles.partyPhoto} />
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: "#64748b", fontSize: 9, fontWeight: "600" }}>SELLER</Text>
                        <Text style={{ color: colors.foreground, fontSize: 11, fontWeight: "700" }}>{deal.sellerName}</Text>
                        <Text style={{ color: "#64748b", fontSize: 9 }}>{deal.sellerPhone}</Text>
                      </View>
                    </View>
                    <Feather name="arrow-right" size={16} color="#e2e8f0" />
                    <View style={styles.partyItem}>
                      <Image source={{ uri: deal.buyerPhoto }} style={styles.partyPhoto} />
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: "#64748b", fontSize: 9, fontWeight: "600" }}>BUYER</Text>
                        <Text style={{ color: colors.foreground, fontSize: 11, fontWeight: "700" }}>{deal.buyerName}</Text>
                        <Text style={{ color: "#64748b", fontSize: 9 }}>{deal.buyerPhone}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Quick actions */}
                  <View style={styles.quickActions}>
                    <TouchableOpacity style={[styles.qaBtn, { backgroundColor: "#1e40af" }]} onPress={() => Haptics.selectionAsync()}>
                      <Feather name="phone" size={13} color="#fff" />
                      <Text style={styles.qaBtnText}>Seller</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.qaBtn, { backgroundColor: "#7c3aed" }]} onPress={() => Haptics.selectionAsync()}>
                      <Feather name="phone" size={13} color="#fff" />
                      <Text style={styles.qaBtnText}>Buyer</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.qaBtn, { backgroundColor: acColor }]} onPress={() => { Haptics.selectionAsync(); Alert.alert("Upload Document", "Select document to upload for this deal"); }}>
                      <Feather name={ACTION_ICONS[deal.actionType] as any} size={13} color="#fff" />
                      <Text style={styles.qaBtnText}>{deal.actionType === "upload" ? "Upload Doc" : deal.actionType === "kyc" ? "KYC" : "Monitor"}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.qaBtn, { backgroundColor: "#0f172a" }]} onPress={() => router.push("/notifications" as any)}>
                      <Feather name="activity" size={13} color="#fff" />
                      <Text style={styles.qaBtnText}>Timeline</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        <View style={[styles.infoBanner, { backgroundColor: "#ede9fe", borderColor: "#c4b5fd" }]}>
          <Feather name="shield" size={12} color="#7c3aed" />
          <Text style={{ color: "#7c3aed", fontSize: 10, flex: 1, lineHeight: 15 }}>
            <Text style={{ fontWeight: "700" }}>RERAW 2026:</Text> All deal timelines are govt-monitored. Commission auto-releases from escrow upon Stage 6 completion.
          </Text>
        </View>
      </ScrollView>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEVELOPER — RERA Projects + Unit Inventory
// ═══════════════════════════════════════════════════════════════════════════════
const BUYER_ENQUIRIES = [
  { name: "Mohan Raj", unit: "2BHK — Floor 4", budget: "₹65L", time: "2 hrs ago", hot: true, photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop&crop=faces" },
  { name: "Deepa Venkat", unit: "3BHK — Floor 7", budget: "₹95L", time: "4 hrs ago", hot: true, photo: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=60&h=60&fit=crop&crop=faces" },
  { name: "Sanjay Tiwari", unit: "1BHK — Floor 2", budget: "₹42L", time: "Yesterday", hot: false, photo: "https://images.unsplash.com/photo-1566753323558-f4e0952af115?w=60&h=60&fit=crop&crop=faces" },
];

function DeveloperView() {
  const { user } = useAuth();
  const { projects, units } = useData();
  const colors = useColors();
  const router = useRouter();
  const myProjects = projects.filter((p) => p.developerId === user?.id);
  const totalUnits = myProjects.reduce((s, p) => s + p.totalUnits, 0);
  const soldUnits = myProjects.reduce((s, p) => s + p.soldUnits, 0);
  const revenue = myProjects.reduce((s, p) => s + p.soldUnits * p.price, 0);

  const reraStatusConfig: Record<string, { color: string; bg: string; label: string }> = {
    approved: { color: "#16a34a", bg: "#f0fdf4", label: "RERA COMPLIANT" },
    under_review: { color: "#d97706", bg: "#fef3c7", label: "UNDER REVIEW" },
    pending: { color: "#64748b", bg: "#f1f5f9", label: "PENDING" },
    rejected: { color: "#dc2626", bg: "#fef2f2", label: "REJECTED" },
  };

  return (
    <>
      <RoleHeader bg="#065f46" icon="layers" title="My Projects" sub={`${myProjects.length} RERA-registered projects`}
        badge={{ label: `${BUYER_ENQUIRIES.filter(e => e.hot).length} Hot Leads`, color: "#dc2626" }} />
      <MetricRow items={[
        { label: "Total Units", value: String(totalUnits) },
        { label: "Sold", value: String(soldUnits), color: "#4ade80" },
        { label: "Available", value: String(totalUnits - soldUnits), color: "#fbbf24" },
        { label: "Revenue", value: `₹${(revenue / 10000000).toFixed(1)}Cr` },
      ]} />
      <ScrollView showsVerticalScrollIndicator={false} style={{ backgroundColor: colors.background }} contentContainerStyle={styles.body}>

        <Text style={[styles.sectionHead, { color: colors.mutedForeground }]}>RERA-REGISTERED PROJECTS</Text>
        {myProjects.map((proj) => {
          const rera = reraStatusConfig[proj.approvalStatus] || reraStatusConfig.pending;
          const soldPct = Math.round((proj.soldUnits / proj.totalUnits) * 100);
          const myUnits = units.filter((u) => u.projectId === proj.id);
          const available = myUnits.filter((u) => u.status === "available");
          const booked = myUnits.filter((u) => u.status === "booked");

          return (
            <View key={proj.id} style={[styles.projectCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {/* Project header */}
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "800" }}>{proj.name}</Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginTop: 3 }}>
                    <Feather name="map-pin" size={10} color={colors.mutedForeground} />
                    <Text style={{ color: colors.mutedForeground, fontSize: 11 }}>{proj.location}</Text>
                  </View>
                  <Text style={{ color: "#7c3aed", fontSize: 10, fontWeight: "600", marginTop: 2 }}>{proj.bbid}</Text>
                </View>
                <View style={[styles.reraBadge, { backgroundColor: rera.bg }]}>
                  <Text style={{ color: rera.color, fontSize: 8, fontWeight: "800" }}>{rera.label}</Text>
                </View>
              </View>

              {/* Unit breakdown */}
              <View style={styles.unitBreakdown}>
                <View style={[styles.unitBox, { backgroundColor: "#f0fdf4" }]}>
                  <Text style={{ color: "#16a34a", fontSize: 18, fontWeight: "800" }}>{proj.soldUnits}</Text>
                  <Text style={{ color: "#16a34a", fontSize: 9, fontWeight: "700" }}>SOLD</Text>
                </View>
                <View style={[styles.unitBox, { backgroundColor: "#fef3c7" }]}>
                  <Text style={{ color: "#d97706", fontSize: 18, fontWeight: "800" }}>{booked.length}</Text>
                  <Text style={{ color: "#d97706", fontSize: 9, fontWeight: "700" }}>BOOKED</Text>
                </View>
                <View style={[styles.unitBox, { backgroundColor: "#eff6ff" }]}>
                  <Text style={{ color: "#1e40af", fontSize: 18, fontWeight: "800" }}>{available.length}</Text>
                  <Text style={{ color: "#1e40af", fontSize: 9, fontWeight: "700" }}>AVAILABLE</Text>
                </View>
                <View style={[styles.unitBox, { backgroundColor: "#f1f5f9" }]}>
                  <Text style={{ color: "#475569", fontSize: 18, fontWeight: "800" }}>{proj.totalUnits}</Text>
                  <Text style={{ color: "#475569", fontSize: 9, fontWeight: "700" }}>TOTAL</Text>
                </View>
              </View>

              {/* Sales progress bar */}
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${soldPct}%` as any, backgroundColor: "#16a34a" }]} />
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ color: colors.mutedForeground, fontSize: 10 }}>{soldPct}% sold · ₹{(proj.soldUnits * proj.price / 10000000).toFixed(1)}Cr revenue</Text>
                <Text style={{ color: colors.mutedForeground, fontSize: 10 }}>📅 {proj.completionDate.slice(0, 7)}</Text>
              </View>

              {/* Actions */}
              <View style={styles.projActions}>
                <TouchableOpacity style={[styles.projBtn, { backgroundColor: "#065f46" }]} onPress={() => Haptics.selectionAsync()}>
                  <Feather name="grid" size={13} color="#fff" />
                  <Text style={styles.projBtnText}>View Units</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.projBtn, { backgroundColor: "#7c3aed" }]} onPress={() => Haptics.selectionAsync()}>
                  <Feather name="plus" size={13} color="#fff" />
                  <Text style={styles.projBtnText}>Add Inventory</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.projBtnSm, { backgroundColor: "#fef3c7" }]} onPress={() => Haptics.selectionAsync()}>
                  <Feather name="file-text" size={14} color="#a16207" />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        <Text style={[styles.sectionHead, { color: colors.mutedForeground, marginTop: 8 }]}>BUYER ENQUIRIES</Text>
        {BUYER_ENQUIRIES.map((enq, i) => (
          <View key={i} style={[styles.enquiryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Image source={{ uri: enq.photo }} style={styles.enquiryPhoto} />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: "700" }}>{enq.name}</Text>
                {enq.hot && <View style={{ backgroundColor: "#fef2f2", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}><Text style={{ color: "#dc2626", fontSize: 8, fontWeight: "800" }}>🔥 HOT</Text></View>}
              </View>
              <Text style={{ color: colors.mutedForeground, fontSize: 11, marginTop: 1 }}>{enq.unit} · Budget: {enq.budget}</Text>
              <Text style={{ color: "#94a3b8", fontSize: 9, marginTop: 1 }}>{enq.time}</Text>
            </View>
            <View style={{ gap: 6 }}>
              <TouchableOpacity style={{ backgroundColor: "#065f46", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 }} onPress={() => Haptics.selectionAsync()}>
                <Text style={{ color: "#fff", fontSize: 10, fontWeight: "700" }}>Call</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ backgroundColor: "#f1f5f9", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 }} onPress={() => Haptics.selectionAsync()}>
                <Text style={{ color: "#475569", fontSize: 10, fontWeight: "700" }}>Share Unit</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// GOVT OFFICER — Approval Queue with SLA Timers
// ═══════════════════════════════════════════════════════════════════════════════
const APPROVAL_QUEUE = [
  { id: "TXN-001", type: "Transfer", bpid: "B-PID-MH-2026-001", party: "Ramesh Sharma → Sunita Patel", value: "₹82L", slaHours: 2, urgent: true, priority: "URGENT", docs: "Sale Deed · EC · PAN" },
  { id: "TXN-003", type: "Dispute", bpid: "B-PID-MH-2026-003", party: "Ahmed Khan vs Priya Builders", value: "—", slaHours: 1, urgent: true, priority: "URGENT", docs: "Civil Suit 2026-00441" },
  { id: "TXN-002", type: "Loan NOC", bpid: "B-PID-MH-2026-002", party: "Deepak Joshi — SBI", value: "₹65L", slaHours: 6, urgent: false, priority: "TODAY", docs: "Loan agreement · NOC draft" },
  { id: "TXN-004", type: "Transfer", bpid: "B-PID-GJ-2026-004", party: "Meena Reddy → Vikram Singh", value: "₹44L", slaHours: 18, urgent: false, priority: "NORMAL", docs: "Sale Deed · Gift Deed" },
  { id: "TXN-005", type: "Doc Verify", bpid: "BPCS-RERA-2026-001", party: "Emerald Heights — OC Upload", value: "—", slaHours: 48, urgent: false, priority: "NORMAL", docs: "Occupancy Certificate" },
];

const PRIORITY_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
  URGENT: { color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
  TODAY: { color: "#d97706", bg: "#fef3c7", border: "#fde68a" },
  NORMAL: { color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
};

const TYPE_CONFIG: Record<string, { icon: string; color: string }> = {
  Transfer: { icon: "send", color: "#1e40af" },
  Dispute: { icon: "alert-triangle", color: "#dc2626" },
  "Loan NOC": { icon: "credit-card", color: "#7c3aed" },
  "Doc Verify": { icon: "file-text", color: "#d97706" },
};

function GovtView() {
  const { properties, transactions, disputes } = useData();
  const colors = useColors();
  const [typeFilter, setTypeFilter] = useState("All");
  const types = ["All", "Transfer", "Loan NOC", "Dispute", "Doc Verify"];
  const filtered = typeFilter === "All" ? APPROVAL_QUEUE : APPROVAL_QUEUE.filter(a => a.type === typeFilter);
  const urgent = APPROVAL_QUEUE.filter(a => a.priority === "URGENT").length;
  const pending = APPROVAL_QUEUE.filter(a => a.priority !== "URGENT").length;

  return (
    <>
      <RoleHeader bg="#7f1d1d" icon="shield" title="Approval Queue" sub={`${APPROVAL_QUEUE.length} pending · RERAW Act 2026`}
        badge={urgent > 0 ? { label: `${urgent} URGENT`, color: "#dc2626" } : undefined} />
      <MetricRow items={[
        { label: "Urgent (<4h)", value: String(urgent), color: "#f87171" },
        { label: "Today", value: String(APPROVAL_QUEUE.filter(a => a.priority === "TODAY").length), color: "#fbbf24" },
        { label: "Normal", value: String(pending - 1), color: "#4ade80" },
        { label: "Disputes Open", value: String(disputes.filter(d => d.status === "open").length), color: "#f87171" },
      ]} />
      <ScrollView showsVerticalScrollIndicator={false} style={{ backgroundColor: colors.background }} contentContainerStyle={styles.body}>

        {/* Type filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }} contentContainerStyle={{ gap: 6, paddingRight: 4 }}>
          {types.map((t) => (
            <TouchableOpacity key={t} style={[styles.filterChip, { backgroundColor: typeFilter === t ? "#7f1d1d" : "#f1f5f9", borderColor: typeFilter === t ? "#7f1d1d" : colors.border }]} onPress={() => { setTypeFilter(t); Haptics.selectionAsync(); }}>
              <Text style={{ color: typeFilter === t ? "#fff" : colors.mutedForeground, fontSize: 11, fontWeight: "600" }}>{t}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {filtered.map((item) => {
          const pc = PRIORITY_CONFIG[item.priority];
          const tc = TYPE_CONFIG[item.type] || TYPE_CONFIG.Transfer;
          return (
            <View key={item.id} style={[styles.approvalCard, { backgroundColor: colors.card, borderColor: pc.border, borderLeftColor: pc.color, borderLeftWidth: 3 }]}>
              <View style={{ flexDirection: "row", gap: 10, alignItems: "flex-start" }}>
                <View style={[styles.typeIcon, { backgroundColor: tc.color + "20" }]}>
                  <Feather name={tc.icon as any} size={16} color={tc.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <View style={[styles.priorityBadge, { backgroundColor: pc.bg }]}>
                      <Text style={{ color: pc.color, fontSize: 8, fontWeight: "800" }}>🚨 {item.priority}</Text>
                    </View>
                    <Text style={{ color: colors.mutedForeground, fontSize: 9 }}>{item.type} · {item.id}</Text>
                  </View>
                  <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: "700", marginTop: 4 }}>{item.party}</Text>
                  <Text style={{ color: "#7c3aed", fontSize: 10, fontWeight: "600", marginTop: 1 }}>{item.bpid}</Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 4 }}>
                    <Text style={{ color: colors.mutedForeground, fontSize: 11 }}>Value: {item.value}</Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                      <Feather name="clock" size={10} color={item.slaHours <= 2 ? "#dc2626" : "#d97706"} />
                      <Text style={{ color: item.slaHours <= 2 ? "#dc2626" : "#d97706", fontSize: 10, fontWeight: "700" }}>{item.slaHours}h SLA remaining</Text>
                    </View>
                  </View>
                  <Text style={{ color: "#94a3b8", fontSize: 9, marginTop: 3 }}>Docs: {item.docs}</Text>
                </View>
              </View>

              {/* One-tap actions */}
              <View style={styles.govtActions}>
                <TouchableOpacity style={[styles.govtBtn, { backgroundColor: "#16a34a" }]} onPress={() => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); Alert.alert("Approved ✓", `${item.type} for ${item.bpid} has been approved. Sub-Registrar record updated.`); }}>
                  <Feather name="check-circle" size={13} color="#fff" />
                  <Text style={styles.govtBtnText}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.govtBtn, { backgroundColor: "#d97706" }]} onPress={() => { Haptics.selectionAsync(); Alert.alert("Flag for Review", "This item has been flagged. Additional documents will be requested."); }}>
                  <Feather name="flag" size={13} color="#fff" />
                  <Text style={styles.govtBtnText}>Flag</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.govtBtnSm, { backgroundColor: "#ede9fe" }]} onPress={() => Haptics.selectionAsync()}>
                  <Feather name="file-plus" size={14} color="#7c3aed" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.govtBtnSm, { backgroundColor: "#fef2f2" }]} onPress={() => { Haptics.selectionAsync(); Alert.alert("Reject", "Confirm rejection of this item?", [{ text: "Cancel", style: "cancel" }, { text: "Reject", style: "destructive" }]); }}>
                  <Feather name="x-circle" size={14} color="#dc2626" />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        <View style={[styles.infoBanner, { backgroundColor: "#fef2f2", borderColor: "#fecaca" }]}>
          <Feather name="alert-circle" size={12} color="#dc2626" />
          <Text style={{ color: "#dc2626", fontSize: 10, flex: 1, lineHeight: 15 }}>
            <Text style={{ fontWeight: "700" }}>RERAW 2026 SLA:</Text> Transfers must be processed within 5 working days. Disputes within 30 days. Delay may attract penalty under Section 12.
          </Text>
        </View>
      </ScrollView>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// BANK — Loan Applications (collateral-first view)
// ═══════════════════════════════════════════════════════════════════════════════
const LOAN_APPS = [
  { id: "LN-001", applicant: "Sunita Patel", bpid: "B-PID-MH-2026-002", photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=faces", amount: 6500000, tenure: "20 yrs", cibil: 782, risk: "low", status: "Docs Complete", waiting: 3, property: "Flat 4B, Sunshine Residency, Andheri West", ltv: 72 },
  { id: "LN-002", applicant: "Mohan Reddy", bpid: "B-PID-AP-2026-005", photo: "https://images.unsplash.com/photo-1566753323558-f4e0952af115?w=60&h=60&fit=crop&crop=faces", amount: 4800000, tenure: "15 yrs", cibil: 698, risk: "medium", status: "KYC Pending", waiting: 1, property: "Plot 18, HMDA Layout, Hyderabad", ltv: 68 },
  { id: "LN-003", applicant: "Anita Joshi", bpid: "B-PID-MH-2026-006", photo: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=60&h=60&fit=crop&crop=faces", amount: 9200000, tenure: "25 yrs", cibil: 745, risk: "low", status: "Valuation Pending", waiting: 5, property: "3BHK — Green Valley Township, Pune", ltv: 76 },
  { id: "LN-004", applicant: "Ravi Tiwari", bpid: "B-PID-UP-2026-007", photo: "https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?w=60&h=60&fit=crop&crop=faces", amount: 3800000, tenure: "10 yrs", cibil: 612, risk: "high", status: "Income Mismatch", waiting: 2, property: "Plot No. 7, Sector 4, Lucknow", ltv: 55 },
];

const RISK_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  low: { color: "#16a34a", bg: "#f0fdf4", label: "LOW RISK" },
  medium: { color: "#d97706", bg: "#fef3c7", label: "MEDIUM RISK" },
  high: { color: "#dc2626", bg: "#fef2f2", label: "HIGH RISK" },
};

function BankView() {
  const colors = useColors();
  const [riskFilter, setRiskFilter] = useState("all");
  const filtered = riskFilter === "all" ? LOAN_APPS : LOAN_APPS.filter(l => l.risk === riskFilter);

  return (
    <>
      <RoleHeader bg="#78350f" icon="credit-card" title="Loan Applications" sub={`${LOAN_APPS.length} pending review · BUID auto-verified`}
        badge={{ label: `${LOAN_APPS.filter(l => l.risk === "high").length} High Risk`, color: "#dc2626" }} />
      <MetricRow items={[
        { label: "Low Risk", value: String(LOAN_APPS.filter(l => l.risk === "low").length), color: "#4ade80" },
        { label: "Medium Risk", value: String(LOAN_APPS.filter(l => l.risk === "medium").length), color: "#fbbf24" },
        { label: "High Risk", value: String(LOAN_APPS.filter(l => l.risk === "high").length), color: "#f87171" },
        { label: "Total Amount", value: `₹${(LOAN_APPS.reduce((s, l) => s + l.amount, 0) / 10000000).toFixed(1)}Cr` },
      ]} />
      <ScrollView showsVerticalScrollIndicator={false} style={{ backgroundColor: colors.background }} contentContainerStyle={styles.body}>

        {/* Risk filter */}
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
          {[["all", "All Applications", "#78350f"], ["low", "Low Risk", "#16a34a"], ["medium", "Medium Risk", "#d97706"], ["high", "High Risk", "#dc2626"]].map(([v, l, c]) => (
            <TouchableOpacity key={v} style={[styles.filterChip, { backgroundColor: riskFilter === v ? c : "#f1f5f9", borderColor: riskFilter === v ? c : colors.border, flex: 1 }]} onPress={() => { setRiskFilter(v); Haptics.selectionAsync(); }}>
              <Text style={{ color: riskFilter === v ? "#fff" : colors.mutedForeground, fontSize: 9, fontWeight: "700", textAlign: "center" }}>{l}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {filtered.map((loan) => {
          const rc = RISK_CONFIG[loan.risk];
          return (
            <View key={loan.id} style={[styles.loanCard, { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: rc.color, borderLeftWidth: 3 }]}>
              {/* Applicant header */}
              <View style={{ flexDirection: "row", gap: 10, alignItems: "flex-start" }}>
                <Image source={{ uri: loan.photo }} style={styles.loanPhoto} />
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "800" }}>{loan.applicant}</Text>
                    <View style={[styles.riskBadge, { backgroundColor: rc.bg }]}>
                      <Text style={{ color: rc.color, fontSize: 8, fontWeight: "800" }}>{rc.label}</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginTop: 2 }}>
                    <Feather name="map-pin" size={9} color={colors.mutedForeground} />
                    <Text style={{ color: colors.mutedForeground, fontSize: 10 }} numberOfLines={1}>{loan.property}</Text>
                  </View>
                  <Text style={{ color: "#7c3aed", fontSize: 10, fontWeight: "600", marginTop: 1 }}>{loan.bpid}</Text>
                </View>
              </View>

              {/* Loan details grid */}
              <View style={styles.loanGrid}>
                <LoanStat label="Amount" value={formatCurrency(loan.amount)} color="#1e3a8a" />
                <LoanStat label="Tenure" value={loan.tenure} color="#475569" />
                <LoanStat label="CIBIL" value={String(loan.cibil)} color={loan.cibil >= 750 ? "#16a34a" : loan.cibil >= 700 ? "#d97706" : "#dc2626"} />
                <LoanStat label="LTV" value={`${loan.ltv}%`} color={loan.ltv <= 75 ? "#16a34a" : "#d97706"} />
              </View>

              {/* Status + waiting */}
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <View style={[styles.statusChip, { backgroundColor: "#eff6ff" }]}>
                  <Feather name="clock" size={10} color="#1d4ed8" />
                  <Text style={{ color: "#1d4ed8", fontSize: 10, fontWeight: "600" }}>{loan.status} · {loan.waiting} day{loan.waiting !== 1 ? "s" : ""} waiting</Text>
                </View>
              </View>

              {/* Actions */}
              <View style={styles.bankActions}>
                <TouchableOpacity style={[styles.bankBtn, { backgroundColor: "#16a34a" }]} onPress={() => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); Alert.alert("Sanction Initiated ✓", `Loan for ${loan.applicant} has been initiated. BUID auto-linked.`); }}>
                  <Feather name="check-circle" size={13} color="#fff" />
                  <Text style={styles.bankBtnText}>Sanction</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.bankBtn, { backgroundColor: "#1e40af" }]} onPress={() => { Haptics.selectionAsync(); Alert.alert("BUID Verified ✓", `${loan.bpid}\nTitle clear · No disputes · Encumbrance-free`); }}>
                  <Feather name="shield" size={13} color="#fff" />
                  <Text style={styles.bankBtnText}>Verify BUID</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.bankBtnSm, { backgroundColor: "#fef2f2" }]} onPress={() => { Haptics.selectionAsync(); Alert.alert("Reject Loan", `Reject loan for ${loan.applicant}?`, [{ text: "Cancel", style: "cancel" }, { text: "Reject", style: "destructive" }]); }}>
                  <Feather name="x-circle" size={14} color="#dc2626" />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        <View style={[styles.infoBanner, { backgroundColor: "#fef3c7", borderColor: "#fde68a" }]}>
          <Feather name="shield" size={12} color="#d97706" />
          <Text style={{ color: "#d97706", fontSize: 10, flex: 1, lineHeight: 15 }}>
            <Text style={{ fontWeight: "700" }}>BPCS Integration:</Text> All loan applications auto-verify property title via BUID. No physical site visit needed. Encumbrance certificate pulled in real-time from Sub-Registrar records.
          </Text>
        </View>
      </ScrollView>
    </>
  );
}

function LoanStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={{ alignItems: "center", flex: 1 }}>
      <Text style={{ color, fontSize: 13, fontWeight: "800" }}>{value}</Text>
      <Text style={{ color: "#94a3b8", fontSize: 9, fontWeight: "600", marginTop: 1 }}>{label}</Text>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT — Role Router
// ═══════════════════════════════════════════════════════════════════════════════
export default function PropertiesScreen() {
  const { user } = useAuth();
  const colors = useColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {user?.role === "citizen" && <CitizenView />}
      {user?.role === "cpf" && <CPFView />}
      {user?.role === "developer" && <DeveloperView />}
      {user?.role === "govt" && <GovtView />}
      {user?.role === "bank" && <BankView />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 18, paddingBottom: 12, flexDirection: "row", alignItems: "center" },
  headerTitle: { color: "#fff", fontSize: 19, fontWeight: "800" },
  headerSub: { color: "rgba(255,255,255,0.55)", fontSize: 11, marginTop: 2 },
  headerBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  headerBadgeText: { color: "#fff", fontSize: 9, fontWeight: "800" },
  metricRow: { flexDirection: "row", backgroundColor: "#0f172a", paddingVertical: 10, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.08)" },
  metricItem: { flex: 1, alignItems: "center", gap: 1 },
  metricVal: { fontSize: 16, fontWeight: "800", color: "#fff" },
  metricSub: { fontSize: 8, color: "rgba(255,255,255,0.5)" },
  metricLabel: { fontSize: 8, color: "rgba(255,255,255,0.45)", fontWeight: "600", textAlign: "center" },
  metricDiv: { width: 1, backgroundColor: "rgba(255,255,255,0.12)", marginVertical: 4 },
  body: { padding: 14, paddingBottom: 120 },
  sectionHead: { fontSize: 10, fontWeight: "800", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10, marginTop: 4 },
  infoBanner: { flexDirection: "row", alignItems: "flex-start", gap: 8, padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  empty: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyTitle: { fontSize: 16, fontWeight: "700" },
  emptyDesc: { fontSize: 12, textAlign: "center", lineHeight: 18 },
  simpleCard: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 10 },
  dealCtaBtn: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#1e3a8a", borderRadius: 16, padding: 16, marginTop: 8 },
  dealCtaTitle: { color: "#fff", fontSize: 15, fontWeight: "700" },
  dealCtaSub: { color: "rgba(255,255,255,0.6)", fontSize: 11 },
  progressTrack: { height: 6, backgroundColor: "#e2e8f0", borderRadius: 3, marginVertical: 8, overflow: "hidden" },
  progressFill: { height: 6, borderRadius: 3 },
  commissionBar: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 14 },
  assignCard: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 12, gap: 10 },
  actionBanner: { flexDirection: "row", alignItems: "flex-start", gap: 6, padding: 8, borderRadius: 8 },
  assignMain: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  stagePill: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  stageRow: { flexDirection: "row", gap: 3, height: 4 },
  stageSeg: { flex: 1, borderRadius: 2 },
  expandedSection: { borderTopWidth: 1, paddingTop: 12, marginTop: 4, gap: 12 },
  partiesRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  partyItem: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  partyPhoto: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: "#e2e8f0" },
  quickActions: { flexDirection: "row", gap: 6 },
  qaBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, paddingVertical: 9, borderRadius: 8 },
  qaBtnText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  projectCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 14, gap: 12 },
  reraBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  unitBreakdown: { flexDirection: "row", gap: 8 },
  unitBox: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 10 },
  projActions: { flexDirection: "row", gap: 8 },
  projBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingVertical: 10, borderRadius: 10 },
  projBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  projBtnSm: { width: 42, height: 42, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  enquiryCard: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 8 },
  enquiryPhoto: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: "#e2e8f0" },
  filterChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  approvalCard: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 10, gap: 12 },
  typeIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  govtActions: { flexDirection: "row", gap: 6 },
  govtBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingVertical: 10, borderRadius: 10 },
  govtBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  govtBtnSm: { width: 42, height: 42, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  loanCard: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 10, gap: 12 },
  loanPhoto: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: "#e2e8f0" },
  loanGrid: { flexDirection: "row", borderTopWidth: 1, borderTopColor: "#f1f5f9", paddingTop: 10, justifyContent: "space-between" },
  riskBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  statusChip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  bankActions: { flexDirection: "row", gap: 6 },
  bankBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingVertical: 10, borderRadius: 10 },
  bankBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  bankBtnSm: { width: 42, height: 42, borderRadius: 10, alignItems: "center", justifyContent: "center" },
});
