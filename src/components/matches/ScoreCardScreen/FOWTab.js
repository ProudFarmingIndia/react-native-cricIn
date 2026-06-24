import React from "react";

import {
  View,
  Text,
} from "react-native";

export default function FOWTab() {
  const wickets = [
    "54/1 - Aman Sharma",
    "70/2 - Warner",
    "82/3 - Suresh",
    "162/4 - Rahul",
  ];

  return (
    <View
      style={{
        padding:16,
      }}
    >
      {wickets.map(
        (
          wicket,
          index
        ) => (
          <Text
            key={index}
            style={{
              marginBottom:10,
            }}
          >
            {wicket}
          </Text>
        )
      )}
    </View>
  );
}