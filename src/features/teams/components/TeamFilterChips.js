import React from "react";

import {
  ScrollView,
  TouchableOpacity,
  Text,
} from "react-native";

const filters = [
  "Nearby",
  "Similar Strength",
  "Weekend Matches",
];

export default function TeamFilterChips({
  selected,
  setSelected,
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={
        false
      }
    >
      {filters.map(filter => (
        <TouchableOpacity
          key={filter}
          onPress={() =>
            setSelected(
              filter
            )
          }
          style={{
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 30,
            backgroundColor:
              selected ===
              filter
                ? "#0B7A0B"
                : "#fff",
            marginRight: 10,
          }}
        >
          <Text
            style={{
              color:
                selected ===
                filter
                  ? "#fff"
                  : "#333",
            }}
          >
            {filter}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}