import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBadge } from "@/components/StatusBadge";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";
import { formatCurrency } from "@/utils/format";

const STATUS_FILTERS = ["All", "available", "booked", "sold"];

export default function InventoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { units, projects } = useData();
  const [filter, setFilter] = useState("All");
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const myUnits = units.filter((u) => projects.find((p) => p.id === u.projectId)?.developerId === "USR003");
  const filtered = filter === "All" ? myUnits : myUnits.filter((u) => u.status === filter);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.navBg, paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Unit Inventory</Text>
        <Text style={styles.count}>{filtered.length} units</Text>
      </View>

      <View style={styles.filterRow}>
        {STATUS_FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.chip, { backgroundColor: filter === f ? colors.primary : colors.secondary }]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.chipText, { color: filter === f ? "#fff" : colors.foreground }]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(u) => u.id}
        renderItem={({ item }) => (
          <View style={[styles.unitCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.unitHeader}>
              <View>
                <Text style={[styles.unitId, { color: colors.mutedForeground }]}>{item.unitId}</Text>
                <Text style={[styles.projName, { color: colors.foreground }]}>{item.projectName}</Text>
              </View>
              <StatusBadge status={item.status} size="sm" />
            </View>
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Feather name="grid" size={12} color={colors.mutedForeground} />
                <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{item.type}</Text>
              </View>
              <View style={styles.metaItem}>
                <Feather name="maximize-2" size={12} color={colors.mutedForeground} />
                <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{item.size} sq ft</Text>
              </View>
              <View style={styles.metaItem}>
                <Feather name="layers" size={12} color={colors.mutedForeground} />
                <Text style={[styles.metaText, { color: colors.mutedForeground }]}>Floor {item.floor}</Text>
              </View>
            </View>
            <View style={styles.priceRow}>
              <Text style={[styles.price, { color: colors.primary }]}>{formatCurrency(item.price)}</Text>
              {item.ownerName && (
                <Text style={[styles.owner, { color: colors.mutedForeground }]}>Owner: {item.ownerName}</Text>
              )}
            </View>
          </View>
        )}
        contentContainerStyle={[styles.list, { paddingBottom: botPad + 24 }]}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingBottom: 16 },
  title: { color: "#fff", fontSize: 18, fontWeight: "700", flex: 1 },
  count: { color: "#94a3b8", fontSize: 14 },
  filterRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingVertical: 10, flexWrap: "wrap" },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  chipText: { fontSize: 13, fontWeight: "600" },
  list: { padding: 16, gap: 12 },
  unitCard: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 10 },
  unitHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  unitId: { fontSize: 11, fontWeight: "600" },
  projName: { fontSize: 14, fontWeight: "700", marginTop: 2 },
  metaRow: { flexDirection: "row", gap: 14 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12 },
  priceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  price: { fontSize: 17, fontWeight: "700" },
  owner: { fontSize: 12 },
});
