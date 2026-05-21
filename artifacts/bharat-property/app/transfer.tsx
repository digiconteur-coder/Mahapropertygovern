import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert, Image, Platform, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";
import { formatCurrency, generateId } from "@/utils/format";

const CPF_BROKERS = [
  {
    id: "USR002",
    name: "Sunil Mehta",
    firm: "MetaRealty CPF",
    brokerId: "CPF-MH-2026-0042",
    rating: 4.8,
    deals: 127,
    location: "Pune, Maharashtra",
    speciality: "Residential",
    fee: "1%",
    tag: "previously_used",
    photo: "https://images.unsplash.com/photo-1566753323558-f4e0952af115?w=100&h=100&fit=crop&crop=faces",
    experience: "8 yrs",
    languages: "Hindi, Marathi, English",
  },
  {
    id: "CPF_003",
    name: "Anjali Desai",
    firm: "Prop-Link CPF",
    brokerId: "CPF-MH-2026-0088",
    rating: 4.6,
    deals: 89,
    location: "Mumbai, Maharashtra",
    speciality: "Commercial",
    fee: "1.5%",
    tag: "nearby",
    photo: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=100&h=100&fit=crop&crop=faces",
    experience: "5 yrs",
    languages: "Marathi, English, Gujarati",
  },
  {
    id: "CPF_004",
    name: "Ravi Kulkarni",
    firm: "BPC Direct",
    brokerId: "CPF-MH-2026-0031",
    rating: 4.4,
    deals: 54,
    location: "Nashik, Maharashtra",
    speciality: "Land",
    fee: "0.75%",
    tag: "nearby",
    photo: "https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?w=100&h=100&fit=crop&crop=faces",
    experience: "4 yrs",
    languages: "Marathi, Hindi",
  },
  {
    id: "CPF_005",
    name: "Meera Nair",
    firm: "TrustDeed CPF",
    brokerId: "CPF-KL-2026-0067",
    rating: 4.7,
    deals: 73,
    location: "Thane, Maharashtra",
    speciality: "Residential",
    fee: "1.2%",
    tag: "nearby",
    photo: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=100&h=100&fit=crop&crop=faces",
    experience: "6 yrs",
    languages: "Malayalam, English, Hindi",
  },
  {
    id: "CPF_006",
    name: "Arjun Patel",
    firm: "ClearTitle CPF",
    brokerId: "CPF-GJ-2026-0019",
    rating: 4.5,
    deals: 61,
    location: "Navi Mumbai, Maharashtra",
    speciality: "Land & NA",
    fee: "0.9%",
    tag: "nearby",
    photo: "https://images.unsplash.com/photo-1542178243-bc20204b769f?w=100&h=100&fit=crop&crop=faces",
    experience: "5 yrs",
    languages: "Gujarati, Hindi, English",
  },
];

