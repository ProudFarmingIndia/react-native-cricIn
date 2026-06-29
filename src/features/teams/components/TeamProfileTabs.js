import React from "react";

import {
  View,
  TouchableOpacity,
  Text,
} from "react-native";

export default function TeamProfileTabs({
  activeTab,
  setActiveTab,
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-around",
        marginBottom: 20,
      }}
    >
      {["squad", "matches", "stats"].map(
        tab => (
          <TouchableOpacity
            key={tab}
            onPress={() =>
              setActiveTab(tab)
            }
          >
            <Text
              style={{
                fontWeight:
                  activeTab === tab
                    ? "700"
                    : "400",
              }}
            >
              {tab.toUpperCase()}
            </Text>
          </TouchableOpacity>
        )
      )}
    </View>
  );
}