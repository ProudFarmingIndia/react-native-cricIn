import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { COLORS } from "../../../constants/colors";

/*
|--------------------------------------------------------------------------
| ProfileTabs
|--------------------------------------------------------------------------
|
| Horizontally scrollable tab bar, driven by whatever labels you pass in.
|
| ProfileTabBar (the sibling component used by your OWN profile) hardcodes
| its six labels and lays them out with flex:1, which squeezes each one to
| about 55px on a phone. This takes the labels as a prop and scrolls
| instead, so tab count doesn't degrade legibility.
|
| Usage:
|   <ProfileTabs
|     tabs={["Overview", "Stats", "Matches"]}
|     activeTab={activeTab}
|     setActiveTab={setActiveTab}
|   />
|
| props:
|   tabs          - array of label strings
|   activeTab     - index of the selected tab
|   setActiveTab  - (index) => void
|
*/

export default function ProfileTabs({ tabs = [], activeTab = 0, setActiveTab }) {
  if (!Array.isArray(tabs) || tabs.length === 0) {
    return null;
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {tabs.map((tab, index) => {
          const isActive = activeTab === index;

          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, isActive && styles.activeTab]}
              onPress={() => setActiveTab(index)}
              activeOpacity={0.8}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
            >
              <Text
                style={[styles.label, isActive && styles.activeLabel]}
                numberOfLines={1}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 20,

    marginBottom: 16,
  },

  container: {
    paddingHorizontal: 16,

    gap: 8,
  },

  tab: {
    paddingHorizontal: 18,

    paddingVertical: 10,

    borderRadius: 20,

    backgroundColor: COLORS.surfaceContainerHighest,

    borderWidth: 1,

    borderColor: COLORS.outlineVariant,
  },

  activeTab: {
    backgroundColor: COLORS.primary,

    borderColor: COLORS.primary,
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
