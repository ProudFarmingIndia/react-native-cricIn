import React from "react";

import { View, Text, StyleSheet } from "react-native";

import { COLORS } from "../../../constants/colors";

/*
|--------------------------------------------------------------------------
| Match Hero Card
|--------------------------------------------------------------------------
*/

export default function MatchHeroCard({
  teamAName = "Team A",
  teamBName = "Team B",
  firstInnings,
  secondInnings,
  status = "upcoming",
}) {
  return (
    <View style={styles.card}>
      <View style={styles.teamRow}>
        <Text style={styles.team}>{teamAName}</Text>

        <Text style={styles.score}>
          {firstInnings ? `${firstInnings.runs}/${firstInnings.wickets}` : "-"}
        </Text>

        <Text style={styles.overs}>{firstInnings ? `(${firstInnings.overs})` : ""}</Text>
      </View>

      {status === "live" && (
        <View style={styles.liveBadge}>
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      )}

      <View style={styles.teamRow}>
        <Text style={styles.team}>{teamBName}</Text>

        <Text style={styles.score}>
          {secondInnings ? `${secondInnings.runs}/${secondInnings.wickets}` : "-"}
        </Text>

        <Text style={styles.overs}>{secondInnings ? `(${secondInnings.overs})` : ""}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    margin: 16,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  teamRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },

  team: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.onSurface,
  },

  score: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.primary,
  },

  overs: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    marginLeft: 6,
  },

  liveBadge: {
    alignSelf: "center",
    backgroundColor: COLORS.errorContainer,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginVertical: 6,
  },

  liveText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.error,
  },
});
