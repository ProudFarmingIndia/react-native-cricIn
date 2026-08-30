import React from "react";

import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../../constants/colors";

/*
|--------------------------------------------------------------------------
| Live Player Stats
|--------------------------------------------------------------------------
|
| The two batters and the current bowler, laid out as a scorecard rather
| than three unlabelled rows. Before, "28 (9)" and "0.1-1-0" sat in the
| same column with no headers, so you had to already know which was which.
|
| The Change Bowler control now sits ON the bowler's row instead of being a
| full-width button further down the screen. It is a change to that line,
| so it belongs on that line - and between overs it is the thing the scorer
| reaches for immediately, which makes hunting for it below the scoring pad
| the wrong place for it.
|
| Names are tappable and open the player's profile, matching every other
| player list in the app.
|
*/

const Row = ({ name, figures, isStriker, onPress, trailing }) => (
  <View style={styles.row}>
    <TouchableOpacity
      style={styles.nameWrap}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.6 : 1}
    >
      <Text style={styles.name} numberOfLines={1}>
        {name || "—"}
        {isStriker ? " *" : ""}
      </Text>
    </TouchableOpacity>

    <Text style={styles.figures}>{figures}</Text>

    {trailing}
  </View>
);

export default function PlayerStats({
  striker,
  nonStriker,
  bowler,
  onChangeBowler,
  onPressPlayer,
}) {
  const battingLine = (p) => {
    const runs = p?.runs ?? 0;

    const balls = p?.balls ?? 0;

    const sr = balls > 0 ? ((runs / balls) * 100).toFixed(1) : "0.0";

    return `${runs} (${balls})  ·  SR ${sr}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerLabel}>BATTING</Text>
        <Text style={styles.headerHint}>R (B) · SR</Text>
      </View>

      <Row
        name={striker?.name}
        figures={battingLine(striker)}
        isStriker
        onPress={striker?.id ? () => onPressPlayer?.(striker.id) : undefined}
      />

      <Row
        name={nonStriker?.name}
        figures={battingLine(nonStriker)}
        onPress={
          nonStriker?.id ? () => onPressPlayer?.(nonStriker.id) : undefined
        }
      />

      <View style={styles.divider} />

      <View style={styles.headerRow}>
        <Text style={styles.headerLabel}>BOWLING</Text>
        <Text style={styles.headerHint}>O-R-W</Text>
      </View>

      <Row
        name={bowler?.name}
        figures={bowler?.figures || "0.0-0-0"}
        onPress={bowler?.id ? () => onPressPlayer?.(bowler.id) : undefined}
        trailing={
          onChangeBowler ? (
            <TouchableOpacity
              style={styles.changeButton}
              onPress={onChangeBowler}
              accessibilityLabel="Change bowler"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="swap-horizontal" size={14} color={COLORS.primary} />

              <Text style={styles.changeText}>Change</Text>
            </TouchableOpacity>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  headerLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.7,
    color: COLORS.onSurfaceVariant,
  },

  headerHint: {
    fontSize: 9.5,
    fontWeight: "700",
    color: COLORS.outline,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },

  nameWrap: {
    flex: 1,
    marginRight: 8,
  },

  name: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.onSurface,
  },

  figures: {
    fontSize: 13,
    fontVariant: ["tabular-nums"],
    color: COLORS.onSurfaceVariant,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.outlineVariant,
    marginVertical: 10,
  },

  changeButton: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },

  changeText: {
    marginLeft: 4,
    fontSize: 11.5,
    fontWeight: "700",
    color: COLORS.primary,
  },
});
