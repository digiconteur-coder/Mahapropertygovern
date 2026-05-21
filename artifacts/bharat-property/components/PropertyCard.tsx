import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { Property } from "@/context/DataContext";
import { StatusBadge } from "./StatusBadge";
import { formatCurrency } from "@/utils/format";
import { getHealthScore } from "./PropertyHealthScore";

interface PropertyCardProps {
  property: Property;
  onPress?: () => void;
}

const TYPE_IMAGES: Record<string, string[]> = {
  flat: [
    "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=600&h=250&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&h=250&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=600&h=250&fit=crop&crop=center",
  ],
  land: [
    "https://images.unsplash.com/photo-1460317442991-0ec209397118?w=600&h=250&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=250&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=250&fit=crop&crop=center",
  ],
  commercial: [
    "https://images.unsplash.com/photo-1460317442991-0ec209397118?w=600&h=250&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=250&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=250&fit=crop&crop=center",
  ],
};

const TYPE_CONFIG: Record<string, { bg: string; accent: string; label: string }> = {
  flat: { bg: "#1e3a8a", accent: "#60a5fa", label: "RESIDENTIAL FLAT" },
  land: { bg: "#14532d", accent: "#4ade80", label: "LAND PLOT" },
  commercial: { bg: "#7c2d12", accent: "#fb923c", label: "COMMERCIAL" },
};

function pickImage(type: string, id: string): string {
  const arr = TYPE_IMAGES[type] || TYPE_IMAGES.flat;
  const idx = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % arr.length;
  return arr[idx];
}

