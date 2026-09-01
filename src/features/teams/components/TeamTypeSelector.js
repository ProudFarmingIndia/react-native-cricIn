import React from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import { COLORS } from "../../../constants/colors";

const TEAM_TYPES = [
  "Club",
  "Corporate",
  "Academy",
  "Friends",
  "School",
  "College",
];

export default function TeamTypeSelector({
  value,
  onChange,
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>
        Team Type
      </Text>

      <View style={styles.container}>
        {TEAM_TYPES.map((item) => {
          const selected =
            item === value;

          return (
            <TouchableOpacity
              key={item}
              activeOpacity={0.8}
              style={[
                styles.chip,
                selected &&
                  styles.selectedChip,
              ]}
              onPress={() =>
                onChange(item)
              }
            >
              <Text
                style={[
                  styles.chipText,
                  selected &&
                    styles.selectedChipText,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF",

    borderRadius: 20,

    padding: 20,

    marginBottom: 20,

    shadowColor: "#000",

    shadowOpacity: 0.05,

    shadowRadius: 8,

    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 2,
  },

  title: {
    fontSize: 20,

    fontWeight: "700",

    color: COLORS.primary,

    marginBottom: 18,
  },

  container: {
    flexDirection: "row",

    flexWrap: "wrap",
  },

  chip: {
    paddingHorizontal: 18,

    paddingVertical: 12,

    borderRadius: 30,

    borderWidth: 1,

    borderColor: "#E5E7EB",

    marginRight: 10,

    marginBottom: 10,

    backgroundColor: "#FFF",
  },

  selectedChip: {
    backgroundColor:
      COLORS.primary,

    borderColor:
      COLORS.primary,
  },

  chipText: {
    fontSize: 14,

    fontWeight: "600",

    color: "#4B5563",
  },

  selectedChipText: {
    color: "#FFF",
  },
});