import React from "react";

import { View, Text, StyleSheet } from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../../constants/colors";

/*
|--------------------------------------------------------------------------
| Coming Soon Tab
|--------------------------------------------------------------------------
|
| Used for analytics that need more than Phase 1 has time for (win
| probability modeling, worm graphs, deeper insights) - shown honestly
| as not-yet-built rather than filled with fabricated numbers.
*/

export default function ComingSoonTab({ label }) {
  return (
    <View style={styles.container}>
      <Ionicons name="construct-outline" size={32} color={COLORS.onSurfaceVariant} />
      <Text style={styles.text}>{label} is coming in a future update.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 40,
    alignItems: "center",
  },

  text: {
    marginTop: 12,
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
  },
});
