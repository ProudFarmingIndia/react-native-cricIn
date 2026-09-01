import React from "react";

import {
  View,
  Text,
  StyleSheet,
} from "react-native";

import {
  MaterialCommunityIcons,
} from "@expo/vector-icons";

import { COLORS } from "../../../constants/colors";

export default function TeamMatchCard({
  title,
  value,
  color = COLORS.primary,
}) {
  return (
    <View style={styles.card}>
      <MaterialCommunityIcons
        name="cricket"
        size={28}
        color={color}
      />

      <Text style={styles.value}>
        {value}
      </Text>

      <Text style={styles.title}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,

    backgroundColor:
      COLORS.surfaceContainerLowest,

    borderRadius: 16,

    paddingVertical: 20,

    alignItems: "center",

    marginHorizontal: 6,

    borderWidth: 1,

    borderColor: COLORS.outlineVariant,
  },

  value: {
    marginTop: 12,

    fontSize: 22,

    fontWeight: "700",

    color: COLORS.onSurface,
  },

  title: {
    marginTop: 6,

    fontSize: 13,

    color: COLORS.onSurfaceVariant,
  },
});