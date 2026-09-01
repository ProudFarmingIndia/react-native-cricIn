import React from "react";

import { ScrollView, TouchableOpacity, Text, StyleSheet } from "react-native";

import { COLORS } from "../../../constants/colors";

const TABS = ["Overview", "Players", "Matches", "Statistics", "Settings"];

export default function TeamTabBar({ activeTab, setActiveTab }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {TABS.map((tab, index) => {
        const active = activeTab === index;

        return (
          <TouchableOpacity
            key={tab}
            activeOpacity={0.8}
            style={[styles.tab, active && styles.activeTab]}
            onPress={() => setActiveTab(index)}
          >
            <Text style={[styles.tabText, active && styles.activeTabText]}>
              {tab}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 18,
  },

  tab: {
    marginRight: 18,

    paddingBottom: 10,

    borderBottomWidth: 2,

    borderBottomColor: "transparent",
  },

  activeTab: {
    borderBottomColor: COLORS.primary,
  },

  tabText: {
    fontSize: 15,

    fontWeight: "600",

    color: COLORS.onSurfaceVariant,
  },

  activeTabText: {
    color: COLORS.primary,

    fontWeight: "700",
  },
});
