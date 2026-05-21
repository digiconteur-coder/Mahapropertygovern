import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";
import { generateId } from "@/utils/format";

const PROJECT_TYPES = ["Residential", "Commercial", "Mixed Use", "Township", "Affordable Housing"];

export default function NewProjectScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [projectName, setProjectName] = useState("");
  const [location, setLocation] = useState("");
  const [projectType, setProjectType] = useState("");
  const [totalUnits, setTotalUnits] = useState("");
  const [price, setPrice] = useState("");
  const [completionDate, setCompletionDate] = useState("");

  const handleSubmit = () => {
    if (!projectName || !location || !projectType || !totalUnits) {
      Alert.alert("Incomplete", "Please fill all required fields.");
      return;
    }
    const bbid = `B-BID-${location.substring(0, 2).toUpperCase()}-${new Date().getFullYear()}-${generateId("").slice(0, 3)}`;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      "Project Submitted",
      `Project ID: ${bbid}\n\nYour project "${projectName}" has been submitted for government approval.\n\nBHOOMI verification will begin within 2-3 working days.`,
      [{ text: "Done", onPress: () => router.back() }]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.navBg, paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="x" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Register New Project</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.body, { paddingBottom: botPad + 80 }]} showsVerticalScrollIndicator={false}>
        <View style={{ gap: 14 }}>
          {[
            { label: "Project Name *", value: projectName, set: setProjectName, placeholder: "e.g. Emerald Heights Phase 2" },
            { label: "Project Location *", value: location, set: setLocation, placeholder: "City, State" },
            { label: "Total Units *", value: totalUnits, set: setTotalUnits, placeholder: "Number of residential/commercial units", keyboard: "number-pad" },
            { label: "Base Price (₹)", value: price, set: setPrice, placeholder: "e.g. 8500000", keyboard: "number-pad" },
            { label: "Expected Completion Date", value: completionDate, set: setCompletionDate, placeholder: "YYYY-MM-DD" },
          ].map((f) => (
            <View key={f.label}>
              <Text style={[styles.label, { color: colors.foreground }]}>{f.label}</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.secondary }]}
                value={f.value}
                onChangeText={f.set}
                placeholder={f.placeholder}
                placeholderTextColor={colors.mutedForeground}
                keyboardType={(f.keyboard as any) || "default"}
              />
            </View>
          ))}

          <View>
            <Text style={[styles.label, { color: colors.foreground }]}>Project Type *</Text>
            <View style={styles.typeGrid}>
              {PROJECT_TYPES.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[
                    styles.typeChip,
                    { borderColor: projectType === t ? colors.primary : colors.border, backgroundColor: projectType === t ? colors.accent : colors.card },
                  ]}
                  onPress={() => { setProjectType(t); Haptics.selectionAsync(); }}
                >
                  <Text style={[styles.typeText, { color: projectType === t ? colors.primary : colors.foreground }]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={[styles.infoCard, { backgroundColor: colors.accent, borderColor: colors.primary }]}>
            <Feather name="info" size={14} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.primary }]}>
              A unique B-BID (Bharat Builder ID) will be assigned upon successful registration and government approval.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: botPad + 10 }]}>
        <TouchableOpacity style={[styles.submitBtn, { backgroundColor: colors.primary }]} onPress={handleSubmit}>
          <Feather name="plus-circle" size={18} color="#fff" />
          <Text style={styles.submitText}>Register Project</Text>
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
  label: { fontSize: 14, fontWeight: "600", marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, height: 48, fontSize: 15 },
  typeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  typeChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  typeText: { fontSize: 13, fontWeight: "600" },
  infoCard: { flexDirection: "row", gap: 8, borderRadius: 10, borderWidth: 1, padding: 12, alignItems: "flex-start" },
  infoText: { fontSize: 12, flex: 1, lineHeight: 18 },
  footer: { paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1 },
  submitBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 52, borderRadius: 12 },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
