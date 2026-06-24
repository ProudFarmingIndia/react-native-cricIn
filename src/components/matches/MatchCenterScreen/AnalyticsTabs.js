import React from "react";

import {
  ScrollView,
  TouchableOpacity,
  Text,
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
      contentContainerStyle={{
        paddingHorizontal:16,
      }}
    >
      {tabs.map(tab => (
        <TouchableOpacity
          key={tab.key}
          onPress={() =>
            setActiveTab(
              tab.key
            )
          }
          style={{
            paddingHorizontal:16,
            paddingVertical:10,
            marginRight:10,
            borderRadius:20,
            backgroundColor:
              activeTab === tab.key
                ? "#2E7D32"
                : "#EAEAEA",
          }}
        >
          <Text
            style={{
              color:
                activeTab === tab.key
                  ? "#fff"
                  : "#000",
            }}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}