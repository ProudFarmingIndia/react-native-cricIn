import React from "react";

import {
  View,
  Text,
  StyleSheet,
} from "react-native";

export default function FieldingStatsSection({
  profile = {},
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>
        Fielding Statistics
      </Text>

      <Text>
        Catches:
        {profile.catches ||
          42}
      </Text>

      <Text>
        Run Outs:
        {profile.runOuts ||
          12}
      </Text>

      <Text>
        Stumpings:
        {profile.stumpings ||
          4}
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