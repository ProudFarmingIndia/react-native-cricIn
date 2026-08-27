import React from "react";

import {
  View,
  Text,
  TextInput,
  StyleSheet,
} from "react-native";

import { COLORS } from "../../../constants/colors";

export default function GroundSelectionSection({
  matchData,
  updateField,
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>
        Ground Selection
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Ground"
        value={matchData.ground}
        onChangeText={(text) =>
          updateField("ground", text)
        }
      />

      <TextInput
        style={styles.input}
        placeholder="Umpire 1"
        value={matchData.umpire1}
        onChangeText={(text) =>
          updateField("umpire1", text)
        }
      />

      <TextInput
        style={styles.input}
        placeholder="Umpire 2"
        value={matchData.umpire2}
        onChangeText={(text) =>
          updateField("umpire2", text)
        }
      />

      <TextInput
        style={styles.input}
        placeholder="Scorer"
        value={matchData.scorer}
        onChangeText={(text) =>
          updateField("scorer", text)
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surfaceContainerLowest,
    padding: 16,
    borderRadius: 12,
    marginBottom: 100,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },

  heading: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
    color: COLORS.primary,
  },

  input: {
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    color: COLORS.onSurface,
  },
});