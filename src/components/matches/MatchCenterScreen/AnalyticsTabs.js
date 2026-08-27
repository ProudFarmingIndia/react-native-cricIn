import React from "react";

import {
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";

const tabs = [
  {
    key:"summary",
    label:"Summary",
  },
  {
    key:"wagon",
    label:"Wagon",
  },
  {
    key:"partnership",
    label:"Partnership",
  },
  {
    key:"worm",
    label:"Worm",
  },
  {
    key:"insights",
    label:"Insights",
  },
];

export default function AnalyticsTabs({
  activeTab,
  setActiveTab,
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {tabs.map(tab => (
        <TouchableOpacity
          key={tab.key}
          onPress={() =>
            setActiveTab(
              tab.key
            )
          }
          style={[
            styles.tab,
            activeTab === tab.key ? styles.tabActive : styles.tabInactive,
          ]}
        >
          <Text
            style={activeTab === tab.key ? styles.labelActive : styles.labelInactive}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },

  tab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 20,
  },

  tabActive: {
    backgroundColor: "#2E7D32",
  },

  tabInactive: {
    backgroundColor: "#EAEAEA",
  },

  labelActive: {
    color: "#fff",
  },

  labelInactive: {
    color: "#000",
  },
});