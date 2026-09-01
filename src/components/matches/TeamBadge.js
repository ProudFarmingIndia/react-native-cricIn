import React from "react";

import { View, Text, Image, StyleSheet } from "react-native";

import { COLORS } from "../../constants/colors";

/*
|--------------------------------------------------------------------------
| Team Badge
|--------------------------------------------------------------------------
|
| A team's logo, or its short name on a coloured disc when it has none.
|
| Every match card in the app previously showed teams as plain text -
| "GaganTeam vs Ajay choudhary Team" - which forced long names to truncate
| ("Ajay choudha...") and made two cards for the same fixture look
| identical at a glance. A logo is the thing the eye actually picks out in
| a list.
|
| The fallback is deliberately the SHORT NAME rather than initials: teams
| already have one, captains chose it, and "AJC" is more recognisable to
| its own players than "AT" would be.
|
*/

const initialsOf = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

export default function TeamBadge({ team, size = 40, style }) {
  const dimension = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  if (team?.logo?.url) {
    return (
      <Image
        source={{ uri: team.logo.url }}
        style={[styles.badge, dimension, style]}
      />
    );
  }

  const label =
    team?.shortName || initialsOf(team?.teamName || "") || "?";

  return (
    <View style={[styles.badge, styles.fallback, dimension, style]}>
      <Text
        style={[styles.label, { fontSize: Math.max(10, size * 0.32) }]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: COLORS.surfaceContainerHigh,
  },

  fallback: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 2,
  },

  label: {
    fontWeight: "800",
    letterSpacing: 0.3,
    color: COLORS.onPrimary,
  },
});
