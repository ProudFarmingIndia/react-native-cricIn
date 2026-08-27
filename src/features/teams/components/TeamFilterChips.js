import React from "react";

import {
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
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
          style={[
            styles.chip,
            selected === filter ? styles.chipActive : styles.chipInactive,
          ]}
        >
          <Text
            style={selected === filter ? styles.chipTextActive : styles.chipTextInactive}
          >
            {filter}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 30,
    marginRight: 10,
  },

  chipActive: {
    backgroundColor: "#0B7A0B",
  },

  chipInactive: {
    backgroundColor: "#fff",
  },

  chipTextActive: {
    color: "#fff",
  },

  chipTextInactive: {
    color: "#333",
  },
});