import React from "react";

import {
  View,
  Text,
  TextInput,
  StyleSheet,
} from "react-native";

import { COLORS } from "../../../constants/colors";

export default function MatchInfoSection({
  matchData,
  updateField,
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>
        General Information
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Match Name"
        value={matchData.matchName}
        onChangeText={(text) =>
          updateField("matchName", text)
        }
      />

      <TextInput
        style={styles.input}
        placeholder="Tournament"
        value={matchData.tournament}
        onChangeText={(text) =>
          updateField("tournament", text)
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

  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
});