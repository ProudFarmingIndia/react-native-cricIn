import React from "react";

import { View, Text, StyleSheet } from "react-native";

import { COLORS } from "../../../constants/colors";

export default function PartnershipTab({ partnerships = [] }) {
  if (partnerships.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No partnership data yet.</Text>
      </View>
    );
  }

  const best = partnerships.reduce(
    (max, p) => (p.runs > (max?.runs || 0) ? p : max),
    null,
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Best Partnership</Text>

      <Text style={styles.bigNumber}>{best.runs} runs</Text>

      <Text style={styles.subtext}>
        {best.playerAName} & {best.playerBName} - {best.balls} balls
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },

  emptyContainer: {
    padding: 24,
    alignItems: "center",
  },

  emptyText: {
    color: COLORS.onSurfaceVariant,
  },

  label: {
    color: COLORS.onSurfaceVariant,
    fontWeight: "600",
  },

  bigNumber: {
    fontSize: 32,
    fontWeight: "700",
    color: COLORS.primary,
    marginTop: 6,
  },

  subtext: {
    color: COLORS.onSurfaceVariant,
    marginTop: 4,
  },
});
