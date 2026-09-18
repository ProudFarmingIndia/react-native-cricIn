/*
|--------------------------------------------------------------------------
| CricIn
|--------------------------------------------------------------------------
|
| Feature:
| Tournaments
|
| File:
| PointsTable.js
|
| Description:
| Standings.
|
| Two things make this readable rather than a wall of digits:
|
|   The qualifying line. Rows above it get a green tint, and a hairline
|   marks where the cut falls. Whether you are going through is the only
|   question anybody actually opens this table to answer.
|
|   Tabular numerals. Without them the columns wobble as digits change
|   width, and a points table that does not line up is not a table.
|
|--------------------------------------------------------------------------
*/

import React from "react";

import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

import { COLORS } from "../../../constants/colors";

const Cell = ({ children, width, bold, muted }) => (
  <Text
    style={[
      styles.cell,
      { width },
      bold && styles.cellBold,
      muted && styles.cellMuted,
    ]}
    numberOfLines={1}
  >
    {children}
  </Text>
);

export default function PointsTable({
  rows = [],
  qualifyingTeams = 0,
  onPressTeam,
  pointsRule,
}) {
  if (!rows.length) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>
          Abhi koi match complete nahi hua — table pehle result ke baad
          bharegi.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <Cell width={26}>#</Cell>
        <Text style={[styles.cell, styles.teamHead]}>TEAM</Text>
        <Cell width={26}>P</Cell>
        <Cell width={26}>W</Cell>
        <Cell width={26}>L</Cell>
        <Cell width={30}>PTS</Cell>
        <Cell width={52}>NRR</Cell>
      </View>

      {rows.map((row, index) => {
        const qualifying = qualifyingTeams > 0 && index < qualifyingTeams;

        const isCutLine =
          qualifyingTeams > 0 && index === qualifyingTeams - 1;

        return (
          <TouchableOpacity
            key={String(row.teamId)}
            activeOpacity={onPressTeam ? 0.7 : 1}
            onPress={() => onPressTeam?.(row)}
            style={[
              styles.row,
              qualifying && styles.rowQualifying,
              isCutLine && styles.rowCutLine,
            ]}
          >
            <Cell width={26} bold>
              {row.position}
            </Cell>

            <Text
              style={[
                styles.cell,
                styles.teamName,
                row.withdrawn && styles.withdrawn,
              ]}
              numberOfLines={1}
            >
              {row.teamName}
              {row.withdrawn ? " (out)" : ""}
            </Text>

            <Cell width={26}>{row.played}</Cell>
            <Cell width={26}>{row.won}</Cell>
            <Cell width={26}>{row.lost}</Cell>

            <Cell width={30} bold>
              {row.points}
            </Cell>

            {/*
            | NRR carries its sign explicitly. "+0.412" and "0.412" read
            | the same at a glance, and the sign is the whole point of the
            | number.
            */}
            <Cell width={52} muted>
              {row.nrr > 0 ? "+" : ""}
              {Number(row.nrr).toFixed(3)}
            </Cell>
          </TouchableOpacity>
        );
      })}

      <Text style={styles.legend}>
        {pointsRule ||
          "Win 2 · Tie 1 · No result 1 · Loss 0. Barabar points par NRR se ranking."}
        {qualifyingTeams > 0
          ? `  Top ${qualifyingTeams} playoff mein jayengi.`
          : ""}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: COLORS.surfaceContainer,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainer,
  },

  rowQualifying: { backgroundColor: "#F1F7EF" },

  /* The cut. A solid rule where the playoff places end. */
  rowCutLine: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },

  cell: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
    fontVariant: ["tabular-nums"],
  },

  cellBold: {
    fontWeight: "800",
    color: COLORS.onSurface,
  },

  cellMuted: { fontSize: 11.5 },

  teamHead: {
    flex: 1,
    textAlign: "left",
    paddingLeft: 6,
  },

  teamName: {
    flex: 1,
    textAlign: "left",
    paddingLeft: 6,
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.onSurface,
  },

  withdrawn: {
    color: COLORS.outline,
    textDecorationLine: "line-through",
  },

  legend: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceContainer,
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.onSurfaceVariant,
  },

  empty: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 22,
  },

  emptyText: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    color: COLORS.onSurfaceVariant,
  },
});
