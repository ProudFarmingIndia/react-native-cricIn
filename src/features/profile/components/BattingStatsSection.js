import React from "react";

import {
  View,
  Text,
  StyleSheet,
} from "react-native";

export default function BattingStatsSection({
  profile = {},
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>
        Batting Statistics
      </Text>

      <Text>
        Matches:
        {profile.matches || 48}
      </Text>

      <Text>
        Runs:
        {profile.runs || 2450}
      </Text>

      <Text>
        Average:
        {profile.average || 42.5}
      </Text>

      <Text>
        Strike Rate:
        {profile.strikeRate ||
          138.2}
      </Text>

      <Text>
        100s:
        {profile.hundreds || 4}
      </Text>

      <Text>
        50s:
        {profile.fifties || 22}
      </Text>
    </View>
  );
}

const styles =
  StyleSheet.create({
    card: {
      backgroundColor:
        "#fff",
      margin: 16,
      padding: 16,
      borderRadius: 16,
    },

    title: {
      fontSize: 18,
      fontWeight: "700",
      marginBottom: 16,
    },
  });