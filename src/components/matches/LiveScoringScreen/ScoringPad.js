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
| onRun(runs) - a normal delivery, runs off the bat (0-6)
| onWicket() - opens the wicket dismissal flow
| onExtra(extraType) - wide/no-ball/bye/leg-bye, prompts for run count
|
*/

export default function ScoringPad({ onRun, onWicket, onExtra }) {
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
});
