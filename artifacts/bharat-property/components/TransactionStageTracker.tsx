import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

export type TxStage = 1 | 2 | 3 | 4 | 5 | 6;

export const TX_STAGES: { label: string; short: string; icon: string; color: string }[] = [
  { label: "Initiated",     short: "INIT",   icon: "play-circle",  color: "#6366f1" },
  { label: "CPF Attached",  short: "CPF",    icon: "users",        color: "#0ea5e9" },
  { label: "Lawyer Review", short: "LEGAL",  icon: "file-text",    color: "#f59e0b" },
  { label: "Bank Escrow",   short: "ESCROW", icon: "lock",         color: "#8b5cf6" },
  { label: "Govt Approval", short: "GOVT",   icon: "shield",       color: "#1e3a8a" },
  { label: "Completed",     short: "DONE",   icon: "check-circle", color: "#16a34a" },
];

interface Props {
  stage: TxStage;
  compact?: boolean;
}

export function TransactionStageTracker({ stage, compact = false }: Props) {
  const colors = useColors();

  if (compact) {
    return (
      <View style={styles.compactWrap}>
        {TX_STAGES.map((s, i) => {
          const stageNum = (i + 1) as TxStage;
          const done = stage > stageNum;
          const active = stage === stageNum;
          const color = done || active ? s.color : colors.border;
          return (
            <React.Fragment key={s.short}>
              <View style={[
                styles.compactDot,
                { backgroundColor: done ? s.color : active ? s.color : "#e2e8f0", borderColor: color }
              ]}>
                {done && <Feather name="check" size={7} color="#fff" />}
              </View>
              {i < TX_STAGES.length - 1 && (
                <View style={[styles.compactLine, { backgroundColor: done ? TX_STAGES[i].color : "#e2e8f0" }]} />
              )}
            </React.Fragment>
          );
        })}
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      {TX_STAGES.map((s, i) => {
        const stageNum = (i + 1) as TxStage;
        const done = stage > stageNum;
        const active = stage === stageNum;

        return (
          <View key={s.short} style={styles.stepWrap}>
            {/* Connector line */}
            {i > 0 && (
              <View style={[
                styles.connector,
                { backgroundColor: stage > i ? TX_STAGES[i - 1].color : "#e2e8f0" }
              ]} />
            )}

            {/* Step circle */}
            <View style={[
              styles.circle,
              {
                backgroundColor: done ? s.color : active ? s.color : "#f1f5f9",
                borderColor: done || active ? s.color : "#e2e8f0",
              }
            ]}>
              {done ? (
                <Feather name="check" size={12} color="#fff" />
              ) : (
                <Feather
                  name={s.icon as any}
                  size={12}
                  color={active ? "#fff" : "#94a3b8"}
                />
              )}
            </View>

            {/* Label */}
            <Text style={[
              styles.stageLabel,
              { color: done || active ? s.color : "#94a3b8", fontWeight: active ? "700" : "500" }
            ]}>
              {s.short}
            </Text>

            {active && (
              <View style={[styles.activePill, { backgroundColor: s.color + "20" }]}>
                <Text style={[styles.activePillText, { color: s.color }]}>
                  {s.label}
                </Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 4,
    paddingTop: 8,
    paddingBottom: 4,
  },
  stepWrap: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    position: "relative",
  },
  connector: {
    position: "absolute",
    top: 12,
    right: "50%",
    left: -20,
    height: 2,
    zIndex: 0,
  },
  circle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  stageLabel: {
    fontSize: 9,
    fontWeight: "600",
    letterSpacing: 0.3,
    textAlign: "center",
  },
  activePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 2,
  },
  activePillText: {
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  compactWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 0,
  },
  compactDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  compactLine: {
    height: 2,
    flex: 1,
  },
});
