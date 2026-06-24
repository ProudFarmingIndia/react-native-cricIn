import React from "react";
import { View, Text } from "react-native";

export default function SummaryTab() {
  return (
    <View style={{ padding:16 }}>
      <Text>
        Total Runs: 342
      </Text>

      <Text>
        Boundaries: 32
      </Text>

      <Text>
        Dot Balls: 98
      </Text>

      <Text>
        Run Rate: 6.84
      </Text>
    </View>
  );
}