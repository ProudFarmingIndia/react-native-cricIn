import React from "react";

import {
  View,
  Text,
} from "react-native";

export default function InfoTab() {
  return (
    <View
      style={{
        padding:16,
      }}
    >
      <Text>
        Venue:
        Green Oval
      </Text>

      <Text>
        Toss:
        Rangers won toss
      </Text>

      <Text>
        Decision:
        Bat First
      </Text>

      <Text>
        Umpires:
        John & Mike
      </Text>

      <Text>
        Match Type:
        T20
      </Text>
    </View>
  );
}