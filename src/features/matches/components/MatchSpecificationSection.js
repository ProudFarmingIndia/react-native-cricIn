import React from "react";

import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from "react-native";

import { COLORS } from "../../../constants/colors";

const BALL_TYPES = [
  "Leather",
  "Tennis",
  "Other",
];

const PITCH_TYPES = [
  "Turf",
  "Matting",
  "Concrete",
];

export default function MatchSpecificationSection({
  matchData,
  updateField,
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>
        Match Specifications
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Match Type"
        value={matchData.matchType}
        onChangeText={(text) =>
          updateField("matchType", text)
        }
      />

      <TextInput
        style={styles.input}
        placeholder="Overs"
        keyboardType="numeric"
        value={String(matchData.overs)}
        onChangeText={(text) =>
          updateField("overs", text)
        }
      />

      <Text style={styles.label}>
        Ball Type
      </Text>

      <View style={styles.row}>
        {BALL_TYPES.map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.chip,
              matchData.ballType === item &&
                styles.activeChip,
            ]}
            onPress={() =>
              updateField(
                "ballType",
                item
              )
            }
          >
            <Text>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>
        Pitch Type
      </Text>

      <View style={styles.row}>
        {PITCH_TYPES.map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.chip,
              matchData.pitchType === item &&
                styles.activeChip,
            ]}
            onPress={() =>
              updateField(
                "pitchType",
                item
              )
            }
          >
            <Text>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Match Date"
        value={matchData.matchDate}
        onChangeText={(text) =>
          updateField(
            "matchDate",
            text
          )
        }
      />

      <TextInput
        style={styles.input}
        placeholder="Match Time"
        value={matchData.matchTime}
        onChangeText={(text) =>
          updateField(
            "matchTime",
            text
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },

  heading: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
    color: COLORS.primary,
  },

  label: {
    marginBottom: 8,
    marginTop: 10,
  },

  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },

  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 8,
    marginBottom: 8,
  },

  activeChip: {
    backgroundColor: "#dff1df",
  },

  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
});