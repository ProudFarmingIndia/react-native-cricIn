import React from "react";

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { COLORS } from "../../../constants/colors";

const RUNS = [0, 1, 2, 3, 4, 5, 6];

const EXTRAS = [
  { key: "wide", label: "Wide" },
  { key: "noBall", label: "No Ball" },
  { key: "bye", label: "Bye" },
  { key: "legBye", label: "Leg Bye" },
];

/*
|--------------------------------------------------------------------------
| Scoring Pad
|--------------------------------------------------------------------------
|
| onRun(runs)         a normal delivery, runs off the bat (0-6)
| onWicket()          opens the wicket / retirement sheet
| onExtra(extraType)  wide / no-ball / bye / leg-bye, prompts for run count
| onPenalty()         five penalty runs to the batting side (Law 41)
|
| The penalty control sits apart from the extras row on purpose. A wide and
| a bye are DELIVERIES; a penalty is not bowled at all, and putting it in
| the same row would invite it being tapped as though it were.
|
*/

export default function ScoringPad({ onRun, onWicket, onExtra, onPenalty }) {
  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {RUNS.map((run) => (
          <TouchableOpacity
            key={run}
            style={[styles.button, run > 0 && run % 2 === 0 && styles.boundaryHint]}
            activeOpacity={0.75}
            onPress={() => onRun(run)}
          >
            <Text style={styles.text}>{run}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={styles.wicket}
          activeOpacity={0.75}
          onPress={onWicket}
        >
          <Text style={styles.wicketText}>W</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.extrasRow}>
        {EXTRAS.map((extra) => (
          <TouchableOpacity
            key={extra.key}
            style={styles.extraChip}
            activeOpacity={0.75}
            onPress={() => onExtra?.(extra.key)}
          >
            <Text style={styles.extraText}>{extra.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {!!onPenalty && (
        <TouchableOpacity
          style={styles.penaltyRow}
          activeOpacity={0.75}
          onPress={onPenalty}
        >
          <Text style={styles.penaltyText}>+5 PENALTY RUNS</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  button: {
    width: "23%",
    height: 60,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  boundaryHint: {
    borderColor: COLORS.primaryContainer,
  },

  text: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.onSurface,
  },

  wicket: {
    width: "23%",
    height: 60,
    backgroundColor: COLORS.errorContainer,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  wicketText: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.error,
  },

  extrasRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },

  extraChip: {
    flex: 1,
    marginHorizontal: 3,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceContainer,
    alignItems: "center",
  },

  extraText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.secondary,
  },

  /*
  | Deliberately understated - outlined rather than filled, and full width
  | below the extras rather than beside them. It is a rare, deliberate act,
  | and it should not compete for the thumb with the buttons used on every
  | ball.
  */

  penaltyRow: {
    marginTop: 8,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: COLORS.outlineVariant,
    alignItems: "center",
  },

  penaltyText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    color: COLORS.onSurfaceVariant,
  },
});
