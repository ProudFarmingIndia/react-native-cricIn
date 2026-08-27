import React from "react";

import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../../constants/colors";

export default function PlayerResultCard({ player, onPress }) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.75} onPress={() => onPress?.(player)}>
      <Image
        source={{ uri: player?.profileImage?.url || "https://placehold.co/100" }}
        style={styles.avatar}
      />

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{player.playerName}</Text>

        {!!player.playerType && (
          <Text style={styles.subtitle} numberOfLines={1}>{player.playerType}</Text>
        )}
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

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
});