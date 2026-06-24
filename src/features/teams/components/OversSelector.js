import React from "react";

import {
  View,
  Text,
  StyleSheet,
} from "react-native";

import Slider from "@react-native-community/slider";

export default function OversSelector({
  overs,
  onChange,
}) {
  return (
    <View style={styles.card}>
      <Text
        style={styles.label}
      >
        Overs
      </Text>

      <Text
        style={styles.value}
      >
        {overs}
      </Text>

      <Slider
        minimumValue={1}
        maximumValue={50}
        step={1}
        value={overs}
        onValueChange={
          onChange
        }
      />
    </View>
  );
}

const styles =
  StyleSheet.create({
    card: {
      backgroundColor:
        "#fff",

      borderRadius: 16,

      padding: 16,

      marginBottom: 16,
    },

    label: {
      fontWeight:
        "700",
    },

    value: {
      fontSize: 26,

      fontWeight:
        "800",

      marginVertical: 10,
    },
  });