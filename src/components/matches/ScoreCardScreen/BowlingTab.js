import React from "react";

import { View, Text, ScrollView, StyleSheet } from "react-native";

import { COLORS } from "../../../constants/colors";

/*
|--------------------------------------------------------------------------
| BowlingTab
|--------------------------------------------------------------------------
|
| Props:
|   bowling — array from getFullScorecardByInnings bowling field:
|     [{ playerId, playerName, overs, legalBalls, runsConceded,
|        wickets, maidens, economy }]
|
*/

const COL_WIDTHS = {
  name: 130,
  overs: 50,
  maidens: 40,
  runs: 45,
  wickets: 40,
  economy: 55,
};

export default function BowlingTab({ bowling = [] }) {
  if (!bowling.length) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No bowling data yet.</Text>
      </View>
    );
  }

  // Sort: most wickets first; equal wickets → least runs
  const sorted = [...bowling].sort((a, b) =>
    b.wickets !== a.wickets ? b.wickets - a.wickets : a.runsConceded - b.runsConceded,
  );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.outerScroll}
    >
      <View>
        {/* ── Header ──────────────────────────────────── */}

        <View style={[styles.row, styles.headerRow]}>
          <Text style={[styles.cell, styles.headerCell, { width: COL_WIDTHS.name }]}>
            Bowler
          </Text>

          <Text style={[styles.cellCenter, styles.headerCell, { width: COL_WIDTHS.overs }]}>
            O
          </Text>

          <Text style={[styles.cellCenter, styles.headerCell, { width: COL_WIDTHS.maidens }]}>
            M
          </Text>

          <Text style={[styles.cellCenter, styles.headerCell, { width: COL_WIDTHS.runs }]}>
            R
          </Text>

          <Text style={[styles.cellCenter, styles.headerCell, { width: COL_WIDTHS.wickets }]}>
            W
          </Text>

          <Text style={[styles.cellCenter, styles.headerCell, { width: COL_WIDTHS.economy }]}>
            ECO
          </Text>
        </View>

        {/* ── Data Rows ────────────────────────────────── */}

        {sorted.map((bowler, idx) => (
          <View
            key={bowler.playerId || idx}
            style={[
              styles.row,
              idx % 2 === 0 ? styles.rowEven : styles.rowOdd,
            ]}
          >
            <Text
              style={[styles.cell, { width: COL_WIDTHS.name }]}
              numberOfLines={1}
            >
              {bowler.playerName}
            </Text>

            <Text style={[styles.cellCenter, { width: COL_WIDTHS.overs }]}>
              {bowler.overs}
            </Text>

            <Text style={[styles.cellCenter, { width: COL_WIDTHS.maidens }]}>
              {bowler.maidens}
            </Text>

            <Text style={[styles.cellCenter, { width: COL_WIDTHS.runs }]}>
              {bowler.runsConceded}
            </Text>

            <Text
              style={[
                styles.cellCenter,
                styles.wicketValue,
                { width: COL_WIDTHS.wickets },
              ]}
            >
              {bowler.wickets}
            </Text>

            <Text
              style={[
                styles.cellCenter,
                bowler.economy <= 6 ? styles.goodEco : bowler.economy >= 10 ? styles.badEco : null,
                { width: COL_WIDTHS.economy },
              ]}
            >
              {bowler.economy}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  outerScroll: {
    paddingBottom: 12,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
    paddingHorizontal: 14,
    minHeight: 44,
  },

  headerRow: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.outlineVariant,
  },

  rowEven: {
    backgroundColor: "#fff",
  },

  rowOdd: {
    backgroundColor: COLORS.background,
  },

  cell: {
    fontSize: 13,
    color: COLORS.onSurface,
    fontWeight: "500",
    paddingRight: 8,
  },

  cellCenter: {
    fontSize: 13,
    color: COLORS.onSurface,
    fontWeight: "500",
    textAlign: "center",
  },

  headerCell: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.onSurfaceVariant,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },

  wicketValue: {
    fontWeight: "800",
    fontSize: 15,
    color: COLORS.primary,
  },

  goodEco: {
    color: "#2e7d32",
    fontWeight: "700",
  },

  badEco: {
    color: COLORS.error,
    fontWeight: "700",
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