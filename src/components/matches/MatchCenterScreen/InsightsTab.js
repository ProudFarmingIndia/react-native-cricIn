import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function InsightsTab() {
  return (
    <View style={styles.container}>
      <Text>
        Key Match Insights
      </Text>

      <Text>
        • Best Over: 22 Runs
      </Text>

      <Text>
        • Turning Point: Over 17
      </Text>

      <Text>
        • MVP Impact: 84%
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});