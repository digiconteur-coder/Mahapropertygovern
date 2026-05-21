import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MetricCard } from "@/components/MetricCard";
import { PropertyCard } from "@/components/PropertyCard";
import { SectionHeader } from "@/components/SectionHeader";
import { TransactionCard } from "@/components/TransactionCard";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";
import { useLang, Lang, LANG_LABELS } from "@/context/LanguageContext";
import { formatCurrency } from "@/utils/format";

const USER_PHOTOS: Record<string, string> = {
  USR001:
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=faces",
  USR002:
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&h=120&fit=crop&crop=faces",
  USR003:
    "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=120&h=120&fit=crop&crop=faces",
  USR004:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=faces",
  USR005:
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop&crop=faces",
};

const ROLE_COLORS: Record<string, string> = {
  citizen: "#1e40af",
  cpf: "#7c3aed",
  developer: "#059669",
  govt: "#dc2626",
  bank: "#d97706",
};

// State → Language mapping for the language bar
const STATE_LANG_OPTIONS: { lang: Lang; label: string; states: string }[] = [
  { lang: "en", label: "English", states: "All India" },
  { lang: "hi", label: "हिंदी", states: "UP · MP · Bihar · Raj" },
  { lang: "mr", label: "मराठी", states: "Maharashtra · Goa" },
  { lang: "ta", label: "தமிழ்", states: "Tamil Nadu · Puducherry" },
  { lang: "te", label: "తెలుగు", states: "AP · Telangana" },
];

const GOVT_SCHEMES = [
  {
    title: "PMAY 2.0 — Housing for All",
    desc: "₹3L interest subsidy for eligible homebuyers under Pradhan Mantri Awas Yojana 2.0. EWS/LIG/MIG categories. 1 Crore homes targeted.",
    color: "#1e3a8a",
    accent: "#f97316",
    icon: "home",
    image: "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=200&h=120&fit=crop",
    tag: "APPLY NOW",
    deadline: "Deadline: 31 Mar 2027",
  },
  {
    title: "Yuva Awas Yojana 2026",
    desc: "First home for India's youth aged 18–35. 4% interest subvention on loans up to ₹40L. Zero stamp duty on first purchase in 8 states.",
    color: "#0c4a6e",
    accent: "#38bdf8",
    icon: "star",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=200&h=120&fit=crop",
    tag: "YOUTH SCHEME",
    deadline: "Open: FY 2026–27",
  },
  {
    title: "PM Svamitva — Rural Rights",
    desc: "Drone survey + legal property title for 6.5 Crore rural households. Link your Svamitva card to BPCS for bank loans & inheritance rights.",
    color: "#14532d",
    accent: "#4ade80",
    icon: "map",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=200&h=120&fit=crop",
    tag: "RURAL INDIA",
    deadline: "Phase 3 — Active 2026",
  },
  {
    title: "Bharat Rural Investment Drive",
    desc: "Youth investors can acquire rural agri-linked plots from ₹2L. Govt-backed title on BPCS. Tax exemption on gains for 5 years under Sec 54GB.",
    color: "#78350f",
    accent: "#fbbf24",
    icon: "trending-up",
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200&h=120&fit=crop",
    tag: "INVEST",
    deadline: "Scheme open till Dec 2026",
  },
  {
    title: "Smart Cities 2.0 — Land Pool",
    desc: "Urban land pooling for infrastructure projects in 100 cities. Landowners get registered BPC units + rental income + 12% annuity for 15 years.",
    color: "#1d4ed8",
    accent: "#93c5fd",
    icon: "layers",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=200&h=120&fit=crop",
    tag: "URBAN DEV",
    deadline: "Enroll by: Sep 2026",
  },
  {
    title: "Youth Startup Land Credit",
    desc: "Special commercial plot allotment for youth entrepreneurs under 35 in Tier 2 & Tier 3 cities. 50% subsidy via SIDBI. BPCS title in 48 hrs.",
    color: "#4c1d95",
    accent: "#c4b5fd",
    icon: "briefcase",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&h=120&fit=crop",
    tag: "STARTUP",
    deadline: "Rolling Admission 2026",
  },
  {
    title: "Digital Property Mission",
    desc: "Register your property digitally on BPCS. Get Bharat Property Card in 24 hrs. No agent, no bribe, fully online.",
    color: "#065f46",
    accent: "#34d399",
    icon: "globe",
    image: "https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=200&h=120&fit=crop",
    tag: "REGISTER FREE",
    deadline: "Open Year Round",
  },
  {
    title: "Stamp Duty Concession",
    desc: "2% stamp duty waiver for women owners & 1st-time buyers in Maharashtra, UP & Karnataka. Save up to ₹2L on your purchase.",
    color: "#7c3aed",
    accent: "#a78bfa",
    icon: "tag",
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=200&h=120&fit=crop",
    tag: "SAVE ₹2L",
    deadline: "Valid till: Dec 2026",
  },
  {
    title: "RERA Compliance Drive",
    desc: "All developer projects must register on BPCS before possession. Buyer rights enforced. Penalty for violations.",
    color: "#991b1b",
    accent: "#fca5a5",
    icon: "shield",
    image: "https://images.unsplash.com/photo-1460317442991-0ec209397118?w=200&h=120&fit=crop",
    tag: "YOUR RIGHTS",
    deadline: "Mandatory from Jan 2026",
  },
  {
    title: "Viksit Bharat Property SIP",
    desc: "Invest just ₹500/month in govt-backed property assets. Govt matches up to ₹1,000/month for youth aged 18–30. Digital title on BPCS after 5 years. Build wealth, not debt.",
    color: "#0f4c75",
    accent: "#48cae4",
    icon: "trending-up",
    image: "https://images.unsplash.com/photo-1604594849809-dfedbc827105?w=200&h=120&fit=crop",
    tag: "YOUTH INVEST",
    deadline: "Open: FY 2026–27 onwards",
  },
  {
    title: "Digital Succession & Will Portal",
    desc: "Secure your family's property future today. Register your digital will on BPCS — zero court intervention, instant nominee alerts. Protect children & dependants under RERAW Act 2026.",
    color: "#1a1a2e",
    accent: "#e2b96f",
    icon: "users",
    image: "https://images.unsplash.com/photo-1511895426328-dc8714191011?w=200&h=120&fit=crop",
    tag: "FAMILY SECURE",
    deadline: "Register Free — Always Open",
  },
  {
    title: "NRI Youth Bharat Property Link",
    desc: "Indian youth abroad can buy property back home digitally via BPCS. FEMA-compliant. Auto-repatriation of rental income. No NRI agent needed. Title in 48 hrs.",
    color: "#134e4a",
    accent: "#5eead4",
    icon: "globe",
    image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=200&h=120&fit=crop",
    tag: "NRI SCHEME",
    deadline: "Available: All Countries 2026",
  },
];

