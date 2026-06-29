import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";

import { COLORS } from "../constants/colors";

export default function StatCard({
  label,
  value,
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.value}>
        {value ?? 0}
      </Text>

      <Text style={styles.label}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: "45%",

    backgroundColor:
      COLORS.surfaceContainerLowest,

    borderRadius: 16,

    paddingVertical: 20,

    alignItems: "center",

    margin: 6,

    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  value: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.primary,
  },

  label: {
    marginTop: 8,
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
  },
});