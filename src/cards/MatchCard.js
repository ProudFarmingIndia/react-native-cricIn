import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";

import { COLORS } from "../constants/colors";

export default function MatchCard({
  match,
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>
        {match?.title}
      </Text>

      <Text style={styles.subtitle}>
        {match?.date}
      </Text>

      <Text style={styles.result}>
        {match?.result}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 12,

    padding: 16,

    borderRadius: 16,

    backgroundColor:
      COLORS.surfaceContainerLowest,

    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  title: {
    fontSize: 16,
    fontWeight: "700",
  },

  subtitle: {
    marginTop: 6,
    color: COLORS.onSurfaceVariant,
  },

  result: {
    marginTop: 10,
    color: COLORS.primary,
    fontWeight: "700",
  },
});