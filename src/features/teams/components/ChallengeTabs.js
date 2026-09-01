import React from "react";

import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";

export default function ChallengeTabs({
  activeTab,
  setActiveTab,
  receivedCount,
}) {
  return (
    <View style={styles.row}>
      <TouchableOpacity
        style={[styles.tab, activeTab === "received" && styles.tabActive]}
        onPress={() =>
          setActiveTab(
            "received"
          )
        }
      >
        <Text style={activeTab === "received" ? styles.tabTextActive : styles.tabText}>
          Received (
          {receivedCount})
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === "sent" && styles.tabActive]}
        onPress={() =>
          setActiveTab(
            "sent"
          )
        }
      >
        <Text style={activeTab === "sent" ? styles.tabTextActive : styles.tabText}>Sent</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    backgroundColor: "#fff",
  },

  tab: {
    flex: 1,
    padding: 16,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },

  tabActive: {
    borderBottomColor: "#0B7A0B",
  },

  tabText: {
    color: "#666",
    fontWeight: "400",
  },

  tabTextActive: {
    color: "#0B7A0B",
    fontWeight: "700",
  },
});