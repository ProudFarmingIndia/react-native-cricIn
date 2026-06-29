import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

import { COLORS } from "../../../constants/colors";

const TABS = ["Overview", "Stats", "Teams", "Matches", "Gallery", "HighLight"];

export default function ProfileTabBar({ activeTab, setActiveTab }) {
  return (
    <View style={styles.container}>
      {TABS.map((tab, index) => {
        const isActive = activeTab === index;

        return (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, isActive && styles.activeTab]}
            onPress={() => setActiveTab(index)}
            activeOpacity={0.8}
          >
            <Text style={[styles.label, isActive && styles.activeLabel]}>
              {tab}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",

    marginHorizontal: 16,

    marginTop: 20,

    marginBottom: 16,

    borderRadius: 14,

    backgroundColor: COLORS.surfaceContainerHighest,

    padding: 4,
  },

  tab: {
    flex: 1,

    alignItems: "center",

    justifyContent: "center",

    paddingVertical: 12,

    borderRadius: 10,
  },

  activeTab: {
    backgroundColor: COLORS.primary,
  },

  label: {
    fontSize: 13,

    fontWeight: "600",

    color: COLORS.onSurfaceVariant,
  },

  activeLabel: {
    color: COLORS.onPrimary,
  },
});
