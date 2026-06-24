import React from "react";

import {
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";

const tabs = [
  "batting",
  "bowling",
  "fow",
  "partnerships",
  "info",
];

export default function ScorecardTabs({
  activeTab,
  setActiveTab,
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={
        styles.container
      }
    >
      {tabs.map(tab => (
        <TouchableOpacity
          key={tab}
          style={[
            styles.tab,
            activeTab === tab &&
              styles.activeTab,
          ]}
          onPress={() =>
            setActiveTab(tab)
          }
        >
          <Text>
            {tab.toUpperCase()}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles =
  StyleSheet.create({
    container:{
      padding:10,
    },

    tab:{
      paddingHorizontal:16,
      paddingVertical:10,
      backgroundColor:"#eee",
      borderRadius:20,
      marginRight:10,
    },

    activeTab:{
      backgroundColor:"#C8E6C9",
    },
  });