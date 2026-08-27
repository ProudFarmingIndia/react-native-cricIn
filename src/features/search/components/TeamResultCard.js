import React from "react";

import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../../constants/colors";

export default function TeamResultCard({ team, onPress }) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.75} onPress={() => onPress?.(team)}>
      <Image
        source={{ uri: team?.logo?.url || "https://placehold.co/100" }}
        style={styles.logo}
      />

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{team.teamName}</Text>

        <Text style={styles.subtitle} numberOfLines={1}>
          {[team.city, team.country].filter(Boolean).join(", ") || team.teamType}
        </Text>
      </View>

      {team.rating > 0 && (
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={11} color={COLORS.secondary} />
          <Text style={styles.ratingText}>{team.rating.toFixed(1)}</Text>
        </View>
      )}

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

  logo: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceVariant,
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

  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
  },

  ratingText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.secondary,
    marginLeft: 3,
  },
});