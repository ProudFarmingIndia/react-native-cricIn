import React from "react";

import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

import { COLORS } from "../../../constants/colors";

export default function BottomAction({ onContinue }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={onContinue}>
        <Text style={styles.text}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,

    backgroundColor: "#fff",

    padding: 16,

    borderTopWidth: 1,

    borderTopColor: "#ddd",
  },

  button: {
    height: 54,

    borderRadius: 12,

    backgroundColor: COLORS.primary,

    justifyContent: "center",

    alignItems: "center",
  },

  text: {
    color: "#fff",

    fontSize: 16,

    fontWeight: "700",
  },
});
