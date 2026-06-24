import React from "react";

import {
  View,
  Text,
  StyleSheet,
} from "react-native";

export default function TeamStatsCards({
  stats,
}) {
  return (
    <View style={styles.row}>
      <View style={styles.card}>
        <Text style={styles.label}>
          Matches
        </Text>

        <Text style={styles.value}>
          {stats.matches}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>
          Win Rate
        </Text>

        <Text style={styles.value}>
          {stats.winRate}%
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>
          Strength
        </Text>

        <Text style={styles.value}>
          {stats.strength}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    marginBottom: 20,
  },

  card: {
    width: "31%",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },

  label: {
    color: "#777",
    fontSize: 12,
  },

  value: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 8,
  },
});