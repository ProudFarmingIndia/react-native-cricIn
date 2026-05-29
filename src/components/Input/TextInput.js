import React from "react";
import { TextInput, View, StyleSheet } from "react-native";
import { COLORS } from "../../constants/colors";

export default function CustomInput(props) {
  return (
    <View style={styles.container}>
      <TextInput
        {...props}
        style={styles.input}
        placeholderTextColor="#777"
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
    borderWidth: 1,
    borderColor: COLORS.muted,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#fff",
  },
});