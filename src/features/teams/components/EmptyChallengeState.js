import React from "react";

import {
  View,
  Text,
  TouchableOpacity,
} from "react-native";

export default function EmptyChallengeState() {
  return (
    <View
      style={{
        alignItems:
          "center",

        marginTop: 60,
      }}
    >
      <Text
        style={{
          fontSize: 60,
        }}
      >
        📤
      </Text>

      <Text
        style={{
          fontSize: 18,

          fontWeight:
            "700",

          marginTop: 10,
        }}
      >
        No Pending Requests
      </Text>

      <TouchableOpacity
        style={{
          marginTop: 20,

          backgroundColor:
            "#0B7A0B",

          paddingHorizontal:
            24,

          paddingVertical:
            12,

          borderRadius: 10,
        }}
      >
        <Text
          style={{
            color:
              "#fff",
          }}
        >
          Find Opponents
        </Text>
      </TouchableOpacity>
    </View>
  );
}