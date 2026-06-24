import React from "react";

import {
  View,
  Text,
  StyleSheet,
} from "react-native";

export default function BowlingStatsSection({
  profile = {},
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>
        Bowling Statistics
      </Text>

      <Text>
        Overs:
        {profile.overs || 48}
      </Text>

      <Text>
        Economy:
        {profile.economy ||
          5.42}
      </Text>

      <Text>
        Wickets:
        {profile.wickets || 62}
      </Text>

      <Text>
        Best:
        {profile.best ||
          "4/22"}
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