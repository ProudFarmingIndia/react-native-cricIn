import React from "react";

import {
  View,
  Text,
  StyleSheet,
} from "react-native";

export default function ChallengeInfoCard() {
  return (
    <View style={styles.card}>
      <Text
        style={styles.text}
      >
        Proposed matches require
        opponent acceptance within
        24 hours. Ground expenses
        are shared by default.
      </Text>
    </View>
  );
}

const styles =
  StyleSheet.create({
    card: {
      backgroundColor:
        "#FFF8E1",

      padding: 16,

      borderRadius: 12,
    },

    text: {
      color: "#666",
    },
  });