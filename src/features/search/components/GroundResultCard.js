import React from "react";

import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../../constants/colors";

export default function GroundResultCard({ ground, onPress }) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.75} onPress={() => onPress?.(ground)}>
      <View style={styles.iconContainer}>
        <Ionicons name="location" size={20} color={COLORS.primary} />
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{ground.groundName}</Text>

        <Text style={styles.subtitle} numberOfLines={1}>
          {[ground.city, ground.state].filter(Boolean).join(", ")}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={18} color={COLORS.outline} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryContainer,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  content: {
    flex: 1,
  },

  name: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.onSurface,
  },

  subtitle: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },
});