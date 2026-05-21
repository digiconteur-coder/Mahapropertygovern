import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  verified: { label: "Verified", bg: "#dcfce7", text: "#15803d" },
  under_review: { label: "Under Review", bg: "#fef9c3", text: "#a16207" },
  disputed: { label: "Disputed", bg: "#fee2e2", text: "#dc2626" },
  frozen: { label: "Frozen", bg: "#e0e7ff", text: "#3730a3" },
  initiated: { label: "Initiated", bg: "#dbeafe", text: "#1d4ed8" },
  verifying: { label: "Verifying", bg: "#fef9c3", text: "#a16207" },
  approved: { label: "Approved", bg: "#dcfce7", text: "#15803d" },
  completed: { label: "Completed", bg: "#d1fae5", text: "#065f46" },
  rejected: { label: "Rejected", bg: "#fee2e2", text: "#dc2626" },
  pending: { label: "Pending", bg: "#fef9c3", text: "#a16207" },
  active: { label: "Active", bg: "#dcfce7", text: "#15803d" },
  closed: { label: "Closed", bg: "#f1f5f9", text: "#64748b" },
  open: { label: "Open", bg: "#fee2e2", text: "#dc2626" },
  resolved: { label: "Resolved", bg: "#dcfce7", text: "#15803d" },
  available: { label: "Available", bg: "#dcfce7", text: "#15803d" },
  booked: { label: "Booked", bg: "#fef9c3", text: "#a16207" },
  sold: { label: "Sold", bg: "#f1f5f9", text: "#64748b" },
};

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || { label: status, bg: "#f1f5f9", text: "#64748b" };

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }, size === "sm" && styles.sm]}>
      <Text style={[styles.text, { color: config.text }, size === "sm" && styles.textSm]}>
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  sm: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
  },
  textSm: {
    fontSize: 10,
  },
});
