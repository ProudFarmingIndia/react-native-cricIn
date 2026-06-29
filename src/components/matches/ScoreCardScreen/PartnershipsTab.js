import React from "react";

import {
  View,
  Text,
} from "react-native";

export default function PartnershipsTab() {
  return (
    <View
      style={{
        padding:16,
      }}
    >
      <Text>
        Aman Sharma &
        Karthik R
      </Text>

      <Text
        style={{
          fontSize:26,
          fontWeight:"700",
        }}
      >
        102 Runs
      </Text>

      <Text>
        56 Balls
      </Text>
    </View>
  );
}