import React from "react";

import {
  TextInput,
  StyleSheet,
} from "react-native";

export default function TeamSearchBar({
  value,
  onChangeText,
}) {
  return (
    <TextInput
      style={styles.input}
      placeholder="Search teams..."
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
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
});