// Required documents by property type
const REQUIRED_DOCS: Record<string, { id: string; label: string; required: boolean; desc: string }[]> = {
  flat: [
    { id: "sale_deed", label: "Sale Deed / Agreement", required: true, desc: "Original registered sale deed or ATS" },
    { id: "society_noc", label: "Society NOC", required: true, desc: "No Objection Certificate from Housing Society" },
    { id: "oc", label: "Occupancy Certificate (OC)", required: true, desc: "Issued by Municipal Corporation" },
    { id: "layout_plan", label: "Flat Layout / Floor Plan", required: true, desc: "Approved floor plan showing flat dimensions" },
    { id: "property_photos", label: "Property Photos", required: false, desc: "Exterior & interior photos (min 4)" },
    { id: "ec", label: "Encumbrance Certificate (EC)", required: true, desc: "EC for last 30 years from Sub-Registrar" },
    { id: "property_tax", label: "Property Tax Receipts", required: true, desc: "Last 2 years property tax paid receipts" },
    { id: "mutation", label: "Mutation Records", required: false, desc: "7/12 extract or property register card" },
  ],
  land: [
    { id: "sale_deed", label: "Sale Deed", required: true, desc: "Registered sale deed with survey number" },
    { id: "7_12", label: "7/12 Extract (Satbara)", required: true, desc: "Village Form 7/12 from Talathi" },
    { id: "survey_map", label: "Survey / Cadastral Map", required: true, desc: "Govt approved survey map with boundaries" },
    { id: "ec", label: "Encumbrance Certificate", required: true, desc: "EC showing no mortgage/loans" },
    { id: "land_photos", label: "Land Photos", required: false, desc: "Photos with GPS coordinates" },
    { id: "na_order", label: "NA Order (if applicable)", required: false, desc: "Non-Agricultural land conversion order" },
    { id: "property_tax", label: "Tax Receipts", required: true, desc: "Latest property tax paid proof" },
    { id: "mutation", label: "Mutation / Ferfar", required: true, desc: "Mutation entry in village records" },
  ],
  commercial: [
    { id: "sale_deed", label: "Sale Deed", required: true, desc: "Registered commercial property deed" },
    { id: "cc_oc", label: "CC & OC Certificate", required: true, desc: "Commencement & Occupancy Certificate" },
    { id: "layout_plan", label: "Sanctioned Plan", required: true, desc: "Municipal-approved building plan" },
    { id: "fire_noc", label: "Fire NOC", required: true, desc: "Fire department clearance certificate" },
    { id: "property_photos", label: "Property Photos", required: false, desc: "Exterior, interior & signage photos" },
    { id: "ec", label: "Encumbrance Certificate", required: true, desc: "EC for last 30 years" },
    { id: "property_tax", label: "Property Tax Receipts", required: true, desc: "Last 3 years receipts" },
    { id: "gst", label: "GST Registration", required: false, desc: "GST certificate if commercial use" },
  ],
};

const STEP_LABELS = ["Select Property", "CPF Broker", "Buyer Details", "Documents", "Confirm"];

