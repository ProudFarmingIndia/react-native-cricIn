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
| EACH BATTER HAS A CHANGE CONTROL TOO
|
| Same affordance as the bowler's, on the row it changes. What it OFFERS
| depends on whether that batter has faced a ball, and the caller decides
| that - this component just reports which end was tapped:
|
|   0 balls faced -> the scorer tapped the wrong player. A correction.
|   Balls faced   -> the runs belong to somebody. Only a retirement can
|                    take them off strike, and that is a scorecard entry.
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

/* Shared by all three rows so the batter control is pixel-identical to
   the bowler's - it is the same affordance and must not look like a
   different kind of button. */
const ChangeButton = ({ onPress, label }) => (
  <TouchableOpacity
    style={styles.changeButton}
    onPress={onPress}
    accessibilityLabel={label}
    accessibilityRole="button"
    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
  >
    <Ionicons name="swap-horizontal" size={14} color={COLORS.primary} />

    <Text style={styles.changeText}>Change</Text>
  </TouchableOpacity>
);

export default function PlayerStats({
  striker,
  nonStriker,
  bowler,
  onChangeBowler,
  /* Called with "striker" | "nonStriker". */
  onChangeBatsman,
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
        trailing={
          onChangeBatsman ? (
            <ChangeButton
              label="Change striker"
              onPress={() => onChangeBatsman("striker")}
            />
          ) : null
        }
      />

      <Row
        name={nonStriker?.name}
        figures={battingLine(nonStriker)}
        onPress={
          nonStriker?.id ? () => onPressPlayer?.(nonStriker.id) : undefined
        }
        trailing={
          onChangeBatsman ? (
            <ChangeButton
              label="Change non-striker"
              onPress={() => onChangeBatsman("nonStriker")}
            />
          ) : null
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
            <ChangeButton label="Change bowler" onPress={onChangeBowler} />
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
