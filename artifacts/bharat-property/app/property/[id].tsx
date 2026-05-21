import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Alert, Animated, Dimensions, Image, Platform, ScrollView,
  StyleSheet, Text, TouchableOpacity, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBadge } from "@/components/StatusBadge";
import { PropertyHealthScore } from "@/components/PropertyHealthScore";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";
import { formatCurrency, formatDate } from "@/utils/format";

const { width: SCREEN_W } = Dimensions.get("window");

// ─── Indian Property Images per type ───────────────────────────────────────
const PROPERTY_IMAGES: Record<string, { uri: string; caption: string }[]> = {
  flat: [
    { uri: "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=600&h=360&fit=crop", caption: "Main Elevation — Street View" },
    { uri: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&h=360&fit=crop", caption: "Drawing Room — Interior" },
    { uri: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=360&fit=crop", caption: "Kitchen — Modular" },
    { uri: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=360&fit=crop", caption: "Master Bedroom" },
    { uri: "https://images.unsplash.com/photo-1512918728675-ed5a585280e5?w=600&h=360&fit=crop", caption: "Balcony & City View" },
  ],
  land: [
    { uri: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=360&fit=crop", caption: "Plot — Aerial View" },
    { uri: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=360&fit=crop", caption: "North Boundary View" },
    { uri: "https://images.unsplash.com/photo-1460317442991-0ec209397118?w=600&h=360&fit=crop", caption: "Eastern Face — Road Access" },
    { uri: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=360&fit=crop", caption: "Land Topography" },
    { uri: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=600&h=360&fit=crop", caption: "Site Panorama" },
  ],
  commercial: [
    { uri: "https://images.unsplash.com/photo-1460317442991-0ec209397118?w=600&h=360&fit=crop", caption: "Facade — Main Entrance" },
    { uri: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600&h=360&fit=crop", caption: "Office Floor — Open Plan" },
    { uri: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=360&fit=crop", caption: "Board Room & Conference" },
    { uri: "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=600&h=360&fit=crop", caption: "Ground Floor — Retail" },
    { uri: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=360&fit=crop", caption: "Parking & Exit Ramp" },
  ],
};

type TabKey = "overview" | "documents" | "loans" | "activity" | "qr";

export default function PropertyDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { properties, auditLogs } = useData();
  const { user } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const property = properties.find((p) => p.id === id);
  if (!property) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground, padding: 20 }}>Property not found.</Text>
      </View>
    );
  }

  const propLogs = auditLogs.filter((l) => l.propertyId === property.id);

  const TABS: { key: TabKey; label: string; icon: string }[] = [
    { key: "overview", label: "Overview", icon: "home" },
    { key: "documents", label: "Docs", icon: "file-text" },
    { key: "loans", label: "Loans", icon: "credit-card" },
    { key: "activity", label: "Activity", icon: "activity" },
    { key: "qr", label: "QR Card", icon: "grid" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.navBg, paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.bpid}>{property.bpid}</Text>
          <Text style={styles.headerTitle}>
            {property.type.charAt(0).toUpperCase() + property.type.slice(1)} Property
          </Text>
        </View>
        <StatusBadge status={property.status} />
      </View>

      <View style={[styles.tabBar, { borderBottomColor: colors.border }]}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && { borderBottomColor: colors.primary }]}
            onPress={() => { setActiveTab(tab.key); Haptics.selectionAsync(); }}
          >
            <Feather name={tab.icon as any} size={13} color={activeTab === tab.key ? colors.primary : colors.mutedForeground} />
            <Text style={[styles.tabText, { color: activeTab === tab.key ? colors.primary : colors.mutedForeground }]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={[styles.body, { paddingBottom: botPad + 80 }]}>
        {activeTab === "overview" && <OverviewTab property={property} />}
        {activeTab === "documents" && <DocumentsTab property={property} />}
        {activeTab === "loans" && <LoansTab property={property} />}
        {activeTab === "activity" && <ActivityTab logs={propLogs} />}
        {activeTab === "qr" && <QRTab property={property} />}
      </ScrollView>

      {user?.role === "citizen" && user.id === property.ownerId && (
        <View style={[styles.actionBar, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: botPad + 10 }]}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.secondary }]} onPress={() => router.push("/raise-dispute" as any)}>
            <Feather name="alert-triangle" size={16} color={colors.destructive} />
            <Text style={[styles.actionBtnText, { color: colors.destructive }]}>Dispute</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.secondary }]} onPress={() => router.push("/apply-loan" as any)}>
            <Feather name="credit-card" size={16} color={colors.primary} />
            <Text style={[styles.actionBtnText, { color: colors.primary }]}>Apply Loan</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.primaryActionBtn, { backgroundColor: colors.primary }]} onPress={() => router.push("/transfer" as any)}>
            <Feather name="send" size={16} color="#fff" />
            <Text style={styles.primaryActionBtnText}>Transfer</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ─── Image Gallery ───────────────────────────────────────────────────────────
