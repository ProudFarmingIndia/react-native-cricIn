import React from "react";

import {
  View,
  TouchableOpacity,
  Text,
} from "react-native";

export default function ChallengeTabs({
  activeTab,
  setActiveTab,
  receivedCount,
}) {
  return (
    <View
      style={{
        flexDirection:
          "row",

        backgroundColor:
          "#fff",
      }}
    >
      <TouchableOpacity
        style={{
          flex: 1,

          padding: 16,

          alignItems:
            "center",
        }}
        onPress={() =>
          setActiveTab(
            "received"
          )
        }
      >
        <Text>
          Received (
          {receivedCount})
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          flex: 1,

          padding: 16,

          alignItems:
            "center",
        }}
        onPress={() =>
          setActiveTab(
            "sent"
          )
        }
      >
        <Text>Sent</Text>
      </TouchableOpacity>
    </View>
  );
}