import React from "react";
import { View, Text, StyleSheet } from "react-native";

import { COLORS } from "../constants/colors";

export default function RankingCard({ title, value }) {
  return (
    <View style={styles.card}>
      <Text style={styles.value}>#{value || "-"}</Text>

      <Text style={styles.label}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: COLORS.primaryContainer,
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: "center",
    marginHorizontal: 4,
  },
  value: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
  label: {
    marginTop: 6,
    color: "#fff",
    fontSize: 12,
  },
});
