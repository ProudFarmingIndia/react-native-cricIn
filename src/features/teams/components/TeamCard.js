import React from "react";

import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { COLORS } from "../../../constants/colors";

export default function TeamCard({
  team,
  onPress,
  selectable = false,
  selected = false,
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[styles.card, selected && styles.cardSelected]}
      onPress={onPress}
    >
      {/* ------------------------------------------------ */}
      {/* Banner / Logo */}
      {/* ------------------------------------------------ */}

      <View>
        <Image
          source={{
            uri: team.logo?.url || "https://placehold.co/600x300",
          }}
          style={styles.banner}
        />

        {selectable && (
          <View
            style={[
              styles.checkbox,
              selected && styles.checkboxSelected,
            ]}
          >
            {selected && (
              <Ionicons name="checkmark" size={16} color="#FFF" />
            )}
          </View>
        )}
      </View>

      {/* ------------------------------------------------ */}
      {/* Content */}
      {/* ------------------------------------------------ */}

      <View style={styles.content}>
        <View style={styles.row}>
          <View style={styles.left}>
            <Text style={styles.name}>{team.teamName}</Text>

            <Text style={styles.caption}>
              Captain: {team.captainId?.playerName || "Not Assigned"}
            </Text>
          </View>

          <View style={styles.right}>
            <Text style={styles.players}>{team.players?.length || 0}</Text>

            <Text style={styles.small}>Players</Text>
          </View>
        </View>

        {/* ---------------------------------------- */}
        {/* Location */}
        {/* ---------------------------------------- */}

        <View style={styles.locationRow}>
          <Ionicons
            name="location-outline"
            size={16}
            color={COLORS.onSurfaceVariant}
          />

          <Text style={styles.location}>
            {team.city || "Unknown"}
            {team.state ? `, ${team.state}` : ""}
          </Text>
        </View>

        {/* ---------------------------------------- */}
        {/* Stats */}
        {/* ---------------------------------------- */}

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{team.totalMatches || 0}</Text>

            <Text style={styles.statLabel}>Matches</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={[styles.statValue, styles.statestyle]}>
              {team.wins || 0}
            </Text>

            <Text style={styles.statLabel}>Wins</Text>
          </View>

          <View style={styles.statItem}>
            <Text
              style={[
                styles.statValue,
                {
                  color: COLORS.primary,
                },
              ]}
            >
              {team.winPercentage || 0}%
            </Text>

            <Text style={styles.statLabel}>Win %</Text>
          </View>
        </View>

        {/* ---------------------------------------- */}
        {/* View Details */}
        {/* ---------------------------------------- */}

        <View style={styles.button}>
          <Text style={styles.buttonText}>View Team</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,

    marginBottom: 16,

    borderRadius: 18,

    overflow: "hidden",

    backgroundColor: COLORS.surfaceContainerLowest,

    borderWidth: 1,

    borderColor: COLORS.outlineVariant,
  },

  cardSelected: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },

  checkbox: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: "#FFF",
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },

  checkboxSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  banner: {
    width: "100%",

    height: 170,

    backgroundColor: "#ECECEC",
  },

  content: {
    padding: 16,
  },

  row: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",
  },

  left: {
    flex: 1,
  },

  right: {
    alignItems: "center",
  },

  name: {
    fontSize: 18,

    fontWeight: "700",

    color: COLORS.onSurface,
  },

  caption: {
    marginTop: 6,

    color: COLORS.onSurfaceVariant,
  },

  players: {
    fontSize: 22,

    fontWeight: "700",

    color: COLORS.primary,
  },

  small: {
    fontSize: 12,

    color: COLORS.onSurfaceVariant,
  },

  locationRow: {
    flexDirection: "row",

    alignItems: "center",

    marginTop: 14,
  },

  location: {
    marginLeft: 6,

    color: COLORS.onSurfaceVariant,
  },

  statsRow: {
    flexDirection: "row",

    justifyContent: "space-between",

    marginTop: 18,
  },

  statItem: {
    alignItems: "center",

    flex: 1,
  },

  statValue: {
    fontSize: 18,

    fontWeight: "700",

    color: COLORS.onSurface,
  },

  statLabel: {
    marginTop: 4,

    fontSize: 12,

    color: COLORS.onSurfaceVariant,
  },

  button: {
    marginTop: 18,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },

  buttonText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 15,
  },
  statestyle: {
    color: "#16A34A",
  },
});
