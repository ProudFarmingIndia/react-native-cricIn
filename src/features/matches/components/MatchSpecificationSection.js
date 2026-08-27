import React from "react";

import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from "react-native";

import { COLORS } from "../../../constants/colors";

/*
|--------------------------------------------------------------------------
| Match Specification Section
|--------------------------------------------------------------------------
|
| Match Type is a chip select mapped to the backend matchType enum.
| Picking a type auto-fills overs, but overs stays editable.
|
| Date/Time fields are only rendered in "scheduled" mode — a Quick Match
| has no planned start time.
*/

const MATCH_TYPES = [
  { value: "T5", label: "T5", overs: 5 },
  { value: "T10", label: "T10", overs: 10 },
  { value: "T20", label: "T20", overs: 20 },
  { value: "ODI", label: "ODI", overs: 50 },
  { value: "Test", label: "Test", overs: null },
];

const BALL_TYPES = ["Leather", "Tennis", "Other"];

const PITCH_TYPES = ["Turf", "Matting", "Concrete"];

export default function MatchSpecificationSection({
  matchData,
  updateField,
  mode = "quick",
}) {
  const handleSelectMatchType = (type) => {
    updateField("matchType", type.value);

    if (type.overs != null) {
      updateField("overs", type.overs);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Match Specifications</Text>

      <Text style={styles.label}>Match Type</Text>

      <View style={styles.row}>
        {MATCH_TYPES.map((type) => (
          <TouchableOpacity
            key={type.value}
            style={[
              styles.chip,
              matchData.matchType === type.value && styles.activeChip,
            ]}
            onPress={() => handleSelectMatchType(type)}
          >
            <Text
              style={[
                styles.chipText,
                matchData.matchType === type.value && styles.activeChipText,
              ]}
            >
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Overs"
        keyboardType="numeric"
        value={String(matchData.overs)}
        onChangeText={(text) => updateField("overs", Number(text) || 0)}
      />

      <Text style={styles.label}>Ball Type</Text>

      <View style={styles.row}>
        {BALL_TYPES.map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.chip,
              matchData.ballType === item && styles.activeChip,
            ]}
            onPress={() => updateField("ballType", item)}
          >
            <Text
              style={[
                styles.chipText,
                matchData.ballType === item && styles.activeChipText,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Pitch Type</Text>

      <View style={styles.row}>
        {PITCH_TYPES.map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.chip,
              matchData.pitchType === item && styles.activeChip,
            ]}
            onPress={() => updateField("pitchType", item)}
          >
            <Text
              style={[
                styles.chipText,
                matchData.pitchType === item && styles.activeChipText,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {mode === "scheduled" && (
        <>
          <Text style={styles.label}>Schedule</Text>

          <TextInput
            style={styles.input}
            placeholder="Match Date (YYYY-MM-DD)"
            value={matchData.matchDate}
            onChangeText={(text) => updateField("matchDate", text)}
          />

          <TextInput
            style={styles.input}
            placeholder="Match Time (HH:MM, 24-hour)"
            value={matchData.matchTime}
            onChangeText={(text) => updateField("matchTime", text)}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surfaceContainerLowest,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
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
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.onSurfaceVariant,
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
    borderColor: COLORS.outlineVariant,
    marginRight: 8,
    marginBottom: 8,
  },

  activeChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.onSurfaceVariant,
  },

  activeChipText: {
    color: COLORS.onPrimary,
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