function ImageGallery({ type }: { type: string }) {
  const images = PROPERTY_IMAGES[type] || PROPERTY_IMAGES.flat;
  const scrollRef = useRef<ScrollView>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [zoom, setZoom] = useState(1);

  const handleScroll = (e: any) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / (SCREEN_W - 32));
    setActiveIdx(Math.max(0, Math.min(idx, images.length - 1)));
  };

  const scrollTo = (idx: number) => {
    scrollRef.current?.scrollTo({ x: idx * (SCREEN_W - 32), animated: true });
    setActiveIdx(idx);
    Haptics.selectionAsync();
  };

  return (
    <View style={galleryStyles.wrap}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {images.map((img, i) => (
          <View key={i} style={galleryStyles.slide}>
            <Image
              source={{ uri: img.uri }}
              style={[galleryStyles.img, { transform: [{ scale: zoom }] }]}
              resizeMode="cover"
            />
            <View style={galleryStyles.captionWrap}>
              <View style={galleryStyles.captionPill}>
                <Feather name="camera" size={10} color="#fff" />
                <Text style={galleryStyles.captionText}>{img.caption}</Text>
              </View>
            </View>
            <View style={galleryStyles.counterPill}>
              <Text style={galleryStyles.counterText}>{i + 1}/{images.length}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Zoom controls */}
      <View style={galleryStyles.zoomRow}>
        <TouchableOpacity
          style={[galleryStyles.zoomBtn, zoom <= 0.8 && { opacity: 0.4 }]}
          onPress={() => setZoom((z) => Math.max(0.8, +(z - 0.2).toFixed(1)))}
        >
          <Feather name="zoom-out" size={16} color="#fff" />
        </TouchableOpacity>
        <Text style={galleryStyles.zoomLabel}>{Math.round(zoom * 100)}%</Text>
        <TouchableOpacity
          style={[galleryStyles.zoomBtn, zoom >= 2 && { opacity: 0.4 }]}
          onPress={() => setZoom((z) => Math.min(2, +(z + 0.2).toFixed(1)))}
        >
          <Feather name="zoom-in" size={16} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Dot indicators */}
      <View style={galleryStyles.dots}>
        {images.map((_, i) => (
          <TouchableOpacity key={i} onPress={() => scrollTo(i)}>
            <View style={[galleryStyles.dot, i === activeIdx && galleryStyles.dotActive]} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Thumbnail strip */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={galleryStyles.thumbStrip}>
        {images.map((img, i) => (
          <TouchableOpacity key={i} onPress={() => scrollTo(i)} style={[galleryStyles.thumb, i === activeIdx && galleryStyles.thumbActive]}>
            <Image source={{ uri: img.uri }} style={galleryStyles.thumbImg} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────
function OverviewTab({ property }: { property: any }) {
  const colors = useColors();
  const infoRows = [
    { label: "Property Type", value: property.type.toUpperCase() },
    { label: "Area", value: property.area },
    { label: "Market Value", value: formatCurrency(property.value) },
    { label: "Owner", value: property.ownerName },
    { label: "Registered On", value: formatDate(property.registrationDate) },
    { label: "Legal Status", value: property.status.replace(/_/g, " ").toUpperCase() },
  ];
  const extendedRows = [
    { label: "Address", value: property.address },
    { label: "Building Name", value: property.buildingName || "Developer Registered Tower" },
    { label: "Building Unique ID", value: property.buildingId || property.bpid.replace("B-PID-", "BLD-") },
    { label: "Flat / Unit ID", value: property.flatId || "UNIT-A102" },
    { label: "Size in Sq Ft", value: property.sizeSqFt || "1,245 sq ft" },
    { label: "Size in Sq Mtr", value: property.sizeSqMtr || "115.7 sq m" },
    { label: "Size in Acre", value: property.sizeAcre || "0.028 acre" },
    { label: "AI Market Value", value: `₹${Math.round(property.value * 1.08).toLocaleString("en-IN")}` },
  ];
  const documentChecklist = [
    "Sale Deed / Conveyance Deed",
    "Layout Plan & Drawing Photos",
    "Occupancy / Completion Certificate",
    "Encumbrance Certificate",
    "Latest Property Tax Receipt",
    "Developer Allotment Letter / Flat ID",
    "Society / Builder NOC",
  ];

  return (
    <View style={{ gap: 16 }}>
      {/* 5-image gallery */}
      <ImageGallery type={property.type} />

      <PropertyHealthScore property={property} />

      <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Documents & Layout</Text>
        {documentChecklist.map((doc) => (
          <View key={doc} style={styles.docRow}>
            <Feather name="file-text" size={14} color={colors.primary} />
            <Text style={[styles.docText, { color: colors.foreground }]}>{doc}</Text>
          </View>
        ))}
        <View style={styles.layoutGrid}>
          {PROPERTY_IMAGES[property.type || "flat"].map((img) => (
            <View key={img.caption} style={styles.layoutCard}>
              <Image source={{ uri: img.uri }} style={styles.layoutImg} />
              <Text style={[styles.layoutCaption, { color: colors.mutedForeground }]}>{img.caption}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Location</Text>
        <View style={styles.addressRow}>
          <Feather name="map-pin" size={16} color={colors.primary} />
          <Text style={[styles.address, { color: colors.foreground }]}>{property.address}</Text>
        </View>
      </View>

      <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Property Details</Text>
        {infoRows.map((row, i) => (
          <View key={row.label} style={[styles.infoRow, i < infoRows.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
            <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{row.label}</Text>
            <Text style={[styles.infoValue, { color: colors.foreground }]}>{row.value}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Extended Measurements</Text>
        {extendedRows.map((row, i) => (
          <View key={row.label} style={[styles.infoRow, i < extendedRows.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
            <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{row.label}</Text>
            <Text style={[styles.infoValue, { color: colors.foreground }]}>{row.value}</Text>
          </View>
        ))}
      </View>

      {property.loanStatus && property.loanStatus !== "none" && (
        <View style={[styles.sectionCard, { backgroundColor: "#eff6ff", borderColor: "#bfdbfe" }]}>
          <Text style={[styles.sectionTitle, { color: "#1e40af" }]}>Active Loan</Text>
          <Text style={{ color: "#1e40af", fontWeight: "600", fontSize: 15 }}>{property.loanBank}</Text>
          <Text style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>
            Outstanding: {formatCurrency(property.loanAmount)}
          </Text>
          <StatusBadge status={property.loanStatus} />
        </View>
      )}
    </View>
  );
}

// ─── Documents Tab ────────────────────────────────────────────────────────────
function DocumentsTab({ property }: { property: any }) {
  const colors = useColors();
  const DOC_ICONS: Record<string, string> = { verified: "check-circle", pending: "clock", rejected: "x-circle" };
  const DOC_COLORS: Record<string, string> = { verified: "#16a34a", pending: "#d97706", rejected: "#dc2626" };
  return (
    <View style={{ gap: 12 }}>
      {property.documents.map((doc: any) => (
        <View key={doc.id} style={[styles.docCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.docIcon, { backgroundColor: colors.accent }]}>
            <Feather name="file-text" size={20} color={colors.primary} />
          </View>
          <View style={styles.docContent}>
            <Text style={[styles.docType, { color: colors.foreground }]}>{doc.docType}</Text>
            <Text style={[styles.docDate, { color: colors.mutedForeground }]}>Uploaded: {formatDate(doc.uploadedOn)}</Text>
          </View>
          <View style={styles.docStatus}>
            <Feather name={DOC_ICONS[doc.verifiedStatus] as any} size={18} color={DOC_COLORS[doc.verifiedStatus]} />
            <Text style={[styles.docStatusText, { color: DOC_COLORS[doc.verifiedStatus] }]}>{doc.verifiedStatus}</Text>
          </View>
        </View>
      ))}
      {property.documents.length === 0 && (
        <View style={styles.empty}>
          <Feather name="file-text" size={32} color="#94a3b8" />
          <Text style={{ color: "#94a3b8" }}>No documents uploaded</Text>
        </View>
      )}
    </View>
  );
}

// ─── Loans Tab ────────────────────────────────────────────────────────────────
function LoansTab({ property }: { property: any }) {
  const colors = useColors();
  if (!property.loanStatus || property.loanStatus === "none") {
    return (
      <View style={styles.empty}>
        <Feather name="credit-card" size={32} color={colors.mutedForeground} />
        <Text style={{ color: colors.mutedForeground }}>No loan against this property</Text>
      </View>
    );
  }
  return (
    <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.infoRow}>
        <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Bank</Text>
        <Text style={[styles.infoValue, { color: colors.foreground }]}>{property.loanBank}</Text>
      </View>
      <View style={[styles.infoRow, { borderTopColor: colors.border, borderTopWidth: 1 }]}>
        <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Loan Amount</Text>
        <Text style={[styles.infoValue, { color: colors.primary }]}>{formatCurrency(property.loanAmount)}</Text>
      </View>
      <View style={[styles.infoRow, { borderTopColor: colors.border, borderTopWidth: 1 }]}>
        <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Status</Text>
        <StatusBadge status={property.loanStatus} size="sm" />
      </View>
    </View>
  );
}

// ─── Activity Tab ─────────────────────────────────────────────────────────────
function ActivityTab({ logs }: { logs: any[] }) {
  const colors = useColors();
  if (logs.length === 0) {
    return (
      <View style={styles.empty}>
        <Feather name="activity" size={32} color={colors.mutedForeground} />
        <Text style={{ color: colors.mutedForeground }}>No activity recorded</Text>
      </View>
    );
  }
  return (
    <View style={{ gap: 0 }}>
      {logs.map((log, i) => (
        <View key={log.id} style={styles.logRow}>
          <View style={styles.logLine}>
            <View style={[styles.logDot, { backgroundColor: colors.primary }]} />
            {i < logs.length - 1 && <View style={[styles.logConnector, { backgroundColor: colors.border }]} />}
          </View>
          <View style={[styles.logContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.logAction, { color: colors.foreground }]}>{log.action}</Text>
            <Text style={[styles.logMeta, { color: colors.mutedForeground }]}>{log.metadata}</Text>
            <Text style={[styles.logUser, { color: colors.mutedForeground }]}>{log.userName} • {formatDate(log.timestamp)}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

// ─── QR Tab — Real Scannable QR ──────────────────────────────────────────────
function QRTab({ property }: { property: any }) {
  const colors = useColors();

  // Build a meaningful BUID — structured for explanation
  // Format: BPCS://VERIFY/<STATE>/<TYPE>/<SERIAL>?params
  const typeCode = property.type === "flat" ? "F" : property.type === "land" ? "L" : "C";
  const valueInLakh = Math.round(property.value / 100000);
  const buidStructured = `${property.bpid}-${typeCode}`;

  // QR encodes a full verification URL with all property details
  const qrPayload = [
    `BPCS://VERIFY`,
    `BUID:${property.bpid}`,
    `TYPE:${property.type.toUpperCase()}`,
    `OWNER:${property.ownerName}`,
    `AREA:${property.area}`,
    `VALUE:${valueInLakh}L`,
    `STATUS:${property.status.toUpperCase()}`,
    `EC:CLEAR`,
    `REG:${formatDate(property.registrationDate)}`,
    property.loanStatus && property.loanStatus !== "none" ? `LOAN:${property.loanBank}` : `LOAN:NIL`,
    `VERIFY:bpcs.gov.in/v/${property.bpid}`,
  ].join("|");

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=1e3a8a&bgcolor=ffffff&data=${encodeURIComponent(qrPayload)}&format=png&qzone=2`;

  return (
    <View style={{ gap: 16 }}>
      {/* Certificate Card */}
      <View style={[styles.certCard, { backgroundColor: "#1e3a8a" }]}>
        <View style={styles.certHeader}>
          <View style={styles.certEmblem}>
            <Feather name="shield" size={18} color="#f97316" />
          </View>
          <View>
            <Text style={styles.certTitle}>BHARAT PROPERTY CARD</Text>
            <Text style={styles.certSubtitle}>Ministry of Housing · RERAW Act 2026</Text>
          </View>
        </View>
        <View style={styles.certDivider} />

        {/* Structured BUID explanation */}
        <View style={styles.buidExplain}>
          <Text style={styles.certBpid}>{buidStructured}</Text>
          <View style={styles.buidBreakRow}>
            <BUIDPart label="B-PID" desc="Bharat Property ID" color="#f97316" />
            <BUIDPart label="MH" desc="State: Maharashtra" color="#34d399" />
            <BUIDPart label="2026" desc="Year Registered" color="#a78bfa" />
            <BUIDPart label="001" desc="Serial No." color="#fbbf24" />
            <BUIDPart label={typeCode} desc={property.type === "flat" ? "Flat" : property.type === "land" ? "Land" : "Commercial"} color="#60a5fa" />
          </View>
        </View>

        <Text style={styles.certAddress} numberOfLines={2}>{property.address}</Text>
        <View style={styles.certRow}>
          <View>
            <Text style={styles.certMetaLabel}>Owner</Text>
            <Text style={styles.certMetaValue}>{property.ownerName}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.certMetaLabel}>Registered Value</Text>
            <Text style={styles.certMetaValue}>{formatCurrency(property.value)}</Text>
          </View>
        </View>
      </View>

      {/* Real QR Code */}
      <View style={[styles.qrCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.qrTitle, { color: colors.mutedForeground }]}>SCAN TO VERIFY — REAL QR CODE</Text>
        <View style={styles.qrImageWrap}>
          <Image
            source={{ uri: qrUrl }}
            style={styles.qrImage}
            resizeMode="contain"
          />
          <View style={styles.qrBadgeOverlay}>
            <Feather name="shield" size={10} color="#f97316" />
            <Text style={styles.qrBadgeText}>BPCS VERIFIED</Text>
          </View>
        </View>
        <Text style={[styles.qrBpid, { color: "#1e3a8a" }]}>{buidStructured}</Text>
        <Text style={[styles.qrScan, { color: colors.mutedForeground }]}>
          Scan with any QR reader — reveals ownership, legal status, EC, value & loan details
        </Text>
        <TouchableOpacity
          style={[styles.shareBtn, { backgroundColor: "#1e3a8a" }]}
          onPress={() => Alert.alert("QR Shared ✓", "QR code and BUID link sent via WhatsApp. Buyer can scan to verify before purchase.", [{ text: "OK" }])}
        >
          <Feather name="share-2" size={14} color="#fff" />
          <Text style={styles.shareBtnText}>Share QR with Buyer</Text>
        </TouchableOpacity>
      </View>

      {/* What QR reveals */}
      <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>What This QR Reveals When Scanned</Text>
        <QuickVerifyRow icon="user" label="Owner Name" value={property.ownerName} />
        <QuickVerifyRow icon="shield" label="Legal Status" value={property.status.replace(/_/g, " ").toUpperCase()} />
        <QuickVerifyRow icon="file-text" label="EC Status" value="CLEAR — No Encumbrance" />
        <QuickVerifyRow icon="map-pin" label="Location" value={property.address.split(",").slice(-2).join(",").trim()} />
        <QuickVerifyRow icon="trending-up" label="Registered Value" value={formatCurrency(property.value)} />
        <QuickVerifyRow icon="credit-card" label="Loan Status" value={property.loanStatus === "active" ? `Active — ${property.loanBank}` : "No Loan"} />
        <QuickVerifyRow icon="calendar" label="Reg. Date" value={formatDate(property.registrationDate)} />
      </View>

      {/* Verification URL */}
      <View style={[styles.sectionCard, { backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" }]}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Feather name="globe" size={14} color="#16a34a" />
          <Text style={{ color: "#16a34a", fontSize: 12, fontWeight: "700" }}>Public Verification URL</Text>
        </View>
        <Text style={{ color: "#15803d", fontSize: 11, fontFamily: "monospace", marginTop: 4, lineHeight: 16 }}>
          bpcs.gov.in/verify/{property.bpid}
        </Text>
        <Text style={{ color: "#64748b", fontSize: 10, marginTop: 4 }}>
          Anyone can verify this property's authenticity using this URL — no login required.
        </Text>
      </View>
    </View>
  );
}

function BUIDPart({ label, desc, color }: { label: string; desc: string; color: string }) {
  return (
    <View style={{ alignItems: "center", gap: 2 }}>
      <View style={[styles.buidPart, { borderColor: color }]}>
        <Text style={[styles.buidPartLabel, { color }]}>{label}</Text>
      </View>
      <Text style={styles.buidPartDesc}>{desc}</Text>
    </View>
  );
}

function QuickVerifyRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  const colors = useColors();
  return (
    <View style={[styles.verifyRow, { borderBottomColor: colors.border }]}>
      <Feather name={icon as any} size={14} color={colors.primary} />
      <Text style={[styles.verifyLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.verifyValue, { color: colors.foreground }]}>{value}</Text>
    </View>
  );
}

const galleryStyles = StyleSheet.create({
  wrap: { borderRadius: 14, overflow: "hidden", backgroundColor: "#0f172a" },
  slide: { width: SCREEN_W - 32, height: 220, position: "relative" },
  img: { width: "100%", height: "100%" },
  captionWrap: { position: "absolute", bottom: 40, left: 10, right: 10 },
  captionPill: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(0,0,0,0.65)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, alignSelf: "flex-start" },
  captionText: { color: "#fff", fontSize: 10, fontWeight: "600" },
  counterPill: { position: "absolute", top: 10, right: 10, backgroundColor: "rgba(0,0,0,0.6)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  counterText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  zoomRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12, paddingVertical: 8, backgroundColor: "#0f172a" },
  zoomBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  zoomLabel: { color: "#fff", fontSize: 12, fontWeight: "700", minWidth: 40, textAlign: "center" },
  dots: { flexDirection: "row", justifyContent: "center", gap: 6, paddingVertical: 6, backgroundColor: "#0f172a" },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.3)" },
  dotActive: { backgroundColor: "#f97316", width: 18 },
  thumbStrip: { paddingHorizontal: 8, paddingVertical: 8, backgroundColor: "#0f172a" },
  thumb: { width: 56, height: 42, borderRadius: 8, marginRight: 6, overflow: "hidden", borderWidth: 2, borderColor: "transparent" },
  thumbActive: { borderColor: "#f97316" },
  thumbImg: { width: "100%", height: "100%" },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "flex-end", paddingHorizontal: 16, paddingBottom: 16, gap: 12 },
  backBtn: { padding: 4 },
  headerContent: { flex: 1 },
  bpid: { color: "#94a3b8", fontSize: 11, fontWeight: "600", letterSpacing: 0.5 },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "700", marginTop: 2 },
  tabBar: { flexDirection: "row", borderBottomWidth: 1 },
  tab: { flex: 1, flexDirection: "column", alignItems: "center", gap: 3, paddingVertical: 9, borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabText: { fontSize: 10, fontWeight: "600" },
  body: { padding: 16, gap: 16 },
  sectionCard: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 12 },
  sectionTitle: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1 },
  addressRow: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
  address: { flex: 1, fontSize: 14, lineHeight: 20 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10 },
  infoLabel: { fontSize: 13 },
  infoValue: { fontSize: 13, fontWeight: "600", textAlign: "right", flex: 1, marginLeft: 12 },
  docCard: { flexDirection: "row", alignItems: "center", borderRadius: 12, borderWidth: 1, padding: 12, gap: 12 },
  docIcon: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  docContent: { flex: 1 },
  docType: { fontSize: 14, fontWeight: "600" },
  docDate: { fontSize: 11, marginTop: 2 },
  docStatus: { alignItems: "center", gap: 2 },
  docStatusText: { fontSize: 10, fontWeight: "600", textTransform: "capitalize" },
  empty: { alignItems: "center", paddingVertical: 48, gap: 10 },
  logRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  logLine: { alignItems: "center", width: 16 },
  logDot: { width: 12, height: 12, borderRadius: 6, marginTop: 14 },
  logConnector: { width: 2, flex: 1, marginTop: 4 },
  logContent: { flex: 1, borderRadius: 10, borderWidth: 1, padding: 12, gap: 4 },
  logAction: { fontSize: 13, fontWeight: "700" },
  logMeta: { fontSize: 12, lineHeight: 16 },
  logUser: { fontSize: 11 },
  actionBar: { flexDirection: "row", gap: 10, paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1 },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12, borderRadius: 10 },
  actionBtnText: { fontSize: 13, fontWeight: "600" },
  primaryActionBtn: { flex: 2, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12, borderRadius: 10 },
  primaryActionBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  // Certificate
  certCard: { borderRadius: 16, padding: 20, gap: 10 },
  certHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  certEmblem: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  certTitle: { color: "#fff", fontSize: 13, fontWeight: "800", letterSpacing: 1.5 },
  certSubtitle: { color: "rgba(255,255,255,0.6)", fontSize: 10, marginTop: 2 },
  certDivider: { height: 1, backgroundColor: "rgba(255,255,255,0.2)" },
  certBpid: { color: "#f97316", fontSize: 16, fontWeight: "800", letterSpacing: 1 },
  certAddress: { color: "rgba(255,255,255,0.8)", fontSize: 12, lineHeight: 17 },
  certRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  certMetaLabel: { color: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: "600", textTransform: "uppercase" },
  certMetaValue: { color: "#fff", fontSize: 13, fontWeight: "700", marginTop: 2 },
  buidExplain: { gap: 8 },
  buidBreakRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  buidPart: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3 },
  buidPartLabel: { fontSize: 10, fontWeight: "800" },
  buidPartDesc: { color: "rgba(255,255,255,0.5)", fontSize: 8, textAlign: "center" },
  // QR
  qrCard: { borderRadius: 12, borderWidth: 1, padding: 16, alignItems: "center", gap: 12 },
  qrTitle: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1 },
  qrImageWrap: { position: "relative", padding: 8, backgroundColor: "#fff", borderRadius: 12, borderWidth: 2, borderColor: "#1e3a8a" },
  qrImage: { width: 180, height: 180 },
  qrBadgeOverlay: { position: "absolute", bottom: -10, left: "50%", transform: [{ translateX: -45 }], flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#1e3a8a", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  qrBadgeText: { color: "#fff", fontSize: 9, fontWeight: "800", letterSpacing: 0.5 },
  qrBpid: { fontSize: 13, fontWeight: "800", letterSpacing: 1, textAlign: "center", marginTop: 6 },
  qrScan: { fontSize: 11, textAlign: "center", lineHeight: 16 },
  shareBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, marginTop: 4 },
  shareBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  verifyRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 9, borderBottomWidth: 1 },
  verifyLabel: { fontSize: 12, width: 110 },
  verifyValue: { flex: 1, fontSize: 12, fontWeight: "600", textAlign: "right" },
});
