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

// ─── Shared header ────────────────────────────────────────────────────────────
function RoleHeader({
  bg, icon, title, sub, badge,
}: {
  bg: string; icon: string; title: string; sub: string;
  badge?: { label: string; color: string };
}) {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  return (
    <View style={[S.header, { backgroundColor: bg, paddingTop: topPad + 8 }]}>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Feather name={icon as any} size={18} color="#fff" />
          <Text style={S.headerTitle}>{title}</Text>
        </View>
        <Text style={S.headerSub}>{sub}</Text>
      </View>
      {badge && (
        <View style={[S.headerBadge, { backgroundColor: badge.color }]}>
          <Text style={S.headerBadgeText}>{badge.label}</Text>
        </View>
      )}
    </View>
  );
}

function MetricRow({ items }: { items: { label: string; value: string; color?: string }[] }) {
  return (
    <View style={S.metricRow}>
      {items.map((it, i) => (
        <React.Fragment key={it.label}>
          <View style={S.metricItem}>
            <Text style={[S.metricVal, { color: it.color || "#fff" }]}>{it.value}</Text>
            <Text style={S.metricLabel}>{it.label}</Text>
          </View>
          {i < items.length - 1 && <View style={S.metricDiv} />}
        </React.Fragment>
      ))}
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CITIZEN — My Active Deal Tracker (6-stage timeline)
// ═══════════════════════════════════════════════════════════════════════════════
const STAGE_META = [
  { label: "Initiated", icon: "play-circle", actor: "You" },
  { label: "CPF Assigned", icon: "user-check", actor: "CPF Broker" },
  { label: "Doc Verification", icon: "file-text", actor: "CPF + Lawyer" },
  { label: "Legal Review", icon: "briefcase", actor: "Advocate" },
  { label: "Govt Approval", icon: "shield", actor: "Sub-Registrar" },
  { label: "Transfer Complete", icon: "check-circle", actor: "BPCS System" },
];

function CitizenTracker() {
  const { user } = useAuth();
  const { transactions, liveSimulationTxId, startLiveSimulation } = useData();
  const colors = useColors();
  const router = useRouter();

  const myDeals = transactions.filter(
    (t) => t.buyerId === user?.id || t.sellerId === user?.id
  );
  const active = myDeals.filter((t) => t.stage < 6);
  const done = myDeals.filter((t) => t.stage === 6);

  return (
    <>
      <RoleHeader bg="#1e3a8a" icon="activity" title="My Deal Tracker"
        sub={`${active.length} active · ${done.length} completed · Govt monitored`}
        badge={liveSimulationTxId ? { label: "LIVE", color: "#dc2626" } : undefined} />
      <MetricRow items={[
        { label: "Active Deals", value: String(active.length) },
        { label: "Completed", value: String(done.length), color: "#4ade80" },
        { label: "Escrow Held", value: active.length > 0 ? formatCurrency(active.reduce((s, t) => s + t.amount, 0)) : "—" },
        { label: "Status", value: active.length > 0 ? "In Progress" : "All Clear", color: active.length > 0 ? "#fbbf24" : "#4ade80" },
      ]} />
      <ScrollView showsVerticalScrollIndicator={false} style={{ backgroundColor: colors.background }} contentContainerStyle={S.body}>

        {myDeals.length === 0 ? (
          <View style={S.empty}>
            <Feather name="activity" size={40} color={colors.mutedForeground} />
            <Text style={[S.emptyTitle, { color: colors.foreground }]}>No deals yet</Text>
            <Text style={[S.emptyDesc, { color: colors.mutedForeground }]}>Start a transfer, apply for a loan, or raise a dispute from the Properties tab.</Text>
          </View>
        ) : myDeals.map((tx) => {
          const isLive = tx.id === liveSimulationTxId;
          const nextStage = STAGE_META[tx.stage] || STAGE_META[5];
          const isSeller = tx.sellerId === user?.id;

          return (
            <View key={tx.id} style={[S.dealCard, { backgroundColor: colors.card, borderColor: isLive ? "#dc2626" : colors.border }]}>
              {isLive && (
                <View style={S.livePill}>
                  <View style={S.liveDot} />
                  <Text style={S.liveText}>LIVE SIMULATION IN PROGRESS</Text>
                </View>
              )}

              {/* Header */}
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                <View style={{ flex: 1, gap: 3 }}>
                  <Text style={{ color: colors.mutedForeground, fontSize: 10, fontWeight: "700" }}>{tx.bpid}</Text>
                  <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: "700" }} numberOfLines={1}>{tx.propertyAddress}</Text>
                  <Text style={{ color: "#1e3a8a", fontSize: 16, fontWeight: "800" }}>{formatCurrency(tx.amount)}</Text>
                </View>
                <View style={{ alignItems: "flex-end", gap: 4 }}>
                  <View style={{ backgroundColor: isSeller ? "#fef3c7" : "#eff6ff", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 }}>
                    <Text style={{ color: isSeller ? "#d97706" : "#1d4ed8", fontSize: 10, fontWeight: "700" }}>{isSeller ? "YOU: SELLER" : "YOU: BUYER"}</Text>
                  </View>
                  <Text style={{ color: "#64748b", fontSize: 9 }}>Escrow: {tx.escrowStatus?.toUpperCase()}</Text>
                </View>
              </View>

              {/* 6-stage progress */}
              <View style={{ gap: 4 }}>
                <View style={{ flexDirection: "row", gap: 3 }}>
                  {[1, 2, 3, 4, 5, 6].map((s) => (
                    <View key={s} style={[S.stageBar, {
                      backgroundColor: s < tx.stage ? "#16a34a" : s === tx.stage ? "#f97316" : "#e2e8f0",
                      flex: 1,
                    }]} />
                  ))}
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ color: "#f97316", fontSize: 10, fontWeight: "700" }}>
                    Stage {tx.stage}/6 — {STAGE_META[tx.stage - 1]?.label}
                  </Text>
                  <Text style={{ color: "#64748b", fontSize: 9 }}>
                    {tx.stage === 6 ? "✓ Complete" : `Next: ${nextStage.label}`}
                  </Text>
                </View>
              </View>

              {/* Timeline of completed stages */}
              {tx.stageHistory.length > 0 && (
                <View style={[S.timelineBox, { borderColor: colors.border }]}>
                  {tx.stageHistory.slice(-3).map((sh, i) => (
                    <View key={i} style={{ flexDirection: "row", alignItems: "flex-start", gap: 8, paddingVertical: 4 }}>
                      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#16a34a", marginTop: 5 }} />
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: colors.foreground, fontSize: 11, fontWeight: "600" }}>{sh.label}</Text>
                        <Text style={{ color: "#64748b", fontSize: 9 }}>{sh.actor} · {new Date(sh.timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Actions */}
              <View style={{ flexDirection: "row", gap: 8 }}>
                {tx.stage < 6 && !isLive && (
                  <TouchableOpacity style={[S.actionBtn, { backgroundColor: "#dc2626", flex: 1 }]} onPress={() => { Haptics.selectionAsync(); startLiveSimulation(tx.id); }}>
                    <Feather name="play" size={13} color="#fff" />
                    <Text style={S.actionBtnText}>Watch Live</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={[S.actionBtn, { backgroundColor: "#1e3a8a", flex: 1 }]} onPress={() => router.push("/notifications" as any)}>
                  <Feather name="bell" size={13} color="#fff" />
                  <Text style={S.actionBtnText}>Updates</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[S.actionBtnSm, { backgroundColor: "#f1f5f9" }]} onPress={() => Haptics.selectionAsync()}>
                  <Feather name="download" size={14} color="#475569" />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        <View style={[S.infoBanner, { backgroundColor: "#eff6ff", borderColor: "#bfdbfe" }]}>
          <Feather name="info" size={12} color="#1d4ed8" />
          <Text style={{ color: "#1d4ed8", fontSize: 10, flex: 1, lineHeight: 15 }}>
            <Text style={{ fontWeight: "700" }}>RERAW 2026:</Text> Your money stays in escrow until Stage 6 completes. No party can access funds mid-transfer. All stages are govt-timestamped.
          </Text>
        </View>
      </ScrollView>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CPF BROKER — Pipeline + Commission Dashboard + Today's Checklist
// ═══════════════════════════════════════════════════════════════════════════════
const CPF_PIPELINE = [
  { id: "PL-001", bpid: "B-PID-MH-2026-002", property: "Thane Rural Plot", buyer: "Sunita Patel", seller: "Rajesh Sharma", amount: 8500000, stage: 3, commission: 170000, daysOpen: 3, nextAction: "Upload EC + Sale Deed draft", nextDue: "Today 3 PM" },
  { id: "PL-002", bpid: "B-PID-GJ-2026-004", property: "Gandhinagar Plot 22", buyer: "Meena Reddy", seller: "Vikram Singh", amount: 4400000, stage: 2, commission: 88000, daysOpen: 5, nextAction: "Complete buyer KYC — PAN + Aadhaar", nextDue: "Today 5 PM" },
  { id: "PL-003", bpid: "B-PID-MH-2026-005", property: "Emerald Heights 8A", buyer: "Deepak Joshi", seller: "Amit Builders", amount: 12500000, stage: 5, commission: 250000, daysOpen: 10, nextAction: "Monitor Govt portal for approval", nextDue: "Ongoing" },
  { id: "PL-004", bpid: "B-PID-MH-2026-001", property: "Andheri Flat 4B", buyer: "Priya Nair", seller: "Ramesh Sharma", amount: 15000000, stage: 1, commission: 300000, daysOpen: 1, nextAction: "Schedule site visit + seller meeting", nextDue: "Tomorrow" },
];

const CPF_TASKS = [
  { id: "T1", done: false, label: "Upload Encumbrance Cert — PL-001", urgent: true },
  { id: "T2", done: false, label: "KYC docs from Meena Reddy — PL-002", urgent: true },
  { id: "T3", done: true, label: "Confirm escrow receipt — PL-003", urgent: false },
  { id: "T4", done: false, label: "Schedule legal review meeting — PL-004", urgent: false },
  { id: "T5", done: true, label: "Update stage on BPCS portal — PL-001", urgent: false },
];

const STAGE_NAMES_SHORT = ["", "Init", "CPF", "Docs", "Legal", "Govt", "Done"];
const STAGE_COLORS = ["", "#64748b", "#7c3aed", "#d97706", "#1e40af", "#dc2626", "#16a34a"];

function CPFTracker() {
  const colors = useColors();
  const [tasks, setTasks] = useState(CPF_TASKS);
  const [activeTab, setActiveTab] = useState<"pipeline" | "checklist">("pipeline");
  const totalComm = CPF_PIPELINE.reduce((s, p) => s + p.commission, 0);
  const monthTarget = 800000;
  const commPct = Math.min(100, Math.round((totalComm / monthTarget) * 100));
  const doneCount = tasks.filter((t) => t.done).length;

  const stageCounts = [1, 2, 3, 4, 5, 6].map((s) => ({
    stage: s, count: CPF_PIPELINE.filter((p) => p.stage === s).length,
  }));

  return (
    <>
      <RoleHeader bg="#5b21b6" icon="trending-up" title="My Pipeline"
        sub={`${CPF_PIPELINE.length} deals · ₹${(CPF_PIPELINE.reduce((s, p) => s + p.amount, 0) / 10000000).toFixed(1)}Cr total value`}
        badge={{ label: `₹${(totalComm / 1000).toFixed(0)}K commission`, color: "#16a34a" }} />
      <MetricRow items={[
        { label: "Active Deals", value: String(CPF_PIPELINE.length) },
        { label: "Commission", value: `₹${(totalComm / 1000).toFixed(0)}K` },
        { label: "Target %", value: `${commPct}%`, color: commPct >= 75 ? "#4ade80" : "#fbbf24" },
        { label: "Tasks Left", value: String(tasks.filter((t) => !t.done).length), color: tasks.filter((t) => !t.done).length > 0 ? "#f87171" : "#4ade80" },
      ]} />

      <ScrollView showsVerticalScrollIndicator={false} style={{ backgroundColor: colors.background }} contentContainerStyle={S.body}>

        {/* Commission progress */}
        <View style={[S.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
            <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: "700" }}>May 2026 Commission</Text>
            <Text style={{ color: "#7c3aed", fontSize: 13, fontWeight: "800" }}>₹{(totalComm / 1000).toFixed(0)}K / ₹{(monthTarget / 1000).toFixed(0)}K</Text>
          </View>
          <View style={S.track}>
            <View style={[S.fill, { width: `${commPct}%` as any, backgroundColor: "#7c3aed" }]} />
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}>
            <Text style={{ color: colors.mutedForeground, fontSize: 10 }}>{commPct}% of monthly target</Text>
            <Text style={{ color: "#16a34a", fontSize: 10, fontWeight: "700" }}>🏆 Rank #2 in Region</Text>
          </View>
        </View>

        {/* Stage pipeline overview */}
        <View style={[S.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: "700", marginBottom: 10 }}>Stage Breakdown</Text>
          <View style={{ flexDirection: "row", gap: 6 }}>
            {stageCounts.map(({ stage, count }) => (
              <View key={stage} style={{ flex: 1, alignItems: "center", gap: 4 }}>
                <View style={[S.stageCount, { backgroundColor: count > 0 ? STAGE_COLORS[stage] + "20" : "#f1f5f9", borderColor: count > 0 ? STAGE_COLORS[stage] + "60" : "#e2e8f0" }]}>
                  <Text style={{ color: count > 0 ? STAGE_COLORS[stage] : "#94a3b8", fontSize: 16, fontWeight: "800" }}>{count}</Text>
                </View>
                <Text style={{ color: "#94a3b8", fontSize: 8, fontWeight: "600", textAlign: "center" }}>{STAGE_NAMES_SHORT[stage]}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Tabs */}
        <View style={[S.tabRow, { borderColor: colors.border }]}>
          {(["pipeline", "checklist"] as const).map((tab) => (
            <TouchableOpacity key={tab} style={[S.tab, activeTab === tab && { borderBottomColor: "#7c3aed", borderBottomWidth: 2 }]} onPress={() => { setActiveTab(tab); Haptics.selectionAsync(); }}>
              <Text style={{ color: activeTab === tab ? "#7c3aed" : colors.mutedForeground, fontSize: 13, fontWeight: "700", textTransform: "capitalize" }}>
                {tab === "pipeline" ? `🔄 Pipeline (${CPF_PIPELINE.length})` : `✅ Today's Tasks (${doneCount}/${tasks.length})`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === "pipeline" && CPF_PIPELINE.map((deal) => {
          const sc = STAGE_COLORS[deal.stage];
          return (
            <View key={deal.id} style={[S.pipelineCard, { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: sc, borderLeftWidth: 3 }]}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={{ color: colors.mutedForeground, fontSize: 9, fontWeight: "700" }}>{deal.id} · {deal.bpid}</Text>
                  <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: "700" }}>{deal.property}</Text>
                  <Text style={{ color: "#64748b", fontSize: 11 }}>{deal.seller} → {deal.buyer}</Text>
                  <Text style={{ color: "#1e3a8a", fontSize: 14, fontWeight: "800", marginTop: 2 }}>{formatCurrency(deal.amount)}</Text>
                </View>
                <View style={{ alignItems: "flex-end", gap: 5 }}>
                  <View style={[S.stagePill, { backgroundColor: sc + "20" }]}>
                    <Text style={{ color: sc, fontSize: 9, fontWeight: "800" }}>Stage {deal.stage}/6</Text>
                  </View>
                  <View style={{ backgroundColor: "#f0fdf4", paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 }}>
                    <Text style={{ color: "#16a34a", fontSize: 10, fontWeight: "700" }}>₹{(deal.commission / 1000).toFixed(0)}K</Text>
                  </View>
                  <Text style={{ color: "#94a3b8", fontSize: 9 }}>Day {deal.daysOpen}</Text>
                </View>
              </View>

              {/* Stage bar */}
              <View style={{ flexDirection: "row", gap: 3, height: 4 }}>
                {[1,2,3,4,5,6].map((s) => (
                  <View key={s} style={{ flex: 1, borderRadius: 2, backgroundColor: s <= deal.stage ? sc : "#e2e8f0" }} />
                ))}
              </View>

              {/* Next action */}
              <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 6, backgroundColor: "#fef3c7", padding: 8, borderRadius: 8 }}>
                <Feather name="arrow-right-circle" size={12} color="#d97706" />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#92400e", fontSize: 10, fontWeight: "700" }}>{deal.nextAction}</Text>
                  <Text style={{ color: "#d97706", fontSize: 9 }}>Due: {deal.nextDue}</Text>
                </View>
              </View>

              <View style={{ flexDirection: "row", gap: 6 }}>
                <TouchableOpacity style={[S.actionBtn, { backgroundColor: "#7c3aed", flex: 1 }]} onPress={() => Haptics.selectionAsync()}>
                  <Feather name="upload" size={12} color="#fff" />
                  <Text style={S.actionBtnText}>Upload Doc</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[S.actionBtn, { backgroundColor: "#1e3a8a", flex: 1 }]} onPress={() => Haptics.selectionAsync()}>
                  <Feather name="phone" size={12} color="#fff" />
                  <Text style={S.actionBtnText}>Call Parties</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[S.actionBtnSm, { backgroundColor: "#f1f5f9" }]} onPress={() => Haptics.selectionAsync()}>
                  <Feather name="clock" size={13} color="#475569" />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {activeTab === "checklist" && (
          <View style={[S.card, { backgroundColor: colors.card, borderColor: colors.border, gap: 2 }]}>
            <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: "700", marginBottom: 8 }}>Today's Task Checklist</Text>
            {tasks.map((task) => (
              <TouchableOpacity key={task.id} style={[S.taskRow, { borderBottomColor: colors.border }]} onPress={() => {
                Haptics.selectionAsync();
                setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, done: !t.done } : t));
              }}>
                <View style={[S.checkbox, { borderColor: task.done ? "#16a34a" : task.urgent ? "#dc2626" : "#d1d5db", backgroundColor: task.done ? "#f0fdf4" : "#fff" }]}>
                  {task.done && <Feather name="check" size={12} color="#16a34a" />}
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={{ color: task.done ? "#94a3b8" : colors.foreground, fontSize: 12, fontWeight: "600", textDecorationLine: task.done ? "line-through" : "none" }}>{task.label}</Text>
                  {task.urgent && !task.done && (
                    <Text style={{ color: "#dc2626", fontSize: 9, fontWeight: "700" }}>⚡ URGENT</Text>
                  )}
                </View>
                {!task.done && task.urgent && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#dc2626" }} />}
              </TouchableOpacity>
            ))}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border, marginTop: 8 }}>
              <Text style={{ color: "#64748b", fontSize: 12 }}>{doneCount}/{tasks.length} tasks completed</Text>
              <View style={S.track2}>
                <View style={[S.fill2, { width: `${Math.round((doneCount / tasks.length) * 100)}%` as any }]} />
              </View>
            </View>
          </View>
        )}

        <View style={[S.infoBanner, { backgroundColor: "#ede9fe", borderColor: "#c4b5fd" }]}>
          <Feather name="award" size={12} color="#7c3aed" />
          <Text style={{ color: "#7c3aed", fontSize: 10, flex: 1, lineHeight: 15 }}>
            <Text style={{ fontWeight: "700" }}>RERAW 2026:</Text> Commission auto-releases from BPCS Escrow within 24 hours of Stage 6 approval. No manual follow-up needed.
          </Text>
        </View>
      </ScrollView>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEVELOPER — Bookings & Payment Milestones
// ═══════════════════════════════════════════════════════════════════════════════
const BOOKINGS = [
  {
    id: "BK-001", unit: "EH-A-301", project: "Emerald Heights", type: "3BHK", floor: 3, size: "1500 sq ft",
    buyer: "Mohan Raj", buyerPhoto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop&crop=faces",
    amount: 18000000, bookedOn: "10 May 2026", possession: "Dec 2026",
    milestones: [
      { label: "Booking Amount (5%)", pct: 5, paid: true, date: "10 May 2026", amount: 900000 },
      { label: "On Agreement (20%)", pct: 20, paid: true, date: "12 May 2026", amount: 3600000 },
      { label: "On Foundation (10%)", pct: 10, paid: false, due: "Jun 2026", amount: 1800000 },
      { label: "On Slab (15%)", pct: 15, paid: false, due: "Aug 2026", amount: 2700000 },
      { label: "On Possession (50%)", pct: 50, paid: false, due: "Dec 2026", amount: 9000000 },
    ],
  },
  {
    id: "BK-002", unit: "EH-B-101", project: "Emerald Heights", type: "2BHK", floor: 1, size: "1100 sq ft",
    buyer: "Deepa Venkat", buyerPhoto: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=60&h=60&fit=crop&crop=faces",
    amount: 13000000, bookedOn: "08 May 2026", possession: "Dec 2026",
    milestones: [
      { label: "Booking Amount (5%)", pct: 5, paid: true, date: "08 May 2026", amount: 650000 },
      { label: "On Agreement (20%)", pct: 20, paid: false, due: "15 May 2026", amount: 2600000 },
      { label: "On Foundation (10%)", pct: 10, paid: false, due: "Jun 2026", amount: 1300000 },
      { label: "On Slab (15%)", pct: 15, paid: false, due: "Sep 2026", amount: 1950000 },
      { label: "On Possession (50%)", pct: 50, paid: false, due: "Dec 2026", amount: 6500000 },
    ],
  },
];

const RERA_ALERTS = [
  { id: "RA-001", label: "Occupancy Certificate — Emerald Heights Phase 1", due: "30 Jun 2026", critical: false },
  { id: "RA-002", label: "Quarterly progress report — Green Valley Township", due: "20 May 2026", critical: true },
  { id: "RA-003", label: "Structural audit submission — Emerald Heights", due: "01 Jul 2026", critical: false },
];

function DeveloperTracker() {
  const colors = useColors();
  const [expandedId, setExpandedId] = useState<string | null>("BK-001");
  const totalBooked = BOOKINGS.reduce((s, b) => s + b.amount, 0);
  const totalReceived = BOOKINGS.reduce((s, b) => s + b.milestones.filter((m) => m.paid).reduce((ms, m) => ms + m.amount, 0), 0);

  return (
    <>
      <RoleHeader bg="#065f46" icon="package" title="Bookings & Payments"
        sub={`${BOOKINGS.length} confirmed bookings · RERA compliant`}
        badge={{ label: `${RERA_ALERTS.filter((a) => a.critical).length} RERA Alert`, color: "#dc2626" }} />
      <MetricRow items={[
        { label: "Total Bookings", value: String(BOOKINGS.length) },
        { label: "Booking Value", value: `₹${(totalBooked / 10000000).toFixed(1)}Cr` },
        { label: "Received", value: `₹${(totalReceived / 1000000).toFixed(1)}M`, color: "#4ade80" },
        { label: "Pending", value: `₹${((totalBooked - totalReceived) / 10000000).toFixed(1)}Cr`, color: "#fbbf24" },
      ]} />
      <ScrollView showsVerticalScrollIndicator={false} style={{ backgroundColor: colors.background }} contentContainerStyle={S.body}>

        <Text style={[S.sectionHead, { color: colors.mutedForeground }]}>CONFIRMED UNIT BOOKINGS</Text>
        {BOOKINGS.map((bk) => {
          const paidAmt = bk.milestones.filter((m) => m.paid).reduce((s, m) => s + m.amount, 0);
          const paidPct = Math.round((paidAmt / bk.amount) * 100);
          const nextDue = bk.milestones.find((m) => !m.paid);
          const expanded = expandedId === bk.id;

          return (
            <TouchableOpacity key={bk.id} style={[S.bookingCard, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => { setExpandedId(expanded ? null : bk.id); Haptics.selectionAsync(); }} activeOpacity={0.85}>
              <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
                <Image source={{ uri: bk.buyerPhoto }} style={S.buyerPhoto} />
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: "700" }}>{bk.buyer}</Text>
                    <View style={{ backgroundColor: "#f0fdf4", paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 }}>
                      <Text style={{ color: "#16a34a", fontSize: 9, fontWeight: "700" }}>{bk.type}</Text>
                    </View>
                  </View>
                  <Text style={{ color: "#64748b", fontSize: 11 }}>{bk.unit} · {bk.project} · Flr {bk.floor}</Text>
                  <Text style={{ color: "#64748b", fontSize: 10 }}>{bk.size} · Possession: {bk.possession}</Text>
                </View>
                <View style={{ alignItems: "flex-end", gap: 3 }}>
                  <Text style={{ color: "#065f46", fontSize: 14, fontWeight: "800" }}>{formatCurrency(bk.amount)}</Text>
                  <Text style={{ color: "#64748b", fontSize: 9 }}>{paidPct}% received</Text>
                  <Feather name={expanded ? "chevron-up" : "chevron-down"} size={14} color="#94a3b8" />
                </View>
              </View>

              {/* Payment progress */}
              <View style={S.track}>
                <View style={[S.fill, { width: `${paidPct}%` as any, backgroundColor: "#065f46" }]} />
              </View>
              {nextDue && (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#fef3c7", padding: 8, borderRadius: 8 }}>
                  <Feather name="clock" size={11} color="#d97706" />
                  <Text style={{ color: "#92400e", fontSize: 10, fontWeight: "700" }}>Next: {nextDue.label} — {formatCurrency(nextDue.amount)} due {nextDue.due}</Text>
                </View>
              )}

              {expanded && (
                <View style={[S.milestoneTable, { borderColor: colors.border }]}>
                  {bk.milestones.map((ms, idx) => (
                    <View key={idx} style={[S.msRow, { borderBottomColor: colors.border, borderBottomWidth: idx < bk.milestones.length - 1 ? 1 : 0 }]}>
                      <View style={[S.msDot, { backgroundColor: ms.paid ? "#16a34a" : "#e2e8f0" }]}>
                        {ms.paid && <Feather name="check" size={8} color="#fff" />}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: ms.paid ? "#16a34a" : colors.foreground, fontSize: 11, fontWeight: "600" }}>{ms.label}</Text>
                        <Text style={{ color: "#94a3b8", fontSize: 9 }}>{ms.paid ? `Paid ${ms.date}` : `Due: ${ms.due}`}</Text>
                      </View>
                      <Text style={{ color: ms.paid ? "#16a34a" : colors.mutedForeground, fontSize: 12, fontWeight: "700" }}>{formatCurrency(ms.amount)}</Text>
                    </View>
                  ))}
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        <Text style={[S.sectionHead, { color: colors.mutedForeground, marginTop: 8 }]}>RERA COMPLIANCE ALERTS</Text>
        {RERA_ALERTS.map((alert) => (
          <View key={alert.id} style={[S.reraAlert, { backgroundColor: alert.critical ? "#fef2f2" : "#fef3c7", borderColor: alert.critical ? "#fecaca" : "#fde68a" }]}>
            <Feather name={alert.critical ? "alert-triangle" : "clock"} size={14} color={alert.critical ? "#dc2626" : "#d97706"} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: alert.critical ? "#991b1b" : "#92400e", fontSize: 12, fontWeight: "700" }}>{alert.label}</Text>
              <Text style={{ color: alert.critical ? "#dc2626" : "#d97706", fontSize: 10 }}>Due: {alert.due}</Text>
            </View>
            <TouchableOpacity style={{ backgroundColor: alert.critical ? "#dc2626" : "#d97706", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 }} onPress={() => Haptics.selectionAsync()}>
              <Text style={{ color: "#fff", fontSize: 10, fontWeight: "700" }}>File Now</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// GOVT OFFICER — Today's Work: Processed + Revenue + Disputes
// ═══════════════════════════════════════════════════════════════════════════════
const TODAY_PROCESSED = [
  { id: "APR-001", type: "Transfer", bpid: "B-PID-TN-2026-011", parties: "Suresh Babu → Kavitha R", amount: 6200000, approvedAt: "09:14 AM", stampDuty: 248000 },
  { id: "APR-002", type: "Loan NOC", bpid: "B-PID-MH-2026-009", parties: "Dhiraj Patil — HDFC", amount: 4500000, approvedAt: "10:32 AM", stampDuty: 0 },
  { id: "APR-003", type: "Transfer", bpid: "B-PID-KA-2026-003", parties: "Vinod Kumar → Lakshmi Devi", amount: 3800000, approvedAt: "11:50 AM", stampDuty: 152000 },
];

const OPEN_DISPUTES = [
  { id: "DS-001", bpid: "B-PID-MH-2026-003", title: "Boundary Dispute — Ahmed Khan vs Priya Builders", raised: "02 May 2026", hearingDate: "18 May 2026", status: "Hearing Scheduled", priority: "high" },
  { id: "DS-002", bpid: "B-PID-UP-2026-007", title: "Title Fraud Allegation — Ravi Tiwari", raised: "10 May 2026", hearingDate: "25 May 2026", status: "Evidence Collection", priority: "medium" },
];

const AUDIT_LOG = [
  { action: "Transfer Approved", bpid: "B-PID-TN-2026-011", time: "09:14 AM", officer: "Ofcr. K. Ramaswamy" },
  { action: "Loan NOC Issued", bpid: "B-PID-MH-2026-009", time: "10:32 AM", officer: "Ofcr. K. Ramaswamy" },
  { action: "Transfer Approved", bpid: "B-PID-KA-2026-003", time: "11:50 AM", officer: "Ofcr. K. Ramaswamy" },
  { action: "Doc Requested", bpid: "B-PID-MH-2026-002", time: "02:15 PM", officer: "Ofcr. K. Ramaswamy" },
];

function GovtTracker() {
  const colors = useColors();
  const [tab, setTab] = useState<"processed" | "disputes" | "audit">("processed");
  const totalRevenue = TODAY_PROCESSED.reduce((s, t) => s + t.stampDuty, 0);
  const totalValue = TODAY_PROCESSED.reduce((s, t) => s + t.amount, 0);

  return (
    <>
      <RoleHeader bg="#7f1d1d" icon="check-square" title="Today's Work"
        sub={`${TODAY_PROCESSED.length} processed · ₹${(totalRevenue / 1000).toFixed(0)}K revenue collected`}
        badge={{ label: `${OPEN_DISPUTES.length} Disputes Open`, color: "#d97706" }} />
      <MetricRow items={[
        { label: "Approved Today", value: String(TODAY_PROCESSED.length), color: "#4ade80" },
        { label: "Pending Queue", value: "5", color: "#fbbf24" },
        { label: "Revenue", value: `₹${(totalRevenue / 1000).toFixed(0)}K`, color: "#4ade80" },
        { label: "Disputes", value: String(OPEN_DISPUTES.length), color: "#f87171" },
      ]} />
      <ScrollView showsVerticalScrollIndicator={false} style={{ backgroundColor: colors.background }} contentContainerStyle={S.body}>

        {/* Revenue card */}
        <View style={[S.card, { backgroundColor: "#1e3a8a", borderColor: "#1e40af" }]}>
          <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 10, fontWeight: "700", marginBottom: 6 }}>TODAY'S REVENUE — MAY 15, 2026</Text>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
            <View>
              <Text style={{ color: "#fff", fontSize: 24, fontWeight: "800" }}>₹{(totalRevenue / 1000).toFixed(1)}K</Text>
              <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 11 }}>Stamp Duty + Registration Fee</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ color: "#4ade80", fontSize: 12, fontWeight: "700" }}>↑ 12% vs yesterday</Text>
              <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 10 }}>{TODAY_PROCESSED.length} transactions · ₹{(totalValue / 10000000).toFixed(1)}Cr total</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 12, marginTop: 12 }}>
            <View style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 8, padding: 8, alignItems: "center" }}>
              <Text style={{ color: "#fff", fontSize: 14, fontWeight: "800" }}>₹{(TODAY_PROCESSED.filter(t => t.type === "Transfer").reduce((s,t)=>s+t.stampDuty,0)/1000).toFixed(0)}K</Text>
              <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 9 }}>Transfer Duty</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 8, padding: 8, alignItems: "center" }}>
              <Text style={{ color: "#fff", fontSize: 14, fontWeight: "800" }}>₹2.4K</Text>
              <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 9 }}>Reg. Fees</Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={[S.tabRow, { borderColor: colors.border }]}>
          {(["processed", "disputes", "audit"] as const).map((t) => (
            <TouchableOpacity key={t} style={[S.tab, tab === t && { borderBottomColor: "#7f1d1d", borderBottomWidth: 2 }]} onPress={() => { setTab(t); Haptics.selectionAsync(); }}>
              <Text style={{ color: tab === t ? "#7f1d1d" : colors.mutedForeground, fontSize: 11, fontWeight: "700" }}>
                {t === "processed" ? `✅ Processed (${TODAY_PROCESSED.length})` : t === "disputes" ? `⚖️ Disputes (${OPEN_DISPUTES.length})` : "📋 Audit Log"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {tab === "processed" && TODAY_PROCESSED.map((item) => (
          <View key={item.id} style={[S.processedCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
              <View style={[S.typeIcon, { backgroundColor: "#f0fdf4" }]}>
                <Feather name="check-circle" size={16} color="#16a34a" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <View style={{ backgroundColor: "#eff6ff", paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 }}>
                    <Text style={{ color: "#1d4ed8", fontSize: 9, fontWeight: "800" }}>{item.type}</Text>
                  </View>
                  <Text style={{ color: "#94a3b8", fontSize: 9 }}>{item.id} · {item.approvedAt}</Text>
                </View>
                <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: "700", marginTop: 3 }}>{item.parties}</Text>
                <Text style={{ color: "#7c3aed", fontSize: 10, fontWeight: "600" }}>{item.bpid}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={{ color: "#1e3a8a", fontSize: 13, fontWeight: "800" }}>{formatCurrency(item.amount)}</Text>
                {item.stampDuty > 0 && <Text style={{ color: "#16a34a", fontSize: 10, fontWeight: "700" }}>+₹{(item.stampDuty/1000).toFixed(0)}K duty</Text>}
              </View>
            </View>
          </View>
        ))}

        {tab === "disputes" && OPEN_DISPUTES.map((ds) => (
          <View key={ds.id} style={[S.disputeCard, { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: ds.priority === "high" ? "#dc2626" : "#d97706", borderLeftWidth: 3 }]}>
            <Text style={{ color: colors.mutedForeground, fontSize: 9, fontWeight: "700" }}>{ds.id} · {ds.bpid}</Text>
            <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: "700", marginTop: 2 }}>{ds.title}</Text>
            <View style={{ flexDirection: "row", gap: 12, marginTop: 5 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Feather name="calendar" size={11} color={colors.mutedForeground} />
                <Text style={{ color: colors.mutedForeground, fontSize: 10 }}>Raised: {ds.raised}</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Feather name="clock" size={11} color="#d97706" />
                <Text style={{ color: "#d97706", fontSize: 10, fontWeight: "600" }}>Hearing: {ds.hearingDate}</Text>
              </View>
            </View>
            <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
              <TouchableOpacity style={[S.actionBtn, { backgroundColor: "#7c3aed", flex: 1 }]} onPress={() => Haptics.selectionAsync()}>
                <Feather name="file-text" size={12} color="#fff" />
                <Text style={S.actionBtnText}>View Case</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[S.actionBtn, { backgroundColor: "#1e3a8a", flex: 1 }]} onPress={() => Haptics.selectionAsync()}>
                <Feather name="send" size={12} color="#fff" />
                <Text style={S.actionBtnText}>Issue Notice</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {tab === "audit" && (
          <View style={[S.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: "700", marginBottom: 12 }}>Today's Audit Trail</Text>
            {AUDIT_LOG.map((log, i) => (
              <View key={i} style={{ flexDirection: "row", gap: 10, paddingVertical: 8, borderBottomWidth: i < AUDIT_LOG.length - 1 ? 1 : 0, borderBottomColor: colors.border }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#16a34a", marginTop: 5 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: "600" }}>{log.action}</Text>
                  <Text style={{ color: "#7c3aed", fontSize: 10 }}>{log.bpid}</Text>
                  <Text style={{ color: "#94a3b8", fontSize: 9 }}>{log.officer} · {log.time}</Text>
                </View>
                <Feather name="check-circle" size={14} color="#16a34a" />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// BANK — Loan Portfolio: EMI + NPA Alerts + Disbursements
// ═══════════════════════════════════════════════════════════════════════════════
const ACTIVE_LOANS = [
  { id: "LN-A001", applicant: "Rajesh Kumar Sharma", bpid: "B-PID-MH-2026-001", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop&crop=faces", principal: 9000000, outstanding: 8240000, emi: 78302, nextEmiDate: "01 Jun 2026", daysOverdue: 0, rate: 8.5, tenure: "240 months", ltv: 62, health: "healthy" },
  { id: "LN-A002", applicant: "Priya Mehta", bpid: "B-PID-DL-2026-003", photo: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=60&h=60&fit=crop&crop=faces", principal: 7500000, outstanding: 7100000, emi: 66500, nextEmiDate: "28 May 2026", daysOverdue: 12, rate: 9.0, tenure: "180 months", ltv: 68, health: "npa_warning" },
  { id: "LN-A003", applicant: "Vikram Singh", bpid: "B-PID-GJ-2026-004", photo: "https://images.unsplash.com/photo-1566753323558-f4e0952af115?w=60&h=60&fit=crop&crop=faces", principal: 4400000, outstanding: 4400000, emi: 42000, nextEmiDate: "25 May 2026", daysOverdue: 0, rate: 9.5, tenure: "120 months", ltv: 72, health: "healthy" },
];

const DISBURSEMENTS_DUE = [
  { id: "DS-D001", applicant: "Sunita Patel", amount: 6500000, property: "Flat 4B, Sunshine Residency", tranche: "1st disbursement (60%)", readyOn: "Today" },
  { id: "DS-D002", applicant: "Anita Joshi", amount: 9200000, property: "Green Valley Township 3BHK", tranche: "Post-valuation (100%)", readyOn: "18 May 2026" },
];

const HEALTH_CONFIG: Record<string, { color: string; bg: string; label: string; icon: string }> = {
  healthy: { color: "#16a34a", bg: "#f0fdf4", label: "HEALTHY", icon: "check-circle" },
  npa_warning: { color: "#dc2626", bg: "#fef2f2", label: "NPA WARNING", icon: "alert-triangle" },
  watch: { color: "#d97706", bg: "#fef3c7", label: "WATCH", icon: "eye" },
};

function BankTracker() {
  const colors = useColors();
  const [tab, setTab] = useState<"portfolio" | "disbursements">("portfolio");
  const totalPortfolio = ACTIVE_LOANS.reduce((s, l) => s + l.outstanding, 0);
  const npaLoans = ACTIVE_LOANS.filter((l) => l.health === "npa_warning");
  const emiDueToday = ACTIVE_LOANS.filter((l) => l.daysOverdue === 0).length;

  return (
    <>
      <RoleHeader bg="#78350f" icon="briefcase" title="Loan Portfolio"
        sub={`${ACTIVE_LOANS.length} active loans · ₹${(totalPortfolio / 10000000).toFixed(2)}Cr outstanding`}
        badge={npaLoans.length > 0 ? { label: `${npaLoans.length} NPA Alert`, color: "#dc2626" } : undefined} />
      <MetricRow items={[
        { label: "Active Loans", value: String(ACTIVE_LOANS.length) },
        { label: "Outstanding", value: `₹${(totalPortfolio / 10000000).toFixed(1)}Cr` },
        { label: "NPA Alerts", value: String(npaLoans.length), color: npaLoans.length > 0 ? "#f87171" : "#4ade80" },
        { label: "Disbursements Due", value: String(DISBURSEMENTS_DUE.length), color: "#fbbf24" },
      ]} />
      <ScrollView showsVerticalScrollIndicator={false} style={{ backgroundColor: colors.background }} contentContainerStyle={S.body}>

        {/* EMI collection today */}
        <View style={[S.card, { backgroundColor: "#78350f", borderColor: "#92400e" }]}>
          <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 10, fontWeight: "700", marginBottom: 6 }}>MAY 2026 EMI COLLECTION</Text>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
            <View>
              <Text style={{ color: "#fff", fontSize: 22, fontWeight: "800" }}>₹{((ACTIVE_LOANS.reduce((s,l)=>s+l.emi,0))/1000).toFixed(1)}K</Text>
              <Text style={{ color: "rgba(255,255,255,0.55)", fontSize: 11 }}>Total EMI due this cycle</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ color: "#4ade80", fontSize: 12, fontWeight: "700" }}>{ACTIVE_LOANS.filter(l => l.daysOverdue === 0).length}/{ACTIVE_LOANS.length} on track</Text>
              <Text style={{ color: "#f87171", fontSize: 11, fontWeight: "700" }}>{npaLoans.length} overdue</Text>
            </View>
          </View>
        </View>

        {/* NPA alert banner */}
        {npaLoans.length > 0 && (
          <View style={[S.infoBanner, { backgroundColor: "#fef2f2", borderColor: "#fecaca" }]}>
            <Feather name="alert-triangle" size={14} color="#dc2626" />
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#991b1b", fontSize: 12, fontWeight: "800" }}>⚠️ NPA WARNING — Immediate action required</Text>
              <Text style={{ color: "#dc2626", fontSize: 10 }}>{npaLoans.map(l => l.applicant).join(", ")} — EMI overdue. Issue notice under SARFAESI Act 2002.</Text>
            </View>
          </View>
        )}

        {/* Tabs */}
        <View style={[S.tabRow, { borderColor: colors.border }]}>
          {(["portfolio", "disbursements"] as const).map((t) => (
            <TouchableOpacity key={t} style={[S.tab, tab === t && { borderBottomColor: "#78350f", borderBottomWidth: 2 }]} onPress={() => { setTab(t); Haptics.selectionAsync(); }}>
              <Text style={{ color: tab === t ? "#78350f" : colors.mutedForeground, fontSize: 12, fontWeight: "700" }}>
                {t === "portfolio" ? `💼 Active Portfolio (${ACTIVE_LOANS.length})` : `💸 Disbursements Due (${DISBURSEMENTS_DUE.length})`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {tab === "portfolio" && ACTIVE_LOANS.map((loan) => {
          const hc = HEALTH_CONFIG[loan.health];
          const outstandingPct = Math.round((loan.outstanding / loan.principal) * 100);

          return (
            <View key={loan.id} style={[S.loanPortCard, { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: hc.color, borderLeftWidth: 3 }]}>
              <View style={{ flexDirection: "row", gap: 10, alignItems: "flex-start" }}>
                <Image source={{ uri: loan.photo }} style={S.loanPhoto} />
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: "800" }}>{loan.applicant}</Text>
                    <View style={[S.healthBadge, { backgroundColor: hc.bg }]}>
                      <Feather name={hc.icon as any} size={8} color={hc.color} />
                      <Text style={{ color: hc.color, fontSize: 8, fontWeight: "800" }}>{hc.label}</Text>
                    </View>
                  </View>
                  <Text style={{ color: "#7c3aed", fontSize: 10, fontWeight: "600" }}>{loan.bpid}</Text>
                </View>
              </View>

              {/* Loan stats grid */}
              <View style={S.loanStatsGrid}>
                {[
                  { label: "Principal", value: formatCurrency(loan.principal), color: "#1e3a8a" },
                  { label: "Outstanding", value: formatCurrency(loan.outstanding), color: loan.health === "npa_warning" ? "#dc2626" : "#475569" },
                  { label: "EMI / Month", value: `₹${(loan.emi/1000).toFixed(1)}K`, color: "#065f46" },
                  { label: "Rate", value: `${loan.rate}% p.a.`, color: "#64748b" },
                ].map((s, i) => (
                  <View key={i} style={{ flex: 1, alignItems: "center", paddingVertical: 6 }}>
                    <Text style={{ color: s.color, fontSize: 11, fontWeight: "800" }}>{s.value}</Text>
                    <Text style={{ color: "#94a3b8", fontSize: 8, fontWeight: "600" }}>{s.label}</Text>
                  </View>
                ))}
              </View>

              {/* Outstanding progress */}
              <View>
                <View style={S.track}>
                  <View style={[S.fill, { width: `${100 - outstandingPct}%` as any, backgroundColor: loan.health === "npa_warning" ? "#dc2626" : "#16a34a" }]} />
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ color: "#94a3b8", fontSize: 9 }}>{100 - outstandingPct}% repaid · {outstandingPct}% outstanding</Text>
                  <Text style={{ color: loan.daysOverdue > 0 ? "#dc2626" : "#16a34a", fontSize: 9, fontWeight: "700" }}>
                    {loan.daysOverdue > 0 ? `⚠️ ${loan.daysOverdue} days overdue` : `Next EMI: ${loan.nextEmiDate}`}
                  </Text>
                </View>
              </View>

              {loan.health === "npa_warning" && (
                <View style={{ flexDirection: "row", gap: 6 }}>
                  <TouchableOpacity style={[S.actionBtn, { backgroundColor: "#dc2626", flex: 1 }]} onPress={() => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); Alert.alert("Legal Notice", `Issue SARFAESI notice to ${loan.applicant}?`, [{ text: "Cancel", style: "cancel" }, { text: "Issue", style: "destructive" }]); }}>
                    <Feather name="alert-triangle" size={12} color="#fff" />
                    <Text style={S.actionBtnText}>Issue Notice</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[S.actionBtn, { backgroundColor: "#1e3a8a", flex: 1 }]} onPress={() => Haptics.selectionAsync()}>
                    <Feather name="phone" size={12} color="#fff" />
                    <Text style={S.actionBtnText}>Recovery Call</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}

        {tab === "disbursements" && DISBURSEMENTS_DUE.map((dis) => (
          <View key={dis.id} style={[S.disbCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
              <View style={{ flex: 1, gap: 3 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "800" }}>{dis.applicant}</Text>
                  {dis.readyOn === "Today" && (
                    <View style={{ backgroundColor: "#fef9c3", paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 }}>
                      <Text style={{ color: "#a16207", fontSize: 9, fontWeight: "800" }}>READY TODAY</Text>
                    </View>
                  )}
                </View>
                <Text style={{ color: "#64748b", fontSize: 11 }} numberOfLines={1}>{dis.property}</Text>
                <Text style={{ color: "#7c3aed", fontSize: 10, fontWeight: "600" }}>{dis.tranche}</Text>
              </View>
              <Text style={{ color: "#065f46", fontSize: 16, fontWeight: "800" }}>{formatCurrency(dis.amount)}</Text>
            </View>
            <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
              <TouchableOpacity style={[S.actionBtn, { backgroundColor: "#16a34a", flex: 1 }]} onPress={() => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); Alert.alert("Disburse Funds ✓", `₹${(dis.amount/1000000).toFixed(1)}M will be transferred to ${dis.applicant}'s account. Confirm?`, [{ text: "Cancel", style: "cancel" }, { text: "Disburse", style: "default" }]); }}>
                <Feather name="send" size={12} color="#fff" />
                <Text style={S.actionBtnText}>Disburse Now</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[S.actionBtn, { backgroundColor: "#1e3a8a", flex: 1 }]} onPress={() => Haptics.selectionAsync()}>
                <Feather name="shield" size={12} color="#fff" />
                <Text style={S.actionBtnText}>Verify BUID</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[S.actionBtnSm, { backgroundColor: "#f1f5f9" }]} onPress={() => Haptics.selectionAsync()}>
                <Feather name="file-text" size={13} color="#475569" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT — Role Router
// ═══════════════════════════════════════════════════════════════════════════════
export default function TransactionsScreen() {
  const { user } = useAuth();
  const colors = useColors();

  return (
    <View style={[S.container, { backgroundColor: colors.background }]}>
      {user?.role === "citizen" && <CitizenTracker />}
      {user?.role === "cpf" && <CPFTracker />}
      {user?.role === "developer" && <DeveloperTracker />}
      {user?.role === "govt" && <GovtTracker />}
      {user?.role === "bank" && <BankTracker />}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 18, paddingBottom: 12, flexDirection: "row", alignItems: "center" },
  headerTitle: { color: "#fff", fontSize: 19, fontWeight: "800" },
  headerSub: { color: "rgba(255,255,255,0.55)", fontSize: 11, marginTop: 2 },
  headerBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  headerBadgeText: { color: "#fff", fontSize: 9, fontWeight: "800" },
  metricRow: { flexDirection: "row", backgroundColor: "#0f172a", paddingVertical: 10, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.08)" },
  metricItem: { flex: 1, alignItems: "center", gap: 2 },
  metricVal: { fontSize: 15, fontWeight: "800", color: "#fff" },
  metricLabel: { fontSize: 8, color: "rgba(255,255,255,0.45)", fontWeight: "600", textAlign: "center" },
  metricDiv: { width: 1, backgroundColor: "rgba(255,255,255,0.12)", marginVertical: 4 },
  body: { padding: 14, paddingBottom: 120 },
  sectionHead: { fontSize: 10, fontWeight: "800", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 },
  infoBanner: { flexDirection: "row", alignItems: "flex-start", gap: 8, padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  empty: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyTitle: { fontSize: 16, fontWeight: "700" },
  emptyDesc: { fontSize: 12, textAlign: "center", lineHeight: 18 },
  card: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 12 },
  dealCard: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 12, gap: 10 },
  livePill: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#dc2626", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, alignSelf: "flex-start" },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#fff" },
  liveText: { color: "#fff", fontSize: 10, fontWeight: "800" },
  stageBar: { height: 5, borderRadius: 2 },
  timelineBox: { borderWidth: 1, borderRadius: 10, padding: 10, gap: 2 },
  tabRow: { flexDirection: "row", borderBottomWidth: 1, marginBottom: 12 },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center" },
  track: { height: 6, backgroundColor: "#e2e8f0", borderRadius: 3, overflow: "hidden" },
  fill: { height: 6, borderRadius: 3 },
  track2: { flex: 1, height: 4, backgroundColor: "#e2e8f0", borderRadius: 2, overflow: "hidden", maxWidth: 80 },
  fill2: { height: 4, borderRadius: 2, backgroundColor: "#7c3aed" },
  stageCount: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  stagePill: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  pipelineCard: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 10, gap: 8 },
  taskRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, borderBottomWidth: 1 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  bookingCard: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 10, gap: 10 },
  buyerPhoto: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: "#e2e8f0" },
  milestoneTable: { borderWidth: 1, borderRadius: 10, overflow: "hidden" },
  msRow: { flexDirection: "row", alignItems: "center", gap: 8, padding: 10 },
  msDot: { width: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  reraAlert: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  processedCard: { borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 8 },
  typeIcon: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  disputeCard: { borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 8, gap: 4 },
  loanPortCard: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 10, gap: 10 },
  loanPhoto: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: "#e2e8f0" },
  loanStatsGrid: { flexDirection: "row", borderTopWidth: 1, borderTopColor: "#f1f5f9", borderBottomWidth: 1, borderBottomColor: "#f1f5f9", paddingVertical: 4 },
  healthBadge: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 8 },
  disbCard: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 10 },
  actionBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingVertical: 9, borderRadius: 10 },
  actionBtnText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  actionBtnSm: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
});
