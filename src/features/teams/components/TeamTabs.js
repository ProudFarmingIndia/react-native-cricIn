import React from "react";

import {
  View,
  TouchableOpacity,
  Text,
} from "react-native";

export default function TeamTabs({
  activeTab,
  setActiveTab,
}) {
  return (
    <View
      style={{
        flexDirection:
          "row",
        marginBottom: 20,
      }}
    >
      {[
        "players",
        "matches",
        "stats",
      ].map(tab => (
        <TouchableOpacity
          key={tab}
          onPress={() =>
            setActiveTab(
              tab
            )
          }
          style={{
            marginRight: 20,
          }}
        >
          <Text
            style={{
              fontWeight:
                activeTab ===
                tab
                  ? "700"
                  : "400",
            }}
          >
            {tab.toUpperCase()}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}