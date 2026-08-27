import React from "react";

import { View, Text, StyleSheet } from "react-native";

import { COLORS } from "../../../constants/colors";

/*
|--------------------------------------------------------------------------
| FOWTab — Fall of Wickets
|--------------------------------------------------------------------------
|
| Props:
|   fow — array from getFullScorecardByInnings fow field:
|     [{ wicketNumber, playerName, runs, over, wicketType }]
|
| Runs here are the ACCURATE running total at the moment the wicket fell
| (computed by the Batch 5 backend, not the final innings score).
|
*/

const WICKET_ICONS = {
  bowled: "🏏",
  caught: "🤝",
  runOut: "🏃",
  stumped: "🧤",
  hitWicket: "😬",
  lbw: "🦵",
  retired: "🚪",
  obstructingField: "🚫",
};

const getWicketIcon = (type) => WICKET_ICONS[type] ?? "❌";

export default function FOWTab({ fow = [] }) {
  if (!fow.length) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No wickets fallen yet.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {fow.map((wicket, idx) => (
        <View key={idx} style={styles.row}>
          {/* ── Wicket Number Badge ───────────────────────── */}

          <View style={styles.badge}>
            <Text style={styles.badgeText}>{wicket.wicketNumber}</Text>
          </View>

          {/* ── Wicket Details ────────────────────────────── */}

          <View style={styles.details}>
            <View style={styles.detailsTop}>
              <Text style={styles.playerName}>{wicket.playerName}</Text>

              <Text style={styles.icon}>{getWicketIcon(wicket.wicketType)}</Text>
            </View>

            <View style={styles.detailsBottom}>
              <Text style={styles.wicketType}>{wicket.wicketType ?? "out"}</Text>

              <Text style={styles.separator}>•</Text>

              <Text style={styles.over}>Over {wicket.over}</Text>
            </View>
          </View>

          {/* ── Score at Fall ─────────────────────────────── */}

          <View style={styles.scoreBlock}>
            <Text style={styles.scoreAtFall}>{wicket.runs}</Text>

            <Text style={styles.scoreLabel}>runs</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  badge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary + "18",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  badgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.primary,
  },

  details: {
    flex: 1,
    marginRight: 12,
  },

  detailsTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },

  playerName: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.onSurface,
    flex: 1,
  },

  icon: {
    fontSize: 16,
    marginLeft: 6,
  },

  detailsBottom: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  wicketType: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    fontWeight: "500",
    textTransform: "capitalize",
  },

  separator: {
    color: COLORS.outlineVariant,
    fontSize: 12,
  },

  over: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
  },

  scoreBlock: {
    alignItems: "center",
  },

  scoreAtFall: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.primary,
  },

  scoreLabel: {
    fontSize: 10,
    color: COLORS.onSurfaceVariant,
    fontWeight: "600",
  },

  empty: {
    padding: 32,
    alignItems: "center",
  },

  emptyText: {
    color: COLORS.onSurfaceVariant,
    fontSize: 14,
  },
});