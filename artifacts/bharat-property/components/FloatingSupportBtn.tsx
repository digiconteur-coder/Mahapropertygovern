import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useRef, useState } from "react";
import { Animated, Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const SUPPORT_ACTIONS = [
  { icon: "message-circle", label: "WhatsApp", color: "#25D366", bg: "#dcfce7", action: "whatsapp" },
  { icon: "phone", label: "Call", color: "#1d4ed8", bg: "#dbeafe", action: "call" },
  { icon: "mail", label: "Email", color: "#7c3aed", bg: "#ede9fe", action: "email" },
  { icon: "message-square", label: "SMS", color: "#d97706", bg: "#fef3c7", action: "sms" },
];

const HELPLINE = "18001080";
const WA_NUMBER = "919999180108";
const SUPPORT_EMAIL = "support@bpcs.gov.in";

export function FloatingSupportBtn() {
  const [open, setOpen] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const toggleOpen = () => {
    Haptics.selectionAsync();
    const toValue = open ? 0 : 1;
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue, useNativeDriver: true, damping: 12 }),
      Animated.spring(rotateAnim, { toValue, useNativeDriver: true, damping: 15 }),
    ]).start();
    setOpen(!open);
  };

  const handleAction = (action: string) => {
    setOpen(false);
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 0, useNativeDriver: true }),
      Animated.spring(rotateAnim, { toValue: 0, useNativeDriver: true }),
    ]).start();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    setTimeout(() => {
      if (action === "whatsapp") {
        Linking.openURL(`https://wa.me/${WA_NUMBER}?text=Namaste%2C%20I%20need%20help%20with%20Bharat%20Property%20Card%20System`).catch(() => {});
      } else if (action === "call") {
        Linking.openURL(`tel:${HELPLINE}`).catch(() => {});
      } else if (action === "email") {
        Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=BPCS%20Support%20Query`).catch(() => {});
      } else if (action === "sms") {
        Linking.openURL(`sms:${HELPLINE}`).catch(() => {});
      }
    }, 100);
  };

  const spin = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "45deg"] });

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      {/* Expanded options */}
      {SUPPORT_ACTIONS.map((item, idx) => {
        const itemScale = scaleAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
        const itemOpacity = scaleAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0, 1] });
        const bottom = 72 + (SUPPORT_ACTIONS.length - idx) * 60;
        return (
          <Animated.View
            key={item.action}
            style={[styles.miniBtn, { bottom, transform: [{ scale: itemScale }], opacity: itemOpacity }]}
          >
            <TouchableOpacity
              style={[styles.miniBtnInner, { backgroundColor: item.bg }]}
              onPress={() => handleAction(item.action)}
              activeOpacity={0.8}
            >
              <Feather name={item.icon as any} size={18} color={item.color} />
            </TouchableOpacity>
            <View style={[styles.miniBtnLabel, { backgroundColor: "rgba(0,0,0,0.75)" }]}>
              <Text style={styles.miniBtnLabelText}>{item.label}</Text>
            </View>
          </Animated.View>
        );
      })}

      {/* 24x7 label */}
      {open && (
        <View style={styles.badge247}>
          <Feather name="headphones" size={10} color="#fff" />
          <Text style={styles.badge247Text}>24×7 Support</Text>
        </View>
      )}

      {/* Main FAB */}
      <TouchableOpacity style={styles.fab} onPress={toggleOpen} activeOpacity={0.85}>
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Feather name={open ? "x" : "headphones"} size={24} color="#fff" />
        </Animated.View>
        {!open && (
          <View style={styles.fabDot} />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    bottom: Platform.OS === "web" ? 100 : 90,
    right: 16,
    alignItems: "flex-end",
    zIndex: 999,
  },
  fab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#25D366",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  fabDot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#f97316",
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  miniBtn: {
    position: "absolute",
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  miniBtnInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  miniBtnLabel: {
    position: "absolute",
    right: 52,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  miniBtnLabelText: { color: "#fff", fontSize: 11, fontWeight: "600" },
  badge247: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    position: "absolute",
    bottom: 58,
    right: 0,
    backgroundColor: "#1e3a8a",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badge247Text: { color: "#fff", fontSize: 10, fontWeight: "700" },
});
