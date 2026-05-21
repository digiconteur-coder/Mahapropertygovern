import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";

export default function CoOwnerScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { properties } = useData();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const myProperties = properties.filter((p) => p.ownerId === user?.id && p.status === "verified");
  const [selectedPropId, setSelectedPropId] = useState("");
  const [coOwnerName, setCoOwnerName] = useState("");
  const [coOwnerPhone, setCoOwnerPhone] = useState("");
  const [coOwnerAadhaar, setCoOwnerAadhaar] = useState("");
  const [percent, setPercent] = useState("50");

  const handleSubmit = () => {
    if (!selectedPropId || !coOwnerName || !coOwnerPhone || !coOwnerAadhaar) {
      Alert.alert("Incomplete", "Please fill all required fields.");
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      "Co-Owner Request Submitted",
      `A co-ownership request for ${percent}% share has been submitted for government approval.\n\nThis will require verification by the Sub-Registrar's office.`,
      [{ text: "Done", onPress: () => router.back() }]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.navBg, paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="x" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Add Co-Owner</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.body, { paddingBottom: botPad + 80 }]} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Select Property</Text>
        {myProperties.map((p) => (
          <TouchableOpacity
            key={p.id}
            style={[styles.card, { backgroundColor: colors.card, borderColor: selectedPropId === p.id ? colors.primary : colors.border }]}
            onPress={() => { setSelectedPropId(p.id); Haptics.selectionAsync(); }}
          >
            <Text style={[styles.bpid, { color: colors.mutedForeground }]}>{p.bpid}</Text>
            <Text style={[styles.addr, { color: colors.foreground }]} numberOfLines={1}>{p.address}</Text>
          </TouchableOpacity>
        ))}

        <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Co-Owner Details</Text>
        <View style={{ gap: 12 }}>
          {[
            { label: "Full Name", value: coOwnerName, set: setCoOwnerName, placeholder: "As per Aadhaar", keyboard: "default" },
            { label: "Mobile Number", value: coOwnerPhone, set: setCoOwnerPhone, placeholder: "10-digit", keyboard: "phone-pad" },
            { label: "Aadhaar Number", value: coOwnerAadhaar, set: setCoOwnerAadhaar, placeholder: "12-digit Aadhaar", keyboard: "number-pad" },
          ].map((f) => (
            <View key={f.label}>
              <Text style={[styles.label, { color: colors.foreground }]}>{f.label}</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.secondary }]}
                value={f.value}
                onChangeText={f.set}
                placeholder={f.placeholder}
                placeholderTextColor={colors.mutedForeground}
                keyboardType={f.keyboard as any}
              />
            </View>
          ))}
          <View>
            <Text style={[styles.label, { color: colors.foreground }]}>Ownership Percentage (%)</Text>
            <View style={styles.percentRow}>
              {["25", "33", "50"].map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.percentChip, { backgroundColor: percent === p ? colors.primary : colors.secondary }]}
                  onPress={() => setPercent(p)}
                >
                  <Text style={{ color: percent === p ? "#fff" : colors.foreground, fontWeight: "700" }}>{p}%</Text>
                </TouchableOpacity>
              ))}
              <TextInput
                style={[styles.percentInput, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.secondary }]}
                value={percent}
                onChangeText={setPercent}
                keyboardType="number-pad"
                maxLength={3}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: botPad + 10 }]}>
        <TouchableOpacity style={[styles.submitBtn, { backgroundColor: "#059669" }]} onPress={handleSubmit}>
          <Feather name="user-plus" size={18} color="#fff" />
          <Text style={styles.submitText}>Submit Request</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingBottom: 16 },
  title: { color: "#fff", fontSize: 18, fontWeight: "700" },
  body: { padding: 16, gap: 14 },
  sectionLabel: { fontSize: 16, fontWeight: "700" },
  card: { borderRadius: 12, borderWidth: 1.5, padding: 12 },
  bpid: { fontSize: 10, fontWeight: "600" },
  addr: { fontSize: 14, fontWeight: "600", marginTop: 2 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, height: 48, fontSize: 15 },
  percentRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  percentChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  percentInput: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, height: 42, width: 60, fontSize: 15, textAlign: "center" },
  footer: { paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1 },
  submitBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 52, borderRadius: 12 },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
