import React from "react";

import {
  View,
  Text,
  StyleSheet,
} from "react-native";

import { COLORS } from "../../../constants/colors";

/*
|--------------------------------------------------------------------------
| Chase Stats
|--------------------------------------------------------------------------
|
| Only shown during the second innings when there's a target to chase.
| Required run rate is derived here rather than trusting a precomputed
| value, so it can never drift from the actual runs/balls remaining.
*/

export default function ChaseStats({
  target,
  currentRuns = 0,
  ballsRemaining = 0,
  currentRunRate = 0,
}) {
  if (!target) {
    return null;
  }

  const runsNeeded = Math.max(target - currentRuns, 0);

  const requiredRunRate =
    ballsRemaining > 0
      ? ((runsNeeded / ballsRemaining) * 6).toFixed(2)
      : "0.00";

  return (
    <View style={styles.row}>
      <View style={styles.card}>
        <Text style={styles.label}>Needed</Text>

        <Text style={styles.value}>{runsNeeded}</Text>

        <Text style={styles.subtext}>
          from {ballsRemaining} ball{ballsRemaining !== 1 ? "s" : ""}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Req. Run Rate</Text>

        <Text style={styles.value}>{requiredRunRate}</Text>

        <Text style={styles.subtext}>CRR {Number(currentRunRate).toFixed(2)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  card: {
    flex: 1,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  label: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.onSurfaceVariant,
  },

  value: {
    fontSize: 24,
    fontWeight: "700",
    marginVertical: 6,
    color: COLORS.onSurface,
  },

  subtext: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
  },
});
