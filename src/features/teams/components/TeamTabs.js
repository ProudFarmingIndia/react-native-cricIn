import React from "react";

import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";

export default function TeamTabs({
  activeTab,
  setActiveTab,
}) {
  return (
    <View style={styles.container}>
      {[
        "players",
        "matches",
        "stats",
      ].map((tab) => (
        <TouchableOpacity
          key={tab}
          onPress={() => setActiveTab(tab)}
          style={styles.tabButton}
        >
          <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
            {tab.toUpperCase()}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginBottom: 20,
  },
  tabButton: {
    marginRight: 20,
  },
  tabText: {
    fontWeight: "400",
  },
  activeTabText: {
    fontWeight: "700",
  },
});