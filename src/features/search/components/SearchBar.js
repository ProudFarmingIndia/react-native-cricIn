import React from "react";

import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";

import { COLORS } from "../../../constants/colors";

export default function SearchBar({
  value,
  onChangeText,
  onClear,
  placeholder = "Search players, teams, grounds...",
  autoFocus = false,
}) {
  return (
    <View style={styles.container}>
      <Ionicons name="search" size={18} color={COLORS.onSurfaceVariant} style={styles.icon} />

      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.onSurfaceVariant}
        autoFocus={autoFocus}
        returnKeyType="search"
      />

      {!!value && (
        <TouchableOpacity onPress={onClear} style={styles.clearButton}>
          <Ionicons name="close-circle" size={18} color={COLORS.outline} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
  },

  icon: {
    marginRight: 8,
  },

  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.onSurface,
  },

  clearButton: {
    padding: 4,
  },
});