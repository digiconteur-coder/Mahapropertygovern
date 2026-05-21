import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Image, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";
import { generateId } from "@/utils/format";

const DISPUTE_TYPES = [
  "Ownership Dispute",
  "Boundary Encroachment",
  "Title Fraud",
  "Inheritance Dispute",
  "Unauthorized Construction",
  "Illegal Transfer",
  "Bank Lien Issue",
  "Other",
];

const LEGAL_ADVISORS = [
  {
    id: "LAW001",
    name: "Adv. Sunita Krishnamurthy",
    designation: "Senior Property Lawyer",
    bar: "Bar Council of Maharashtra · 2008",
    speciality: "Property Disputes & Title Claims",
    rating: 4.9,
    cases: 312,
    fee: "₹5,000",
    available: true,
    location: "Pune High Court",
    tag: "recommended",
    experience: "16 yrs",
    languages: "English, Hindi, Marathi",
    wins: "94%",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=faces",
  },
  {
    id: "LAW002",
    name: "Adv. Rakesh Nambiar",
    designation: "Property & Revenue Law Expert",
    bar: "Bar Council of Kerala · 2011",
    speciality: "Land Acquisition & Revenue Disputes",
    rating: 4.7,
    cases: 195,
    fee: "₹3,500",
    available: true,
    location: "District Court, Nashik",
    tag: "nearby",
    experience: "13 yrs",
    languages: "Malayalam, Hindi, English",
    wins: "88%",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=faces",
  },
  {
    id: "LAW003",
    name: "Adv. Priya Bhatia",
    designation: "Civil & Property Litigation",
    bar: "Bar Council of Delhi · 2015",
    speciality: "Encroachment & Fraud Cases",
    rating: 4.5,
    cases: 128,
    fee: "₹2,500",
    available: false,
    location: "Saket District Court, Delhi",
    tag: "nearby",
    experience: "9 yrs",
    languages: "Hindi, English, Punjabi",
    wins: "82%",
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop&crop=faces",
  },
];

const STEP_LABELS = ["Select Property", "Legal Advisor", "File Dispute"];

