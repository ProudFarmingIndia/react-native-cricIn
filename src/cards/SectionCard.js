import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";

import { COLORS } from "../constants/colors";

export default function SectionCard({
  title,
  children,
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>
        {title}
      </Text>

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor:
      COLORS.surfaceContainerLowest,

    marginHorizontal: 16,
    marginTop: 16,

    padding: 16,

    borderRadius: 18,

    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.onSurface,
    marginBottom: 12,
  },
});