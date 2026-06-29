import React from "react";
import { View, Text } from "react-native";

export default function InsightsTab() {
  return (
    <View
      style={{
        padding:16,
      }}
    >
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