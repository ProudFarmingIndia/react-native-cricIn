import React from "react";

import { View, Text, ScrollView, StyleSheet } from "react-native";

import { COLORS } from "../../../constants/colors";

/*
|--------------------------------------------------------------------------
| BattingTab
|--------------------------------------------------------------------------
|
| Props:
|   batting — array from getFullScorecardByInnings batting field:
|     [{ playerId, playerName, runs, balls, fours, sixes,
|        strikeRate, dismissal, isNotOut }]
|
*/

const COL_WIDTHS = {
  name: 130,
  dismissal: 150,
  runs: 45,
  balls: 45,
  fours: 35,
  sixes: 35,
  sr: 60,
};

export default function BattingTab({ batting = [] }) {
  if (!batting.length) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No batting data yet.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.outerScroll}
    >
      <View>
        {/* ── Header Row ────────────────────────────────── */}

        <View style={[styles.row, styles.headerRow]}>
          <Text
            style={[styles.cell, styles.headerCell, { width: COL_WIDTHS.name }]}
          >
            Batter
          </Text>

          <Text
            style={[
              styles.cell,
              styles.headerCell,
              { width: COL_WIDTHS.dismissal },
            ]}
          >
            Dismissal
          </Text>

          <Text
            style={[
              styles.cellCenter,
              styles.headerCell,
              { width: COL_WIDTHS.runs },
            ]}
          >
            R
          </Text>

          <Text
            style={[
              styles.cellCenter,
              styles.headerCell,
              { width: COL_WIDTHS.balls },
            ]}
          >
            B
          </Text>

          <Text
            style={[
              styles.cellCenter,
              styles.headerCell,
              { width: COL_WIDTHS.fours },
            ]}
          >
            4s
          </Text>

          <Text
            style={[
              styles.cellCenter,
              styles.headerCell,
              { width: COL_WIDTHS.sixes },
            ]}
          >
            6s
          </Text>

          <Text
            style={[
              styles.cellCenter,
              styles.headerCell,
              { width: COL_WIDTHS.sr },
            ]}
          >
            SR
          </Text>
        </View>

        {/* ── Data Rows ─────────────────────────────────── */}

        {batting.map((player, idx) => (
          <View
            key={player.playerId || idx}
            style={[styles.row, idx % 2 === 0 ? styles.rowEven : styles.rowOdd]}
          >
            {/* Player name — bold for not-out batters */}
            <Text
              style={[
                styles.cell,
                { width: COL_WIDTHS.name },
                player.isNotOut && styles.notOutText,
              ]}
              numberOfLines={1}
            >
              {player.playerName}
              {player.isNotOut ? " *" : ""}
            </Text>

            <Text
              style={[
                styles.cell,
                styles.dismissalText,
                { width: COL_WIDTHS.dismissal },
              ]}
              numberOfLines={1}
            >
              {player.dismissal}
            </Text>

            <Text
              style={[
                styles.cellCenter,
                styles.runValue,
                { width: COL_WIDTHS.runs },
              ]}
            >
              {player.runs}
            </Text>

            <Text style={[styles.cellCenter, { width: COL_WIDTHS.balls }]}>
              {player.balls}
            </Text>

            <Text style={[styles.cellCenter, { width: COL_WIDTHS.fours }]}>
              {player.fours}
            </Text>

            <Text style={[styles.cellCenter, { width: COL_WIDTHS.sixes }]}>
              {player.sixes}
            </Text>

            <Text style={[styles.cellCenter, { width: COL_WIDTHS.sr }]}>
              {player.strikeRate}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  outerScroll: {
    paddingHorizontal: 0,
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

  dismissalText: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    fontStyle: "italic",
  },

  runValue: {
    fontWeight: "800",
    fontSize: 15,
    color: COLORS.primary,
  },

  notOutText: {
    fontWeight: "700",
    color: COLORS.primary,
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
