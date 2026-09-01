import React from "react";

import {
  View,
  TextInput,
  StyleSheet,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../../constants/colors";

export default function SearchInput({
  value,
  placeholder = "Search...",
  onChangeText,
}) {
  return (
    <View style={styles.container}>
      <Ionicons
        name="search"
        size={20}
        color="#999"
      />

      <TextInput
        style={styles.input}
        value={value}
        placeholder={placeholder}
        placeholderTextColor="#999"
        onChangeText={onChangeText}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",

    alignItems: "center",

    backgroundColor: "#FFF",

    borderRadius: 12,

    borderWidth: 1,

    borderColor: "#E5E5E5",

    paddingHorizontal: 12,

    height: 50,
  },

  input: {
    flex: 1,

    marginLeft: 10,

    fontSize: 16,

    color: COLORS.text,
  },
});