import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";
import { formatDate } from "@/utils/format";

export default function DocVerifyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { properties } = useData();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const allDocs = properties.flatMap((p) =>
    p.documents.map((d) => ({ ...d, property: p }))
  );
  const pendingDocs = allDocs.filter((d) => d.verifiedStatus === "pending");

  const handleVerify = (docId: string, docType: string) => {
    Alert.alert("Verify Document", `Mark "${docType}" as verified?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Verify",
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Alert.alert("Verified", "Document has been marked as verified.");
        },
      },
    ]);
  };

  const handleReject = (docId: string, docType: string) => {
    Alert.alert("Reject Document", `Reject "${docType}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reject",
        style: "destructive",
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          Alert.alert("Rejected", "Document has been rejected.");
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.navBg, paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Document Verification</Text>
        {pendingDocs.length > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{pendingDocs.length}</Text>
          </View>
        )}
      </View>

      <FlatList
        data={allDocs}
        keyExtractor={(d) => d.id}
        renderItem={({ item }) => {
          const isPending = item.verifiedStatus === "pending";
          return (
            <View style={[
              styles.docCard,
              { backgroundColor: isPending ? "#fef9c3" : colors.card, borderColor: isPending ? "#fef08a" : colors.border },
            ]}>
              <View style={styles.docHeader}>
                <View style={[styles.docIcon, { backgroundColor: colors.accent }]}>
                  <Feather name="file-text" size={18} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.docType, { color: colors.foreground }]}>{item.docType}</Text>
                  <Text style={[styles.propBpid, { color: colors.mutedForeground }]}>{item.property.bpid}</Text>
                  <Text style={[styles.propAddr, { color: colors.mutedForeground }]} numberOfLines={1}>
                    {item.property.address}
                  </Text>
                </View>
                <View style={[styles.statusTag, {
                  backgroundColor: item.verifiedStatus === "verified" ? "#dcfce7" : item.verifiedStatus === "pending" ? "#fef9c3" : "#fee2e2"
                }]}>
                  <Text style={{
                    color: item.verifiedStatus === "verified" ? "#16a34a" : item.verifiedStatus === "pending" ? "#a16207" : "#dc2626",
                    fontSize: 11, fontWeight: "700"
                  }}>
                    {item.verifiedStatus.toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text style={[styles.uploaded, { color: colors.mutedForeground }]}>
                Uploaded: {formatDate(item.uploadedOn)}
              </Text>

              {isPending && (
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.rejectBtn]}
                    onPress={() => handleReject(item.id, item.docType)}
                  >
                    <Feather name="x" size={14} color="#dc2626" />
                    <Text style={{ color: "#dc2626", fontWeight: "600", fontSize: 13 }}>Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.verifyBtn}
                    onPress={() => handleVerify(item.id, item.docType)}
                  >
                    <Feather name="check" size={14} color="#fff" />
                    <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>Verify</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        }}
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
  badge: { backgroundColor: "#f97316", borderRadius: 12, minWidth: 24, height: 24, alignItems: "center", justifyContent: "center", paddingHorizontal: 6 },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  list: { padding: 16, gap: 12 },
  docCard: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 10 },
  docHeader: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  docIcon: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  docType: { fontSize: 14, fontWeight: "700" },
  propBpid: { fontSize: 10, fontWeight: "600", marginTop: 2 },
  propAddr: { fontSize: 12, marginTop: 1 },
  statusTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  uploaded: { fontSize: 12 },
  actions: { flexDirection: "row", gap: 10 },
  rejectBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderWidth: 1, borderColor: "#dc2626", borderRadius: 8, paddingVertical: 8 },
  verifyBtn: { flex: 2, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "#16a34a", borderRadius: 8, paddingVertical: 8 },
});