export default function RaiseDisputeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { properties, addDispute, addAuditLog } = useData();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const myProperties = properties.filter((p) => p.ownerId === user?.id);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedPropId, setSelectedPropId] = useState("");
  const [selectedLawyerId, setSelectedLawyerId] = useState("");
  const [disputeType, setDisputeType] = useState("");
  const [details, setDetails] = useState("");
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const selectedProperty = myProperties.find((p) => p.id === selectedPropId);
  const selectedLawyer = LEGAL_ADVISORS.find((l) => l.id === selectedLawyerId);

  const handleNext = () => {
    if (step === 1 && !selectedPropId) { Alert.alert("Select Property", "Please select a property."); return; }
    if (step === 2 && !selectedLawyerId) { Alert.alert("Select Advisor", "Please select a legal advisor before proceeding."); return; }
    setStep((s) => (s + 1) as any);
    Haptics.selectionAsync();
  };

  const handleSubmit = () => {
    if (!selectedPropId || !disputeType || !details) { Alert.alert("Incomplete", "Please fill all fields."); return; }
    if (!user || !selectedProperty) return;
    const id = generateId("DISP");
    addDispute({
      id,
      propertyId: selectedProperty.id,
      bpid: selectedProperty.bpid,
      propertyAddress: selectedProperty.address,
      raisedBy: user.id,
      raisedByName: user.name,
      caseDetails: `${disputeType}: ${details}${selectedLawyer ? ` [Lawyer: ${selectedLawyer.name}]` : ""}`,
      status: "open",
      raisedOn: new Date().toISOString(),
    });
    addAuditLog({
      action: "Dispute Filed",
      userId: user.id,
      userName: user.name,
      timestamp: new Date().toISOString(),
      metadata: `Dispute for ${selectedProperty.bpid}: ${disputeType}. Assigned: ${selectedLawyer?.name || "N/A"}`,
      propertyId: selectedProperty.id,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      "Dispute Filed ✓",
      `Case ID: ${id}\n\nAssigned to: ${selectedLawyer?.name || "N/A"}\n\nSLA: Acknowledgment within 24 hours. First review within 48 hours.\n\nTrack your dispute in Notifications.`,
      [{ text: "Track Status", onPress: () => { router.back(); router.push("/notifications" as any); } }, { text: "Done", onPress: () => router.back() }]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: "#7c2d12", paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Raise a Dispute</Text>
          <Text style={styles.headerSub}>{STEP_LABELS[step - 1]}</Text>
        </View>
        <View style={styles.stepWrap}>
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <View style={[styles.stepCircle, { backgroundColor: step >= s ? "#f97316" : "rgba(255,255,255,0.2)" }]}>
                {step > s ? <Feather name="check" size={10} color="#fff" /> : <Text style={styles.stepNum}>{s}</Text>}
              </View>
              {s < 3 && <View style={[styles.stepLine, { backgroundColor: step > s ? "#f97316" : "rgba(255,255,255,0.2)" }]} />}
            </React.Fragment>
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.body, { paddingBottom: botPad + 80 }]} showsVerticalScrollIndicator={false}>

        {/* STEP 1 */}
        {step === 1 && (
          <View style={{ gap: 14 }}>
            <View style={styles.warningBanner}>
              <Feather name="alert-triangle" size={16} color="#dc2626" />
              <Text style={styles.warningText}>
                Filing a false dispute is a cognisable offence under RERAW Act 2026 and is punishable. All disputes are monitored.
              </Text>
            </View>
            <Text style={[styles.label, { color: colors.foreground }]}>Select Property for Dispute</Text>
            {myProperties.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={[styles.selectCard, { backgroundColor: colors.card, borderColor: selectedPropId === p.id ? "#dc2626" : colors.border }]}
                onPress={() => { setSelectedPropId(p.id); Haptics.selectionAsync(); }}
                activeOpacity={0.7}
              >
                <View style={styles.selectCardRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.bpid, { color: "#dc2626" }]}>{p.bpid}</Text>
                    <Text style={[styles.addr, { color: colors.foreground }]} numberOfLines={1}>{p.address}</Text>
                    <Text style={[styles.propType, { color: colors.mutedForeground }]}>{p.type.toUpperCase()} • {p.area}</Text>
                  </View>
                  {selectedPropId === p.id && <Feather name="check-circle" size={22} color="#dc2626" />}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* STEP 2 — Legal Advisor */}
        {step === 2 && (
          <View style={{ gap: 14 }}>
            <View style={[styles.legalBanner, { backgroundColor: "#fef3c7", borderColor: "#fde68a" }]}>
              <Feather name="book-open" size={16} color="#d97706" />
              <Text style={[styles.legalBannerText, { color: "#92400e" }]}>
                You MUST select a RERAW-registered Legal Advisor before raising a dispute. They review your case and guide legal proceedings.
              </Text>
            </View>
            <Text style={[styles.label, { color: colors.foreground }]}>Choose Your Legal Advisor</Text>

            {LEGAL_ADVISORS.map((lawyer) => (
              <TouchableOpacity
                key={lawyer.id}
                style={[
                  styles.lawyerCard,
                  { backgroundColor: colors.card, borderColor: selectedLawyerId === lawyer.id ? "#7c2d12" : colors.border },
                  !lawyer.available && { opacity: 0.55 },
                ]}
                onPress={() => {
                  if (!lawyer.available) { Alert.alert("Unavailable", "This advisor is currently unavailable. Please choose another."); return; }
                  setSelectedLawyerId(lawyer.id);
                  Haptics.selectionAsync();
                }}
                activeOpacity={0.75}
              >
                <View style={styles.lawyerTop}>
                  {/* Real photo */}
                  <View style={styles.lawyerAvatarWrap}>
                    {!imgErrors[lawyer.id] ? (
                      <Image
                        source={{ uri: lawyer.photo }}
                        style={styles.lawyerAvatar}
                        onError={() => setImgErrors((e) => ({ ...e, [lawyer.id]: true }))}
                      />
                    ) : (
                      <View style={[styles.lawyerAvatarFallback, { backgroundColor: "#7c2d12" }]}>
                        <Feather name="user" size={20} color="#fff" />
                      </View>
                    )}
                    <View style={[styles.lawyerOnline, { backgroundColor: lawyer.available ? "#16a34a" : "#94a3b8" }]} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.lawyerNameRow}>
                      <Text style={[styles.lawyerName, { color: colors.foreground }]}>{lawyer.name}</Text>
                      {lawyer.tag === "recommended" && (
                        <View style={styles.recTag}><Text style={styles.recTagText}>⭐ Recommended</Text></View>
                      )}
                      {!lawyer.available && (
                        <View style={styles.unavailTag}><Text style={styles.unavailTagText}>Unavailable</Text></View>
                      )}
                    </View>
                    <Text style={[styles.lawyerDesig, { color: colors.mutedForeground }]}>{lawyer.designation}</Text>
                    <Text style={[styles.lawyerBar, { color: colors.mutedForeground }]}>{lawyer.bar}</Text>
                  </View>
                  {selectedLawyerId === lawyer.id && <Feather name="check-circle" size={22} color="#7c2d12" />}
                </View>

                <View style={[styles.specialityPill, { backgroundColor: "#fee2e2" }]}>
                  <Text style={{ color: "#7c2d12", fontSize: 11, fontWeight: "600" }}>{lawyer.speciality}</Text>
                </View>

                <View style={[styles.lawyerStats, { borderTopColor: colors.border }]}>
                  <LegalStat icon="map-pin" text={lawyer.location} />
                  <LegalStat icon="star" text={`${lawyer.rating} (${lawyer.cases} cases)`} color="#d97706" />
                  <LegalStat icon="trending-up" text={`${lawyer.wins} win rate`} color="#16a34a" />
                  <LegalStat icon="globe" text={lawyer.languages} />
                </View>

                <View style={styles.lawyerBottom}>
                  <View style={styles.expPill}>
                    <Feather name="briefcase" size={11} color="#7c2d12" />
                    <Text style={{ color: "#7c2d12", fontSize: 11, fontWeight: "600" }}>{lawyer.experience} experience</Text>
                  </View>
                  <View style={[styles.feePill, { backgroundColor: "#dcfce7" }]}>
                    <Text style={{ color: "#16a34a", fontSize: 12, fontWeight: "700" }}>{lawyer.fee} consultation</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}

            {selectedLawyer && (
              <View style={[styles.selectedConfirm, { backgroundColor: "#fef2f2", borderColor: "#fca5a5" }]}>
                <Feather name="check-circle" size={14} color="#dc2626" />
                <Text style={{ color: "#dc2626", fontSize: 12, fontWeight: "600", flex: 1 }}>
                  {selectedLawyer.name} will review your dispute within 48 hours of filing.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* STEP 3 — Dispute Details */}
        {step === 3 && (
          <View style={{ gap: 14 }}>
            {selectedLawyer && (
              <View style={styles.lawyerConfirmPill}>
                {!imgErrors[selectedLawyer.id] ? (
                  <Image source={{ uri: selectedLawyer.photo }} style={styles.confirmAvatar} />
                ) : (
                  <View style={[styles.confirmAvatarFallback, { backgroundColor: "#7c2d12" }]}>
                    <Feather name="user" size={14} color="#fff" />
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#7c2d12", fontSize: 12, fontWeight: "700" }}>{selectedLawyer.name}</Text>
                  <Text style={{ color: "#9f1239", fontSize: 10 }}>{selectedLawyer.speciality} • {selectedLawyer.fee}</Text>
                </View>
                <Feather name="check-circle" size={16} color="#dc2626" />
              </View>
            )}

            <Text style={[styles.label, { color: colors.foreground }]}>Dispute Type</Text>
            <View style={styles.typeGrid}>
              {DISPUTE_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.typeChip, {
                    borderColor: disputeType === type ? "#dc2626" : colors.border,
                    backgroundColor: disputeType === type ? "#fee2e2" : colors.card
                  }]}
                  onPress={() => { setDisputeType(type); Haptics.selectionAsync(); }}
                >
                  <Text style={[styles.typeText, { color: disputeType === type ? "#dc2626" : colors.foreground }]}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { color: colors.foreground }]}>Case Details</Text>
            <TextInput
              style={[styles.textarea, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.secondary }]}
              value={details}
              onChangeText={setDetails}
              placeholder="Describe the dispute in detail. Include dates, parties involved, survey numbers and supporting facts."
              placeholderTextColor={colors.mutedForeground}
              multiline
              numberOfLines={7}
              textAlignVertical="top"
            />

            <View style={[styles.legalBanner, { backgroundColor: "#eff6ff", borderColor: "#bfdbfe" }]}>
              <Feather name="zap" size={14} color="#1d4ed8" />
              <Text style={[styles.legalBannerText, { color: "#1d4ed8" }]}>
                SLA: Acknowledgment within 24 hrs. {selectedLawyer?.name} reviews within 48 hrs. Resolution target: 30 days.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: botPad + 10 }]}>
        {step > 1 && (
          <TouchableOpacity style={[styles.backBtn, { borderColor: colors.border }]} onPress={() => setStep((s) => (s - 1) as any)}>
            <Text style={[styles.backBtnText, { color: colors.foreground }]}>Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: step === 3 ? "#dc2626" : "#7c2d12" }]}
          onPress={step === 3 ? handleSubmit : handleNext}
          activeOpacity={0.8}
        >
          <Feather name={step === 3 ? "alert-triangle" : "arrow-right"} size={18} color="#fff" />
          <Text style={styles.submitBtnText}>{step === 3 ? "File Dispute Query" : "Next"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function LegalStat({ icon, text, color }: { icon: string; text: string; color?: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
      <Feather name={icon as any} size={10} color={color || "#64748b"} />
      <Text style={{ fontSize: 10, color: color || "#64748b" }}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "flex-end", gap: 12, paddingHorizontal: 16, paddingBottom: 14 },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
  headerSub: { color: "rgba(255,255,255,0.6)", fontSize: 11, marginTop: 1 },
  stepWrap: { flexDirection: "row", alignItems: "center" },
  stepCircle: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  stepNum: { color: "#fff", fontSize: 10, fontWeight: "800" },
  stepLine: { width: 12, height: 2 },
  body: { padding: 16, gap: 14 },
  warningBanner: { flexDirection: "row", gap: 8, backgroundColor: "#fee2e2", borderRadius: 10, padding: 12, alignItems: "flex-start" },
  warningText: { color: "#dc2626", fontSize: 12, flex: 1, lineHeight: 17 },
  legalBanner: { flexDirection: "row", gap: 8, borderRadius: 10, borderWidth: 1, padding: 12, alignItems: "flex-start" },
  legalBannerText: { fontSize: 12, flex: 1, lineHeight: 17 },
  label: { fontSize: 15, fontWeight: "700" },
  selectCard: { borderRadius: 12, borderWidth: 1.5, padding: 12 },
  selectCardRow: { flexDirection: "row", alignItems: "center" },
  bpid: { fontSize: 10, fontWeight: "700" },
  addr: { fontSize: 14, fontWeight: "600", marginTop: 2 },
  propType: { fontSize: 11, marginTop: 2 },
  lawyerCard: { borderRadius: 14, borderWidth: 2, padding: 14, gap: 10 },
  lawyerTop: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  lawyerAvatarWrap: { position: "relative" },
  lawyerAvatar: { width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: "#fca5a5" },
  lawyerAvatarFallback: { width: 60, height: 60, borderRadius: 30, alignItems: "center", justifyContent: "center" },
  lawyerOnline: { position: "absolute", bottom: 2, right: 2, width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: "#fff" },
  lawyerNameRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  lawyerName: { fontSize: 14, fontWeight: "700" },
  recTag: { backgroundColor: "#fee2e2", paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  recTagText: { color: "#dc2626", fontSize: 9, fontWeight: "700" },
  unavailTag: { backgroundColor: "#f1f5f9", paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  unavailTagText: { color: "#64748b", fontSize: 9, fontWeight: "700" },
  lawyerDesig: { fontSize: 11, marginTop: 2 },
  lawyerBar: { fontSize: 10, marginTop: 1 },
  specialityPill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, alignSelf: "flex-start", marginLeft: 72 },
  lawyerStats: { flexDirection: "row", gap: 10, borderTopWidth: 1, paddingTop: 8, flexWrap: "wrap" },
  lawyerBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  expPill: { flexDirection: "row", alignItems: "center", gap: 4 },
  feePill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  selectedConfirm: { flexDirection: "row", alignItems: "flex-start", gap: 8, borderRadius: 10, borderWidth: 1, padding: 10 },
  lawyerConfirmPill: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#fee2e2", borderWidth: 1, borderColor: "#fca5a5", borderRadius: 12, padding: 10 },
  confirmAvatar: { width: 40, height: 40, borderRadius: 20 },
  confirmAvatarFallback: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  typeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  typeChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  typeText: { fontSize: 12, fontWeight: "600" },
  textarea: { borderWidth: 1, borderRadius: 10, padding: 14, fontSize: 14, minHeight: 130 },
  footer: { flexDirection: "row", gap: 10, paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1 },
  backBtn: { flex: 1, borderWidth: 1, borderRadius: 10, height: 48, alignItems: "center", justifyContent: "center" },
  backBtnText: { fontSize: 15, fontWeight: "600" },
  submitBtn: { flex: 2, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 52, borderRadius: 12 },
  submitBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
