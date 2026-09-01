import React from "react";
import { View, TextInput, StyleSheet } from "react-native";

export default function CustomInput({ style, containerStyle, ...props }) {
  return (
    <View style={[styles.container, containerStyle]}>
      <TextInput
        {...props}
        placeholderTextColor="#777"
        style={[styles.input, style]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",

    marginVertical: 8,
  },

  input: {
    height: 50,

    borderWidth: 1,

    borderColor: "#D9D9D9",

    borderRadius: 12,

    paddingHorizontal: 16,

    backgroundColor: "#FFFFFF",

    fontSize: 15,

    color: "#000000",
  },
});