export default function TransferScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { properties, addTransaction, addAuditLog } = useData();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const myProperties = properties.filter((p) => p.ownerId === user?.id && p.status === "verified");

  const [selectedPropId, setSelectedPropId] = useState("");
  const [selectedCpfId, setSelectedCpfId] = useState<string | null>(null);
  const [skipCpf, setSkipCpf] = useState(false);
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerAadhaar, setBuyerAadhaar] = useState("");
  const [buyerPan, setBuyerPan] = useState("");
  const [buyerDob, setBuyerDob] = useState("");
  const [buyerOccupation, setBuyerOccupation] = useState("");
  const [buyerAddress, setBuyerAddress] = useState("");
  const [buyerIncome, setBuyerIncome] = useState("");
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, boolean>>({});
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  const selectedProperty = myProperties.find((p) => p.id === selectedPropId);
  const selectedCpf = CPF_BROKERS.find((b) => b.id === selectedCpfId);
  const requiredDocs = selectedProperty ? (REQUIRED_DOCS[selectedProperty.type] || REQUIRED_DOCS.flat) : [];

  const handleNext = () => {
    if (step === 1 && !selectedPropId) { Alert.alert("Select Property", "Please select a property to transfer."); return; }
    if (step === 2 && !selectedCpfId && !skipCpf) { Alert.alert("Select Broker", "Please select a CPF Broker or choose Direct Transfer."); return; }
    if (step === 3) {
      if (!buyerName || !buyerPhone || !buyerAadhaar || !buyerPan) {
        Alert.alert("Missing Details", "Please fill Name, Phone, Aadhaar and PAN. Other fields recommended for full verification.");
        return;
      }
    }
    if (step === 4) {
      const mandatoryMissing = requiredDocs.filter((d) => d.required && !uploadedDocs[d.id]);
      if (mandatoryMissing.length > 0) {
        Alert.alert(
          "Missing Documents",
          `Please upload all mandatory documents:\n\n${mandatoryMissing.map((d) => "• " + d.label).join("\n")}`
        );
        return;
      }
    }
    setStep((s) => (s + 1) as any);
    Haptics.selectionAsync();
  };

  const handleUpload = (docId: string, label: string) => {
    Alert.alert(
      `Upload: ${label}`,
      "In production, this opens your device camera or file picker. For the demo, document is marked as uploaded.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Simulate Upload",
          onPress: () => {
            setUploadedDocs((prev) => ({ ...prev, [docId]: true }));
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  const handleSubmit = () => {
    if (!selectedProperty || !user) return;
    const txId = generateId("TX");
    addTransaction({
      id: txId,
      propertyId: selectedProperty.id,
      bpid: selectedProperty.bpid,
      propertyAddress: selectedProperty.address,
      buyerId: "NEW_" + buyerPhone,
      buyerName,
      sellerId: user.id,
      sellerName: user.name,
      amount: selectedProperty.value,
      status: "initiated",
      escrowStatus: "pending",
      initiatedOn: new Date().toISOString(),
      cpfId: selectedCpf?.id,
      cpfName: selectedCpf?.name,
    });
    addAuditLog({
      action: "Transfer Initiated",
      userId: user.id,
      userName: user.name,
      timestamp: new Date().toISOString(),
      metadata: `Transfer of ${selectedProperty.bpid} to ${buyerName}${selectedCpf ? ` via CPF ${selectedCpf.name}` : " (Direct)"} | PAN: ${buyerPan} | Aadhaar: ${buyerAadhaar}`,
      propertyId: selectedProperty.id,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      "Transfer Initiated ✓",
      `Transaction ID: ${txId}\n\nYour transfer is now LIVE and can be tracked in Notifications.\n\n${selectedCpf ? `CPF Broker: ${selectedCpf.name}\n` : ""}Funds held in Bharat Escrow until Govt approval.\n\nEstimated: 3–7 working days (Policy SLA)`,
      [{ text: "Track Transfer", onPress: () => { router.back(); router.push("/notifications" as any); } }, { text: "Done", onPress: () => router.back() }]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: "#1e3a8a", paddingTop: topPad }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="x" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Transfer Property</Text>
          <Text style={styles.headerSub}>{STEP_LABELS[step - 1]}</Text>
        </View>
        <View style={styles.stepWrap}>
          {[1, 2, 3, 4, 5].map((s) => (
            <React.Fragment key={s}>
              <View style={[styles.stepCircle, { backgroundColor: step >= s ? "#f97316" : "rgba(255,255,255,0.2)" }]}>
                {step > s ? <Feather name="check" size={9} color="#fff" /> : <Text style={styles.stepNum}>{s}</Text>}
              </View>
              {s < 5 && <View style={[styles.stepLine, { backgroundColor: step > s ? "#f97316" : "rgba(255,255,255,0.2)" }]} />}
            </React.Fragment>
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.body, { paddingBottom: botPad + 80 }]} showsVerticalScrollIndicator={false}>

        {/* STEP 1 */}
        {step === 1 && (
          <View style={{ gap: 14 }}>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>Select Property to Transfer</Text>
            {myProperties.length === 0 && (
              <View style={styles.empty}>
                <Feather name="alert-circle" size={32} color={colors.mutedForeground} />
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No verified properties available for transfer</Text>
              </View>
            )}
            {myProperties.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={[styles.propCard, { backgroundColor: colors.card, borderColor: selectedPropId === p.id ? "#1e3a8a" : colors.border }]}
                onPress={() => { setSelectedPropId(p.id); Haptics.selectionAsync(); }}
                activeOpacity={0.7}
              >
                <View style={styles.propCardRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.propBpid, { color: "#1e3a8a" }]}>{p.bpid}</Text>
                    <Text style={[styles.propAddr, { color: colors.foreground }]} numberOfLines={2}>{p.address}</Text>
                    <Text style={[styles.propVal, { color: "#1e3a8a" }]}>{formatCurrency(p.value)}</Text>
                  </View>
                  <View style={{ alignItems: "flex-end", gap: 6 }}>
                    {selectedPropId === p.id && <Feather name="check-circle" size={22} color="#1e3a8a" />}
                    <View style={[styles.propTypePill, { backgroundColor: "#dbeafe" }]}>
                      <Text style={styles.propTypePillText}>{p.type.toUpperCase()}</Text>
                    </View>
                  </View>
                </View>
                <View style={[styles.buidRow, { borderTopColor: colors.border }]}>
                  <Feather name="grid" size={11} color={colors.mutedForeground} />
                  <Text style={[styles.buidText, { color: colors.mutedForeground }]}>BUID: {p.bpid}</Text>
                  <View style={styles.transferableBadge}>
                    <Feather name="check" size={9} color="#16a34a" />
                    <Text style={styles.transferableText}>Transferable</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* STEP 2 — CPF Broker */}
        {step === 2 && (
          <View style={{ gap: 14 }}>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>Choose CPF Broker / Platform</Text>
            <View style={[styles.infoBanner, { backgroundColor: "#eff6ff", borderColor: "#bfdbfe" }]}>
              <Feather name="info" size={14} color="#1d4ed8" />
              <Text style={[styles.infoBannerText, { color: "#1d4ed8" }]}>
                RERAW-registered CPF Brokers ensure legal compliance. Your previous broker is highlighted.
              </Text>
            </View>

            {CPF_BROKERS.map((broker) => (
              <TouchableOpacity
                key={broker.id}
                style={[styles.brokerCard, { backgroundColor: colors.card, borderColor: selectedCpfId === broker.id ? "#7c3aed" : colors.border }]}
                onPress={() => { setSelectedCpfId(broker.id); setSkipCpf(false); Haptics.selectionAsync(); }}
                activeOpacity={0.7}
              >
                <View style={styles.brokerRow}>
                  {/* Real photo */}
                  <View style={styles.brokerAvatarWrap}>
                    <Image source={{ uri: broker.photo }} style={styles.brokerAvatar} />
                    <View style={[styles.brokerOnline, { backgroundColor: "#16a34a" }]} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.brokerNameRow}>
                      <Text style={[styles.brokerName, { color: colors.foreground }]}>{broker.name}</Text>
                      {broker.tag === "previously_used" && (
                        <View style={styles.prevTag}><Text style={styles.prevTagText}>Your Broker</Text></View>
                      )}
                      {broker.tag === "nearby" && (
                        <View style={styles.nearbyTag}><Text style={styles.nearbyTagText}>Nearby</Text></View>
                      )}
                    </View>
                    <Text style={[styles.brokerFirm, { color: colors.mutedForeground }]}>{broker.firm} • {broker.brokerId}</Text>
                    <Text style={[styles.brokerLoc, { color: colors.mutedForeground }]}>{broker.location} • {broker.languages}</Text>
                  </View>
                  {selectedCpfId === broker.id && <Feather name="check-circle" size={20} color="#7c3aed" />}
                </View>
                <View style={[styles.brokerStats, { borderTopColor: colors.border }]}>
                  <StatPill icon="star" text={`${broker.rating} ★`} color="#d97706" />
                  <StatPill icon="check-square" text={`${broker.deals} deals`} color="#16a34a" />
                  <StatPill icon="briefcase" text={broker.experience} color="#1e3a8a" />
                  <View style={[styles.feePill, { backgroundColor: "#ede9fe" }]}>
                    <Text style={{ color: "#7c3aed", fontSize: 11, fontWeight: "700" }}>CPF: {broker.fee}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={[styles.directCard, { backgroundColor: skipCpf ? "#fef9c3" : colors.card, borderColor: skipCpf ? "#d97706" : colors.border }]}
              onPress={() => { setSkipCpf(true); setSelectedCpfId(null); Haptics.selectionAsync(); }}
              activeOpacity={0.7}
            >
              <View style={styles.brokerRow}>
                <View style={[styles.directIcon, { backgroundColor: "#f1f5f9" }]}>
                  <Feather name="arrow-right" size={16} color="#64748b" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.brokerName, { color: colors.foreground }]}>Direct Transfer (No Broker)</Text>
                  <Text style={[styles.brokerFirm, { color: colors.mutedForeground }]}>Self-managed • No CPF fee • Manual legal check required</Text>
                </View>
                {skipCpf && <Feather name="check-circle" size={20} color="#d97706" />}
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 3 — Buyer Details (Full KYC) */}
        {step === 3 && (
          <View style={{ gap: 14 }}>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>Buyer Details — Full KYC</Text>
            {selectedProperty && (
              <View style={[styles.summaryPill, { backgroundColor: "#eff6ff", borderColor: "#bfdbfe" }]}>
                <Text style={[styles.propBpid, { color: "#1e3a8a" }]}>{selectedProperty.bpid}</Text>
                <Text style={[styles.propAddr, { color: "#1e3a8a" }]} numberOfLines={1}>{selectedProperty.address}</Text>
                {selectedCpf && <Text style={[styles.propBpid, { color: "#7c3aed", marginTop: 2 }]}>CPF: {selectedCpf.name}</Text>}
              </View>
            )}

            <View style={[styles.kycSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.kycSectionTitle, { color: colors.mutedForeground }]}>IDENTITY (MANDATORY)</Text>
              <FieldInput label="Full Name (as per Aadhaar/PAN)" value={buyerName} onChange={setBuyerName} placeholder="Full legal name" />
              <FieldInput label="Mobile Number" value={buyerPhone} onChange={setBuyerPhone} placeholder="10-digit mobile" keyboard="phone-pad" maxLen={10} />
              <FieldInput label="Aadhaar Number" value={buyerAadhaar} onChange={setBuyerAadhaar} placeholder="12-digit Aadhaar" keyboard="number-pad" maxLen={12} />
              <FieldInput label="PAN Number" value={buyerPan} onChange={(v) => setBuyerPan(v.toUpperCase())} placeholder="e.g. ABCDE1234F" maxLen={10} />
            </View>

            <View style={[styles.kycSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.kycSectionTitle, { color: colors.mutedForeground }]}>PERSONAL DETAILS (RECOMMENDED)</Text>
              <FieldInput label="Date of Birth" value={buyerDob} onChange={setBuyerDob} placeholder="DD/MM/YYYY" />
              <FieldInput label="Occupation" value={buyerOccupation} onChange={setBuyerOccupation} placeholder="e.g. Software Engineer, Businessman" />
              <FieldInput label="Annual Income (₹)" value={buyerIncome} onChange={setBuyerIncome} placeholder="e.g. 1200000" keyboard="number-pad" />
              <FieldInput label="Correspondence Address" value={buyerAddress} onChange={setBuyerAddress} placeholder="Full current address" multiline />
            </View>

            <View style={[styles.infoBanner, { backgroundColor: "#fef3c7", borderColor: "#fde68a" }]}>
              <Feather name="shield" size={14} color="#a16207" />
              <Text style={[styles.infoBannerText, { color: "#a16207" }]}>
                All buyer details are AES-256 encrypted under India's Permissioned Sovereign Audit Ledger. Shared only with Sub-Registrar.
              </Text>
            </View>
          </View>
        )}

        {/* STEP 4 — Documents Upload */}
        {step === 4 && selectedProperty && (
          <View style={{ gap: 14 }}>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>Upload Documents</Text>
            <View style={[styles.infoBanner, { backgroundColor: "#eff6ff", borderColor: "#bfdbfe" }]}>
              <Feather name="info" size={14} color="#1d4ed8" />
              <Text style={[styles.infoBannerText, { color: "#1d4ed8" }]}>
                Documents marked * are mandatory. All others are strongly recommended for faster processing.
              </Text>
            </View>

            {/* Progress bar */}
            <View style={[styles.docProgress, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.docProgressLabel, { color: colors.mutedForeground }]}>
                {Object.keys(uploadedDocs).length}/{requiredDocs.length} documents uploaded
              </Text>
              <View style={styles.docProgressBarWrap}>
                <View style={[styles.docProgressBar, { width: `${(Object.keys(uploadedDocs).length / requiredDocs.length) * 100}%` as any }]} />
              </View>
            </View>

            {requiredDocs.map((doc) => (
              <View key={doc.id} style={[styles.docCard, { backgroundColor: colors.card, borderColor: uploadedDocs[doc.id] ? "#16a34a" : colors.border }]}>
                <View style={styles.docCardRow}>
                  <View style={[styles.docIconWrap, { backgroundColor: uploadedDocs[doc.id] ? "#dcfce7" : "#f1f5f9" }]}>
                    <Feather name={uploadedDocs[doc.id] ? "check-circle" : "file-text"} size={20} color={uploadedDocs[doc.id] ? "#16a34a" : "#64748b"} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.docLabelRow}>
                      <Text style={[styles.docLabel, { color: colors.foreground }]}>{doc.label}</Text>
                      {doc.required && <Text style={styles.reqStar}>*</Text>}
                    </View>
                    <Text style={[styles.docDesc, { color: colors.mutedForeground }]}>{doc.desc}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.uploadBtn, { backgroundColor: uploadedDocs[doc.id] ? "#dcfce7" : "#1e3a8a" }]}
                  onPress={() => uploadedDocs[doc.id] ? null : handleUpload(doc.id, doc.label)}
                >
                  <Feather name={uploadedDocs[doc.id] ? "check" : "upload"} size={14} color={uploadedDocs[doc.id] ? "#16a34a" : "#fff"} />
                  <Text style={[styles.uploadBtnText, { color: uploadedDocs[doc.id] ? "#16a34a" : "#fff" }]}>
                    {uploadedDocs[doc.id] ? "Uploaded ✓" : "Upload"}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* STEP 5 — Confirm + BUID QR */}
        {step === 5 && selectedProperty && (
          <View style={{ gap: 14 }}>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>Confirm Transfer</Text>

            <View style={[styles.qrBuidCard, { backgroundColor: "#1e3a8a" }]}>
              <View style={styles.qrBuidHeader}>
                <Feather name="shield" size={14} color="#f97316" />
                <Text style={styles.qrBuidTitle}>Property BUID — Transfer QR</Text>
              </View>
              <Text style={styles.qrBuidId}>{selectedProperty.bpid}</Text>
              <View style={styles.miniQrWrap}>
                {generateMiniQR(selectedProperty.bpid, 10).map((row, ri) => (
                  <View key={ri} style={styles.miniQrRow}>
                    {row.map((cell, ci) => (
                      <View key={ci} style={[styles.miniQrCell, { backgroundColor: cell ? "#f97316" : "rgba(255,255,255,0.08)" }]} />
                    ))}
                  </View>
                ))}
              </View>
              <Text style={styles.qrBuidSub}>Scan QR to verify property authenticity before signing</Text>
            </View>

            <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <SummaryRow label="Property BUID" value={selectedProperty.bpid} />
              <SummaryRow label="Address" value={selectedProperty.address} />
              <SummaryRow label="Market Value" value={formatCurrency(selectedProperty.value)} />
              <SummaryRow label="Seller" value={user?.name || ""} />
              <SummaryRow label="Buyer" value={buyerName} />
              <SummaryRow label="Buyer Aadhaar" value={"XXXX-XXXX-" + buyerAadhaar.slice(-4)} />
              <SummaryRow label="Buyer PAN" value={buyerPan} />
              <SummaryRow label="CPF Broker" value={selectedCpf ? `${selectedCpf.name} (${selectedCpf.fee})` : "Direct (No Broker)"} />
              <SummaryRow label="Docs Uploaded" value={`${Object.keys(uploadedDocs).length}/${requiredDocs.length}`} />
              <SummaryRow label="Escrow" value="Bharat Escrow — Funds Held until Govt Approval" />
              <SummaryRow label="SLA" value="Transfer must complete in 7 working days" />
            </View>

            <View style={[styles.infoBanner, { backgroundColor: "#fefce8", borderColor: "#fef08a" }]}>
              <Feather name="lock" size={14} color="#a16207" />
              <Text style={[styles.infoBannerText, { color: "#a16207" }]}>
                By proceeding, you digitally consent to this transfer under RERAW Act 2026. All data encrypted and governance-sealed in the Sovereign Audit Ledger.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: botPad + 10 }]}>
        {step > 1 && (
          <TouchableOpacity style={[styles.secondaryBtn, { borderColor: colors.border }]} onPress={() => setStep((s) => (s - 1) as any)}>
            <Text style={[styles.secondaryBtnText, { color: colors.foreground }]}>Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: step === 5 ? "#16a34a" : "#1e3a8a" }]}
          onPress={step === 5 ? handleSubmit : handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryBtnText}>{step === 5 ? "Initiate Transfer" : "Next"}</Text>
          <Feather name={step === 5 ? "check" : "arrow-right"} size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function StatPill({ icon, text, color }: { icon: string; text: string; color: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
      <Feather name={icon as any} size={11} color={color} />
      <Text style={{ fontSize: 11, color, fontWeight: "600" }}>{text}</Text>
    </View>
  );
}

function FieldInput({ label, value, onChange, placeholder, keyboard, maxLen, multiline }: any) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.fieldInput, multiline && { height: 80, textAlignVertical: "top" }]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        keyboardType={keyboard || "default"}
        maxLength={maxLen}
        multiline={!!multiline}
      />
    </View>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue} numberOfLines={2}>{value}</Text>
    </View>
  );
}

function generateMiniQR(data: string, size: number): boolean[][] {
  const hash = data.split("").reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) & 0xffffffff, 0);
  return Array.from({ length: size }, (_, r) =>
    Array.from({ length: size }, (__, c) => {
      const isCorner = (r < 2 && c < 2) || (r < 2 && c >= size - 2) || (r >= size - 2 && c < 2);
      if (isCorner) return true;
      return ((hash ^ (r * 13 + c * 7)) & 1) === 1;
    })
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "flex-end", gap: 12, paddingHorizontal: 16, paddingBottom: 14 },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
  headerSub: { color: "rgba(255,255,255,0.6)", fontSize: 11, marginTop: 1 },
  stepWrap: { flexDirection: "row", alignItems: "center" },
  stepCircle: { width: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  stepNum: { color: "#fff", fontSize: 9, fontWeight: "800" },
  stepLine: { width: 8, height: 2 },
  body: { padding: 16, gap: 14 },
  stepTitle: { fontSize: 18, fontWeight: "700" },
  propCard: { borderRadius: 12, borderWidth: 2, padding: 14, gap: 10 },
  propCardRow: { flexDirection: "row", alignItems: "flex-start" },
  propBpid: { fontSize: 10, fontWeight: "700", letterSpacing: 0.5 },
  propAddr: { fontSize: 14, fontWeight: "600", marginTop: 2, marginBottom: 4 },
  propVal: { fontSize: 15, fontWeight: "700" },
  propTypePill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  propTypePillText: { color: "#1e3a8a", fontSize: 9, fontWeight: "800" },
  buidRow: { flexDirection: "row", alignItems: "center", gap: 6, borderTopWidth: 1, paddingTop: 8 },
  buidText: { flex: 1, fontSize: 10, fontWeight: "600" },
  transferableBadge: { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "#dcfce7", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  transferableText: { color: "#16a34a", fontSize: 9, fontWeight: "700" },
  infoBanner: { flexDirection: "row", gap: 10, borderRadius: 10, borderWidth: 1, padding: 12, alignItems: "flex-start" },
  infoBannerText: { fontSize: 12, flex: 1, lineHeight: 17 },
  brokerCard: { borderRadius: 12, borderWidth: 2, padding: 14, gap: 10 },
  brokerRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  brokerAvatarWrap: { position: "relative" },
  brokerAvatar: { width: 52, height: 52, borderRadius: 26, borderWidth: 2, borderColor: "#ede9fe" },
  brokerOnline: { position: "absolute", bottom: 1, right: 1, width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: "#fff" },
  brokerNameRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  brokerName: { fontSize: 14, fontWeight: "700" },
  prevTag: { backgroundColor: "#ede9fe", paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  prevTagText: { color: "#7c3aed", fontSize: 9, fontWeight: "700" },
  nearbyTag: { backgroundColor: "#dcfce7", paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  nearbyTagText: { color: "#16a34a", fontSize: 9, fontWeight: "700" },
  brokerFirm: { fontSize: 11, marginTop: 2 },
  brokerLoc: { fontSize: 11, marginTop: 1 },
  brokerStats: { flexDirection: "row", alignItems: "center", gap: 10, borderTopWidth: 1, paddingTop: 8, flexWrap: "wrap" },
  feePill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  directCard: { borderRadius: 12, borderWidth: 2, padding: 14 },
  directIcon: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  summaryPill: { borderRadius: 10, borderWidth: 1, padding: 12, gap: 3 },
  kycSection: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 12 },
  kycSectionTitle: { fontSize: 10, fontWeight: "800", letterSpacing: 1, textTransform: "uppercase" },
  fieldWrap: { gap: 5 },
  fieldLabel: { fontSize: 12, fontWeight: "600", color: "#475569" },
  fieldInput: { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 8, paddingHorizontal: 12, height: 44, fontSize: 14, color: "#0f172a", backgroundColor: "#f8fafc" },
  docProgress: { borderRadius: 10, borderWidth: 1, padding: 12, gap: 8 },
  docProgressLabel: { fontSize: 12, fontWeight: "600" },
  docProgressBarWrap: { height: 6, backgroundColor: "#e2e8f0", borderRadius: 3, overflow: "hidden" },
  docProgressBar: { height: 6, backgroundColor: "#16a34a", borderRadius: 3 },
  docCard: { borderRadius: 12, borderWidth: 1.5, padding: 12, gap: 10 },
  docCardRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  docIconWrap: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  docLabelRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  docLabel: { fontSize: 13, fontWeight: "600", flex: 1 },
  reqStar: { color: "#dc2626", fontSize: 14, fontWeight: "800" },
  docDesc: { fontSize: 11, marginTop: 2, lineHeight: 15 },
  uploadBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, height: 36, borderRadius: 8 },
  uploadBtnText: { fontSize: 13, fontWeight: "600" },
  qrBuidCard: { borderRadius: 14, padding: 18, alignItems: "center", gap: 8 },
  qrBuidHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  qrBuidTitle: { color: "#fff", fontSize: 12, fontWeight: "700" },
  qrBuidId: { color: "#f97316", fontSize: 14, fontWeight: "800", letterSpacing: 1 },
  miniQrWrap: { flexDirection: "column", gap: 2, padding: 6, backgroundColor: "rgba(255,255,255,0.07)", borderRadius: 8 },
  miniQrRow: { flexDirection: "row", gap: 2 },
  miniQrCell: { width: 11, height: 11, borderRadius: 1 },
  qrBuidSub: { color: "rgba(255,255,255,0.55)", fontSize: 10 },
  summaryCard: { borderRadius: 12, borderWidth: 1, padding: 14 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: "#e2e8f0" },
  summaryLabel: { fontSize: 12, color: "#64748b" },
  summaryValue: { fontSize: 12, fontWeight: "600", color: "#0f172a", flex: 1, textAlign: "right", marginLeft: 12 },
  footer: { flexDirection: "row", gap: 10, paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1 },
  secondaryBtn: { flex: 1, borderWidth: 1, borderRadius: 10, height: 48, alignItems: "center", justifyContent: "center" },
  secondaryBtnText: { fontSize: 15, fontWeight: "600" },
  primaryBtn: { flex: 2, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 48, borderRadius: 10 },
  primaryBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  empty: { alignItems: "center", paddingVertical: 40, gap: 10 },
  emptyText: { fontSize: 14, textAlign: "center" },
});