function LanguageBar() {
  const { lang, setLang } = useLang();

  return (
    <View style={styles.langBarWrap}>
      <View style={styles.langBarHeader}>
        <Feather name="globe" size={11} color="#f97316" />
        <Text style={styles.langBarTitle}>SELECT YOUR LANGUAGE / अपनी भाषा चुनें</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.langBarScroll}
      >
        {STATE_LANG_OPTIONS.map((opt) => {
          const active = lang === opt.lang;
          return (
            <TouchableOpacity
              key={opt.lang}
              style={[styles.langChip, active && styles.langChipActive]}
              onPress={() => {
                Haptics.selectionAsync();
                setLang(opt.lang);
              }}
              activeOpacity={0.75}
            >
              <Text style={[styles.langChipLabel, active && styles.langChipLabelActive]}>
                {opt.label}
              </Text>
              <Text style={[styles.langChipStates, active && styles.langChipStatesActive]}>
                {opt.states}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

function GovtSchemeBanner() {
  const scrollRef = useRef<ScrollView>(null);
  const [active, setActive] = useState(0);

  const scrollTo = (idx: number) => {
    scrollRef.current?.scrollTo({ x: idx * 320, animated: true });
    setActive(idx);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const next = (active + 1) % GOVT_SCHEMES.length;
      scrollTo(next);
    }, 4000);
    return () => clearInterval(interval);
  }, [active]);

  return (
    <View style={styles.schemeBannerWrap}>
      <View style={styles.schemeBannerHeader}>
        <Feather name="star" size={11} color="#f97316" />
        <Text style={styles.schemeBannerTitle}>GOVT SCHEMES — APPLY NOW</Text>
        <View style={styles.schemeDotRow}>
          {GOVT_SCHEMES.map((_, i) => (
            <TouchableOpacity key={i} onPress={() => scrollTo(i)}>
              <View
                style={[
                  styles.schemeDot,
                  { backgroundColor: i === active ? "#f97316" : "rgba(0,0,0,0.15)" },
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled={false}
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={316}
        snapToAlignment="start"
        contentContainerStyle={{ paddingHorizontal: 16, gap: 10, paddingBottom: 4 }}
        onScroll={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / 316);
          setActive(Math.max(0, Math.min(idx, GOVT_SCHEMES.length - 1)));
        }}
        scrollEventThrottle={32}
      >
        {GOVT_SCHEMES.map((scheme, i) => (
          <View key={i} style={[styles.schemeCard, { backgroundColor: scheme.color }]}>
            <Image source={{ uri: scheme.image }} style={styles.schemeCardImg} />
            <View style={styles.schemeCardOverlay} />
            <View style={styles.schemeCardContent}>
              <View style={styles.schemeCardTop}>
                <View style={[styles.schemeTagPill, { backgroundColor: scheme.accent }]}>
                  <Text style={styles.schemeTagText}>{scheme.tag}</Text>
                </View>
                <Text style={styles.schemeDeadline}>{scheme.deadline}</Text>
              </View>
              <Text style={styles.schemeCardTitle}>{scheme.title}</Text>
              <Text style={styles.schemeCardDesc} numberOfLines={2}>{scheme.desc}</Text>
              <TouchableOpacity style={[styles.schemeApplyBtn, { backgroundColor: scheme.accent }]}>
                <Text style={styles.schemeApplyText}>Apply via BPCS</Text>
                <Feather name="arrow-right" size={12} color="#000" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const LIVE_FEED = [
  { icon: "check-circle", color: "#16a34a", msg: "Property B-PID-MH-2026-001 verified by Sub-Registrar Iyer", time: "2 min ago" },
  { icon: "repeat", color: "#1d4ed8", msg: "Transfer initiated for Survey No. 45/2, Thane Rural", time: "15 min ago" },
  { icon: "credit-card", color: "#7c3aed", msg: "Loan of ₹90L sanctioned by SBI for Rajesh Sharma", time: "1 hr ago" },
  { icon: "upload", color: "#d97706", msg: "Builder Emerald Heights uploaded Occupancy Certificate", time: "3 hrs ago" },
  { icon: "alert-triangle", color: "#dc2626", msg: "Dispute flagged on B-PID-DL-2026-003 — Gurugram", time: "Yesterday" },
];

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { t } = useLang();
  const router = useRouter();
  const [imgError, setImgError] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  if (!user) return null;

  const roleColor = ROLE_COLORS[user.role] || "#1e3a8a";
  const photoUrl = USER_PHOTOS[user.id];

  const roleDashboards: Record<string, React.ReactElement> = {
    citizen: <CitizenDashboard />,
    cpf: <CpfDashboard />,
    developer: <DeveloperDashboard />,
    govt: <GovtDashboard />,
    bank: <BankDashboard />,
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 8, paddingBottom: 100 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.navBg }]}>
        <View style={styles.headerLeft}>
          <Text style={styles.bpcsTagline}>BHARAT PROPERTY CARD — DigiLocker for Assets</Text>
          <View style={styles.emblemRow}>
            <Feather name="shield" size={14} color="#f97316" />
            <Text style={styles.emblemText}>Government of India</Text>
          </View>
          <Text style={styles.greeting}>{t("greeting")},</Text>
          <Text style={styles.userName}>{user.name}</Text>
          <View style={styles.verifiedRow}>
            <View style={styles.roleTag}>
              <Text style={styles.roleText}>{getRoleLabel(user.role)}</Text>
            </View>
            <View style={styles.verifiedBadge}>
              <Feather name="check-circle" size={10} color="#34d399" />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          </View>
        </View>
        {/* Right side: Notification Bell + Profile Photo */}
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.notifBtn, { backgroundColor: "rgba(255,255,255,0.15)" }]}
            onPress={() => router.push("/notifications" as any)}
          >
            <Feather name="bell" size={20} color="#fff" />
            <View style={styles.notifDot} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/profile" as any)}
            activeOpacity={0.85}
          >
            {photoUrl && !imgError ? (
              <Image
                source={{ uri: photoUrl }}
                style={styles.headerAvatar}
                onError={() => setImgError(true)}
              />
            ) : (
              <View style={[styles.headerAvatarFallback, { backgroundColor: roleColor }]}>
                <Text style={styles.headerAvatarText}>
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.body}>{roleDashboards[user.role]}</View>
    </ScrollView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CITIZEN DASHBOARD — Property owner, govt scheme focus
// ─────────────────────────────────────────────────────────────────────────────
function CitizenDashboard() {
  const colors = useColors();
  const { user } = useAuth();
  const { t } = useLang();
  const { properties, transactions, loans } = useData();
  const router = useRouter();

  const myProperties = properties.filter((p) => p.ownerId === user!.id);
  const totalValue = myProperties.reduce((s, p) => s + p.value, 0);
  const myTx = transactions.filter(
    (t) => t.buyerId === user!.id || t.sellerId === user!.id
  );
  const activeLoan = loans.find(
    (l) => l.applicantId === user!.id && l.status === "active"
  );
  const cleanTitles = myProperties.filter((p) => p.status === "verified").length;
  const riskStatus = myProperties.some((p) => p.status === "disputed")
    ? "risk"
    : myProperties.some((p) => p.status === "under_review")
    ? "caution"
    : "safe";

  const riskConfig = {
    safe: { color: "#16a34a", bg: "#dcfce7", icon: "shield", label: "Safe" },
    caution: { color: "#d97706", bg: "#fef9c3", icon: "alert-circle", label: "Under Review" },
    risk: { color: "#dc2626", bg: "#fee2e2", icon: "alert-triangle", label: "Legal Risk" },
  }[riskStatus];

  return (
    <>
      {/* Hero — Total Asset Value */}
      <View style={[styles.heroCard, { backgroundColor: "#1e3a8a" }]}>
        <Text style={styles.heroLabel}>{t("totalAssets")}</Text>
        <Text style={styles.heroValue}>{formatCurrency(totalValue)}</Text>
        <View style={styles.heroRow}>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatNum}>{myProperties.length}</Text>
            <Text style={styles.heroStatLabel}>Properties</Text>
          </View>
          <View style={styles.heroStatDivider} />
          <View style={styles.heroStat}>
            <Text style={styles.heroStatNum}>{cleanTitles}</Text>
            <Text style={styles.heroStatLabel}>Clean Titles</Text>
          </View>
          <View style={styles.heroStatDivider} />
          <View style={[styles.heroRiskBadge, { backgroundColor: riskConfig.bg }]}>
            <Feather name={riskConfig.icon as any} size={12} color={riskConfig.color} />
            <Text style={[styles.heroRiskText, { color: riskConfig.color }]}>
              {riskConfig.label}
            </Text>
          </View>
        </View>
      </View>

      <GovtSchemeBanner />

      {/* Security Shield */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#f0fdf4", borderRadius: 10, padding: 10, borderWidth: 1, borderColor: "#bbf7d0" }}>
        <Feather name="shield" size={13} color="#16a34a" />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 10, fontWeight: "700", color: "#15803d" }}>BPCS Security Shield Active</Text>
          <Text style={{ fontSize: 9, color: "#16a34a" }}>Your property data is yours only · AES-256 encrypted · Zero third-party sharing</Text>
        </View>
        <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: "#16a34a" }} />
      </View>

      {/* Property Intent Engine™ — Governance Action Hub */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View style={{ width: 28, height: 28, borderRadius: 9, backgroundColor: "#1e3a8a", alignItems: "center", justifyContent: "center" }}>
            <Feather name="zap" size={13} color="#fff" />
          </View>
          <View>
            <Text style={{ fontSize: 13, fontWeight: "700", color: colors.foreground }}>Property Intent Engine™</Text>
            <Text style={{ fontSize: 10, color: colors.mutedForeground }}>What do you want to do with your property?</Text>
          </View>
        </View>
        <View style={{ backgroundColor: "#1e3a8a", borderRadius: 5, paddingHorizontal: 7, paddingVertical: 3 }}>
          <Text style={{ fontSize: 9, fontWeight: "700", color: "#fff" }}>RERAW</Text>
        </View>
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        {[
          { icon: "send", label: "Sell / Transfer", desc: "Sale, gift deed, mandate, fractional", color: "#2563EB", route: "/transfer" },
          { icon: "users", label: "Family & Ownership", desc: "Co-owners, nominees, heir mapping", color: "#10B981", route: "/co-owner" },
          { icon: "credit-card", label: "Loans & Financing", desc: "Mortgage, refinance, lender match", color: "#8B5CF6", route: "/apply-loan" },
          { icon: "home", label: "Rent / Lease", desc: "Tenant KYC, agreement, escrow", color: "#14B8A6", route: "/notifications" },
          { icon: "shield", label: "Legal Protection", desc: "Disputes, fraud, encroachment", color: "#EF4444", route: "/raise-dispute" },
          { icon: "clock", label: "Property Timeline", desc: "Lifecycle, mutation, audit history", color: "#F97316", route: "/lifecycle" },
        ].map((action, i) => (
          <TouchableOpacity
            key={i}
            style={{
              width: "47%",
              flexGrow: 1,
              backgroundColor: colors.card,
              borderRadius: 14,
              borderWidth: 1.5,
              borderColor: action.color + "30",
              padding: 13,
              gap: 8,
            }}
            onPress={() => router.push(action.route as any)}
            activeOpacity={0.75}
          >
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: action.color + "18", alignItems: "center", justifyContent: "center" }}>
                <Feather name={action.icon as any} size={16} color={action.color} />
              </View>
              <Feather name="chevron-right" size={13} color={action.color} />
            </View>
            <View style={{ gap: 2 }}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: colors.foreground }}>{action.label}</Text>
              <Text style={{ fontSize: 9.5, color: colors.mutedForeground, lineHeight: 13 }}>{action.desc}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {activeLoan && (
        <View style={[styles.loanAlert, { backgroundColor: "#eff6ff", borderColor: "#bfdbfe" }]}>
          <Feather name="credit-card" size={14} color="#1d4ed8" />
          <Text style={[styles.loanAlertText, { color: "#1d4ed8" }]}>
            Active Loan: {formatCurrency(activeLoan.amount)} • {activeLoan.bankName}
          </Text>
        </View>
      )}

      <SectionHeader
        title={t("myProperties")}
        action="View All"
        onAction={() => router.push("/properties" as any)}
      />
      {myProperties.map((p) => (
        <PropertyCard
          key={p.id}
          property={p}
          onPress={() => router.push(`/property/${p.id}` as any)}
        />
      ))}

      {myTx.length > 0 && (
        <>
          <SectionHeader
            title={t("myTransactions")}
            action="View All"
            onAction={() => router.push("/transactions" as any)}
          />
          {myTx.slice(0, 2).map((tx) => (
            <TransactionCard key={tx.id} tx={tx} />
          ))}
        </>
      )}

      {/* Youth & Future Generation Schemes — Always Visible */}
      <View style={[youthStyles.outerCard, { backgroundColor: "#0c1a3a" }]}>
        <View style={youthStyles.header}>
          <View style={youthStyles.headerLeft}>
            <View style={youthStyles.headerIcon}>
              <Feather name="star" size={14} color="#f97316" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={youthStyles.headerTitle}>Youth & Future Gen Property Schemes</Text>
              <Text style={youthStyles.headerSub}>Awareness · Investment · Succession — India 2026</Text>
            </View>
          </View>
          <View style={youthStyles.newBadge}>
            <Text style={youthStyles.newBadgeText}>NEW</Text>
          </View>
        </View>

        {/* Scheme 1 — Yuva Awas Yojana */}
        <TouchableOpacity style={[youthStyles.schemeRow, { borderColor: "#38bdf830" }]} activeOpacity={0.8}>
          <View style={[youthStyles.schemeIconWrap, { backgroundColor: "#0c4a6e" }]}>
            <Feather name="home" size={16} color="#38bdf8" />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Text style={youthStyles.schemeName}>Yuva Awas Yojana 2026</Text>
              <View style={[youthStyles.tagChip, { backgroundColor: "#38bdf820" }]}>
                <Text style={[youthStyles.tagChipText, { color: "#38bdf8" }]}>AGE 18–35</Text>
              </View>
            </View>
            <Text style={youthStyles.schemeDesc}>4% interest subvention on loans up to ₹40L. Zero stamp duty on first purchase in 8 states.</Text>
            <View style={youthStyles.schemeFooter}>
              <Feather name="calendar" size={9} color="#94a3b8" />
              <Text style={youthStyles.schemeDeadline}>Open: FY 2026–27</Text>
              <View style={youthStyles.applyBtn}>
                <Text style={youthStyles.applyBtnText}>Apply via BPCS</Text>
                <Feather name="arrow-right" size={9} color="#f97316" />
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Scheme 2 — Youth Startup Land Credit */}
        <TouchableOpacity style={[youthStyles.schemeRow, { borderColor: "#c4b5fd30" }]} activeOpacity={0.8}>
          <View style={[youthStyles.schemeIconWrap, { backgroundColor: "#4c1d95" }]}>
            <Feather name="briefcase" size={16} color="#c4b5fd" />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Text style={youthStyles.schemeName}>Youth Startup Land Credit</Text>
              <View style={[youthStyles.tagChip, { backgroundColor: "#c4b5fd20" }]}>
                <Text style={[youthStyles.tagChipText, { color: "#c4b5fd" }]}>STARTUP</Text>
              </View>
            </View>
            <Text style={youthStyles.schemeDesc}>50% subsidy via SIDBI on commercial plots in Tier 2 & 3 cities. BPCS title in 48 hrs. Under 35 only.</Text>
            <View style={youthStyles.schemeFooter}>
              <Feather name="calendar" size={9} color="#94a3b8" />
              <Text style={youthStyles.schemeDeadline}>Rolling Admission 2026</Text>
              <View style={youthStyles.applyBtn}>
                <Text style={youthStyles.applyBtnText}>Apply via BPCS</Text>
                <Feather name="arrow-right" size={9} color="#f97316" />
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Scheme 3 — Viksit Bharat Property SIP */}
        <TouchableOpacity style={[youthStyles.schemeRow, { borderColor: "#48cae430" }]} activeOpacity={0.8}>
          <View style={[youthStyles.schemeIconWrap, { backgroundColor: "#0f4c75" }]}>
            <Feather name="trending-up" size={16} color="#48cae4" />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Text style={youthStyles.schemeName}>Viksit Bharat Property SIP</Text>
              <View style={[youthStyles.tagChip, { backgroundColor: "#48cae420" }]}>
                <Text style={[youthStyles.tagChipText, { color: "#48cae4" }]}>₹500/MO</Text>
              </View>
            </View>
            <Text style={youthStyles.schemeDesc}>Invest ₹500/month — Govt matches ₹1,000/month for youth 18–30. Digital property title after 5 years. Build wealth early.</Text>
            <View style={youthStyles.schemeFooter}>
              <Feather name="calendar" size={9} color="#94a3b8" />
              <Text style={youthStyles.schemeDeadline}>FY 2026–27 onwards</Text>
              <View style={youthStyles.applyBtn}>
                <Text style={youthStyles.applyBtnText}>Start SIP</Text>
                <Feather name="arrow-right" size={9} color="#f97316" />
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Scheme 4 — Digital Succession */}
        <TouchableOpacity style={[youthStyles.schemeRow, { borderColor: "#e2b96f30" }]} activeOpacity={0.8}>
          <View style={[youthStyles.schemeIconWrap, { backgroundColor: "#292929" }]}>
            <Feather name="users" size={16} color="#e2b96f" />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Text style={youthStyles.schemeName}>Digital Succession & Will Portal</Text>
              <View style={[youthStyles.tagChip, { backgroundColor: "#e2b96f20" }]}>
                <Text style={[youthStyles.tagChipText, { color: "#e2b96f" }]}>FREE</Text>
              </View>
            </View>
            <Text style={youthStyles.schemeDesc}>Register your digital will on BPCS. Zero court cost. Instant nominee alerts. Protect children & family under RERAW 2026.</Text>
            <View style={youthStyles.schemeFooter}>
              <Feather name="calendar" size={9} color="#94a3b8" />
              <Text style={youthStyles.schemeDeadline}>Always Open</Text>
              <View style={youthStyles.applyBtn}>
                <Text style={youthStyles.applyBtnText}>Register Will</Text>
                <Feather name="arrow-right" size={9} color="#f97316" />
              </View>
            </View>
          </View>
        </TouchableOpacity>

        <View style={youthStyles.footer}>
          <Feather name="info" size={9} color="#64748b" />
          <Text style={youthStyles.footerText}>All schemes verified under RERAW Act 2026 · Swipe scheme cards above to explore all 12 schemes · Apply directly via BPCS without any agent or fee</Text>
        </View>
      </View>

      {/* Women & Senior Protection Layer™ */}
      <View style={[womenStyles.card, { backgroundColor: "#fff1f2", borderColor: "#fecdd3" }]}>
        <View style={womenStyles.header}>
          <Feather name="shield" size={14} color="#be185d" />
          <View style={{ flex: 1 }}>
            <Text style={womenStyles.title}>Women & Senior Protection Layer™</Text>
            <Text style={womenStyles.subtitle}>RERAW Act 2026 · Chapter 14 — Mandatory National Feature</Text>
          </View>
        </View>
        <View style={womenStyles.row}>
          <TouchableOpacity style={[womenStyles.feature, { backgroundColor: "#fce7f3", borderColor: "#f9a8d4" }]} onPress={() => router.push("/notifications" as any)} activeOpacity={0.8}>
            <View style={[womenStyles.featureIcon, { backgroundColor: "#be185d" }]}>
              <Feather name="heart" size={14} color="#fff" />
            </View>
            <Text style={womenStyles.featureTitle}>Widow Property Protection</Text>
            <Text style={womenStyles.featureDesc}>Nominee alerts · Inheritance guidance · Fraud watch active</Text>
            <View style={[womenStyles.featureTag, { backgroundColor: "#be185d" }]}>
              <Text style={womenStyles.featureTagText}>ACTIVE</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={[womenStyles.feature, { backgroundColor: "#fef3c7", borderColor: "#fde68a" }]} onPress={() => router.push("/notifications" as any)} activeOpacity={0.8}>
            <View style={[womenStyles.featureIcon, { backgroundColor: "#d97706" }]}>
              <Feather name="user-check" size={14} color="#fff" />
            </View>
            <Text style={womenStyles.featureTitle}>Senior Safe Transfer</Text>
            <Text style={womenStyles.featureDesc}>Dual confirmation · Mandatory waiting period · Assisted verification</Text>
            <View style={[womenStyles.featureTag, { backgroundColor: "#d97706" }]}>
              <Text style={womenStyles.featureTagText}>PROTECTED</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={womenStyles.familyAlert}>
          <Feather name="alert-circle" size={11} color="#be185d" />
          <Text style={womenStyles.familyAlertText}>Family Fraud Prevention: Suspicious heir detection · Legal alerts · Court integration — monitoring your property 24x7</Text>
        </View>
      </View>

      <SectionHeader title={t("liveActivity")} />
      <View style={[styles.feedCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {LIVE_FEED.map((item, i) => (
          <View
            key={i}
            style={[
              styles.feedRow,
              i < LIVE_FEED.length - 1 && {
                borderBottomColor: colors.border,
                borderBottomWidth: 1,
              },
            ]}
          >
            <View style={[styles.feedIcon, { backgroundColor: item.color + "15" }]}>
              <Feather name={item.icon as any} size={13} color={item.color} />
            </View>
            <View style={styles.feedContent}>
              <Text
                style={[styles.feedMsg, { color: colors.foreground }]}
                numberOfLines={2}
              >
                {item.msg}
              </Text>
              <Text style={[styles.feedTime, { color: colors.mutedForeground }]}>
                {item.time}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CPF BROKER DASHBOARD — Task queue, commission scoreboard, client pipeline
// ─────────────────────────────────────────────────────────────────────────────
function CpfDashboard() {
  const colors = useColors();
  const { transactions } = useData();
  const router = useRouter();

  const activeDeals = transactions.filter(
    (t) => t.cpfId === "USR002" && t.status !== "completed"
  );
  const closedDeals = transactions.filter(
    (t) => t.cpfId === "USR002" && t.status === "completed"
  );
  const totalCommission = closedDeals.reduce((s, t) => s + t.amount * 0.02, 0);
  const monthlyTarget = 120000;
  const monthlyEarned = totalCommission;
  const targetPct = Math.min(100, Math.round((monthlyEarned / monthlyTarget) * 100));

  const TODAY_TASKS = [
    { id: 1, type: "doc", priority: "high", label: "Collect Sale Deed from Ramesh Sharma", property: "B-PID-MH-2026-001", due: "By 3 PM today", done: false },
    { id: 2, type: "kyc", priority: "high", label: "Complete KYC for Sunita Patel — Buyer", property: "B-PID-MH-2026-002", due: "By 5 PM today", done: false },
    { id: 3, type: "visit", priority: "med", label: "Site visit — Emerald Heights, Wakad", property: "B-PID-MH-2026-003", due: "Tomorrow 11 AM", done: true },
    { id: 4, type: "doc", priority: "med", label: "Upload EC for Thane land parcel", property: "B-PID-MH-2026-004", due: "In 2 days", done: false },
    { id: 5, type: "meeting", priority: "low", label: "Review offer letter with both parties", property: "B-PID-MH-2026-005", due: "Fri 10 AM", done: false },
  ];

  const pendingTasks = TODAY_TASKS.filter((t) => !t.done);
  const doneTasks = TODAY_TASKS.filter((t) => t.done);

  const BPCS_POINTS = {
    total: 1425,
    thisMonth: 340,
    level: "Senior CPF · Level 3",
    nextLevel: 1600,
    perDeal: [
      { ref: "Thane Rural Plot", pts: 75, breakdown: "Active +50 · Docs +25" },
      { ref: "Gandhinagar Plot 22", pts: 70, breakdown: "Active +50 · KYC +20" },
      { ref: "Emerald Heights 8A", pts: 50, breakdown: "Active +50" },
      { ref: "Andheri Flat 4B", pts: 50, breakdown: "Active +50" },
      { ref: "Closed — 2 deals", pts: 200, breakdown: "Closed ×2 · 100 pts each" },
    ],
  };

  const LEADERBOARD = [
    { rank: 1, name: "Rajesh Pillai", city: "Mumbai", deals: 18, commission: "₹2.1L", points: "1,820 pts", badge: "🥇" },
    { rank: 2, name: "Kavitha Nair", city: "Chennai", deals: 14, commission: "₹1.7L", points: "1,640 pts", badge: "🥈" },
    { rank: 3, name: "Priya Mehta", city: "Pune", deals: 11, commission: "₹1.3L", points: "1,425 pts", badge: "🥉", isYou: true },
    { rank: 4, name: "Suresh Kumar", city: "Bangalore", deals: 9, commission: "₹1.1L", points: "1,180 pts", badge: "" },
    { rank: 5, name: "Anita Desai", city: "Hyderabad", deals: 7, commission: "₹0.9L", points: "920 pts", badge: "" },
  ];

  const PIPELINE = [
    { stage: "New Enquiry", count: 4, color: "#64748b" },
    { stage: "Site Visit Done", count: 3, color: "#f97316" },
    { stage: "Negotiation", count: 2, color: "#7c3aed" },
    { stage: "Docs Collected", count: 2, color: "#1d4ed8" },
    { stage: "Awaiting Govt", count: 1, color: "#d97706" },
    { stage: "Closed", count: closedDeals.length, color: "#16a34a" },
  ];

  return (
    <>
      {/* Hero — Commission Scorecard */}
      <View style={[styles.heroCard, { backgroundColor: "#7c3aed" }]}>
        <View style={styles.heroTopRow}>
          <Text style={styles.heroLabel}>Monthly Commission Earned</Text>
          <View style={[styles.rankBadge, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
            <Feather name="award" size={11} color="#fbbf24" />
            <Text style={styles.rankBadgeText}>Rank #3 · Maharashtra</Text>
          </View>
        </View>
        <Text style={styles.heroValue}>{formatCurrency(monthlyEarned)}</Text>
        <Text style={styles.heroSubLabel}>Target: {formatCurrency(monthlyTarget)} · {targetPct}% achieved</Text>
        <View style={styles.progressBarWrap}>
          <View style={[styles.progressBarFill, { width: `${targetPct}%` as any, backgroundColor: "#fbbf24" }]} />
        </View>
        <View style={styles.heroRow}>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatNum}>{activeDeals.length}</Text>
            <Text style={styles.heroStatLabel}>Active Deals</Text>
          </View>
          <View style={styles.heroStatDivider} />
          <View style={styles.heroStat}>
            <Text style={styles.heroStatNum}>{closedDeals.length}</Text>
            <Text style={styles.heroStatLabel}>Closed</Text>
          </View>
          <View style={styles.heroStatDivider} />
          <View style={styles.heroStat}>
            <Text style={styles.heroStatNum}>{pendingTasks.length}</Text>
            <Text style={styles.heroStatLabel}>Tasks Today</Text>
          </View>
        </View>
      </View>

      {/* Security Shield */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#f5f3ff", borderRadius: 10, padding: 10, borderWidth: 1, borderColor: "#ddd6fe" }}>
        <Feather name="shield" size={13} color="#7c3aed" />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 10, fontWeight: "700", color: "#6d28d9" }}>BPCS Security Shield Active</Text>
          <Text style={{ fontSize: 9, color: "#7c3aed" }}>Client data is yours only · Anti-fraud scan active · Session bound to CPF-MH-2026 license</Text>
        </View>
        <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: "#7c3aed" }} />
      </View>

      {/* BPCS Performance Points */}
      <View style={[styles.taskCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.taskCardHeader}>
          <View style={styles.taskCardTitleRow}>
            <Feather name="star" size={14} color="#f97316" />
            <Text style={[styles.taskCardTitle, { color: colors.foreground }]}>BPCS Performance Points</Text>
          </View>
          <View style={{ paddingHorizontal: 9, paddingVertical: 4, borderRadius: 20, backgroundColor: "#fff7ed" }}>
            <Text style={{ fontSize: 12, fontWeight: "800", color: "#f97316" }}>{BPCS_POINTS.total} pts</Text>
          </View>
        </View>
        <View style={{ paddingHorizontal: 14, paddingBottom: 12 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 5 }}>
            <Text style={{ fontSize: 12, fontWeight: "700", color: "#7c3aed" }}>{BPCS_POINTS.level}</Text>
            <Text style={{ fontSize: 10, color: colors.mutedForeground }}>{BPCS_POINTS.nextLevel - BPCS_POINTS.total} pts to Level 4</Text>
          </View>
          <View style={{ height: 6, backgroundColor: "#f1f5f9", borderRadius: 3, overflow: "hidden" }}>
            <View style={{ height: 6, width: `${Math.round((BPCS_POINTS.total / BPCS_POINTS.nextLevel) * 100)}%` as any, backgroundColor: "#7c3aed", borderRadius: 3 }} />
          </View>
          <Text style={{ fontSize: 10, color: colors.mutedForeground, marginTop: 6 }}>+{BPCS_POINTS.thisMonth} pts earned this month · 100 pts per closed deal · 50 pts per active deal</Text>
        </View>
        {BPCS_POINTS.perDeal.map((d, i) => (
          <View key={i} style={[
            { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 9 },
            i < BPCS_POINTS.perDeal.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 },
          ]}>
            <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: "#fdf4ff", alignItems: "center", justifyContent: "center" }}>
              <Feather name={i === BPCS_POINTS.perDeal.length - 1 ? "check-circle" : "home"} size={12} color="#7c3aed" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, fontWeight: "600", color: colors.foreground }} numberOfLines={1}>{d.ref}</Text>
              <Text style={{ fontSize: 10, color: colors.mutedForeground }}>{d.breakdown}</Text>
            </View>
            <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, backgroundColor: "#fdf4ff" }}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#7c3aed" }}>+{d.pts} pts</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsRow}>
        <QuickAction icon="search" label="Find Property" color="#1e40af" onPress={() => router.push("/properties" as any)} />
        <QuickAction icon="plus-circle" label="New Deal" color="#16a34a" onPress={() => router.push("/transfer" as any)} />
        <QuickAction icon="users" label="My Clients" color="#7c3aed" onPress={() => router.push("/transactions" as any)} />
        <QuickAction icon="bar-chart-2" label="My Reports" color="#d97706" onPress={() => router.push("/transactions" as any)} />
      </View>

      {/* Today's Task Queue */}
      <View style={[styles.taskCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.taskCardHeader}>
          <View style={styles.taskCardTitleRow}>
            <Feather name="check-square" size={14} color="#7c3aed" />
            <Text style={[styles.taskCardTitle, { color: colors.foreground }]}>Today's Task Queue</Text>
          </View>
          <View style={[styles.urgentPill, { backgroundColor: pendingTasks.length > 2 ? "#fee2e2" : "#dcfce7" }]}>
            <Text style={{ fontSize: 11, fontWeight: "700", color: pendingTasks.length > 2 ? "#dc2626" : "#16a34a" }}>
              {pendingTasks.length} Pending
            </Text>
          </View>
        </View>
        {TODAY_TASKS.map((task, i) => (
          <View
            key={task.id}
            style={[
              styles.taskRow,
              i < TODAY_TASKS.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 },
              task.done && { opacity: 0.45 },
            ]}
          >
            <View style={[styles.taskTypeIcon, {
              backgroundColor:
                task.type === "doc" ? "#eff6ff" :
                task.type === "kyc" ? "#fdf4ff" :
                task.type === "visit" ? "#f0fdf4" : "#fff7ed"
            }]}>
              <Feather
                name={task.type === "doc" ? "file-text" : task.type === "kyc" ? "user-check" : task.type === "visit" ? "map-pin" : "users"}
                size={13}
                color={task.type === "doc" ? "#1d4ed8" : task.type === "kyc" ? "#7c3aed" : task.type === "visit" ? "#16a34a" : "#d97706"}
              />
            </View>
            <View style={styles.taskInfo}>
              <Text style={[styles.taskLabel, { color: colors.foreground }, task.done && { textDecorationLine: "line-through" }]} numberOfLines={2}>
                {task.label}
              </Text>
              <View style={styles.taskMeta}>
                <Text style={[styles.taskBpid, { color: colors.mutedForeground }]}>{task.property}</Text>
                <View style={[styles.taskDuePill, {
                  backgroundColor: task.priority === "high" && !task.done ? "#fee2e2" : "#f1f5f9"
                }]}>
                  <Feather name="clock" size={9} color={task.priority === "high" && !task.done ? "#dc2626" : "#64748b"} />
                  <Text style={{ fontSize: 9, fontWeight: "600", color: task.priority === "high" && !task.done ? "#dc2626" : "#64748b" }}>
                    {task.due}
                  </Text>
                </View>
              </View>
            </View>
            {task.done && (
              <Feather name="check-circle" size={16} color="#16a34a" />
            )}
          </View>
        ))}
      </View>

      {/* Client Pipeline Funnel */}
      <View style={[styles.taskCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.taskCardHeader}>
          <View style={styles.taskCardTitleRow}>
            <Feather name="git-merge" size={14} color="#7c3aed" />
            <Text style={[styles.taskCardTitle, { color: colors.foreground }]}>Deal Pipeline</Text>
          </View>
          <Text style={[styles.pipelineTotal, { color: colors.mutedForeground }]}>
            {PIPELINE.reduce((s, p) => s + p.count, 0)} total
          </Text>
        </View>
        <View style={styles.pipelineRow}>
          {PIPELINE.map((p, i) => (
            <View key={i} style={styles.pipelineCol}>
              <View style={[styles.pipelineCountBubble, { backgroundColor: p.color + "18", borderColor: p.color + "40" }]}>
                <Text style={[styles.pipelineCount, { color: p.color }]}>{p.count}</Text>
              </View>
              <Text style={[styles.pipelineLabel, { color: colors.mutedForeground }]} numberOfLines={2}>
                {p.stage}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* CPF Leaderboard */}
      <View style={[styles.taskCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.taskCardHeader}>
          <View style={styles.taskCardTitleRow}>
            <Feather name="award" size={14} color="#f97316" />
            <Text style={[styles.taskCardTitle, { color: colors.foreground }]}>CPF Broker Leaderboard — May 2026</Text>
          </View>
        </View>
        {LEADERBOARD.map((entry, i) => (
          <View
            key={i}
            style={[
              styles.leaderRow,
              i < LEADERBOARD.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 },
              entry.isYou && { backgroundColor: "#f5f3ff" },
            ]}
          >
            <Text style={styles.leaderRankNum}>{entry.badge || `#${entry.rank}`}</Text>
            <View style={styles.leaderInfo}>
              <Text style={[styles.leaderName, { color: colors.foreground }]}>
                {entry.name}{entry.isYou ? " (You)" : ""}
              </Text>
              <Text style={[styles.leaderCity, { color: colors.mutedForeground }]}>{entry.city} · {entry.deals} deals · {entry.points}</Text>
            </View>
            <Text style={[styles.leaderComm, { color: entry.isYou ? "#7c3aed" : colors.foreground }]}>
              {entry.commission}
            </Text>
          </View>
        ))}
      </View>

      {/* Active Deals */}
      <SectionHeader title="Active Deals" action="View All" onAction={() => router.push("/transactions" as any)} />
      {activeDeals.map((tx) => <TransactionCard key={tx.id} tx={tx} />)}
      {activeDeals.length === 0 && <EmptyState icon="activity" message="No active deals" />}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DEVELOPER DASHBOARD — RERA compliance, sales targets, enquiry queue
// ─────────────────────────────────────────────────────────────────────────────
function DeveloperDashboard() {
  const colors = useColors();
  const { projects } = useData();
  const router = useRouter();

  const myProjects = projects.filter((p) => p.developerId === "USR003");
  const totalUnits = myProjects.reduce((s, p) => s + p.totalUnits, 0);
  const soldUnits = myProjects.reduce((s, p) => s + p.soldUnits, 0);
  const available = totalUnits - soldUnits;
  const revenue = myProjects.reduce((s, p) => s + p.soldUnits * p.price, 0);
  const monthlyTarget = 4;
  const monthlySold = 2;
  const salesPct = Math.min(100, Math.round((monthlySold / monthlyTarget) * 100));

  const LEGAL_BARS = [
    { label: "RERA Filing", pct: 100, color: "#16a34a" },
    { label: "Building Plan", pct: 100, color: "#16a34a" },
    { label: "Fire NOC", pct: 45, color: "#f97316" },
    { label: "Occupancy Cert", pct: 20, color: "#d97706" },
    { label: "Loan NOC", pct: 80, color: "#0891b2" },
    { label: "Transfer Deeds", pct: 65, color: "#7c3aed" },
  ];

  const MONTHLY_REV = [
    { month: "Jan", crore: 14, pct: 64 },
    { month: "Feb", crore: 18, pct: 82 },
    { month: "Mar", crore: 22, pct: 100 },
    { month: "Apr", crore: 16, pct: 73 },
    { month: "May", crore: 11, pct: 50 },
    { month: "Jun", crore: 8, pct: 36 },
  ];

  const legalAnims = useRef(LEGAL_BARS.map(() => new Animated.Value(0))).current;
  const revAnims = useRef(MONTHLY_REV.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.stagger(100, legalAnims.map((a, i) =>
      Animated.timing(a, { toValue: LEGAL_BARS[i].pct, duration: 900, useNativeDriver: false })
    )).start();
    Animated.stagger(80, revAnims.map((a, i) =>
      Animated.timing(a, { toValue: MONTHLY_REV[i].pct, duration: 750, useNativeDriver: false })
    )).start();
  }, []);

  const BMC_COMPLIANCE = [
    { label: "Building Plan Approval", status: "approved", ref: "BMC/2026/BP/4421", date: "15 Jan 2026" },
    { label: "Commencement Certificate", status: "approved", ref: "BMC/2026/CC/1872", date: "02 Feb 2026" },
    { label: "Fire NOC", status: "pending", ref: "CFO/APP/2026/0847", date: "Inspection: 20 May 2026" },
    { label: "Lift NOC", status: "approved", ref: "CEI/2026/LIFT/223", date: "18 Mar 2026" },
    { label: "Water & Sewage NOC", status: "approved", ref: "BWSSB/2026/NOC/551", date: "25 Jan 2026" },
    { label: "Occupancy Certificate", status: "not_applied", ref: "—", date: "Apply post-completion inspection" },
  ];

  const FIRE_NOC_STAGES = [
    { step: "Application Submitted", done: true, date: "05 May 2026" },
    { step: "Document Verification", done: true, date: "09 May 2026" },
    { step: "Site Inspection", done: false, date: "Scheduled: 20 May 2026" },
    { step: "NOC Issuance", done: false, date: "Est. 25 May 2026" },
  ];

  const NEW_PROJECTS = [
    { name: "Emerald Heights, Wakad", bbid: "BPCS-RERA-2026-001", status: "approved", health: 92, units: 80, sold: 56, available: 24, possession: "Jun 2026", compliance: "RERA Compliant" },
    { name: "Green Valley Phase 2", bbid: "BPCS-RERA-2026-002", status: "under_review", health: 64, units: 60, sold: 18, available: 42, possession: "Oct 2026", compliance: "OC Pending" },
    { name: "Sapphire Tower", bbid: "BPCS-RERA-2026-003", status: "pending", health: 38, units: 44, sold: 6, available: 38, possession: "Dec 2026", compliance: "Commencement Expired" },
  ];

  const SALES_FUNNEL = [
    { label: "Enquiries", count: 48, pct: 100, color: "#0891b2" },
    { label: "Site Visits", count: 22, pct: 46, color: "#7c3aed" },
    { label: "Token Paid", count: 11, pct: 23, color: "#d97706" },
    { label: "Bookings", count: 7, pct: 15, color: "#059669" },
    { label: "Closures", count: 4, pct: 8, color: "#16a34a" },
  ];

  const BUYER_ENQUIRIES = [
    { name: "Mohan Raj", unit: "2BHK — Floor 4", budget: "₹65L", time: "2 hrs ago", hot: true },
    { name: "Deepa Venkat", unit: "3BHK — Floor 7", budget: "₹95L", time: "4 hrs ago", hot: true },
    { name: "Sanjay Tiwari", unit: "1BHK — Floor 2", budget: "₹42L", time: "Yesterday", hot: false },
    { name: "Fatima Sheikh", unit: "Commercial — G Floor", budget: "₹1.2Cr", time: "2 days ago", hot: false },
  ];

  return (
    <>
      {/* 1. Hero */}
      <View style={[styles.heroCard, { backgroundColor: "#064e3b" }]}>
        <View style={styles.heroTopRow}>
          <Text style={styles.heroLabel}>Total Revenue — May 2026</Text>
          <View style={[styles.rankBadge, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
            <Feather name="trending-up" size={11} color="#34d399" />
            <Text style={styles.rankBadgeText}>RERA Registered</Text>
          </View>
        </View>
        <Text style={styles.heroValue}>{formatCurrency(revenue)}</Text>
        <Text style={styles.heroSubLabel}>Monthly target: {monthlySold}/{monthlyTarget} units sold · {salesPct}% achieved</Text>
        <View style={styles.progressBarWrap}>
          <View style={[styles.progressBarFill, { width: `${salesPct}%` as any, backgroundColor: "#34d399" }]} />
        </View>
        <View style={styles.heroRow}>
          {[
            { num: myProjects.length, label: "Projects" },
            { num: soldUnits, label: "Sold" },
            { num: available, label: "Available" },
            { num: totalUnits, label: "Total" },
          ].map((stat, i) => (
            <React.Fragment key={i}>
              {i > 0 && <View style={styles.heroStatDivider} />}
              <View style={styles.heroStat}>
                <Text style={styles.heroStatNum}>{stat.num}</Text>
                <Text style={styles.heroStatLabel}>{stat.label}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>
      </View>

      {/* 2. Trust Shield */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#f0fdf4", borderRadius: 10, padding: 10, borderWidth: 1, borderColor: "#bbf7d0" }}>
        <Feather name="shield" size={13} color="#059669" />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 10, fontWeight: "700", color: "#065f46" }}>BPCS Developer Trust Portal Active</Text>
          <Text style={{ fontSize: 9, color: "#059669" }}>RERA filings tamper-evident · Buyer data encrypted · Docs visible only to authorised parties</Text>
        </View>
        <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: "#059669" }} />
      </View>

      {/* 3. Quick Actions — 2 rows */}
      <View style={styles.actionsRow}>
        <QuickAction icon="plus" label="New Project" color="#1e40af" onPress={() => router.push("/new-project" as any)} />
        <QuickAction icon="upload" label="Upload NOC" color="#059669" onPress={() => router.push("/doc-verify" as any)} />
        <QuickAction icon="alert-triangle" label="Fire NOC" color="#dc2626" onPress={() => router.push("/doc-verify" as any)} />
        <QuickAction icon="grid" label="BMC Portal" color="#7c3aed" onPress={() => router.push("/doc-verify" as any)} />
      </View>
      <View style={styles.actionsRow}>
        <QuickAction icon="list" label="Inventory" color="#0891b2" onPress={() => router.push("/inventory" as any)} />
        <QuickAction icon="users" label="Buyer Pipeline" color="#d97706" onPress={() => router.push("/transactions" as any)} />
        <QuickAction icon="cpu" label="AI Legal" color="#0f172a" onPress={() => router.push("/ai-legal" as any)} />
        <QuickAction icon="bar-chart-2" label="Reports" color="#475569" onPress={() => router.push("/transactions" as any)} />
      </View>

      {/* 4. BMC & Statutory Clearances — LIVE */}
      <View style={[devStyles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={devStyles.cardHeader}>
          <View style={devStyles.cardTitleRow}>
            <View style={[devStyles.cardIcon, { backgroundColor: "#7c3aed" }]}>
              <Feather name="file-text" size={13} color="#fff" />
            </View>
            <View>
              <Text style={[devStyles.cardTitle, { color: colors.foreground }]}>BMC & Statutory Clearances</Text>
              <Text style={[devStyles.cardSubtitle, { color: colors.mutedForeground }]}>Emerald Heights, Wakad — Live Status</Text>
            </View>
          </View>
          <View style={devStyles.livePill}>
            <View style={devStyles.liveDot} />
            <Text style={devStyles.liveText}>LIVE</Text>
          </View>
        </View>
        {BMC_COMPLIANCE.map((item, i) => {
          const cfg = item.status === "approved"
            ? { color: "#16a34a", bg: "#dcfce7", icon: "check-circle", label: "Approved" }
            : item.status === "pending"
            ? { color: "#d97706", bg: "#fef9c3", icon: "clock", label: "Pending" }
            : { color: "#94a3b8", bg: "#f1f5f9", icon: "minus-circle", label: "Not Applied" };
          return (
            <View key={i} style={[devStyles.complianceRow, i < BMC_COMPLIANCE.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
              <View style={[devStyles.complianceIcon, { backgroundColor: cfg.bg }]}>
                <Feather name={cfg.icon as any} size={14} color={cfg.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[devStyles.complianceLabel, { color: colors.foreground }]}>{item.label}</Text>
                <Text style={[devStyles.complianceRef, { color: colors.mutedForeground }]}>{item.ref}</Text>
                <Text style={[devStyles.complianceDate, { color: item.status === "pending" ? "#d97706" : colors.mutedForeground }]}>{item.date}</Text>
              </View>
              <View style={[devStyles.statusChip, { backgroundColor: cfg.bg }]}>
                <Text style={[devStyles.statusChipText, { color: cfg.color }]}>{cfg.label}</Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* 5. Fire NOC Stage Tracker */}
      <View style={[devStyles.sectionCard, { backgroundColor: "#fff7ed", borderColor: "#fed7aa" }]}>
        <View style={devStyles.cardHeader}>
          <View style={devStyles.cardTitleRow}>
            <View style={[devStyles.cardIcon, { backgroundColor: "#ea580c" }]}>
              <Feather name="alert-triangle" size={13} color="#fff" />
            </View>
            <View>
              <Text style={[devStyles.cardTitle, { color: "#9a3412" }]}>Fire NOC — Live Tracker</Text>
              <Text style={[devStyles.cardSubtitle, { color: "#c2410c" }]}>CFO Ref: CFO/APP/2026/0847 · Stage 2 of 4</Text>
            </View>
          </View>
        </View>
        <View style={devStyles.stageTimeline}>
          {FIRE_NOC_STAGES.map((stage, i) => (
            <View key={i} style={devStyles.stageRow}>
              <View style={devStyles.stageNodeCol}>
                <View style={[devStyles.stageNode, { backgroundColor: stage.done ? "#ea580c" : "#fde68a", borderColor: stage.done ? "#ea580c" : "#fdba74" }]}>
                  <Feather name={stage.done ? "check" : "clock"} size={9} color={stage.done ? "#fff" : "#ea580c"} />
                </View>
                {i < FIRE_NOC_STAGES.length - 1 && <View style={[devStyles.stageLine, { backgroundColor: stage.done ? "#ea580c" : "#fde68a" }]} />}
              </View>
              <View style={devStyles.stageInfo}>
                <Text style={[devStyles.stageLabel, { color: stage.done ? "#9a3412" : "#7c2d12", fontWeight: stage.done ? "700" : "600" }]}>{stage.step}</Text>
                <Text style={[devStyles.stageDate, { color: stage.done ? "#ea580c" : "#f97316" }]}>{stage.date}</Text>
              </View>
            </View>
          ))}
        </View>
        <View style={devStyles.alertStrip}>
          <Feather name="info" size={10} color="#ea580c" />
          <Text style={devStyles.alertStripText}>Fire Inspector visit: 20 May 2026. Ensure all suppression systems are installed and tested before inspection.</Text>
        </View>
      </View>

      {/* 6. Legal Activity Status — Animated Bar Graph */}
      <View style={[devStyles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={devStyles.cardHeader}>
          <View style={devStyles.cardTitleRow}>
            <View style={[devStyles.cardIcon, { backgroundColor: "#1e3a8a" }]}>
              <Feather name="bar-chart-2" size={13} color="#fff" />
            </View>
            <View>
              <Text style={[devStyles.cardTitle, { color: colors.foreground }]}>Legal Activity Status</Text>
              <Text style={[devStyles.cardSubtitle, { color: colors.mutedForeground }]}>Clearance completion across all approvals</Text>
            </View>
          </View>
        </View>
        <View style={devStyles.legalGraph}>
          {LEGAL_BARS.map((bar, i) => (
            <View key={i} style={devStyles.legalBarRow}>
              <Text style={[devStyles.legalBarLabel, { color: colors.foreground }]} numberOfLines={1}>{bar.label}</Text>
              <View style={devStyles.legalBarTrack}>
                <Animated.View style={[devStyles.legalBarFill, {
                  width: legalAnims[i].interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] }),
                  backgroundColor: bar.color,
                }]} />
              </View>
              <Text style={[devStyles.legalBarPct, { color: bar.color }]}>{bar.pct}%</Text>
            </View>
          ))}
        </View>
        <View style={[devStyles.alertStrip, { backgroundColor: "#eff6ff" }]}>
          <Feather name="info" size={9} color="#1e3a8a" />
          <Text style={[devStyles.alertStripText, { color: "#1e3a8a" }]}>Fire NOC and OC pending — no possession/handover until both are 100%. Action required.</Text>
        </View>
      </View>

      {/* 7. Monthly Revenue Chart — Animated */}
      <View style={[devStyles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={devStyles.cardHeader}>
          <View style={devStyles.cardTitleRow}>
            <View style={[devStyles.cardIcon, { backgroundColor: "#059669" }]}>
              <Feather name="trending-up" size={13} color="#fff" />
            </View>
            <View>
              <Text style={[devStyles.cardTitle, { color: colors.foreground }]}>Monthly Revenue — FY 2026–27</Text>
              <Text style={[devStyles.cardSubtitle, { color: colors.mutedForeground }]}>Unit closures Jan–Jun 2026 (₹ Lakh)</Text>
            </View>
          </View>
          <Text style={{ color: "#059669", fontSize: 11, fontWeight: "700" }}>₹89L total</Text>
        </View>
        <View style={devStyles.revenueGraph}>
          {MONTHLY_REV.map((m, i) => (
            <View key={i} style={devStyles.revBarCol}>
              <Text style={[devStyles.revBarValue, { color: colors.mutedForeground }]}>₹{m.crore}L</Text>
              <View style={devStyles.revBarTrack}>
                <Animated.View style={[devStyles.revBarFill, {
                  height: revAnims[i].interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] }),
                  backgroundColor: i === 4 ? "#059669" : "#34d399",
                }]} />
              </View>
              <Text style={[devStyles.revBarMonth, { color: i === 4 ? "#059669" : colors.mutedForeground, fontWeight: i === 4 ? "700" : "500" }]}>{m.month}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 8. Project Status — Health Bars */}
      <SectionHeader title="New Project Status — All Active" action="View All" onAction={() => router.push("/properties" as any)} />
      {NEW_PROJECTS.map((proj, i) => {
        const healthColor = proj.health >= 80 ? "#16a34a" : proj.health >= 60 ? "#d97706" : "#dc2626";
        const statusCfg = proj.status === "approved"
          ? { color: "#16a34a", bg: "#dcfce7", label: "RERA Approved" }
          : proj.status === "under_review"
          ? { color: "#d97706", bg: "#fef9c3", label: "Under Review" }
          : { color: "#dc2626", bg: "#fee2e2", label: "Action Needed" };
        return (
          <View key={i} style={[devStyles.projectCard, { backgroundColor: colors.card, borderColor: proj.health < 60 ? "#fca5a5" : colors.border }]}>
            <View style={devStyles.projCardTop}>
              <View style={{ flex: 1 }}>
                <Text style={[devStyles.projCardBbid, { color: colors.mutedForeground }]}>{proj.bbid}</Text>
                <Text style={[devStyles.projCardName, { color: colors.foreground }]}>{proj.name}</Text>
                <Text style={[devStyles.projComplianceNote, { color: proj.health < 60 ? "#dc2626" : colors.mutedForeground }]}>{proj.compliance}</Text>
              </View>
              <View style={[devStyles.statusChip, { backgroundColor: statusCfg.bg }]}>
                <Text style={[devStyles.statusChipText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
              </View>
            </View>
            <View style={devStyles.healthRow}>
              <Text style={[devStyles.healthLabel, { color: colors.mutedForeground }]}>Project Health</Text>
              <View style={devStyles.healthBar}>
                <View style={[devStyles.healthBarFill, { width: `${proj.health}%` as any, backgroundColor: healthColor }]} />
              </View>
              <View style={[devStyles.healthGrade, { backgroundColor: healthColor }]}>
                <Text style={devStyles.healthGradeText}>{proj.health >= 80 ? "A" : proj.health >= 60 ? "B" : "C"}</Text>
              </View>
              <Text style={[devStyles.healthPct, { color: healthColor }]}>{proj.health}%</Text>
            </View>
            <View style={devStyles.projStatsRow}>
              {[
                { num: proj.units, label: "Total", color: colors.primary },
                { num: proj.sold, label: "Sold", color: "#16a34a" },
                { num: proj.available, label: "Available", color: "#d97706" },
              ].map((s, si) => (
                <View key={si} style={devStyles.projStatBox}>
                  <Text style={[devStyles.projStatNum, { color: s.color }]}>{s.num}</Text>
                  <Text style={[devStyles.projStatLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
                </View>
              ))}
              <View style={[devStyles.possessionTag, { backgroundColor: "#eff6ff" }]}>
                <Feather name="calendar" size={9} color="#1d4ed8" />
                <Text style={{ color: "#1d4ed8", fontSize: 9, fontWeight: "700" }}>Poss. {proj.possession}</Text>
              </View>
            </View>
          </View>
        );
      })}

      {/* 9. Sales Funnel */}
      <View style={[devStyles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={devStyles.cardHeader}>
          <View style={devStyles.cardTitleRow}>
            <View style={[devStyles.cardIcon, { backgroundColor: "#d97706" }]}>
              <Feather name="filter" size={13} color="#fff" />
            </View>
            <View>
              <Text style={[devStyles.cardTitle, { color: colors.foreground }]}>Buyer Sales Funnel</Text>
              <Text style={[devStyles.cardSubtitle, { color: colors.mutedForeground }]}>Enquiry to closure pipeline · May 2026</Text>
            </View>
          </View>
        </View>
        {SALES_FUNNEL.map((stage, i) => (
          <View key={i} style={devStyles.funnelRow}>
            <Text style={[devStyles.funnelLabel, { color: colors.foreground }]}>{stage.label}</Text>
            <View style={devStyles.funnelTrack}>
              <View style={[devStyles.funnelFill, { width: `${stage.pct}%` as any, backgroundColor: stage.color }]} />
            </View>
            <Text style={[devStyles.funnelCount, { color: stage.color }]}>{stage.count}</Text>
          </View>
        ))}
        <View style={[devStyles.alertStrip, { backgroundColor: "#f0fdf4" }]}>
          <Feather name="trending-up" size={9} color="#16a34a" />
          <Text style={[devStyles.alertStripText, { color: "#16a34a" }]}>Conversion: 8.3% · Industry avg: 5.1% · You are above average</Text>
        </View>
      </View>

      {/* 10. Buyer Enquiries */}
      <View style={[styles.taskCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.taskCardHeader}>
          <View style={styles.taskCardTitleRow}>
            <Feather name="mail" size={14} color="#059669" />
            <Text style={[styles.taskCardTitle, { color: colors.foreground }]}>Buyer Enquiries — Hot Leads</Text>
          </View>
          <View style={[styles.urgentPill, { backgroundColor: "#f0fdf4" }]}>
            <Text style={{ fontSize: 11, fontWeight: "700", color: "#16a34a" }}>{BUYER_ENQUIRIES.filter(e => e.hot).length} Hot</Text>
          </View>
        </View>
        {BUYER_ENQUIRIES.map((enq, i) => (
          <View key={i} style={[styles.enquiryRow, i < BUYER_ENQUIRIES.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
            <View style={[styles.enquiryAvatar, { backgroundColor: enq.hot ? "#f97316" : "#64748b" }]}>
              <Text style={styles.enquiryAvatarText}>{enq.name[0]}</Text>
            </View>
            <View style={styles.enquiryInfo}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text style={[styles.enquiryName, { color: colors.foreground }]}>{enq.name}</Text>
                {enq.hot && <View style={styles.hotPill}><Text style={styles.hotPillText}>HOT</Text></View>}
              </View>
              <Text style={[styles.enquiryUnit, { color: colors.mutedForeground }]}>{enq.unit} · Budget: {enq.budget}</Text>
              <Text style={[styles.enquiryTime, { color: colors.mutedForeground }]}>{enq.time}</Text>
            </View>
            <TouchableOpacity style={styles.callBtn}>
              <Feather name="phone" size={14} color="#059669" />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* 11. Possession Tracker */}
      <View style={[styles.taskCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.taskCardHeader}>
          <View style={styles.taskCardTitleRow}>
            <Feather name="calendar" size={14} color="#7c3aed" />
            <Text style={[styles.taskCardTitle, { color: colors.foreground }]}>Possession Deadline Tracker</Text>
          </View>
        </View>
        {[
          { project: "Emerald Heights — A Wing", units: 48, date: "30 Jun 2026", days: 46, status: "urgent" },
          { project: "Green Valley Ph-2 — B Wing", units: 32, date: "31 Oct 2026", days: 169, status: "on_track" },
          { project: "Sapphire Tower — Full", units: 44, date: "31 Dec 2026", days: 230, status: "on_track" },
        ].map((a, i) => (
          <View key={i} style={[styles.possRow, i < 2 && { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
            <View style={styles.possInfo}>
              <Text style={[styles.possProject, { color: colors.foreground }]}>{a.project}</Text>
              <Text style={[styles.possUnits, { color: colors.mutedForeground }]}>{a.units} units · {a.date}</Text>
            </View>
            <View style={[styles.possDaysBadge, { backgroundColor: a.days <= 60 ? "#fef9c3" : "#dcfce7" }]}>
              <Text style={{ fontSize: 11, fontWeight: "700", color: a.days <= 60 ? "#a16207" : "#15803d" }}>
                {a.days}d left
              </Text>
            </View>
          </View>
        ))}
      </View>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GOVT OFFICER DASHBOARD — SLA approval queue, dept scorecard, disputes
// ─────────────────────────────────────────────────────────────────────────────
function GovtDashboard() {
  const colors = useColors();
  const { properties, transactions, disputes } = useData();
  const router = useRouter();

  const pendingTx = transactions.filter((t) => t.status === "verifying");
  const openDisputes = disputes.filter((d) => d.status === "open");
  const pendingProps = properties.filter((p) => p.status === "under_review");
  const completedTx = transactions.filter((t) => t.status === "completed");
  const totalStampDuty = completedTx.reduce((s, t) => s + t.amount * 0.06, 0);
  const totalRegFees = completedTx.reduce((s, t) => s + t.amount * 0.01, 0);

  // Today's approval queue with SLA timers
  const APPROVAL_QUEUE = [
    { id: "TXN-001", type: "Transfer", party: "Ramesh Sharma → Sunita Patel", bpid: "B-PID-MH-2026-001", value: "₹82L", slaHours: 2, urgent: true },
    { id: "TXN-002", type: "Loan NOC", party: "Deepak Joshi — SBI", bpid: "B-PID-MH-2026-002", value: "₹65L", slaHours: 6, urgent: false },
    { id: "TXN-003", type: "Dispute", party: "Ahmed Khan vs Priya Builders", bpid: "B-PID-MH-2026-003", value: "—", slaHours: 1, urgent: true },
    { id: "TXN-004", type: "Transfer", party: "Meena Reddy → Vikram Singh", bpid: "B-PID-GJ-2026-004", value: "₹44L", slaHours: 18, urgent: false },
    { id: "TXN-005", type: "Doc Verify", party: "Emerald Heights — OC Upload", bpid: "BPCS-RERA-2026-001", value: "—", slaHours: 48, urgent: false },
  ];

  const DEPT_KPIs = [
    { label: "SLA Compliance", value: "94%", trend: "+4%", good: true },
    { label: "Avg. Processing Time", value: "4.2 hrs", trend: "-1.1 hrs", good: true },
    { label: "Digital Registrations", value: "87%", trend: "+12%", good: true },
    { label: "Fraud Flags", value: "3", trend: "+1", good: false },
  ];

  const OFFICERS = [
    { name: "Sub-Registrar K. Iyer", actions: 47, pending: 3, rating: "Excellent", isYou: true },
    { name: "Talathi R. Desai", actions: 31, pending: 8, rating: "Good", isYou: false },
    { name: "Inspector V. Rao", actions: 22, pending: 12, rating: "Average", isYou: false },
  ];

  const TODAYS_SCHEDULE = [
    { time: "10:00 AM", event: "Hearing — Dispute #DS-007", location: "Room 3B", status: "upcoming" },
    { time: "11:30 AM", event: "Property Verification Visit — Thane", location: "Survey 45/2", status: "upcoming" },
    { time: "02:00 PM", event: "BPCS Training for staff", location: "Conference Hall", status: "upcoming" },
    { time: "04:30 PM", event: "EOD Report submission", location: "Online Portal", status: "upcoming" },
  ];

  return (
    <>
      {/* Hero — Today's Workload */}
      <View style={[styles.heroCard, { backgroundColor: "#1e3a8a" }]}>
        <View style={styles.heroTopRow}>
          <Text style={styles.heroLabel}>Today's Workload — Sub-Registrar Office</Text>
          <View style={styles.livePill}>
            <View style={styles.livePillDot} />
            <Text style={styles.livePillText}>LIVE</Text>
          </View>
        </View>
        <Text style={styles.heroValue}>{formatCurrency(totalStampDuty + totalRegFees)}</Text>
        <Text style={styles.heroSubLabel}>Stamp Duty + Registration Collected (FY 2026–27)</Text>
        <View style={styles.heroRow}>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatNum}>{pendingTx.length + pendingProps.length}</Text>
            <Text style={styles.heroStatLabel}>Pending</Text>
          </View>
          <View style={styles.heroStatDivider} />
          <View style={styles.heroStat}>
            <Text style={styles.heroStatNum}>{openDisputes.length}</Text>
            <Text style={styles.heroStatLabel}>Disputes</Text>
          </View>
          <View style={styles.heroStatDivider} />
          <View style={[styles.heroRiskBadge, { backgroundColor: "#dcfce7" }]}>
            <Feather name="trending-down" size={12} color="#16a34a" />
            <Text style={[styles.heroRiskText, { color: "#16a34a" }]}>94% SLA Met</Text>
          </View>
        </View>
      </View>

      {/* Security Shield */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#f0fdf4", borderRadius: 10, padding: 10, borderWidth: 1, borderColor: "#bbf7d0" }}>
        <Feather name="shield" size={13} color="#16a34a" />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 10, fontWeight: "700", color: "#15803d" }}>Sovereign Audit Trail Active — RERAW Act 2026</Text>
          <Text style={{ fontSize: 9, color: "#16a34a" }}>All registrations tamper-evident · AI fraud scan running · Permissioned access only</Text>
        </View>
        <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: "#16a34a" }} />
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsRow}>
        <QuickAction icon="check-square" label="Approvals" color="#1e40af" onPress={() => router.push("/approvals" as any)} />
        <QuickAction icon="file-text" label="Doc Verify" color="#059669" onPress={() => router.push("/doc-verify" as any)} />
        <QuickAction icon="git-merge" label="Conflicts" color="#dc2626" onPress={() => router.push("/conflict-resolution" as any)} />
        <QuickAction icon="users" label="VLE Trust" color="#7c3aed" onPress={() => router.push("/vle-dashboard" as any)} />
      </View>

      {/* SLA-timed Approval Queue */}
      <View style={[styles.taskCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.taskCardHeader}>
          <View style={styles.taskCardTitleRow}>
            <Feather name="clock" size={14} color="#dc2626" />
            <Text style={[styles.taskCardTitle, { color: colors.foreground }]}>Pending Approval Queue</Text>
          </View>
          <View style={[styles.urgentPill, { backgroundColor: "#fee2e2" }]}>
            <Text style={{ fontSize: 11, fontWeight: "700", color: "#dc2626" }}>
              {APPROVAL_QUEUE.filter((a) => a.urgent).length} Urgent
            </Text>
          </View>
        </View>
        {APPROVAL_QUEUE.map((item, i) => (
          <View
            key={i}
            style={[
              styles.approvalRow,
              i < APPROVAL_QUEUE.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 },
            ]}
          >
            <View style={[styles.approvalTypePill, {
              backgroundColor:
                item.type === "Transfer" ? "#eff6ff" :
                item.type === "Dispute" ? "#fee2e2" :
                item.type === "Loan NOC" ? "#fdf4ff" : "#f0fdf4"
            }]}>
              <Text style={{
                fontSize: 9, fontWeight: "800",
                color: item.type === "Transfer" ? "#1d4ed8" : item.type === "Dispute" ? "#dc2626" : item.type === "Loan NOC" ? "#7c3aed" : "#16a34a",
                letterSpacing: 0.3
              }}>
                {item.type.toUpperCase()}
              </Text>
            </View>
            <View style={styles.approvalInfo}>
              <Text style={[styles.approvalParty, { color: colors.foreground }]} numberOfLines={1}>{item.party}</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Text style={[styles.approvalBpid, { color: colors.mutedForeground }]}>{item.bpid}</Text>
                {item.value !== "—" && (
                  <Text style={[styles.approvalValue, { color: "#1e3a8a" }]}>{item.value}</Text>
                )}
              </View>
            </View>
            <View style={[styles.slaBadge, {
              backgroundColor: item.slaHours <= 2 ? "#fee2e2" : item.slaHours <= 8 ? "#fef9c3" : "#f1f5f9"
            }]}>
              <Text style={{
                fontSize: 10, fontWeight: "700",
                color: item.slaHours <= 2 ? "#dc2626" : item.slaHours <= 8 ? "#a16207" : "#64748b"
              }}>
                {item.slaHours}h SLA
              </Text>
            </View>
          </View>
        ))}
        <TouchableOpacity
          style={styles.viewAllBtn}
          onPress={() => router.push("/approvals" as any)}
        >
          <Text style={styles.viewAllBtnText}>View All Pending Approvals</Text>
          <Feather name="arrow-right" size={13} color="#1e3a8a" />
        </TouchableOpacity>
      </View>

      {/* Department KPI Scorecard */}
      <View style={[styles.taskCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.taskCardHeader}>
          <View style={styles.taskCardTitleRow}>
            <Feather name="bar-chart-2" size={14} color="#7c3aed" />
            <Text style={[styles.taskCardTitle, { color: colors.foreground }]}>Department Performance — May 2026</Text>
          </View>
        </View>
        <View style={styles.kpiGrid}>
          {DEPT_KPIs.map((kpi, i) => (
            <View key={i} style={[styles.kpiCell, { backgroundColor: kpi.good ? "#f0fdf4" : "#fff5f5", borderColor: kpi.good ? "#bbf7d0" : "#fecaca" }]}>
              <Text style={[styles.kpiValue, { color: kpi.good ? "#15803d" : "#dc2626" }]}>{kpi.value}</Text>
              <Text style={[styles.kpiLabel, { color: colors.mutedForeground }]}>{kpi.label}</Text>
              <Text style={[styles.kpiTrend, { color: kpi.good ? "#16a34a" : "#dc2626" }]}>{kpi.trend} vs last month</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Officer Performance */}
      <View style={[styles.officerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Officer Scoreboard — Today</Text>
        {OFFICERS.map((o, i) => (
          <View
            key={i}
            style={[
              styles.officerRow,
              i < OFFICERS.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 },
              o.isYou && { backgroundColor: "#eff6ff", borderRadius: 8, paddingHorizontal: 6 },
            ]}
          >
            <View style={[styles.officerAvatar, { backgroundColor: "#1e3a8a" + "20" }]}>
              <Feather name="user" size={14} color="#1e3a8a" />
            </View>
            <View style={styles.officerInfo}>
              <Text style={[styles.officerName, { color: colors.foreground }]}>
                {o.name}{o.isYou ? " (You)" : ""}
              </Text>
              <Text style={[styles.officerMeta, { color: colors.mutedForeground }]}>
                {o.actions} actions today · {o.pending} pending
              </Text>
            </View>
            <View style={[styles.ratingBadge, {
              backgroundColor: o.rating === "Excellent" ? "#dcfce7" : o.rating === "Good" ? "#fef9c3" : "#fee2e2"
            }]}>
              <Text style={[styles.ratingText, {
                color: o.rating === "Excellent" ? "#15803d" : o.rating === "Good" ? "#a16207" : "#dc2626"
              }]}>{o.rating}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Today's Schedule */}
      <View style={[styles.taskCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.taskCardHeader}>
          <View style={styles.taskCardTitleRow}>
            <Feather name="calendar" size={14} color="#059669" />
            <Text style={[styles.taskCardTitle, { color: colors.foreground }]}>Today's Schedule</Text>
          </View>
          <Text style={[{ fontSize: 10, color: colors.mutedForeground }]}>Thu, 15 May 2026</Text>
        </View>
        {TODAYS_SCHEDULE.map((item, i) => (
          <View
            key={i}
            style={[
              styles.scheduleRow,
              i < TODAYS_SCHEDULE.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 },
            ]}
          >
            <Text style={styles.scheduleTime}>{item.time}</Text>
            <View style={styles.scheduleInfo}>
              <Text style={[styles.scheduleEvent, { color: colors.foreground }]}>{item.event}</Text>
              <Text style={[styles.scheduleLoc, { color: colors.mutedForeground }]}>{item.location}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* AI Fraud Intelligence */}
      {(() => {
        const FRAUD_FLAGS = [
          { bpid: "B-PID-UP-2026-007", flag: "Rapid Re-transfer Alert", level: "high", desc: "Property transferred 3× in 30 days — possible benami structuring. Auto-flagged by BPCS AI." },
          { bpid: "B-PID-DL-2026-003", flag: "Buyer-Seller Relationship Check", level: "watch", desc: "Registered buyer shares address with seller. KYC cross-check pending verification." },
        ];
        return (
          <View style={[styles.taskCard, { backgroundColor: "#fff9f9", borderColor: "#fca5a5" }]}>
            <View style={styles.taskCardHeader}>
              <View style={styles.taskCardTitleRow}>
                <Feather name="alert-triangle" size={14} color="#dc2626" />
                <Text style={[styles.taskCardTitle, { color: "#dc2626" }]}>AI Fraud Intelligence</Text>
              </View>
              <View style={[styles.urgentPill, { backgroundColor: "#fee2e2" }]}>
                <Text style={{ fontSize: 11, fontWeight: "700", color: "#dc2626" }}>2 Flags Active</Text>
              </View>
            </View>
            {FRAUD_FLAGS.map((f, i) => (
              <View key={i} style={[
                { paddingHorizontal: 14, paddingVertical: 10 },
                i < FRAUD_FLAGS.length - 1 && { borderBottomColor: "#fca5a5", borderBottomWidth: 1 },
              ]}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: f.level === "high" ? "#dc2626" : "#f97316" }} />
                  <Text style={{ fontSize: 9, fontWeight: "800", letterSpacing: 0.5, color: f.level === "high" ? "#dc2626" : "#d97706" }}>
                    {f.level === "high" ? "HIGH RISK" : "WATCH"}
                  </Text>
                  <Text style={{ fontSize: 9, color: "#94a3b8" }}>· {f.bpid}</Text>
                </View>
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#0f172a" }}>{f.flag}</Text>
                <Text style={{ fontSize: 11, color: "#64748b", marginTop: 2, lineHeight: 16 }}>{f.desc}</Text>
              </View>
            ))}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, padding: 10, borderTopWidth: 1, borderTopColor: "#fca5a5" }}>
              <Feather name="shield" size={11} color="#15803d" />
              <Text style={{ fontSize: 9, color: "#15803d", fontWeight: "600", flex: 1 }}>Sovereign Audit Trail Active — All actions tamper-evident · Permanently logged under RERAW Act 2026</Text>
            </View>
          </View>
        );
      })()}

      {/* Open Disputes */}
      {openDisputes.length > 0 && (
        <>
          <SectionHeader title="Open Disputes" action="View All" onAction={() => router.push("/approvals" as any)} />
          {openDisputes.map((d) => (
            <View key={d.id} style={[styles.disputeCard, { backgroundColor: "#fff5f5", borderColor: "#fca5a5" }]}>
              <Text style={[styles.projBbid, { color: "#dc2626" }]}>{d.bpid}</Text>
              <Text style={[styles.projName, { color: "#0f172a" }]}>{d.propertyAddress}</Text>
              <Text style={[styles.projLoc, { color: "#64748b" }]} numberOfLines={2}>{d.caseDetails}</Text>
              <TouchableOpacity
                style={[styles.freezeBtn, { backgroundColor: "#dc2626" }]}
                onPress={() => router.push("/approvals" as any)}
              >
                <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>Review Case</Text>
              </TouchableOpacity>
            </View>
          ))}
        </>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BANK DASHBOARD — Risk-scored loan queue, disbursement targets, NPA alerts
// ─────────────────────────────────────────────────────────────────────────────
function BankDashboard() {
  const colors = useColors();
  const { loans, transactions } = useData();
  const router = useRouter();

  const pendingLoans = loans.filter((l) => l.bankId === "USR005" && l.status === "pending");
  const underReviewLoans = loans.filter((l) => l.bankId === "USR005" && l.status === "under_review");
  const activeLoans = loans.filter((l) => l.bankId === "USR005" && l.status === "active");
  const totalPortfolio = activeLoans.reduce((s, l) => s + l.amount, 0);
  const escrowHeld = transactions.filter((t) => t.escrowStatus === "held").reduce((s, t) => s + t.amount, 0);

  const dailyTarget = 5;
  const dailySanctioned = 2;
  const targetPct = Math.min(100, Math.round((dailySanctioned / dailyTarget) * 100));

  // Risk-scored loan applications
  const LOAN_QUEUE = [
    { id: "LN-001", name: "Sunita Patel", bpid: "B-PID-MH-2026-002", amount: "₹65L", tenure: "20 yrs", cibil: 782, risk: "low", status: "Docs Complete", waiting: "3 days" },
    { id: "LN-002", name: "Mohan Reddy", bpid: "B-PID-AP-2026-005", amount: "₹48L", tenure: "15 yrs", cibil: 698, risk: "medium", status: "KYC Pending", waiting: "1 day" },
    { id: "LN-003", name: "Anita Joshi", bpid: "B-PID-MH-2026-006", amount: "₹92L", tenure: "25 yrs", cibil: 745, risk: "low", status: "Valuation Pending", waiting: "5 days" },
    { id: "LN-004", name: "Ravi Tiwari", bpid: "B-PID-UP-2026-007", amount: "₹38L", tenure: "10 yrs", cibil: 612, risk: "high", status: "Income Mismatch", waiting: "2 days" },
  ];

  const NPA_ALERTS = [
    { loan: "LN-2023-042", name: "Prakash Yadav", emi: "₹34,200", overdue: "62 days", amount: "₹12L", severity: "red" },
    { loan: "LN-2023-018", name: "Geeta Bhatt", emi: "₹22,800", overdue: "31 days", amount: "₹8L", severity: "orange" },
    { loan: "LN-2026-003", name: "Suresh Nair", emi: "₹41,500", overdue: "8 days", amount: "₹18L", severity: "yellow" },
  ];

  const PORTFOLIO_HEALTH = [
    { label: "Standard", value: 84, color: "#16a34a" },
    { label: "SMA-1 (31-60d)", value: 9, color: "#d97706" },
    { label: "SMA-2 (61-90d)", value: 4, color: "#f97316" },
    { label: "NPA (>90d)", value: 3, color: "#dc2626" },
  ];

  return (
    <>
      {/* Hero — Loan Portfolio + Daily Target */}
      <View style={[styles.heroCard, { backgroundColor: "#92400e" }]}>
        <View style={styles.heroTopRow}>
          <Text style={styles.heroLabel}>SBI Home Loan Portfolio</Text>
          <View style={[styles.rankBadge, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
            <Feather name="trending-up" size={11} color="#fbbf24" />
            <Text style={styles.rankBadgeText}>Lead Officer</Text>
          </View>
        </View>
        <Text style={styles.heroValue}>{formatCurrency(totalPortfolio)}</Text>
        <Text style={styles.heroSubLabel}>Today's Target: {dailySanctioned}/{dailyTarget} sanctions ({targetPct}%)</Text>
        <View style={styles.progressBarWrap}>
          <View style={[styles.progressBarFill, {
            width: `${targetPct}%` as any,
            backgroundColor: targetPct >= 80 ? "#34d399" : targetPct >= 50 ? "#fbbf24" : "#f87171"
          }]} />
        </View>
        <View style={styles.heroRow}>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatNum}>{activeLoans.length}</Text>
            <Text style={styles.heroStatLabel}>Active</Text>
          </View>
          <View style={styles.heroStatDivider} />
          <View style={styles.heroStat}>
            <Text style={styles.heroStatNum}>{pendingLoans.length + underReviewLoans.length}</Text>
            <Text style={styles.heroStatLabel}>Pending</Text>
          </View>
          <View style={styles.heroStatDivider} />
          <View style={styles.heroStat}>
            <Text style={styles.heroStatNum}>{escrowHeld > 0 ? `₹${(escrowHeld / 10000000).toFixed(1)}Cr` : "—"}</Text>
            <Text style={styles.heroStatLabel}>In Escrow</Text>
          </View>
        </View>
      </View>

      {/* Security Shield */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#fffbeb", borderRadius: 10, padding: 10, borderWidth: 1, borderColor: "#fde68a" }}>
        <Feather name="shield" size={13} color="#d97706" />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 10, fontWeight: "700", color: "#b45309" }}>BPCS Bank Security Protocol Active</Text>
          <Text style={{ fontSize: 9, color: "#d97706" }}>RBI compliance · Escrow auto-locks on fraud flag · CIBIL linked · Property lien-free verified</Text>
        </View>
        <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: "#d97706" }} />
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsRow}>
        <QuickAction icon="check-square" label="Sanction" color="#1e40af" onPress={() => router.push("/loan-approvals" as any)} />
        <QuickAction icon="shield" label="Escrow" color="#059669" onPress={() => router.push("/escrow" as any)} />
        <QuickAction icon="search" label="Verify" color="#92400e" onPress={() => router.push("/bank-verification" as any)} />
        <QuickAction icon="bar-chart-2" label="Fin. Sim" color="#7c3aed" onPress={() => router.push("/financial-sim" as any)} />
      </View>

      {/* Loan Application Queue with Credit Risk */}
      <View style={[styles.taskCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.taskCardHeader}>
          <View style={styles.taskCardTitleRow}>
            <Feather name="credit-card" size={14} color="#d97706" />
            <Text style={[styles.taskCardTitle, { color: colors.foreground }]}>Loan Application Queue</Text>
          </View>
          <View style={[styles.urgentPill, { backgroundColor: "#fef9c3" }]}>
            <Text style={{ fontSize: 11, fontWeight: "700", color: "#a16207" }}>
              {LOAN_QUEUE.length} Pending
            </Text>
          </View>
        </View>
        {LOAN_QUEUE.map((loan, i) => (
          <View
            key={i}
            style={[
              styles.loanQueueRow,
              i < LOAN_QUEUE.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 },
            ]}
          >
            <View style={styles.loanQueueLeft}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text style={[styles.loanQueueName, { color: colors.foreground }]}>{loan.name}</Text>
                <View style={[styles.riskPill, {
                  backgroundColor:
                    loan.risk === "low" ? "#dcfce7" : loan.risk === "medium" ? "#fef9c3" : "#fee2e2"
                }]}>
                  <Text style={{
                    fontSize: 9, fontWeight: "700",
                    color: loan.risk === "low" ? "#15803d" : loan.risk === "medium" ? "#a16207" : "#dc2626"
                  }}>
                    {loan.risk.toUpperCase()} RISK
                  </Text>
                </View>
              </View>
              <Text style={[styles.loanQueueBpid, { color: colors.mutedForeground }]}>{loan.bpid} · {loan.amount} · {loan.tenure}</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 }}>
                <View style={[styles.cibilChip, {
                  backgroundColor: loan.cibil >= 750 ? "#f0fdf4" : loan.cibil >= 700 ? "#fff7ed" : "#fff5f5"
                }]}>
                  <Text style={{
                    fontSize: 10, fontWeight: "700",
                    color: loan.cibil >= 750 ? "#15803d" : loan.cibil >= 700 ? "#c2410c" : "#dc2626"
                  }}>CIBIL {loan.cibil}</Text>
                </View>
                <Text style={[{ fontSize: 10, color: colors.mutedForeground }]}>{loan.status} · {loan.waiting} wait</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.sanctionBtn, { backgroundColor: "#1e3a8a" }]}
              onPress={() => router.push("/loan-approvals" as any)}
            >
              <Text style={{ color: "#fff", fontSize: 10, fontWeight: "700" }}>Review</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Portfolio Health */}
      <View style={[styles.taskCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.taskCardHeader}>
          <View style={styles.taskCardTitleRow}>
            <Feather name="pie-chart" size={14} color="#7c3aed" />
            <Text style={[styles.taskCardTitle, { color: colors.foreground }]}>Portfolio Health</Text>
          </View>
          <Text style={[{ fontSize: 10, color: colors.mutedForeground }]}>{activeLoans.length} active loans</Text>
        </View>
        {PORTFOLIO_HEALTH.map((bucket, i) => (
          <View key={i} style={styles.portfolioRow}>
            <Text style={[styles.portfolioLabel, { color: colors.mutedForeground }]}>{bucket.label}</Text>
            <View style={styles.portfolioBarWrap}>
              <View style={[styles.portfolioBarFill, { width: `${bucket.value}%` as any, backgroundColor: bucket.color }]} />
            </View>
            <Text style={[styles.portfolioPct, { color: bucket.color }]}>{bucket.value}%</Text>
          </View>
        ))}
      </View>

      {/* NPA / Overdue EMI Alerts */}
      <View style={[styles.taskCard, { backgroundColor: colors.card, borderColor: "#fca5a5" }]}>
        <View style={styles.taskCardHeader}>
          <View style={styles.taskCardTitleRow}>
            <Feather name="alert-triangle" size={14} color="#dc2626" />
            <Text style={[styles.taskCardTitle, { color: colors.foreground }]}>EMI Overdue Alerts</Text>
          </View>
          <View style={[styles.urgentPill, { backgroundColor: "#fee2e2" }]}>
            <Text style={{ fontSize: 11, fontWeight: "700", color: "#dc2626" }}>Action Required</Text>
          </View>
        </View>
        {NPA_ALERTS.map((alert, i) => (
          <View
            key={i}
            style={[
              styles.npaRow,
              i < NPA_ALERTS.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 },
            ]}
          >
            <View style={[styles.npaLight, {
              backgroundColor:
                alert.severity === "red" ? "#dc2626" :
                alert.severity === "orange" ? "#f97316" : "#d97706"
            }]} />
            <View style={styles.npaInfo}>
              <Text style={[styles.npaName, { color: colors.foreground }]}>{alert.name}</Text>
              <Text style={[styles.npaMeta, { color: colors.mutedForeground }]}>
                {alert.loan} · EMI {alert.emi} · Outstanding {alert.amount}
              </Text>
              <Text style={[{ fontSize: 11, fontWeight: "700", color: alert.severity === "red" ? "#dc2626" : "#d97706" }]}>
                Overdue: {alert.overdue}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.npaActionBtn, { backgroundColor: "#fee2e2" }]}
              onPress={() => {}}
            >
              <Feather name="phone-call" size={13} color="#dc2626" />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Pending Loan Applications */}
      <SectionHeader
        title="Pending Loan Applications"
        action="View All"
        onAction={() => router.push("/loan-approvals" as any)}
      />
      {pendingLoans.map((loan) => (
        <View key={loan.id} style={[styles.loanCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.row}>
            <View>
              <Text style={[styles.projBbid, { color: colors.mutedForeground }]}>{loan.bpid}</Text>
              <Text style={[styles.projName, { color: colors.foreground }]}>{loan.applicantName}</Text>
              <Text style={[styles.projLoc, { color: colors.mutedForeground }]}>{loan.propertyAddress}</Text>
            </View>
            <Text style={[styles.projPrice, { color: colors.primary }]}>{formatCurrency(loan.amount)}</Text>
          </View>
          <View style={styles.loanMeta}>
            <Text style={[styles.projLoc, { color: colors.mutedForeground }]}>
              {loan.tenure} months • {loan.interestRate}% p.a.
            </Text>
            <TouchableOpacity
              style={[styles.approveBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.push("/loan-approvals" as any)}
            >
              <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>Review</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
      {pendingLoans.length === 0 && (
        <EmptyState icon="check-circle" message="No pending loan applications" />
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared Components
// ─────────────────────────────────────────────────────────────────────────────
function QuickAction({
  icon,
  label,
  color,
  onPress,
}: {
  icon: string;
  label: string;
  color: string;
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <TouchableOpacity
      style={[styles.quickAction, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => {
        Haptics.selectionAsync();
        onPress();
      }}
      activeOpacity={0.7}
    >
      <View style={[styles.qaIcon, { backgroundColor: color + "15" }]}>
        <Feather name={icon as any} size={18} color={color} />
      </View>
      <Text style={[styles.qaLabel, { color: colors.foreground }]} numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function EmptyState({ icon, message }: { icon: string; message: string }) {
  const colors = useColors();
  return (
    <View style={styles.emptyState}>
      <Feather name={icon as any} size={28} color={colors.mutedForeground} />
      <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>{message}</Text>
    </View>
  );
}

function getRoleLabel(role: string) {
  const labels: Record<string, string> = {
    citizen: "Property Owner",
    cpf: "CPF Broker",
    developer: "Developer",
    govt: "Government Officer",
    bank: "Bank Officer",
  };
  return labels[role] || role;
}

function CompactLanguagePicker() {
  const { lang, setLang } = useLang();
  return (
    <View style={styles.footerLangWrap}>
      <Text style={styles.footerLangHint}>Language</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.footerLangScroll}>
        {STATE_LANG_OPTIONS.map((opt) => {
          const active = lang === opt.lang;
          return (
            <TouchableOpacity
              key={opt.lang}
              style={[styles.footerLangChip, active && styles.footerLangChipActive]}
              onPress={() => {
                Haptics.selectionAsync();
                setLang(opt.lang);
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.footerLangChipText, active && styles.footerLangChipTextActive]}>{opt.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { gap: 0 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerLeft: { flex: 1 },
  headerRight: { alignItems: "center", gap: 10 },
  emblemRow: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 8 },
  emblemText: { color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: "600", letterSpacing: 0.5 },
  greeting: { color: "#94a3b8", fontSize: 13 },
  userName: { color: "#fff", fontSize: 20, fontWeight: "700", marginTop: 2 },
  verifiedRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 },
  roleTag: { backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  roleText: { color: "#fff", fontSize: 11, fontWeight: "600" },
  verifiedBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(52,211,153,0.15)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  verifiedText: { color: "#34d399", fontSize: 11, fontWeight: "600" },
  notifBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  notifDot: { position: "absolute", top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: "#f97316", borderWidth: 1.5, borderColor: "#1e3a8a" },
  headerAvatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: "rgba(255,255,255,0.4)" },
  headerAvatarFallback: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "rgba(255,255,255,0.3)" },
  headerAvatarText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  body: { padding: 20, gap: 16 },
  bpcsTagline: { color: "#f97316", fontSize: 9, fontWeight: "800", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 },

  // Language Bar
  langBarWrap: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#e2e8f0" },
  langBarHeader: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 6 },
  langBarTitle: { fontSize: 8, fontWeight: "800", color: "#64748b", letterSpacing: 0.4, textTransform: "uppercase" },
  langBarScroll: { gap: 6, paddingRight: 4 },
  langChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: "#dbe2ea", backgroundColor: "#f8fafc", alignItems: "center", minWidth: 68 },
  langChipActive: { borderColor: "#1e3a8a", backgroundColor: "#1e3a8a" },
  langChipLabel: { fontSize: 12, fontWeight: "700", color: "#334155" },
  langChipLabelActive: { color: "#fff" },
  langChipStates: { fontSize: 9, color: "#64748b", marginTop: 1, textAlign: "center" },
  langChipStatesActive: { color: "rgba(255,255,255,0.7)" },
  footerLangWrap: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1, borderTopColor: "#e2e8f0", backgroundColor: "#fff" },
  footerLangHint: { fontSize: 11, fontWeight: "700", color: "#64748b" },
  footerLangScroll: { gap: 6 },
  footerLangChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: "#dbe2ea", backgroundColor: "#f8fafc" },
  footerLangChipActive: { backgroundColor: "#1e3a8a", borderColor: "#1e3a8a" },
  footerLangChipText: { fontSize: 12, fontWeight: "700", color: "#334155" },
  footerLangChipTextActive: { color: "#fff" },

  // Hero Card
  heroCard: { borderRadius: 16, padding: 18, gap: 6 },
  heroTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  heroLabel: { color: "rgba(255,255,255,0.65)", fontSize: 12, fontWeight: "600" },
  heroSubLabel: { color: "rgba(255,255,255,0.5)", fontSize: 11, marginTop: -2 },
  heroValue: { color: "#fff", fontSize: 28, fontWeight: "800", marginTop: 4 },
  heroRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 8 },
  heroStat: { alignItems: "center" },
  heroStatNum: { color: "#fff", fontSize: 16, fontWeight: "700" },
  heroStatLabel: { color: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: "500", marginTop: 1 },
  heroStatDivider: { width: 1, height: 24, backgroundColor: "rgba(255,255,255,0.2)" },
  heroRiskBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  heroRiskText: { fontSize: 11, fontWeight: "700" },
  rankBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  rankBadgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  progressBarWrap: { height: 5, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 3, overflow: "hidden", marginTop: 4 },
  progressBarFill: { height: 5, borderRadius: 3 },
  livePill: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#dc2626", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  livePillDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#fff" },
  livePillText: { color: "#fff", fontSize: 9, fontWeight: "800", letterSpacing: 1 },

  // Scheme Banner
  schemeBannerWrap: { gap: 8 },
  schemeBannerHeader: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 4 },
  schemeBannerTitle: { color: "#1e3a8a", fontSize: 10, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase", flex: 1 },
  schemeDotRow: { flexDirection: "row", gap: 5, alignItems: "center" },
  schemeDot: { width: 7, height: 7, borderRadius: 4 },
  schemeCard: { width: 302, borderRadius: 16, overflow: "hidden", position: "relative", height: 180 },
  schemeCardImg: { position: "absolute", width: "100%", height: "100%", opacity: 0.45 },
  schemeCardOverlay: { position: "absolute", width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.3)" },
  schemeCardContent: { padding: 14, height: "100%", justifyContent: "space-between" },
  schemeCardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  schemeTagPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  schemeTagText: { color: "#000", fontSize: 9, fontWeight: "800", letterSpacing: 0.5 },
  schemeDeadline: { color: "rgba(255,255,255,0.7)", fontSize: 9, fontWeight: "600" },
  schemeCardTitle: { color: "#fff", fontSize: 14, fontWeight: "800", marginTop: 4, lineHeight: 19 },
  schemeCardDesc: { color: "rgba(255,255,255,0.85)", fontSize: 11, lineHeight: 16, flex: 1, marginTop: 4 },
  schemeApplyBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, alignSelf: "flex-start" },
  schemeApplyText: { color: "#000", fontSize: 11, fontWeight: "800" },

  // General
  metricsRow: { flexDirection: "row", gap: 12 },
  actionsRow: { flexDirection: "row", gap: 10 },
  quickAction: { flex: 1, borderRadius: 12, borderWidth: 1, padding: 12, alignItems: "center", gap: 6 },
  qaIcon: { width: 36, height: 36, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  qaLabel: { fontSize: 10, fontWeight: "600", textAlign: "center" },
  loanAlert: { flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderRadius: 10, padding: 10 },
  loanAlertText: { fontSize: 12, fontWeight: "600", flex: 1 },

  // Live Feed
  feedCard: { borderRadius: 12, borderWidth: 1, overflow: "hidden" },
  feedRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 12 },
  feedIcon: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  feedContent: { flex: 1 },
  feedMsg: { fontSize: 12, lineHeight: 17, fontWeight: "500" },
  feedTime: { fontSize: 10, marginTop: 3 },

  // Task Card (shared wrapper)
  taskCard: { borderRadius: 12, borderWidth: 1, overflow: "hidden" },
  taskCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 14, paddingBottom: 10 },
  taskCardTitleRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  taskCardTitle: { fontSize: 13, fontWeight: "700" },
  urgentPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },

  // CPF Task Queue
  taskRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, paddingHorizontal: 14, paddingVertical: 10 },
  taskTypeIcon: { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center", marginTop: 1 },
  taskInfo: { flex: 1 },
  taskLabel: { fontSize: 13, fontWeight: "600", lineHeight: 18 },
  taskMeta: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4, flexWrap: "wrap" },
  taskBpid: { fontSize: 10, fontWeight: "600" },
  taskDuePill: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 20 },

  // CPF Pipeline
  pipelineTotal: { fontSize: 12, fontWeight: "600" },
  pipelineRow: { flexDirection: "row", paddingHorizontal: 14, paddingBottom: 14, justifyContent: "space-between" },
  pipelineCol: { alignItems: "center", flex: 1 },
  pipelineCountBubble: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", borderWidth: 1.5 },
  pipelineCount: { fontSize: 14, fontWeight: "800" },
  pipelineLabel: { fontSize: 9, fontWeight: "600", textAlign: "center", marginTop: 5, lineHeight: 12 },

  // CPF Leaderboard
  leaderRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 10 },
  leaderRankNum: { fontSize: 18, width: 28, textAlign: "center" },
  leaderInfo: { flex: 1 },
  leaderName: { fontSize: 13, fontWeight: "600" },
  leaderCity: { fontSize: 11, marginTop: 1 },
  leaderComm: { fontSize: 14, fontWeight: "700" },

  // Developer — RERA
  reraRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, paddingHorizontal: 14, paddingVertical: 12 },
  reraLight: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  reraInfo: { flex: 1 },
  reraProject: { fontSize: 13, fontWeight: "600" },
  reraBbid: { fontSize: 10, marginTop: 2 },
  reraIssue: { fontSize: 11, fontWeight: "600", marginTop: 3 },
  reraDeadline: { fontSize: 10, marginTop: 2 },
  reraActionBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, alignSelf: "center" },

  // Developer — Buyer Enquiry
  enquiryRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 10 },
  enquiryAvatar: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  enquiryAvatarText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  enquiryInfo: { flex: 1 },
  enquiryName: { fontSize: 13, fontWeight: "600" },
  enquiryUnit: { fontSize: 11, marginTop: 2 },
  enquiryTime: { fontSize: 10, marginTop: 1 },
  hotPill: { backgroundColor: "#fff3cd", paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20 },
  hotPillText: { fontSize: 9, fontWeight: "800", color: "#a16207" },
  callBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#f0fdf4", alignItems: "center", justifyContent: "center" },

  // Developer — Possession
  possRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 10 },
  possInfo: { flex: 1 },
  possProject: { fontSize: 13, fontWeight: "600" },
  possUnits: { fontSize: 11, marginTop: 2 },
  possDaysBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },

  // Govt — Approval Queue
  approvalRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 10 },
  approvalTypePill: { paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8, minWidth: 52, alignItems: "center" },
  approvalInfo: { flex: 1 },
  approvalParty: { fontSize: 12, fontWeight: "600" },
  approvalBpid: { fontSize: 10 },
  approvalValue: { fontSize: 11, fontWeight: "700" },
  slaBadge: { paddingHorizontal: 8, paddingVertical: 5, borderRadius: 20 },
  viewAllBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12, borderTopWidth: 1, borderTopColor: "#e2e8f0" },
  viewAllBtnText: { fontSize: 13, fontWeight: "600", color: "#1e3a8a" },

  // Govt — KPI Grid
  kpiGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 14, paddingBottom: 14 },
  kpiCell: { width: "47%", borderRadius: 10, borderWidth: 1, padding: 12 },
  kpiValue: { fontSize: 20, fontWeight: "800" },
  kpiLabel: { fontSize: 11, fontWeight: "600", marginTop: 2 },
  kpiTrend: { fontSize: 10, marginTop: 4, fontWeight: "600" },

  // Govt — Schedule
  scheduleRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, paddingHorizontal: 14, paddingVertical: 10 },
  scheduleTime: { fontSize: 11, fontWeight: "700", color: "#1e3a8a", width: 72 },
  scheduleInfo: { flex: 1 },
  scheduleEvent: { fontSize: 13, fontWeight: "600" },
  scheduleLoc: { fontSize: 11, marginTop: 2 },

  // Officer Card
  revenueCard: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 10 },
  officerCard: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 0 },
  sectionLabel: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 },
  revRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  revLabel: { fontSize: 11, width: 130 },
  revBarWrap: { flex: 1, height: 6, backgroundColor: "#f1f5f9", borderRadius: 3, overflow: "hidden" },
  revBar: { height: 6, borderRadius: 3 },
  revAmt: { fontSize: 12, fontWeight: "700", width: 70, textAlign: "right" },
  revTotal: { flexDirection: "row", justifyContent: "space-between", paddingTop: 8, marginTop: 4, borderTopWidth: 1 },
  revTotalLabel: { fontSize: 13, fontWeight: "600" },
  revTotalAmt: { fontSize: 14, fontWeight: "800" },
  officerRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10 },
  officerAvatar: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  officerInfo: { flex: 1 },
  officerName: { fontSize: 13, fontWeight: "600" },
  officerMeta: { fontSize: 11, marginTop: 1 },
  ratingBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  ratingText: { fontSize: 11, fontWeight: "700" },

  // Bank — Loan Queue
  loanQueueRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 10 },
  loanQueueLeft: { flex: 1 },
  loanQueueName: { fontSize: 13, fontWeight: "600" },
  loanQueueBpid: { fontSize: 10, marginTop: 3 },
  riskPill: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 20 },
  cibilChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  sanctionBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },

  // Bank — Portfolio Health
  portfolioRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 6 },
  portfolioLabel: { fontSize: 11, width: 120 },
  portfolioBarWrap: { flex: 1, height: 8, backgroundColor: "#f1f5f9", borderRadius: 4, overflow: "hidden" },
  portfolioBarFill: { height: 8, borderRadius: 4 },
  portfolioPct: { fontSize: 12, fontWeight: "700", width: 36, textAlign: "right" },

  // Bank — NPA
  npaRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 10 },
  npaLight: { width: 10, height: 10, borderRadius: 5 },
  npaInfo: { flex: 1 },
  npaName: { fontSize: 13, fontWeight: "600" },
  npaMeta: { fontSize: 10, marginTop: 2 },
  npaActionBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },

  // Project Card
  projectCard: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 12, gap: 10 },
  projHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  projBbid: { fontSize: 10, fontWeight: "600", letterSpacing: 0.5 },
  projName: { fontSize: 15, fontWeight: "700", marginTop: 2 },
  projLoc: { fontSize: 12, marginTop: 2 },
  approvalBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  unitsRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  unitMeta: { alignItems: "center" },
  unitNum: { fontSize: 18, fontWeight: "700" },
  unitLabel: { fontSize: 10, fontWeight: "500" },
  projPrice: { fontSize: 15, fontWeight: "700", marginLeft: "auto" },

  // Dispute
  disputeCard: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 12, gap: 6 },
  freezeBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, alignSelf: "flex-start", marginTop: 4 },

  // Loan Card
  loanCard: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 12, gap: 10 },
  loanMeta: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  approveBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 6 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },

  // Empty State
  emptyState: { alignItems: "center", paddingVertical: 32, gap: 8 },
  emptyText: { fontSize: 14 },
});

const intentStyles = StyleSheet.create({
  card: { borderRadius: 14, borderWidth: 1.5, padding: 14, gap: 12, marginBottom: 0 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  headerIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: "#4f46e5", alignItems: "center", justifyContent: "center" },
  title: { fontSize: 13, fontWeight: "700" },
  subtitle: { fontSize: 10, marginTop: 1 },
  badge: { backgroundColor: "#4f46e5", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeText: { color: "#fff", fontSize: 9, fontWeight: "800", letterSpacing: 1 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  intentBtn: { width: "22%", borderRadius: 10, borderWidth: 1, padding: 8, alignItems: "center", gap: 5, flexGrow: 1 },
  intentIcon: { width: 30, height: 30, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  intentLabel: { fontSize: 9, fontWeight: "700", textAlign: "center" },
  footer: { flexDirection: "row", alignItems: "center", gap: 5 },
  footerText: { fontSize: 9, flex: 1 },
});

const womenStyles = StyleSheet.create({
  card: { borderRadius: 14, borderWidth: 1.5, padding: 14, gap: 12 },
  header: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  title: { color: "#be185d", fontSize: 13, fontWeight: "700", flex: 1 },
  subtitle: { color: "#be185d", fontSize: 9, marginTop: 2, opacity: 0.8 },
  row: { flexDirection: "row", gap: 10 },
  feature: { flex: 1, borderRadius: 12, borderWidth: 1, padding: 10, gap: 6 },
  featureIcon: { width: 32, height: 32, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  featureTitle: { fontSize: 11, fontWeight: "700", color: "#1e293b" },
  featureDesc: { fontSize: 9, color: "#64748b", lineHeight: 13 },
  featureTag: { alignSelf: "flex-start", paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20 },
  featureTagText: { color: "#fff", fontSize: 8, fontWeight: "800", letterSpacing: 0.5 },
  familyAlert: { flexDirection: "row", alignItems: "flex-start", gap: 6, backgroundColor: "#fff0f3", borderRadius: 8, padding: 8 },
  familyAlertText: { fontSize: 9, color: "#be185d", flex: 1, lineHeight: 14, fontWeight: "500" },
});

const devStyles = StyleSheet.create({
  // Generic section card
  sectionCard: { borderRadius: 14, borderWidth: 1, padding: 0, marginBottom: 0, overflow: "hidden" },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 14, paddingBottom: 10 },
  cardTitleRow: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  cardIcon: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  cardTitle: { fontSize: 13, fontWeight: "700" },
  cardSubtitle: { fontSize: 10, marginTop: 1 },

  // Live pill
  livePill: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#dcfce7", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#16a34a" },
  liveText: { color: "#16a34a", fontSize: 9, fontWeight: "800" },

  // BMC compliance rows
  complianceRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, paddingHorizontal: 14, paddingVertical: 10 },
  complianceIcon: { width: 32, height: 32, borderRadius: 9, alignItems: "center", justifyContent: "center", marginTop: 2 },
  complianceLabel: { fontSize: 12, fontWeight: "700" },
  complianceRef: { fontSize: 9, marginTop: 2, fontFamily: "monospace" },
  complianceDate: { fontSize: 10, marginTop: 2, fontWeight: "500" },
  statusChip: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 20, alignSelf: "center" },
  statusChipText: { fontSize: 9, fontWeight: "800" },

  // Fire NOC timeline
  stageTimeline: { paddingHorizontal: 14, paddingTop: 4, paddingBottom: 4 },
  stageRow: { flexDirection: "row", gap: 12 },
  stageNodeCol: { alignItems: "center", width: 22 },
  stageNode: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  stageLine: { width: 2, flex: 1, marginTop: 2, minHeight: 16 },
  stageInfo: { flex: 1, paddingBottom: 14 },
  stageLabel: { fontSize: 12 },
  stageDate: { fontSize: 10, marginTop: 2 },

  // Alert strip
  alertStrip: { flexDirection: "row", alignItems: "flex-start", gap: 6, backgroundColor: "#fff7ed", margin: 10, borderRadius: 8, padding: 8 },
  alertStripText: { fontSize: 9, color: "#ea580c", flex: 1, lineHeight: 14, fontWeight: "500" },

  // Legal activity bar graph
  legalGraph: { paddingHorizontal: 14, paddingBottom: 10, gap: 10 },
  legalBarRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  legalBarLabel: { fontSize: 10, fontWeight: "600", width: 90 },
  legalBarTrack: { flex: 1, height: 8, backgroundColor: "#f1f5f9", borderRadius: 4, overflow: "hidden" },
  legalBarFill: { height: 8, borderRadius: 4 },
  legalBarPct: { fontSize: 10, fontWeight: "700", width: 34, textAlign: "right" },

  // Monthly revenue bar chart
  revenueGraph: { flexDirection: "row", alignItems: "flex-end", paddingHorizontal: 14, paddingBottom: 10, gap: 4, height: 110 },
  revBarCol: { flex: 1, alignItems: "center", gap: 4, height: "100%" },
  revBarValue: { fontSize: 8, fontWeight: "600", textAlign: "center" },
  revBarTrack: { flex: 1, width: "100%", backgroundColor: "#f1f5f9", borderRadius: 4, overflow: "hidden", justifyContent: "flex-end" },
  revBarFill: { width: "100%", borderRadius: 4 },
  revBarMonth: { fontSize: 9, textAlign: "center" },

  // Project health card
  projectCard: { borderRadius: 14, borderWidth: 1.5, padding: 14, marginBottom: 12, gap: 10 },
  projCardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8 },
  projCardBbid: { fontSize: 9, fontWeight: "700", letterSpacing: 0.5 },
  projCardName: { fontSize: 14, fontWeight: "700", marginTop: 2 },
  projComplianceNote: { fontSize: 10, marginTop: 3, fontWeight: "600" },
  healthRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  healthLabel: { fontSize: 10, width: 80 },
  healthBar: { flex: 1, height: 8, backgroundColor: "#f1f5f9", borderRadius: 4, overflow: "hidden" },
  healthBarFill: { height: 8, borderRadius: 4 },
  healthGrade: { width: 22, height: 22, borderRadius: 7, alignItems: "center", justifyContent: "center" },
  healthGradeText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  healthPct: { fontSize: 10, fontWeight: "700", width: 30, textAlign: "right" },
  projStatsRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  projStatBox: { alignItems: "center" },
  projStatNum: { fontSize: 17, fontWeight: "700" },
  projStatLabel: { fontSize: 9, fontWeight: "500", marginTop: 1 },
  possessionTag: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, marginLeft: "auto" },

  // Sales funnel
  funnelRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 6 },
  funnelLabel: { fontSize: 11, fontWeight: "600", width: 74 },
  funnelTrack: { flex: 1, height: 10, backgroundColor: "#f1f5f9", borderRadius: 5, overflow: "hidden" },
  funnelFill: { height: 10, borderRadius: 5 },
  funnelCount: { fontSize: 12, fontWeight: "700", width: 28, textAlign: "right" },
});

const youthStyles = StyleSheet.create({
  outerCard: { borderRadius: 16, overflow: "hidden", marginBottom: 0 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14, paddingBottom: 10 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  headerIcon: { width: 34, height: 34, borderRadius: 11, backgroundColor: "#f9731620", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#f9731640" },
  headerTitle: { color: "#fff", fontSize: 13, fontWeight: "800" },
  headerSub: { color: "#94a3b8", fontSize: 9, marginTop: 2 },
  newBadge: { backgroundColor: "#f97316", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  newBadgeText: { color: "#fff", fontSize: 9, fontWeight: "900", letterSpacing: 1 },
  schemeRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginHorizontal: 12, marginBottom: 10, padding: 12, borderRadius: 12, borderWidth: 1, backgroundColor: "rgba(255,255,255,0.05)" },
  schemeIconWrap: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  schemeName: { color: "#f1f5f9", fontSize: 12, fontWeight: "700", flex: 1 },
  tagChip: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 20 },
  tagChipText: { fontSize: 8, fontWeight: "900", letterSpacing: 0.5 },
  schemeDesc: { color: "#94a3b8", fontSize: 10, lineHeight: 14, marginTop: 4 },
  schemeFooter: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 8 },
  schemeDeadline: { color: "#64748b", fontSize: 9, fontWeight: "600", flex: 1 },
  applyBtn: { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "#f9731615", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: "#f9731630" },
  applyBtnText: { color: "#f97316", fontSize: 9, fontWeight: "800" },
  footer: { flexDirection: "row", alignItems: "flex-start", gap: 5, margin: 12, marginTop: 4, padding: 8, backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 8 },
  footerText: { color: "#475569", fontSize: 9, flex: 1, lineHeight: 13 },
});