export function PropertyCard({ property, onPress }: PropertyCardProps) {
  const colors = useColors();
  const cfg = TYPE_CONFIG[property.type] || TYPE_CONFIG.flat;
  const imageUrl = pickImage(property.type, property.id);
  const [imgError, setImgError] = useState(false);
  const health = getHealthScore(property);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {/* Property Photo */}
      <View style={styles.imageWrap}>
        {!imgError ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            onError={() => setImgError(true)}
            resizeMode="cover"
          />
        ) : (
          <FallbackVisual type={property.type} cfg={cfg} />
        )}
        {/* Overlay gradient + badges */}
        <View style={[styles.imageOverlay, { backgroundColor: cfg.bg + "88" }]}>
          <View style={styles.imageTop}>
            <View style={[styles.typePill, { backgroundColor: cfg.bg }]}>
              <Text style={[styles.typePillText, { color: cfg.accent }]}>{cfg.label}</Text>
            </View>
            <StatusBadge status={property.status} size="sm" />
          </View>
          <View style={styles.imageBottom}>
            <Text style={[styles.imageBpid, { color: cfg.accent }]}>{property.bpid}</Text>
            <Text style={styles.imageValue}>{formatCurrency(property.value)}</Text>
          </View>
        </View>
        {/* Photo count pill */}
        <View style={styles.photoPill}>
          <Feather name="camera" size={10} color="#fff" />
          <Text style={styles.photoPillText}>5 Photos</Text>
        </View>
        {/* Health Grade Badge — top right overlay */}
        <View style={[styles.healthGradeBadge, { backgroundColor: health.color }]}>
          <Text style={styles.healthGradeText}>{health.grade}</Text>
        </View>
      </View>

      {/* Card Content */}
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={[styles.type, { color: colors.foreground }]} numberOfLines={1}>
            {property.type.charAt(0).toUpperCase() + property.type.slice(1)} Property
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            {property.loanStatus && property.loanStatus !== "none" && (
              <View style={styles.loanBadge}>
                <Feather name="credit-card" size={10} color="#1d4ed8" />
                <Text style={styles.loanBadgeText}>Loan</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.addrRow}>
          <Feather name="map-pin" size={11} color={colors.mutedForeground} />
          <Text style={[styles.address, { color: colors.mutedForeground }]} numberOfLines={1}>{property.address}</Text>
        </View>

        {/* Health Score inline row */}
        <View style={[styles.healthRow, { backgroundColor: health.bgColor, borderColor: health.borderColor }]}>
          <Feather name={health.icon as any} size={11} color={health.color} />
          <Text style={[styles.healthGradeInline, { color: health.color }]}>{health.grade}</Text>
          <Text style={[styles.healthLabel, { color: health.color }]}>{health.label}</Text>
          <View style={styles.healthBar}>
            <View style={[styles.healthBarFill, { width: `${health.score}%` as any, backgroundColor: health.color }]} />
          </View>
          <Text style={[styles.healthScore, { color: health.color }]}>{health.score}/100</Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.metaItem}>
            <Feather name="maximize-2" size={11} color={colors.mutedForeground} />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{property.area}</Text>
          </View>
          <View style={styles.metaItem}>
            <Feather name="calendar" size={11} color={colors.mutedForeground} />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
              {new Date(property.registrationDate).getFullYear()}
            </Text>
          </View>
          <View style={[styles.viewBtn, { backgroundColor: cfg.bg }]}>
            <Text style={styles.viewBtnText}>View</Text>
            <Feather name="chevron-right" size={12} color="#fff" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function FallbackVisual({ type, cfg }: { type: string; cfg: any }) {
  return (
    <View style={[styles.fallback, { backgroundColor: cfg.bg }]}>
      {type === "flat" && (
        <View style={styles.buildingWrap}>
          {[0, 1, 2, 3].map((floor) => (
            <View key={floor} style={styles.buildingFloor}>
              {[0, 1, 2, 3].map((win) => (
                <View key={win} style={[styles.window, { backgroundColor: (floor + win) % 3 === 0 ? cfg.accent : "rgba(255,255,255,0.15)" }]} />
              ))}
            </View>
          ))}
        </View>
      )}
      {type === "land" && (
        <View style={styles.landWrap}>
          {[...Array(5)].map((_, i) => (
            <View key={i} style={[styles.landLine, { backgroundColor: cfg.accent, opacity: 0.15 + i * 0.12 }]} />
          ))}
          <View style={[styles.landBoundary, { borderColor: cfg.accent }]} />
        </View>
      )}
      {type === "commercial" && (
        <View style={styles.buildingWrap}>
          {[0, 1, 2, 3, 4, 5].map((floor) => (
            <View key={floor} style={styles.buildingFloor}>
              {[0, 1, 2].map((win) => (
                <View key={win} style={[styles.commWindow, { backgroundColor: (floor * 3 + win) % 4 === 0 ? cfg.accent : "rgba(255,255,255,0.12)" }]} />
              ))}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1, marginBottom: 14, overflow: "hidden" },
  imageWrap: { height: 160, position: "relative" },
  image: { width: "100%", height: "100%" },
  fallback: { width: "100%", height: "100%", alignItems: "center", justifyContent: "flex-end" },
  imageOverlay: {
    position: "absolute", inset: 0,
    justifyContent: "space-between", padding: 12,
  },
  imageTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  imageBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  typePill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  typePillText: { fontSize: 9, fontWeight: "800", letterSpacing: 1 },
  imageBpid: { fontSize: 11, fontWeight: "800", letterSpacing: 0.5 },
  imageValue: { color: "#fff", fontSize: 16, fontWeight: "800" },
  photoPill: { position: "absolute", bottom: 10, right: 42, flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "rgba(0,0,0,0.5)", paddingHorizontal: 7, paddingVertical: 3, borderRadius: 10 },
  photoPillText: { color: "#fff", fontSize: 9, fontWeight: "600" },
  healthGradeBadge: { position: "absolute", bottom: 8, right: 8, width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#fff" },
  healthGradeText: { color: "#fff", fontSize: 13, fontWeight: "800" },
  content: { padding: 12, gap: 6 },
  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  type: { fontSize: 14, fontWeight: "700" },
  loanBadge: { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "#dbeafe", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  loanBadgeText: { color: "#1d4ed8", fontSize: 9, fontWeight: "700" },
  addrRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  address: { fontSize: 12, flex: 1 },
  healthRow: { flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 8, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 5 },
  healthGradeInline: { fontSize: 12, fontWeight: "800" },
  healthLabel: { fontSize: 10, fontWeight: "600" },
  healthBar: { flex: 1, height: 4, backgroundColor: "rgba(0,0,0,0.08)", borderRadius: 2, overflow: "hidden" },
  healthBarFill: { height: 4, borderRadius: 2 },
  healthScore: { fontSize: 9, fontWeight: "700" },
  footer: { flexDirection: "row", alignItems: "center", gap: 10 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 3 },
  metaText: { fontSize: 11 },
  viewBtn: { marginLeft: "auto", flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  viewBtnText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  buildingWrap: { gap: 3, paddingHorizontal: 24, paddingBottom: 12 },
  buildingFloor: { flexDirection: "row", gap: 4, justifyContent: "center" },
  window: { width: 18, height: 14, borderRadius: 2 },
  commWindow: { width: 14, height: 10, borderRadius: 1 },
  landWrap: { position: "absolute", inset: 0, justifyContent: "center", alignItems: "center" },
  landLine: { height: 1, width: "80%", marginVertical: 5 },
  landBoundary: { position: "absolute", width: "70%", height: "60%", borderWidth: 1.5, borderStyle: "dashed", borderRadius: 4 },
});
