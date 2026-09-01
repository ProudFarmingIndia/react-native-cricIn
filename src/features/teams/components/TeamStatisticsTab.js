import React from "react";

import {
  View,
  Text,
  StyleSheet,
} from "react-native";

import { COLORS } from "../../../constants/colors";

const StatCard = ({
    title,
    value,
  }) => (
    <View style={styles.statCard}>
      <Text style={styles.value}>
        {value}
      </Text>

      <Text style={styles.label}>
        {title}
      </Text>
    </View>
  );
export default function TeamStatisticsTab({
  team,
}) {
  /*
  |--------------------------------------------------------------------------
  | Statistics
  |--------------------------------------------------------------------------
  */

  const totalMatches = team?.totalMatches || 0;

  const wins = team?.wins || 0;

  const losses = team?.losses || 0;

  const draws = team?.draws || 0;

  const winPercentage =
    team?.winPercentage || 0;

  const ranking = team?.ranking || {};

  /*
  |--------------------------------------------------------------------------
  | Stat Card
  |--------------------------------------------------------------------------
  */


  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <View style={styles.container}>
      {/* ------------------------------------------------ */}
      {/* Match Statistics */}
      {/* ------------------------------------------------ */}

      <Text style={styles.sectionTitle}>
        Match Statistics
      </Text>

      <View style={styles.grid}>
        <StatCard
          title="Matches"
          value={totalMatches}
        />

        <StatCard
          title="Wins"
          value={wins}
        />

        <StatCard
          title="Losses"
          value={losses}
        />

        <StatCard
          title="Draws"
          value={draws}
        />

        <StatCard
          title="Win %"
          value={`${winPercentage}%`}
        />
      </View>

      {/* ------------------------------------------------ */}
      {/* Rankings */}
      {/* ------------------------------------------------ */}

      <Text style={styles.sectionTitle}>
        Rankings
      </Text>

      <View style={styles.grid}>
        <StatCard
          title="City"
          value={
            ranking.city || "-"
          }
        />

        <StatCard
          title="State"
          value={
            ranking.state || "-"
          }
        />

        <StatCard
          title="National"
          value={
            ranking.national || "-"
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,

    paddingTop: 18,

    paddingBottom: 40,
  },

  sectionTitle: {
    fontSize: 18,

    fontWeight: "700",

    color: COLORS.onSurface,

    marginBottom: 14,

    marginTop: 8,
  },

  grid: {
    flexDirection: "row",

    flexWrap: "wrap",

    justifyContent: "space-between",

    marginBottom: 20,
  },

  statCard: {
    width: "48%",

    backgroundColor:
      COLORS.surfaceContainerLowest,

    borderRadius: 16,

    paddingVertical: 20,

    marginBottom: 14,

    alignItems: "center",

    borderWidth: 1,

    borderColor: COLORS.outlineVariant,
  },

  value: {
    fontSize: 22,

    fontWeight: "700",

    color: COLORS.primary,
  },

  label: {
    marginTop: 8,

    fontSize: 13,

    color: COLORS.onSurfaceVariant,

    textAlign: "center",
  },
});