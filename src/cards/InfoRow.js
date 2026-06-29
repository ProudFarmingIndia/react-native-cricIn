import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../constants/colors";

export default function InfoRow({
  label,
  value,
}) {
  if (!value) return null;

  return (
    <View style={styles.row}>
      <Text style={styles.label}>
        {label}
      </Text>

      <Text style={styles.value}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },

  label: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
  },

  value: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.onSurface,
    maxWidth: "55%",
    textAlign: "right",
  },
});