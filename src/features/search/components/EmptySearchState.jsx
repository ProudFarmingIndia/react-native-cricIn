import React from "react";

import {
  View,
  Text,
  StyleSheet,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../../constants/colors";

export default function EmptySearchState({
  title = "No Results Found",
  description = "Try searching with another keyword.",
}) {
  return (
    <View style={styles.container}>
      <Ionicons
        name="search-circle-outline"
        size={80}
        color="#C7C7C7"
      />

      <Text style={styles.title}>
        {title}
      </Text>

      <Text style={styles.description}>
        {description}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",

    justifyContent: "center",

    paddingVertical: 60,

    paddingHorizontal: 24,
  },

  title: {
    marginTop: 16,

    fontSize: 18,

    fontWeight: "700",

    color: COLORS.text,
  },

  description: {
    marginTop: 8,

    textAlign: "center",

    fontSize: 14,

    color: "#777",

    lineHeight: 22,
  },
});