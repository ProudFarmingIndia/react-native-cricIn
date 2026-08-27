import React from "react";

import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";

export default function TeamProfileTabs({
  activeTab,
  setActiveTab,
}) {
  return (
    <View style={styles.row}>
      {["squad", "matches", "stats"].map(
        tab => (
          <TouchableOpacity
            key={tab}
            onPress={() =>
              setActiveTab(tab)
            }
          >
            <Text
              style={activeTab === tab ? styles.tabTextActive : styles.tabTextInactive}
            >
              {tab.toUpperCase()}
            </Text>
          </TouchableOpacity>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },

  tabTextActive: {
    fontWeight: "700",
  },

  tabTextInactive: {
    fontWeight: "400",
  },
});