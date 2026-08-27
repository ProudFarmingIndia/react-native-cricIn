import React from "react";

import { View, Text, StyleSheet } from "react-native";

import { COLORS } from "../../../constants/colors";

export default function SummaryTab({ totalRuns = 0, boundaries = 0, extras = 0, wickets = 0 }) {
  const rows = [
    { label: "Total Runs", value: totalRuns },
    { label: "Boundaries (4s + 6s)", value: boundaries },
    { label: "Extras", value: extras },
    { label: "Wickets", value: wickets },
  ];

  return (
    <View style={styles.container}>
      {rows.map((row) => (
        <View key={row.label} style={styles.row}>
          <Text style={styles.label}>{row.label}</Text>
          <Text style={styles.value}>{row.value}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },

  label: {
    color: COLORS.onSurfaceVariant,
    fontWeight: "600",
  },

  value: {
    fontWeight: "700",
    color: COLORS.onSurface,
    fontSize: 16,
  },
});
