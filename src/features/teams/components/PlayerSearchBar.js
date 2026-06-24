import React from "react";

import {
  TextInput,
  StyleSheet,
} from "react-native";

export default function PlayerSearchBar({
  value,
  onChangeText,
}) {
  return (
    <TextInput
      style={styles.input}
      placeholder="Search Players..."
      value={value}
      onChangeText={
        onChangeText
      }
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: "#fff",
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
});