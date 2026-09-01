import React from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import {
  MaterialCommunityIcons,
  Ionicons,
} from "@expo/vector-icons";

import { COLORS } from "../../../constants/colors";

export default function UpcomingMatchCard({
  match,

  onPress,
}) {
  if (!match) {
    return (
      <View style={styles.emptyCard}>
        <MaterialCommunityIcons
          name="calendar-remove"
          size={44}
          color={COLORS.outline}
        />

        <Text style={styles.emptyTitle}>
          No Upcoming Match
        </Text>

        <Text style={styles.emptySubtitle}>
          Schedule your next match.
        </Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.card}
      onPress={() => onPress?.(match)}
    >
      {/* -------------------------------- */}
      {/* Header */}
      {/* -------------------------------- */}

      <View style={styles.header}>
        <MaterialCommunityIcons
          name="cricket"
          size={24}
          color={COLORS.primary}
        />

        <Text style={styles.matchType}>
          {match.matchType}
        </Text>
      </View>

      {/* -------------------------------- */}
      {/* Teams */}
      {/* -------------------------------- */}

      <Text style={styles.teams}>
        {match.teamAName}
      </Text>

      <Text style={styles.vs}>
        VS
      </Text>

      <Text style={styles.teams}>
        {match.teamBName}
      </Text>

      {/* -------------------------------- */}
      {/* Date */}
      {/* -------------------------------- */}

      <View style={styles.infoRow}>
        <Ionicons
          name="calendar-outline"
          size={16}
          color={COLORS.onSurfaceVariant}
        />

        <Text style={styles.info}>
          {match.date}
        </Text>
      </View>

      {/* -------------------------------- */}
      {/* Ground */}
      {/* -------------------------------- */}

      <View style={styles.infoRow}>
        <Ionicons
          name="location-outline"
          size={16}
          color={COLORS.onSurfaceVariant}
        />

        <Text style={styles.info}>
          {match.ground}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 12,

    backgroundColor:
      COLORS.surfaceContainerLowest,

    borderRadius: 18,

    padding: 18,

    borderWidth: 1,

    borderColor: COLORS.outlineVariant,
  },

  header: {
    flexDirection: "row",

    alignItems: "center",

    marginBottom: 16,
  },

  matchType: {
    marginLeft: 10,

    fontSize: 16,

    fontWeight: "700",

    color: COLORS.primary,
  },

  teams: {
    fontSize: 18,

    fontWeight: "700",

    color: COLORS.onSurface,
  },

  vs: {
    marginVertical: 8,

    fontSize: 13,

    fontWeight: "700",

    color: COLORS.error,
  },

  infoRow: {
    flexDirection: "row",

    alignItems: "center",

    marginTop: 10,
  },

  info: {
    marginLeft: 8,

    fontSize: 14,

    color: COLORS.onSurfaceVariant,
  },

  emptyCard: {
    marginTop: 12,

    paddingVertical: 40,

    alignItems: "center",

    backgroundColor:
      COLORS.surfaceContainerLowest,

    borderRadius: 18,

    borderWidth: 1,

    borderColor: COLORS.outlineVariant,
  },

  emptyTitle: {
    marginTop: 12,

    fontSize: 18,

    fontWeight: "700",

    color: COLORS.onSurface,
  },

  emptySubtitle: {
    marginTop: 8,

    fontSize: 14,

    color: COLORS.onSurfaceVariant,
  },
});