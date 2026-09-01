import React from "react";

import {
  View,
  Text,
  TextInput,
  StyleSheet,
} from "react-native";

import { COLORS } from "../../../constants/colors";

export default function TeamBasicInfoSection({
  teamData,
  updateField,
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>
        Team Information
      </Text>

      {/* Team Name */}

      <View style={styles.field}>
        <Text style={styles.label}>
          Team Name
        </Text>

        <TextInput
          placeholder="Delhi Warriors"
          placeholderTextColor="#9CA3AF"
          value={teamData.teamName}
          onChangeText={(text) =>
            updateField(
              "teamName",
              text
            )
          }
          style={styles.input}
          maxLength={50}
        />
      </View>

      {/* Short Name */}

      <View style={styles.field}>
        <Text style={styles.label}>
          Short Name
        </Text>

        <TextInput
          placeholder="DW"
          placeholderTextColor="#9CA3AF"
          value={teamData.shortName}
          onChangeText={(text) =>
            updateField(
              "shortName",
              text.toUpperCase()
            )
          }
          style={styles.input}
          maxLength={5}
          autoCapitalize="characters"
        />

        <Text style={styles.helper}>
          Used on scorecards
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",

    borderRadius: 20,

    padding: 20,

    marginBottom: 20,

    shadowColor: "#000",

    shadowOpacity: 0.05,

    shadowRadius: 8,

    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 2,
  },

  title: {
    fontSize: 20,

    fontWeight: "700",

    color: COLORS.primary,

    marginBottom: 20,
  },

  field: {
    marginBottom: 18,
  },

  label: {
    fontSize: 14,

    fontWeight: "600",

    color: "#374151",

    marginBottom: 8,
  },

  input: {
    height: 52,

    borderWidth: 1,

    borderColor: "#E5E7EB",

    borderRadius: 14,

    paddingHorizontal: 16,

    fontSize: 16,

    color: "#111827",

    backgroundColor: "#FFFFFF",
  },

  helper: {
    marginTop: 6,

    fontSize: 12,

    color: "#9CA3AF",
  },
});