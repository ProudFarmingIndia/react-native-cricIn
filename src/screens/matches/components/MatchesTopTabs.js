import React from "react";
import {
  View,
  Text,
  StyleSheet,  ScrollView, TouchableOpacity,
} from "react-native";
import { COLORS } from "../../../constants/colors";
const tabs = [
  "Matches",
  "Tournaments",
  "Teams",
  "Stats",
  "Highlights",
];

export default function MatchesTopTabs({ activeTab, setActiveTab }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.topTabs}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab;

        return (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={isActive ? styles.activeTab : styles.topTabButton}
          >
            <Text
              style={
                isActive
                  ? styles.activeTabText
                  : styles.topTabText
              }
            >
              {tab}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  topTabs: {
    maxHeight: 50,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingHorizontal: 16,
  },

  activeTab: {
    marginRight: 24,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.secondary,
    paddingVertical: 12,
  },

  activeTabText: {
    color: COLORS.secondary,
    fontWeight: "700",
  },

  topTabButton: {
    marginRight: 24,
    paddingVertical: 12,
  },

  topTabText: {
    color: COLORS.textLight,
    fontWeight: "600",
  },
});